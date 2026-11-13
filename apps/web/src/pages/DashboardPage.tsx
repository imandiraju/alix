import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import {
  Play,
  PlusCircle,
  BarChart2,
  Users,
  Award,
  Clock,
  ArrowUpRight,
  MoreVertical,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const activities = [
    {
      id: 'act-1',
      title: 'CS 301: Distributed Systems Core Concepts',
      questionsCount: 12,
      lastRun: 'Yesterday',
      module: 'ALIX Play',
      playsCount: 84,
      avgScore: 78,
    },
    {
      id: 'act-2',
      title: 'Midterm Concept Check: Quantum Gate Rotations',
      questionsCount: 8,
      lastRun: '3 days ago',
      module: 'ALIX Think',
      playsCount: 42,
      avgScore: 65,
    },
    {
      id: 'act-3',
      title: 'Lecture 04: Operating Systems Deadlock Detection',
      questionsCount: 10,
      lastRun: 'Oct 28',
      module: 'ALIX Poll',
      playsCount: 110,
      avgScore: 82,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-alix-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar className="hidden lg:flex" />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-5xl">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-alix-violet-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instructor Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-alix-indigo">
              Welcome to ALIX
            </h1>
            <p className="text-alix-slate-600 mt-1 text-sm sm:text-base">
              Manage your interactive classroom activities, launch live sessions, and track learning metrics.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white border border-alix-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
                  Total Learners Engaged
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-alix-indigo mt-1">
                  1,480
                </h3>
                <span className="text-xs font-semibold text-emerald-600 inline-flex items-center mt-1">
                  +18% this month
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-alix-violet-50 text-alix-violet-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-alix-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
                  Active Sessions Held
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-alix-indigo mt-1">
                  36
                </h3>
                <span className="text-xs font-semibold text-alix-cyan-600 inline-flex items-center mt-1">
                  Across 3 courses
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-alix-cyan-50 text-alix-cyan-600 flex items-center justify-center font-bold">
                <Play className="w-6 h-6 fill-current" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-alix-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
                  Avg Participation
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-alix-indigo mt-1">
                  94.2%
                </h3>
                <span className="text-xs font-semibold text-emerald-600 inline-flex items-center mt-1">
                  Auditorium wide
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link
              to="/host/session-demo"
              className="p-6 rounded-2xl bg-gradient-to-r from-alix-indigo to-alix-violet-900 text-white shadow-alix-md hover:shadow-alix-glow transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-alix-cyan-300">
                  <Play className="w-3 h-3 fill-current" />
                  <span>ALIX Live</span>
                </div>
                <h3 className="text-xl font-bold font-heading">Start Live Session</h3>
                <p className="text-xs text-alix-slate-200">
                  Generate classroom PIN and project live to students.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </Link>

            <Link
              to="/create"
              className="p-6 rounded-2xl bg-white border border-alix-slate-200 hover:border-alix-violet-400 shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-alix-violet-100 text-xs font-semibold text-alix-violet-700">
                  <PlusCircle className="w-3 h-3" />
                  <span>ALIX Create</span>
                </div>
                <h3 className="text-xl font-bold font-heading text-alix-indigo">Create Activity</h3>
                <p className="text-xs text-alix-slate-500">
                  Draft questions, polls, and peer-learning sets.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-alix-slate-100 group-hover:bg-alix-violet-100 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-5 h-5 text-alix-violet-600" />
              </div>
            </Link>
          </div>

          {/* Activity Library Section */}
          <section className="bg-white rounded-2xl border border-alix-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-alix-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-bold text-alix-indigo">
                  My ALIX Activities
                </h2>
                <p className="text-xs text-alix-slate-500">
                  Your prepared quizzes, polls, and interactive lecture modules.
                </p>
              </div>

              <Link
                to="/create"
                className="px-3.5 py-1.5 rounded-lg bg-alix-violet-600 hover:bg-alix-violet-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Activity</span>
              </Link>
            </div>

            <div className="divide-y divide-alix-slate-100">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-alix-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-alix-violet-50 text-alix-violet-700 border border-alix-violet-200">
                        {act.module}
                      </span>
                      <span className="text-xs text-alix-slate-400">
                        {act.questionsCount} Questions • Last run {act.lastRun}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-alix-indigo">
                      {act.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right sm:mr-3">
                      <div className="text-xs font-semibold text-alix-indigo">
                        {act.playsCount} students
                      </div>
                      <div className="text-[11px] text-alix-slate-400">
                        Avg: {act.avgScore}%
                      </div>
                    </div>

                    <Link
                      to={`/host/${act.id}`}
                      className="px-4 py-2 rounded-lg bg-alix-indigo hover:bg-alix-indigo/90 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current text-alix-cyan-400" />
                      <span>Launch</span>
                    </Link>

                    <Link
                      to="/insights"
                      className="p-2 rounded-lg text-alix-slate-500 hover:text-alix-indigo hover:bg-alix-slate-100 transition-colors"
                      title="View Insights"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
