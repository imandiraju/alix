import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import QuestionCard from '../components/game/QuestionCard';
import OptionButton from '../components/game/OptionButton';
import Countdown from '../components/game/Countdown';
import ScorePopup from '../components/game/ScorePopup';
import Leaderboard from '../components/game/Leaderboard';
import ReactionStream from '../components/game/ReactionStream';
import { getAvatarById } from '../components/game/AlixAvatars';
import { RenderAvatarSvg } from '../components/game/AlixSvgAvatars';
import { getSocket } from '../services/socket';
import {
  triggerCorrectAnswerConfetti,
  triggerStreakBurst,
} from '../components/game/CelebrationEffects';
import { Trophy, Flame, User, LogOut, CheckCircle2, Clock, Wifi, Sparkles } from 'lucide-react';

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
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get('name') || 'Learner';
  const rollNo = searchParams.get('rollNo') || '';
  const avatarId = searchParams.get('avatar') || 'fox';
  const avatar = getAvatarById(avatarId);

  // Game Phases: 'waiting' | 'answering' | 'submitted' | 'score' | 'leaderboard'
  const [phase, setPhase] = useState<'waiting' | 'answering' | 'submitted' | 'score' | 'leaderboard'>('waiting');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
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

  useEffect(() => {
    try {
      const socket = getSocket();
      const onConnect = () => {
        setIsSocketConnected(true);
        socket.emit('join-session', {
          code: sessionId || '842915',
          playerName: studentName,
          rollNo: rollNo || undefined,
        } as any);
      };
      const onDisconnect = () => setIsSocketConnected(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      if (socket.connected) onConnect();

      // Listen for session status updates
      socket.on('session-status', (data: any) => {
        if (data.status === 'playing' && phase === 'waiting') {
          // Instructor launched session - preparing to receive question
        }
      });

      // Listen for question dispatched by host
      socket.on('question-started', (data: any) => {
        if (data.question) {
          const rawOpts = Array.isArray(data.question.options)
            ? data.question.options.map((o: any) => (typeof o === 'string' ? o : o.text || ''))
            : ['Option A', 'Option B', 'Option C', 'Option D'];

          // Filter out blank options (e.g. True/False questions where options 3 & 4 were left blank)
          const nonBlank = rawOpts.filter((o: string) => o && o.trim().length > 0);
          const finalOpts = nonBlank.length >= 2 ? nonBlank : rawOpts;

          setCurrentQuestion({
            id: data.question.id,
            index: (data.questionIndex ?? 0) + 1,
            total: data.totalQuestions || 1,
            text: data.question.text,
            options: finalOpts,
            timeLimit: data.timeLimit || 30,
          });
          setSecondsRemaining(data.timeLimit || 30);
          setSelectedIndex(null);
          setPhase('answering');
        }
      });

      // Listen for timer ticks
      socket.on('timer-tick', (data: any) => {
        if (typeof data.remaining === 'number') {
          setSecondsRemaining(data.remaining);
        }
      });

      // Listen for errors
      socket.on('error', (err: any) => {
        console.warn('[ALIX Student Play Error]:', err);
      });

      // Listen for answer verification
      socket.on('answer-result', (data: any) => {
        setPhase('score');
        setIsLastAnswerCorrect(!!data.correct);
        setLastPointsAwarded(data.points || 0);

        if (data.correct) {
          setScore(data.totalScore ?? (score + data.points));
          const newStreak = (data.streak ?? (streak + 1));
          setStreak(newStreak);
          triggerCorrectAnswerConfetti();
          if (newStreak >= 3) {
            setTimeout(() => triggerStreakBurst(), 400);
          }
        } else {
          setStreak(0);
        }
      });

      // Listen for leaderboard update
      socket.on('leaderboard-update', (data: any) => {
        if (data.leaderboard) {
          setLeaderboardList(data.leaderboard);
        }
      });

      // Listen for game end
      socket.on('game-ended', (data: any) => {
        if (data.finalLeaderboard) {
          setLeaderboardList(data.finalLeaderboard);
        }
        setPhase('leaderboard');
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('question-started');
        socket.off('timer-tick');
        socket.off('answer-result');
        socket.off('leaderboard-update');
        socket.off('game-ended');
      };
    } catch {
      // fallback
    }
  }, [sessionId, studentName, score, streak]);

  // Fallback countdown when answering
  useEffect(() => {
    if (phase !== 'answering') return;
    if (secondsRemaining <= 0) {
      setPhase('score');
      return;
    }
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, phase]);

  const handleSelectOption = (idx: number) => {
    if (selectedIndex !== null || phase !== 'answering') return;
    setSelectedIndex(idx);
    setPhase('submitted');

    try {
      const socket = getSocket();
      socket.emit('submit-answer', {
        sessionId: sessionId || '842915',
        questionId: currentQuestion.id || 'q-01',
        answer: idx.toString(),
        timeMs: Math.max(100, ((currentQuestion.timeLimit || 30) - secondsRemaining) * 1000),
      });
    } catch {
      // quiet
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-alix-slate-50 select-none relative">
      {/* Top Session Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-alix-slate-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <AlixLogo size="sm" iconOnly={true} />
          <div className="flex items-center gap-2">
            {/* Mascot Avatar Portrait */}
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatar.bgGradient} flex items-center justify-center shadow-sm border border-white ring-2 ring-alix-slate-200 p-0.5`}
              title={`${avatar.name} (${avatar.title})`}
            >
              <RenderAvatarSvg avatarId={avatar.id} size={28} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-sm text-alix-indigo leading-tight truncate max-w-[120px]">
                  {studentName}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-alix-violet-100 text-alix-violet-700 inline-flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>PIN {sessionId || 'Live'}</span>
                </span>
              </div>
              <div className="text-[10px] text-alix-slate-400 font-medium flex items-center gap-1.5">
                <span>{avatar.name}</span>
                {rollNo && (
                  <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {rollNo}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Score & Streak counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-alix-coral-50 border border-alix-coral-200 text-alix-coral-700 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-current text-alix-coral-500" />
            <span>{streak}x</span>
          </div>

          <div className="px-3 py-1 rounded-lg bg-alix-violet-50 border border-alix-violet-200 text-alix-violet-800 text-xs sm:text-sm font-mono font-bold">
            {score.toLocaleString()} pts
          </div>

          <Link
            to="/join"
            className="p-1.5 rounded-lg text-alix-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Leave Session"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Phase: Waiting for instructor */}
        {phase === 'waiting' && (
          <div className="text-center max-w-md mx-auto space-y-6 animate-fade-in py-12 px-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-alix-violet-600 to-alix-cyan-400 text-white flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-alix-indigo">
                You're in!
              </h2>
              <p className="text-sm sm:text-base text-alix-slate-500 font-semibold mt-2">
                See your nickname on screen?
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-alix-slate-200 shadow-md flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-alix-violet-600 to-alix-cyan-400 p-0.5 shadow-sm">
                <RenderAvatarSvg avatarId={avatar.id} size={36} />
              </div>
              <div className="text-left">
                <div className="font-heading font-black text-base text-alix-indigo">{studentName}</div>
                {rollNo && <div className="text-xs font-mono font-bold text-emerald-600">{rollNo}</div>}
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Room PIN: {sessionId}</span>
            </div>
          </div>
        )}

        {/* Phase: Answering */}
        {phase === 'answering' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in w-full max-w-2xl mx-auto">
            {/* Top Info Bar */}
            <div className="flex items-center justify-between px-1">
              <span className="px-3 py-1 rounded-full bg-alix-violet-100 text-alix-violet-800 text-xs font-black tracking-wider uppercase">
                Question {currentQuestion.index} of {currentQuestion.total}
              </span>
              <Countdown
                secondsRemaining={secondsRemaining}
                totalSeconds={currentQuestion.timeLimit}
                size="md"
              />
            </div>

            {/* Prompt Banner */}
            <div className="bg-white rounded-2xl border-2 border-alix-slate-200 p-5 sm:p-7 shadow-md text-center">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-alix-indigo leading-tight">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Kahoot 4-Color Tactile Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
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
          <div className="text-center max-w-md mx-auto space-y-5 animate-scale-in py-12 px-4">
            <div className="w-20 h-20 rounded-3xl bg-alix-indigo text-alix-cyan-400 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-alix-indigo">
                Answer Locked!
              </h2>
              <p className="text-sm text-alix-slate-500 font-medium mt-1">
                Hang tight! Results will appear on the projector when the timer expires.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border-2 border-alix-slate-200 shadow-md text-sm font-heading font-extrabold text-alix-indigo">
              Selected: Option {String.fromCharCode(65 + (selectedIndex ?? 0))}
            </div>
          </div>
        )}

        {/* Phase: Score Result Screen */}
        {phase === 'score' && (
          <div className="text-center max-w-md mx-auto space-y-5 animate-scale-in py-8">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
                isLastAnswerCorrect
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-rose-100 text-rose-600'
              }`}
            >
              {isLastAnswerCorrect ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8" />
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-alix-indigo">
              {isLastAnswerCorrect ? 'Correct! Outstanding!' : 'Time Up / Question Closed'}
            </h2>
            <p className="text-xs text-alix-slate-500">
              {isLastAnswerCorrect
                ? `You earned points for this round! Streak is now ${streak}x.`
                : 'Review the correct answer on the lecture hall screen.'}
            </p>
            <div className="p-4 rounded-2xl bg-white border border-alix-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-alix-slate-400">
                Current Total Score
              </span>
              <div className="text-3xl font-mono font-black text-alix-indigo mt-1">
                {score.toLocaleString()} pts
              </div>
            </div>
          </div>
        )}

        {/* Phase: Final Leaderboard */}
        {phase === 'leaderboard' && (
          <div className="text-center max-w-md mx-auto space-y-5 animate-fade-in py-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-alix-indigo">
              Round Complete!
            </h2>
            <p className="text-xs text-alix-slate-500">
              Final score: <strong className="text-alix-indigo font-mono">{score} pts</strong>
            </p>
            <Link
              to="/join"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Join Another Session</span>
            </Link>
          </div>
        )}
      </main>

      {/* Floating Reaction Stream */}
      <ReactionStream />
    </div>
  );
};

export default PlayPage;
