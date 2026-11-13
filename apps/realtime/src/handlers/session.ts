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

export function registerSessionHandlers(io: IOServer, socket: IOSocket): void {
  // ─── Create Session ───────────────────────────────────────────────────

  socket.on('create-session', async (payload: CreateSessionPayload) => {
    const session = sessionManager.createSession(payload.quizId, payload.hostId);

    socket.join(session.id);
    socket.data.sessionId = session.id;
    socket.data.role = 'host';

    let quizTitle = 'Interactive Classroom Quiz';
    let totalQuestions = 0;

    // Load Quiz from MongoDB if valid ObjectId
    try {
      if (payload.quizId && mongoose.isValidObjectId(payload.quizId)) {
        const dbQuiz = await Quiz.findById(payload.quizId);
        if (dbQuiz) {
          quizTitle = dbQuiz.title;
          totalQuestions = dbQuiz.questions.length;

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
            createdBy: dbQuiz.teacherId?.toString() || payload.hostId,
            createdAt: dbQuiz.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: dbQuiz.updatedAt?.toISOString() || new Date().toISOString(),
            tags: [dbQuiz.subject, dbQuiz.courseCode].filter(Boolean),
            settings: DEFAULT_QUIZ_SETTINGS,
          };

          sessionManager.setQuiz(session.id, adaptedQuiz);
        }
      }
    } catch (err) {
      console.warn('[ALIX Realtime] Could not fetch quiz from DB for session:', err);
    }

    // Persist session to MongoDB GameSessionModel
    try {
      await GameSessionModel.findOneAndUpdate(
        { pin: session.code },
        {
          pin: session.code,
          quizId: mongoose.isValidObjectId(payload.quizId) ? payload.quizId : undefined,
          teacherId: mongoose.isValidObjectId(payload.hostId) ? payload.hostId : undefined,
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
    socket.data.sessionId = session.id;
    socket.data.role = 'player';
    socket.data.playerId = player.id;

    // Record participant in MongoDB
    try {
      await GameSessionModel.findOneAndUpdate(
        { pin: payload.code.toUpperCase() },
        {
          $push: {
            participants: {
              socketId: socket.id,
              name: payload.playerName,
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

    console.log(`[ALIX] Player "${player.name}" joined session ${session.code}`);
  });

  // ─── Start Game ───────────────────────────────────────────────────────

  socket.on('start-game', (payload: StartGamePayload) => {
    const session = sessionManager.getSession(payload.sessionId);

    if (!session || socket.data.role !== 'host') {
      socket.emit('error', { message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    sessionManager.startGame(session.id);

    io.to(session.id).emit('session-status', { status: session.status });

    // Send first question
    sendNextQuestion(io, session.id);

    console.log(`[ALIX] Game started: ${session.code}`);
  });

  // ─── Next Question ────────────────────────────────────────────────────

  socket.on('next-question', (payload: NextQuestionPayload) => {
    if (socket.data.role !== 'host') {
      socket.emit('error', { message: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    sendNextQuestion(io, payload.sessionId);
  });

  // ─── Submit Answer ────────────────────────────────────────────────────

  socket.on('submit-answer', async (payload: SubmitAnswerPayload) => {
    const session = sessionManager.getSession(payload.sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found', code: 'SESSION_NOT_FOUND' });
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
    const session = sessionManager.getSession(payload.sessionId);

    if (!session || socket.data.role !== 'host') {
      socket.emit('error', { message: 'Unauthorized', code: 'UNAUTHORIZED' });
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
  if (!session || !session.quiz) return;

  session.currentQuestionIndex++;

  if (session.currentQuestionIndex >= session.quiz.questions.length) {
    // No more questions — show leaderboard then end
    const leaderboard = sessionManager.getLeaderboard(sessionId);
    io.to(sessionId).emit('game-ended', {
      finalLeaderboard: leaderboard,
      sessionSummary: {
        totalQuestions: session.quiz.questions.length,
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
    });
    return;
  }

  const question = session.quiz.questions[session.currentQuestionIndex];

  // Send question without the correct answer
  io.to(sessionId).emit('question-started', {
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
    totalQuestions: session.quiz.questions.length,
    timeLimit: question.timeLimit,
  });

  // Start countdown timer
  let remaining = question.timeLimit;
  const timerInterval = setInterval(() => {
    remaining--;
    io.to(sessionId).emit('timer-tick', {
      remaining,
      total: question.timeLimit,
    });

    if (remaining <= 0) {
      clearInterval(timerInterval);

      // Send leaderboard update
      const leaderboard = sessionManager.getLeaderboard(sessionId);
      const answers = session.players.flatMap((p) =>
        p.answers.filter((a) => a.questionId === question.id),
      );

      const distribution: Record<string, number> = {};
      for (const opt of question.options) {
        distribution[opt.id] = answers.filter((a) => a.answer === opt.id).length;
      }

      io.to(sessionId).emit('leaderboard-update', {
        leaderboard,
        questionResults: {
          questionId: question.id,
          correctCount: answers.filter((a) => a.correct).length,
          totalCount: answers.length,
          distribution,
        },
      });
    }
  }, 1000);
}
