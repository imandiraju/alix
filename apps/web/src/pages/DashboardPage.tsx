import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { REALTIME_URL } from '../services/socket';
import {
  Play,
  Plus,
  Users,
  Sparkles,
  BookOpen,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  FileSpreadsheet,
  GraduationCap,
  FolderOpen,
  FileText,
  Radio,
  ArrowRight,
  Edit3,
  Layers,
  Code,
  Cpu,
  Compass,
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
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const viewParam = searchParams.get('view') || searchParams.get('tab');
    if (viewParam === 'rosters') {
      setActiveFilter('Rosters');
      setIsRosterModalOpen(true);
    } else if (viewParam === 'present') {
      if (quizzes.length === 1) {
        navigate(`/host/${quizzes[0]._id}`);
      } else if (quizzes.length > 1) {
        setIsLaunchModalOpen(true);
      }
    } else if (viewParam === 'discover' || viewParam === 'activities') {
      setActiveFilter('All');
    }
  }, [searchParams, quizzes, navigate]);

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

  const filterTags = [
    { label: 'All Activities', value: 'All' },
    { label: 'Computer Science', value: 'CSE' },
    { label: 'Mathematics', value: 'Math' },
    { label: 'Engineering', value: 'Eng' },
    { label: 'Anti-Proxy Rosters', value: 'Rosters' },
    { label: 'Interactive Polls', value: 'Polls' },
  ];

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

      // 2. Fetch real rosters from MongoDB
      const rosterRes = await fetch(`${REALTIME_URL}/api/rosters${teacherParam}`);
      if (rosterRes.ok) {
        const rosterData = await rosterRes.json();
        setRosters(rosterData.rosters || []);
      }

      // 3. Fetch real classroom stats
      const statsRes = await fetch(`${REALTIME_URL}/api/sessions/stats${teacherParam}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    setDeletingId(quizId);
    try {
      const res = await fetch(`${REALTIME_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      }
    } catch (err) {
      console.error('Delete quiz failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRoster = async (rosterId: string) => {
    if (!window.confirm('Delete this enrolled roster? Students in this section will no longer be whitelisted.')) return;
    try {
      const res = await fetch(`${REALTIME_URL}/api/rosters/${rosterId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRosters((prev) => prev.filter((r) => r._id !== rosterId));
      }
    } catch (err) {
      console.error('Delete roster failed:', err);
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

    if (!courseCode.trim() || !courseName.trim()) {
      setRosterMessage('Course Code and Course Name are required.');
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
          courseCode: courseCode.trim().toUpperCase(),
          courseName: courseName.trim(),
          section: section.trim() || 'Section A',
          rawText: rawRosterText,
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
      setRosterMessage(err.message || 'Network error saving roster.');
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

  // Filter quizzes based on active tab
  const displayedQuizzes = React.useMemo(() => {
    if (activeFilter === 'All') return quizzes;
    return quizzes.filter((q) => {
      const matchSub = (q.subject || '').toLowerCase().includes(activeFilter.toLowerCase());
      const matchCode = (q.courseCode || '').toLowerCase().includes(activeFilter.toLowerCase());
      return matchSub || matchCode;
    });
  }, [quizzes, activeFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F2]">
      {/* 1. Signature Kahoot-style Royal Purple Top Bar */}
      <Navbar />

      {/* 2. Secondary Filter Pills Bar (Mirroring Kahoot Discover Tags Bar) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 overflow-x-auto scrollbar-none sticky top-16 z-30 shadow-xs">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2">
          {filterTags.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => setActiveFilter(tag.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tag.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          className="hidden lg:flex shrink-0"
          onStartLive={handleStartLiveClick}
          onOpenRosters={() => setIsRosterModalOpen(true)}
          onDiscoverClick={() => setActiveFilter('All')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-6xl">
          {/* Section: "Create your own: quick tools to get started" (Kahoot exact 3-card block) */}
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-800 mb-3 tracking-tight">
              Create your own: quick tools to get started
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Orange Content From Scratch */}
              <div className="bg-[#E25C1D] text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                    <Plus className="w-6 h-6 stroke-[3] text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base leading-snug">
                      Create activity from scratch
                    </h3>
                    <p className="text-xs text-white/80 mt-1">
                      Draft questions, concept checks, and polls.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Link
                    to="/create"
                    className="px-4 py-2 bg-white text-[#E25C1D] font-black text-xs rounded-xl shadow-sm hover:bg-white/95 active:scale-95 transition-all"
                  >
                    Create new
                  </Link>
                </div>
              </div>

              {/* Card 2: Purple AI Assisted Question Creator */}
              <div className="bg-[#864CBF] text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                    <Sparkles className="w-5 h-5 text-alix-cyan-300" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-alix-cyan-300 mb-0.5">
                      <span>⚡ AI Assisted</span>
                    </div>
                    <h3 className="font-heading font-black text-base leading-snug">
                      Save time! Create with AI Studio
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      Instant curriculum-aligned questions.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Link
                    to="/create"
                    className="px-4 py-2 bg-white text-[#864CBF] font-black text-xs rounded-xl shadow-sm hover:bg-white/95 active:scale-95 transition-all"
                  >
                    Start creating
                  </Link>
                </div>
              </div>

              {/* Card 3: Crimson Upload Rosters */}
              <div className="bg-[#E21B3C] text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/90 mb-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      <span>Anti-Proxy Protection</span>
                    </div>
                    <h3 className="font-heading font-black text-base leading-snug">
                      Upload student roster file
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      Excel / CSV student roll numbers whitelist.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRosterModalOpen(true)}
                    className="px-4 py-2 bg-white text-[#E21B3C] font-black text-xs rounded-xl shadow-sm hover:bg-white/95 active:scale-95 transition-all cursor-pointer"
                  >
                    Upload file
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: My ALIX Activities Grid */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base sm:text-lg font-heading font-black text-slate-800 tracking-tight">
                  My Classroom Activities ({displayedQuizzes.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Ready to launch live on your lecture hall projector screen.
                </p>
              </div>

              <Link
                to="/create"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1368CE] hover:bg-[#105AB3] text-white font-black text-xs shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Activity</span>
              </Link>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                <div className="w-6 h-6 border-2 border-alix-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs font-bold">Loading activities from database...</span>
              </div>
            ) : displayedQuizzes.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-slate-800 text-base">
                  No activities in this category
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Create your first quiz or concept check to launch interactive live sessions.
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#26890C] hover:bg-[#20740A] text-white font-black text-xs shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Activity</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Subject and Course Code tags */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-alix-violet-50 text-alix-violet-800 border border-alix-violet-200">
                          {quiz.subject || 'Activity'}
                        </span>
                        {quiz.courseCode && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-alix-cyan-50 text-alix-cyan-900 border border-alix-cyan-200 font-mono">
                            {quiz.courseCode}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-black text-base text-slate-900 group-hover:text-alix-indigo transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {quiz.questions?.length || 0} Questions • Created{' '}
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/host/${quiz._id}`}
                        className="px-4 py-2 rounded-xl bg-[#1368CE] hover:bg-[#105AB3] text-white font-black text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Host Live</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          disabled={deletingId === quiz._id}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Enrolled Class Rosters (Anti-Proxy Whitelist) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-heading font-black text-slate-800 tracking-tight">
                    Enrolled Class Rosters ({rosters.length})
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Anti-Proxy Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Only students with verified Roll Numbers in these rosters can enter your live rooms.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRosterModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#26890C] hover:bg-[#20740A] text-white font-black text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Upload Section Roster</span>
              </button>
            </div>

            {rosters.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No rosters uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-3">
                  Upload an Excel or CSV file of Roll Numbers to protect against photo-sharing and proxy attendance.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#26890C] hover:bg-[#20740A] text-white text-xs font-black transition-all cursor-pointer"
                >
                  Browse Roster File
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rosters.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-900 text-white font-mono">
                          {r.courseCode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {r.section}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {r.courseName}
                      </h4>
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{r.studentCount} Verified Students</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoster(r._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="Delete Roster"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-heading font-black text-slate-900">
                    Bulk Upload Student Roster
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse Excel or CSV file so only enrolled students can join your live sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CS 301"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Distributed Systems"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Section / Batch *
                  </label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="Section A"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Upload Mode Tabs */}
              <div className="flex border-b border-slate-200 gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'file'
                      ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
                      : 'text-slate-400 hover:text-slate-700'
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
                      ? 'border-b-2 border-emerald-600 text-emerald-700 font-black'
                      : 'text-slate-400 hover:text-slate-700'
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
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 bg-slate-50'
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
                          {parsedStudents.length} Students recognized! Click to choose a different file.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">
                          Click to Browse File or Drag & Drop Here
                        </p>
                        <p className="text-xs text-slate-400">
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
                    <div className="rounded-xl border border-slate-200 overflow-hidden text-left bg-white shadow-sm">
                      <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 flex justify-between items-center">
                        <span>Preview (Showing 5 of {parsedStudents.length} students)</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {parsedStudents.slice(0, 5).map((s, idx) => (
                          <div key={idx} className="px-3 py-1.5 flex items-center justify-between font-mono text-[11px]">
                            <span className="font-bold text-slate-800">{s.rollNo}</span>
                            <span className="text-slate-700 font-sans font-medium">{s.name}</span>
                            <span className="text-slate-400 truncate max-w-[130px]">{s.email}</span>
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
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
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 outline-none focus:border-emerald-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format: One student per line. You can copy-paste columns directly from Excel or Google Sheets.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
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

      {/* Modal: Choose which activity to host live */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-alix-violet-600 fill-current" />
                <h3 className="text-lg font-heading font-black text-slate-900">
                  Select Activity to Host
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-80 overflow-y-auto">
              {quizzes.map((q) => (
                <button
                  key={q._id}
                  type="button"
                  onClick={() => {
                    setIsLaunchModalOpen(false);
                    navigate(`/host/${q._id}`);
                  }}
                  className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-alix-violet-500 hover:bg-alix-violet-50 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-alix-indigo">
                      {q.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {q.subject} • {q.questions?.length || 0} Questions
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-alix-violet-600 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DashboardPage;
