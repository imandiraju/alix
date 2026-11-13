import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, sendOtp, verifyOtp } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    department: '',
    password: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Registration Stage: 'details' | 'otp_verify'
  const [stage, setStage] = useState<'details' | 'otp_verify'>('details');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all required academic fields.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Academic Integrity and Assessment Protection Terms.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Dispatch verification OTP to their institutional email
      const res = await sendOtp(formData.email);
      setDispatchedOtp(res.code);
      setStage('otp_verify');
    } catch {
      setError('Could not dispatch verification code to this email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);
    setError(null);

    if (cleaned && index < 5) {
      document.getElementById(`reg-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`reg-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const ok = await verifyOtp(formData.email, code);
      if (ok) {
        await register(formData);
        navigate('/dashboard');
      } else {
        setError('Invalid or expired confirmation code. Please check your institutional email and retry.');
      }
    } catch {
      setError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-alix-slate-50 select-none relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-alix-violet-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-alix-cyan-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link to="/" className="transition-transform active:scale-95">
          <AlixLogo size="md" />
        </Link>
        <Link
          to="/login"
          className="text-xs font-bold text-alix-indigo hover:text-alix-violet-700 bg-white border border-alix-slate-300 px-3.5 py-1.5 rounded-full shadow-sm"
        >
          Already registered? Sign In →
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-alix-slate-200 shadow-alix-lg p-6 sm:p-10 relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-alix-violet-50 text-alix-violet-700 text-xs font-bold mb-2 border border-alix-violet-200">
              <GraduationCap className="w-4 h-4 text-alix-violet-600" />
              <span>Higher Education Faculty Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-alix-indigo tracking-tight">
              {stage === 'details' ? 'Register Faculty Account' : 'Verify Academic Email'}
            </h1>
            <p className="text-xs sm:text-sm text-alix-slate-500 mt-1">
              {stage === 'details'
                ? 'Create and protect quizzes, launch live sessions, and track learning analytics.'
                : `We sent a 6-digit confirmation code to ${formData.email}`}
            </p>
          </div>

          {/* STAGE 1: Profile Details */}
          {stage === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                    Full Name / Title
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-alix-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Jane Smith"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-alix-slate-300 text-sm text-alix-indigo font-medium outline-none focus:border-alix-violet-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-alix-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="professor@university.edu"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-alix-slate-300 text-sm text-alix-indigo font-medium outline-none focus:border-alix-violet-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                  University / School Institution
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-alix-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Stanford University"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-alix-slate-300 text-sm text-alix-indigo font-medium outline-none focus:border-alix-violet-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                    Academic Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-alix-slate-300 text-sm text-alix-indigo font-medium outline-none focus:border-alix-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                    Master Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-alix-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-alix-slate-300 text-sm text-alix-indigo font-medium outline-none focus:border-alix-violet-600"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox Terms */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-alix-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-alix-violet-600 focus:ring-alix-violet-500 w-4 h-4"
                  />
                  <span>
                    I confirm that I am an authorized educator/instructor and accept ALIX's Assessment Data Protection guidelines.
                  </span>
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
              >
                <span>{isLoading ? 'Sending Verification Code...' : 'Continue to Email Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STAGE 2: Email OTP Verification */
            <form onSubmit={handleVerifyAndComplete} className="space-y-5 animate-scale-in">
              <div className="p-3.5 rounded-2xl bg-alix-violet-50 border border-alix-violet-200 text-alix-violet-900 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-alix-violet-600" />
                    <span>Instant Email Verification</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStage('details')}
                    className="text-[11px] text-alix-violet-700 underline font-semibold cursor-pointer"
                  >
                    Edit Info
                  </button>
                </div>
                <p className="text-[11px] text-alix-slate-600">
                  Please enter the 6-digit confirmation code dispatched to <strong>{formData.email}</strong>.
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-2 text-center">
                  6-Digit Institutional Code
                </label>
                <div className="flex justify-center gap-2">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      id={`reg-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-14 text-center text-xl font-mono font-black rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-4 focus:ring-alix-violet-100 outline-none text-alix-indigo bg-alix-slate-50"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-indigo hover:from-alix-violet-700 hover:to-alix-indigo text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify Email & Enter Dashboard'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => sendOtp(formData.email)}
                  className="text-alix-violet-600 hover:text-alix-violet-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 text-center text-xs text-alix-slate-500">
            <span>Already have credentials? </span>
            <Link
              to="/login"
              className="font-bold text-alix-violet-600 hover:text-alix-violet-800 underline underline-offset-4"
            >
              Sign In Here
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-alix-slate-400">
        ALIX – Active Learning & Interactive Experience
      </footer>
    </div>
  );
};

export default RegisterPage;
