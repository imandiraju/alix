import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import QuestionCard from '../components/game/QuestionCard';
import OptionButton from '../components/game/OptionButton';
import Countdown from '../components/game/Countdown';
import ScorePopup from '../components/game/ScorePopup';
import Leaderboard from '../components/game/Leaderboard';
import ReactionStream from '../components/game/ReactionStream';
import { getAvatarById } from '../components/game/AlixAvatars';
import { RenderAvatarSvg } from '../components/game/AlixSvgAvatars';
import { getSocket, REALTIME_URL } from '../services/socket';
import {
  triggerCorrectAnswerConfetti,
  triggerStreakBurst,
  triggerVictoryPodiumCelebration,
} from '../components/game/CelebrationEffects';
import {
  Trophy,
  Flame,
  User,
  LogOut,
  CheckCircle2,
  CheckSquare,
  Square,
  BarChart3,
  Clock,
  Wifi,
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  Lightbulb,
  X,
  MessageSquare,
} from 'lucide-react';

interface ActiveQuestion {
  id?: string;
  type?: string;
  questionType?: string;
  index: number;
  total: number;
  text: string;
  options: string[];
  timeLimit: number;
  points?: number;
}

export const DEFAULT_SQUADS = [
  { id: 'team-red', name: 'Red Dragons', color: '#E21B3C', icon: '🐉', border: 'border-[#E21B3C]', bg: 'bg-[#E21B3C]/20', badge: 'bg-[#E21B3C] text-white', text: 'text-[#E21B3C]' },
  { id: 'team-blue', name: 'Blue Titans', color: '#1368CE', icon: '⚡', border: 'border-[#1368CE]', bg: 'bg-[#1368CE]/20', badge: 'bg-[#1368CE] text-white', text: 'text-[#1368CE]' },
  { id: 'team-green', name: 'Emerald Knights', color: '#26890C', icon: '🛡️', border: 'border-[#26890C]', bg: 'bg-[#26890C]/20', badge: 'bg-[#26890C] text-white', text: 'text-[#26890C]' },
  { id: 'team-yellow', name: 'Golden Eagles', color: '#D89E00', icon: '🦅', border: 'border-[#D89E00]', bg: 'bg-[#D89E00]/20', badge: 'bg-[#D89E00] text-slate-900', text: 'text-[#D89E00]' },
  { id: 'team-purple', name: 'Purple Phantoms', color: '#864CBF', icon: '🔮', border: 'border-[#864CBF]', bg: 'bg-[#864CBF]/20', badge: 'bg-[#864CBF] text-white', text: 'text-[#864CBF]' },
  { id: 'team-orange', name: 'Orange Blaze', color: '#E65100', icon: '🔥', border: 'border-[#E65100]', bg: 'bg-[#E65100]/20', badge: 'bg-[#E65100] text-white', text: 'text-[#E65100]' },
  { id: 'team-cyan', name: 'Cyan Comets', color: '#00A896', icon: '☄️', border: 'border-[#00A896]', bg: 'bg-[#00A896]/20', badge: 'bg-[#00A896] text-white', text: 'text-[#00A896]' },
  { id: 'team-silver', name: 'Silver Wolves', color: '#546E7A', icon: '🐺', border: 'border-[#546E7A]', bg: 'bg-[#546E7A]/20', badge: 'bg-[#546E7A] text-white', text: 'text-[#546E7A]' },
];

export const SQUADS = DEFAULT_SQUADS;

