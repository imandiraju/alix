import { Router, Request, Response } from 'express';
import { Quiz } from '../models/Quiz.js';
import mongoose from 'mongoose';

const router = Router();

// ─── List Quizzes ─────────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  try {
    const { teacherId, subject } = req.query;
    const filter: Record<string, any> = {};

    if (teacherId && mongoose.isValidObjectId(teacherId as string)) {
      filter.teacherId = teacherId;
    }
    if (subject) {
      filter.subject = new RegExp(subject as string, 'i');
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, count: quizzes.length, quizzes });
  } catch (err: any) {
    console.error('[Quiz List Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch quizzes' });
  }
});

// ─── Create Quiz ──────────────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  try {
    const { teacherId, title, subject, courseCode, description, questions } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required.' });
    }

    const quiz = new Quiz({
      teacherId: teacherId || new mongoose.Types.ObjectId(),
      title: title.trim(),
      subject: subject.trim(),
      courseCode: courseCode?.trim() || '',
      description: description?.trim() || '',
      questions: Array.isArray(questions) ? questions : [],
      isPublished: true,
    });

    await quiz.save();
    return res.status(201).json({ success: true, quiz });
  } catch (err: any) {
    console.error('[Quiz Create Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to save quiz' });
  }
});

// ─── Get Quiz By ID ───────────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid quiz identifier' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    return res.json({ success: true, quiz });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load quiz' });
  }
});

// ─── Delete Quiz ──────────────────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid quiz identifier' });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete quiz' });
  }
});

export default router;
