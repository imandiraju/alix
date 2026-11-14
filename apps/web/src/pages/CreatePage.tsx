import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { REALTIME_URL } from '../services/socket';
import { useAuth } from '../context/AuthContext';
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
}

export const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(user?.department || '');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [rosters, setRosters] = useState<any[]>([]);
  const [selectedRosterId, setSelectedRosterId] = useState<string>('');

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

  const handleUpdateActiveQuestion = (field: keyof QuestionDraft, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === activeQuestion.id ? { ...q, [field]: value } : q
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
      const res = await fetch(`${REALTIME_URL}/api/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user?.id,
          rosterId: selectedRosterId || undefined,
          title: title.trim(),
          subject: subject.trim(),
          courseCode: courseCode.trim(),
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
                Create Classroom Activity
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const activeIdx = questions.findIndex((q) => q.id === activeQuestion.id);
                  setPresentationSlideIdx(Math.max(0, activeIdx));
                  setRevealSolution(false);
                  setIsFullscreenPresentation(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
                title="Present slides in full screen like a slideshow"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Present Fullscreen</span>
              </button>

              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl border border-alix-slate-300 text-alix-slate-600 hover:bg-alix-slate-100 text-sm font-semibold transition-colors"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving to Database...' : 'Save Activity'}</span>
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
          <div className="bg-white p-6 rounded-2xl border border-alix-slate-200 shadow-sm mb-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                Activity Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg sm:text-xl font-heading font-bold text-alix-indigo border-b-2 border-alix-slate-200 focus:border-alix-violet-600 outline-none pb-1"
                placeholder="e.g. Distributed Consensus & Fault Tolerance"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                  Subject / Discipline *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm text-alix-indigo font-semibold border-b border-alix-slate-200 focus:border-alix-violet-600 outline-none pb-1"
                  placeholder="e.g. Computer Science, Mechanical, Electronics..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                  Course Code / Section (Optional)
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full text-sm text-alix-indigo font-semibold border-b border-alix-slate-200 focus:border-alix-violet-600 outline-none pb-1"
                  placeholder="e.g. CS 301 - Sec A"
                />
              </div>
            </div>

            {/* Anti-Proxy Roster Selector */}
            <div className="pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
                  }
                }}
                className="w-full text-xs font-semibold text-alix-indigo border-b border-alix-slate-200 focus:border-emerald-600 outline-none pb-1 bg-transparent cursor-pointer"
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
                  className="text-xs font-bold text-alix-violet-700 hover:text-alix-violet-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isActive = q.id === activeQuestion.id;
                  return (
                    <div
                      key={q.id}
                      className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                        isActive
                          ? 'bg-alix-violet-50/80 border-alix-violet-600 shadow-md ring-2 ring-alix-violet-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
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
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              q.type === 'true_false'
                                ? 'bg-blue-100 text-blue-700'
                                : q.type === 'multi_select'
                                ? 'bg-emerald-100 text-emerald-700'
                                : q.type === 'poll'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-violet-100 text-violet-700'
                            }`}
                          >
                            {q.type === 'true_false' ? 'T/F' : q.type === 'multi_select' ? 'MULTI' : q.type === 'poll' ? 'POLL' : 'QUIZ'}
                          </span>
                        </div>

                        {/* Miniature Slide Preview */}
                        <div className="w-full h-16 rounded-lg bg-slate-900 p-1.5 flex flex-col justify-between border border-slate-700 relative overflow-hidden shadow-inner">
                          <div className="w-full h-2 rounded bg-white/20 truncate text-[7px] text-white/70 px-1 overflow-hidden">
                            {q.text || 'Question Prompt...'}
                          </div>
                          <div className="flex items-center justify-center text-white/30 text-[9px]">
                            <ImageIcon className="w-3 h-3" />
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="h-1.5 rounded bg-[#E21B3C]/80" />
                            <div className="h-1.5 rounded bg-[#1368CE]/80" />
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 truncate font-semibold mt-1.5">
                          {q.text || 'Untitled Question Prompt...'}
                        </p>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {q.timeLimit}s • {q.points}pts
                        </div>
                      </button>

                      {/* Slide Action Buttons */}
                      <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(q.id)}
                          className="p-1 rounded text-slate-400 hover:text-alix-violet-600 transition-colors cursor-pointer"
                          title="Duplicate slide"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
                  className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-alix-violet-500 hover:bg-alix-violet-50/50 text-slate-600 hover:text-alix-violet-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Question Slide</span>
                </button>
              </div>
            </div>

            {/* 2. Center Panel: 16:9 Presentation Slide Canvas (Col span 6) */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#1E0B36] via-[#2A104E] to-[#140626] rounded-3xl border-2 border-slate-700 p-4 sm:p-6 shadow-2xl relative flex flex-col justify-between min-h-[580px] text-white">
              {/* Slide Format Indicator Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white/15 text-white font-mono text-xs font-bold">
                    Slide {questions.findIndex((q) => q.id === activeQuestion.id) + 1} of {questions.length}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-alix-cyan-500/20 text-alix-cyan-300 border border-alix-cyan-500/40 text-xs font-black uppercase">
                    {activeQuestion.type === 'true_false' ? 'True / False' : activeQuestion.type === 'multi_select' ? 'Multi-Select' : activeQuestion.type === 'poll' ? 'Opinion Poll' : 'Quiz (Single)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const activeIdx = questions.findIndex((q) => q.id === activeQuestion.id);
                    setPresentationSlideIdx(Math.max(0, activeIdx));
                    setRevealSolution(false);
                    setIsFullscreenPresentation(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1 cursor-pointer"
                  title="Present this slide fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>
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

              {/* Slide Middle: Presentation Visual / Media Box */}
              <div className="my-auto py-2">
                <div className="w-full max-w-sm mx-auto h-28 sm:h-36 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1.5 text-white/60 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-alix-cyan-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Presentation Visual Prompt</div>
                  <div className="text-[10px] text-white/50">Add diagram, equation, or image mockup</div>
                </div>
              </div>

              {/* Slide Bottom: Answer Choices Blocks */}
              <div className="mt-3">
                {activeQuestion.type === 'true_false' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('correctIndex', 0)}
                      className={`p-4 rounded-2xl border-4 text-center transition-all flex items-center justify-between cursor-pointer ${
                        activeQuestion.correctIndex === 0
                          ? 'border-emerald-400 bg-[#E21B3C] shadow-lg ring-4 ring-emerald-300/40'
                          : 'border-transparent bg-[#E21B3C] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black">▲</span>
                        <span className="font-heading font-black text-lg text-white">True</span>
                      </div>
                      <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">
                        {activeQuestion.correctIndex === 0 ? '✓ Correct' : 'Mark'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('correctIndex', 1)}
                      className={`p-4 rounded-2xl border-4 text-center transition-all flex items-center justify-between cursor-pointer ${
                        activeQuestion.correctIndex === 1
                          ? 'border-emerald-400 bg-[#1368CE] shadow-lg ring-4 ring-emerald-300/40'
                          : 'border-transparent bg-[#1368CE] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black">◆</span>
                        <span className="font-heading font-black text-lg text-white">False</span>
                      </div>
                      <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">
                        {activeQuestion.correctIndex === 1 ? '✓ Correct' : 'Mark'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeQuestion.options.map((opt, idx) => {
                      const themes = [
                        { shape: '▲', bg: 'bg-[#E21B3C]', border: 'border-[#9E1329]' },
                        { shape: '◆', bg: 'bg-[#1368CE]', border: 'border-[#0D4589]' },
                        { shape: '●', bg: 'bg-[#D89E00]', border: 'border-[#8C6700]' },
                        { shape: '■', bg: 'bg-[#26890C]', border: 'border-[#175407]' },
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
                          className={`p-2.5 rounded-2xl ${t.bg} border-2 flex items-center gap-2 shadow-md transition-all ${
                            isCorrect && !isPoll ? 'border-white ring-4 ring-emerald-400/50' : 'border-black/20'
                          }`}
                        >
                          <span className="text-lg font-black text-white shrink-0 pl-1">{t.shape}</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(idx, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs sm:text-sm font-bold text-white placeholder-white/60 outline-none bg-transparent"
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
                              className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                                isCorrect
                                  ? 'bg-white text-slate-900 border-white shadow-md'
                                  : 'bg-black/20 border-white/30 text-white/70 hover:bg-white hover:text-slate-900'
                              }`}
                              title={isCorrect ? 'Correct Answer' : 'Mark as correct'}
                            >
                              {isMulti ? (
                                isCorrect ? <CheckSquare className="w-4 h-4 stroke-[2.5]" /> : <Square className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
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

            {/* 3. Right Panel: Properties Inspector (Col span 3) */}
            <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Question Properties
                </span>
                <span className="text-[10px] font-bold text-slate-400">Settings</span>
              </div>

              {/* Question Type Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('multiple_choice')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      (activeQuestion.type || 'multiple_choice') === 'multiple_choice'
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-black">Quiz</div>
                    <div className="text-[9px] text-slate-400">Single select</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('true_false')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeQuestion.type === 'true_false'
                        ? 'border-[#1368CE] bg-blue-50/80 ring-2 ring-blue-200 text-blue-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-black">True / False</div>
                    <div className="text-[9px] text-slate-400">Binary 2 options</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('multi_select')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeQuestion.type === 'multi_select'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-200 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-black">Multi-Select</div>
                    <div className="text-[9px] text-slate-400">All that apply</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('poll')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeQuestion.type === 'poll'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-200 text-amber-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-black">Poll</div>
                    <div className="text-[9px] text-slate-400">Opinion check</div>
                  </button>
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Time Limit</span>
                </label>
                <select
                  value={activeQuestion.timeLimit}
                  onChange={(e) => handleUpdateActiveQuestion('timeLimit', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none bg-white cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-alix-xl border border-alix-slate-200 p-6 sm:p-8 text-center animate-scale-in">
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
                <span className="font-heading font-black text-xl text-white">ALIX!</span>
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
            <div className="max-w-4xl w-full mx-auto my-auto space-y-6 text-center">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-white/20">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black leading-snug">
                  {pQ.text || 'Question Prompt...'}
                </h1>
              </div>

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

      <Footer />
    </div>
  );
};

export default CreatePage;
