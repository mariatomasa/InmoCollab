import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, agency, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password y nombre son obligatorios' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, agency, phone },
    });
    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, agency: user.agency, role: user.role, level: user.level, legalSigned: user.legalSigned },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, agency: user.agency, role: user.role, level: user.level, legalSigned: user.legalSigned },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, agency: true, role: true, level: true, legalSigned: true, legalDate: true, phone: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

router.post('/sign-legal', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { legalSigned: true, legalDate: new Date() },
    });
    res.json({ legalSigned: true, legalDate: user.legalDate });
  } catch (err) {
    res.status(500).json({ error: 'Error al firmar' });
  }
});

export default router;
