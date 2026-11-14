import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { REALTIME_URL } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Key,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Server,
  Zap,
  Lock,
  Layers,
  Users,
  Activity,
  Award,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // Configuration state from backend
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

  // Form edit state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [primaryModel, setPrimaryModel] = useState('x-ai/grok-2-vision-1212');
  const [fallbackModel, setFallbackModel] = useState('google/gemini-2.0-flash-exp:free');

  // Status & action messages
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Educator AI Licenses state
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [togglingTeacherId, setTogglingTeacherId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  // Load config & metrics (Admin Only)
  const fetchAdminData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('alix_auth_token') || '';
      const [configRes, metricsRes, teachersRes] = await Promise.all([
        fetch(`${REALTIME_URL}/api/admin/config`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${REALTIME_URL}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${REALTIME_URL}/api/admin/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (configRes.ok) {
        const cData = await configRes.json();
        if (cData.config) {
          setConfig(cData.config);
          if (cData.config.primaryModel) setPrimaryModel(cData.config.primaryModel);
          if (cData.config.fallbackModel) setFallbackModel(cData.config.fallbackModel);
        }
      }

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        if (mData.metrics) setMetrics(mData.metrics);
      }

      if (teachersRes.ok) {
        const tData = await teachersRes.json();
        if (tData.teachers) setTeachers(tData.teachers);
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTeacherAi = async (teacherId: string, currentEnabled: boolean) => {
    setTogglingTeacherId(teacherId);
    try {
      const token = localStorage.getItem('alix_auth_token') || '';
      const res = await fetch(`${REALTIME_URL}/api/admin/teachers/${teacherId}/toggle-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (res.ok && data.teacher) {
        setTeachers((prev) =>
          prev.map((t) => (t.id === teacherId ? { ...t, aiEnabled: data.teacher.aiEnabled } : t))
        );
      } else {
        alert(data.error || 'Failed to update teacher AI status.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    } finally {
      setTogglingTeacherId(null);
    }
  };

  const handleBulkAi = async (enable: boolean) => {
    if (!confirm(`Are you sure you want to ${enable ? 'ENABLE' : 'DISABLE'} AI Quiz Studio for all teachers?`)) return;
    try {
      const token = localStorage.getItem('alix_auth_token') || '';
      const res = await fetch(`${REALTIME_URL}/api/admin/teachers/bulk-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: enable }),
      });
      if (res.ok) {
        setTeachers((prev) => prev.map((t) => ({ ...t, aiEnabled: enable })));
      }
    } catch (err: any) {
      alert(err.message || 'Error updating permissions.');
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [isAdmin]);

  // ─── Test OpenRouter Key Live ────────────────────────────────────────────────
  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSaveMessage(null);

    try {
      const token = localStorage.getItem('alix_auth_token') || '';
      const res = await fetch(`${REALTIME_URL}/api/admin/test-openrouter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          keyToTest: apiKeyInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (res.ok && data.valid) {
        setSaveMessage({
          type: 'success',
          text: '✅ OpenRouter API key is verified, active, and responsive!',
        });
        fetchAdminData();
      } else {
        setSaveMessage({
          type: 'error',
          text: data.error || 'OpenRouter connection failed. Check your API key.',
        });
      }
    } catch (err: any) {
      setTestResult({
        valid: false,
        error: err.message || 'Network error reaching server.',
      });
      setSaveMessage({
        type: 'error',
        text: 'Failed to communicate with ALIX Realtime server.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // ─── Save Configuration to Cloud Database ────────────────────────────────────
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const token = localStorage.getItem('alix_auth_token') || '';
      const payload: any = {
        primaryModel,
        fallbackModel,
      };

      if (apiKeyInput.trim()) {
        payload.openrouterKey = apiKeyInput.trim();
      }

      const res = await fetch(`${REALTIME_URL}/api/admin/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveMessage({
          type: 'success',
          text: '🎉 Configuration saved to MongoDB database! AI Premium Quiz Studio is live and operational.',
        });
        setApiKeyInput('');
        fetchAdminData();
      } else {
        setSaveMessage({
          type: 'error',
          text: data.error || 'Failed to save configuration.',
        });
      }
    } catch (err: any) {
      setSaveMessage({
        type: 'error',
        text: err.message || 'Network error saving configuration.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── If User is NOT an Admin: Strict Denial Screen ────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
        <Navbar />
        <main className="flex-1 max-w-[800px] w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 w-full">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider">
                Platform Admin Restricted Area
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
                Access Denied: Administrator Privileges Required
              </h1>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Educator accounts do not have access to system API key management and platform governance. Premium AI keys and infrastructure settings are managed exclusively by the Platform Administrator.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 max-w-sm mx-auto text-left space-y-1">
              <div><strong>Authorized Account:</strong> alixadmin@gmail.com</div>
              <div><strong>Access Level:</strong> Platform Administrator (RKGlobal EdTech)</div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Return to Dashboard
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-black text-xs shadow-md transition-all active:scale-95"
              >
                Sign In as Platform Admin
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Verified Admin Screen ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      <Navbar />

      <main className="flex-1 max-w-[1300px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Executive Header Banner */}
        <div className="bg-gradient-to-r from-[#200B3B] via-[#331166] to-[#1F0744] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-alix-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>RKGlobal EdTech • System Administration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight">
                Platform Admin & AI Gateway Settings
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Centralized cloud management for OpenRouter API keys, model failover sequences (Grok ➡️ Gemini), and platform metrics. Changes apply instantly across all active lecture sessions with zero server interruption.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg ring-2 ring-amber-300/50">
                <Award className="w-4 h-4 text-slate-950 fill-current" />
                <span>Verified Platform Admin (alixadmin@gmail.com)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live System Metrics Quick Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-heading font-black text-slate-900">
                {metrics ? metrics.totalQuizzes : '...'}
              </div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Quizzes
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-heading font-black text-slate-900">
                {metrics ? metrics.totalTeachers : '...'}
              </div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Educators
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-heading font-black text-slate-900">
                {metrics ? metrics.totalLiveSessions : '...'}
              </div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Live Sessions
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-heading font-black text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>MongoDB Active</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Cloud Cluster
              </div>
            </div>
          </div>
        </div>

        {/* Status & Feedback Banner */}
        {saveMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Main Configuration Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: OpenRouter Secret Key Vault & Model Routing (Col span 8) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-black text-slate-900">
                    OpenRouter AI Key Vault
                  </h2>
                  <p className="text-xs text-slate-500">
                    Shared platform key stored in encrypted MongoDB. When configured, all faculty can create AI quizzes without individual keys.
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    config?.isConfigured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      config?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span>{config?.isConfigured ? 'Gateway Active' : 'Unconfigured'}</span>
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* Current Stored Key Display */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Current Active Key in Database
                </label>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-slate-700">
                  <span>{config?.maskedKey || 'No database key configured yet'}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Source: {config?.source || 'None'}
                  </span>
                </div>
                {config?.updatedAt && (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Last updated by <strong>{config.updatedBy}</strong> on{' '}
                    {new Date(config.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(config.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Update Key Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Enter New / Replacement OpenRouter API Key
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Get keys from{' '}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      openrouter.ai/keys ↗
                    </a>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-or-v1-xxxxxxxxxxxxxxxx..."
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 font-mono text-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  If the key runs out of credits or gets revoked, paste your new key here and click <strong>"Save Configuration"</strong>. All live games and teachers update instantaneously with zero server redeployment!
                </p>
              </div>

              {/* Model Priority Routing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Primary Model (Attempted First)
                  </label>
                  <select
                    value={primaryModel}
                    onChange={(e) => setPrimaryModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="x-ai/grok-2-vision-1212">xAI Grok 2 Vision (Recommended)</option>
                    <option value="x-ai/grok-beta">xAI Grok Beta</option>
                    <option value="google/gemini-2.0-flash-exp:free">Google Gemini 2.0 Flash (Free)</option>
                    <option value="google/gemini-2.0-flash-001">Google Gemini 2.0 Flash (Production)</option>
                    <option value="anthropic/claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                    <option value="openai/gpt-4o">OpenAI GPT-4o</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Secondary Fallback (If Primary Fails)
                  </label>
                  <select
                    value={fallbackModel}
                    onChange={(e) => setFallbackModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="google/gemini-2.0-flash-exp:free">Google Gemini 2.0 Flash (Free Tier)</option>
                    <option value="google/gemini-flash-1.5">Google Gemini Flash 1.5</option>
                    <option value="meta-llama/llama-3.3-70b-instruct:free">Meta Llama 3.3 70B (Free)</option>
                    <option value="qwen/qwen-2.5-72b-instruct:free">Qwen 2.5 72B (Free)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting}
                  className="px-5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-heading font-black text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Verifying OpenRouter Connection...' : 'Test Connection Live'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving to Database...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Failover Pipeline & Test Diagnostics (Col span 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Failover Pipeline Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Failover Sequence</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-purple-900">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>xAI Grok 2 Vision</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-700">Primary</span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-indigo-900">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Google Gemini 2.0 Flash</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-700">Failover</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Meta Llama 3.3 Free</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-500">Backup</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>ALIX Pedagogical Engine</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-amber-700">Heuristic</span>
                </div>
              </div>
            </div>

            {/* Test Results Card */}
            {testResult && testResult.valid && (
              <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OpenRouter Key Verified</span>
                </div>

                <div className="space-y-1.5 text-xs text-emerald-950 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-normal">Account Label:</span>
                    <span className="font-mono">{testResult.details?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-normal">Credit Usage:</span>
                    <span className="font-mono">{testResult.details?.usageUsd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-normal">Spending Limit:</span>
                    <span className="font-mono">{testResult.details?.limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-normal">Free Tier:</span>
                    <span>{testResult.details?.isFreeTier ? 'Yes (Free)' : 'No (Paid Account)'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Quick Launch */}
            <div className="bg-[#1E0B36] text-white p-6 rounded-3xl border border-purple-800/40 shadow-sm space-y-3">
              <h3 className="font-heading font-black text-sm">
                Ready to test AI Quiz Studio?
              </h3>
              <p className="text-xs text-purple-200 leading-relaxed">
                Open the authoring studio to generate curriculum questions from lecture notes or topics.
              </p>
              <Link
                to="/create?ai=true"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-heading font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Open AI Quiz Studio</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Educator AI Studio Licensing & Access Controls ──────────────────── */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-heading font-black text-slate-900">
                  Educator Accounts & AI Studio Licensing
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                  Monetization & Quota Control
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                AI Studio is a Premium feature. Only educators with active licenses enabled below can generate questions using the platform OpenRouter gateway.
              </p>
            </div>

            {/* Bulk Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkAi(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-all cursor-pointer"
              >
                Enable All
              </button>
              <button
                type="button"
                onClick={() => handleBulkAi(false)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition-all cursor-pointer"
              >
                Disable All
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <input
              type="text"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search educators by name, email, or department..."
              className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-indigo-600 w-full sm:w-80"
            />
            <div className="text-xs text-slate-400">
              Showing{' '}
              <strong>
                {
                  teachers.filter(
                    (t) =>
                      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                      t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                      (t.department || '').toLowerCase().includes(teacherSearch.toLowerCase())
                  ).length
                }
              </strong>{' '}
              of {teachers.length} registered educators
            </div>
          </div>

          {/* Teachers List Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Educator Profile</th>
                  <th className="py-3 px-4">Institution / Department</th>
                  <th className="py-3 px-4">Account Role</th>
                  <th className="py-3 px-4">AI Studio Access</th>
                  <th className="py-3 px-4 text-right">License Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers
                  .filter(
                    (t) =>
                      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                      t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                      (t.department || '').toLowerCase().includes(teacherSearch.toLowerCase())
                  )
                  .map((t) => {
                    const isSuperAdmin = t.role === 'admin';
                    const isToggling = togglingTeacherId === t.id;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{t.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{t.institution || 'Academic Institution'}</div>
                          <div className="text-[11px] text-slate-400">{t.department || 'Faculty'}</div>
                        </td>
                        <td className="py-3 px-4">
                          {isSuperAdmin ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase">
                              Platform Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              Educator
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isSuperAdmin || t.aiEnabled ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>👑 Premium Active</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider w-fit block">
                              🔒 Inactive / Free Tier
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isSuperAdmin ? (
                            <span className="text-[11px] text-slate-400 italic">Always Active</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleTeacherAi(t.id, t.aiEnabled)}
                              disabled={isToggling}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95 ${
                                t.aiEnabled
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              {isToggling
                                ? 'Updating...'
                                : t.aiEnabled
                                ? 'Revoke AI License'
                                : 'Grant AI License'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
