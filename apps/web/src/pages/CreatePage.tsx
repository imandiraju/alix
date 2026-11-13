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
  Save,
  Sparkles,
  Clock,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Play,
  LayoutDashboard,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface QuestionDraft {
  id: string;
  text: string;
  timeLimit: number;
  points: number;
  options: string[];
  correctIndex: number;
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

  const handleAddQuestion = () => {
    const newId = `q-${Date.now()}`;
    const newQuestion: QuestionDraft = {
      id: newId,
      text: '',
      timeLimit: 30,
      points: 1000,
      options: ['', '', '', ''],
      correctIndex: 0,
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newId);
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
                  onClick={handleAddQuestion}
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
                        <span className="text-xs font-bold text-alix-indigo">
                          Q{idx + 1}
                        </span>
                        <span className="text-[10px] text-alix-slate-400 font-mono">
                          {q.timeLimit}s • {q.points}pts
                        </span>
                      </div>
                      <p className="text-xs text-alix-slate-600 truncate font-medium">
                        {q.text || 'Untitled Question Prompt...'}
                      </p>
                    </button>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 rounded text-alix-slate-300 hover:text-rose-600 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Question Detail Editor */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-alix-slate-200 shadow-sm space-y-6">
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
                  placeholder="Enter the concept question prompt here..."
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
                    <option value={15}>15 Seconds</option>
                    <option value={20}>20 Seconds</option>
                    <option value={30}>30 Seconds</option>
                    <option value={45}>45 Seconds</option>
                    <option value={60}>60 Seconds</option>
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
                    <option value={500}>500 Points</option>
                    <option value={1000}>1,000 Points (Standard)</option>
                    <option value={2000}>2,000 Points (Double)</option>
                  </select>
                </div>
              </div>

              {/* Answer Choices */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-3">
                  Answer Options (Select correct option using the radio button)
                </label>
                <div className="space-y-3">
                  {activeQuestion.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-2 rounded-xl border transition-colors ${
                        activeQuestion.correctIndex === idx
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-alix-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-option-${activeQuestion.id}`}
                        checked={activeQuestion.correctIndex === idx}
                        onChange={() =>
                          handleUpdateActiveQuestion('correctIndex', idx)
                        }
                        className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer ml-2"
                        title="Mark as correct answer"
                      />
                      <span
                        className={`font-bold text-xs w-6 text-center ${
                          activeQuestion.correctIndex === idx
                            ? 'text-emerald-700'
                            : 'text-alix-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOption(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm font-medium text-alix-indigo border-0 focus:ring-0 outline-none bg-transparent"
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                      />
                    </div>
                  ))}
                </div>
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
