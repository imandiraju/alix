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
      name: 'ALIX Play',
      tagline: 'Live Quizzes & Competitions',
      desc: 'Live quizzes, timed competitions, multiplayer games and interactive leaderboards designed to elevate classroom energy.',
      icon: Gamepad2,
      accent: 'border-alix-violet-400 bg-alix-violet-50/50',
      iconBg: 'bg-alix-violet-600 text-white',
    },
    {
      name: 'ALIX Poll',
      tagline: 'Instant Classroom Pulse',
      desc: 'Live polls, opinion collection, classroom voting and response visualization to understand student sentiment in seconds.',
      icon: BarChart2,
      accent: 'border-alix-cyan-400 bg-alix-cyan-50/50',
      iconBg: 'bg-alix-cyan-600 text-white',
    },
    {
      name: 'ALIX Think',
      tagline: 'Concept Checks & Peer Instruction',
      desc: 'Concept checks, critical-thinking exercises, debugging challenges and peer instruction routines for deep understanding.',
      icon: Lightbulb,
      accent: 'border-emerald-400 bg-emerald-50/50',
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      name: 'ALIX Teams',
      tagline: 'Collaborative Challenges',
      desc: 'Team-based competitions, collaborative challenges and classroom activities that turn passive spectators into active cohorts.',
      icon: Users2,
      accent: 'border-alix-coral-400 bg-alix-coral-50/50',
      iconBg: 'bg-alix-coral-500 text-white',
    },
    {
      name: 'ALIX Insights',
      tagline: 'Pedagogical Learning Analytics',
      desc: 'Student participation, question-wise performance, misconceptions and learning analytics delivered in real time to instructors.',
      icon: TrendingUp,
      accent: 'border-indigo-400 bg-indigo-50/50',
      iconBg: 'bg-alix-indigo text-white',
    },
    {
      name: 'ALIX Create',
      tagline: 'Smart Authoring Suite',
      desc: 'Quiz creation, activity creation, question banks, imports and AI-assisted question generation built for educators.',
      icon: PlusSquare,
      accent: 'border-purple-400 bg-purple-50/50',
      iconBg: 'bg-alix-violet-700 text-white',
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-alix-slate-200 shadow-sm mb-8 text-xs font-semibold text-alix-violet-700">
            <span className="w-2 h-2 rounded-full bg-alix-violet-600 animate-ping" />
            <span>Where Every Learner Participates.</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-alix-indigo tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Make Every Classroom <span className="bg-gradient-to-r from-alix-violet-600 to-alix-cyan-500 bg-clip-text text-transparent">Interactive.</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-lg sm:text-xl text-alix-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Turn lectures into engaging experiences where every learner participates. ALIX is the modern active-learning platform built for university auditoriums, seminar halls, and hybrid classrooms.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/join"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-semibold text-base shadow-alix-md hover:shadow-alix-glow transition-all flex items-center justify-center gap-2 group"
            >
              <span>Join ALIX Session</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-alix-slate-300 hover:border-alix-indigo text-alix-indigo font-semibold text-base shadow-sm hover:bg-alix-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Monitor className="w-4 h-4 text-alix-indigo" />
              <span>Teacher Dashboard</span>
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
              <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <AlixLogo variant="white" size="sm" />
                    <span className="font-bold text-alix-cyan-300">LIVE SESSION</span>
                  </div>
                  <span className="font-mono bg-alix-violet-600/60 px-2 py-0.5 rounded text-white font-bold">
                    PIN: 842 915
                  </span>
                </div>
                <div className="text-sm font-semibold mb-3 text-white">
                  Which algorithmic technique guarantees the optimal substructure in DP?
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-alix-coral-500/80 font-medium">▲ Memoization (68%)</div>
                  <div className="p-2.5 rounded bg-alix-violet-600/80 font-medium">◆ Greedy Choice (14%)</div>
                  <div className="p-2.5 rounded bg-alix-cyan-600/80 font-medium">● Randomization (6%)</div>
                  <div className="p-2.5 rounded bg-emerald-600/80 font-medium">■ Backtracking (12%)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Product Modules */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-alix-violet-700 mb-2">
            The Complete Active Learning Ecosystem
          </h2>
          <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-alix-indigo">
            Six Specialized Modules. One Unified Platform.
          </h3>
          <p className="mt-4 text-alix-slate-600 text-base">
            ALIX goes beyond simple clickers to support the entire spectrum of interactive higher education and modern corporate training.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className={`p-6 sm:p-8 rounded-2xl border-2 transition-all hover:shadow-alix-lg hover:-translate-y-1 bg-white ${m.accent}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-sm ${m.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-alix-indigo uppercase tracking-wider">
                    MODULE
                  </span>
                </div>

                <h4 className="text-xl font-heading font-bold text-alix-indigo mb-1">
                  {m.name}
                </h4>
                <div className="text-xs font-semibold text-alix-violet-600 mb-3">
                  {m.tagline}
                </div>
                <p className="text-sm text-alix-slate-600 leading-relaxed">
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
