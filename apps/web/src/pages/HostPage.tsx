import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import Countdown from '../components/game/Countdown';
import Leaderboard from '../components/game/Leaderboard';
import AlixQRCode from '../components/common/AlixQRCode';
import ProjectorQRModal from '../components/common/ProjectorQRModal';
import VictoryPodium from '../components/game/VictoryPodium';
import ReactionStream from '../components/game/ReactionStream';
import { getSocket } from '../services/socket';
import {
  Users,
  Trophy,
  ArrowRight,
  Maximize2,
  Sparkles,
  QrCode,
  Flame,
  CheckCircle2,
  Share2,
  Wifi,
} from 'lucide-react';

export const HostPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const pin = sessionId || '842915';

  // Compute live join URL (e.g. http://localhost:3000/join?pin=842915)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const joinUrl = `${origin}/join?pin=${pin}`;

  // Host Stage: 'question' | 'chart' | 'leaderboard' | 'victory'
  const [stage, setStage] = useState<'question' | 'chart' | 'leaderboard' | 'victory'>('question');
  const [timer] = useState(20);
  const [answersSubmitted, setAnswersSubmitted] = useState(64);
  const [totalLearners, setTotalLearners] = useState(72);
  const [isQRExpanded, setIsQRExpanded] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  useEffect(() => {
    try {
      const socket = getSocket();
      
      const onConnect = () => setIsRealtimeActive(true);
      const onDisconnect = () => setIsRealtimeActive(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      if (socket.connected) setIsRealtimeActive(true);

      socket.emit('create-session', {
        quizId: 'quiz-01',
        hostId: 'teacher-host',
      });

      socket.on('player-joined', (data) => {
        if (data.playerCount) {
          setTotalLearners(data.playerCount);
        }
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('player-joined');
      };
    } catch {
      // fallback
    }
  }, []);

  const currentQuestion = {
    index: 3,
    total: 10,
    text: 'In distributed consensus protocols (e.g., Raft), what is the minimum number of nodes required to tolerate 2 node crash failures?',
    diagram: '2f + 1 Quorum Rule (f = 2 failures)',
    options: [
      { text: '3 nodes', count: 4, percentage: 6, isCorrect: false },
      { text: '5 nodes (2f + 1)', count: 52, percentage: 81, isCorrect: true },
      { text: '7 nodes', count: 6, percentage: 9, isCorrect: false },
      { text: '4 nodes', count: 2, percentage: 4, isCorrect: false },
    ],
  };

  const sampleLeaderboard = [
    { rank: 1, id: '1', name: 'Zoe Chen', score: 4890, streak: 5, delta: 0 },
    { rank: 2, id: '2', name: 'Alex Rivera', score: 4120, streak: 4, delta: 1 },
    { rank: 3, id: '3', name: 'Marcus Taylor', score: 3840, streak: 3, delta: -1 },
    { rank: 4, id: '4', name: 'Priya Sharma', score: 3670, streak: 2, delta: 2 },
    { rank: 5, id: '5', name: 'David Kim', score: 3410, streak: 1, delta: 0 },
  ];

  const podiumWinners = [
    { rank: 1, name: 'Zoe Chen', score: 9840, avatarId: 'fox', streak: 6 },
    { rank: 2, name: 'Alex Rivera', score: 8750, avatarId: 'bot', streak: 4 },
    { rank: 3, name: 'Marcus Taylor', score: 7920, avatarId: 'owl', streak: 3 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-alix-violet-500 selection:text-white relative overflow-hidden select-none">
      {/* Background radial ambient lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-alix-violet-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-alix-cyan-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Projector Branding Bar */}
      <header className="p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-4 sm:gap-6">
          <AlixLogo variant="white" size="md" />
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-alix-cyan-400">
            <span className={`w-2 h-2 rounded-full ${isRealtimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isRealtimeActive ? 'Real-Time Engine Online' : 'Connecting Real-Time...'}</span>
          </div>
        </div>

        {/* Center: Interactive Projector QR Button + PIN */}
        <div className="flex items-center gap-2 sm:gap-4 bg-alix-indigo/70 px-3 sm:px-5 py-2 rounded-2xl border border-alix-violet-500/40 shadow-inner">
          {/* Quick Enlarge QR trigger */}
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
            <span className="text-xs text-slate-400 hidden sm:inline">Active</span>
          </div>

          <button
            onClick={() => {
              if (stage === 'question') setStage('chart');
              else if (stage === 'chart') setStage('leaderboard');
              else if (stage === 'leaderboard') setStage('victory');
              else setStage('question');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-indigo hover:from-alix-violet-500 hover:to-alix-indigo/90 font-bold text-sm text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
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
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Podium Reveal!</span>
              </>
            )}
            {stage === 'victory' && (
              <>
                <span>Next Round</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Projector Screen */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center z-10">
        {/* Stage 1: Live Question Presentation */}
        {stage === 'question' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Projector Question Card with Fun Graphic Callout */}
            <div className="bg-slate-800/95 rounded-3xl border border-slate-700 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-lg bg-alix-violet-500/20 text-alix-violet-300 border border-alix-violet-500/30 text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Question {currentQuestion.index} of {currentQuestion.total}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-700/60 text-xs font-semibold text-slate-300">
                    Distributed Systems
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Submissions</div>
                    <div className="text-base sm:text-lg font-mono font-bold text-alix-cyan-400">
                      {answersSubmitted} / {totalLearners}
                    </div>
                  </div>
                  <Countdown secondsRemaining={timer} totalSeconds={30} size="md" />
                </div>
              </div>

              {/* Question Text */}
              <h1 className="text-2xl sm:text-4xl lg:text-4xl font-heading font-extrabold leading-tight text-white mb-4">
                {currentQuestion.text}
              </h1>

              {/* Graphic/Diagram Callout Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono text-alix-cyan-300">
                <span className="w-2 h-2 rounded-full bg-alix-cyan-400 animate-ping" />
                <span>System Model: {currentQuestion.diagram}</span>
              </div>
            </div>

            {/* Answer Options Grid (4 Funky Colors) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt, idx) => (
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
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {idx === 0 ? '▲ A' : idx === 1 ? '◆ B' : idx === 2 ? '● C' : '■ D'}
                  </div>
                  <span className="flex-1">{opt.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 2: Response Distribution Breakdown */}
        {stage === 'chart' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-alix-cyan-400">
                Response Analysis
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-bold text-white">
                Auditorium Accuracy: 81%
              </h2>
            </div>

            <div className="bg-slate-800/80 rounded-3xl border border-slate-700 p-6 sm:p-10 space-y-5">
              {currentQuestion.options.map((opt, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          opt.isCorrect ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                      <span>{opt.text}</span>
                      {opt.isCorrect && (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Correct Answer
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-alix-cyan-300">
                      {opt.percentage}% ({opt.count} votes)
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-xl h-6 overflow-hidden p-1 border border-slate-700">
                    <div
                      className={`h-full rounded-lg transition-all duration-700 ${
                        opt.isCorrect
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-slate-600 to-slate-500'
                      }`}
                      style={{ width: `${opt.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 3: Live Leaderboard */}
        {stage === 'leaderboard' && (
          <div className="max-w-2xl mx-auto w-full animate-fade-in">
            <Leaderboard entries={sampleLeaderboard} title="Classroom Top Performers" />
          </div>
        )}

        {/* Stage 4: 3D Victory Podium Celebration */}
        {stage === 'victory' && (
          <VictoryPodium
            winners={podiumWinners}
            onRestart={() => setStage('question')}
          />
        )}
      </main>

      {/* Floating Reaction Stream (Allows viewers or audience to float emojis on projector) */}
      <ReactionStream showBar={true} />

      {/* Projector Fullscreen QR Code Modal */}
      <ProjectorQRModal
        isOpen={isQRExpanded}
        onClose={() => setIsQRExpanded(false)}
        pin={pin}
        joinUrl={joinUrl}
        participantCount={totalLearners}
      />

      {/* Projector Footer Branding */}
      <footer className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 z-10">
        <div>ALIX – Active Learning & Interactive Experience</div>
        <div className="font-semibold text-alix-violet-400 flex items-center gap-2">
          <span>Where Every Learner Participates.</span>
        </div>
      </footer>
    </div>
  );
};

export default HostPage;
