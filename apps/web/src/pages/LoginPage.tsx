import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Gamepad2,
} from 'lucide-react';

/**
 * Premium Light Wiring Circuit Background Component
 */
const LightWiringBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      <svg
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="login-wiring-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="0.85" fill="#E2E8F0" />
          </pattern>

          <linearGradient id="login-wire-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#46178F" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#6F2DBD" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1368CE" stopOpacity="0.12" />
          </linearGradient>

          <linearGradient id="login-wire-cyan" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00A6A6" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#1368CE" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#46178F" stopOpacity="0.08" />
          </linearGradient>

          <radialGradient id="login-center-mask" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#login-wiring-grid)" />

        {/* Top-Left Wiring Traces */}
        <g stroke="url(#login-wire-purple)" strokeWidth="1.25" fill="none">
          <path d="M -40,110 L 140,110 L 210,180 L 460,180 L 520,240 L 760,240" />
          <path d="M 60,-20 L 60,120 L 110,170 L 110,340 L 160,390 L 360,390" strokeDasharray="6 4" />
          <path d="M -20,240 L 120,240 L 180,300 L 320,300 L 370,350 L 520,350" />
        </g>

        {/* Top-Right Wiring Traces */}
        <g stroke="url(#login-wire-cyan)" strokeWidth="1.25" fill="none">
          <path d="M 1480,90 L 1240,90 L 1170,160 L 920,160 L 860,220 L 680,220" />
          <path d="M 1340,-20 L 1340,140 L 1280,200 L 1280,360 L 1220,420 L 1040,420" strokeDasharray="6 4" />
          <path d="M 1520,230 L 1320,230 L 1250,300 L 1080,300 L 1020,360 L 880,360" />
        </g>

        {/* Junction Nodes */}
        <circle cx="210" cy="180" r="3.5" fill="#FFFFFF" stroke="#46178F" strokeWidth="1.5" />
        <circle cx="520" cy="240" r="3" fill="#FFFFFF" stroke="#1368CE" strokeWidth="1.5" />
        <circle cx="160" cy="390" r="3" fill="#FFFFFF" stroke="#6F2DBD" strokeWidth="1.5" />
        <circle cx="1170" cy="160" r="3.5" fill="#FFFFFF" stroke="#00A6A6" strokeWidth="1.5" />
        <circle cx="860" cy="220" r="3" fill="#FFFFFF" stroke="#46178F" strokeWidth="1.5" />
        <circle cx="1220" cy="420" r="3" fill="#FFFFFF" stroke="#1368CE" strokeWidth="1.5" />

        <rect width="100%" height="100%" fill="url(#login-center-mask)" />
      </svg>
    </div>
  );
};

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
      if (result.verified) {
        navigate(redirectPath);
      } else {
        setError('Invalid or expired code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Submit
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
    <div className="min-h-screen flex flex-col bg-white text-[#252525] select-none relative overflow-hidden">
      {/* Light Wiring Circuit Layer */}
      <LightWiringBackground />

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <Link to="/" className="transition-transform active:scale-95">
          <AlixLogo variant="primary" size="md" showEduBadge={true} withCompanyTag={true} />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/join"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F3F3F3] text-xs font-semibold text-[#252525] transition-all"
          >
            <span className="flex items-center gap-0.5 text-[10px]">
              <span className="text-[#E21B5A]">▲</span>
              <span className="text-[#1368CE]">◆</span>
              <span className="text-[#E66C1C]">●</span>
              <span className="text-[#00A6A6]">■</span>
            </span>
            <span>Join with PIN</span>
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-[#46178F] hover:bg-[#391275] text-xs font-semibold text-white transition-all shadow-xs"
          >
            Sign up FREE
          </Link>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[420px] bg-white rounded-3xl border border-[#E5E5E5] shadow-xl p-6 sm:p-8 animate-scale-in">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-[#252525] text-center mb-1">
            Log in
          </h1>
          <p className="text-xs text-[#626262] text-center mb-5 font-normal">
            Create, host, and analyze academic learning sessions
          </p>

          {/* Auth redirect notice */}
          {searchParams.get('redirect') && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please sign in to continue to your activity</span>
            </div>
          )}

          {/* Mode Toggle (Password / Email OTP) */}
          <div className="flex bg-[#F7F7F8] p-1 rounded-xl border border-[#E5E5E5] mb-5 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'password'
                  ? 'bg-white text-[#252525] shadow-xs font-semibold'
                  : 'text-[#626262] hover:text-[#252525] font-medium'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#46178F]" />
              <span>Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'otp'
                  ? 'bg-white text-[#252525] shadow-xs font-semibold'
                  : 'text-[#626262] hover:text-[#252525] font-medium'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#00A6A6]" />
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
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#626262]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] hover:bg-white focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 outline-none text-sm text-[#252525] placeholder-[#626262] font-normal transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-xl bg-[#46178F] hover:bg-[#391275] active:scale-98 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Sending code...' : 'Send Login Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-scale-in">
                  {/* OTP Dispatched Banner */}
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[#46178F] text-xs">
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#46178F]" />
                        <span>Code sent!</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpStep('request')}
                        className="text-[11px] text-[#46178F] underline font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-[#626262] text-[11px] font-normal">
                      Enter the 6-digit code sent to <strong className="text-[#252525]">{email}</strong>
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
                        className="w-11 h-12 text-center text-xl font-mono font-bold rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 outline-none text-[#252525] transition-all"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-xl bg-[#46178F] hover:bg-[#391275] active:scale-98 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify & Log in'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center text-xs pt-1">
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleRequestOtp}
                      className="text-[#46178F] hover:underline font-semibold disabled:text-slate-400 flex items-center gap-1 cursor-pointer"
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
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#626262]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] hover:bg-white focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 outline-none text-sm text-[#252525] placeholder-[#626262] font-normal transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#626262] uppercase tracking-wider">
                    Password
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('otp')}
                    className="text-[11px] text-[#46178F] hover:underline cursor-pointer font-medium"
                  >
                    Use Email OTP?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#626262]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] hover:bg-white focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 outline-none text-sm text-[#252525] placeholder-[#626262] font-normal transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-[#46178F] hover:bg-[#391275] active:scale-98 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing in...' : 'Log in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Register Link */}
          <div className="mt-5 text-center text-xs text-[#626262] font-normal">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold text-[#46178F] hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[#626262] z-10 flex flex-wrap items-center justify-center gap-2">
        <span>Academic Learning Platform • RKGlobal EdTech</span>
        <span>•</span>
        <Link to="/" className="hover:text-[#252525] transition-colors">Terms</Link>
        <span>•</span>
        <Link to="/" className="hover:text-[#252525] transition-colors">Privacy</Link>
      </footer>
    </div>
  );
};

export default LoginPage;
