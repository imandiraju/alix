// ─── Socket.IO Session Handlers ─────────────────────────────────────────────

import type { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  CreateSessionPayload,
  JoinSessionPayload,
  StartGamePayload,
  NextQuestionPayload,
  SubmitAnswerPayload,
  EndGamePayload,
  Quiz as SharedQuiz,
} from '@alix/shared';
import { SessionStatus, QuestionType, DEFAULT_QUIZ_SETTINGS } from '@alix/shared';
import { GameSessionManager } from '../engine/GameSession.js';
import { calculateScore } from '../engine/ScoreCalculator.js';
import { Quiz } from '../models/Quiz.js';
import { GameSessionModel } from '../models/GameSession.js';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export const sessionManager = new GameSessionManager();
const activeTimers = new Map<string, NodeJS.Timeout>();

function adaptQuestionsToSharedQuiz(rawQuestions: any[]): any[] {
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return [];
  return rawQuestions.map((q: any, idx: number) => {
    const rawOpts: any[] = Array.isArray(q.options) ? q.options : [];
    // Filter out trailing blank options (e.g. True/False questions where options 3 & 4 are "")
    const nonBlankOpts = rawOpts.filter((opt: any) => {
      const txt = typeof opt === 'string' ? opt : opt?.text;
      return txt !== undefined && String(txt).trim().length > 0;
    });
    const finalOpts = nonBlankOpts.length >= 2 ? nonBlankOpts : rawOpts;

    return {
      id: q.id || `q-${idx + 1}`,
      text: q.text || `Question ${idx + 1}`,
      type: QuestionType.MULTIPLE_CHOICE,
      options: finalOpts.map((opt: any, optIdx: number) => {
        const label = typeof opt === 'string' ? opt : (opt?.text || `Option ${optIdx + 1}`);
        return {
          id: optIdx.toString(),
          text: label,
          isCorrect: optIdx === (q.correctIndex ?? 0),
        };
      }),
      correctAnswer: (q.correctIndex ?? 0).toString(),
      timeLimit: Number(q.timeLimit) || 30,
      points: Number(q.points) || 1000,
    };
  });
}

