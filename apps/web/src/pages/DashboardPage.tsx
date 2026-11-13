import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
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
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  GraduationCap,
  FolderOpen,
  FileText,
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

interface RosterItem {
  _id: string;
  courseCode: string;
  courseName: string;
  section: string;
  studentCount: number;
  createdAt: string;
}

interface SessionStats {
  totalSessions: number;
  totalLearners: number;
  avgParticipation: number;
}

interface ParsedStudent {
  rollNo: string;
  name: string;
  email: string;
  section?: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [rosters, setRosters] = useState<RosterItem[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalLearners: 0,
    avgParticipation: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Roster Bulk Upload Form
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [section, setSection] = useState('Section A');
  const [rawRosterText, setRawRosterText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'paste'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isSavingRoster, setIsSavingRoster] = useState(false);
  const [rosterMessage, setRosterMessage] = useState<string | null>(null);

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

      // 2. Fetch rosters from MongoDB
      const rosterRes = await fetch(`${REALTIME_URL}/api/rosters${teacherParam}`);
      if (rosterRes.ok) {
        const rosterData = await rosterRes.json();
        setRosters(rosterData.rosters || []);
      }

      // 3. Fetch real session stats from MongoDB
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

  const handleDeleteRoster = async (rosterId: string) => {
    if (!window.confirm('Delete this student roster?')) return;
    try {
      const res = await fetch(`${REALTIME_URL}/api/rosters/${rosterId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRosters((prev) => prev.filter((r) => r._id !== rosterId));
      }
    } catch (err) {
      console.error('Failed to delete roster:', err);
    }
  };

  // Process chosen or dropped file (.xlsx, .xls, .csv, .tsv, .txt)
  const processFile = (file: File) => {
    setRosterMessage(null);
    setUploadedFileName(file.name);

    // Auto-detect course code from filename if empty
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    if (!courseCode) {
      const matchCode = cleanName.match(/([A-Z]{2,4}\s*\d{3})/i);
      if (matchCode) setCourseCode(matchCode[1].toUpperCase());
    }

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          setRawRosterText(csv);
        } catch {
          setRosterMessage('Error parsing Excel spreadsheet. Please ensure it is a valid .xlsx or .xls file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV, TSV, or TXT
      const reader = new FileReader();
      reader.onload = (e) => {
        setRawRosterText((e.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSaveRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    setRosterMessage(null);

    if (!courseCode.trim() || !courseName.trim() || !section.trim()) {
      setRosterMessage('Please fill Course Code, Course Name, and Section.');
      return;
    }

    if (!rawRosterText.trim()) {
      setRosterMessage('Please select a file or paste at least one student record (Roll No, Name).');
      return;
    }

    setIsSavingRoster(true);
    try {
      const res = await fetch(`${REALTIME_URL}/api/rosters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user?.id,
          courseCode: courseCode.trim(),
          courseName: courseName.trim(),
          section: section.trim(),
          rawCsv: rawRosterText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsRosterModalOpen(false);
        setRawRosterText('');
        setUploadedFileName(null);
        setCourseCode('');
        setCourseName('');
        fetchDashboardData();
      } else {
        setRosterMessage(data.error || 'Failed to save roster.');
      }
    } catch (err: any) {
      setRosterMessage(err.message || 'Network error.');
    } finally {
      setIsSavingRoster(false);
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

  // Parse student records from current raw text
  const parsedStudents: ParsedStudent[] = React.useMemo(() => {
    if (!rawRosterText.trim()) return [];
    const lines = rawRosterText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const result: ParsedStudent[] = [];

    for (const line of lines) {
      if (/roll\s*(no|number)?/i.test(line) && /name/i.test(line)) continue;
      const parts = line.split(/[,;\t]+/).map((p) => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        result.push({
          rollNo: parts[0].toUpperCase(),
          name: parts[1],
          email: parts[2] || `${parts[0].toLowerCase()}@srmap.edu.in`,
          section: parts[3] || section,
        });
      }
    }
    return result;
  }, [rawRosterText, section]);

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
              Manage your interactive classroom activities, student rosters, launch live sessions, and track learning metrics.
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
                  {quizzes.length > 0
                    ? `${quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0)} questions drafted`
                    : 'Ready to draft'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-alix-violet-50 text-alix-violet-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            {/* Enrolled Students / Rosters */}
            <div className="p-5 rounded-2xl bg-white border border-alix-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
                  Enrolled Students (Rosters)
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-alix-indigo mt-1">
                  {rosters.reduce((acc, r) => acc + (r.studentCount || 0), 0)}
                </h3>
                <span className="text-xs font-semibold text-alix-cyan-600 inline-flex items-center mt-1">
                  {rosters.length > 0 ? `${rosters.length} sections registered` : 'No rosters uploaded'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-alix-cyan-50 text-alix-cyan-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* Active Sessions Held */}
            <div className="p-5 rounded-2xl bg-white border border-alix-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
                  Active Sessions Held
                </p>
                <h3 className="text-2xl font-heading font-extrabold text-alix-indigo mt-1">
                  {stats.totalSessions}
                </h3>
                <span className="text-xs font-semibold text-emerald-600 inline-flex items-center mt-1">
                  {stats.totalLearners} attendances logged
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              type="button"
              onClick={handleStartLiveClick}
              className="p-5 rounded-2xl bg-gradient-to-r from-alix-indigo to-alix-violet-900 text-white shadow-alix-md hover:shadow-alix-glow transition-all flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold text-alix-cyan-300">
                  <Play className="w-3 h-3 fill-current" />
                  <span>ALIX Live</span>
                </div>
                <h3 className="text-lg font-bold font-heading">Start Session</h3>
                <p className="text-[11px] text-alix-slate-200">
                  Project live questions to classroom.
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </button>

            <Link
              to="/create"
              className="p-5 rounded-2xl bg-white border border-alix-slate-200 hover:border-alix-violet-400 shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-alix-violet-100 text-[10px] font-semibold text-alix-violet-700">
                  <PlusCircle className="w-3 h-3" />
                  <span>ALIX Create</span>
                </div>
                <h3 className="text-lg font-bold font-heading text-alix-indigo">Create Activity</h3>
                <p className="text-[11px] text-alix-slate-500">
                  Draft questions and concept checks.
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-alix-slate-100 group-hover:bg-alix-violet-100 flex items-center justify-center transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4 text-alix-violet-600" />
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsRosterModalOpen(true)}
              className="p-5 rounded-2xl bg-white border border-alix-slate-200 hover:border-emerald-400 shadow-sm transition-all flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Anti-Proxy Protection</span>
                </div>
                <h3 className="text-lg font-bold font-heading text-alix-indigo">Upload Roster</h3>
                <p className="text-[11px] text-alix-slate-500">
                  Browse Excel/CSV to whitelist students.
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors shrink-0">
                <UploadCloud className="w-4 h-4 text-emerald-600" />
              </div>
            </button>
          </div>

          {/* Section: Class Rosters (Anti-Cheating Whitelist) */}
          <section className="bg-white rounded-2xl border border-alix-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-alix-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-heading font-bold text-alix-indigo">
                    Enrolled Class Rosters
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Anti-Proxy Enabled
                  </span>
                </div>
                <p className="text-xs text-alix-slate-500 mt-0.5">
                  Only students with verified Roll Numbers in these rosters can join your sessions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRosterModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Upload Section Roster</span>
              </button>
            </div>

            {rosters.length === 0 ? (
              <div className="p-8 text-center text-alix-slate-500">
                <GraduationCap className="w-10 h-10 text-alix-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-alix-indigo">No section rosters uploaded yet</p>
                <p className="text-xs text-alix-slate-400 mt-1 mb-4">
                  Browse or upload your student Roll Numbers, Names, and Emails to prevent photo-sharing and proxy attendance.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Upload Roster File
                </button>
              </div>
            ) : (
              <div className="divide-y divide-alix-slate-100">
                {rosters.map((r) => (
                  <div
                    key={r._id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-alix-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-alix-indigo text-white font-mono">
                          {r.courseCode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.section}
                        </span>
                        <span className="text-xs text-alix-slate-400">
                          {r.studentCount} Verified Students
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-alix-indigo">
                        {r.courseName}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoster(r._id)}
                      className="p-2 rounded-lg text-alix-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Roster"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Activity Library */}
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
                  Welcome, {user?.name || 'Instructor'}! Draft your first interactive quiz or concept check to launch live classroom sessions.
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
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-alix-cyan-50 text-alix-cyan-800 border border-alix-cyan-200 font-mono">
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
                        <Play className="w-3.5 h-3.5 fill-current text-alix-cyan-400" />
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

      {/* Modal: Bulk Upload Student Roster with Browse File Option */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-alix-xl border border-alix-slate-200 overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-alix-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-heading font-extrabold text-alix-indigo">
                    Upload Student Roster
                  </h3>
                </div>
                <p className="text-xs text-alix-slate-500 mt-0.5">
                  Browse your Excel or CSV file to whitelist enrolled students and prevent proxy attendance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="p-1.5 rounded-lg text-alix-slate-400 hover:text-alix-indigo hover:bg-alix-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoster} className="p-6 space-y-4">
              {rosterMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{rosterMessage}</span>
                </div>
              )}

              {/* Course Meta Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS 301"
                    className="w-full p-2.5 rounded-xl border border-alix-slate-300 text-sm font-bold text-alix-indigo outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Distributed Systems"
                    className="w-full p-2.5 rounded-xl border border-alix-slate-300 text-sm font-semibold text-alix-indigo outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                    Section / Batch *
                  </label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="Section A"
                    className="w-full p-2.5 rounded-xl border border-alix-slate-300 text-sm font-semibold text-alix-indigo outline-none"
                  />
                </div>
              </div>

              {/* Upload Mode Tabs */}
              <div className="flex border-b border-alix-slate-200 gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'file'
                      ? 'border-b-2 border-emerald-600 text-emerald-700'
                      : 'text-alix-slate-400 hover:text-alix-indigo'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Browse Excel / CSV File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('paste')}
                  className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'paste'
                      ? 'border-b-2 border-emerald-600 text-emerald-700'
                      : 'text-alix-slate-400 hover:text-alix-indigo'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Text Directly</span>
                </button>
              </div>

              {/* Mode 1: Browse File Dropzone */}
              {uploadMode === 'file' ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.csv,.tsv,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : uploadedFileName
                        ? 'border-emerald-400 bg-emerald-50/30'
                        : 'border-alix-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 bg-alix-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-inner">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>

                    {uploadedFileName ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{uploadedFileName}</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold">
                          {parsedStudents.length} Students parsed successfully! Click to choose a different file.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-alix-indigo">
                          Click to Browse File or Drag & Drop Here
                        </p>
                        <p className="text-xs text-alix-slate-400">
                          Supports Excel (.xlsx, .xls) and CSV (.csv, .tsv, .txt) files
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Browse Computer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview Table of first 5 parsed student rows */}
                  {parsedStudents.length > 0 && (
                    <div className="rounded-xl border border-alix-slate-200 overflow-hidden text-left bg-white shadow-sm">
                      <div className="bg-alix-slate-100 px-3 py-1.5 text-[11px] font-bold text-alix-slate-600 flex justify-between items-center">
                        <span>Preview (Showing 5 of {parsedStudents.length} students)</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </div>
                      <div className="divide-y divide-alix-slate-100 text-xs">
                        {parsedStudents.slice(0, 5).map((s, idx) => (
                          <div key={idx} className="px-3 py-1.5 flex items-center justify-between font-mono text-[11px]">
                            <span className="font-bold text-alix-indigo">{s.rollNo}</span>
                            <span className="text-alix-slate-700 font-sans font-medium">{s.name}</span>
                            <span className="text-alix-slate-400 truncate max-w-[130px]">{s.email}</span>
                            <span className="text-emerald-600 font-sans font-semibold">{s.section || section}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Mode 2: Paste Raw Text Area */
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500">
                      Paste Rows (Roll No, Name, Email, Section)
                    </label>
                    {parsedStudents.length > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {parsedStudents.length} students recognized
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={6}
                    value={rawRosterText}
                    onChange={(e) => setRawRosterText(e.target.value)}
                    placeholder={`Roll No, Student Name, Email, Section\nAP21110010001, Aarav Sharma, aarav_s@srmap.edu.in, A\nAP21110010002, Ananya Patel, ananya_p@srmap.edu.in, A\nAP21110010003, Rohan Verma, rohan_v@srmap.edu.in, A`}
                    className="w-full p-3 rounded-xl border border-alix-slate-300 text-xs font-mono text-alix-indigo outline-none focus:border-emerald-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-alix-slate-400 mt-1">
                    Format: One student per line. You can copy-paste columns directly from Excel or Google Sheets.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-alix-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-alix-slate-300 text-alix-slate-600 text-xs font-bold hover:bg-alix-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRoster || parsedStudents.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSavingRoster
                      ? 'Saving Roster...'
                      : `Save & Whitelist ${parsedStudents.length > 0 ? `${parsedStudents.length} Students` : ''}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-alix-slate-100 text-alix-slate-600 font-mono">
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
