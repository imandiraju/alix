import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import Countdown from '../components/game/Countdown';
import Leaderboard from '../components/game/Leaderboard';
import ProjectorQRModal from '../components/common/ProjectorQRModal';
import VictoryPodium from '../components/game/VictoryPodium';
import { getSocket, REALTIME_URL } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  QrCode,
  CheckCircle2,
  Lock,
  Unlock,
  Download,
  ShieldCheck,
  ChevronRight,
  Clock,
  RotateCw,
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  text: string;
  timeLimit: number;
  points: number;
  options: string[];
  correctIndex: number;
}

export const HostPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();

  const [pin, setPin] = useState<string>('842915');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('Interactive Classroom Quiz');
  const [subject, setSubject] = useState('Active Learning');
  const [courseCode, setCourseCode] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-1',
      text: 'In distributed consensus protocols (e.g., Raft), what is the minimum number of nodes required to tolerate 2 node crash failures?',
      timeLimit: 30,
      points: 1000,
      options: ['3 nodes', '5 nodes (2f + 1)', '7 nodes', '4 nodes'],
      correctIndex: 1,
    },
  ]);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [stage, setStage] = useState<'lobby' | 'question' | 'chart' | 'leaderboard' | 'victory'>('lobby');
  const [timer, setTimer] = useState(30);
  const [answersSubmitted, setAnswersSubmitted] = useState(0);
  const [totalLearners, setTotalLearners] = useState(0);
  const [isQRExpanded, setIsQRExpanded] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  // Anti-Proxy Classroom Protection States
  const [isLocked, setIsLocked] = useState(false);
  const [rollingToken, setRollingToken] = useState<string>(
    Math.floor(Date.now() / 15000).toString(36)
  );

  // Rotate dynamic rolling QR token every 15 seconds to invalidate forwarded snapshots
  useEffect(() => {
    const interval = setInterval(() => {
      setRollingToken(Math.floor(Date.now() / 15000).toString(36));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute live join URL with dynamic anti-proxy token
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alix-alp.vercel.app';
  const joinUrl = `${origin}/join?pin=${pin}&t=${rollingToken}`;

  // 1. Fetch real quiz from MongoDB if sessionId is provided
  useEffect(() => {
    if (!sessionId) return;

    const loadQuiz = async () => {
      try {
        const res = await fetch(`${REALTIME_URL}/api/quizzes/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.quiz) {
            setQuizTitle(data.quiz.title);
            setSubject(data.quiz.subject || 'Classroom Module');
            setCourseCode(data.quiz.courseCode || '');
            if (data.quiz.questions && data.quiz.questions.length > 0) {
              setQuestions(data.quiz.questions);
              setTimer(data.quiz.questions[0].timeLimit || 30);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load quiz details:', err);
      }
    };

    loadQuiz();
  }, [sessionId]);

  // 2. Realtime Socket.IO Connection & Live Room Initiation
  useEffect(() => {
    try {
      const socket = getSocket();

      const onConnect = () => {
        setIsRealtimeActive(true);
        socket.emit('create-session', {
          quizId: sessionId || 'default',
          hostId: user?.id || 'host-teacher',
          questions: questions.length > 0 ? questions : undefined,
          quizTitle,
          subject,
          courseCode,
        } as any);
      };

      const onDisconnect = () => setIsRealtimeActive(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      if (socket.connected) onConnect();

      socket.on('session-created', (data: any) => {
        if (data.code) {
          setPin(data.code);
        }
        if (data.sessionId) {
          setActiveSessionId(data.sessionId);
        }
      });

      socket.on('player-joined', (data: any) => {
        if (data.player) {
          setPlayers((prev) => {
            const exists = prev.some((p) => p.id === data.player.id);
            return exists ? prev : [...prev, data.player];
          });
        }
        if (data.playerCount !== undefined) {
          setTotalLearners(data.playerCount);
        }
      });

      socket.on('question-started', (data: any) => {
        if (data.question) {
          setStage('question');
          if (typeof data.questionIndex === 'number') {
            setCurrentQuestionIdx(data.questionIndex);
          }
          if (data.timeLimit) {
            setTimer(data.timeLimit);
          }
        }
      });

      socket.on('timer-tick', (data: any) => {
        if (typeof data.remaining === 'number') {
          setTimer(data.remaining);
        }
      });

      socket.on('leaderboard-update', (data: any) => {
        if (data.questionResults?.totalCount !== undefined) {
          setAnswersSubmitted(data.questionResults.totalCount);
        }
        setStage('chart');
      });

      socket.on('game-ended', () => {
        setStage('victory');
      });

      socket.on('error', (err: any) => {
        console.warn('[ALIX Host Socket Warning]:', err);
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('session-created');
        socket.off('player-joined');
        socket.off('question-started');
        socket.off('timer-tick');
        socket.off('leaderboard-update');
        socket.off('game-ended');
        socket.off('error');
      };
    } catch (err) {
      console.warn('Socket connection error:', err);
    }
  }, [sessionId, user, questions, quizTitle, subject, courseCode]);

  // Timer countdown when stage is 'question'
  useEffect(() => {
    if (stage !== 'question') return;
    if (timer <= 0) {
      setStage('chart');
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, stage]);

  const currentQ = questions[currentQuestionIdx] || questions[0];

  const handleStartSession = () => {
    setStage('question');
    setTimer(currentQ.timeLimit || 30);
    setAnswersSubmitted(0);
    try {
      const socket = getSocket();
      socket.emit('start-game', {
        sessionId: activeSessionId || sessionId,
        code: pin,
        questions,
        quizTitle,
      } as any);
    } catch (err) {
      console.warn('Could not emit start-game:', err);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < questions.length) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setTimer(questions[nextIdx].timeLimit || 30);
      setAnswersSubmitted(0);
      setStage('question');
      try {
        const socket = getSocket();
        socket.emit('next-question', {
          sessionId: activeSessionId || sessionId,
          code: pin,
        } as any);
      } catch (err) {
        console.warn('Could not emit next-question:', err);
      }
    } else {
      setStage('victory');
      try {
        const socket = getSocket();
        socket.emit('end-game', {
          sessionId: activeSessionId || sessionId,
          code: pin,
        } as any);
      } catch (err) {
        console.warn('Could not emit end-game:', err);
      }
    }
  };

  // Anti-Proxy Shield: Close Room Doors to Outsiders
  const handleToggleLock = async () => {
    try {
      const nextLocked = !isLocked;
      const res = await fetch(`${REALTIME_URL}/api/sessions/${pin}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: nextLocked }),
      });
      if (res.ok) {
        setIsLocked(nextLocked);
      }
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    }
  };

  // Export Official Class Attendance to CSV
  const handleExportAttendance = async () => {
    try {
      const res = await fetch(`${REALTIME_URL}/api/sessions/${pin}/attendance`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.attendance) return;

      let csv = 'Roll No,Student Name,Email,Section,Status,Score,Joined At\n';
      data.attendance.forEach((a: any) => {
        csv += `${a.rollNo},"${a.name}",${a.email},${a.section},${a.status},${a.score},"${
          a.joinedAt ? new Date(a.joinedAt).toLocaleTimeString() : 'N/A'
        }"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ALIX_Attendance_${courseCode || pin}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export attendance:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B0A3C] text-white flex flex-col justify-between selection:bg-violet-500 selection:text-white relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Compact projector top bar */}
      <header className="p-2.5 sm:p-4 bg-[#0F0524]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/dashboard" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className="text-lg font-heading font-black text-white">ALIX</span>
            <span className="text-cyan-400 font-heading font-black text-lg">!</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-emerald-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRealtimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>LIVE SESSION</span>
          </div>
        </div>

        {/* Center: PIN display */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white/5 px-3 sm:px-5 py-2 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setIsQRExpanded(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
            title="Expand QR"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[11px]">QR</span>
          </button>

          <div className="text-right">
            <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
              PIN: <span className="text-cyan-400 font-mono">{pin.slice(0, 3)} {pin.slice(3)}</span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Lock Button */}
          <button
            type="button"
            onClick={handleToggleLock}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isLocked
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
            title={isLocked ? 'Room Locked' : 'Lock room'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportAttendance}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Export Attendance"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-sm font-bold text-white">{totalLearners}</span>
          </div>

          {stage === 'lobby' ? (
            <button
              type="button"
              onClick={handleStartSession}
              className="px-5 py-2 rounded-lg bg-[#26890C] hover:bg-[#20740A] border-b-4 border-[#1a5e08] active:border-b-0 active:translate-y-1 font-bold text-sm text-white transition-all duration-100 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Start</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (stage === 'question') setStage('chart');
                else if (stage === 'chart') setStage('leaderboard');
                else if (stage === 'leaderboard') handleNextQuestion();
                else setStage('question');
              }}
              className="px-4 py-2 rounded-lg bg-[#1368CE] hover:bg-[#105AB3] border-b-4 border-[#0d4a99] active:border-b-0 active:translate-y-1 font-bold text-sm text-white transition-all duration-100 flex items-center gap-1.5 cursor-pointer"
            >
              {stage === 'question' && (
                <>
                  <span>Show Answers</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
              {stage === 'chart' && (
                <>
                  <span>Leaderboard</span>
                  <Trophy className="w-4 h-4" />
                </>
              )}
              {stage === 'leaderboard' && (
                <>
                  <span>
                    {currentQuestionIdx + 1 < questions.length ? 'Next Question' : 'Victory Podium!'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
              {stage === 'victory' && (
                <>
                  <span>Back to Library</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Projector Screen */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center z-10">
        {/* Lobby Waiting Screen */}
        {stage === 'lobby' && (
          <div className="text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-3xl sm:text-5xl font-heading font-black text-white">
              {quizTitle}
            </h1>

            <p className="text-white/70 text-sm sm:text-base">
              Join at <span className="text-white font-bold">{origin}/join</span> with PIN{' '}
              <strong className="text-cyan-400 font-mono text-lg">{pin}</strong>
            </p>

            {/* Waiting for players grid */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 min-h-[140px] flex flex-col justify-center items-center">
              {players.length === 0 ? (
                <div className="text-white/50 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Waiting for players...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-xs font-bold animate-scale-in"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleStartSession}
              className="px-8 py-3.5 rounded-xl bg-[#26890C] hover:bg-[#20740A] border-b-4 border-[#1a5e08] active:border-b-0 active:translate-y-1 text-white font-bold text-base shadow-lg transition-all duration-100 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Start ({questions.length} questions)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stage 1: Live Question Presentation */}
        {stage === 'question' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <div className="bg-slate-800/95 rounded-3xl border border-slate-700 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-lg bg-alix-violet-500/20 text-alix-violet-300 border border-alix-violet-500/30 text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Question {currentQuestionIdx + 1} of {questions.length}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-700/60 text-xs font-semibold text-slate-300">
                    {subject}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Submissions</div>
                    <div className="text-base sm:text-lg font-mono font-bold text-alix-cyan-400">
                      {answersSubmitted} / {Math.max(1, totalLearners)}
                    </div>
                  </div>
                  <Countdown secondsRemaining={timer} totalSeconds={currentQ.timeLimit || 30} size="md" />
                </div>
              </div>

              {/* Question Text */}
              <h1 className="text-2xl sm:text-4xl lg:text-4xl font-heading font-extrabold leading-tight text-white mb-2">
                {currentQ.text}
              </h1>
            </div>

            {/* Answer Options Grid (Kahoot 4-quadrant arcade style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {currentQ.options.map((opt, idx) => {
                const themes = [
                  { shape: '▲', bg: 'bg-[#E21B3C]', border: 'border-[#9E1329]' },
                  { shape: '◆', bg: 'bg-[#1368CE]', border: 'border-[#0D4589]' },
                  { shape: '●', bg: 'bg-[#D89E00]', border: 'border-[#8C6700]' },
                  { shape: '■', bg: 'bg-[#26890C]', border: 'border-[#175407]' },
                ];
                const t = themes[idx % themes.length];
                return (
                  <div
                    key={idx}
                    className={`p-5 sm:p-7 rounded-2xl ${t.bg} border-b-6 ${t.border} text-white font-heading font-black text-xl sm:text-2xl flex items-center gap-4 sm:gap-5 shadow-2xl transition-transform active:scale-[0.99]`}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black/20 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner">
                      {t.shape}
                    </div>
                    <span className="flex-1 drop-shadow leading-snug">{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 2: Response Distribution Breakdown */}
        {stage === 'chart' && (
          <div className="bg-[#0F0524]/90 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                  Results
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white mt-1">
                  {currentQ.text}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Correct: {currentQ.options[currentQ.correctIndex]}</span>
                </div>
              </div>
            </div>

            {/* 4 Colorful Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-end min-h-[220px] pt-4">
              {currentQ.options.map((opt, idx) => {
                const themes = [
                  { shape: '▲', bg: 'bg-[#E21B3C]', border: 'border-[#9E1329]' },
                  { shape: '◆', bg: 'bg-[#1368CE]', border: 'border-[#0D4589]' },
                  { shape: '●', bg: 'bg-[#D89E00]', border: 'border-[#8C6700]' },
                  { shape: '■', bg: 'bg-[#26890C]', border: 'border-[#175407]' },
                ];
                const t = themes[idx % themes.length];
                const isCorrect = idx === currentQ.correctIndex;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    {/* Checkmark badge */}
                    {isCorrect ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce mb-1">
                        <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 opacity-0 mb-1" />
                    )}

                    {/* Arcade Option Bar */}
                    <div
                      className={`w-full rounded-2xl ${t.bg} border-b-6 ${t.border} p-4 sm:p-5 text-center text-white font-black shadow-lg transition-all flex flex-col justify-between items-center ${
                        isCorrect ? 'ring-4 ring-white shadow-2xl scale-[1.02]' : 'opacity-60'
                      }`}
                      style={{ minHeight: isCorrect ? '150px' : '100px' }}
                    >
                      <span className="text-3xl sm:text-4xl drop-shadow">{t.shape}</span>
                      <span className="text-xs sm:text-sm font-black line-clamp-2 mt-2 leading-tight drop-shadow">
                        {opt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 3: Live Session Leaderboard */}
        {stage === 'leaderboard' && (
          <div className="max-w-2xl mx-auto w-full animate-fade-in">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-alix-cyan-400">
                Auditorium Standings
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                Live Leaderboard
              </h2>
            </div>

            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 divide-y divide-slate-700/60">
              {players.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Learners will appear here once scores are tabulated.
                </div>
              ) : (
                players.map((p, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        {p.rollNo && (
                          <span className="text-xs text-slate-400 font-mono ml-2">({p.rollNo})</span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-alix-cyan-400">
                      {p.score || 1000} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Stage 4: Victory Podium & Export */}
        {stage === 'victory' && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-scale-in flex flex-col items-center">
            {/* 3D Animated Victory Podium with Confetti */}
            <VictoryPodium
              winners={
                players.length > 0
                  ? [...players]
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .slice(0, 3)
                      .map((p, idx) => ({
                        rank: idx + 1,
                        name: p.name,
                        score: p.score || Math.max(500, 1000 - idx * 150),
                        avatarId: p.avatar || (idx === 0 ? 'fox' : idx === 1 ? 'bot' : 'owl'),
                        streak: 3,
                      }))
                  : [
                      { rank: 1, name: 'Champion', score: 1000, avatarId: 'fox', streak: 4 },
                      { rank: 2, name: 'Runner Up', score: 850, avatarId: 'bot', streak: 2 },
                      { rank: 3, name: '3rd Place', score: 700, avatarId: 'owl', streak: 1 },
                    ]
              }
              onRestart={() => {
                setStage('lobby');
                setCurrentQuestionIdx(0);
                setAnswersSubmitted(0);
              }}
            />

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleExportAttendance}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 text-white font-bold text-sm shadow-lg transition-all duration-100 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Attendance Sheet (CSV)</span>
              </button>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1368CE] hover:bg-[#105AB3] border-b-4 border-[#0D4A99] active:border-b-0 active:translate-y-1 text-white font-bold text-sm shadow-lg transition-all duration-100 cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Projector Fullscreen QR Code Modal */}
      <ProjectorQRModal
        isOpen={isQRExpanded}
        onClose={() => setIsQRExpanded(false)}
        pin={pin}
        joinUrl={joinUrl}
      />
    </div>
  );
};

export default HostPage;