export const PlayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get('name') || 'Learner';
  const rollNo = searchParams.get('rollNo') || '';
  const avatarId = searchParams.get('avatar') || 'fox';
  const urlQuizId = searchParams.get('quizId') || '';
  const initialTeamId = searchParams.get('teamId') || 'team-red';
  const avatar = getAvatarById(avatarId);

  // Team Mode State
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId);
  const [isTeamMode, setIsTeamMode] = useState(false);
  const [teamLeaderboard, setTeamLeaderboard] = useState<any[]>([]);
  const [customTeams, setCustomTeams] = useState<any[] | null>(null);
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState<number>(0);

  // Active Learning & AI Pedagogy Flashcard
  const [isPeerInstruction, setIsPeerInstruction] = useState<boolean>(false);
  const [peerTimer, setPeerTimer] = useState<number>(45);
  const [receivedConcept, setReceivedConcept] = useState<{
    title: string;
    takeaway: string;
    trap: string;
    formula?: string;
  } | null>(null);

  // Game Phases: 'waiting' | 'answering' | 'submitted' | 'score' | 'leaderboard' | 'ended'
  const [phase, setPhase] = useState<'waiting' | 'answering' | 'submitted' | 'score' | 'leaderboard' | 'ended'>('waiting');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [score, setScore] = useState(() => {
    return Number(sessionStorage.getItem(`alix_score_${sessionId}`)) || 0;
  });
  const [streak, setStreak] = useState(() => {
    return Number(sessionStorage.getItem(`alix_streak_${sessionId}`)) || 0;
  });
  const [lastPointsAwarded, setLastPointsAwarded] = useState(0);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<ActiveQuestion>({
    index: 1,
    total: 1,
    text: 'Waiting for instructor to project question...',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    timeLimit: 30,
  });

  const [leaderboardList, setLeaderboardList] = useState<any[]>([]);

  // Cached quiz questions from DB for instant client-side resiliency
  const quizQuestionsRef = useRef<any[]>([]);
  const currentIdxRef = useRef<number>(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // 1. Preload real quiz questions from MongoDB Cloud API
  useEffect(() => {
    let isCancelled = false;

    const loadQuestions = async () => {
      try {
        let fetched: any[] = [];

        // If quizId was passed via QR code query string
        if (urlQuizId) {
          const res = await fetch(`${REALTIME_URL}/api/quizzes/${urlQuizId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.quiz?.questions && data.quiz.questions.length > 0) {
              fetched = data.quiz.questions;
            }
          }
        }

        // If not loaded by ID, try list of published quizzes
        if (fetched.length === 0) {
          const listRes = await fetch(`${REALTIME_URL}/api/quizzes`);
          if (listRes.ok) {
            const listData = await listRes.json();
            if (Array.isArray(listData.quizzes) && listData.quizzes.length > 0) {
              // Match by title or take the active one
              fetched = listData.quizzes[0].questions || [];
            }
          }
        }

        if (!isCancelled && fetched.length > 0) {
          quizQuestionsRef.current = fetched;
        }
      } catch (err) {
        console.warn('[ALIX Student] Could not preload quiz data:', err);
      }
    };

    loadQuestions();
    return () => {
      isCancelled = true;
    };
  }, [urlQuizId]);

  // Activate question by index with strict option filtering (eliminates blank cards on 2-option questions)
  const activateQuestion = (idx: number) => {
    currentIdxRef.current = idx;
    const questionsList = quizQuestionsRef.current;
    if (questionsList && questionsList[idx]) {
      const q = questionsList[idx];
      const rawOpts: string[] = (q.options || []).map((o: any) =>
        typeof o === 'string' ? o : o?.text || ''
      );
      // Strictly filter out blank/empty options (e.g. True/False questions only have 2 options!)
      const validOpts = rawOpts.filter((t: string) => t && t.trim().length > 0);
      const finalOpts = validOpts.length >= 2 ? validOpts : rawOpts;

      setCurrentQuestion({
        id: q.id || `q-${idx + 1}`,
        type: q.type,
        questionType: q.questionType || q.type,
        index: idx + 1,
        total: questionsList.length || 1,
        text: q.text,
        options: finalOpts,
        timeLimit: q.timeLimit || 30,
        points: q.points || 1000,
      });
      setSecondsRemaining(q.timeLimit || 30);
      setSelectedIndex(null);
      setSelectedIndices([]);
      setPhase('answering');
    }
  };

  // 2. Realtime Socket Integration
  useEffect(() => {
    try {
      const socket = getSocket();
      const onConnect = () => {
        setIsSocketConnected(true);
        socket.emit('join-session', {
          code: sessionId || '842915',
          playerName: studentName,
          rollNo: rollNo || undefined,
          avatarId: avatar.id,
          teamId: selectedTeamId,
        } as any);
      };
      const onDisconnect = () => setIsSocketConnected(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      if (socket.connected) onConnect();

      // Listen for player-joined updates (team mode sync and squad balance)
      socket.on('player-joined', (data: any) => {
        if (data?.gameMode === 'team') setIsTeamMode(true);
        if (Array.isArray(data?.teamLeaderboard)) setTeamLeaderboard(data.teamLeaderboard);
        if (data?.player && (data.player.id === socket.id || data.player.name?.trim().toLowerCase() === studentName.trim().toLowerCase())) {
          if (data.player.teamId) setSelectedTeamId(data.player.teamId);
        }
      });

      // Listen for session status updates from host (case-insensitive check for 'playing' / 'PLAYING')
      socket.on('session-status', (data: any) => {
        const statusStr = typeof data?.status === 'string' ? data.status.toLowerCase() : '';
        if (statusStr === 'playing' && phaseRef.current === 'waiting') {
          // Instructor launched session - transition immediately to Question 1!
          activateQuestion(0);
        } else if (statusStr === 'finished' || statusStr === 'completed') {
          setPhase('ended');
          triggerVictoryPodiumCelebration();
        }
      });

      // Listen for question dispatched by host
      socket.on('question-started', (data: any) => {
        if (data?.question) {
          const rawOpts = Array.isArray(data.question.options)
            ? data.question.options.map((o: any) => (typeof o === 'string' ? o : o.text || ''))
            : ['Option A', 'Option B'];

          // Strictly filter out blank options
          const nonBlank = rawOpts.filter((o: string) => o && o.trim().length > 0);
          const finalOpts = nonBlank.length >= 2 ? nonBlank : rawOpts;

          const qIdx = data.questionIndex ?? 0;
          currentIdxRef.current = qIdx;

          const remainingSeconds = typeof data.remaining === 'number'
            ? data.remaining
            : (data.timeLimit || 30);

          setCurrentQuestion({
            id: data.question.id,
            type: data.question.type,
            questionType: data.question.questionType || data.question.type,
            index: qIdx + 1,
            total: data.totalQuestions || quizQuestionsRef.current.length || 1,
            text: data.question.text,
            options: finalOpts,
            timeLimit: data.timeLimit || 30,
            points: data.question.points || 1000,
          });
          setSecondsRemaining(remainingSeconds);

          // Restore submission if player already locked answer before refresh
          const subKey = `alix_sub_${sessionId}_q${qIdx}`;
          const existingSub = sessionStorage.getItem(subKey);
          if (existingSub !== null) {
            if (existingSub.includes(',')) {
              setSelectedIndices(existingSub.split(',').map(Number));
            } else {
              setSelectedIndex(Number(existingSub));
            }
            setPhase('submitted');
          } else {
            setSelectedIndex(null);
            setSelectedIndices([]);
            setPhase('answering');
          }
        }
      });

      // Listen for server / host timer ticks (Strict Teacher Source-of-Truth)
      socket.on('timer-tick', (data: any) => {
        if (typeof data.remaining === 'number') {
          setSecondsRemaining(data.remaining);
          if (data.remaining <= 0) {
            setPhase((prev) => (prev === 'answering' || prev === 'submitted' ? 'score' : prev));
          }
        }
      });

      // Listen for errors (such as room already closed / finished)
      socket.on('error', (err: any) => {
        console.warn('[ALIX Student Play Error]:', err);
        if (err?.code === 'SESSION_NOT_FOUND' || err?.code === 'SESSION_FINISHED') {
          setPhase('ended');
        }
      });

      // Listen for answer verification from server
      socket.on('answer-result', (data: any) => {
        setPhase('score');
        const correct = !!data.correct;
        setIsLastAnswerCorrect(correct);
        setLastPointsAwarded(data.points || 0);

        if (typeof data.totalScore === 'number') {
          setScore(data.totalScore);
          try { sessionStorage.setItem(`alix_score_${sessionId}`, data.totalScore.toString()); } catch {}
        }
        if (correct) {
          const newStreak = data.streak ?? (streak + 1);
          setStreak(newStreak);
          try { sessionStorage.setItem(`alix_streak_${sessionId}`, newStreak.toString()); } catch {}
          triggerCorrectAnswerConfetti();
          if (newStreak >= 3) {
            setTimeout(() => triggerStreakBurst(), 400);
          }
        } else {
          setStreak(0);
          try { sessionStorage.setItem(`alix_streak_${sessionId}`, '0'); } catch {}
        }
      });

      // Listen for host presenting the live leaderboard
      socket.on('show-leaderboard', (data: any) => {
        if (data?.gameMode === 'team') setIsTeamMode(true);
        if (Array.isArray(data?.teamLeaderboard)) {
          setTeamLeaderboard(data.teamLeaderboard);
        }
        if (Array.isArray(data?.leaderboard)) {
          setLeaderboardList(data.leaderboard);
        }
        setPhase('leaderboard');
      });

      // Listen for leaderboard update (periodic score tabulation)
      socket.on('leaderboard-update', (data: any) => {
        if (data?.gameMode === 'team') setIsTeamMode(true);
        if (Array.isArray(data?.teamLeaderboard)) {
          setTeamLeaderboard(data.teamLeaderboard);
        }
        if (Array.isArray(data?.leaderboard)) {
          setLeaderboardList(data.leaderboard);
        }
      });

      // Listen for game end
      socket.on('game-ended', (data: any) => {
        if (data?.gameMode === 'team') setIsTeamMode(true);
        if (Array.isArray(data?.teamLeaderboard)) {
          setTeamLeaderboard(data.teamLeaderboard);
        }
        if (Array.isArray(data?.finalLeaderboard)) {
          setLeaderboardList(data.finalLeaderboard);
        }
        setPhase('ended');
        triggerVictoryPodiumCelebration();
      });

      // Listen for team configuration updates from host
      socket.on('teams-updated', (data: any) => {
        if (Array.isArray(data?.teams)) setCustomTeams(data.teams);
        if (typeof data?.maxMembersPerTeam === 'number') setMaxMembersPerTeam(data.maxMembersPerTeam);
        if (Array.isArray(data?.teamLeaderboard)) setTeamLeaderboard(data.teamLeaderboard);
      });

      // Listen for Mazur Peer Instruction round trigger
      socket.on('peer-instruction-started', (data: any) => {
        setIsPeerInstruction(true);
        setPeerTimer(data?.duration || 45);
      });

      // Listen for AI Concept Flashcard broadcast
      socket.on('concept-card-received', (data: any) => {
        if (data?.concept) setReceivedConcept(data.concept);
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('session-status');
        socket.off('question-started');
        socket.off('timer-tick');
        socket.off('answer-result');
        socket.off('show-leaderboard');
        socket.off('leaderboard-update');
        socket.off('game-ended');
        socket.off('error');
      };
    } catch {
      // fallback
    }
  }, [sessionId, studentName, rollNo, avatar.id, score, streak]);

  // Real-time countdown timer when answering or submitted
  useEffect(() => {
    if (phase !== 'answering' && phase !== 'submitted') return;
    if (secondsRemaining <= 0) {
      setPhase('score');
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, phase, isLastAnswerCorrect, lastPointsAwarded, streak, sessionId]);

  const isMultiSelect =
    (currentQuestion as any).type === 'MULTI_SELECT' ||
    (currentQuestion as any).questionType === 'multi_select';

  const isPoll =
    (currentQuestion as any).type === 'POLL' ||
    (currentQuestion as any).questionType === 'poll';

  const activeSquadList = customTeams && customTeams.length > 0 ? customTeams : DEFAULT_SQUADS;
  const currentSquad = activeSquadList.find((s: any) => s.id === selectedTeamId) || activeSquadList[0];

  useEffect(() => {
    if (!isPeerInstruction || peerTimer <= 0) return;
    const interval = setInterval(() => {
      setPeerTimer((prev) => {
        if (prev <= 1) {
          setIsPeerInstruction(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPeerInstruction, peerTimer]);

  const handleSwitchTeam = (tId: string) => {
    if (maxMembersPerTeam > 0) {
      const standing = teamLeaderboard.find((t: any) => t.teamId === tId);
      if (standing && standing.memberCount >= maxMembersPerTeam && tId !== selectedTeamId) {
        alert(`This squad is full (Capacity: ${maxMembersPerTeam} members). Please select another squad!`);
        return;
      }
    }
    setSelectedTeamId(tId);
    try {
      const socket = getSocket();
      socket.emit('select-team', {
        code: sessionId || '842915',
        teamId: tId,
      });
    } catch {}
  };

  // Multi-Select Option Toggle
  const handleToggleMultiOption = (idx: number) => {
    if (phase !== 'answering') return;
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx].sort()
    );
  };

  // Multi-Select Final Submission
  const handleSubmitMultiAnswer = () => {
    if (phase !== 'answering' || selectedIndices.length === 0) return;
    setPhase('submitted');

    try {
      sessionStorage.setItem(`alix_sub_${sessionId}_q${currentIdxRef.current}`, selectedIndices.join(','));
    } catch {}

    const timeSpentMs = Math.max(
      100,
      ((currentQuestion.timeLimit || 30) - secondsRemaining) * 1000
    );

    try {
      const socket = getSocket();
      socket.emit('submit-answer', {
        sessionId: sessionId || '842915',
        questionId: currentQuestion.id || 'q-01',
        answer: selectedIndices.join(','),
        timeMs: timeSpentMs,
      });
    } catch {}

    setIsLastAnswerCorrect(false);
    setLastPointsAwarded(0);
  };

  // Student selects a single option
  const handleSelectOption = (idx: number) => {
    if (selectedIndex !== null || phase !== 'answering') return;
    setSelectedIndex(idx);
    setPhase('submitted');

    // Save choice to session storage to persist across student refreshes
    try {
      sessionStorage.setItem(`alix_sub_${sessionId}_q${currentIdxRef.current}`, idx.toString());
    } catch {}

    const timeSpentMs = Math.max(
      100,
      ((currentQuestion.timeLimit || 30) - secondsRemaining) * 1000
    );

    try {
      const socket = getSocket();
      socket.emit('submit-answer', {
        sessionId: sessionId || '842915',
        questionId: currentQuestion.id || 'q-01',
        answer: idx.toString(),
        timeMs: timeSpentMs,
      });
    } catch {
      // quiet
    }

    // Server answer-result event will provide authoritative correctness and score
    setIsLastAnswerCorrect(false);
    setLastPointsAwarded(0);
  };

  // Exit session and clear cached session storage
  const handleExitSession = () => {
    try {
      sessionStorage.removeItem(`alix_score_${sessionId}`);
      sessionStorage.removeItem(`alix_streak_${sessionId}`);
      for (let i = 0; i < 50; i++) {
        sessionStorage.removeItem(`alix_sub_${sessionId}_q${i}`);
      }
    } catch {}
    navigate('/join');
  };

  const myEntry = leaderboardList.find(
    (p: any) =>
      (rollNo && p.rollNo && p.rollNo.toUpperCase() === rollNo.toUpperCase()) ||
      p.playerName?.trim().toLowerCase() === studentName.trim().toLowerCase()
  );
  const myRank = myEntry?.rank ?? 1;
  const myDisplayScore = typeof myEntry?.score === 'number' ? myEntry.score : score;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#46178F] via-[#350F6E] to-[#1E0938] text-white select-none relative overflow-hidden">
      {/* Subtle backdrop glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-alix-cyan-400/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Top Session Bar */}
      <header className="sticky top-0 z-30 bg-black/25 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 group">
            <AlixLogo variant="white" size="sm" showEduBadge={true} />
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-white/15">
            {/* Mascot Avatar Portrait */}
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${avatar.bgGradient} flex items-center justify-center shadow-sm border border-white/30 p-0.5`}
              title={`${avatar.name} (${avatar.title})`}
            >
              <RenderAvatarSvg avatarId={avatar.id} size={24} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xs sm:text-sm text-white leading-tight truncate max-w-[130px]">
                  {studentName}
                </span>
                {isTeamMode && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${currentSquad.badge} flex items-center gap-1 shadow-sm`}>
                    <span>{currentSquad.icon}</span>
                    <span className="hidden xs:inline">{currentSquad.name}</span>
                  </span>
                )}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-alix-cyan-300 inline-flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>PIN {sessionId}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Score Counter Pill */}
        <div className="flex items-center gap-2.5">
          {streak > 1 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black shadow-md animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak}x Streak</span>
            </div>
          )}

          <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-black tracking-wider shadow-inner flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-mono text-white text-sm">{score.toLocaleString()}</span>
            <span className="text-[10px] text-white/70">PTS</span>
          </div>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto p-4 sm:p-6 z-10">
        {/* Phase: Waiting in Lobby */}
        {phase === 'waiting' && (
          <div className="text-center max-w-md mx-auto space-y-6 animate-scale-in py-8">
            <div className="relative inline-block">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr ${avatar.bgGradient} flex items-center justify-center mx-auto shadow-2xl ring-4 ring-white/20 p-2 animate-bounce`}
              >
                <RenderAvatarSvg avatarId={avatar.id} size={72} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <CheckCircle2 className="w-5 h-5 stroke-[3]" />
              </div>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-alix-cyan-300 text-xs font-black tracking-wider uppercase inline-block mb-2 border border-white/15">
                Connected to Classroom
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
                You're in, {studentName}!
              </h2>
              <p className="text-xs sm:text-sm text-white/75 font-medium mt-1.5 leading-relaxed">
                See your name on the classroom projector screen? Questions will appear here as soon as the instructor launches the session!
              </p>
            </div>

            {/* Team / Squad Selector (When Team Mode is enabled) */}
            {isTeamMode && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md text-left space-y-3 animate-fade-in shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <span>👥</span>
                    <span>Your Squad:</span>
                  </div>
                  <span className="text-[10px] text-white/60">Tap to change squad</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {activeSquadList.map((sq: any) => {
                    const isSelected = selectedTeamId === sq.id;
                    const standing = teamLeaderboard.find((t: any) => t.teamId === sq.id);
                    const memberCount = standing?.memberCount || 0;
                    const isFull = maxMembersPerTeam > 0 && memberCount >= maxMembersPerTeam && !isSelected;

                    return (
                      <button
                        key={sq.id}
                        type="button"
                        onClick={() => !isFull && handleSwitchTeam(sq.id)}
                        disabled={isFull}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2 ${
                          isFull
                            ? 'border-white/5 bg-black/40 opacity-40 cursor-not-allowed'
                            : isSelected
                            ? `${sq.border} ${sq.bg} ring-2 ring-white/50 shadow-lg scale-[1.02] cursor-pointer`
                            : 'border-white/10 bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100 cursor-pointer'
                        }`}
                      >
                        <span className="text-xl shrink-0">{sq.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>
                            {sq.name}
                          </div>
                          <div className="text-[9px] font-bold text-white/50 flex items-center justify-between">
                            <span>
                              {isFull ? 'FULL' : isSelected ? '✓ Your Squad' : 'Join'}
                            </span>
                            {maxMembersPerTeam > 0 && (
                              <span className="font-mono text-cyan-300">
                                {memberCount}/{maxMembersPerTeam}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xl flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-alix-cyan-400">
                  <Wifi className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Room PIN: {sessionId}</div>
                  <div className="text-[11px] text-white/60">
                    {rollNo ? `Roll No: ${rollNo}` : 'Verified Participant'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Ready</span>
              </div>
            </div>
          </div>
        )}

        {/* Phase: Answering Question */}
        {phase === 'answering' && (
          <div className="w-full space-y-4 animate-scale-in">
            {/* Header: Progress & Timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black text-white tracking-wider">
                  Question {currentQuestion.index} of {currentQuestion.total}
                </span>
                {isTeamMode && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${currentSquad.badge} flex items-center gap-1 shadow-md`}>
                    <span>{currentSquad.icon}</span>
                    <span className="hidden xs:inline">{currentSquad.name}</span>
                  </span>
                )}
              </div>
              <Countdown
                secondsRemaining={secondsRemaining}
                totalSeconds={currentQuestion.timeLimit}
                size="md"
              />
            </div>

            {/* Prompt Banner */}
            <div className="bg-white text-slate-900 rounded-2xl border-2 border-white/30 p-5 sm:p-7 shadow-2xl text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black leading-tight">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Question Format Indicators */}
            {isMultiSelect && (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-200 text-center flex items-center justify-center gap-2 animate-pulse">
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Select: Choose all answers that apply, then press Submit</span>
              </div>
            )}
            {isPoll && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-200 text-center flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Opinion Poll: Cast your vote, no right or wrong answers!</span>
              </div>
            )}

            {/* Kahoot Tactile Options Grid (strictly filters out blank cards) */}
            <div
              className={`grid gap-3 sm:gap-4 pt-1 ${
                currentQuestion.options.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {currentQuestion.options.map((opt, idx) => (
                <OptionButton
                  key={idx}
                  index={idx}
                  text={opt}
                  selected={isMultiSelect ? selectedIndices.includes(idx) : selectedIndex === idx}
                  disabled={isMultiSelect ? phase !== 'answering' : selectedIndex !== null}
                  onClick={() => {
                    if (isMultiSelect) {
                      handleToggleMultiOption(idx);
                    } else {
                      handleSelectOption(idx);
                    }
                  }}
                />
              ))}
            </div>

            {/* Multi-Select Submit Button */}
            {isMultiSelect && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleSubmitMultiAnswer}
                  disabled={selectedIndices.length === 0}
                  className={`w-full max-w-md py-4 px-6 rounded-2xl font-heading font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedIndices.length === 0
                      ? 'bg-slate-700/60 text-slate-400 border border-slate-600 cursor-not-allowed opacity-60'
                      : 'bg-[#26890C] hover:bg-[#20740A] border-b-4 border-[#175407] active:border-b-0 active:translate-y-1 text-white shadow-emerald-950/60'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    {selectedIndices.length === 0
                      ? 'Select Option(s) to Submit'
                      : `Submit Answer (${selectedIndices.length} Selected)`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phase: Submitted Answer */}
        {phase === 'submitted' && (
          <div className="text-center max-w-md mx-auto space-y-5 animate-scale-in py-10 px-4">
            <div className="w-20 h-20 rounded-3xl bg-white/10 text-alix-cyan-400 border border-white/20 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
                {isPoll ? 'Vote Recorded!' : 'Answer Locked!'}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-medium mt-1">
                {isPoll
                  ? 'Your opinion has been registered. Results will show live when the timer ends.'
                  : 'Hang tight! Solution breakdown will appear as soon as the timer closes.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-md text-sm font-heading font-black text-white flex items-center justify-between">
              <span>{isMultiSelect ? 'Selected Choices:' : 'Selected Choice:'}</span>
              <span className="px-3 py-1 rounded-lg bg-alix-cyan-400 text-slate-950 font-black truncate max-w-[200px]">
                {isMultiSelect
                  ? selectedIndices.map((i) => currentQuestion.options[i]).join(', ')
                  : currentQuestion.options[selectedIndex ?? 0] || `Option ${selectedIndex !== null ? selectedIndex + 1 : ''}`}
              </span>
            </div>
          </div>
        )}

        {/* Phase: Score Result Screen */}
        {phase === 'score' && (
          <div className="text-center max-w-md mx-auto space-y-5 animate-scale-in py-8">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border-2 ${
                isPoll
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : isLastAnswerCorrect
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40 animate-bounce'
                  : 'bg-rose-500/20 text-rose-400 border-rose-400/40'
              }`}
            >
              {isPoll ? (
                <BarChart3 className="w-10 h-10 stroke-[2.5]" />
              ) : isLastAnswerCorrect ? (
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              ) : (
                <Clock className="w-10 h-10 stroke-[2.5]" />
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
                {isPoll
                  ? 'Opinion Registered!'
                  : isLastAnswerCorrect
                  ? 'Correct! Outstanding!'
                  : 'Time Up / Incorrect'}
              </h2>
              <p className="text-xs text-white/70 mt-1">
                {isPoll
                  ? '+100 participation points earned for contributing!'
                  : isLastAnswerCorrect
                  ? `+${lastPointsAwarded.toLocaleString()} points earned! Streak: ${streak}x 🔥`
                  : 'Check the solution breakdown on the main lecture screen.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xl">
              <span className="text-[11px] font-black uppercase tracking-widest text-alix-cyan-300">
                Your Total Score
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-white mt-1">
                {score.toLocaleString()} <span className="text-xs text-white/60">PTS</span>
              </div>
            </div>

            {/* Teacher Synchronized Wait Banner */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center gap-3 text-xs sm:text-sm font-black text-white/95 shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-alix-cyan-400 animate-ping shrink-0" />
              <span>Waiting for instructor to present next question...</span>
            </div>
          </div>
        )}

        {/* Phase: Live Round Leaderboard */}
        {phase === 'leaderboard' && (
          <div className="text-center max-w-md mx-auto space-y-4 animate-scale-in py-4 px-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Standings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
                Classroom Leaderboard
              </h2>
              <p className="text-xs text-white/70">
                Question {currentQuestion.index || 1} of {currentQuestion.total || 1} Standings
              </p>
            </div>

            {/* My Rank Highlight Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-600/40 to-cyan-600/40 border border-cyan-400/30 backdrop-blur-md shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 flex items-center justify-center shadow-md">
                  <RenderAvatarSvg avatarId={avatar.id} size={36} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-cyan-200">Your Standing</div>
                  <div className="text-base font-heading font-black text-white">
                    Rank #{myRank} <span className="text-xs text-white/60 font-normal">of {leaderboardList.length || 1}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-black text-amber-300">
                  {myDisplayScore.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-white/60 uppercase">PTS</div>
              </div>
            </div>

            {/* Team / Squad Standings (When Team Mode is Active) */}
            {isTeamMode && teamLeaderboard.length > 0 && (
              <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/15 p-3 space-y-2 text-left">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center justify-between px-1">
                  <span className="flex items-center gap-1.5">
                    <span>👥</span>
                    <span>Squad Standings</span>
                  </span>
                  <span className="text-[10px] text-white/50">Combined Score</span>
                </div>
                <div className="space-y-1.5">
                  {teamLeaderboard.map((t, tIdx) => {
                    const isMyTeam = t.teamId === selectedTeamId;
                    return (
                      <div
                        key={t.teamId || tIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          isMyTeam
                            ? 'bg-white/15 border-amber-400 ring-2 ring-amber-300/40 shadow-md'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-black/40 text-white font-mono text-[10px] font-black flex items-center justify-center">
                            #{t.rank || tIdx + 1}
                          </span>
                          <span className="text-lg">{t.icon || '🛡️'}</span>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-1">
                              <span>{t.teamName}</span>
                              {isMyTeam && (
                                <span className="text-[9px] bg-amber-400 text-slate-900 font-black px-1.5 rounded">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-white/60">{t.memberCount} players</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-black text-amber-300">
                            {t.score.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-white/50">PTS</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Standings List */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-3 divide-y divide-white/10 text-left space-y-1 max-h-60 overflow-y-auto">
              {leaderboardList.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/60">
                  Tabulating latest scores from classroom...
                </div>
              ) : (
                leaderboardList.slice(0, 5).map((p: any, idx: number) => {
                  const isMe =
                    (rollNo && p.rollNo && p.rollNo.toUpperCase() === rollNo.toUpperCase()) ||
                    p.playerName?.trim().toLowerCase() === studentName.trim().toLowerCase();
                  const rankNum = p.rank || idx + 1;
                  return (
                    <div
                      key={p.playerId || idx}
                      className={`py-2 px-2.5 rounded-xl flex items-center justify-between transition-all ${
                        isMe
                          ? 'bg-alix-cyan-500/20 border border-alix-cyan-400/50 shadow-sm'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            rankNum === 1
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : rankNum === 2
                              ? 'bg-slate-300 text-slate-950 font-black'
                              : rankNum === 3
                              ? 'bg-amber-600 text-white font-black'
                              : 'bg-white/10 text-white/80'
                          }`}
                        >
                          {rankNum === 1 ? '1' : rankNum === 2 ? '2' : rankNum === 3 ? '3' : rankNum}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span className="truncate max-w-[130px]">{p.playerName}</span>
                            {isMe && (
                              <span className="px-1.5 py-0.5 rounded bg-alix-cyan-400 text-slate-950 text-[10px] font-black uppercase">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-alix-cyan-300">
                        {(p.score ?? 0).toLocaleString()} pts
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Waiting for Next Question Banner */}
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center gap-2.5 text-xs font-bold text-white/90 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-alix-cyan-400 animate-ping shrink-0" />
              <span>Waiting for instructor to present next question...</span>
            </div>
          </div>
        )}

        {/* Phase: Final Session Concluded */}
        {phase === 'ended' && (
          <div className="text-center max-w-md mx-auto space-y-5 animate-scale-in py-6 px-3">
            <div className="relative inline-block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 flex items-center justify-center mx-auto shadow-2xl ring-4 ring-amber-400/50 animate-bounce">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950 fill-current" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Session Concluded</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
                Game Over, {studentName}!
              </h2>
              <p className="text-xs text-white/75 mt-1 font-medium">
                The live classroom round has ended. Here is your final summary!
              </p>
            </div>

            {/* Team Mode Final Championship Card */}
            {isTeamMode && teamLeaderboard.length > 0 && (() => {
              const winningTeam = teamLeaderboard[0];
              const isMyTeamWinner = winningTeam?.teamId === selectedTeamId;
              const myTeamEntry = teamLeaderboard.find((t) => t.teamId === selectedTeamId);
              return (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 backdrop-blur-md shadow-2xl text-center space-y-2 ${
                    isMyTeamWinner
                      ? 'bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 border-amber-400 ring-2 ring-amber-300/40'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-300 fill-current" />
                    <span>{isMyTeamWinner ? 'VICTORY! YOUR SQUAD WON 1ST PLACE!' : `Winning Squad: ${winningTeam.teamName}`}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white flex items-center justify-center gap-2">
                    <span className="text-3xl">{winningTeam.icon || '🏆'}</span>
                    <span>{winningTeam.teamName}</span>
                  </div>
                  <div className="font-mono text-sm text-amber-200">
                    {winningTeam.score.toLocaleString()} Team PTS • {winningTeam.memberCount} Teammates
                  </div>
                  {!isMyTeamWinner && myTeamEntry && (
                    <div className="pt-2 text-xs text-white/80 border-t border-white/10 flex items-center justify-between">
                      <span>Your Squad ({myTeamEntry.teamName}):</span>
                      <span className="font-bold text-amber-300">
                        Rank #{myTeamEntry.rank} ({myTeamEntry.score.toLocaleString()} pts)
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Final Achievement & Rank Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-md">
                    <RenderAvatarSvg avatarId={avatar.id} size={42} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-cyan-200">Final Placement</div>
                    <div className="text-lg font-heading font-black text-white flex items-center gap-1.5">
                      {myRank === 1 ? (
                        <span className="text-amber-300">🥇 1st Place Champion!</span>
                      ) : myRank === 2 ? (
                        <span className="text-slate-200">🥈 2nd Place Runner-Up</span>
                      ) : myRank === 3 ? (
                        <span className="text-amber-500">🥉 3rd Place Bronze</span>
                      ) : (
                        <span>Rank #{myRank} of {leaderboardList.length || 1}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-black/20 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Final Score</div>
                  <div className="text-2xl font-mono font-black text-white mt-0.5">
                    {myDisplayScore.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-white/50">PTS</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">Max Streak</div>
                  <div className="text-2xl font-mono font-black text-white mt-0.5">
                    {streak}x
                  </div>
                  <div className="text-[10px] text-white/50">STREAK 🔥</div>
                </div>
              </div>
            </div>

            {/* Podium / Final Standings List */}
            {leaderboardList.length > 0 && (
              <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-3 divide-y divide-white/10 text-left space-y-1 max-h-52 overflow-y-auto">
                <div className="text-[11px] font-black uppercase tracking-wider text-white/60 px-2 py-1">
                  Classroom Standings
                </div>
                {leaderboardList.slice(0, 5).map((p: any, idx: number) => {
                  const isMe =
                    (rollNo && p.rollNo && p.rollNo.toUpperCase() === rollNo.toUpperCase()) ||
                    p.playerName?.trim().toLowerCase() === studentName.trim().toLowerCase();
                  const rankNum = p.rank || idx + 1;
                  return (
                    <div
                      key={p.playerId || idx}
                      className={`py-2 px-2.5 rounded-xl flex items-center justify-between ${
                        isMe
                          ? 'bg-alix-cyan-500/20 border border-alix-cyan-400/50'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            rankNum === 1
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : rankNum === 2
                              ? 'bg-slate-300 text-slate-950 font-black'
                              : rankNum === 3
                              ? 'bg-amber-600 text-white font-black'
                              : 'bg-white/10 text-white/80'
                          }`}
                        >
                          {rankNum}
                        </span>
                        <span className="text-sm font-bold text-white truncate max-w-[140px]">
                          {p.playerName}
                          {isMe && <span className="ml-1 text-[10px] text-cyan-300 font-normal">(You)</span>}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        {(p.score ?? 0).toLocaleString()} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Exit Session Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExitSession}
                className="w-full py-4 rounded-2xl bg-alix-cyan-400 hover:bg-alix-cyan-300 text-slate-950 font-heading font-black text-base shadow-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Leave Session & Join Another</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Reaction Stream */}
      <ReactionStream />

      {/* Mazur Peer Discussion Active Notification Banner */}
      {isPeerInstruction && (
        <div className="fixed top-16 left-4 right-4 z-40 max-w-lg mx-auto p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-2xl border-2 border-white/30 animate-bounce">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🤝</span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                  Active Learning • Peer Discussion Round
                </div>
                <div className="text-xs font-black text-white">
                  Turn to your squad! Debate your choice and prepare to revote.
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black/40 font-mono font-black text-lg text-amber-300">
              {peerTimer}s
            </div>
          </div>
        </div>
      )}

      {/* AI Pedagogical Concept Flashcard Broadcast Modal */}
      {receivedConcept && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-gradient-to-br from-[#1E0938] via-[#2D1050] to-[#120422] rounded-3xl border-2 border-cyan-400/40 p-6 text-white shadow-2xl space-y-4 animate-scale-in text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    Teacher Broadcasted Concept
                  </span>
                  <h3 className="font-heading font-black text-sm text-white">
                    AI Pedagogical Flashcard
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceivedConcept(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Core Principle</span>
                </div>
                <p className="text-white/80 leading-relaxed font-medium">
                  {receivedConcept.takeaway}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Misconception (Cognitive Trap)</span>
                </div>
                <p className="text-white/80 leading-relaxed font-medium">
                  {receivedConcept.trap}
                </p>
              </div>

              {receivedConcept.formula && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Memory Anchor</span>
                  </div>
                  <p className="text-white/80 leading-relaxed font-medium">
                    {receivedConcept.formula}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setReceivedConcept(null)}
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              Got It, Save To My Flashcards ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayPage;