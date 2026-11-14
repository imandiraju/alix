import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  RotateCcw,
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
          <pattern id="reg-wiring-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="0.85" fill="#E2E8F0" />
          </pattern>

          <linearGradient id="reg-wire-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#46178F" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#6F2DBD" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1368CE" stopOpacity="0.12" />
          </linearGradient>

          <linearGradient id="reg-wire-cyan" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00A6A6" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#1368CE" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#46178F" stopOpacity="0.08" />
          </linearGradient>

          <radialGradient id="reg-center-mask" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#reg-wiring-grid)" />

        {/* Top-Left Wiring Traces */}
        <g stroke="url(#reg-wire-purple)" strokeWidth="1.25" fill="none">
          <path d="M -40,110 L 140,110 L 210,180 L 460,180 L 520,240 L 760,240" />
          <path d="M 60,-20 L 60,120 L 110,170 L 110,340 L 160,390 L 360,390" strokeDasharray="6 4" />
          <path d="M -20,240 L 120,240 L 180,300 L 320,300 L 370,350 L 520,350" />
        </g>

        {/* Top-Right Wiring Traces */}
        <g stroke="url(#reg-wire-cyan)" strokeWidth="1.25" fill="none">
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

        <rect width="100%" height="100%" fill="url(#reg-center-mask)" />
      </svg>
    </div>
  );
};

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
      setError('Please fill in all required fields.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the terms to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await sendOtp(formData.email);
      setDispatchedOtp(res.code);
      setStage('otp_verify');
    } catch {
      setError('Could not send verification code.');
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
      setError('Enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyOtp(formData.email, code);
      if (result.verified) {
        await register(formData);
        navigate('/dashboard');
      } else {
        setError('Invalid or expired code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
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
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg bg-white hover:bg-[#F3F3F3] border border-[#E5E5E5] text-xs font-semibold text-[#252525] transition-all shadow-xs"
        >
          Already have an account? <span className="text-[#46178F]">Log in</span>
        </Link>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[460px] bg-white rounded-3xl border border-[#E5E5E5] shadow-xl p-6 sm:p-8 animate-scale-in">
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-[#252525] text-center mb-1">
            {stage === 'details' ? 'Sign up' : 'Verify email'}
          </h1>
          <p className="text-xs text-[#626262] text-center mb-5 font-normal">
            {stage === 'details'
              ? 'Create, host, and play interactive learning games'
              : `Enter the code sent to ${formData.email}`}
          </p>

          {/* STAGE 1: Profile Details */}
          {stage === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#626262]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full name"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] hover:bg-white focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 text-sm text-[#252525] placeholder-[#626262] font-normal outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#626262]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] hover:bg-white focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 text-sm text-[#252525] placeholder-[#626262] font-normal outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#626262]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="University / Institution"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] hover:bg-white focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 text-sm text-[#252525] placeholder-[#626262] font-normal outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Department (e.g. CSE)"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] hover:bg-white focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 text-sm text-[#252525] placeholder-[#626262] font-normal outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#626262]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] hover:bg-white focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 text-sm text-[#252525] placeholder-[#626262] font-normal outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-[#626262] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#46178F] focus:ring-[#46178F] w-4 h-4 cursor-pointer"
                  />
                  <span>I accept the terms of service and privacy policy.</span>
                </label>
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
                <span>{isLoading ? 'Sending code...' : 'Sign up'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STAGE 2: OTP Verification */
            <form onSubmit={handleVerifyAndComplete} className="space-y-4 animate-scale-in">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[#46178F] text-xs">
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#46178F]" />
                    <span>Verification code sent!</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStage('details')}
                    className="text-[11px] text-[#46178F] underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-[#626262] text-[11px] font-normal">
                  Enter the 6-digit code sent to <strong className="text-[#252525]">{formData.email}</strong>
                </p>
              </div>

              {/* 6-Digit boxes */}
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
                    className="w-11 h-12 text-center text-xl font-mono font-bold rounded-xl border border-[#E5E5E5] bg-[#F7F7F8] focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 outline-none text-[#252525] transition-all"
                    autoFocus={i === 0}
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
                <span>{isLoading ? 'Verifying...' : 'Verify & continue'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center text-xs pt-1">
                <button
                  type="button"
                  onClick={() => sendOtp(formData.email)}
                  className="text-[#46178F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend code</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 text-center text-xs text-[#626262] font-normal">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-[#46178F] hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[#626262] z-10 flex flex-wrap items-center justify-center gap-2">
        <span>ALIX Platform • RKGlobal EdTech</span>
        <span>•</span>
        <Link to="/" className="hover:text-[#252525] transition-colors">Terms</Link>
        <span>•</span>
        <Link to="/" className="hover:text-[#252525] transition-colors">Privacy</Link>
      </footer>
    </div>
  );
};

export default RegisterPage;
