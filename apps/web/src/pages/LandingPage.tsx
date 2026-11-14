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
  Play,
  Cpu,
  Layers,
} from 'lucide-react';

/**
 * Premium Light Wiring Circuit Background Component
 * Generates delicate PCB-style wiring traces, connector pads, and glowing nodes
 * on a crisp white surface for a high-tech, modern academic platform aesthetic.
 */
const LightWiringBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      <svg
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Micro dot matrix grid */}
          <pattern id="wiring-dot-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="0.85" fill="#E2E8F0" />
          </pattern>

          {/* Gradients for circuit wires */}
          <linearGradient id="wire-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#46178F" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#6F2DBD" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1368CE" stopOpacity="0.12" />
          </linearGradient>

          <linearGradient id="wire-cyan-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00A6A6" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#1368CE" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#46178F" stopOpacity="0.08" />
          </linearGradient>

          <radialGradient id="hero-center-mask" cx="50%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Underlying Dot Matrix */}
        <rect width="100%" height="100%" fill="url(#wiring-dot-grid)" />

        {/* 2. Top-Left Circuit Traces (Geometric 45-degree angle wiring tracks) */}
        <g stroke="url(#wire-purple-grad)" strokeWidth="1.25" fill="none">
          <path d="M -40,110 L 140,110 L 210,180 L 460,180 L 520,240 L 760,240" />
          <path d="M 60,-20 L 60,120 L 110,170 L 110,340 L 160,390 L 360,390" strokeDasharray="6 4" />
          <path d="M -20,240 L 120,240 L 180,300 L 320,300 L 370,350 L 520,350" />
          <path d="M 280,-30 L 280,100 L 340,160 L 580,160" strokeDasharray="8 4" />
        </g>

        {/* 3. Top-Right Circuit Traces (Mirrored High-Speed Data Bus) */}
        <g stroke="url(#wire-cyan-grad)" strokeWidth="1.25" fill="none">
          <path d="M 1480,90 L 1240,90 L 1170,160 L 920,160 L 860,220 L 680,220" />
          <path d="M 1340,-20 L 1340,140 L 1280,200 L 1280,360 L 1220,420 L 1040,420" strokeDasharray="6 4" />
          <path d="M 1520,230 L 1320,230 L 1250,300 L 1080,300 L 1020,360 L 880,360" />
          <path d="M 1120,-30 L 1120,90 L 1050,160 L 860,160" strokeDasharray="8 4" />
        </g>

        {/* 4. Center-Bottom Flowing Neural Wiring */}
        <g stroke="#CBD5E1" strokeWidth="1" fill="none" opacity="0.6">
          <path d="M 200,600 L 420,600 L 480,660 L 780,660 L 840,600 L 1140,600" />
          <path d="M 340,740 L 520,740 L 570,690 L 820,690 L 870,740 L 1060,740" strokeDasharray="5 5" />
          <path d="M 680,480 L 680,590 L 730,640 L 730,780" />
        </g>

        {/* 5. Terminal Junction Pads & Glowing Micro-Nodes */}
        {/* Left Side Nodes */}
        <circle cx="210" cy="180" r="3.5" fill="#FFFFFF" stroke="#46178F" strokeWidth="1.5" />
        <circle cx="520" cy="240" r="3" fill="#FFFFFF" stroke="#1368CE" strokeWidth="1.5" />
        <circle cx="160" cy="390" r="3" fill="#FFFFFF" stroke="#6F2DBD" strokeWidth="1.5" />
        <circle cx="340" cy="160" r="2.5" fill="#46178F" opacity="0.7" />

        {/* Right Side Nodes */}
        <circle cx="1170" cy="160" r="3.5" fill="#FFFFFF" stroke="#00A6A6" strokeWidth="1.5" />
        <circle cx="860" cy="220" r="3" fill="#FFFFFF" stroke="#46178F" strokeWidth="1.5" />
        <circle cx="1220" cy="420" r="3" fill="#FFFFFF" stroke="#1368CE" strokeWidth="1.5" />
        <circle cx="1050" cy="160" r="2.5" fill="#00A6A6" opacity="0.7" />

        {/* Center Bottom Nodes */}
        <circle cx="480" cy="660" r="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="840" cy="600" r="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />

        {/* 6. Soft Center Highlight for clear text contrast */}
        <rect width="100%" height="100%" fill="url(#hero-center-mask)" />
      </svg>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const modules = [
    {
      name: 'Live Quizzes',
      tagline: 'Multiplayer Speed & Accuracy',
      desc: 'Fast-paced live competitions with ticking timers, streak multipliers, and instant feedback that keep every student engaged.',
      icon: Gamepad2,
      shape: '▲',
      accent: 'border-[#E5E5E5] hover:border-[#E21B5A] bg-white',
      badgeColor: 'bg-rose-50 text-[#E21B5A] border-rose-200',
      iconBg: 'bg-[#E21B5A] text-white',
    },
    {
      name: 'Classroom Polls',
      tagline: 'Instant Student Pulse',
      desc: 'Real-time voting and opinion collection with dynamic bar charts to instantly gauge cohort understanding.',
      icon: BarChart2,
      shape: '◆',
      accent: 'border-[#E5E5E5] hover:border-[#1368CE] bg-white',
      badgeColor: 'bg-blue-50 text-[#1368CE] border-blue-200',
      iconBg: 'bg-[#1368CE] text-white',
    },
    {
      name: 'Concept Checks',
      tagline: 'Diagnostic Learning Checks',
      desc: 'Spot misconceptions the second they happen so you can adapt your lecture explanations immediately.',
      icon: Lightbulb,
      shape: '●',
      accent: 'border-[#E5E5E5] hover:border-[#E66C1C] bg-white',
      badgeColor: 'bg-orange-50 text-[#E66C1C] border-orange-200',
      iconBg: 'bg-[#E66C1C] text-white',
    },
    {
      name: 'Team Battles',
      tagline: 'Collaborative Cohort Play',
      desc: 'Form dynamic squads where students collaborate together to solve complex problems and claim the podium.',
      icon: Users2,
      shape: '■',
      accent: 'border-[#E5E5E5] hover:border-[#00A6A6] bg-white',
      badgeColor: 'bg-teal-50 text-[#00A6A6] border-teal-200',
      iconBg: 'bg-[#00A6A6] text-white',
    },
    {
      name: 'AI Quiz Studio',
      tagline: 'Instant Question Generation',
      desc: 'Synthesize curriculum-aligned quiz questions in seconds from your lecture notes or syllabus prompts using Grok-2 & Gemini 2.0.',
      icon: Sparkles,
      shape: '★',
      accent: 'border-[#E5E5E5] hover:border-[#46178F] bg-white',
      badgeColor: 'bg-purple-50 text-[#46178F] border-purple-200',
      iconBg: 'bg-[#46178F] text-white',
    },
    {
      name: 'Anti-Proxy Rosters',
      tagline: 'Verified Roll Number Security',
      desc: 'Excel and CSV roll number whitelist protection stops PIN-sharing and proxy attendance in large lecture halls.',
      icon: ShieldCheck,
      shape: '🛡️',
      accent: 'border-[#E5E5E5] hover:border-emerald-600 bg-white',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#252525] selection:bg-[#46178F] selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section with Light Wiring Circuit Layer */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-white border-b border-[#E5E5E5]">
        {/* Light Wiring Circuit SVG Overlay */}
        <LightWiringBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] shadow-xs mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#00A6A6] animate-pulse" />
            <span className="text-xs font-semibold text-[#46178F] tracking-wide uppercase">
              RKGlobal EdTech • Academic Learning Platform
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-[#252525] tracking-tight max-w-5xl mx-auto leading-[1.1] mb-5">
            Make Learning <span className="text-[#46178F]">Awesome.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#626262] max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Turn every classroom lecture into an active, collaborative arena. Real-time response analytics, peer battles, and anti-proxy verification — without student app downloads.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            {/* Student Quick Join PIN */}
            <Link
              to="/join"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#46178F] hover:bg-[#391275] text-white font-semibold text-base shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span className="flex items-center gap-0.5 text-xs">
                <span className="text-[#E21B5A]">▲</span>
                <span className="text-[#1368CE]">◆</span>
                <span className="text-[#E66C1C]">●</span>
                <span className="text-[#00A6A6]">■</span>
              </span>
              <span>Join with Game PIN</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            {/* Teacher Create Game */}
            <Link
              to="/create"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#1368CE] hover:bg-[#0F52A4] text-white font-semibold text-base shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusSquare className="w-4 h-4 stroke-[2.5]" />
              <span>Create an Activity</span>
            </Link>
          </div>

          {/* Trust stats pill bar */}
          <div className="mt-12 pt-8 border-t border-[#E5E5E5]/60 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-[#626262]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Student App Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00A6A6]" />
              <span>Instant Lecture Hall Projector Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#46178F]" />
              <span>Anti-Proxy Roll Number Whitelist</span>
            </div>
          </div>
        </div>
      </section>

      {/* Classroom Projector Simulation Strip */}
      <section className="py-16 bg-[#F3F3F3] border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1E0938] rounded-3xl p-6 sm:p-10 shadow-xl text-white relative overflow-hidden border border-purple-900/60">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-cyan-300 border border-white/10">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>ALIX Live Projector Arena</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-heading font-bold tracking-tight text-white">
                  High-Visibility Projector Engine
                </h2>
                <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
                  Engineered specifically for university lecture halls. Large, readable typography visible from the back of the auditorium, real-time response counters, and instant misconception breakdown graphs.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1368CE] hover:bg-[#0F52A4] text-white font-semibold text-sm transition-all shadow-sm"
                  >
                    <span>Launch Educator Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Mock Projector Preview Card */}
              <div className="lg:col-span-6 bg-[#0E041C]/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-white text-base">ALIX</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#00D2D3] text-[#0A1A2F] font-bold text-[10px]">
                      EDU
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium text-[10px] border border-emerald-500/30">
                      LIVE ARENA
                    </span>
                  </div>
                  <span className="font-mono bg-white/10 px-3 py-1 rounded-lg text-cyan-300 font-bold text-xs tracking-wider border border-white/10">
                    PIN: 240 743
                  </span>
                </div>

                <div className="text-base sm:text-lg font-heading font-semibold mb-4 text-white leading-snug">
                  Which algorithmic technique guarantees optimal substructure in Dynamic Programming?
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 sm:p-4 rounded-xl bg-[#E21B5A] text-white font-semibold text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
                    <span className="w-6 h-6 rounded bg-black/20 flex items-center justify-center text-xs shrink-0">▲</span>
                    <span className="truncate">Memoization</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-[#1368CE] text-white font-semibold text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
                    <span className="w-6 h-6 rounded bg-black/20 flex items-center justify-center text-xs shrink-0">◆</span>
                    <span className="truncate">Greedy Choice</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-[#E66C1C] text-white font-semibold text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
                    <span className="w-6 h-6 rounded bg-black/20 flex items-center justify-center text-xs shrink-0">●</span>
                    <span className="truncate">Randomization</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-[#00A6A6] text-white font-semibold text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
                    <span className="w-6 h-6 rounded bg-black/20 flex items-center justify-center text-xs shrink-0">■</span>
                    <span className="truncate">Backtracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes & Learning Tools */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#46178F] mb-2">
            Academic Learning Modules
          </h2>
          <h3 className="text-3xl sm:text-4xl font-heading font-bold text-[#252525] tracking-tight">
            Built for High-Energy Classrooms
          </h3>
          <p className="mt-3 text-[#626262] text-sm sm:text-base max-w-xl mx-auto font-normal">
            Everything faculty need to energize lectures, spark lively peer discussions, and verify student mastery in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className={`p-6 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${m.accent}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-xs ${m.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${m.badgeColor}`}>
                    {m.shape} Module
                  </span>
                </div>

                <h4 className="text-base font-heading font-semibold text-[#252525] mb-1">
                  {m.name}
                </h4>
                <div className="text-xs font-medium text-[#46178F] mb-2">
                  {m.tagline}
                </div>
                <p className="text-xs text-[#626262] leading-relaxed font-normal">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works: 3 Steps */}
      <section className="py-16 bg-[#F3F3F3] border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#252525]">
              Effortless Classroom Setup
            </h3>
            <p className="text-xs sm:text-sm text-[#626262] mt-2 font-normal">
              Transform passive lecture slides into active collaborative sessions in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white rounded-2xl border border-[#E5E5E5] shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-50 text-[#46178F] flex items-center justify-center font-bold text-base mb-3 border border-purple-200">
                1
              </div>
              <h4 className="text-base font-semibold text-[#252525] mb-1.5">Create Activity</h4>
              <p className="text-xs text-[#626262] font-normal leading-relaxed">
                Author quizzes, polls, or peer-instruction questions with visual diagrams in ALIX Create or import question banks.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E5E5E5] shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-[#1368CE] flex items-center justify-center font-bold text-base mb-3 border border-blue-200">
                2
              </div>
              <h4 className="text-base font-semibold text-[#252525] mb-1.5">Project PIN</h4>
              <p className="text-xs text-[#626262] font-normal leading-relaxed">
                Present the ALIX Live projector screen. Students enter the 6-digit PIN on any mobile browser without signing in.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E5E5E5] shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base mb-3 border border-emerald-200">
                3
              </div>
              <h4 className="text-base font-semibold text-[#252525] mb-1.5">Engage & Analyze</h4>
              <p className="text-xs text-[#626262] font-normal leading-relaxed">
                Experience 100% participation. Instant analytics and CSV attendance pinpoint misconceptions for targeted review.
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
