import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Valid stage transitions (from → allowed destinations)
const STAGE_ORDER = [
  'REGISTRO', 'VERIFICACION', 'VERIFICADO', 'CONTACTO_PROMOTORA',
  'CITA_AGENDADA', 'VISITA_REALIZADA', 'NEGOCIACION', 'RESERVA', 'CERRADO'
];

// Get all pipeline clients with events (admin sees all, agency sees own)
router.get('/', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };

    // Optional stage filter
    if (req.query.stage) {
      where.pipelineStage = req.query.stage;
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        property: { select: { name: true, zone: true, developer: true } },
        user: { select: { name: true, agency: true } },
        pipelineEvents: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { user: { select: { name: true } } },
        },
        visits: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { date: true, time: true, status: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(clients);
  } catch (err) {
    console.error('Pipeline GET error:', err);
    res.status(500).json({ error: 'Error al obtener pipeline' });
  }
});

// Get pipeline summary/counts per stage
router.get('/summary', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const counts = await prisma.client.groupBy({
      by: ['pipelineStage'],
      where,
      _count: { id: true },
    });

    const summary = {};
    for (const s of STAGE_ORDER.concat(['DESCARTADO'])) {
      const found = counts.find(c => c.pipelineStage === s);
      summary[s] = found ? found._count.id : 0;
    }
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

// Get single client pipeline detail with full event history
router.get('/:id', authenticate, async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        property: { select: { name: true, zone: true, developer: true, devPhone: true } },
        user: { select: { name: true, agency: true, email: true } },
        pipelineEvents: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        },
        visits: {
          orderBy: { date: 'desc' },
          select: { id: true, date: true, time: true, status: true, notes: true },
        },
      },
    });

    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Non-admin can only see own clients
    if (req.user.role !== 'ADMIN' && client.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalle' });
  }
});

// Update pipeline stage (admin only for now, or the owning agency)
router.patch('/:id/stage', authenticate, async (req, res) => {
  try {
    const { stage, note } = req.body;
    const validStages = [...STAGE_ORDER, 'DESCARTADO'];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Etapa inválida' });
    }

    const client = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Only admin or owning user can update
    if (req.user.role !== 'ADMIN' && client.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const previousStage = client.pipelineStage;

    // Update client stage
    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data: { pipelineStage: stage },
    });

    // Create pipeline event
    await prisma.pipelineEvent.create({
      data: {
        clientId: client.id,
        userId: req.user.id,
        fromStage: previousStage,
        toStage: stage,
        note: note || null,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        action: 'pipeline_stage_changed',
        details: `${client.name}: ${previousStage} → ${stage}${note ? ' — ' + note : ''}`,
      },
    });

    // Auto-sync verifyStatus when moving to VERIFICADO
    if (stage === 'VERIFICADO' && client.verifyStatus !== 'VERIFIED') {
      await prisma.client.update({
        where: { id: req.params.id },
        data: { verifyStatus: 'VERIFIED', verifyDate: new Date() },
      });
    }

    // Auto-sync when moving to DESCARTADO with REJECTED verify
    if (stage === 'DESCARTADO' && client.verifyStatus === 'PENDING') {
      await prisma.client.update({
        where: { id: req.params.id },
        data: { verifyStatus: 'REJECTED', verifyDate: new Date() },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Pipeline PATCH error:', err);
    res.status(500).json({ error: 'Error al actualizar etapa' });
  }
});

// Add a note/event to a client without changing stage
router.post('/:id/note', authenticate, async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ error: 'Nota requerida' });

    const client = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    if (req.user.role !== 'ADMIN' && client.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const event = await prisma.pipelineEvent.create({
      data: {
        clientId: client.id,
        userId: req.user.id,
        fromStage: client.pipelineStage,
        toStage: client.pipelineStage,
        note,
      },
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Error al añadir nota' });
  }
});

export default router;
