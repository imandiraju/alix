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
import { Trophy, Flame, User, LogOut, CheckCircle2, Clock, Wifi } from 'lucide-react';

export const PlayPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const studentName = searchParams.get('name') || 'Learner';
  const avatarId = searchParams.get('avatar') || 'fox';
  const avatar = getAvatarById(avatarId);

  // Game Phases: 'answering' | 'submitted' | 'score' | 'leaderboard'
  const [phase, setPhase] = useState<'answering' | 'submitted' | 'score' | 'leaderboard'>('answering');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(25);
  const [score, setScore] = useState(1840);
  const [streak, setStreak] = useState(3);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    try {
      const socket = getSocket();
      const onConnect = () => setIsSocketConnected(true);
      const onDisconnect = () => setIsSocketConnected(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      if (socket.connected) setIsSocketConnected(true);

      socket.emit('join-session', {
        code: sessionId || '842915',
        playerName: studentName,
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
      };
    } catch {
      // fallback
    }
  }, [sessionId, studentName]);

  const sampleQuestion = {
    index: 3,
    total: 10,
    text: 'In distributed consensus protocols (e.g., Raft), what is the minimum number of nodes required to tolerate 2 node crash failures?',
    options: [
      '3 nodes',
      '5 nodes (2f + 1)',
      '7 nodes',
      '4 nodes',
    ],
    correctIndex: 1,
  };

  // Timer countdown simulation
  useEffect(() => {
    if (phase !== 'answering') return;
    if (secondsRemaining <= 0) {
      handleTimeUp();
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
        questionId: 'q-03',
        answer: idx.toString(),
        timeMs: Math.max(100, (25 - secondsRemaining) * 1000),
      });
    } catch {
      // fallback
    }

    // Simulate host closing question after 2 seconds
    setTimeout(() => {
      setPhase('score');
      const isCorrect = idx === sampleQuestion.correctIndex;
      if (isCorrect) {
        setScore((prev) => prev + 1280);
        const newStreak = streak + 1;
        setStreak(newStreak);

        // Auto trigger festive celebration confetti!
        triggerCorrectAnswerConfetti();
        if (newStreak >= 3) {
          setTimeout(() => triggerStreakBurst(), 400);
        }
      } else {
        setStreak(0);
      }
    }, 1800);
  };

  const handleTimeUp = () => {
    setPhase('score');
  };

  const sampleLeaderboard = [
    { rank: 1, id: 'p1', name: 'Zoe Chen', score: 3840, streak: 4, delta: 0 },
    { rank: 2, id: 'self', name: `${studentName} (You)`, score: score + 1280, streak: streak + 1, delta: 1 },
    { rank: 3, id: 'p2', name: 'Marcus Taylor', score: 3010, streak: 2, delta: -1 },
    { rank: 4, id: 'p3', name: 'Priya Sharma', score: 2890, streak: 1, delta: 2 },
    { rank: 5, id: 'p4', name: 'David Kim', score: 2650, streak: 0, delta: 0 },
  ];

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
                  <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{sessionId || '842915'}</span>
                </span>
              </div>
              <div className="text-[10px] text-alix-slate-400 font-medium">
                {avatar.name} • {avatar.title}
              </div>
            </div>
          </div>
        </div>

        {/* Score & Streak counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-alix-coral-50 border border-alix-coral-200 text-alix-coral-700 text-xs font-bold animate-pulse">
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
        {/* Phase: Answering */}
        {phase === 'answering' && (
          <div className="space-y-6 animate-fade-in">
            {/* Countdown & Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-alix-slate-400">
                Active Assessment
              </span>
              <Countdown
                secondsRemaining={secondsRemaining}
                totalSeconds={30}
                size="md"
              />
            </div>

            {/* Question Card */}
            <QuestionCard
              questionIndex={sampleQuestion.index}
              totalQuestions={sampleQuestion.total}
              questionText={sampleQuestion.text}
              category="Distributed Consensus"
              points={1000}
              timeLimit={30}
            />

            {/* 4 Funky Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
              {sampleQuestion.options.map((opt, idx) => (
                <OptionButton
                  key={idx}
                  index={idx}
                  text={opt}
                  selected={selectedIndex === idx}
                  onClick={() => handleSelectOption(idx)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Phase: Submitted Waiting */}
        {phase === 'submitted' && (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-alix-slate-200 shadow-sm max-w-md mx-auto space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-alix-violet-100 text-alix-violet-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-heading font-black text-alix-indigo">
              Response Locked!
            </h3>
            <p className="text-sm text-alix-slate-500">
              Answer recorded with speed timestamp. Waiting for classroom countdown...
            </p>
            <div className="w-full bg-alix-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-alix-violet-600 h-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}

        {/* Phase: Score Result with Celebrations */}
        {phase === 'score' && (
          <ScorePopup
            isCorrect={selectedIndex === sampleQuestion.correctIndex}
            basePoints={1000}
            speedBonus={280}
            streak={streak}
            rank={2}
            onNext={() => setPhase('leaderboard')}
          />
        )}

        {/* Phase: Leaderboard */}
        {phase === 'leaderboard' && (
          <div className="space-y-6 animate-fade-in max-w-xl mx-auto w-full">
            <Leaderboard
              entries={sampleLeaderboard}
              title="Classroom Standings"
              highlightPlayerId="self"
            />
            <div className="text-center">
              <button
                onClick={() => {
                  setPhase('answering');
                  setSelectedIndex(null);
                  setSecondsRemaining(30);
                }}
                className="py-3 px-6 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
              >
                Next Question Preview →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Live Floating Reaction Dock */}
      <ReactionStream showBar={true} />

      {/* Bottom status bar */}
      <footer className="p-3 bg-white border-t border-alix-slate-200 text-center text-xs text-alix-slate-400">
        ALIX – Where Every Learner Participates.
      </footer>
    </div>
  );
};

export default PlayPage;
