import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { REALTIME_URL } from '../services/socket';
import {
  Play,
  PlusCircle,
  BarChart2,
  Users,
  Award,
  Clock,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Trash2,
  FileQuestion,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface QuizItem {
  _id: string;
  title: string;
  subject: string;
  courseCode?: string;
  description?: string;
  questions: any[];
  createdAt: string;
}

interface SessionStats {
  totalSessions: number;
  totalLearners: number;
  avgParticipation: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalLearners: 0,
    avgParticipation: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const teacherParam = user?.id ? `?teacherId=${user.id}` : '';

      // 1. Fetch real quizzes from MongoDB
      const quizRes = await fetch(`${REALTIME_URL}/api/quizzes${teacherParam}`);
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        setQuizzes(quizData.quizzes || []);
      }

      // 2. Fetch real session stats from MongoDB
      const statsRes = await fetch(`${REALTIME_URL}/api/sessions/stats${teacherParam}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) {
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.warn('[Dashboard] Could not fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity? This cannot be undone.')) {
      return;
    }

    setDeletingId(quizId);
    try {
      const res = await fetch(`${REALTIME_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      }
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartLiveClick = () => {
    if (quizzes.length === 0) {
      navigate('/create');
    } else if (quizzes.length === 1) {
      navigate(`/host/${quizzes[0]._id}`);
    } else {
      setIsLaunchModalOpen(true);
    }
  };

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
              Welcome{user?.name ? `, ${user.name}` : ' to ALIX'}
            </h1>
            <p className="text-alix-slate-600 mt-1 text-sm sm:text-base">
              Manage your interactive classroom activities, launch live sessions, and track learning metrics.
            </p>
          </div>

          {/* Real Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Total Activities */}
            <div className="p-5 rounded-2xl bg-white border border-alix-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
                  Total Activities
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-alix-indigo mt-1">
                  {quizzes.length}
                </h3>
                <span className="text-xs font-semibold text-emerald-600 inline-flex items-center mt-1">
                  {quizzes.length > 0 ? `${quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0)} questions drafted` : 'Ready to draft'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-alix-violet-50 text-alix-violet-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            {/* Active Sessions */}
            <div className="p-5 rounded-2xl bg-white border border-alix-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
                  Active Sessions Held
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-alix-indigo mt-1">
                  {stats.totalSessions}
                </h3>
                <span className="text-xs font-semibold text-alix-cyan-600 inline-flex items-center mt-1">
                  {stats.totalSessions > 0 ? 'Live room logs synced' : 'No active sessions yet'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-alix-cyan-50 text-alix-cyan-600 flex items-center justify-center font-bold">
                <Play className="w-6 h-6 fill-current" />
              </div>
            </div>

            {/* Total Learners Engaged */}
            <div className="p-5 rounded-2xl bg-white border border-alix-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
                  Learners Engaged
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-alix-indigo mt-1">
                  {stats.totalLearners}
                </h3>
                <span className="text-xs font-semibold text-emerald-600 inline-flex items-center mt-1">
                  {stats.avgParticipation > 0 ? `${stats.avgParticipation}% participation rate` : 'Auditorium ready'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={handleStartLiveClick}
              className="p-6 rounded-2xl bg-gradient-to-r from-alix-indigo to-alix-violet-900 text-white shadow-alix-md hover:shadow-alix-glow transition-all flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-alix-cyan-300">
                  <Play className="w-3 h-3 fill-current" />
                  <span>ALIX Live</span>
                </div>
                <h3 className="text-xl font-bold font-heading">Start Live Session</h3>
                <p className="text-xs text-alix-slate-200">
                  {quizzes.length > 0
                    ? 'Generate auditorium PIN and project live questions.'
                    : 'Create a quiz to generate an auditorium room PIN.'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </button>

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
                  Draft questions, polls, and peer-learning sets for your subject.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-alix-slate-100 group-hover:bg-alix-violet-100 flex items-center justify-center transition-colors shrink-0">
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
                className="px-3.5 py-1.5 rounded-lg bg-alix-violet-600 hover:bg-alix-violet-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Activity</span>
              </Link>
            </div>

            {/* List or Clean Empty State */}
            {isLoading ? (
              <div className="p-12 text-center text-alix-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-alix-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading your activities from database...</span>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-alix-violet-50 text-alix-violet-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-heading font-bold text-alix-indigo">
                  No activities created yet
                </h3>
                <p className="text-xs text-alix-slate-500 max-w-md mx-auto mt-1 mb-5">
                  Welcome, {user?.name || 'Instructor'}! You do not have any saved activities yet. Draft your first interactive quiz or concept check to launch live classroom sessions.
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-bold text-xs shadow-alix-md hover:shadow-alix-glow transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Your First Activity</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-alix-slate-100">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-alix-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-alix-violet-50 text-alix-violet-700 border border-alix-violet-200">
                          {quiz.subject || 'Interactive Module'}
                        </span>
                        {quiz.courseCode && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-alix-cyan-50 text-alix-cyan-800 border border-alix-cyan-200">
                            {quiz.courseCode}
                          </span>
                        )}
                        <span className="text-xs text-alix-slate-400">
                          {quiz.questions?.length || 0} Questions • Created{' '}
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-alix-indigo truncate">
                        {quiz.title}
                      </h4>
                      {quiz.description && (
                        <p className="text-xs text-alix-slate-500 line-clamp-1">
                          {quiz.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/host/${quiz._id}`}
                        className="px-4 py-2 rounded-lg bg-alix-indigo hover:bg-alix-indigo/90 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current text-alix-cyan-400" />
                        <span>Launch</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        disabled={deletingId === quiz._id}
                        className="p-2 rounded-lg text-alix-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Select Activity Modal to Start Live Session */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-alix-xl border border-alix-slate-200 overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-alix-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-heading font-extrabold text-alix-indigo">
                  Select Activity to Launch
                </h3>
                <p className="text-xs text-alix-slate-500">
                  Choose which prepared quiz or module to project live to students.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-1.5 rounded-lg text-alix-slate-400 hover:text-alix-indigo hover:bg-alix-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {quizzes.map((quiz) => (
                <button
                  key={quiz._id}
                  type="button"
                  onClick={() => {
                    setIsLaunchModalOpen(false);
                    navigate(`/host/${quiz._id}`);
                  }}
                  className="w-full p-4 rounded-xl border border-alix-slate-200 hover:border-alix-violet-500 hover:bg-alix-violet-50/50 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-alix-violet-100 text-alix-violet-700">
                        {quiz.subject}
                      </span>
                      {quiz.courseCode && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-alix-slate-100 text-alix-slate-600">
                          {quiz.courseCode}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-alix-indigo group-hover:text-alix-violet-700 truncate">
                      {quiz.title}
                    </div>
                    <div className="text-[11px] text-alix-slate-400">
                      {quiz.questions?.length || 0} Questions
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-alix-slate-100 group-hover:bg-alix-violet-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-alix-slate-50 border-t border-alix-slate-100 flex items-center justify-between text-xs">
              <span className="text-alix-slate-500">Want to create a different quiz?</span>
              <Link
                to="/create"
                className="font-bold text-alix-violet-600 hover:text-alix-violet-800"
              >
                + Create New Activity
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DashboardPage;
