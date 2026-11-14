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

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar className="hidden lg:flex" />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl">
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
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl border border-alix-slate-300 text-alix-slate-600 hover:bg-alix-slate-100 text-sm font-semibold transition-colors"
              >
                Back to Dashboard
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

          {/* Question Editor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Questions List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-alix-slate-500">
                  Questions ({questions.length})
                </span>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('multiple_choice')}
                  className="text-xs font-bold text-alix-violet-700 hover:text-alix-violet-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2 ${
                      q.id === activeQuestion.id
                        ? 'bg-alix-violet-50 border-alix-violet-500 shadow-sm'
                        : 'bg-white border-alix-slate-200 hover:border-alix-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveQuestionId(q.id)}
                      className="flex-1 text-left min-w-0 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-alix-indigo">
                            Q{idx + 1}
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
                        <span className="text-[10px] text-alix-slate-400 font-mono">
                          {q.timeLimit}s • {q.points}pts
                        </span>
                      </div>
                      <p className="text-xs text-alix-slate-600 truncate font-medium">
                        {q.text || 'Untitled Question Prompt...'}
                      </p>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(q.id)}
                        className="p-1 rounded text-alix-slate-300 hover:text-alix-violet-600 transition-colors cursor-pointer"
                        title="Duplicate question"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 rounded text-alix-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Question Detail Editor */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-alix-slate-200 shadow-sm space-y-6">
              {/* Question Format Selector (4 Types matching Kahoot) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Question Type
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    {activeQuestion.type === 'multi_select'
                      ? 'Learners select all correct options'
                      : activeQuestion.type === 'poll'
                      ? 'Opinion poll, no grading'
                      : activeQuestion.type === 'true_false'
                      ? 'Binary true/false'
                      : 'Single choice, 1 correct'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* 1. Quiz (Single Choice) */}
                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('multiple_choice')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                      (activeQuestion.type || 'multiple_choice') === 'multiple_choice'
                        ? 'border-alix-violet-600 bg-alix-violet-50 text-alix-violet-950 shadow-xs ring-2 ring-alix-violet-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-3 h-3 rounded-full bg-[#E21B3C]" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Single</span>
                    </div>
                    <div>
                      <div className="font-heading font-black text-xs text-slate-900">Quiz</div>
                      <div className="text-[10px] text-slate-500">1 correct answer</div>
                    </div>
                  </button>

                  {/* 2. True / False */}
                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('true_false')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                      activeQuestion.type === 'true_false'
                        ? 'border-[#1368CE] bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-3 h-3 rounded-full bg-[#1368CE]" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Binary</span>
                    </div>
                    <div>
                      <div className="font-heading font-black text-xs text-slate-900">True / False</div>
                      <div className="text-[10px] text-slate-500">2 options only</div>
                    </div>
                  </button>

                  {/* 3. Multi-Select Quiz */}
                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('multi_select')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                      activeQuestion.type === 'multi_select'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs ring-2 ring-emerald-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-3 h-3 rounded-full bg-[#26890C]" />
                      <span className="text-[10px] font-black uppercase text-emerald-600">Multi</span>
                    </div>
                    <div>
                      <div className="font-heading font-black text-xs text-slate-900">Multi-Select</div>
                      <div className="text-[10px] text-slate-500">Choose all that apply</div>
                    </div>
                  </button>

                  {/* 4. Poll (Opinion Survey) */}
                  <button
                    type="button"
                    onClick={() => handleSetQuestionType('poll')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${
                      activeQuestion.type === 'poll'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-xs ring-2 ring-amber-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-3 h-3 rounded-full bg-[#D89E00]" />
                      <span className="text-[10px] font-black uppercase text-amber-600">Opinion</span>
                    </div>
                    <div>
                      <div className="font-heading font-black text-xs text-slate-900">Poll</div>
                      <div className="text-[10px] text-slate-500">Collect sentiment</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-2">
                  Question Prompt *
                </label>
                <textarea
                  rows={3}
                  value={activeQuestion.text}
                  onChange={(e) =>
                    handleUpdateActiveQuestion('text', e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-2 focus:ring-alix-violet-100 outline-none text-base text-alix-indigo font-medium"
                  placeholder={
                    activeQuestion.type === 'true_false'
                      ? 'Enter the statement to evaluate as True or False...'
                      : activeQuestion.type === 'poll'
                      ? 'Enter your opinion or survey question prompt...'
                      : 'Enter the concept question prompt here...'
                  }
                />
              </div>

              {/* Time & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-alix-cyan-600" />
                    <span>Time Limit</span>
                  </label>
                  <select
                    value={activeQuestion.timeLimit}
                    onChange={(e) =>
                      handleUpdateActiveQuestion(
                        'timeLimit',
                        Number(e.target.value)
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-alix-slate-300 text-sm font-semibold text-alix-indigo outline-none cursor-pointer"
                  >
                    <option value={10}>10 Seconds</option>
                    <option value={15}>15 Seconds</option>
                    <option value={20}>20 Seconds</option>
                    <option value={30}>30 Seconds</option>
                    <option value={45}>45 Seconds</option>
                    <option value={60}>60 Seconds</option>
                    <option value={90}>90 Seconds</option>
                    <option value={120}>120 Seconds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-2 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-alix-coral-500" />
                    <span>Points Scale</span>
                  </label>
                  <select
                    value={activeQuestion.points}
                    onChange={(e) =>
                      handleUpdateActiveQuestion('points', Number(e.target.value))
                    }
                    className="w-full p-2.5 rounded-xl border border-alix-slate-300 text-sm font-semibold text-alix-indigo outline-none cursor-pointer"
                  >
                    <option value={0}>0 Points (No score)</option>
                    <option value={500}>500 Points</option>
                    <option value={1000}>1,000 Points (Standard)</option>
                    <option value={2000}>2,000 Points (Double)</option>
                  </select>
                </div>
              </div>

              {/* Answer Choices */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  {activeQuestion.type === 'true_false'
                    ? 'Select the Correct Truth Value'
                    : activeQuestion.type === 'multi_select'
                    ? 'Answer Choices (Click checkmark on each correct answer)'
                    : activeQuestion.type === 'poll'
                    ? 'Poll Choices (All options collect learner sentiment)'
                    : 'Answer Choices (Click checkmark to set correct answer)'}
                </label>

                {activeQuestion.type === 'true_false' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* True Card */}
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('correctIndex', 0)}
                      className={`p-5 rounded-2xl border-4 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        activeQuestion.correctIndex === 0
                          ? 'border-emerald-500 bg-emerald-50/80 shadow-lg ring-4 ring-emerald-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#E21B3C] text-white flex items-center justify-center text-2xl font-black shadow-sm">
                        ▲
                      </div>
                      <div className="font-heading font-black text-xl text-slate-900">
                        True
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
                        {activeQuestion.correctIndex === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                            Correct Answer
                          </span>
                        ) : (
                          <span className="text-slate-400">Click to set as correct</span>
                        )}
                      </div>
                    </button>

                    {/* False Card */}
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('correctIndex', 1)}
                      className={`p-5 rounded-2xl border-4 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        activeQuestion.correctIndex === 1
                          ? 'border-emerald-500 bg-emerald-50/80 shadow-lg ring-4 ring-emerald-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#1368CE] text-white flex items-center justify-center text-2xl font-black shadow-sm">
                        ◆
                      </div>
                      <div className="font-heading font-black text-xl text-slate-900">
                        False
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
                        {activeQuestion.correctIndex === 1 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                            Correct Answer
                          </span>
                        ) : (
                          <span className="text-slate-400">Click to set as correct</span>
                        )}
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeQuestion.type === 'multi_select' && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Multi-Select Active: Click the checkbox button on every correct choice.</span>
                      </div>
                    )}
                    {activeQuestion.type === 'poll' && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Opinion Poll Active: All choices are valid options for learners to vote on.</span>
                      </div>
                    )}
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
                          className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${
                            isCorrect && !isPoll
                              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-200'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg ${t.bg} text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            {t.shape}
                          </div>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(idx, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm font-bold text-slate-900 outline-none bg-transparent"
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
                              className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isCorrect
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                  : 'border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
                              }`}
                              title={isCorrect ? 'Marked as correct' : 'Mark as correct'}
                            >
                              {isMulti ? (
                                isCorrect ? (
                                  <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )
                              ) : (
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                              )}
                              <span className="hidden sm:inline">{isCorrect ? 'Correct' : 'Mark'}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

      <Footer />
    </div>
  );
};

export default CreatePage;
