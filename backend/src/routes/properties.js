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

// Auth: get similar properties (same zone, ±20% price, area as secondary)
router.get('/:id/similar', authenticate, async (req, res) => {
  try {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return res.status(404).json({ error: 'No encontrada' });

    const priceLow = Math.round(property.price * 0.8);
    const priceHigh = Math.round(property.price * 1.2);
    const areaLow = Math.round(property.area * 0.7);
    const areaHigh = Math.round(property.area * 1.3);

    // Primary: same zone + similar price. Secondary: area within ±30%
    const similar = await prisma.property.findMany({
      where: {
        id: { not: property.id },
        availUnits: { gt: 0 },
        OR: [
          // Same zone AND similar price (strongest match)
          { zone: property.zone, price: { gte: priceLow, lte: priceHigh } },
          // Same zone, any price (zone match)
          { zone: property.zone },
          // Different zone but similar price AND area (budget+size match)
          { price: { gte: priceLow, lte: priceHigh }, area: { gte: areaLow, lte: areaHigh } },
        ],
      },
      select: {
        id: true, name: true, zone: true, type: true, bedrooms: true,
        bathrooms: true, area: true, price: true, totalUnits: true,
        availUnits: true, pool: true, parking: true, garden: true,
        terrace: true, completion: true, gradient: true,
        hot: true, isNew: true,
      },
      orderBy: { price: 'asc' },
      take: 20,
    });

    // Score and sort: zone match + price proximity + area proximity
    const scored = similar.map(s => {
      let score = 0;
      if (s.zone === property.zone) score += 50;
      const priceDiff = Math.abs(s.price - property.price) / (property.price || 1);
      score += Math.max(0, 30 - priceDiff * 100);
      const areaDiff = Math.abs(s.area - property.area) / (property.area || 1);
      score += Math.max(0, 20 - areaDiff * 100);
      return { ...s, _score: score };
    });

    scored.sort((a, b) => b._score - a._score);

    // Return top 8, strip internal score
    const result = scored.slice(0, 8).map(({ _score, ...rest }) => rest);
    res.json(result);
  } catch (err) {
    console.error('Error similar:', err);
    res.status(500).json({ error: 'Error al buscar similares' });
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
