import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { REALTIME_URL } from '../services/socket';
import {
  TrendingUp,
  Users,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  Play,
  FileSpreadsheet,
  Gamepad2,
  Clock,
  ArrowRight,
  Trash2,
  Filter,
} from 'lucide-react';

interface SessionDoc {
  _id: string;
  pin: string;
  status: string;
  createdAt: string;
  participants: any[];
  responses: any[];
  quizTitle?: string;
  quizId?: any;
}

export const InsightsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalLearners: 0,
    avgParticipation: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const teacherParam = user?.id ? `?teacherId=${user.id}` : '';
        const res = await fetch(`${REALTIME_URL}/api/sessions/stats${teacherParam}`);
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats({
              totalSessions: data.stats.totalSessions || 0,
              totalLearners: data.stats.totalLearners || 0,
              avgParticipation: data.stats.avgParticipation || 0,
            });
            if (Array.isArray(data.stats.recentSessions)) {
              setSessions(data.stats.recentSessions);
            }
          }
        }
      } catch (err) {
        console.warn('Reports fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleExportAttendance = async (pin: string) => {
    try {
      const res = await fetch(`${REALTIME_URL}/api/sessions/${pin}/attendance`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.attendance) return;

      let csv = 'Roll No,Student Name,Email,Section,Status,Score,Joined At\n';
      data.attendance.forEach((a: any) => {
        csv += `${a.rollNo},"${a.name}",${a.email},${a.section},${a.status},${a.score},"${
          a.joinedAt ? new Date(a.joinedAt).toLocaleTimeString() : 'N/A'
        }"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ALIX_Report_${pin}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'waiting'>('all');
  const [deletingPin, setDeletingPin] = useState<string | null>(null);

  const handleDeleteSession = async (pin: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete session PIN ${pin}? All associated attendance logs will be permanently removed.`
      )
    ) {
      return;
    }
    setDeletingPin(pin);
    try {
      const res = await fetch(`${REALTIME_URL}/api/sessions/${pin}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.pin !== pin));
        setStats((prev) => ({
          ...prev,
          totalSessions: Math.max(0, prev.totalSessions - 1),
        }));
      } else {
        alert('Could not delete session from server.');
      }
    } catch (err) {
      console.error('Delete session error:', err);
      alert('Network error while deleting session.');
    } finally {
      setDeletingPin(null);
    }
  };

  const handleDeleteAllSessions = async () => {
    if (sessions.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete all ${sessions.length} recorded session reports? This action cannot be reversed.`
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${REALTIME_URL}/api/sessions/delete-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user?.id,
          all: true,
        }),
      });
      if (res.ok) {
        setSessions([]);
        setStats({ totalSessions: 0, totalLearners: 0, avgParticipation: 0 });
      } else {
        alert('Failed to delete sessions.');
      }
    } catch (err) {
      console.error('Batch delete error:', err);
      alert('Error during batch deletion.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F3F3]">
      <Navbar />

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        <Sidebar className="hidden lg:flex shrink-0" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#252525] tracking-tight">
                Reports & Insights
              </h1>
              <p className="text-xs sm:text-sm text-[#626262] font-normal mt-1">
                View scores, participant attendance, and performance reports from your live games.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1368CE] hover:bg-[#0F52A4] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Host Live Game</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">
                  Games Hosted
                </span>
                <div className="text-2xl sm:text-3xl font-heading font-semibold text-[#252525] mt-1">
                  {stats.totalSessions}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#46178F] flex items-center justify-center font-bold">
                <Gamepad2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">
                  Total Players
                </span>
                <div className="text-2xl sm:text-3xl font-heading font-semibold text-[#252525] mt-1">
                  {stats.totalLearners}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1368CE] flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">
                  Avg Participation
                </span>
                <div className="text-2xl sm:text-3xl font-heading font-semibold text-emerald-600 mt-1">
                  {stats.avgParticipation}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Past Sessions List */}
          <section className="bg-white rounded-2xl border border-[#E5E5E5] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-heading font-semibold text-[#252525]">
                  Recorded Sessions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F3F3F3] text-[#626262] text-xs font-medium">
                  {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>

              {/* Filters and Batch Actions */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#F7F7F8] border border-[#E5E5E5] p-1 rounded-xl text-xs font-medium">
                  <Filter className="w-3.5 h-3.5 text-[#626262] ml-1.5" />
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white text-[#252525] shadow-xs font-semibold'
                        : 'text-[#626262] hover:text-[#252525]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('completed')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'completed'
                        ? 'bg-white text-[#252525] shadow-xs font-semibold'
                        : 'text-[#626262] hover:text-[#252525]'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('waiting')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'waiting'
                        ? 'bg-white text-[#252525] shadow-xs font-semibold'
                        : 'text-[#626262] hover:text-[#252525]'
                    }`}
                  >
                    In Progress
                  </button>
                </div>

                {sessions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteAllSessions}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs"
                    title="Delete all sessions"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete All</span>
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-[#626262]">
                <div className="w-6 h-6 border-2 border-[#46178F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs font-medium">Loading reports...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#46178F] flex items-center justify-center mx-auto mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-[#252525] text-base">
                  No sessions match this filter
                </h3>
                <p className="text-xs text-[#626262] font-normal max-w-sm mx-auto mt-1 mb-4">
                  Host live games to populate attendance data and performance metrics.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#46178F] hover:bg-[#3D147D] text-white font-semibold text-xs shadow-xs transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Host a Game</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F7F7F8] text-[#626262] text-[11px] uppercase font-semibold border-b border-[#E5E5E5]">
                    <tr>
                      <th className="py-3 px-5">Game PIN</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Players</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {filteredSessions.map((s) => (
                      <tr key={s._id} className="hover:bg-[#F9F9F9] transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-[#252525]">
                          {s.pin}
                        </td>
                        <td className="py-3.5 px-5 text-[#626262] text-xs font-normal">
                          {new Date(s.createdAt).toLocaleDateString()} at{' '}
                          {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-5 font-medium text-[#252525]">
                          {s.participants?.length || 0} learners
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                              s.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleExportAttendance(s.pin)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F3F3F3] border border-[#E5E5E5] text-[#252525] text-xs font-semibold transition-all shadow-xs cursor-pointer"
                              title="Download Attendance CSV"
                            >
                              <Download className="w-3.5 h-3.5 text-[#46178F]" />
                              <span>CSV</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSession(s.pin)}
                              disabled={deletingPin === s.pin}
                              className="p-1.5 rounded-lg border border-[#E5E5E5] hover:border-rose-300 hover:bg-rose-50 text-[#626262] hover:text-rose-600 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                              title="Delete Session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default InsightsPage;
