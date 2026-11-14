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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#46178F] via-[#350F6E] to-[#1E0938] select-none relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-violet-500/[0.1] rounded-full blur-3xl pointer-events-none" />

      {/* Top bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <Link to="/" className="transition-transform active:scale-95">
          <AlixLogo variant="white" size="md" showEduBadge={true} withCompanyTag={true} />
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
        >
          Already have an account? Log in
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 text-center mb-1">
            {stage === 'details' ? 'Sign up' : 'Verify email'}
          </h1>
          <p className="text-xs text-slate-500 text-center mb-5">
            {stage === 'details'
              ? 'Create, host, and play interactive learning games'
              : `Enter the code sent to ${formData.email}`}
          </p>

          {/* STAGE 1: Profile Details */}
          {stage === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full name"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-600 text-sm text-slate-900 font-medium outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-600 text-sm text-slate-900 font-medium outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="University / Institution"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-600 text-sm text-slate-900 font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Department"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-600 text-sm text-slate-900 font-medium outline-none"
                  />
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-600 text-sm text-slate-900 font-medium outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 w-4 h-4"
                  />
                  <span>I accept the terms of service and privacy policy.</span>
                </label>
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
                <span>{isLoading ? 'Sending code...' : 'Sign up'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STAGE 2: OTP Verification */
            <form onSubmit={handleVerifyAndComplete} className="space-y-4 animate-scale-in">
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Code sent!</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStage('details')}
                    className="text-[11px] text-indigo-700 underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Enter the code sent to <strong className="text-slate-900">{formData.email}</strong>
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
                    className="w-11 h-13 text-center text-xl font-mono font-black rounded-lg border-2 border-slate-200 focus:border-indigo-600 outline-none text-slate-900 bg-slate-50"
                    autoFocus={i === 0}
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
                <span>{isLoading ? 'Verifying...' : 'Verify & continue'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center text-xs pt-1">
                <button
                  type="button"
                  onClick={() => sendOtp(formData.email)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend code</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
            >
              Log in
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

export default RegisterPage;
