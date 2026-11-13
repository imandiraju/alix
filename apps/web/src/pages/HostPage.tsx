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
  Share2,
  BookOpen,
  ArrowLeft,
  ChevronRight,
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
  const [answerDistribution, setAnswerDistribution] = useState<number[]>([0, 0, 0, 0]);

  // Compute live join URL (e.g. https://alix-alp.vercel.app/join?pin=842915)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alix-alp.vercel.app';
  const joinUrl = `${origin}/join?pin=${pin}`;

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
        // Request room session creation from server
        socket.emit('create-session', {
          quizId: sessionId || 'default',
          hostId: user?.id || 'host-teacher',
        });
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

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('session-created');
        socket.off('player-joined');
      };
    } catch (err) {
      console.warn('Socket connection error:', err);
    }
  }, [sessionId, user]);

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
      if (activeSessionId) {
        socket.emit('start-game', { sessionId: activeSessionId });
      }
    } catch {
      // quiet
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
        if (activeSessionId) {
          socket.emit('next-question', { sessionId: activeSessionId });
        }
      } catch {
        // quiet
      }
    } else {
      setStage('victory');
      try {
        const socket = getSocket();
        if (activeSessionId) {
          socket.emit('end-game', { sessionId: activeSessionId });
        }
      } catch {
        // quiet
      }
    }
  };

  // Mock responses for live visual chart simulation if needed
  const optCounts = [
    answersSubmitted > 0 ? Math.floor(answersSubmitted * 0.1) : 0,
    answersSubmitted > 0 ? Math.ceil(answersSubmitted * 0.7) : 0,
    answersSubmitted > 0 ? Math.floor(answersSubmitted * 0.1) : 0,
    answersSubmitted > 0 ? Math.floor(answersSubmitted * 0.1) : 0,
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-alix-violet-500 selection:text-white relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-alix-violet-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-alix-cyan-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Projector Branding Bar */}
      <header className="p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <AlixLogo variant="white" size="md" />
          </Link>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-alix-cyan-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isRealtimeActive ? 'Real-Time Engine Online' : 'Connecting Real-Time...'}</span>
          </div>
        </div>

        {/* Center: Interactive Projector QR Button + PIN */}
        <div className="flex items-center gap-2 sm:gap-4 bg-alix-indigo/70 px-3 sm:px-5 py-2 rounded-2xl border border-alix-violet-500/40 shadow-inner">
          <button
            type="button"
            onClick={() => setIsQRExpanded(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer group"
            title="Expand Fullscreen QR Code"
          >
            <QrCode className="w-4 h-4 text-alix-cyan-300 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Projector QR</span>
          </button>

          <div className="h-6 w-px bg-white/20 hidden sm:block" />

          {/* Large PIN digits */}
          <div className="text-right">
            <div className="text-[10px] sm:text-xs text-alix-slate-300 uppercase tracking-widest font-bold">
              Join: <span className="text-alix-cyan-400 font-mono">alix.edu/join</span>
            </div>
            <div className="text-lg sm:text-2xl font-mono font-black tracking-widest text-white">
              {pin.slice(0, 3)} {pin.slice(3)}
            </div>
          </div>
        </div>

        {/* Live Audience Counter & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">
            <Users className="w-4 h-4 text-alix-cyan-400" />
            <span className="font-mono text-sm font-bold text-white">{totalLearners}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Joined</span>
          </div>

          {stage === 'lobby' ? (
            <button
              type="button"
              onClick={handleStartSession}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-sm text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Start Session</span>
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-indigo hover:from-alix-violet-500 hover:to-alix-indigo font-bold text-sm text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
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
                  <span>{currentQuestionIdx + 1 < questions.length ? 'Next Question' : 'Victory Podium!'}</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-alix-violet-500/20 border border-alix-violet-500/30 text-xs font-bold text-alix-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{subject}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white">
              {quizTitle}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base">
              Students, join on your smartphone or laptop by entering PIN{' '}
              <strong className="text-alix-cyan-400 font-mono text-lg">{pin}</strong> at{' '}
              <span className="text-white underline underline-offset-4">{joinUrl}</span>.
            </p>

            {/* Waiting for players grid */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 min-h-[160px] flex flex-col justify-center items-center">
              {players.length === 0 ? (
                <div className="text-slate-400 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Waiting for learners to join room...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-alix-violet-600/30 border border-alix-violet-500/40 text-alix-cyan-300 text-xs font-bold animate-scale-in"
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
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-indigo hover:from-alix-violet-500 hover:to-alix-indigo text-white font-bold text-base shadow-alix-lg hover:shadow-alix-glow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Launch First Question ({questions.length} Total)</span>
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

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white font-heading font-semibold text-lg sm:text-xl flex items-center gap-4 shadow-lg"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${
                      idx === 0
                        ? 'bg-alix-coral-500 text-white'
                        : idx === 1
                        ? 'bg-alix-violet-600 text-white'
                        : idx === 2
                        ? 'bg-alix-cyan-600 text-white'
                        : 'bg-amber-500 text-slate-900'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1">{opt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 2: Response Distribution Breakdown */}
        {stage === 'chart' && (
          <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-6 sm:p-10 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-alix-cyan-400">
                  Concept Check Results
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mt-1">
                  {currentQ.text}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-semibold">Correct Answer</span>
                <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Option {String.fromCharCode(65 + currentQ.correctIndex)}</span>
                </div>
              </div>
            </div>

            {/* Bars for options */}
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isCorrect = idx === currentQ.correctIndex;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-white">{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Correct Option
                        </span>
                      )}
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
                      <span className="font-bold text-white text-sm">{p.name}</span>
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

        {/* Stage 4: Victory Podium */}
        {stage === 'victory' && (
          <div className="text-center max-w-2xl mx-auto space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-2 border border-amber-400/30">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-white">
              Session Concluded!
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Great engagement! Responses and student participation have been logged to your ALIX database.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-500 text-white font-bold text-sm shadow-alix-md transition-all cursor-pointer"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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
