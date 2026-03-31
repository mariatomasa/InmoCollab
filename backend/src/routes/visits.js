import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { emailAgencyVisitConfirmed, emailAdminNewVisit } from '../services/email.js';

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

    const [property, client] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId }, select: { name: true } }),
      prisma.client.findUnique({ where: { id: clientId }, select: { name: true } }),
    ]);

    const visit = await prisma.visit.create({
      data: { propertyId, clientId, date, time, notes, userId: req.user.id },
    });

    await prisma.activity.create({
      data: { userId: req.user.id, action: 'visit_requested', details: `${date} ${time}` },
    });

    // Email admin about new visit request
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      emailAdminNewVisit({
        adminEmail,
        agentName: req.user.name,
        agencyName: req.user.agency || req.user.name,
        clientName: client?.name || '',
        propertyName: property?.name || '',
        visitDate: date,
        visitTime: time,
        notes,
      }).catch(err => console.error('[Email] Admin visit notify failed:', err.message));
    }

    res.status(201).json(visit);
  } catch (err) {
    res.status(500).json({ error: 'Error al solicitar visita' });
  }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    // Fetch visit details for email
    const visitBefore = await prisma.visit.findUnique({
      where: { id: req.params.id },
      include: {
        property: { select: { name: true } },
        client: { select: { name: true } },
        user: { select: { name: true, email: true, agency: true } },
      },
    });

    const visit = await prisma.visit.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Email agency when visit is confirmed
    if (status === 'CONFIRMED' && visitBefore?.user?.email) {
      emailAgencyVisitConfirmed({
        agencyEmail: visitBefore.user.email,
        agentName: visitBefore.user.name,
        clientName: visitBefore.client?.name || '',
        propertyName: visitBefore.property?.name || '',
        visitDate: visitBefore.date,
        visitTime: visitBefore.time,
        notes: visitBefore.notes,
      }).catch(err => console.error('[Email] Visit confirm failed:', err.message));
    }

    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

export default router;
