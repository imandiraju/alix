import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Check,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, sendOtp, verifyOtp } = useAuth();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Login Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  // OTP State
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Requesting OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your institutional email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await sendOtp(email);
      setDispatchedOtp(res.code);
      setOtpStep('verify');
      setResendCooldown(30);

      // Countdown timer for resend
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError('Failed to dispatch verification code. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit box change
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);
    setError(null);

    // Auto advance
    if (cleaned && index < 5) {
      document.getElementById(`otp-box-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-box-${index - 1}`)?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const ok = await verifyOtp(email, code);
      if (ok) {
        navigate(redirectPath);
      } else {
        setError('Invalid or expired verification code. Please check your code or resend.');
      }
    } catch {
      setError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Traditional Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your institutional email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch {
      setError('Invalid academic credentials.');
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
          to="/join"
          className="text-xs font-bold text-alix-indigo hover:text-alix-violet-700 bg-white border border-alix-slate-300 px-3.5 py-1.5 rounded-full shadow-sm"
        >
          Student? Join with PIN →
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-alix-slate-200 shadow-alix-lg p-6 sm:p-10 relative">
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-alix-violet-50 text-alix-violet-700 text-xs font-bold mb-2 border border-alix-violet-200">
              <ShieldCheck className="w-3.5 h-3.5 text-alix-violet-600" />
              <span>Verified Faculty Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-alix-indigo tracking-tight">
              Instructor Sign In
            </h1>
            <p className="text-xs sm:text-sm text-alix-slate-500 mt-1">
              Securely access quiz authoring, question banks, and learning analytics.
            </p>
          </div>

          {/* Security Notice if redirected */}
          {searchParams.get('redirect') && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Instructor authentication required to author questions or host live sessions.</span>
            </div>
          )}

          {/* Authentication Mode Tabs */}
          <div className="flex bg-alix-slate-100 p-1 rounded-xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'otp'
                  ? 'bg-white text-alix-violet-700 shadow-sm'
                  : 'text-alix-slate-500 hover:text-alix-indigo'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Quick Email OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'password'
                  ? 'bg-white text-alix-violet-700 shadow-sm'
                  : 'text-alix-slate-500 hover:text-alix-indigo'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password Sign In</span>
            </button>
          </div>

          {/* MODE 1: Email OTP Verification */}
          {authMode === 'otp' && (
            <>
              {otpStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-alix-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="professor@university.edu"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-4 focus:ring-alix-violet-100 outline-none text-sm text-alix-indigo font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-alix-slate-400 mt-1">
                      We'll send a 6-digit one-time password for instant access without a password.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                  >
                    <span>{isLoading ? 'Dispatching OTP...' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-scale-in">
                  {/* OTP Dispatched Banner */}
                  <div className="p-3.5 rounded-2xl bg-alix-violet-50 border border-alix-violet-200 text-alix-violet-900 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-alix-violet-600" />
                        <span>OTP Dispatched!</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpStep('request')}
                        className="text-[11px] text-alix-violet-700 underline font-semibold cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>
                    <p className="text-alix-slate-600 text-[11px]">
                      Enter the 6-digit code sent to <strong className="text-alix-indigo">{email}</strong>.
                    </p>
                    {dispatchedOtp && (
                      <div className="pt-1 font-mono font-bold text-alix-indigo flex items-center justify-between text-xs bg-white/80 p-1.5 rounded-lg border border-alix-violet-200">
                        <span>Verification Code:</span>
                        <span className="text-alix-violet-700 text-sm tracking-wider">{dispatchedOtp}</span>
                      </div>
                    )}
                  </div>

                  {/* 6-Digit OTP Boxes */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-2 text-center">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex justify-center gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-14 text-center text-xl font-mono font-black rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-4 focus:ring-alix-violet-100 outline-none transition-all text-alix-indigo bg-alix-slate-50"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                      {error}
                    </div>
                  )}

                  {/* Submit OTP */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-indigo hover:from-alix-violet-700 hover:to-alix-indigo/95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <span>{isLoading ? 'Verifying OTP...' : 'Verify & Enter ALIX'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  {/* Resend helper */}
                  <div className="flex items-center justify-center text-xs pt-2">
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleRequestOtp}
                      className="text-alix-violet-600 hover:text-alix-violet-800 font-semibold disabled:text-alix-slate-400 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* MODE 2: Traditional Password Sign In */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-alix-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="professor@university.edu"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-4 focus:ring-alix-violet-100 outline-none text-sm text-alix-indigo font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-alix-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('otp')}
                    className="text-[11px] text-alix-violet-600 hover:underline"
                  >
                    Use OTP instead?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-alix-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-4 focus:ring-alix-violet-100 outline-none text-sm text-alix-indigo font-medium"
                  />
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
                className="w-full py-3.5 px-6 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In as Instructor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Register Link */}
          <div className="mt-5 text-center text-xs text-alix-slate-500">
            <span>New educator to ALIX? </span>
            <Link
              to="/register"
              className="font-bold text-alix-violet-600 hover:text-alix-violet-800 underline underline-offset-4"
            >
              Register Faculty Account
            </Link>
          </div>

          {/* Security Guarantee */}
          <div className="mt-5 p-3 rounded-xl bg-alix-slate-50 border border-alix-slate-200 text-[11px] text-alix-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Academic Integrity Protected:</strong> OTP codes expire in 10 minutes. Only verified educational emails can unlock question banks and session controls.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-alix-slate-400">
        ALIX – Active Learning & Interactive Experience
      </footer>
    </div>
  );
};

export default LoginPage;
