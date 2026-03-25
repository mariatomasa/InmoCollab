import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const visits = await prisma.visit.findMany({
      where,
      include: {
        property: { select: { name: true, zone: true } },
        client: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { propertyId, clientId, date, time, notes } = req.body;
    if (!propertyId || !clientId || !date || !time) {
      return res.status(400).json({ error: 'Propiedad, cliente, fecha y hora obligatorios' });
    }
    const visit = await prisma.visit.create({
      data: { propertyId, clientId, date, time, notes, userId: req.user.id },
    });
    await prisma.activity.create({
      data: { userId: req.user.id, action: 'visit_requested', details: `${date} ${time}` },
    });
    res.status(201).json(visit);
  } catch (err) {
    res.status(500).json({ error: 'Error al solicitar visita' });
  }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const visit = await prisma.visit.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

export default router;
