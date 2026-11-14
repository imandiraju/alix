import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AlixLogo from '../components/common/AlixLogo';
import {
  Gamepad2,
  BarChart2,
  Lightbulb,
  Users2,
  TrendingUp,
  PlusSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Monitor,
  Smartphone,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const modules = [
    {
      name: 'Live Quizzes',
      tagline: 'Multiplayer Speed & Accuracy',
      desc: 'Fast-paced live competitions with ticking timers, point streaks, and instant feedback that keep everyone at the edge of their seat.',
      icon: Gamepad2,
      accent: 'border-rose-200 hover:border-[#E21B3C] bg-white',
      iconBg: 'bg-[#E21B3C] text-white',
    },
    {
      name: 'Classroom Polls',
      tagline: 'Instant Student Pulse',
      desc: 'Real-time voting and opinion collection with dynamic bar charts to instantly gauge student understanding.',
      icon: BarChart2,
      accent: 'border-blue-200 hover:border-[#1368CE] bg-white',
      iconBg: 'bg-[#1368CE] text-white',
    },
    {
      name: 'Concept Checks',
      tagline: 'Diagnostic Learning Checks',
      desc: 'Spot misconceptions the second they happen so you can adapt your lecture on the fly.',
      icon: Lightbulb,
      accent: 'border-amber-200 hover:border-[#D89E00] bg-white',
      iconBg: 'bg-[#D89E00] text-white',
    },
    {
      name: 'Team Battles',
      tagline: 'Collaborative Group Play',
      desc: 'Group competitions that turn silent auditoriums into active cohorts working together to solve problems.',
      icon: Users2,
      accent: 'border-emerald-200 hover:border-[#26890C] bg-white',
      iconBg: 'bg-[#26890C] text-white',
    },
    {
      name: 'AI Studio',
      tagline: 'Instant Question Generation',
      desc: 'Generate curriculum-aligned quiz questions in seconds from your lecture notes or topic prompts.',
      icon: Sparkles,
      accent: 'border-purple-200 hover:border-[#864CBF] bg-white',
      iconBg: 'bg-[#864CBF] text-white',
    },
    {
      name: 'Victory Podium',
      tagline: 'Streaks & Leaderboards',
      desc: 'Celebrate top performers and classroom participation with animated podiums, confetti, and insights.',
      icon: TrendingUp,
      accent: 'border-indigo-200 hover:border-[#331166] bg-white',
      iconBg: 'bg-[#331166] text-white',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-alix-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-alix-violet-200/40 to-alix-cyan-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Brand Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Interactive Learning Games for Classroom Engagement</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.08]">
            Make Learning <span className="text-[#864CBF]">Awesome.</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Turn every lecture into an energetic game where students answer in real time, compete on live leaderboards, and master tough concepts.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/join"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#331166] hover:bg-[#250B4D] border-b-4 border-[#1C0738] active:border-b-0 active:translate-y-1 text-white font-black text-base shadow-lg transition-all duration-100 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span className="flex items-center gap-0.5 text-xs font-mono">
                <span className="text-rose-400">▲</span>
                <span className="text-cyan-400">◆</span>
                <span className="text-amber-400">●</span>
                <span className="text-emerald-400">■</span>
              </span>
              <span>Join with Game PIN</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <Link
              to="/create"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1368CE] hover:bg-[#105AB3] border-b-4 border-[#0D4A99] active:border-b-0 active:translate-y-1 text-white font-black text-base shadow-lg transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusSquare className="w-4 h-4 stroke-[3]" />
              <span>Create a Game</span>
            </Link>
          </div>

          {/* Social Proof / Features strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-alix-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero App Installs Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Instant 6-Digit PIN Join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Projector-Optimized UI</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Pedagogy Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Classroom Projector Simulation Strip */}
      <section className="py-12 bg-white border-y border-alix-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-alix-indigo to-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl text-white relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-alix-violet-500/20 border border-alix-violet-400/30 text-xs font-semibold text-alix-cyan-300">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>ALIX Live Projector Experience</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight">
                  High-Visibility Projector Engine
                </h2>
                <p className="text-alix-slate-300 text-sm sm:text-base leading-relaxed">
                  Engineered specifically for lecture halls. High-contrast typography readable from the back of the auditorium, real-time response counters, and instant misconception breakdown graphs.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    to="/dashboard"
                    className="px-5 py-2.5 rounded-lg bg-alix-cyan-500 hover:bg-alix-cyan-400 text-alix-indigo font-bold text-sm transition-colors shadow-sm"
                  >
                    Experience Live Projector →
                  </Link>
                </div>
              </div>

              {/* Mock Projector Preview Card */}
              <div className="lg:col-span-5 bg-[#0F0524]/90 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-white text-base">ALIX</span>
                    <span className="text-cyan-400 font-heading font-black text-base">!</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                      LIVE SESSION
                    </span>
                  </div>
                  <span className="font-mono bg-white/10 px-3 py-1 rounded-lg text-cyan-300 font-black text-xs tracking-wider border border-white/10">
                    PIN: 842 915
                  </span>
                </div>
                <div className="text-base sm:text-lg font-heading font-black mb-4 text-white leading-snug">
                  Which algorithmic technique guarantees optimal substructure in DP?
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 sm:p-4 rounded-xl bg-[#E21B3C] border-b-4 border-[#9E1329] text-white font-heading font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg active:scale-95 transition-transform cursor-pointer">
                    <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-sm shrink-0">▲</span>
                    <span className="truncate">Memoization</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-[#1368CE] border-b-4 border-[#0D4589] text-white font-heading font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg active:scale-95 transition-transform cursor-pointer">
                    <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-sm shrink-0">◆</span>
                    <span className="truncate">Greedy Choice</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-[#D89E00] border-b-4 border-[#8C6700] text-white font-heading font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg active:scale-95 transition-transform cursor-pointer">
                    <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-sm shrink-0">●</span>
                    <span className="truncate">Randomization</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-[#26890C] border-b-4 border-[#175407] text-white font-heading font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg active:scale-95 transition-transform cursor-pointer">
                    <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-sm shrink-0">■</span>
                    <span className="truncate">Backtracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#864CBF] mb-2">
            Game Modes & Learning Tools
          </h2>
          <h3 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight">
            Built for High-Energy Classrooms
          </h3>
          <p className="mt-3 text-slate-600 text-base max-w-xl mx-auto">
            Everything you need to energize lectures, spark lively peer discussions, and verify student mastery in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${m.accent}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-sm ${m.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Active Mode
                  </span>
                </div>

                <h4 className="text-lg font-heading font-black text-slate-900 mb-1">
                  {m.name}
                </h4>
                <div className="text-xs font-bold text-[#864CBF] mb-2">
                  {m.tagline}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works: 3 Steps */}
      <section className="py-16 bg-white border-t border-alix-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-alix-indigo">
              Effortless Classroom Setup
            </h3>
            <p className="text-sm text-alix-slate-500 mt-2">
              Transform passive lecture slides into active collaborative sessions in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-alix-violet-100 text-alix-violet-700 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-alix-indigo mb-2">Create Activity</h4>
              <p className="text-sm text-alix-slate-600">
                Author quizzes, polls, or peer-instruction questions in ALIX Create or import question banks.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-alix-cyan-100 text-alix-cyan-700 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-alix-indigo mb-2">Project PIN</h4>
              <p className="text-sm text-alix-slate-600">
                Present the ALIX Live projector screen. Students enter the 6-digit PIN from any mobile device without logging in.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-alix-indigo mb-2">Engage & Analyze</h4>
              <p className="text-sm text-alix-slate-600">
                Experience 100% participation. Instant analytics pinpoint misconceptions for targeted review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
