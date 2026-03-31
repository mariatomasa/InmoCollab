import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin dashboard summary
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const [
      totalProperties,
      totalClients,
      totalVisits,
      totalUsers,
      pendingClients,
      todayVisits,
      pipelineSummary,
      recentActivity,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.client.count(),
      prisma.visit.count(),
      prisma.user.count({ where: { role: 'AGENCY' } }),

      // Pending verifications (needs admin action)
      prisma.client.findMany({
        where: { verifyStatus: 'PENDING' },
        include: {
          property: { select: { name: true, zone: true } },
          user: { select: { name: true, agency: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 20,
      }),

      // Today's visits
      prisma.visit.findMany({
        where: { date: todayStr },
        include: {
          property: { select: { name: true, zone: true } },
          client: { select: { name: true } },
          user: { select: { name: true, agency: true } },
        },
        orderBy: { time: 'asc' },
      }),

      // Pipeline stage counts
      prisma.client.groupBy({
        by: ['pipelineStage'],
        _count: { _all: true },
      }),

      // Recent activity (last 10)
      prisma.activity.findMany({
        include: { user: { select: { name: true, agency: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const pipeline = {};
    pipelineSummary.forEach(s => { pipeline[s.pipelineStage] = s._count._all; });

    res.json({
      stats: { totalProperties, totalClients, totalVisits, totalUsers },
      pendingClients,
      todayVisits,
      pipeline,
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cargar panel' });
  }
});

export default router;
