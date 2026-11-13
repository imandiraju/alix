import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import {
  PlusCircle,
  Trash2,
  Save,
  Sparkles,
  Clock,
  Zap,
  ArrowLeft,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
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
  const [title, setTitle] = useState('Distributed Consensus & Fault Tolerance');
  const [description, setDescription] = useState(
    'Interactive concept check for Week 6 lecture in CS 301.'
  );

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q-1',
      text: 'In distributed consensus protocols (e.g., Raft), what is the minimum number of nodes required to tolerate 2 node crash failures?',
      timeLimit: 30,
      points: 1000,
      options: ['3 nodes', '5 nodes', '7 nodes', '4 nodes'],
      correctIndex: 1,
    },
    {
      id: 'q-2',
      text: 'Which CAP theorem property must a distributed system sacrifice during a network partition if it prioritizes availability?',
      timeLimit: 20,
      points: 1000,
      options: ['Consistency', 'Partition Tolerance', 'Latency', 'Durability'],
      correctIndex: 0,
    },
  ]);

  const [activeQuestionId, setActiveQuestionId] = useState<string>('q-1');
  const [isSaved, setIsSaved] = useState(false);

  const activeQuestion =
    questions.find((q) => q.id === activeQuestionId) || questions[0];

  const handleAddQuestion = () => {
    const newId = `q-${Date.now()}`;
    const newQuestion: QuestionDraft = {
      id: newId,
      text: 'New question prompt...',
      timeLimit: 30,
      points: 1000,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newId);
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

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
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
                My ALIX Activities
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl border border-alix-slate-300 text-alix-slate-600 hover:bg-alix-slate-100 text-sm font-semibold transition-colors"
              >
                Back to Library
              </Link>

              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaved ? 'Saved!' : 'Save Activity'}</span>
              </button>
            </div>
          </div>

          {/* Activity Metadata Inputs */}
          <div className="bg-white p-6 rounded-2xl border border-alix-slate-200 shadow-sm mb-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                Activity Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg sm:text-xl font-heading font-bold text-alix-indigo border-b-2 border-alix-slate-200 focus:border-alix-violet-600 outline-none pb-1"
                placeholder="Activity Title..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-1">
                Description / Course Info
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm text-alix-slate-600 border-b border-alix-slate-200 focus:border-alix-violet-600 outline-none pb-1"
                placeholder="Course code, week, learning outcomes..."
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
                  onClick={handleAddQuestion}
                  className="text-xs font-bold text-alix-violet-700 hover:text-alix-violet-900 inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionId(q.id)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                      q.id === activeQuestion.id
                        ? 'bg-alix-violet-50 border-alix-violet-500 shadow-sm'
                        : 'bg-white border-alix-slate-200 hover:border-alix-slate-300'
                    }`}
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
                      {q.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Question Detail Editor */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-alix-slate-200 shadow-sm space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-2">
                  Question Prompt
                </label>
                <textarea
                  rows={3}
                  value={activeQuestion.text}
                  onChange={(e) =>
                    handleUpdateActiveQuestion('text', e.target.value)
                  }
                  className="w-full p-3.5 rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-2 focus:ring-alix-violet-100 outline-none text-base text-alix-indigo font-medium"
                  placeholder="Enter the question prompt here..."
                />
              </div>

              {/* Time & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-500 mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-alix-cyan-600" />
                    <span>Time Limit (Seconds)</span>
                  </label>
                  <select
                    value={activeQuestion.timeLimit}
                    onChange={(e) =>
                      handleUpdateActiveQuestion(
                        'timeLimit',
                        Number(e.target.value)
                      )
                    }
                    className="w-full p-2.5 rounded-xl border border-alix-slate-300 text-sm font-semibold text-alix-indigo outline-none"
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
                    className="w-full p-2.5 rounded-xl border border-alix-slate-300 text-sm font-semibold text-alix-indigo outline-none"
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
                  Answer Options (Select correct option with radio)
                </label>
                <div className="space-y-3">
                  {activeQuestion.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-xl border border-alix-slate-200"
                    >
                      <input
                        type="radio"
                        name="correct-option"
                        checked={activeQuestion.correctIndex === idx}
                        onChange={() =>
                          handleUpdateActiveQuestion('correctIndex', idx)
                        }
                        className="w-5 h-5 text-alix-violet-600 focus:ring-alix-violet-500 cursor-pointer ml-2"
                        title="Mark as correct answer"
                      />
                      <span className="font-bold text-xs text-alix-slate-400 w-6 text-center">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOption(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm font-medium text-alix-indigo border-0 focus:ring-0 outline-none"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CreatePage;
