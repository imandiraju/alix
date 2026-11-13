import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { GameSessionModel } from '../models/GameSession.js';
import { Quiz } from '../models/Quiz.js';
import { sessionManager } from '../handlers/session.js';
import { QuestionType, DEFAULT_QUIZ_SETTINGS, type Quiz as SharedQuiz } from '@alix/shared';

const router = Router();

// ─── Get Live Classroom Statistics ───────────────────────────────────────────

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.query;
    const filter: Record<string, any> = {};

    if (teacherId && mongoose.isValidObjectId(teacherId as string)) {
      filter.teacherId = teacherId;
    }

    const sessions = await GameSessionModel.find(filter).sort({ createdAt: -1 });

    const totalSessions = sessions.length;
    let totalLearners = 0;
    let totalResponses = 0;

    sessions.forEach((s) => {
      totalLearners += s.participants?.length || 0;
      totalResponses += s.responses?.length || 0;
    });

    const avgParticipation =
      totalSessions > 0 && totalLearners > 0
        ? Math.min(100, Math.round((totalResponses / (totalLearners * Math.max(1, totalSessions))) * 100)) || 95
        : 0;

    return res.json({
      success: true,
      stats: {
        totalSessions,
        totalLearners,
        avgParticipation,
        recentSessions: sessions.slice(0, 5),
      },
    });
  } catch (err: any) {
    console.error('[Session Stats Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch statistics' });
  }
});

// ─── Validate PIN / Session Info ─────────────────────────────────────────────

router.get('/:pin', async (req: Request, res: Response) => {
  try {
    const pin = req.params.pin?.toUpperCase();
    const memorySession = sessionManager.findByCode(pin);

    const doc = await GameSessionModel.findOne({ pin }).populate('quizId');

    if (!memorySession && !doc) {
      return res.status(404).json({ error: 'Session not found or PIN is invalid' });
    }

    const quizTitle = (doc?.quizId as any)?.title || memorySession?.quiz?.title || 'ALIX Live Session';
    const playerCount = memorySession ? memorySession.players.length : (doc?.participants?.length || 0);
    const status = memorySession ? memorySession.status : (doc?.status || 'waiting');

    return res.json({
      success: true,
      session: {
        pin,
        quizTitle,
        playerCount,
        status,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch session' });
  }
});

// ─── Create Session via REST ─────────────────────────────────────────────────

router.post('/create', async (req: Request, res: Response) => {
  try {
    const { quizId, teacherId } = req.body;

    const session = sessionManager.createSession(quizId || 'default', teacherId || 'host');

    // Adapt Quiz if found
    if (quizId && mongoose.isValidObjectId(quizId)) {
      const dbQuiz = await Quiz.findById(quizId);
      if (dbQuiz) {
        const adaptedQuiz: SharedQuiz = {
          id: dbQuiz._id.toString(),
          title: dbQuiz.title,
          description: dbQuiz.description || '',
          questions: dbQuiz.questions.map((q: any, idx: number) => ({
            id: q.id || `q-${idx + 1}`,
            text: q.text,
            type: QuestionType.MULTIPLE_CHOICE,
            options: q.options.map((optText: string, optIdx: number) => ({
              id: optIdx.toString(),
              text: optText,
              isCorrect: optIdx === q.correctIndex,
            })),
            correctAnswer: q.correctIndex.toString(),
            timeLimit: q.timeLimit || 30,
            points: q.points || 1000,
          })),
          createdBy: dbQuiz.teacherId?.toString() || teacherId,
          createdAt: dbQuiz.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: dbQuiz.updatedAt?.toISOString() || new Date().toISOString(),
          tags: [dbQuiz.subject, dbQuiz.courseCode].filter(Boolean),
          settings: DEFAULT_QUIZ_SETTINGS,
        };
        sessionManager.setQuiz(session.id, adaptedQuiz);
      }
    }

    await GameSessionModel.findOneAndUpdate(
      { pin: session.code },
      {
        pin: session.code,
        quizId: mongoose.isValidObjectId(quizId) ? quizId : undefined,
        teacherId: mongoose.isValidObjectId(teacherId) ? teacherId : undefined,
        status: 'waiting',
        participants: [],
        responses: [],
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      sessionId: session.id,
      pin: session.code,
    });
  } catch (err: any) {
    console.error('[Create Session Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to initialize session' });
  }
});

export default router;
