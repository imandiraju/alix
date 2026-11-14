import React, { useState } from 'react';
import { REALTIME_URL } from '../../services/socket';
import {
  Sparkles,
  Upload,
  FileText,
  Brain,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Layers,
  Key,
  SlidersHorizontal,
  FileCheck,
  Check,
  RefreshCw,
  Clock,
  HelpCircle,
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

  // Settings / API Key
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('alix_openrouter_key') || '';
  });
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Generation execution states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<any | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle local text or file reading
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

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('alix_openrouter_key', apiKey.trim());
    } else {
      localStorage.removeItem('alix_openrouter_key');
    }
    setShowKeyConfig(false);
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
      setGenerationStep('Step 2/3: 🧠 Connecting OpenRouter (Grok ➡️ Gemini Failover)...');
    }, 1500);

    const step3Timer = setTimeout(() => {
      setGenerationStep('Step 3/3: 🎨 Synthesizing slide deck with cognitive distractors...');
    }, 4500);

    try {
      const res = await fetch(`${REALTIME_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeTab,
          topic: topic.trim(),
          subject: subject.trim(),
          level,
          questionCount,
          difficulty,
          materialText: materialText.trim(),
          apiKey: apiKey.trim() || undefined,
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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto select-none">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E0938] via-[#2F1054] to-[#140626] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 p-0.5 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-base sm:text-lg text-white">
                  ALIX AI Quiz Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase tracking-wider">
                  OpenRouter
                </span>
              </div>
              <p className="text-xs text-white/70">
                Grok-2 & Gemini Flash Dual-Model Failover Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyConfig((prev) => !prev)}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showKeyConfig || apiKey
                  ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="OpenRouter API Key Settings"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">{apiKey ? 'Key Connected' : 'Set Key'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional OpenRouter Key Drawer */}
        {showKeyConfig && (
          <div className="p-4 bg-slate-900 text-white border-b border-slate-700 animate-fade-in shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>OpenRouter API Key (Optional Override)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Saved in your browser localStorage
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs cursor-pointer transition-all"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Default server configuration automatically fails over: <strong>Grok 2 ➡️ Gemini 2.0 Flash ➡️ Free Model Candidates</strong>. You can provide your personal key for high-rate quota.
            </p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {!generatedQuiz ? (
            <>
              {/* Tab Selector: Upload Material vs Generate from Topic */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('material')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-heading font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'material'
                      ? 'bg-white text-indigo-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upload Learning Material</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('topic')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-heading font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'topic'
                      ? 'bg-white text-indigo-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Topic & Curriculum Prompt</span>
                </button>
              </div>

              {/* Mode A: Upload Learning Material / Lecture Notes */}
              {activeTab === 'material' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-5 text-center bg-slate-50/60 hover:bg-indigo-50/30 transition-all relative">
                    <input
                      type="file"
                      accept=".txt,.md,.json,.csv,.doc,.docx,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {uploadedFileName ? (
                        <span className="text-emerald-700 flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>File loaded: {uploadedFileName}</span>
                        </span>
                      ) : (
                        <span>Drag & drop lecture notes, syllabus, or slides (.txt, .md, .pdf)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      or click to browse from computer
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                      <span>Or Paste Lecture Content / Notes Directly:</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {materialText.length.toLocaleString()} characters
                      </span>
                    </label>
                    <textarea
                      rows={5}
                      value={materialText}
                      onChange={(e) => setMaterialText(e.target.value)}
                      placeholder="Paste your lecture transcript, concept summary, textbook section, or chapter notes here..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-indigo-600 outline-none leading-relaxed resize-none shadow-inner"
                    />
                  </div>
                </div>
              )}

              {/* Mode B: Topic & Curriculum Prompt */}
              {activeTab === 'topic' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Concept or Topic Name *
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Binary Search Trees & Red-Black Balancing, Thermodynamics 2nd Law..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-indigo-600 outline-none shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Subject / Discipline
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Computer Science, Physics..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Target Academic Level
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none bg-white cursor-pointer"
                      >
                        <option value="Undergraduate">Undergraduate (B.Tech / Degree)</option>
                        <option value="High School">High School (Grades 9-12)</option>
                        <option value="Graduate">Graduate / Masters Level</option>
                        <option value="Competitive Exam">Competitive Exam / Placement</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Tuning Parameters */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Number of Question Slides:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[3, 4, 5, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`px-3 py-1 rounded-lg font-black transition-all cursor-pointer ${
                          questionCount === num
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                  <span className="font-bold text-slate-700">Difficulty Level:</span>
                  <div className="flex items-center gap-1.5">
                    {['easy', 'medium', 'hard', 'mixed'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`px-2.5 py-1 rounded-lg font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                          difficulty === d
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Live Generation Progress Banner */}
              {isGenerating && (
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-2 animate-pulse">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs font-black text-indigo-950">{generationStep}</div>
                  <p className="text-[11px] text-indigo-700">
                    Querying Grok 2 vision / Gemini 2.0 Flash via OpenRouter...
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Generated Quiz Preview Screen */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Quiz Generated Successfully!</span>
                  </div>
                  <h3 className="font-heading font-black text-slate-900 text-base mt-0.5">
                    {generatedQuiz.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {generatedQuiz.questions?.length} Question Slides Ready • Model: <span className="font-mono font-bold text-indigo-600">{modelUsed}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setGeneratedQuiz(null)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Slide Thumbnails Preview */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {generatedQuiz.questions?.map((q: any, idx: number) => {
                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-2 shadow-sm text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-950">
                          Slide {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800">
                          {q.type}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {q.text}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options?.map((opt: string, oIdx: number) => {
                          const isCorrect = q.type === 'multi_select'
                            ? q.correctIndices?.includes(oIdx)
                            : oIdx === q.correctIndex;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                                  : 'bg-slate-50 text-slate-600 border border-slate-200'
                              }`}
                            >
                              <span className="truncate">{opt}</span>
                              {isCorrect && (
                                <span className="text-[10px] text-emerald-700 font-black shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                          💡 <strong>Misconception Check:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>OpenRouter Multi-Model Architecture</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            {!generatedQuiz ? (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1368CE] to-indigo-600 hover:from-[#105AB3] hover:to-indigo-700 text-white font-heading font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generating Slides...' : 'Generate with AI'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-6 py-2.5 rounded-xl bg-[#26890C] hover:bg-[#20740A] text-white font-heading font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Import into Presentation Studio ({generatedQuiz.questions?.length} Slides)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiQuizStudioModal;
