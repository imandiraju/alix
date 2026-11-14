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
  Clock,
  Wifi,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface ActiveQuestion {
  id?: string;
  index: number;
  total: number;
  text: string;
  options: string[];
  timeLimit: number;
}

export const PlayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get('name') || 'Learner';
  const rollNo = searchParams.get('rollNo') || '';
  const avatarId = searchParams.get('avatar') || 'fox';
  const urlQuizId = searchParams.get('quizId') || '';
  const avatar = getAvatarById(avatarId);

  // Game Phases: 'waiting' | 'answering' | 'submitted' | 'score' | 'leaderboard' | 'ended'
  const [phase, setPhase] = useState<'waiting' | 'answering' | 'submitted' | 'score' | 'leaderboard' | 'ended'>('waiting');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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
        index: idx + 1,
        total: questionsList.length || 1,
        text: q.text,
        options: finalOpts,
        timeLimit: q.timeLimit || 30,
      });
      setSecondsRemaining(q.timeLimit || 30);
      setSelectedIndex(null);
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
        } as any);
      };
      const onDisconnect = () => setIsSocketConnected(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      if (socket.connected) onConnect();

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
            index: qIdx + 1,
            total: data.totalQuestions || quizQuestionsRef.current.length || 1,
            text: data.question.text,
            options: finalOpts,
            timeLimit: data.timeLimit || 30,
          });
          setSecondsRemaining(remainingSeconds);

          // Restore submission if player already locked answer before refresh
          const subKey = `alix_sub_${sessionId}_q${qIdx}`;
          const existingSub = sessionStorage.getItem(subKey);
          if (existingSub !== null) {
            setSelectedIndex(Number(existingSub));
            setPhase('submitted');
          } else {
            setSelectedIndex(null);
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
        if (Array.isArray(data?.leaderboard)) {
          setLeaderboardList(data.leaderboard);
        }
        setPhase('leaderboard');
      });

      // Listen for leaderboard update (periodic score tabulation)
      socket.on('leaderboard-update', (data: any) => {
        if (Array.isArray(data?.leaderboard)) {
          setLeaderboardList(data.leaderboard);
        }
      });

      // Listen for game end
      socket.on('game-ended', (data: any) => {
        if (Array.isArray(data?.finalLeaderboard)) {
          setLeaderboardList(data.finalLeaderboard);
        }
        setPhase('ended');
        triggerVictoryPodiumCelebration();
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

  // Student selects an option
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
            <span className="font-heading font-black text-lg text-white">ALIX</span>
            <span className="text-alix-cyan-400 font-black text-lg">!</span>
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
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black text-white tracking-wider">
                Question {currentQuestion.index} of {currentQuestion.total}
              </span>
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
                  selected={selectedIndex === idx}
                  disabled={selectedIndex !== null}
                  onClick={() => handleSelectOption(idx)}
                />
              ))}
            </div>
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
                Answer Locked!
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-medium mt-1">
                Hang tight! Results will appear as soon as the timer closes.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-md text-sm font-heading font-black text-white flex items-center justify-between">
              <span>Selected Choice:</span>
              <span className="px-3 py-1 rounded-lg bg-alix-cyan-400 text-slate-950 font-black">
                {currentQuestion.options[selectedIndex ?? 0] ||
                  `Option ${String.fromCharCode(65 + (selectedIndex ?? 0))}`}
              </span>
            </div>
          </div>
        )}

        {/* Phase: Score Result Screen */}
        {phase === 'score' && (
          <div className="text-center max-w-md mx-auto space-y-5 animate-scale-in py-8">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border-2 ${
                isLastAnswerCorrect
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40 animate-bounce'
                  : 'bg-rose-500/20 text-rose-400 border-rose-400/40'
              }`}
            >
              {isLastAnswerCorrect ? (
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              ) : (
                <Clock className="w-10 h-10 stroke-[2.5]" />
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
                {isLastAnswerCorrect ? 'Correct! Outstanding!' : 'Time Up / Incorrect'}
              </h2>
              <p className="text-xs text-white/70 mt-1">
                {isLastAnswerCorrect
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
    </div>
  );
};

export default PlayPage;