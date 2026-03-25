import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get my clients
router.get('/', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const clients = await prisma.client.findMany({
      where,
      include: { property: { select: { name: true, zone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Register a client for a property
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, dni, phone, email, notes, propertyId } = req.body;
    if (!name || !dni || !phone || !propertyId) {
      return res.status(400).json({ error: 'Nombre, DNI, teléfono y propiedad son obligatorios' });
    }

    // Check for duplicate
    const existing = await prisma.client.findUnique({
      where: { dni_propertyId: { dni, propertyId } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Este cliente ya está registrado para esta propiedad' });
    }

    const client = await prisma.client.create({
      data: { name, dni, phone, email, notes, propertyId, userId: req.user.id },
    });

    // Log activity
    await prisma.activity.create({
      data: { userId: req.user.id, action: 'client_registered', details: `${name} - ${dni}` },
    });

    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar cliente' });
  }
});

// Admin: verify/reject client
router.patch('/:id/verify', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body; // VERIFIED or REJECTED
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: { verifyStatus: status, verifyDate: new Date() },
    });

    // If verified, log unlock
    if (status === 'VERIFIED') {
      await prisma.activity.create({
        data: { userId: client.userId, action: 'property_unlocked', details: `Client ${client.name} verified` },
      });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar' });
  }
});

export default router;
