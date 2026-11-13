import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Teacher } from '../models/Teacher.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'alix-edtech-secret-jwt-key-2026';

// ─── Register Teacher ─────────────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, institution, department, subjects } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await Teacher.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An educator account already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const teacher = new Teacher({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      institution: institution?.trim() || 'University Faculty',
      department: department?.trim() || 'Academic Department',
      subjects: Array.isArray(subjects) ? subjects : subjects ? [subjects] : [],
      role: 'teacher',
    });

    await teacher.save();

    const token = jwt.sign(
      { id: teacher._id, email: teacher.email, role: teacher.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        institution: teacher.institution,
        department: teacher.department,
        subjects: teacher.subjects,
        role: teacher.role,
        avatarInitials: teacher.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
    });
  } catch (err: any) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// ─── Login Teacher ────────────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const teacher = await Teacher.findOne({ email: email.toLowerCase().trim() });
    if (!teacher) {
      return res.status(401).json({ error: 'No account found with this email. Please register.' });
    }

    const isMatch = await bcrypt.compare(password, teacher.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect academic credentials.' });
    }

    const token = jwt.sign(
      { id: teacher._id, email: teacher.email, role: teacher.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        institution: teacher.institution,
        department: teacher.department,
        subjects: teacher.subjects,
        role: teacher.role,
        avatarInitials: teacher.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// ─── Get Current Profile ──────────────────────────────────────────────────────

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const teacher = await Teacher.findById(decoded.id).select('-passwordHash');
    if (!teacher) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        institution: teacher.institution,
        department: teacher.department,
        subjects: teacher.subjects,
        role: teacher.role,
        avatarInitials: teacher.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
    });
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
});

export default router;
