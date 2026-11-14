import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AlixLogo from '../components/common/AlixLogo';
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
  ArrowRight,
  Database,
  Users,
  Activity,
  Award,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, updateUser } = useAuth();

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

  // Admin Claim Modal / Passcode
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Load config & metrics
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [configRes, metricsRes] = await Promise.all([
        fetch(`${REALTIME_URL}/api/admin/config`),
        fetch(`${REALTIME_URL}/api/admin/overview`),
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
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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
        // Refresh status
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
          text: '🎉 Configuration saved to MongoDB database! All teachers can now generate quizzes uninterrupted.',
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

  // ─── Claim Platform Admin Role ───────────────────────────────────────────────
  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasscode.trim()) return;

    setIsClaiming(true);
    setClaimError(null);

    try {
      const res = await fetch(`${REALTIME_URL}/api/admin/claim-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: adminPasscode.trim(),
          userId: user?.id,
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setClaimSuccess(true);
        updateUser(data.user, data.token);
      } else {
        setClaimError(data.error || 'Invalid Platform Admin Passcode.');
      }
    } catch (err: any) {
      setClaimError(err.message || 'Error communicating with authentication server.');
    } finally {
      setIsClaiming(false);
    }
  };

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
              {isAdmin ? (
                <div className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg ring-2 ring-amber-300/50">
                  <Award className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Verified Platform Admin</span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-white/10 text-white font-bold text-xs flex items-center gap-2 border border-white/20">
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Educator Role</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* If user is not yet an admin, show Admin Claim elevation card */}
        {!isAdmin && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-amber-950 text-base">
                    Elevate Account to Platform Admin
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Enter the system master admin passcode (provided during initial server deployment) to unlock full cloud configuration and key management privileges.
                  </p>
                </div>
              </div>

              <form onSubmit={handleClaimAdmin} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter Master Passcode..."
                  className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 text-xs font-mono outline-none focus:border-amber-500 w-full sm:w-56"
                />
                <button
                  type="submit"
                  disabled={isClaiming || !adminPasscode.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  {isClaiming ? 'Verifying...' : 'Unlock Admin'}
                </button>
              </form>
            </div>

            {claimError && (
              <p className="text-xs font-bold text-rose-600 mt-3 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{claimError}</span>
              </p>
            )}

            {claimSuccess && (
              <p className="text-xs font-bold text-emerald-700 mt-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Admin privileges unlocked! You now have full platform governance access.</span>
              </p>
            )}
          </div>
        )}

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
                  If the key runs out of credits or gets revoked, simply paste your new key here and click <strong>"Save Configuration"</strong>. All live games and teachers update instantaneously!
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
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
