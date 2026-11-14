import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import Countdown from '../components/game/Countdown';
import Leaderboard from '../components/game/Leaderboard';
import ProjectorQRModal from '../components/common/ProjectorQRModal';
import VictoryPodium from '../components/game/VictoryPodium';
import { RenderAvatarSvg } from '../components/game/AlixSvgAvatars';
import { getSocket, REALTIME_URL } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  QrCode,
  CheckCircle2,
  BarChart3,
  Lock,
  Unlock,
  Download,
  ShieldCheck,
  ChevronRight,
  Clock,
  RotateCw,
  Radio,
  Lightbulb,
  Brain,
  Share2,
  Send,
  MessageSquare,
  SlidersHorizontal,
  X,
  LogOut,
  Crown,
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
  const navigate = useNavigate();
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
  const [questionDistribution, setQuestionDistribution] = useState<Record<string, number>>({});
  const [isQRExpanded, setIsQRExpanded] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);

  // Team Mode State
  const [gameMode, setGameMode] = useState<'classic' | 'team'>('classic');
  const [teamCount, setTeamCount] = useState<number>(4);
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState<number>(0); // 0 = unlimited
  const [teamLeaderboard, setTeamLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<'teams' | 'individuals'>('teams');

  // Active Learning & AI Pedagogical Insights
  const [showAiConcept, setShowAiConcept] = useState<boolean>(false);
  const [isConceptPushed, setIsConceptPushed] = useState<boolean>(false);
  const [isPeerInstructionActive, setIsPeerInstructionActive] = useState<boolean>(false);
  const [peerTimer, setPeerTimer] = useState<number>(45);

  const ALL_SQUADS = [
    { id: 'team-red', name: 'Red Dragons', color: '#E21B3C', icon: '🐉', border: 'border-[#E21B3C]', bg: 'bg-[#E21B3C]/15', badge: 'bg-[#E21B3C] text-white', text: 'text-[#E21B3C]' },
    { id: 'team-blue', name: 'Blue Titans', color: '#1368CE', icon: '⚡', border: 'border-[#1368CE]', bg: 'bg-[#1368CE]/15', badge: 'bg-[#1368CE] text-white', text: 'text-[#1368CE]' },
    { id: 'team-green', name: 'Emerald Knights', color: '#26890C', icon: '🛡️', border: 'border-[#26890C]', bg: 'bg-[#26890C]/15', badge: 'bg-[#26890C] text-white', text: 'text-[#26890C]' },
    { id: 'team-yellow', name: 'Golden Eagles', color: '#D89E00', icon: '🦅', border: 'border-[#D89E00]', bg: 'bg-[#D89E00]/15', badge: 'bg-[#D89E00] text-slate-900', text: 'text-[#D89E00]' },
    { id: 'team-purple', name: 'Purple Phantoms', color: '#864CBF', icon: '🔮', border: 'border-[#864CBF]', bg: 'bg-[#864CBF]/15', badge: 'bg-[#864CBF] text-white', text: 'text-[#864CBF]' },
    { id: 'team-orange', name: 'Orange Blaze', color: '#E65100', icon: '🔥', border: 'border-[#E65100]', bg: 'bg-[#E65100]/15', badge: 'bg-[#E65100] text-white', text: 'text-[#E65100]' },
    { id: 'team-cyan', name: 'Cyan Comets', color: '#00A896', icon: '☄️', border: 'border-[#00A896]', bg: 'bg-[#00A896]/15', badge: 'bg-[#00A896] text-white', text: 'text-[#00A896]' },
    { id: 'team-silver', name: 'Silver Wolves', color: '#546E7A', icon: '🐺', border: 'border-[#546E7A]', bg: 'bg-[#546E7A]/15', badge: 'bg-[#546E7A] text-white', text: 'text-[#546E7A]' },
  ];

  const activeSquads = ALL_SQUADS.slice(0, Math.max(2, Math.min(teamCount, ALL_SQUADS.length)));
  const SQUADS = activeSquads;

  // Computed authoritative active learner count (always non-zero if players are connected)
  const displayLearnerCount = Math.max(totalLearners, players.length);

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

  // Compute live join URL with dynamic anti-proxy token and quiz id for instant student preloading
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://alix-alp.vercel.app';
  const joinUrl = `${origin}/join?pin=${pin}&t=${rollingToken}${sessionId ? `&quizId=${sessionId}` : ''}`;

  const sessionCreatedRef = useRef(false);

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
        if (!sessionCreatedRef.current) {
          sessionCreatedRef.current = true;
          socket.emit('create-session', {
            quizId: sessionId || 'default',
            hostId: user?.id || 'host-teacher',
            questions: questions.length > 0 ? questions : undefined,
            quizTitle,
            subject,
            courseCode,
            gameMode,
          } as any);
        }
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
        if (data.gameMode) {
          setGameMode(data.gameMode);
        }
      });

      socket.on('player-joined', (data: any) => {
        if (data.gameMode) setGameMode(data.gameMode);
        if (Array.isArray(data.teamLeaderboard)) setTeamLeaderboard(data.teamLeaderboard);
        if (data.player) {
          setPlayers((prev) => {
            const playerKey = (p: any) =>
              (p.rollNo ? p.rollNo.toUpperCase() : '') + ':::' + (p.name || '').trim().toLowerCase();
            const newKey = playerKey(data.player);
            const existsIndex = prev.findIndex(
              (p) => p.id === data.player.id || playerKey(p) === newKey
            );
            if (existsIndex >= 0) {
              const updated = [...prev];
              updated[existsIndex] = {
                ...updated[existsIndex],
                ...data.player,
                isConnected: true,
              };
              return updated;
            }
            return [...prev, data.player];
          });
        }
        if (data.playerCount !== undefined) {
          setTotalLearners(data.playerCount);
        } else {
          setTotalLearners((prev) => Math.max(prev, 1));
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
        if (data.gameMode) setGameMode(data.gameMode);
        if (Array.isArray(data.teamLeaderboard)) setTeamLeaderboard(data.teamLeaderboard);
        if (data.questionResults?.totalCount !== undefined) {
          setAnswersSubmitted(data.questionResults.totalCount);
        }
        if (data.questionResults?.distribution) {
          setQuestionDistribution(data.questionResults.distribution);
        }
        if (Array.isArray(data.leaderboard)) {
          setPlayers((prev) => {
            return data.leaderboard.map((lb: any) => {
              const match = prev.find(
                (p) =>
                  p.id === lb.playerId ||
                  (p.name && lb.playerName && p.name.trim().toLowerCase() === lb.playerName.trim().toLowerCase())
              );
              return {
                ...(match || {}),
                id: lb.playerId,
                name: lb.playerName,
                score: typeof lb.score === 'number' ? lb.score : 0,
                rank: lb.rank,
                streak: lb.streak || 0,
                avatar: match?.avatar || 'fox',
                rollNo: match?.rollNo,
                teamId: lb.teamId || match?.teamId,
                teamName: lb.teamName || match?.teamName,
                teamColor: lb.teamColor || match?.teamColor,
              };
            });
          });
        }
        setStage('chart');
      });

      socket.on('game-ended', (data: any) => {
        if (data.gameMode) setGameMode(data.gameMode);
        if (Array.isArray(data.teamLeaderboard)) setTeamLeaderboard(data.teamLeaderboard);
        if (Array.isArray(data?.finalLeaderboard)) {
          setPlayers((prev) => {
            return data.finalLeaderboard.map((lb: any) => {
              const match = prev.find(
                (p) =>
                  p.id === lb.playerId ||
                  (p.name && lb.playerName && p.name.trim().toLowerCase() === lb.playerName.trim().toLowerCase())
              );
              return {
                ...(match || {}),
                id: lb.playerId,
                name: lb.playerName,
                score: typeof lb.score === 'number' ? lb.score : 0,
                rank: lb.rank,
                streak: lb.streak || 0,
                avatar: match?.avatar || 'fox',
                rollNo: match?.rollNo,
                teamId: lb.teamId || match?.teamId,
                teamName: lb.teamName || match?.teamName,
                teamColor: lb.teamColor || match?.teamColor,
              };
            });
          });
        }
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
  }, [sessionId, user]);

  const currentQ = questions[currentQuestionIdx] || questions[0];

  // Timer countdown when stage is 'question'
  useEffect(() => {
    if (stage !== 'question') return;
    if (timer <= 0) {
      setStage('chart');
      try {
        const socket = getSocket();
        (socket as any).emit('sync-timer', {
          code: pin,
          remaining: 0,
          total: currentQ.timeLimit || 30,
        });
        (socket as any).emit('reveal-answers', { code: pin });
      } catch {}
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => {
        const next = prev - 1;
        try {
          const socket = getSocket();
          (socket as any).emit('sync-timer', {
            code: pin,
            remaining: next,
            total: currentQ.timeLimit || 30,
          });
        } catch {}
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, stage, pin, currentQ?.timeLimit]);

  const rawOptions: string[] = (currentQ?.options || []).map((o: any) =>
    typeof o === 'string' ? o : o?.text || ''
  );
  const validOptionsWithIndex = rawOptions
    .map((text, idx) => ({ text, originalIdx: idx }))
    .filter((item) => item.text && item.text.trim().length > 0);
  const displayOptions =
    validOptionsWithIndex.length >= 2
      ? validOptionsWithIndex
      : rawOptions.map((text, idx) => ({ text, originalIdx: idx }));

  const themes = [
    { shape: '▲', bg: 'bg-[#E21B3C]', border: 'border-[#9E1329]' },
    { shape: '◆', bg: 'bg-[#1368CE]', border: 'border-[#0D4589]' },
    { shape: '●', bg: 'bg-[#D89E00]', border: 'border-[#8C6700]' },
    { shape: '■', bg: 'bg-[#26890C]', border: 'border-[#175407]' },
  ];

  const handleStartSession = () => {
    if (displayLearnerCount === 0) {
      alert('At least 1 learner must join the session before starting the live test.');
      return;
    }
    setStage('question');
    setTimer(currentQ.timeLimit || 30);
    setAnswersSubmitted(0);
    setQuestionDistribution({});
    try {
      const socket = getSocket();
      socket.emit('start-game', {
        sessionId: activeSessionId || pin,
        code: pin,
        quizId: sessionId,
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
      const nextQ = questions[nextIdx];
      const nextTimeLimit = nextQ?.timeLimit || 30;
      setTimer(nextTimeLimit);
      setAnswersSubmitted(0);
      setQuestionDistribution({});
      setStage('question');
      try {
        const socket = getSocket();
        socket.emit('next-question', {
          sessionId: activeSessionId || pin,
          code: pin,
          quizId: sessionId,
          questionIndex: nextIdx,
        } as any);
        (socket as any).emit('host-question-advance', {
          code: pin,
          questionIndex: nextIdx,
          timeLimit: nextTimeLimit,
          question: nextQ,
          totalQuestions: questions.length,
        });
      } catch (err) {
        console.warn('Could not emit next-question:', err);
      }
    } else {
      setStage('victory');
      try {
        const socket = getSocket();
        socket.emit('end-game', {
          sessionId: activeSessionId || pin,
          code: pin,
          quizId: sessionId,
        } as any);
      } catch (err) {
        console.warn('Could not emit end-game:', err);
      }
    }
  };

  const handleShowLeaderboard = () => {
    setStage('leaderboard');
    try {
      const socket = getSocket();
      (socket as any).emit('host-show-leaderboard', {
        code: pin,
        sessionId: activeSessionId || pin,
      });
    } catch (err) {
      console.warn('Could not emit host-show-leaderboard:', err);
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

  const handleToggleGameMode = (mode: 'classic' | 'team') => {
    setGameMode(mode);
    setLeaderboardTab(mode === 'team' ? 'teams' : 'individuals');
    try {
      const socket = getSocket();
      socket.emit('create-session', {
        quizId: sessionId || 'default',
        hostId: user?.id || 'host-teacher',
        questions: questions.length > 0 ? questions : undefined,
        quizTitle,
        subject,
        courseCode,
        gameMode: mode,
      } as any);
    } catch {}
  };

  const handleConfigureTeams = (newCount: number, newCap: number) => {
    setTeamCount(newCount);
    setMaxMembersPerTeam(newCap);
    const selected = ALL_SQUADS.slice(0, newCount);
    try {
      const socket = getSocket();
      socket.emit('configure-teams', {
        sessionId: activeSessionId || sessionId || pin,
        code: pin,
        teamCount: newCount,
        maxMembersPerTeam: newCap,
        teams: selected,
      });
    } catch (err) {
      console.warn('Could not emit configure-teams:', err);
    }
  };

  // Peer instruction timer countdown
  useEffect(() => {
    if (!isPeerInstructionActive || peerTimer <= 0) return;
    const interval = setInterval(() => {
      setPeerTimer((prev) => {
        if (prev <= 1) {
          setIsPeerInstructionActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPeerInstructionActive, peerTimer]);

  const handleTriggerPeerInstruction = () => {
    setIsPeerInstructionActive(true);
    setPeerTimer(45);
    try {
      const socket = getSocket();
      socket.emit('trigger-peer-instruction', {
        sessionId: activeSessionId || sessionId || pin,
        code: pin,
        duration: 45,
        questionIndex: currentQuestionIdx,
      });
    } catch (err) {
      console.warn('Could not emit trigger-peer-instruction:', err);
    }
  };

  const handlePushConceptCard = () => {
    setIsConceptPushed(true);
    const correctIdx = currentQ.correctIndex ?? 0;
    const correctOptionText = currentQ.options[correctIdx] || 'Verified Solution';
    try {
      const socket = getSocket();
      socket.emit('broadcast-concept-card', {
        sessionId: activeSessionId || sessionId || pin,
        code: pin,
        concept: {
          title: currentQ.text,
          takeaway: `The authoritative principle is "${correctOptionText}". Always isolate constraints before finalizing your answer.`,
          trap: `Common misconception: jumping to distractors without verifying boundary values or edge conditions.`,
          formula: `Active Recall Tip: Re-read prompt → verify prerequisites → eliminate traps.`,
        },
      });
    } catch (err) {
      console.warn('Could not emit broadcast-concept-card:', err);
    }
    setTimeout(() => setIsConceptPushed(false), 3000);
  };

  const LightWiringBackground: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      <svg className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="host-wiring-dot-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="0.85" fill="#E2E8F0" />
          </pattern>
          <linearGradient id="host-wire-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#46178F" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#1368CE" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00A6A6" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#host-wiring-dot-grid)" />
        <g stroke="url(#host-wire-grad)" strokeWidth="1.2" fill="none" strokeLinecap="round">
          <path d="M 0 100 L 250 100 L 320 170 L 600 170" />
          <circle cx="600" cy="170" r="2.5" fill="#46178F" fillOpacity="0.2" />
          <path d="M 400 0 L 400 80 L 460 140 L 750 140" />
          <circle cx="750" cy="140" r="2.5" fill="#1368CE" fillOpacity="0.2" />
          <path d="M 1200 80 L 950 80 L 880 150 L 700 150" />
          <circle cx="700" cy="150" r="2.5" fill="#00A6A6" fillOpacity="0.2" />
          <path d="M 800 600 L 800 480 L 720 400 L 450 400" />
          <circle cx="450" cy="400" r="2.5" fill="#46178F" fillOpacity="0.2" />
          <path d="M 100 550 L 300 550 L 380 470 L 650 470" />
          <circle cx="650" cy="470" r="2.5" fill="#E66C1C" fillOpacity="0.2" />
        </g>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#252525] flex flex-col justify-between selection:bg-[#46178F] selection:text-white relative overflow-hidden select-none font-sans">
      <LightWiringBackground />

      {/* Exit Live Session Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white text-[#252525] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E5E5E5] text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-black text-xl text-[#252525]">
              Exit Live Session?
            </h3>
            <p className="text-xs sm:text-sm text-[#626262] leading-relaxed">
              Are you sure you want to end this live session and return to your Dashboard? Connected learners will be disconnected.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-xl bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#252525] font-heading font-black text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const socket = getSocket();
                    socket.emit('end-game', { sessionId: activeSessionId || pin, code: pin } as any);
                  } catch {}
                  navigate('/dashboard');
                }}
                className="flex-1 py-3 rounded-xl bg-[#E21B5A] hover:bg-[#C2154B] border-b-4 border-[#9E103D] active:border-b-0 active:translate-y-1 text-white font-heading font-black text-xs transition-all cursor-pointer shadow-md"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Royal Purple Top Session Bar */}
      <header className="p-2.5 sm:p-3.5 bg-[#46178F] text-white shadow-md border-b border-[#350F6E] flex items-center justify-between z-20">
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/dashboard" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <AlixLogo variant="white" size="sm" showEduBadge={true} />
          </Link>
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-emerald-300">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRealtimeActive ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'
              }`}
            />
            <span>LIVE SESSION</span>
          </div>
        </div>

        {/* Center: PIN display */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-1.5 rounded-xl border border-white/20">
          <button
            type="button"
            onClick={() => setIsQRExpanded(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition-all cursor-pointer"
            title="Expand QR"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline text-[11px]">QR</span>
          </button>

          <div className="text-right">
            <div className="text-[10px] text-white/80 uppercase tracking-widest font-bold">
              PIN: <span className="text-cyan-200 font-mono font-black">{pin.slice(0, 3)} {pin.slice(3)}</span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Lock Button */}
          <button
            type="button"
            onClick={handleToggleLock}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isLocked
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white'
            }`}
            title={isLocked ? 'Room Locked' : 'Lock room'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportAttendance}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
            title="Export Attendance Sheet (CSV)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Connected Learners Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
            <Users className="w-4 h-4 text-cyan-300" />
            <span className="font-mono text-sm font-black text-white">{displayLearnerCount}</span>
          </div>

          {/* Next / Start Stage Button */}
          {stage === 'lobby' ? (
            <button
              type="button"
              onClick={handleStartSession}
              disabled={displayLearnerCount === 0}
              className={`px-4 sm:px-5 py-2 rounded-xl font-heading font-black text-xs sm:text-sm text-white transition-all duration-100 flex items-center gap-1.5 ${
                displayLearnerCount === 0
                  ? 'bg-white/20 border border-white/20 opacity-60 cursor-not-allowed'
                  : 'bg-[#26890C] hover:bg-[#20740A] border-b-4 border-[#175407] active:border-b-0 active:translate-y-1 shadow-md cursor-pointer'
              }`}
            >
              <span>{displayLearnerCount === 0 ? 'Waiting...' : 'Start'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (stage === 'question') {
                  setStage('chart');
                  setTimer(0);
                  try {
                    const socket = getSocket();
                    (socket as any).emit('sync-timer', {
                      code: pin,
                      remaining: 0,
                      total: currentQ.timeLimit || 30,
                    });
                    (socket as any).emit('reveal-answers', { code: pin });
                  } catch {}
                }
                else if (stage === 'chart') handleShowLeaderboard();
                else if (stage === 'leaderboard') handleNextQuestion();
                else if (stage === 'victory') navigate('/dashboard');
                else setStage('question');
              }}
              className="px-4 py-2 rounded-xl bg-[#1368CE] hover:bg-[#105AB3] border-b-4 border-[#0d4a99] active:border-b-0 active:translate-y-1 font-heading font-black text-xs sm:text-sm text-white transition-all duration-100 flex items-center gap-1.5 cursor-pointer shadow-md"
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

          {/* EXIT SESSION BUTTON (Directly resolves missing close button in live room) */}
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white font-heading font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/20 shadow-xs"
            title="Exit Live Session"
          >
            <X className="w-4 h-4" />
            <span className="hidden lg:inline">Exit Session</span>
          </button>
        </div>
      </header>

      {/* Main Projector Screen */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center z-10">
        {/* Lobby Waiting Screen */}
        {stage === 'lobby' && (
          <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in py-2">
            {/* Title & Subject Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-xs font-bold text-[#46178F] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{subject || 'Academic Learning Platform'}</span>
                {courseCode && <span className="text-[#626262]">• {courseCode}</span>}
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#252525] tracking-tight">
                {quizTitle}
              </h1>

              {/* Game Mode Selector: Classic vs Team Mode */}
              <div className="inline-flex p-1 rounded-2xl bg-[#EBEBEB] border border-[#E0E0E0] shadow-xs mt-2">
                <button
                  type="button"
                  onClick={() => handleToggleGameMode('classic')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-black transition-all flex items-center gap-2 cursor-pointer ${
                    gameMode === 'classic'
                      ? 'bg-[#46178F] text-white shadow-sm'
                      : 'text-[#626262] hover:text-[#252525]'
                  }`}
                >
                  <span>👤 Classic (Solo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleGameMode('team')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-black transition-all flex items-center gap-2 cursor-pointer ${
                    gameMode === 'team'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm'
                      : 'text-[#626262] hover:text-[#252525]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>👥 Team Mode (Squad vs Squad)</span>
                </button>
              </div>

              {/* Dynamic Team Settings: Number of Squads & Capacity Limit */}
              {gameMode === 'team' && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E5E5] max-w-xl mx-auto space-y-3 animate-fade-in text-xs shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-[#626262] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#46178F]" />
                      <span>Number of Squads:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[2, 3, 4, 5, 6, 8].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => handleConfigureTeams(count, maxMembersPerTeam)}
                          className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                            teamCount === count
                              ? 'bg-[#46178F] text-white shadow-xs'
                              : 'bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#252525]'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#E5E5E5]">
                    <span className="font-bold text-[#626262] flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-[#1368CE]" />
                      <span>Max Members / Squad:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {[
                        { label: 'Unlimited', val: 0 },
                        { label: '2', val: 2 },
                        { label: '4', val: 4 },
                        { label: '5', val: 5 },
                        { label: '8', val: 8 },
                        { label: '10', val: 10 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleConfigureTeams(teamCount, item.val)}
                          className={`px-2 py-1 rounded-lg font-black transition-all cursor-pointer ${
                            maxMembersPerTeam === item.val
                              ? 'bg-[#1368CE] text-white shadow-xs'
                              : 'bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#252525]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Giant Kahoot-Style Join & PIN Billboard */}
            <div className="relative bg-white text-[#252525] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E5E5E5] max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
              <div className="text-left space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-[#626262] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>Join on any phone or browser:</span>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-[#46178F] tracking-tight">
                  {origin.replace(/^https?:\/\//, '')}/join
                </div>
                <p className="text-xs text-[#626262] font-medium">Point camera at projector or enter PIN</p>
              </div>

              {/* Giant PIN Badge with Instant Projector QR trigger */}
              <div className="flex items-center gap-3">
                <div className="px-6 py-3 rounded-2xl bg-[#1368CE] text-white text-center shadow-md border-b-4 border-[#0D4589]">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-cyan-200">GAME PIN</span>
                  <span className="font-mono font-black text-3xl sm:text-4xl tracking-widest">
                    {pin.length === 6 ? `${pin.slice(0, 3)} ${pin.slice(3)}` : pin}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQRExpanded(true)}
                  className="p-3.5 rounded-2xl bg-[#F8F9FA] hover:bg-[#F3F3F3] text-[#46178F] font-bold transition-all shadow-xs hover:scale-105 active:scale-95 flex flex-col items-center gap-1 cursor-pointer border border-[#E5E5E5]"
                  title="Expand Projector QR Code"
                >
                  <QrCode className="w-7 h-7 text-[#46178F]" />
                  <span className="text-[10px] font-black uppercase tracking-wide">QR Code</span>
                </button>
              </div>
            </div>

            {/* Live Player Status Counter */}
            <div className="flex items-center justify-between max-w-2xl mx-auto px-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#252525]">
                <Users className="w-5 h-5 text-[#46178F]" />
                <span>
                  {players.length === 0
                    ? 'Waiting for players to join...'
                    : `${players.length} ${players.length === 1 ? 'Learner' : 'Learners'} in Lobby`}
                </span>
              </div>
              {players.length > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                  ● Live Session Ready
                </span>
              )}
            </div>

            {/* Animated Player Mascots / Squads Lounge */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E5] min-h-[170px] max-w-4xl mx-auto w-full flex flex-col justify-center items-center shadow-xs">
              {players.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#46178F] flex items-center justify-center mx-auto animate-bounce">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#252525]">
                    Scan the QR code or visit <strong className="text-[#46178F]">{origin.replace(/^https?:\/\//, '')}/join</strong>
                  </p>
                  <p className="text-xs text-[#626262]">Learner nicknames and mascot avatars pop up here live!</p>
                </div>
              ) : gameMode === 'team' ? (
                <div className="w-full space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-[#46178F] flex items-center justify-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <span>Active Squad Rosters (Team vs Team)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                    {activeSquads.map((sq) => {
                      const squadMembers = players.filter((p) => p.teamId === sq.id);
                      const isFull = maxMembersPerTeam > 0 && squadMembers.length >= maxMembersPerTeam;
                      return (
                        <div
                          key={sq.id}
                          className={`p-3.5 rounded-2xl border-2 ${sq.border} ${sq.bg} bg-white shadow-xs flex flex-col justify-between min-h-[130px]`}
                        >
                          <div>
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                              <span className="text-lg">{sq.icon}</span>
                              <div className="flex items-center gap-1">
                                {isFull && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                                    FULL
                                  </span>
                                )}
                                <span className="text-xs font-black text-[#252525] px-2 py-0.5 rounded-full bg-[#F3F3F3]">
                                  {squadMembers.length} {maxMembersPerTeam > 0 ? `/ ${maxMembersPerTeam}` : squadMembers.length === 1 ? 'member' : 'members'}
                                </span>
                              </div>
                            </div>
                            <div className="font-heading font-black text-sm text-[#252525] mt-1">
                              {sq.name}
                            </div>
                          </div>

                          <div className="pt-2 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                            {squadMembers.length === 0 ? (
                              <span className="text-[10px] text-[#626262] italic">Waiting for recruits...</span>
                            ) : (
                              squadMembers.map((m, mIdx) => (
                                <span
                                  key={m.id || mIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F8F9FA] text-[10px] font-bold text-[#252525] border border-[#E5E5E5]"
                                >
                                  <span>{m.name}</span>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-center w-full">
                  {players.map((p, idx) => {
                    const avatarList = ['fox', 'tiger', 'panda', 'owl', 'koala', 'lion', 'rabbit', 'bear'];
                    const chosenAvatar = p.avatar || avatarList[idx % avatarList.length];
                    return (
                      <div
                        key={p.id || idx}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#F8F9FA] hover:bg-[#F3F3F3] border-2 border-[#E5E5E5] hover:border-[#46178F] shadow-xs transition-transform hover:scale-105 animate-scale-in text-[#252525]"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#46178F] to-[#1368CE] p-0.5 flex items-center justify-center shrink-0 shadow-xs ring-2 ring-purple-100">
                          <RenderAvatarSvg avatarId={chosenAvatar} size={36} />
                        </div>
                        <div className="text-left">
                          <div className="font-heading font-black text-sm text-[#252525] leading-tight">
                            {p.name}
                          </div>
                          {p.rollNo && (
                            <div className="text-[10px] font-mono font-bold text-[#46178F]">
                              {p.rollNo}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Giant 3D Launchpad Start Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartSession}
                disabled={displayLearnerCount === 0}
                className={`px-10 py-4 sm:py-5 rounded-2xl text-white font-heading font-black text-lg sm:text-2xl shadow-xl transition-all duration-100 inline-flex items-center gap-3 ${
                  displayLearnerCount === 0
                    ? 'bg-slate-300 border-b-6 border-slate-400 opacity-60 cursor-not-allowed text-slate-600'
                    : 'bg-[#26890C] hover:bg-[#20740A] border-b-6 border-[#175407] active:border-b-0 active:translate-y-1.5 cursor-pointer group shadow-emerald-900/30'
                }`}
              >
                <span>
                  {displayLearnerCount === 0
                    ? 'Waiting for Learners to Join...'
                    : `Start Game (${questions.length} questions)`}
                </span>
                <ArrowRight className="w-6 h-6 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 1: Live Question Presentation */}
        {stage === 'question' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-[#46178F] border border-purple-200 text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Question {currentQuestionIdx + 1} of {questions.length}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-[#F3F3F3] text-xs font-semibold text-[#626262]">
                    {subject}
                  </span>
                  {((currentQ as any).type === 'multi_select' || (currentQ as any).questionType === 'multi_select') && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider animate-pulse">
                      ☑ Multi-Select: Choose all that apply
                    </span>
                  )}
                  {((currentQ as any).type === 'poll' || (currentQ as any).questionType === 'poll') && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-wider">
                      📊 Poll: Live Opinion Check
                    </span>
                  )}
                  {((currentQ as any).type === 'true_false' || (currentQ as any).questionType === 'true_false') && (
                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase tracking-wider">
                      ⚖️ True / False
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-[#626262] uppercase font-semibold">Submissions</div>
                    <div className="text-base sm:text-lg font-mono font-black text-[#46178F]">
                      {answersSubmitted} / {Math.max(1, displayLearnerCount)}
                    </div>
                  </div>
                  <Countdown secondsRemaining={timer} totalSeconds={currentQ.timeLimit || 30} size="md" />
                </div>
              </div>

              {/* Question Text */}
              <h1 className="text-2xl sm:text-4xl lg:text-4xl font-heading font-extrabold leading-tight text-[#252525] mb-2">
                {currentQ.text}
              </h1>

              {/* Question Visual Diagram / Image */}
              {Boolean((currentQ as any).image || (currentQ as any).mediaUrl) && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={(currentQ as any).image || (currentQ as any).mediaUrl}
                    alt="Question visual"
                    className="max-h-56 sm:max-h-72 object-contain rounded-2xl border border-[#E5E5E5] shadow-xs bg-white p-2"
                  />
                </div>
              )}
            </div>

            {/* Answer Options Grid (Filtered for valid non-empty options only) */}
            <div
              className={`grid gap-4 sm:gap-6 ${
                displayOptions.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto'
                  : displayOptions.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {displayOptions.map((item, displayIdx) => {
                const t = themes[displayIdx % themes.length];
                return (
                  <div
                    key={item.originalIdx}
                    className={`p-6 sm:p-8 rounded-2xl ${t.bg} border-b-6 ${t.border} text-white font-heading font-black text-xl sm:text-2xl lg:text-3xl flex items-center gap-4 sm:gap-6 shadow-xl transition-transform active:scale-[0.99]`}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-black/20 flex items-center justify-center text-2xl sm:text-4xl shrink-0 shadow-inner">
                      {t.shape}
                    </div>
                    <span className="flex-1 drop-shadow leading-snug">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 2: Response Distribution Breakdown */}
        {stage === 'chart' && (() => {
          const isMulti = (currentQ as any).type === 'multi_select' || (currentQ as any).questionType === 'multi_select';
          const isPoll = (currentQ as any).type === 'poll' || (currentQ as any).questionType === 'poll';
          const correctIndices: number[] = Array.isArray((currentQ as any).correctIndices) && (currentQ as any).correctIndices.length > 0
            ? (currentQ as any).correctIndices
            : [currentQ.correctIndex ?? 0];

          return (
            <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-sm animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#46178F]">
                    Results Breakdown
                  </span>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-[#252525] mt-1">
                    {currentQ.text}
                  </h2>
                </div>
                <div className="text-right">
                  {isPoll ? (
                    <div className="text-sm font-black text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-600" />
                      <span>Poll Results ({answersSubmitted} responses)</span>
                    </div>
                  ) : (
                    <div className="text-sm font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>
                        Correct:{' '}
                        {correctIndices.map((ci: number) => rawOptions[ci] || `Option ${ci + 1}`).join(' & ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Filtered Response Distribution Bars with Kahoot-style Histogram Columns */}
              <div
                className={`grid gap-4 sm:gap-6 items-end min-h-[300px] pt-4 ${
                  displayOptions.length === 2
                    ? 'grid-cols-2 max-w-xl mx-auto'
                    : displayOptions.length === 3
                    ? 'grid-cols-3 max-w-3xl mx-auto'
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}
              >
                {displayOptions.map((item, displayIdx) => {
                  const t = themes[displayIdx % themes.length];
                  const isCorrect = isPoll ? false : isMulti ? correctIndices.includes(item.originalIdx) : item.originalIdx === currentQ.correctIndex;
                  const voteCount = questionDistribution[item.originalIdx.toString()] || 0;
                  const percent = answersSubmitted > 0 ? Math.round((voteCount / answersSubmitted) * 100) : 0;

                  return (
                    <div key={item.originalIdx} className="flex flex-col items-center gap-2 h-full justify-end">
                      {/* Checkmark or correct badge */}
                      {isCorrect ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce mb-1">
                          <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 opacity-0 mb-1" />
                      )}

                      {/* Rising Histogram Bar Column */}
                      <div className="w-full flex flex-col items-center justify-end h-36 mb-1">
                        <div
                          className={`w-14 sm:w-20 rounded-t-2xl ${t.bg} border-t-2 border-x-2 border-white/40 flex flex-col items-center justify-between py-2 transition-all duration-700 shadow-md ${
                            isCorrect ? 'ring-2 ring-emerald-400' : ''
                          }`}
                          style={{
                            height: `${Math.max(34, (voteCount / Math.max(1, answersSubmitted)) * 135)}px`,
                          }}
                        >
                          <span className="font-heading font-black text-sm sm:text-base text-white drop-shadow flex items-center gap-1">
                            <span>{t.shape}</span>
                            <span>{voteCount}</span>
                          </span>
                          {answersSubmitted > 0 && (
                            <span className="text-[10px] font-mono text-white/90 font-black">
                              {percent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arcade Option Bar with Response Count & Percentages */}
                      <div
                        className={`w-full rounded-2xl ${t.bg} border-b-6 ${t.border} p-4 sm:p-5 text-center text-white font-black shadow-md transition-all flex flex-col justify-between items-center ${
                          isCorrect ? 'ring-4 ring-emerald-500 shadow-xl scale-[1.02]' : isPoll ? 'opacity-90' : 'opacity-70'
                        }`}
                        style={{ minHeight: isCorrect ? '140px' : '110px' }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl sm:text-2xl drop-shadow">{t.shape}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-black/35 font-mono text-xs font-black border border-white/20">
                            {answersSubmitted > 0 ? `${percent}%` : '0%'}
                          </span>
                        </div>

                        <span className="text-sm sm:text-base font-black line-clamp-2 my-2 leading-tight drop-shadow">
                          {item.text}
                        </span>

                        <div className="w-full pt-1.5 flex items-center justify-between text-xs font-bold text-white/90 border-t border-white/20">
                          <span>{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</span>
                          {isCorrect && (
                            <span className="text-emerald-300 font-extrabold flex items-center gap-1">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Learning & AI Pedagogy Toolbar */}
              <div className="pt-6 border-t border-[#E5E5E5] flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiConcept((prev) => !prev)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    showAiConcept
                      ? 'bg-[#46178F] text-white ring-2 ring-purple-300'
                      : 'bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#252525] border border-[#E0E0E0]'
                  }`}
                >
                  <Brain className="w-4 h-4 text-[#46178F]" />
                  <span>{showAiConcept ? 'Hide AI Diagnostic' : '🧠 Reveal AI Misconception Insight'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerPeerInstruction}
                  disabled={isPeerInstructionActive}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    isPeerInstructionActive
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                      : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white'
                  }`}
                  title="Eric Mazur's Harvard Peer Instruction: 45s squad debate & revote"
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {isPeerInstructionActive
                      ? `🤝 Peer Debate Active (${peerTimer}s)`
                      : '🤝 Mazur Peer Discussion Round (45s)'}
                  </span>
                </button>
              </div>

              {/* Mazur Peer Discussion Active Banner */}
              {isPeerInstructionActive && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between text-left animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs">
                      🤝
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-amber-800">
                        Peer Discussion Round Active • Harvard STEM Active Learning
                      </div>
                      <div className="text-sm font-black text-[#252525]">
                        Turn to your squad or neighbor! Explain your reasoning and reconcile differences.
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-white border border-amber-400 font-mono font-black text-2xl text-amber-600 shadow-inner">
                    {peerTimer}s
                  </div>
                </div>
              )}

              {/* AI Pedagogical Concept & Misconception Breakdown */}
              {showAiConcept && (
                <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-[#F8F9FA] border-2 border-purple-200 shadow-sm space-y-4 text-left animate-scale-in relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-100 text-[#46178F]">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-[#46178F]">
                          ALIX AI Pedagogy Diagnostic
                        </div>
                        <h3 className="font-heading font-black text-base sm:text-lg text-[#252525]">
                          Concept Breakdown & Misconception Analysis
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePushConceptCard}
                      disabled={isConceptPushed}
                      className="px-3.5 py-1.5 rounded-xl bg-[#46178F] hover:bg-[#350F6E] text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-80"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isConceptPushed ? '✓ Broadcasted to Students!' : 'Broadcast to Student Phones'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5E5] space-y-1.5">
                      <div className="font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Core Principle</span>
                      </div>
                      <p className="text-[#626262] leading-relaxed font-medium">
                        The authoritative solution is derived by strictly isolating constraints and matching the fundamental definition.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5E5] space-y-1.5">
                      <div className="font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Cognitive Trap (Misconception)</span>
                      </div>
                      <p className="text-[#626262] leading-relaxed font-medium">
                        Students who picked distractors often overlooked boundary values or evaluated sub-expressions before applying precedence.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5E5] space-y-1.5">
                      <div className="font-bold uppercase tracking-wider text-[#1368CE] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Exam Recall Anchor</span>
                      </div>
                      <p className="text-[#626262] leading-relaxed font-medium">
                        Quick Mental Check: Re-read prompt → verify prerequisites → eliminate traps.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-4">
                {currentQuestionIdx + 1 < questions.length ? (
                  <>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-8 py-3.5 rounded-2xl bg-[#26890C] hover:bg-[#20740A] border-b-4 border-[#175407] active:border-b-0 active:translate-y-1 text-white font-heading font-black text-lg sm:text-xl shadow-lg flex items-center gap-3 cursor-pointer transition-all"
                    >
                      <span>Next Question ({currentQuestionIdx + 2} of {questions.length})</span>
                      <ArrowRight className="w-5 h-5 stroke-[3]" />
                    </button>

                    <button
                      type="button"
                      onClick={handleShowLeaderboard}
                      className="px-6 py-3.5 rounded-2xl bg-[#F3F3F3] hover:bg-[#E5E5E5] border border-[#E0E0E0] text-[#252525] font-heading font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                    >
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>View Leaderboard</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 border-b-6 border-amber-700 active:border-b-0 active:translate-y-1.5 text-white font-heading font-black text-xl sm:text-2xl shadow-xl flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <Trophy className="w-6 h-6 stroke-[2.5]" />
                    <span>Final Podium & Results</span>
                    <ArrowRight className="w-6 h-6 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Stage 3: Live Session Leaderboard */}
        {stage === 'leaderboard' && (() => {
          const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
          const top3 = sortedPlayers.slice(0, 3);
          const ranks4to10 = sortedPlayers.slice(3, 10);

          return (
            <div className="max-w-4xl mx-auto w-full animate-fade-in space-y-6">
              <div className="text-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#46178F]">
                  Auditorium Standings
                </span>
                <h2 className="text-3xl sm:text-5xl font-heading font-black text-[#252525] mt-1">
                  Live Leaderboard
                </h2>

                {/* Mode Tabs if Team Mode */}
                {gameMode === 'team' && (
                  <div className="inline-flex p-1 rounded-2xl bg-[#EBEBEB] border border-[#E0E0E0] shadow-xs mt-3">
                    <button
                      type="button"
                      onClick={() => setLeaderboardTab('teams')}
                      className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        leaderboardTab === 'teams'
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm'
                          : 'text-[#626262] hover:text-[#252525]'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>👥 Squad Standings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardTab('individuals')}
                      className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        leaderboardTab === 'individuals'
                          ? 'bg-[#46178F] text-white shadow-sm'
                          : 'text-[#626262] hover:text-[#252525]'
                      }`}
                    >
                      <span>👤 Individual MVPs</span>
                    </button>
                  </div>
                )}
              </div>

              {gameMode === 'team' && leaderboardTab === 'teams' ? (
                <div className="space-y-3">
                  {(teamLeaderboard.length > 0
                    ? teamLeaderboard
                    : SQUADS.map((s, i) => ({
                        teamId: s.id,
                        teamName: s.name,
                        color: s.color,
                        icon: s.icon,
                        score: 0,
                        rank: i + 1,
                        memberCount: players.filter((p) => p.teamId === s.id).length,
                      }))
                  ).map((t, idx) => {
                    const squadDef = SQUADS.find((s) => s.id === t.teamId) || SQUADS[idx % SQUADS.length];
                    return (
                      <div
                        key={t.teamId || idx}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex items-center justify-between gap-4 relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 relative z-10 min-w-0">
                          <span
                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-heading font-black text-sm sm:text-base shadow-xs shrink-0 ${
                              idx === 0
                                ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 ring-2 ring-amber-300'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-[#F3F3F3] text-[#626262]'
                            }`}
                          >
                            #{t.rank || idx + 1}
                          </span>
                          <span className="text-2xl sm:text-3xl shrink-0">{squadDef.icon}</span>
                          <div className="min-w-0">
                            <div className="font-heading font-black text-base sm:text-xl text-[#252525] truncate flex items-center gap-2">
                              <span>{t.teamName}</span>
                              {idx === 0 && (
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                                  Leading
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#626262] font-semibold">
                              {t.memberCount} teammates active
                            </div>
                          </div>
                        </div>

                        <div className="text-right relative z-10 shrink-0">
                          <div className="font-mono text-xl sm:text-3xl font-black text-[#46178F]">
                            {t.score.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-bold text-[#626262] uppercase tracking-wider">
                            TEAM POINTS
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Individual Top 10 Display: Top 3 Cards + Ranks 4 to 10 Table */
                <div className="space-y-4">
                  {sortedPlayers.length === 0 ? (
                    <div className="p-8 text-center text-[#626262] text-sm bg-white rounded-3xl border border-[#E5E5E5]">
                      Learners will appear here once scores are tabulated.
                    </div>
                  ) : (
                    <>
                      {/* Top 3 Podium Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
                        {/* 2nd Place */}
                        {top3[1] && (
                          <div className="order-2 sm:order-1 bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 text-center shadow-xs space-y-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-heading font-black text-xs flex items-center justify-center mx-auto">
                              🥈 2
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-100 p-0.5 flex items-center justify-center mx-auto shadow-xs">
                              <RenderAvatarSvg avatarId={top3[1].avatar || 'bot'} size={44} />
                            </div>
                            <div className="font-heading font-black text-base text-[#252525] truncate">
                              {top3[1].name}
                            </div>
                            <div className="font-mono font-black text-lg text-[#1368CE]">
                              {(top3[1].score ?? 0).toLocaleString()} pts
                            </div>
                          </div>
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                          <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 text-center shadow-md space-y-2 relative -mt-3 ring-2 ring-amber-300/40">
                            <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-heading font-black text-sm flex items-center justify-center mx-auto shadow-xs">
                              🥇 1
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 flex items-center justify-center mx-auto shadow-xs">
                              <RenderAvatarSvg avatarId={top3[0].avatar || 'fox'} size={52} />
                            </div>
                            <div className="font-heading font-black text-lg sm:text-xl text-[#252525] truncate">
                              {top3[0].name}
                            </div>
                            <div className="font-mono font-black text-2xl text-[#46178F]">
                              {(top3[0].score ?? 0).toLocaleString()} pts
                            </div>
                          </div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                          <div className="order-3 sm:order-3 bg-white border-2 border-amber-200 rounded-3xl p-4 sm:p-5 text-center shadow-xs space-y-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-heading font-black text-xs flex items-center justify-center mx-auto">
                              🥉 3
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-200 to-orange-100 p-0.5 flex items-center justify-center mx-auto shadow-xs">
                              <RenderAvatarSvg avatarId={top3[2].avatar || 'owl'} size={44} />
                            </div>
                            <div className="font-heading font-black text-base text-[#252525] truncate">
                              {top3[2].name}
                            </div>
                            <div className="font-mono font-black text-lg text-[#E66C1C]">
                              {(top3[2].score ?? 0).toLocaleString()} pts
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ranks 4 to 10 (Directly answers user request to show top 10 below 1, 2, 3) */}
                      {ranks4to10.length > 0 && (
                        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-4 sm:p-5 shadow-xs space-y-2 text-left">
                          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] text-xs font-heading font-black uppercase text-[#626262]">
                            <span className="flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-500" />
                              <span>Top 10 Auditorium Leaders (Ranks 4 – 10)</span>
                            </span>
                            <span>Score</span>
                          </div>

                          <div className="divide-y divide-[#F3F3F3]">
                            {ranks4to10.map((p, idx) => {
                              const rank = idx + 4;
                              return (
                                <div key={p.id || idx} className="py-2.5 px-2 flex items-center justify-between hover:bg-[#F8F9FA] rounded-xl transition-colors">
                                  <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-xl bg-[#F3F3F3] font-mono text-xs font-black text-[#626262] flex items-center justify-center">
                                      #{rank}
                                    </span>
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 p-0.5 flex items-center justify-center shrink-0">
                                      <RenderAvatarSvg avatarId={p.avatar || 'rabbit'} size={26} />
                                    </div>
                                    <div>
                                      <span className="font-heading font-black text-sm text-[#252525]">{p.name}</span>
                                      {p.teamName && (
                                        <span className="text-xs text-[#46178F] font-bold ml-2">[{p.teamName}]</span>
                                      )}
                                      {p.rollNo && (
                                        <span className="text-xs text-[#626262] font-mono ml-2">({p.rollNo})</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-mono text-sm font-black text-[#46178F]">
                                    {(p.score ?? 0).toLocaleString()} pts
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Leaderboard Action Button */}
              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-8 py-3.5 rounded-2xl bg-[#26890C] hover:bg-[#20740A] border-b-4 border-[#175407] active:border-b-0 active:translate-y-1 text-white font-heading font-black text-lg shadow-md flex items-center gap-3 cursor-pointer transition-all"
                >
                  <span>
                    {currentQuestionIdx + 1 < questions.length
                      ? `Next Question (${currentQuestionIdx + 2} of ${questions.length})`
                      : 'View Final Podium 🏆'}
                  </span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Stage 4: Victory Podium & Export */}
        {stage === 'victory' && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-scale-in flex flex-col items-center">
            {gameMode === 'team' && (teamLeaderboard.length > 0 || players.length > 0) ? (
              <div className="w-full space-y-6 text-center">
                {/* Team Mode Grand Champion Banner */}
                {(() => {
                  const sortedSquads =
                    teamLeaderboard.length > 0
                      ? teamLeaderboard
                      : SQUADS.map((s, i) => ({
                          teamId: s.id,
                          teamName: s.name,
                          color: s.color,
                          icon: s.icon,
                          score: 0,
                          rank: i + 1,
                          memberCount: players.filter((p) => p.teamId === s.id).length,
                        }));
                  const champion = sortedSquads[0];
                  const runnerUp = sortedSquads[1];
                  const bronze = sortedSquads[2];
                  const individualMvp = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];

                  return (
                    <div className="space-y-6 animate-fade-in">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-black uppercase tracking-wider">
                        <Trophy className="w-4 h-4 text-amber-500 fill-current" />
                        <span>Team Mode Tournament Championship</span>
                      </div>

                      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-300 shadow-md max-w-2xl mx-auto">
                        <div className="text-4xl sm:text-6xl mb-2 animate-bounce">
                          {champion?.icon || '🏆'}
                        </div>
                        <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#46178F]">
                          GRAND CHAMPION SQUAD
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-heading font-black text-[#252525] mt-1">
                          {champion?.teamName || 'Team Champion'}
                        </h2>
                        <div className="mt-2 font-mono text-xl sm:text-2xl font-black text-amber-600">
                          {champion?.score?.toLocaleString() || 0} TEAM PTS
                        </div>
                        <div className="text-xs text-[#626262] mt-1 font-medium">
                          {champion?.memberCount || 0} Teammates Contributed to Victory
                        </div>
                      </div>

                      {/* 2nd & 3rd Podium Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {runnerUp && (
                          <div className="p-4 rounded-2xl bg-white border border-[#E5E5E5] text-left flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🥈</span>
                              <div>
                                <div className="text-[10px] uppercase font-bold text-[#626262]">Runner-Up Squad</div>
                                <div className="text-base font-black text-[#252525]">{runnerUp.teamName}</div>
                              </div>
                            </div>
                            <div className="font-mono text-base font-bold text-[#1368CE]">
                              {runnerUp.score.toLocaleString()} pts
                            </div>
                          </div>
                        )}
                        {bronze && (
                          <div className="p-4 rounded-2xl bg-white border border-[#E5E5E5] text-left flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🥉</span>
                              <div>
                                <div className="text-[10px] uppercase font-bold text-[#626262]">3rd Place Squad</div>
                                <div className="text-base font-black text-[#252525]">{bronze.teamName}</div>
                              </div>
                            </div>
                            <div className="font-mono text-base font-bold text-[#E66C1C]">
                              {bronze.score.toLocaleString()} pts
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tournament Individual MVP */}
                      {individualMvp && (
                        <div className="p-3.5 rounded-2xl bg-white border border-purple-200 max-w-md mx-auto flex items-center justify-between text-left shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">🌟</span>
                            <div>
                              <div className="text-[10px] font-black uppercase text-[#46178F]">Tournament Individual MVP</div>
                              <div className="text-sm font-black text-[#252525]">
                                {individualMvp.name} {individualMvp.teamName && `[${individualMvp.teamName}]`}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono text-sm font-black text-[#46178F]">
                            {(individualMvp.score ?? 0).toLocaleString()} pts
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* 3D Animated Victory Podium with Confetti (Classic Mode) */
              <div className="w-full flex flex-col items-center space-y-6">
                <VictoryPodium
                  winners={
                    [...players]
                      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                      .slice(0, 3)
                      .map((p, idx) => ({
                        rank: idx + 1,
                        name: p.name,
                        score: p.score ?? 0,
                        avatarId: p.avatar || (idx === 0 ? 'fox' : idx === 1 ? 'bot' : 'owl'),
                        streak: p.streak ?? 0,
                      }))
                  }
                  onRestart={() => {
                    setStage('lobby');
                    setCurrentQuestionIdx(0);
                    setAnswersSubmitted(0);
                  }}
                />

                {/* Final Standings (Ranks 4 to 10) below podium */}
                {players.length > 3 && (
                  <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E5E5E5] p-5 shadow-xs space-y-2 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] text-xs font-heading font-black uppercase text-[#626262]">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>Top 10 Final Standings (Ranks 4 – 10)</span>
                      </span>
                      <span>Final Score</span>
                    </div>
                    <div className="divide-y divide-[#F3F3F3]">
                      {[...players]
                        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                        .slice(3, 10)
                        .map((p, idx) => (
                          <div key={p.id || idx} className="py-2.5 px-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-xl bg-[#F3F3F3] font-mono text-xs font-black text-[#626262] flex items-center justify-center">
                                #{idx + 4}
                              </span>
                              <span className="font-heading font-black text-sm text-[#252525]">{p.name}</span>
                              {p.rollNo && <span className="text-xs text-[#626262] font-mono">({p.rollNo})</span>}
                            </div>
                            <span className="font-mono text-sm font-black text-[#46178F]">
                              {(p.score ?? 0).toLocaleString()} pts
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleExportAttendance}
                className="px-6 py-3 rounded-xl bg-[#26890C] hover:bg-[#20740A] border-b-4 border-[#175407] active:border-b-0 active:translate-y-1 text-white font-bold text-sm shadow-md transition-all duration-100 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Attendance Sheet (CSV)</span>
              </button>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#46178F] hover:bg-[#350F6E] border-b-4 border-[#240A4B] active:border-b-0 active:translate-y-1 text-white font-bold text-sm shadow-md transition-all duration-100 cursor-pointer"
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
        participantCount={displayLearnerCount}
      />
    </div>
  );
};

export default HostPage;