export function registerSessionHandlers(io: IOServer, socket: IOSocket): void {
  // ─── Create Session ───────────────────────────────────────────────────

  socket.on('create-session', async (payload: CreateSessionPayload) => {
    const session = sessionManager.createSession(payload.quizId, payload.hostId);
    session.hostSocketId = socket.id;

    // Join both session UUID and 6-digit PIN room for universal message delivery
    socket.join(session.id);
    socket.join(session.code);
    socket.data.sessionId = session.id;
    socket.data.role = 'host';

    let quizTitle = (payload as any).quizTitle || 'Interactive Classroom Quiz';
    let totalQuestions = 0;
    let attachedRosterId = (payload as any).rosterId;

    // 1. If payload contains direct questions from host state, adapt immediately
    const rawPayloadQuestions = (payload as any).questions;
    if (Array.isArray(rawPayloadQuestions) && rawPayloadQuestions.length > 0) {
      const adapted = adaptQuestionsToSharedQuiz(rawPayloadQuestions);
      if (adapted.length > 0) {
        sessionManager.setQuiz(session.id, {
          id: session.quizId,
          title: quizTitle,
          description: '',
          questions: adapted,
          createdBy: payload.hostId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [(payload as any).subject, (payload as any).courseCode].filter(Boolean),
          settings: DEFAULT_QUIZ_SETTINGS,
        });
        totalQuestions = adapted.length;
      }
    }

    // 2. Also query Quiz from MongoDB to enrich or ensure complete persistence
    try {
      if (payload.quizId && mongoose.isValidObjectId(payload.quizId)) {
        const dbQuiz = await Quiz.findById(payload.quizId);
        if (dbQuiz) {
          quizTitle = dbQuiz.title;
          if (!attachedRosterId && dbQuiz.rosterId) {
            attachedRosterId = dbQuiz.rosterId;
          }

          const adapted = adaptQuestionsToSharedQuiz(dbQuiz.questions);
          if (adapted.length > 0) {
            totalQuestions = adapted.length;
            sessionManager.setQuiz(session.id, {
              id: dbQuiz._id.toString(),
              title: dbQuiz.title,
              description: dbQuiz.description || '',
              questions: adapted,
              createdBy: dbQuiz.teacherId?.toString() || payload.hostId,
              createdAt: dbQuiz.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt: dbQuiz.updatedAt?.toISOString() || new Date().toISOString(),
              tags: [dbQuiz.subject, dbQuiz.courseCode].filter(Boolean),
              settings: DEFAULT_QUIZ_SETTINGS,
            });
          }
        }
      }
    } catch (err) {
      console.warn('[ALIX Realtime] Could not fetch quiz from DB for session:', err);
    }

    // 3. Fallback: if session still has no questions, ensure a default active learning question
    const currentQuiz = sessionManager.getSession(session.id)?.quiz;
    if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
      const defaultQuestions = adaptQuestionsToSharedQuiz([
        {
          id: 'q-default-1',
          text: 'Welcome to ALIX Live! Which principle is most essential for real-time collaborative learning?',
          timeLimit: 30,
          points: 1000,
          options: ['Immediate active feedback', 'Passive observation', 'Rote memorization', 'Delayed scoring'],
          correctIndex: 0,
        },
      ]);
      sessionManager.setQuiz(session.id, {
        id: 'default-quiz',
        title: quizTitle,
        description: '',
        questions: defaultQuestions,
        createdBy: payload.hostId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['Active Learning'],
        settings: DEFAULT_QUIZ_SETTINGS,
      });
      totalQuestions = defaultQuestions.length;
    }

    // Persist session to MongoDB GameSessionModel
    try {
      await GameSessionModel.findOneAndUpdate(
        { pin: session.code },
        {
          pin: session.code,
          quizId: mongoose.isValidObjectId(payload.quizId) ? payload.quizId : undefined,
          teacherId: mongoose.isValidObjectId(payload.hostId) ? payload.hostId : undefined,
          rosterId: mongoose.isValidObjectId(attachedRosterId) ? attachedRosterId : undefined,
          requireRoster: !!attachedRosterId,
          isLocked: false,
          status: 'waiting',
          participants: [],
          responses: [],
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[ALIX Realtime] Could not persist session doc:', err);
    }

    socket.emit('session-created', {
      sessionId: session.id,
      code: session.code,
    });

    console.log(`[ALIX] Session created: ${session.code} (${session.id}) for quiz "${quizTitle}" (${totalQuestions} Qs)`);
  });

  // ─── Join Session ─────────────────────────────────────────────────────

  socket.on('join-session', async (payload: JoinSessionPayload) => {
    const session = sessionManager.findByCode(payload.code);

    if (!session) {
      socket.emit('error', { message: 'Session not found', code: 'SESSION_NOT_FOUND' });
      return;
    }

    const sessionPin = payload.code.toUpperCase();
    const rollNo = (payload as any).rollNo ? String((payload as any).rollNo).trim().toUpperCase() : '';

    // Anti-Proxy validation against MongoDB session document
    try {
      const sessionDoc = await GameSessionModel.findOne({ pin: sessionPin });
      if (sessionDoc?.isLocked) {
        socket.emit('error', {
          message: 'The instructor has locked this session. No new joiners are permitted.',
          code: 'SESSION_LOCKED',
        });
        return;
      }

      if (sessionDoc?.requireRoster && sessionDoc?.rosterId) {
        if (!rollNo) {
          socket.emit('error', {
            message: 'An institutional Roll Number is required to join this course section.',
            code: 'ROLL_NO_REQUIRED',
          });
          return;
        }

        // Prevent duplicate login on second device
        const alreadyInSession = sessionDoc.participants.some(
          (p: any) => p.rollNo?.toUpperCase() === rollNo
        );
        if (alreadyInSession) {
          socket.emit('error', {
            message: `Roll Number ${rollNo} is already taking this quiz on another device.`,
            code: 'DUPLICATE_ROLL_NO',
          });
          return;
        }
      }
    } catch (err) {
      console.warn('[ALIX Realtime] Anti-proxy verification check failed:', err);
    }

    if (session.status !== SessionStatus.WAITING && !session.settings.allowLateJoin) {
      socket.emit('error', { message: 'Session already in progress', code: 'SESSION_STARTED' });
      return;
    }

    if (session.players.length >= session.settings.maxPlayers) {
      socket.emit('error', { message: 'Session is full', code: 'SESSION_FULL' });
      return;
    }

    const player = sessionManager.addPlayer(session.id, socket.id, payload.playerName);

    if (!player) {
      socket.emit('error', { message: 'Could not join session', code: 'JOIN_FAILED' });
      return;
    }

    socket.join(session.id);
    socket.join(session.code);
    socket.data.sessionId = session.id;
    socket.data.role = 'player';
    socket.data.playerId = player.id;

    // Record participant with rollNo in MongoDB
    try {
      await GameSessionModel.findOneAndUpdate(
        { pin: sessionPin },
        {
          $push: {
            participants: {
              socketId: socket.id,
              name: payload.playerName,
              rollNo: rollNo || undefined,
              avatarId: (payload as any).avatarId || 'fox',
              score: 0,
              streak: 0,
              joinedAt: new Date(),
            },
          },
        }
      );
    } catch (err) {
      console.warn('[ALIX Realtime] Could not save participant to DB:', err);
    }

    io.to(session.id).emit('player-joined', {
      player,
      playerCount: session.players.length,
    });
    io.to(session.code).emit('player-joined', {
      player,
      playerCount: session.players.length,
    });

    // If game is already actively streaming questions, deliver current question to this late joiner
    if (session.status === SessionStatus.PLAYING && session.currentQuestionIndex >= 0 && session.quiz) {
      const activeQ = session.quiz.questions[session.currentQuestionIndex];
      if (activeQ) {
        socket.emit('question-started', {
          question: {
            id: activeQ.id,
            text: activeQ.text,
            type: activeQ.type,
            options: activeQ.options,
            timeLimit: activeQ.timeLimit,
            points: activeQ.points,
            explanation: activeQ.explanation,
          },
          questionIndex: session.currentQuestionIndex,
          totalQuestions: session.quiz.questions.length,
          timeLimit: activeQ.timeLimit,
        });
      }
    }

    console.log(`[ALIX] Player "${player.name}" (${rollNo || 'Guest'}) joined session ${session.code}`);
  });

  // ─── Start Game ───────────────────────────────────────────────────────

  socket.on('start-game', (payload: StartGamePayload) => {
    const sessionIdOrCode = payload.sessionId || (payload as any).code;
    const session =
      sessionManager.getSession(sessionIdOrCode) ||
      sessionManager.findByCode(sessionIdOrCode);

    if (!session) {
      socket.emit('error', { message: 'Session not found for launch', code: 'SESSION_NOT_FOUND' });
      return;
    }

    // Re-bind host authorization
    session.hostSocketId = socket.id;
    socket.data.sessionId = session.id;
    socket.data.role = 'host';

    // If payload contains questions and session.quiz is currently empty, load them
    const incomingQuestions = (payload as any).questions;
    if (
      (!session.quiz || !session.quiz.questions || session.quiz.questions.length === 0) &&
      Array.isArray(incomingQuestions) &&
      incomingQuestions.length > 0
    ) {
      const adapted = adaptQuestionsToSharedQuiz(incomingQuestions);
      sessionManager.setQuiz(session.id, {
        id: session.quizId || 'session-quiz',
        title: (payload as any).quizTitle || 'Interactive Classroom Quiz',
        description: '',
        questions: adapted,
        createdBy: session.hostId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['Active Learning'],
        settings: DEFAULT_QUIZ_SETTINGS,
      });
    }

    sessionManager.startGame(session.id);

    io.to(session.id).emit('session-status', { status: session.status });
    io.to(session.code).emit('session-status', { status: session.status });

    // Send first question
    sendNextQuestion(io, session.id);

    console.log(`[ALIX] Game started: PIN ${session.code} (${session.id}) with ${session.quiz?.questions?.length || 0} Qs`);
  });

  // ─── Next Question ────────────────────────────────────────────────────

  socket.on('next-question', (payload: NextQuestionPayload) => {
    const sessionIdOrCode = payload.sessionId || (payload as any).code;
    const session =
      sessionManager.getSession(sessionIdOrCode) ||
      sessionManager.findByCode(sessionIdOrCode);

    if (!session) return;
    session.hostSocketId = socket.id;
    socket.data.sessionId = session.id;
    socket.data.role = 'host';
    sendNextQuestion(io, session.id);
  });

  // ─── Submit Answer ────────────────────────────────────────────────────

  socket.on('submit-answer', async (payload: SubmitAnswerPayload) => {
    const session =
      sessionManager.getSession(payload.sessionId) ||
      sessionManager.findByCode(payload.sessionId) ||
      (socket.data.sessionId ? sessionManager.getSession(socket.data.sessionId) : undefined);

    if (!session) {
      socket.emit('error', { message: 'Session not found for answer submission', code: 'SESSION_NOT_FOUND' });
      return;
    }

    const currentQuestion = session.quiz?.questions[session.currentQuestionIndex];
    if (!currentQuestion) return;

    const correct = payload.answer === currentQuestion.correctAnswer;
    const streak = correct
      ? (sessionManager.getPlayerStreak(session.id, socket.id) + 1)
      : 0;

    const points = calculateScore(
      correct,
      payload.timeMs,
      currentQuestion.timeLimit * 1000,
      streak,
    );

    sessionManager.recordAnswer(session.id, socket.id, {
      questionId: payload.questionId,
      answer: payload.answer,
      timeMs: payload.timeMs,
      correct,
      points,
    });

    const player = session.players.find((p) => p.id === socket.id);

    try {
      await GameSessionModel.findOneAndUpdate(
        { pin: session.code },
        {
          $push: {
            responses: {
              questionId: payload.questionId,
              playerName: player?.name || 'Anonymous',
              answer: payload.answer,
              isCorrect: correct,
              timeMs: payload.timeMs,
              pointsAwarded: points,
              submittedAt: new Date(),
            },
          },
        }
      );
    } catch (err) {
      // quiet
    }

    socket.emit('answer-result', {
      correct,
      points,
      streak,
      totalScore: player?.score ?? 0,
      correctAnswer: currentQuestion.correctAnswer,
    });
  });

  // ─── End Game ─────────────────────────────────────────────────────────

  socket.on('end-game', async (payload: EndGamePayload) => {
    const session =
      sessionManager.getSession(payload.sessionId) ||
      sessionManager.findByCode(payload.sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found for conclusion', code: 'SESSION_NOT_FOUND' });
      return;
    }

    sessionManager.endGame(session.id);

    try {
      await GameSessionModel.findOneAndUpdate(
        { pin: session.code },
        { status: 'completed' }
      );
    } catch (err) {
      // quiet
    }

    const leaderboard = sessionManager.getLeaderboard(session.id);
    const players = session.players;

    io.to(session.id).emit('game-ended', {
      finalLeaderboard: leaderboard,
      sessionSummary: {
        totalQuestions: session.quiz?.questions.length ?? 0,
        totalPlayers: players.length,
        averageScore:
          players.length > 0
            ? Math.round(players.reduce((sum, p) => sum + p.score, 0) / players.length)
            : 0,
        highestScore: players.length > 0 ? Math.max(...players.map((p) => p.score)) : 0,
        completionRate: 1,
      },
    });

    console.log(`[ALIX] Game ended: ${session.code}`);
  });

  // ─── Handle Disconnect ───────────────────────────────────────────────

  socket.on('disconnect', () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    const session = sessionManager.getSession(sessionId);
    if (!session) return;

    const player = session.players.find((p) => p.id === socket.id);
    if (player) {
      player.isConnected = false;
      io.to(sessionId).emit('player-disconnected', {
        playerId: player.id,
        playerName: player.name,
        playerCount: session.players.filter((p) => p.isConnected).length,
      });
    }
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sendNextQuestion(io: IOServer, sessionId: string): void {
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  // Clear any existing timer for this session
  const prevTimer = activeTimers.get(sessionId);
  if (prevTimer) {
    clearInterval(prevTimer);
    activeTimers.delete(sessionId);
  }

  // Ensure session has a valid quiz
  if (!session.quiz || !session.quiz.questions || session.quiz.questions.length === 0) {
    const fallbackQuestions = adaptQuestionsToSharedQuiz([
      {
        id: 'q-live-1',
        text: 'Classroom live session in progress. Which option represents active participatory learning?',
        timeLimit: 30,
        points: 1000,
        options: ['Immediate student response & engagement', 'Passive listening only', 'No feedback loop', 'Delayed paper grading'],
        correctIndex: 0,
      },
    ]);
    sessionManager.setQuiz(session.id, {
      id: 'fallback-quiz',
      title: 'Classroom Activity',
      description: '',
      questions: fallbackQuestions,
      createdBy: session.hostId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Live'],
      settings: DEFAULT_QUIZ_SETTINGS,
    });
  }

  session.currentQuestionIndex++;
  const activeQuiz = session.quiz;
  if (!activeQuiz || !activeQuiz.questions || activeQuiz.questions.length === 0) return;

  if (session.currentQuestionIndex >= activeQuiz.questions.length) {
    // No more questions — show leaderboard then end
    const leaderboard = sessionManager.getLeaderboard(sessionId);
    const endPayload = {
      finalLeaderboard: leaderboard,
      sessionSummary: {
        totalQuestions: activeQuiz.questions.length,
        totalPlayers: session.players.length,
        averageScore:
          session.players.length > 0
            ? Math.round(
                session.players.reduce((sum, p) => sum + p.score, 0) / session.players.length,
              )
            : 0,
        highestScore:
          session.players.length > 0 ? Math.max(...session.players.map((p) => p.score)) : 0,
        completionRate: 1,
      },
    };
    io.to(session.id).emit('game-ended', endPayload);
    io.to(session.code).emit('game-ended', endPayload);
    return;
  }

  const question = activeQuiz.questions[session.currentQuestionIndex];

  const questionPayload = {
    question: {
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options,
      timeLimit: question.timeLimit,
      points: question.points,
      explanation: question.explanation,
    },
    questionIndex: session.currentQuestionIndex,
    totalQuestions: activeQuiz.questions.length,
    timeLimit: question.timeLimit,
  };

  console.log(`[ALIX] Broadcasting question ${session.currentQuestionIndex + 1}/${activeQuiz.questions.length} ("${question.text}") to room PIN ${session.code}`);

  // Broadcast to both session UUID and session PIN rooms
  io.to(session.id).emit('question-started', questionPayload);
  io.to(session.code).emit('question-started', questionPayload);
  if (session.hostSocketId) {
    io.to(session.hostSocketId).emit('question-started', questionPayload);
  }

  // Start countdown timer
  let remaining = question.timeLimit;
  const timerInterval = setInterval(() => {
    remaining--;
    io.to(session.id).emit('timer-tick', { remaining, total: question.timeLimit });
    io.to(session.code).emit('timer-tick', { remaining, total: question.timeLimit });

    if (remaining <= 0) {
      clearInterval(timerInterval);
      activeTimers.delete(sessionId);

      // Send leaderboard update
      const leaderboard = sessionManager.getLeaderboard(sessionId);
      const answers = session.players.flatMap((p) =>
        p.answers.filter((a) => a.questionId === question.id),
      );

      const distribution: Record<string, number> = {};
      for (const opt of question.options) {
        distribution[opt.id] = answers.filter((a) => a.answer === opt.id).length;
      }

      const updatePayload = {
        leaderboard,
        questionResults: {
          questionId: question.id,
          correctCount: answers.filter((a) => a.correct).length,
          totalCount: answers.length,
          distribution,
        },
      };

      io.to(session.id).emit('leaderboard-update', updatePayload);
      io.to(session.code).emit('leaderboard-update', updatePayload);
    }
  }, 1000);

  activeTimers.set(sessionId, timerInterval);
}
