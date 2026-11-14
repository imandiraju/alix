import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import AlixLogo from '../components/common/AlixLogo';
import { REALTIME_URL } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { AiQuizStudioModal } from '../components/creator/AiQuizStudioModal';
import {
  PlusCircle,
  Trash2,
  Copy,
  Save,
  Sparkles,
  Clock,
  Zap,
  ArrowLeft,
  CheckCircle2,
  CheckSquare,
  Square,
  BarChart3,
  Play,
  LayoutDashboard,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Layers,
  X,
  SlidersHorizontal,
  Settings2,
} from 'lucide-react';

interface QuestionDraft {
  id: string;
  type?: 'multiple_choice' | 'true_false' | 'multi_select' | 'poll';
  text: string;
  timeLimit: number;
  points: number;
  options: string[];
  correctIndex: number;
  correctIndices?: number[];
  image?: string;
  mediaUrl?: string;
}

export const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editQuizId = searchParams.get('edit');
  const isEditMode = Boolean(editQuizId);
  const { user } = useAuth();
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(user?.department || '');
  const [courseCode, setCourseCode] = useState('');
  const [section, setSection] = useState('');
  const [description, setDescription] = useState('');
  const [rosters, setRosters] = useState<any[]>([]);
  const [selectedRosterId, setSelectedRosterId] = useState<string>('');
  const [showProperties, setShowProperties] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Automatically open AI Studio if query param ?ai=true is present
  React.useEffect(() => {
    if (searchParams.get('ai') === 'true') {
      setIsAiModalOpen(true);
    }
  }, [searchParams]);

  // Load existing quiz if in Edit mode
  React.useEffect(() => {
    if (editQuizId) {
      fetch(`${REALTIME_URL}/api/quizzes/${editQuizId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.quiz) {
            setTitle(d.quiz.title || '');
            setSubject(d.quiz.subject || '');
            setCourseCode(d.quiz.courseCode || '');
            setSection(d.quiz.section || '');
            setDescription(d.quiz.description || '');
            if (d.quiz.rosterId) setSelectedRosterId(d.quiz.rosterId);
            if (Array.isArray(d.quiz.questions) && d.quiz.questions.length > 0) {
              setQuestions(d.quiz.questions);
              setActiveQuestionId(d.quiz.questions[0].id || 'q-1');
            }
          }
        })
        .catch((err) => console.warn('[ALIX Edit Activity] Load error:', err));
    }
  }, [editQuizId]);

  React.useEffect(() => {
    if (user?.id) {
      fetch(`${REALTIME_URL}/api/rosters?teacherId=${user.id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.rosters) setRosters(d.rosters);
        })
        .catch(() => {});
    }
  }, [user]);

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q-1',
      text: '',
      timeLimit: 30,
      points: 1000,
      options: ['', '', '', ''],
      correctIndex: 0,
    },
  ]);

  const [activeQuestionId, setActiveQuestionId] = useState<string>('q-1');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fullscreen Presentation Deck Mode
  const [isFullscreenPresentation, setIsFullscreenPresentation] = useState(false);
  const [presentationSlideIdx, setPresentationSlideIdx] = useState(0);
  const [revealSolution, setRevealSolution] = useState(false);

  React.useEffect(() => {
    if (!isFullscreenPresentation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setPresentationSlideIdx((prev) => Math.min(questions.length - 1, prev + 1));
        setRevealSolution(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPresentationSlideIdx((prev) => Math.max(0, prev - 1));
        setRevealSolution(false);
      } else if (e.key === 'Escape') {
        setIsFullscreenPresentation(false);
      } else if (e.key === 'Enter') {
        setRevealSolution((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenPresentation, questions.length]);

  const activeQuestion =
    questions.find((q) => q.id === activeQuestionId) || questions[0];

  const handleAddQuestion = (type: 'multiple_choice' | 'true_false' | 'multi_select' | 'poll' = 'multiple_choice') => {
    const newId = `q-${Date.now()}`;
    const newQuestion: QuestionDraft = {
      id: newId,
      type,
      text: '',
      timeLimit: 30,
      points: type === 'poll' ? 0 : 1000,
      options: type === 'true_false' ? ['True', 'False'] : ['', '', '', ''],
      correctIndex: 0,
      correctIndices: type === 'multi_select' ? [0] : undefined,
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newId);
  };

  const handleDuplicateQuestion = (qId: string) => {
    const target = questions.find((q) => q.id === qId);
    if (!target) return;
    const newId = `q-${Date.now()}`;
    const duplicated: QuestionDraft = {
      ...target,
      id: newId,
      text: target.text ? `${target.text} (Copy)` : '',
      options: [...target.options],
      correctIndices: target.correctIndices ? [...target.correctIndices] : undefined,
    };
    const targetIndex = questions.findIndex((q) => q.id === qId);
    const updated = [...questions];
    updated.splice(targetIndex + 1, 0, duplicated);
    setQuestions(updated);
    setActiveQuestionId(newId);
  };

  const handleToggleMultiCorrect = (index: number) => {
    const currentList = activeQuestion.correctIndices || [activeQuestion.correctIndex ?? 0];
    let nextList: number[];
    if (currentList.includes(index)) {
      if (currentList.length === 1) return; // Keep at least one correct
      nextList = currentList.filter((i) => i !== index);
    } else {
      nextList = [...currentList, index].sort();
    }
    const updated = questions.map((q) =>
      q.id === activeQuestion.id
        ? {
            ...q,
            correctIndices: nextList,
            correctIndex: nextList[0],
          }
        : q
    );
    setQuestions(updated);
  };

  const handleSetQuestionType = (newType: 'multiple_choice' | 'true_false' | 'multi_select' | 'poll') => {
    if (activeQuestion.type === newType) return;
    const updated = questions.map((q) => {
      if (q.id !== activeQuestion.id) return q;
      if (newType === 'true_false') {
        return {
          ...q,
          type: newType,
          options: ['True', 'False'],
          correctIndex: q.correctIndex > 1 ? 0 : q.correctIndex,
          correctIndices: [q.correctIndex > 1 ? 0 : q.correctIndex],
        };
      }
      if (newType === 'multi_select') {
        const baseOpts = q.options.length >= 2 ? (q.options.length === 2 ? [...q.options, '', ''] : q.options) : ['', '', '', ''];
        const existingIndices = q.correctIndices && q.correctIndices.length > 0 ? q.correctIndices : [q.correctIndex ?? 0];
        return {
          ...q,
          type: newType,
          options: baseOpts,
          correctIndices: existingIndices,
        };
      }
      if (newType === 'poll') {
        const baseOpts = q.options.length >= 2 ? (q.options.length === 2 ? [...q.options, '', ''] : q.options) : ['', '', '', ''];
        return {
          ...q,
          type: newType,
          options: baseOpts,
          points: 0,
        };
      }
      // multiple_choice
      const baseOpts = q.options.length >= 2 ? (q.options.length === 2 ? [...q.options, '', ''] : q.options) : ['', '', '', ''];
      return {
        ...q,
        type: newType,
        options: baseOpts,
        correctIndex: q.correctIndex ?? 0,
        correctIndices: [q.correctIndex ?? 0],
      };
    });
    setQuestions(updated);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (questions.length <= 1) {
      alert('Activity must have at least one question.');
      return;
    }
    const filtered = questions.filter((q) => q.id !== qId);
    setQuestions(filtered);
    if (activeQuestionId === qId) {
      setActiveQuestionId(filtered[0].id);
    }
  };

  const handleImportAiQuiz = (data: {
    title: string;
    subject: string;
    description: string;
    questions: any[];
  }) => {
    if (data.title) setTitle(data.title);
    if (data.subject) setSubject(data.subject);
    if (data.description) setDescription(data.description);
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      const mappedQuestions: QuestionDraft[] = data.questions.map((q, idx) => ({
        id: q.id || `q-ai-${Date.now()}-${idx}`,
        type: q.type || 'multiple_choice',
        text: q.text || '',
        timeLimit: typeof q.timeLimit === 'number' ? q.timeLimit : 30,
        points: typeof q.points === 'number' ? q.points : 1000,
        options: Array.isArray(q.options) && q.options.length > 0
          ? q.options
          : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        correctIndices: Array.isArray(q.correctIndices)
          ? q.correctIndices
          : [typeof q.correctIndex === 'number' ? q.correctIndex : 0],
      }));
      setQuestions(mappedQuestions);
      setActiveQuestionId(mappedQuestions[0].id);
    }
    setIsAiModalOpen(false);
  };

  const handleUpdateActiveQuestion = (field: keyof QuestionDraft, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === activeQuestion.id ? { ...q, [field]: value } : q
      )
    );
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === activeQuestion.id
              ? { ...q, image: dataUrl, mediaUrl: dataUrl }
              : q
          )
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === activeQuestion.id
          ? { ...q, image: '', mediaUrl: '' }
          : q
      )
    );
  };

  const handleUpdateOption = (index: number, val: string) => {
    const newOptions = [...activeQuestion.options];
    newOptions[index] = val;
    handleUpdateActiveQuestion('options', newOptions);
  };

  const handleSave = async () => {
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please enter an Activity Title.');
      return;
    }

    if (!subject.trim()) {
      setErrorMessage('Please specify the Subject or Academic Discipline.');
      return;
    }

    // Check that each question has a prompt and at least 2 options filled
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setErrorMessage(`Question ${i + 1} prompt cannot be empty.`);
        return;
      }
      const validOptions = q.options.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        setErrorMessage(`Question ${i + 1} must have at least 2 non-empty choices.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const endpoint = isEditMode
        ? `${REALTIME_URL}/api/quizzes/${editQuizId}`
        : `${REALTIME_URL}/api/quizzes`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user?.id,
          rosterId: selectedRosterId || undefined,
          title: title.trim(),
          subject: subject.trim(),
          courseCode: courseCode.trim(),
          section: section.trim(),
          description: description.trim(),
          questions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.quiz) {
        setCreatedQuizId(data.quiz._id);
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.error || 'Failed to save activity to database.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error saving activity.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-alix-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-[1550px] w-full mx-auto">
        <Sidebar className="hidden lg:flex" />

        <main className="flex-1 p-4 sm:p-6 w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-alix-violet-700 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ALIX Create • Authoring Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-alix-indigo">
                {isEditMode ? 'Edit Classroom Activity' : 'Create Classroom Activity'}
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="btn-tactile-primary"
                title="Generate quiz with Grok ➡️ Gemini AI (Enterprise Feature)"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Quiz Studio</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                  PRO
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const activeIdx = questions.findIndex((q) => q.id === activeQuestion.id);
                  setPresentationSlideIdx(Math.max(0, activeIdx));
                  setRevealSolution(false);
                  setIsFullscreenPresentation(true);
                }}
                className="btn-tactile-amber"
                title="Present slides in full screen like a slideshow"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Present Fullscreen</span>
              </button>

              <Link
                to="/dashboard"
                className="btn-tactile-white"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-tactile-green"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : isEditMode ? 'Update Activity' : 'Save Activity'}</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Activity Metadata Inputs */}
          <div className="card-tactile p-6 mb-6 space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Activity Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg sm:text-xl font-heading font-black text-slate-900 input-tactile"
                placeholder="e.g. Distributed Consensus & Fault Tolerance"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject / Discipline *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 input-tactile"
                  placeholder="e.g. Computer Science, Mechanical..."
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Course Code (Optional)
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 input-tactile"
                  placeholder="e.g. CS 301, CSE 102"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Section (Optional)
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 input-tactile"
                  placeholder="e.g. Sec A, Section 1, Batch B"
                />
              </div>
            </div>

            {/* Anti-Proxy Roster Selector */}
            <div className="pt-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Enforce Section Roster (Anti-Proxy Whitelist)</span>
              </label>
              <select
                value={selectedRosterId}
                onChange={(e) => {
                  setSelectedRosterId(e.target.value);
                  const matched = rosters.find((r) => r._id === e.target.value);
                  if (matched) {
                    if (!courseCode) setCourseCode(matched.courseCode);
                    if (!subject) setSubject(matched.courseName);
                    if (!section) setSection(matched.section);
                  }
                }}
                className="w-full input-tactile cursor-pointer"
              >
                <option value="">None (Open to all students with PIN)</option>
                {rosters.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.courseCode} - {r.section} ({r.studentCount} Students Whitelisted)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-alix-slate-400 mt-1">
                {selectedRosterId
                  ? '🔒 Protected: Only students with enrolled Roll Numbers can enter this session.'
                  : 'Students can join by entering any display name.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                Description / Learning Goals (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm text-alix-slate-600 border-b border-alix-slate-200 focus:border-alix-violet-600 outline-none pb-1"
                placeholder="Lecture topic, week, or outcomes..."
              />
            </div>
          </div>

          {/* Question Editor Grid: 3-Panel Slide Presentation Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 1. Left Panel: Slide Deck Navigator (Col span 3) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Slide Deck ({questions.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="btn-tactile-white text-xs px-2.5 py-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isActive = q.id === activeQuestion.id;
                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                        isActive
                          ? 'bg-violet-50/90 border-violet-600 shadow-[0_4px_0_#7C3AED] ring-2 ring-violet-200'
                          : 'bg-white border-slate-300 shadow-[0_2px_0_#CBD5E1] hover:border-slate-400'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveQuestionId(q.id)}
                        className="w-full text-left cursor-pointer"
                      >
                        {/* Slide Top Bar */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-slate-900">
                            Slide {idx + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                              q.type === 'true_false'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : q.type === 'multi_select'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : q.type === 'poll'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-violet-100 text-violet-800 border-violet-300'
                            }`}
                          >
                            {q.type === 'true_false' ? 'T/F' : q.type === 'multi_select' ? 'MULTI' : q.type === 'poll' ? 'POLL' : 'QUIZ'}
                          </span>
                        </div>

                        {/* Miniature Slide Preview */}
                        <div className="w-full h-16 rounded-xl bg-slate-950 p-2 flex flex-col justify-between border-2 border-slate-700 relative overflow-hidden shadow-inner">
                          <div className="w-full h-2 rounded bg-white/30 truncate text-[7px] text-white/90 px-1 overflow-hidden font-bold">
                            {q.text || 'Question Prompt...'}
                          </div>
                          {q.image ? (
                            <div className="w-full h-6 rounded overflow-hidden my-0.5 bg-black/40">
                              <img src={q.image} alt="Visual" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-white/40 text-[9px]">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-1">
                            <div className="h-2 rounded bg-[#E21B3C]" />
                            <div className="h-2 rounded bg-[#1368CE]" />
                          </div>
                        </div>

                        <p className="text-xs text-slate-800 truncate font-bold mt-2">
                          {q.text || 'Untitled Question Prompt...'}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                          {q.timeLimit}s • {q.points}pts
                        </div>
                      </button>

                      {/* Slide Action Buttons */}
                      <div className="flex items-center justify-end gap-1 pt-1.5 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(q.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-violet-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Duplicate slide"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Big Add Slide Card at bottom of deck */}
                <button
                  type="button"
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-400 hover:border-violet-600 hover:bg-violet-50/60 text-slate-700 hover:text-violet-800 font-heading font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 text-violet-600" />
                  <span>Add Question Slide</span>
                </button>

                {/* AI Generator Quick Trigger */}
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="btn-tactile-primary w-full text-xs py-2.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate with AI Studio</span>
                </button>
              </div>
            </div>

            {/* 2. Center Panel: 16:9 Presentation Slide Canvas */}
            <div className={`${showProperties ? 'lg:col-span-6' : 'lg:col-span-9'} bg-gradient-to-br from-[#1E0B36] via-[#2A104E] to-[#140626] rounded-3xl border-2 border-slate-700 p-5 sm:p-7 shadow-2xl relative flex flex-col justify-between min-h-[580px] text-white transition-all duration-300`}>
              {/* Slide Format Indicator Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-white/20 text-white font-mono text-xs font-bold border border-white/20">
                    Slide {questions.findIndex((q) => q.id === activeQuestion.id) + 1} of {questions.length}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-xs font-black uppercase tracking-wider">
                    {activeQuestion.type === 'true_false' ? 'True / False' : activeQuestion.type === 'multi_select' ? 'Multi-Select' : activeQuestion.type === 'poll' ? 'Opinion Poll' : 'Quiz (Single)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!showProperties && (
                    <button
                      type="button"
                      onClick={() => setShowProperties(true)}
                      className="btn-tactile-primary text-xs px-3 py-1.5"
                      title="Open Question Properties"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Properties</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const activeIdx = questions.findIndex((q) => q.id === activeQuestion.id);
                      setPresentationSlideIdx(Math.max(0, activeIdx));
                      setRevealSolution(false);
                      setIsFullscreenPresentation(true);
                    }}
                    className="btn-tactile-white text-xs px-3 py-1.5"
                    title="Present this slide fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Slide Top: Prominent Question Prompt Input */}
              <div className="my-3">
                <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-xl border-2 border-white/40">
                  <textarea
                    rows={2}
                    value={activeQuestion.text}
                    onChange={(e) => handleUpdateActiveQuestion('text', e.target.value)}
                    className="w-full text-center text-base sm:text-xl font-heading font-black text-slate-900 placeholder-slate-400 outline-none bg-transparent resize-none leading-snug"
                    placeholder={
                      activeQuestion.type === 'true_false'
                        ? 'Type True or False statement here...'
                        : activeQuestion.type === 'poll'
                        ? 'Type your opinion or poll prompt here...'
                        : 'Start typing your question prompt here...'
                    }
                  />
                </div>
              </div>

              {/* Slide Middle: Presentation Visual / Media Box (Click to upload diagram/formula/image) */}
              <div className="my-auto py-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {activeQuestion.image ? (
                  <div className="relative group max-w-sm sm:max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-white/30 bg-black/40 shadow-xl">
                    <img
                      src={activeQuestion.image}
                      alt="Question Visual Prompt"
                      className="w-full max-h-36 sm:max-h-48 object-contain mx-auto bg-black/20"
                    />
                    {/* Hover Actions Bar */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#252525] font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Choose a different image"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#46178F]" />
                        <span>Change Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Remove image from question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageDrop}
                    className="w-full max-w-sm mx-auto h-28 sm:h-36 rounded-2xl bg-white/10 border-2 border-dashed border-white/30 hover:border-white/60 hover:bg-white/15 flex flex-col items-center justify-center gap-1.5 text-white/80 transition-all cursor-pointer p-4 text-center group active:scale-98"
                    role="button"
                    tabIndex={0}
                    title="Click to browse or drop an image file"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform shadow-inner">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-white">Presentation Visual Prompt</div>
                    <div className="text-[10px] text-white/70 font-normal">
                      Click to upload diagram, formula, or image (PNG, JPG, SVG)
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Bottom: Answer Choices Blocks (Tactile 3D Buttons) */}
              <div className="mt-3">
                {activeQuestion.type === 'true_false' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('correctIndex', 0)}
                      className={`p-4 rounded-2xl text-center transition-all flex items-center justify-between cursor-pointer border-2 border-[#B5142F] border-b-4 border-b-[#8B0F24] active:border-b-2 active:translate-y-1 ${
                        activeQuestion.correctIndex === 0
                          ? 'bg-[#E21B3C] shadow-lg ring-4 ring-white/50'
                          : 'bg-[#E21B3C] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black">▲</span>
                        <span className="font-heading font-black text-lg text-white">True</span>
                      </div>
                      <span className="text-xs font-extrabold bg-white text-slate-900 px-3 py-1 rounded-xl shadow-sm">
                        {activeQuestion.correctIndex === 0 ? '✓ Correct' : 'Mark'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('correctIndex', 1)}
                      className={`p-4 rounded-2xl text-center transition-all flex items-center justify-between cursor-pointer border-2 border-[#0F52A4] border-b-4 border-b-[#0B3D7A] active:border-b-2 active:translate-y-1 ${
                        activeQuestion.correctIndex === 1
                          ? 'bg-[#1368CE] shadow-lg ring-4 ring-white/50'
                          : 'bg-[#1368CE] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black">◆</span>
                        <span className="font-heading font-black text-lg text-white">False</span>
                      </div>
                      <span className="text-xs font-extrabold bg-white text-slate-900 px-3 py-1 rounded-xl shadow-sm">
                        {activeQuestion.correctIndex === 1 ? '✓ Correct' : 'Mark'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeQuestion.options.map((opt, idx) => {
                      const themes = [
                        { shape: '▲', bg: 'bg-[#E21B3C]', border: 'border-[#B5142F]', bottom: 'border-b-[#8B0F24]' },
                        { shape: '◆', bg: 'bg-[#1368CE]', border: 'border-[#0F52A4]', bottom: 'border-b-[#0B3D7A]' },
                        { shape: '●', bg: 'bg-[#D89E00]', border: 'border-[#A77A00]', bottom: 'border-b-[#7A5A00]' },
                        { shape: '■', bg: 'bg-[#26890C]', border: 'border-[#1C6409]', bottom: 'border-b-[#144706]' },
                      ];
                      const t = themes[idx % themes.length];
                      const isMulti = activeQuestion.type === 'multi_select';
                      const isPoll = activeQuestion.type === 'poll';
                      const isCorrect = isMulti
                        ? (activeQuestion.correctIndices || [activeQuestion.correctIndex ?? 0]).includes(idx)
                        : activeQuestion.correctIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl ${t.bg} border-2 ${t.border} border-b-4 ${t.bottom} flex items-center gap-3 shadow-md transition-all ${
                            isCorrect && !isPoll ? 'ring-4 ring-white/60' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg font-black text-white shrink-0">
                            {t.shape}
                          </div>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(idx, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs sm:text-sm font-extrabold text-white placeholder-white/60 outline-none bg-transparent"
                            placeholder={`Add answer ${idx + 1}...`}
                          />
                          {!isPoll && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isMulti) {
                                  handleToggleMultiCorrect(idx);
                                } else {
                                  handleUpdateActiveQuestion('correctIndex', idx);
                                }
                              }}
                              className={`p-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border-b-2 active:scale-95 ${
                                isCorrect
                                  ? 'bg-white text-emerald-700 border-white shadow-md'
                                  : 'bg-black/30 border-white/20 text-white hover:bg-white hover:text-slate-900'
                              }`}
                              title={isCorrect ? 'Correct Answer' : 'Mark as correct'}
                            >
                              {isMulti ? (
                                isCorrect ? <CheckSquare className="w-4 h-4 stroke-[3]" /> : <Square className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Right Panel: Properties Inspector */}
            <div className={`${showProperties ? 'lg:col-span-3' : 'hidden'} card-tactile p-5 space-y-5 animate-fade-in`}>
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-violet-600" />
                  <span>Question Properties</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowProperties(false)}
                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Properties"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Question Type Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Question Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('multiple_choice')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      (activeQuestion.type || 'multiple_choice') === 'multiple_choice'
                        ? 'border-violet-600 bg-violet-50 text-violet-950 font-black shadow-[0_3px_0_#7C3AED]'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 shadow-[0_2px_0_#E2E8F0]'
                    }`}
                  >
                    <div className="text-xs font-black">Quiz</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Single select</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('true_false')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      activeQuestion.type === 'true_false'
                        ? 'border-[#1368CE] bg-blue-50 text-blue-950 font-black shadow-[0_3px_0_#1368CE]'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 shadow-[0_2px_0_#E2E8F0]'
                    }`}
                  >
                    <div className="text-xs font-black">True / False</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Binary 2 options</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('multi_select')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      activeQuestion.type === 'multi_select'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-[0_3px_0_#059669]'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 shadow-[0_2px_0_#E2E8F0]'
                    }`}
                  >
                    <div className="text-xs font-black">Multi-Select</div>
                    <div className="text-[10px] text-slate-500 font-semibold">All that apply</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('poll')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      activeQuestion.type === 'poll'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-[0_3px_0_#D97706]'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 shadow-[0_2px_0_#E2E8F0]'
                    }`}
                  >
                    <div className="text-xs font-black">Poll</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Opinion check</div>
                  </button>
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Time Limit</span>
                </label>
                <select
                  value={activeQuestion.timeLimit}
                  onChange={(e) => handleUpdateActiveQuestion('timeLimit', Number(e.target.value))}
                  className="w-full input-tactile cursor-pointer"
                >
                  <option value={10}>10 Seconds</option>
                  <option value={15}>15 Seconds</option>
                  <option value={20}>20 Seconds</option>
                  <option value={30}>30 Seconds (Default)</option>
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                  <option value={90}>90 Seconds</option>
                  <option value={120}>120 Seconds</option>
                </select>
              </div>

              {/* Points Scale */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Points</span>
                </label>
                <select
                  value={activeQuestion.points}
                  onChange={(e) => handleUpdateActiveQuestion('points', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none bg-white cursor-pointer"
                >
                  <option value={0}>0 Points (No score)</option>
                  <option value={500}>500 Points</option>
                  <option value={1000}>1,000 Points (Standard)</option>
                  <option value={2000}>2,000 Points (Double)</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const activeIdx = questions.findIndex((q) => q.id === activeQuestion.id);
                    setPresentationSlideIdx(Math.max(0, activeIdx));
                    setRevealSolution(false);
                    setIsFullscreenPresentation(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                  <span>Present Slide Deck</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-alix-xl border border-alix-slate-200 p-6 sm:p-8 text-center animate-scale-in relative">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-alix-indigo">
              Activity Saved!
            </h3>
            <p className="text-xs sm:text-sm text-alix-slate-500 mt-2 mb-6">
              <strong className="text-alix-indigo">{title}</strong> has been successfully saved to your MongoDB database with {questions.length} questions.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate(`/host/${createdQuizId}`)}
                className="w-full py-3.5 px-4 rounded-xl bg-alix-indigo hover:bg-alix-indigo/90 text-white font-bold text-sm shadow-alix-md hover:shadow-alix-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-alix-cyan-400" />
                <span>Launch Live Session Now</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 px-4 rounded-xl border border-alix-slate-300 hover:bg-alix-slate-100 text-alix-slate-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close & Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Interactive Presentation Deck Mode */}
      {isFullscreenPresentation && (() => {
        const pQ = questions[presentationSlideIdx] || questions[0];
        const isMulti = pQ.type === 'multi_select';
        const isPoll = pQ.type === 'poll';
        const isTF = pQ.type === 'true_false';
        const correctIndices = isMulti
          ? (pQ.correctIndices || [pQ.correctIndex ?? 0])
          : [pQ.correctIndex ?? 0];

        return (
          <div className="fixed inset-0 z-50 bg-[#12072B] text-white flex flex-col justify-between p-4 sm:p-8 select-none animate-fade-in overflow-hidden">
            {/* Top Presentation Bar */}
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <AlixLogo variant="white" size="sm" showEduBadge={true} />
                <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-cyan-300">
                  Slide {presentationSlideIdx + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-[10px] font-black uppercase">
                  {isTF ? 'True / False' : isMulti ? 'Multi-Select' : isPoll ? 'Poll' : 'Quiz'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRevealSolution((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    revealSolution
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {revealSolution ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{revealSolution ? 'Solution Revealed' : 'Reveal Solution (Enter)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreenPresentation(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Exit Fullscreen (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Center Slide Stage */}
            <div className="max-w-4xl w-full mx-auto my-auto space-y-4 text-center">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-white/20">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black leading-snug">
                  {pQ.text || 'Question Prompt...'}
                </h1>
              </div>

              {/* Question Visual Diagram in Fullscreen */}
              {pQ.image && (
                <div className="flex justify-center my-2">
                  <img
                    src={pQ.image}
                    alt="Question Diagram"
                    className="max-h-48 sm:max-h-60 object-contain rounded-2xl border-2 border-white/20 shadow-2xl bg-black/40"
                  />
                </div>
              )}

              {/* Answer Cards in Fullscreen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {(isTF ? ['True', 'False'] : pQ.options.filter(Boolean)).map((opt, oIdx) => {
                  const themes = [
                    { shape: '▲', bg: 'bg-[#E21B3C]' },
                    { shape: '◆', bg: 'bg-[#1368CE]' },
                    { shape: '●', bg: 'bg-[#D89E00]' },
                    { shape: '■', bg: 'bg-[#26890C]' },
                  ];
                  const t = themes[oIdx % themes.length];
                  const isCorrect = !isPoll && correctIndices.includes(oIdx);
                  return (
                    <div
                      key={oIdx}
                      className={`p-5 sm:p-6 rounded-2xl ${t.bg} text-white font-heading font-black text-lg sm:text-2xl shadow-xl flex items-center justify-between transition-all ${
                        revealSolution && isCorrect ? 'ring-6 ring-emerald-400 scale-105' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.shape}</span>
                        <span>{opt}</span>
                      </div>
                      {revealSolution && isCorrect && (
                        <span className="px-3 py-1 rounded-full bg-white text-slate-950 text-xs font-black uppercase">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="w-full flex items-center justify-between pt-4 border-t border-white/10 text-xs text-white/60">
              <button
                type="button"
                onClick={() => {
                  setPresentationSlideIdx((prev) => Math.max(0, prev - 1));
                  setRevealSolution(false);
                }}
                disabled={presentationSlideIdx === 0}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <div className="font-mono text-xs">
                Use Arrow Keys (← / →) or Space to advance • Esc to exit
              </div>

              <button
                type="button"
                onClick={() => {
                  setPresentationSlideIdx((prev) => Math.min(questions.length - 1, prev + 1));
                  setRevealSolution(false);
                }}
                disabled={presentationSlideIdx >= questions.length - 1}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* OpenRouter AI Quiz Studio Modal */}
      <AiQuizStudioModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onImport={handleImportAiQuiz}
      />

      <Footer />
    </div>
  );
};

export default CreatePage;
