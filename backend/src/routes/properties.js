import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: list properties (blind - no address/developer)
router.get('/', async (req, res) => {
  try {
    const { zone, type, search } = req.query;
    const where = {};
    if (zone) where.zone = zone;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { zone: { contains: search, mode: 'insensitive' } },
      ];
    }
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true, name: true, zone: true, type: true, bedrooms: true,
        bathrooms: true, area: true, price: true, totalUnits: true,
        availUnits: true, pool: true, parking: true, garden: true,
        terrace: true, completion: true, descEs: true, descEn: true,
        featuresEs: true, featuresEn: true, gradient: true,
        soldWeek: true, viewsToday: true, hot: true, isNew: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener propiedades' });
  }
});

// Auth: get property detail (includes address/developer if user has unlocked it)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
    });
    if (!property) return res.status(404).json({ error: 'No encontrada' });

    // Check if user has a verified client for this property
    const client = await prisma.client.findFirst({
      where: { userId: req.user.id, propertyId: property.id, verifyStatus: 'VERIFIED' },
    });
    const isUnlocked = !!client || req.user.role === 'ADMIN';

    const result = { ...property };
    if (!isUnlocked) {
      result.address = null;
      result.developer = null;
      result.devPhone = null;
    }
    res.json({ ...result, isUnlocked });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// Get available zones and types for filters
router.get('/meta/filters', async (_, res) => {
  try {
    const zones = await prisma.property.findMany({ select: { zone: true }, distinct: ['zone'] });
    const types = await prisma.property.findMany({ select: { type: true }, distinct: ['type'] });
    res.json({
      zones: zones.map(z => z.zone),
      types: types.map(t => t.type),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// Admin: create property
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const property = await prisma.property.create({ data: req.body });
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear propiedad' });
  }
});

// Admin: update property
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

export default router;
