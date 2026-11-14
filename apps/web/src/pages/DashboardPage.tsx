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
  Copy,
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
  section?: string;
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

  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleDuplicateQuiz = async (quizId: string) => {
    setDuplicatingId(quizId);
    try {
      const res = await fetch(`${REALTIME_URL}/api/quizzes/${quizId}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.quiz) {
        setQuizzes((prev) => [data.quiz, ...prev]);
      } else {
        alert(data.error || 'Failed to duplicate activity');
      }
    } catch (err: any) {
      alert(err.message || 'Network error duplicating activity');
    } finally {
      setDuplicatingId(null);
    }
  };

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
      navigate('/discover');
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
    <div className="min-h-screen flex flex-col bg-[#F3F3F3]">
      {/* 1. Signature Kahoot-style Crisp White Top Bar */}
      <Navbar />

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          className="hidden lg:flex shrink-0"
          onStartLive={handleStartLiveClick}
          onOpenRosters={() => setIsRosterModalOpen(true)}
          onDiscoverClick={() => navigate('/discover')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-6xl">
          {/* Section: Educator Toolbar (Exact Kahoot 4-Card Unified Royal Purple Grid) */}
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-[#252525] mb-3 tracking-tight">
              Educator toolbar
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Create activity from scratch */}
              <div className="bg-[#46178F] hover:bg-[#3D147D] text-white p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between min-h-[160px] group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white text-[#46178F] flex items-center justify-center shrink-0 shadow-xs">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-base leading-snug text-white">
                      Create activity
                    </h3>
                    <p className="text-xs text-white/90 font-normal mt-1 leading-relaxed">
                      Draft questions, concept checks, and polls.
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    to="/create"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white underline hover:no-underline"
                  >
                    <span>Create new</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2: AI Assisted Studio */}
              <div className="bg-[#46178F] hover:bg-[#3D147D] text-white p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between min-h-[160px] group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white text-[#46178F] flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-base leading-snug text-white">
                      AI Studio
                    </h3>
                    <p className="text-xs text-white/90 font-normal mt-1 leading-relaxed">
                      Instant curriculum-aligned questions.
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    to="/create?ai=true"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white underline hover:no-underline"
                  >
                    <span>Start creating</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Anti-Proxy Rosters */}
              <div className="bg-[#46178F] hover:bg-[#3D147D] text-white p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between min-h-[160px] group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white text-[#46178F] flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-base leading-snug text-white">
                      Class rosters
                    </h3>
                    <p className="text-xs text-white/90 font-normal mt-1 leading-relaxed">
                      Excel / CSV student roll numbers whitelist.
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRosterModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white underline hover:no-underline cursor-pointer"
                  >
                    <span>Upload file</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 4: Accuracy & Live Host */}
              <div className="bg-[#46178F] hover:bg-[#3D147D] text-white p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between min-h-[160px] group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white text-[#46178F] flex items-center justify-center shrink-0 shadow-xs">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-base leading-snug text-white">
                      Accuracy experience
                    </h3>
                    <p className="text-xs text-white/90 font-normal mt-1 leading-relaxed">
                      Encourage correct answers over speed.
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleStartLiveClick}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white underline hover:no-underline cursor-pointer"
                  >
                    <span>Try now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: My ALIX Activities Grid */}
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-heading font-semibold text-[#252525] tracking-tight">
                  My Classroom Activities ({displayedQuizzes.length})
                </h2>
                <p className="text-xs font-normal text-[#626262]">
                  Ready to launch live on your lecture hall projector screen.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/create"
                  className="inline-flex items-center gap-1.5 bg-[#1368CE] hover:bg-[#0F52A4] text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Activity</span>
                </Link>
              </div>
            </div>

            {/* In-page Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-4">
              {filterTags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => setActiveFilter(tag.value)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === tag.value
                      ? 'bg-[#46178F] text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-[#F3F3F3] text-[#252525] border border-[#E5E5E5] font-normal'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center text-[#626262]">
                <div className="w-6 h-6 border-2 border-[#46178F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs font-medium">Loading activities from database...</span>
              </div>
            ) : displayedQuizzes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E5E5] p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#46178F] flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-[#252525] text-base">
                  No activities in this category
                </h3>
                <p className="text-xs text-[#626262] font-normal max-w-sm mx-auto mt-1 mb-4">
                  Create your first quiz or concept check to launch interactive live sessions.
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-1.5 bg-[#46178F] hover:bg-[#3D147D] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Activity</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="bg-white rounded-2xl border border-[#E5E5E5] p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group"
                  >
                    <div>
                      {/* Subject, Course Code, and Section tags */}
                      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#46178F] border border-purple-200">
                          {quiz.subject || 'Activity'}
                        </span>
                        {quiz.courseCode && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 font-mono">
                            {quiz.courseCode}
                          </span>
                        )}
                        {quiz.section && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                            {quiz.section}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-semibold text-base text-[#252525] group-hover:text-[#46178F] transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>

                      <p className="text-xs text-[#626262] font-normal mt-1">
                        {quiz.questions?.length || 0} Questions • Created{' '}
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action Buttons: Host, Edit, Duplicate, Delete */}
                    <div className="pt-4 mt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-2 flex-wrap">
                      <Link
                        to={`/host/${quiz._id}`}
                        className="inline-flex items-center gap-1.5 bg-[#1368CE] hover:bg-[#0F52A4] text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Host Live</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/create?edit=${quiz._id}`}
                          className="p-1.5 rounded-lg text-[#626262] hover:text-[#46178F] hover:bg-[#F3F3F3] transition-colors"
                          title="Edit Activity"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDuplicateQuiz(quiz._id)}
                          disabled={duplicatingId === quiz._id}
                          className="p-1.5 rounded-lg text-[#626262] hover:text-[#00A6A6] hover:bg-[#F3F3F3] transition-colors cursor-pointer disabled:opacity-50"
                          title="Make a Copy (Duplicate)"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          disabled={deletingId === quiz._id}
                          className="p-1.5 rounded-lg text-[#626262] hover:text-[#E21B5A] hover:bg-rose-50 transition-colors cursor-pointer"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-heading font-semibold text-[#252525] tracking-tight">
                    Enrolled Class Rosters ({rosters.length})
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Anti-Proxy Active
                  </span>
                </div>
                <p className="text-xs text-[#626262] font-normal mt-0.5">
                  Only students with verified Roll Numbers in these rosters can enter your live rooms.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRosterModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#46178F] hover:bg-[#3D147D] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Upload Section Roster</span>
              </button>
            </div>

            {rosters.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#E5E5E5] shadow-xs">
                <GraduationCap className="w-10 h-10 text-[#626262]/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#252525]">No rosters uploaded yet</p>
                <p className="text-xs text-[#626262] font-normal mt-1 mb-4 max-w-md mx-auto">
                  Upload an Excel or CSV file of Roll Numbers to protect against photo-sharing and proxy attendance.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#46178F] hover:bg-[#3D147D] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Browse Roster File
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rosters.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#252525] text-white font-mono">
                          {r.courseCode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-[#46178F] border border-purple-200">
                          {r.section}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#252525] truncate">
                        {r.courseName}
                      </h4>
                      <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{r.studentCount} Verified Students</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoster(r._id)}
                      className="p-2 rounded-lg text-[#626262] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
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
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRosterModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#E5E5E5] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#00A6A6]" />
                  <h3 className="text-lg font-heading font-semibold text-[#252525]">
                    Bulk Upload Student Roster
                  </h3>
                </div>
                <p className="text-xs text-[#626262] font-normal mt-0.5">
                  Browse Excel or CSV file so only enrolled students can join your live sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="p-1.5 rounded-lg text-[#626262] hover:text-[#252525] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoster} className="p-6 space-y-4">
              {rosterMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{rosterMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#626262] mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CS 301"
                    className="w-full p-2.5 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#252525] outline-none focus:border-[#46178F] uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#626262] mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Distributed Systems"
                    className="w-full p-2.5 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#252525] outline-none focus:border-[#46178F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#626262] mb-1">
                    Section / Batch *
                  </label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="Section A"
                    className="w-full p-2.5 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#252525] outline-none focus:border-[#46178F]"
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

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E5E5E5] text-[#252525] text-xs font-semibold hover:bg-[#F3F3F3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRoster || parsedStudents.length === 0}
                  className="px-5 py-2.5 rounded-lg bg-[#46178F] hover:bg-[#3D147D] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLaunchModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-[#1368CE] fill-current" />
                <h3 className="text-lg font-heading font-semibold text-[#252525]">
                  Select Activity to Host
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-1 rounded-lg text-[#626262] hover:text-[#252525] hover:bg-[#F3F3F3]"
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
                  className="w-full p-3.5 rounded-xl border border-[#E5E5E5] hover:border-[#46178F] hover:bg-purple-50/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-[#252525] group-hover:text-[#46178F]">
                      {q.title}
                    </h4>
                    <p className="text-xs text-[#626262] font-normal">
                      {q.subject} • {q.questions?.length || 0} Questions
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-[#46178F] fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
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
