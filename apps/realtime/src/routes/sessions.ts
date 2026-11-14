import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { GameSessionModel } from '../models/GameSession.js';
import { Quiz } from '../models/Quiz.js';
import { Roster, IRosterStudent } from '../models/Roster.js';
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

    const doc = await GameSessionModel.findOne({ pin }).populate('quizId').populate('rosterId');

    if (!memorySession && !doc) {
      return res.status(404).json({ error: 'Session not found or PIN is invalid' });
    }

    const quizTitle = (doc?.quizId as any)?.title || memorySession?.quiz?.title || 'ALIX Live Session';
    const playerCount = memorySession ? memorySession.players.length : (doc?.participants?.length || 0);
    const status = memorySession ? memorySession.status : (doc?.status || 'waiting');
    const isLocked = doc?.isLocked || false;
    const requireRoster = doc?.requireRoster || false;
    const rosterInfo = doc?.rosterId
      ? {
          courseCode: (doc.rosterId as any).courseCode,
          section: (doc.rosterId as any).section,
        }
      : null;

    return res.json({
      success: true,
      session: {
        pin,
        quizTitle,
        playerCount,
        status,
        isLocked,
        requireRoster,
        roster: rosterInfo,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch session' });
  }
});

// ─── Toggle Session Lock (Anti-Proxy Shield: Close Room to Outsiders) ────────

router.patch('/:pin/lock', async (req: Request, res: Response) => {
  try {
    const pin = req.params.pin?.toUpperCase();
    const { locked } = req.body;

    const session = await GameSessionModel.findOneAndUpdate(
      { pin },
      { isLocked: !!locked },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({
      success: true,
      isLocked: session.isLocked,
      message: session.isLocked ? 'Classroom locked. No new joiners permitted.' : 'Classroom unlocked.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update lock' });
  }
});

// ─── Export Official Attendance & Scores Roster ──────────────────────────────

router.get('/:pin/attendance', async (req: Request, res: Response) => {
  try {
    const pin = req.params.pin?.toUpperCase();
    const session = await GameSessionModel.findOne({ pin })
      .populate('quizId')
      .populate('rosterId');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const participantsMap = new Map<string, any>();
    session.participants.forEach((p: any) => {
      const key = (p.rollNo || p.name).toUpperCase();
      participantsMap.set(key, p);
    });

    let attendanceRecords: any[] = [];
    const rosterDoc = session.rosterId as any;

    if (rosterDoc && Array.isArray(rosterDoc.students) && rosterDoc.students.length > 0) {
      // Cross-reference against official class roster
      attendanceRecords = rosterDoc.students.map((student: IRosterStudent) => {
        const participant = participantsMap.get(student.rollNo.toUpperCase());
        const isPresent = !!participant;

        return {
          rollNo: student.rollNo,
          name: student.name,
          email: student.email,
          section: student.section || rosterDoc.section,
          status: isPresent ? 'PRESENT' : 'ABSENT',
          score: participant ? participant.score : 0,
          joinedAt: participant ? participant.joinedAt : null,
        };
      });
    } else {
      // No roster attached: list all participants who joined
      attendanceRecords = session.participants.map((p: any) => ({
        rollNo: p.rollNo || 'N/A',
        name: p.name,
        email: p.email || 'N/A',
        section: 'N/A',
        status: 'PRESENT',
        score: p.score,
        joinedAt: p.joinedAt,
      }));
    }

    const totalEnrolled = rosterDoc?.students?.length || session.participants.length;
    const totalPresent = session.participants.length;
    const totalAbsent = Math.max(0, totalEnrolled - totalPresent);

    return res.json({
      success: true,
      pin,
      courseCode: rosterDoc?.courseCode || 'Interactive Session',
      section: rosterDoc?.section || 'Default',
      totalEnrolled,
      totalPresent,
      totalAbsent,
      attendance: attendanceRecords,
    });
  } catch (err: any) {
    console.error('[Attendance Export Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to export attendance' });
  }
});

// ─── Create Session via REST ─────────────────────────────────────────────────

router.post('/create', async (req: Request, res: Response) => {
  try {
    const { quizId, teacherId, rosterId, requireRoster } = req.body;

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
        rosterId: mongoose.isValidObjectId(rosterId) ? rosterId : undefined,
        requireRoster: !!requireRoster,
        isLocked: false,
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

// ─── Delete Individual Session ────────────────────────────────────────────────

router.delete('/:pin', async (req: Request, res: Response) => {
  try {
    const pin = req.params.pin?.toUpperCase();
    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    // Delete from MongoDB
    await GameSessionModel.findOneAndDelete({ pin });

    // Clean up in-memory session if active
    const mem = sessionManager.findByCode(pin);
    if (mem) {
      sessionManager.destroySession(mem.id);
    }

    return res.json({ success: true, message: `Session ${pin} deleted successfully` });
  } catch (err: any) {
    console.error('[Delete Session Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete session' });
  }
});

// ─── Batch Delete Sessions (Delete All or Filtered PIN List) ──────────────────

router.post('/delete-batch', async (req: Request, res: Response) => {
  try {
    const { teacherId, pinList, all } = req.body;

    const filter: Record<string, any> = {};
    if (teacherId && mongoose.isValidObjectId(teacherId)) {
      filter.teacherId = teacherId;
    }

    if (Array.isArray(pinList) && pinList.length > 0) {
      const upperPins = pinList.map((p: string) => String(p).toUpperCase());
      filter.pin = { $in: upperPins };
    } else if (!all && !teacherId) {
      return res.status(400).json({ error: 'Specify pins to delete or set all: true' });
    }

    // Clean up matching in-memory active sessions
    const matchingSessions = await GameSessionModel.find(filter);
    matchingSessions.forEach((s) => {
      const mem = sessionManager.findByCode(s.pin);
      if (mem) sessionManager.destroySession(mem.id);
    });

    const deleteResult = await GameSessionModel.deleteMany(filter);

    return res.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      message: `${deleteResult.deletedCount} sessions deleted successfully`,
    });
  } catch (err: any) {
    console.error('[Batch Delete Sessions Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete sessions' });
  }
});

export default router;
