// ─── ALIX Realtime Server ────────────────────────────────────────────────────

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import type { ClientToServerEvents, ServerToClientEvents } from '@alix/shared';
import { registerSessionHandlers } from './handlers/session.js';
import { connectDatabase } from './db.js';
import authRouter from './routes/auth.js';
import quizRouter from './routes/quizzes.js';

dotenv.config();

const PORT = Number(process.env.PORT || process.env.ALIX_PORT_REALTIME || 3001);

const app = express();
const httpServer = createServer(app);

// ─── Database ───────────────────────────────────────────────────────────────

connectDatabase();

// ─── CORS & Body Parsers ────────────────────────────────────────────────────

app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());

// ─── REST API Routes ────────────────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/quizzes', quizRouter);

// ─── Socket.IO ──────────────────────────────────────────────────────────────

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Health Check ───────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'alix-realtime',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'ALIX Realtime Server',
    version: '0.1.0',
    description: 'Active Learning & Interactive Experience — Realtime Engine',
  });
});

// ─── Socket Connections ─────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[ALIX] Client connected: ${socket.id}`);

  registerSessionHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`[ALIX] Client disconnected: ${socket.id} (${reason})`);
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║                                              ║');
  console.log('  ║   🎓  ALIX Realtime Server                  ║');
  console.log('  ║   Active Learning & Interactive Experience   ║');
  console.log('  ║                                              ║');
  console.log(`  ║   🚀  Running on port ${PORT}                  ║`);
  console.log('  ║                                              ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});

export { io, app };
