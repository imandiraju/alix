import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, sendOtp, verifyOtp } = useAuth();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Login Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('password');

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
      setError('Enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await sendOtp(email);
      setDispatchedOtp(res.code);
      setOtpStep('verify');
      setResendCooldown(30);

      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to send code. Please retry.');
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
      setError('Enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOtp(email, code);
      if (result.verified && result.user) {
        navigate(redirectPath);
      } else {
        setError('No account found for this email. Please sign up first.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Traditional Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#46178F] via-[#350F6E] to-[#1E0938] select-none relative overflow-hidden">
      {/* Ambient glow circles */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-violet-500/[0.1] rounded-full blur-3xl pointer-events-none" />

      {/* Top bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <Link to="/" className="transition-transform active:scale-95">
          <span className="text-xl font-heading font-black text-white tracking-tight flex items-center">
            ALIX<span className="text-cyan-400">!</span>
          </span>
        </Link>
        <Link
          to="/join"
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
        >
          Join a game
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 sm:p-8">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 text-center mb-1">
            Log in
          </h1>
          <p className="text-xs text-slate-500 text-center mb-5">
            Create and host interactive activities
          </p>

          {/* Auth redirect notice */}
          {searchParams.get('redirect') && (
            <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Sign in to continue</span>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'password'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'otp'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>
          </div>

          {/* MODE 1: Email OTP */}
          {authMode === 'otp' && (
            <>
              {otpStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-600 outline-none text-sm text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-lg bg-[#333333] hover:bg-[#222222] border-b-4 border-[#1c1c1c] active:border-b-0 active:translate-y-1 text-white font-bold text-sm transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:border-none disabled:translate-y-0"
                  >
                    <span>{isLoading ? 'Sending...' : 'Send OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-scale-in">
                  {/* OTP Dispatched Banner */}
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs">
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Code sent!</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpStep('request')}
                        className="text-[11px] text-indigo-700 underline font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Enter the 6-digit code sent to <strong className="text-slate-900">{email}</strong>
                    </p>
                  </div>

                  {/* 6-Digit OTP Boxes */}
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
                        className="w-11 h-13 text-center text-xl font-mono font-black rounded-lg border-2 border-slate-200 focus:border-indigo-600 outline-none transition-all text-slate-900 bg-slate-50"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-lg bg-[#333333] hover:bg-[#222222] border-b-4 border-[#1c1c1c] active:border-b-0 active:translate-y-1 text-white font-bold text-sm transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:border-none disabled:translate-y-0"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify & Log in'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center text-xs pt-1">
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleRequestOtp}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold disabled:text-slate-400 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* MODE 2: Password */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-600 outline-none text-sm text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Password
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('otp')}
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    Use OTP instead?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-600 outline-none text-sm text-slate-900 font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-lg bg-[#333333] hover:bg-[#222222] border-b-4 border-[#1c1c1c] active:border-b-0 active:translate-y-1 text-white font-bold text-sm transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:border-none disabled:translate-y-0"
              >
                <span>{isLoading ? 'Signing in...' : 'Log in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Register Link */}
          <div className="mt-5 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-white/50 z-10 flex flex-wrap items-center justify-center gap-2">
        <span>ALIX</span>
        <span>|</span>
        <Link to="/" className="hover:text-white transition-colors">Terms</Link>
        <span>|</span>
        <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
      </footer>
    </div>
  );
};

export default LoginPage;
