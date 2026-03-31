import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  emailAdminNewClient,
  emailAgencyClientVerified,
  emailAgencyClientRejected,
} from '../services/email.js';

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

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { name: true, zone: true },
    });

    const client = await prisma.client.create({
      data: { name, dni, phone, email, notes, propertyId, userId: req.user.id },
    });

    // Log activity
    await prisma.activity.create({
      data: { userId: req.user.id, action: 'client_registered', details: `${name} - ${dni}` },
    });

    // Email admin about new verification request
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      emailAdminNewClient({
        adminEmail,
        clientName: name,
        clientDni: dni,
        clientPhone: phone,
        propertyName: property?.name || propertyId,
        propertyZone: property?.zone || '',
        agencyName: req.user.agency || req.user.name,
        agentName: req.user.name,
      }).catch(err => console.error('[Email] Admin notify failed:', err.message));
    }

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

    // Fetch client with user and property for emails
    const clientBefore = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, agency: true } },
        property: { select: { name: true, zone: true } },
      },
    });

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: { verifyStatus: status, verifyDate: new Date() },
    });

    // Log activity
    if (status === 'VERIFIED') {
      await prisma.activity.create({
        data: { userId: clientBefore.userId, action: 'property_unlocked', details: `Client ${clientBefore.name} verified` },
      });
    }

    // Email the agency
    if (clientBefore?.user?.email) {
      const emailFn = status === 'VERIFIED' ? emailAgencyClientVerified : emailAgencyClientRejected;
      emailFn({
        agencyEmail: clientBefore.user.email,
        clientName: clientBefore.name,
        propertyName: clientBefore.property?.name || '',
        agentName: clientBefore.user.name,
      }).catch(err => console.error('[Email] Agency notify failed:', err.message));
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar' });
  }
});

export default router;
