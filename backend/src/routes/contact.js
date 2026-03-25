import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { agency, person, email, phone, message } = req.body;
    if (!agency || !person || !email || !phone) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const contact = await prisma.contactRequest.create({
      data: { agency, person, email, phone, message },
    });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

export default router;
