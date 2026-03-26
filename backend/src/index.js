import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import clientRoutes from './routes/clients.js';
import visitRoutes from './routes/visits.js';
import activityRoutes from './routes/activity.js';
import contactRoutes from './routes/contact.js';
import pipelineRoutes from './routes/pipeline.js';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/pipeline', pipelineRoutes);

app.listen(PORT, () => {
  console.log(`InmoCollab API running on port ${PORT}`);
});

export { prisma };
