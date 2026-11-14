import React, { useState, useEffect } from 'react';
import { REALTIME_URL } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Upload,
  FileText,
  Brain,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Lock,
  Mail,
  RefreshCw,
  Check,
  BookOpen,
} from 'lucide-react';

export interface AiQuizStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (generatedData: {
    title: string;
    subject: string;
    description: string;
    questions: any[];
  }) => void;
}

export const AiQuizStudioModal: React.FC<AiQuizStudioModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'material' | 'topic'>('material');

  // Topic generation form
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [level, setLevel] = useState('Undergraduate');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState('medium');

  // Material upload form
  const [materialText, setMaterialText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Generation execution states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<any | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const { user } = useAuth();
  // Strictly enforce admin or licensed educator (no personal key bypass)
  const hasAiLicense = user?.role === 'admin' || user?.aiEnabled === true;

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setMaterialText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    setErrorMessage(null);

    if (activeTab === 'topic' && !topic.trim()) {
      setErrorMessage('Please enter an assessment topic.');
      return;
    }

    if (activeTab === 'material' && !materialText.trim()) {
      setErrorMessage('Please upload a document or paste lecture notes/material.');
      return;
    }

    setIsGenerating(true);
    setGeneratedQuiz(null);
    setGenerationStep('Step 1/3: 🔍 Extracting pedagogical concepts & boundary conditions...');

    const step2Timer = setTimeout(() => {
      setGenerationStep('Step 2/3: 🧠 Connecting OpenRouter (Grok-2 ➡️ Gemini 2.0 Flash Failover)...');
    }, 1500);

    const step3Timer = setTimeout(() => {
      setGenerationStep('Step 3/3: 🎨 Synthesizing slide deck with cognitive distractors...');
    }, 4500);

    try {
      const token = localStorage.getItem('alix_auth_token') || '';
      const res = await fetch(`${REALTIME_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mode: activeTab,
          topic: topic.trim(),
          subject: subject.trim(),
          level,
          questionCount,
          difficulty,
          materialText: materialText.trim(),
        }),
      });

      clearTimeout(step2Timer);
      clearTimeout(step3Timer);

      const data = await res.json();
      if (res.ok && data.success && data.quiz) {
        setGeneratedQuiz(data.quiz);
        setModelUsed(data.modelUsed || 'OpenRouter Multi-Model Engine');
      } else {
        setErrorMessage(data.error || 'AI generation failed. Please try again.');
      }
    } catch (err: any) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setErrorMessage(err.message || 'Network error while contacting AI server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmImport = () => {
    if (generatedQuiz) {
      onImport(generatedQuiz);
      onClose();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none"
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl border-2 border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        {/* Modal Top Header (Clean Kahoot-Grade Header) */}
        <div className="px-6 py-4 bg-white border-b-2 border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md border-b-2 border-violet-800">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                  ALIX AI Quiz Studio
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Automated Question Synthesis • Grok-2 & Gemini 2.0 Flash Engine
              </p>
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer border border-slate-300 active:scale-95"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              Close [Esc]
            </span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {!hasAiLicense ? (
            /* ==============================================================
             * Institutional License Required Paywall Screen
             * (Clean enterprise paywall — NO personal key bypass input!)
             * ============================================================== */
            <div className="py-8 px-4 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs uppercase tracking-wider">
                  👑 Premium Feature • Institutional License Required
                </span>
                <h3 className="text-2xl font-heading font-black text-slate-900 tracking-tight">
                  AI Quiz Studio License Inactive
                </h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  Automatic question synthesis using <strong>Grok-2 & Gemini 2.0 Flash</strong> is controlled centrally by the Platform Administrator for RKGlobal EdTech.
                </p>
              </div>

              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 text-left space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Educator Account</span>
                  <span className="font-black text-slate-900 font-mono text-xs">{user?.email || 'educator@institution.edu'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Current Tier</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black text-[10px] uppercase border border-slate-300">
                    Standard Free Tier
                  </span>
                </div>
              </div>

              {/* Instructions and Action Buttons */}
              <div className="pt-2 space-y-4">
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  To enable unlimited AI question generation for your educator account, request license provisioning from your institution administrator.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`mailto:alixadmin@gmail.com?subject=AI%20Quiz%20Studio%20License%20Activation%20Request%20-%20${encodeURIComponent(user?.email || '')}&body=Hello%20Platform%20Admin,%0A%0APlease%20enable%20Enterprise%20AI%20Quiz%20Studio%20for%20my%20educator%20profile%20(${encodeURIComponent(user?.email || '')}).%0A%0AThank%20you,%0A${encodeURIComponent(user?.name || 'Educator')}`}
                    className="btn-tactile-primary w-full sm:w-auto"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Request License from Admin</span>
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-tactile-white w-full sm:w-auto"
                  >
                    Return to Creator Studio
                  </button>
                </div>
              </div>
            </div>
          ) : !generatedQuiz ? (
            /* ==============================================================
             * Licensed Educator Generation Studio
             * ============================================================== */
            <>
              {/* Segmented Control Tabs */}
              <div className="flex items-center bg-slate-200/80 p-1.5 rounded-2xl max-w-md mx-auto border-2 border-slate-300">
                <button
                  type="button"
                  onClick={() => setActiveTab('material')}
                  className={`flex-1 py-2 rounded-xl text-xs font-heading font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'material'
                      ? 'bg-white text-slate-900 shadow-sm border-b-2 border-slate-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-violet-600" />
                  <span>Upload Study Material</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('topic')}
                  className={`flex-1 py-2 rounded-xl text-xs font-heading font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'topic'
                      ? 'bg-white text-slate-900 shadow-sm border-b-2 border-slate-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-violet-600" />
                  <span>Topic & Prompt</span>
                </button>
              </div>

              {/* Mode A: Upload Learning Material / Lecture Notes */}
              {activeTab === 'material' && (
                <div className="space-y-4">
                  <div className="card-tactile p-6 text-center space-y-3">
                    <label className="block border-2 border-dashed border-slate-300 hover:border-violet-600 hover:bg-violet-50/50 rounded-2xl p-6 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept=".txt,.md,.json,.pdf,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-heading font-black text-slate-900">
                        {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Drag & drop lecture notes, syllabus, or slides'}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mt-1">
                        Supports .txt, .md, .pdf, or syllabus transcripts
                      </div>
                    </label>

                    <div className="text-left space-y-1.5 pt-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                        Or Paste Lecture Content / Notes Directly:
                      </label>
                      <textarea
                        rows={5}
                        value={materialText}
                        onChange={(e) => setMaterialText(e.target.value)}
                        placeholder="Paste lecture transcript, textbook section, or chapter review notes here..."
                        className="w-full input-tactile resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mode B: Topic Prompt */}
              {activeTab === 'topic' && (
                <div className="space-y-4">
                  <div className="card-tactile p-6 space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Assessment Topic or Concept *
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Distributed Consensus, Raft Algorithm, Dijkstra Shortest Path"
                        className="w-full input-tactile"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Subject / Discipline
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Computer Science, Physics"
                          className="w-full input-tactile"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Target Academic Level
                        </label>
                        <select
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                          className="w-full input-tactile cursor-pointer"
                        >
                          <option value="High School">High School (Grade 9-12)</option>
                          <option value="Undergraduate">Undergraduate (B.Tech / B.Sc)</option>
                          <option value="Postgraduate">Postgraduate / Professional</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Question Count and Difficulty Configuration */}
              <div className="card-tactile p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Number of Questions to Generate
                  </label>
                  <div className="flex items-center gap-2">
                    {[3, 4, 5, 8].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          questionCount === count
                            ? 'bg-violet-600 text-white border-b-2 border-violet-800 shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                        }`}
                      >
                        {count} Qs
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Cognitive Difficulty
                  </label>
                  <div className="flex items-center gap-2">
                    {['easy', 'medium', 'hard'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                          difficulty === d
                            ? 'bg-slate-900 text-white border-b-2 border-black shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Generation Progress Indicator */}
              {isGenerating && (
                <div className="p-6 rounded-2xl bg-violet-50 border-2 border-violet-200 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                  <div className="font-heading font-black text-slate-900 text-base">
                    Generating Questions with AI
                  </div>
                  <div className="text-xs font-bold text-violet-700 font-mono">
                    {generationStep}
                  </div>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isGenerating}
                  className="btn-tactile-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-tactile-primary"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isGenerating ? 'Synthesizing Quiz...' : 'Generate with AI'}</span>
                </button>
              </div>
            </>
          ) : (
            /* ==============================================================
             * Generated Quiz Review & Import Screen
             * ============================================================== */
            <div className="space-y-6">
              <div className="card-tactile p-4 bg-emerald-50 border-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-heading font-black text-slate-900 text-sm">
                      Generated {generatedQuiz.questions?.length || 0} Questions Successfully
                    </div>
                    <div className="text-xs font-bold text-emerald-800">
                      Engine: {modelUsed}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedQuiz(null)}
                  className="btn-tactile-white text-xs px-3 py-1.5"
                >
                  Regenerate
                </button>
              </div>

              {/* Question Previews */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {generatedQuiz.questions?.map((q: any, idx: number) => (
                  <div key={idx} className="card-tactile p-4 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-black text-[10px] uppercase">
                        Question {idx + 1} • {q.type || 'MCQ'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {q.timeLimit || 30}s • {q.points || 1000} pts
                      </span>
                    </div>
                    <p className="font-heading font-extrabold text-slate-900 text-sm">
                      {q.text}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {q.options?.map((opt: string, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            optIdx === q.correctIndex
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="opacity-60 mr-1.5 font-mono">{optIdx + 1}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirmation Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setGeneratedQuiz(null)}
                  className="btn-tactile-white"
                >
                  Discard & Retry
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="btn-tactile-green"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import into Activity Deck</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiQuizStudioModal;
