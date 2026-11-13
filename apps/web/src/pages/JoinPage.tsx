import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import StudentQRScannerModal from '../components/common/StudentQRScannerModal';
import { ALIX_AVATARS, AlixAvatar } from '../components/game/AlixAvatars';
import { RenderAvatarSvg } from '../components/game/AlixSvgAvatars';
import { REALTIME_URL } from '../services/socket';
import {
  Sparkles,
  ArrowRight,
  User,
  QrCode,
  CheckCircle2,
  Camera,
  Shuffle,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [nickname, setNickname] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [requiresRoster, setRequiresRoster] = useState(false);
  const [sessionCourseName, setSessionCourseName] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [selectedAvatar, setSelectedAvatar] = useState<AlixAvatar>(ALIX_AVATARS[0]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrDetectedMessage, setQrDetectedMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL query parameters (e.g. from camera QR scan: /join?pin=842915)
  useEffect(() => {
    const urlPin = searchParams.get('pin');
    if (urlPin && urlPin.length === 6) {
      applyPin(urlPin);
      setQrDetectedMessage(`PIN ${urlPin} loaded from QR code!`);
    }
  }, [searchParams]);

  const applyPin = (code: string) => {
    const chars = code.toUpperCase().slice(0, 6).split('');
    const newPin = ['', '', '', '', '', ''];
    chars.forEach((c, i) => {
      newPin[i] = c;
    });
    setPin(newPin);
    setError(null);
    checkSessionRequirements(code.toUpperCase());
  };

  const checkSessionRequirements = async (fullPin: string) => {
    if (fullPin.length !== 6) return;
    try {
      const res = await fetch(`${REALTIME_URL}/api/sessions/${fullPin}`);
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setIsLocked(!!data.session.isLocked);
          setRequiresRoster(!!data.session.requireRoster);
          setSessionCourseName(
            data.session.roster
              ? `${data.session.roster.courseCode} (${data.session.roster.section})`
              : data.session.quizTitle
          );
        }
      }
    } catch {
      // quiet
    }
  };

  const handlePinChange = (index: number, value: string) => {
    const cleaned = value.toUpperCase().slice(-1);
    const newPin = [...pin];
    newPin[index] = cleaned;
    setPin(newPin);
    setError(null);

    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    const fullCode = newPin.join('');
    if (fullCode.length === 6) {
      checkSessionRequirements(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleQRDetected = (detectedPin: string) => {
    applyPin(detectedPin);
    setQrDetectedMessage(`PIN ${detectedPin} Verified via Camera!`);
  };

  const handleRandomizeAvatar = () => {
    const random = ALIX_AVATARS[Math.floor(Math.random() * ALIX_AVATARS.length)];
    setSelectedAvatar(random);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');

    if (fullPin.length < 6) {
      setError('Please enter the complete 6-digit session PIN.');
      return;
    }

    if (isLocked) {
      setError('This session has been locked by the instructor. No new joiners are permitted.');
      return;
    }

    // If session requires roster, verify Roll Number
    if (requiresRoster) {
      if (!rollNo.trim()) {
        setError('Please enter your University Roll Number.');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const verifyRes = await fetch(`${REALTIME_URL}/api/rosters/verify-student`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pin: fullPin,
            rollNo: rollNo.trim().toUpperCase(),
          }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.allowed) {
          setError(verifyData.message || 'Access Denied: You are not enrolled in this section.');
          setIsSubmitting(false);
          return;
        }

        const verifiedName = verifyData.student?.name || nickname.trim() || 'Student';
        navigate(
          `/play/${fullPin}?name=${encodeURIComponent(verifiedName)}&rollNo=${encodeURIComponent(
            rollNo.trim().toUpperCase()
          )}&avatar=${selectedAvatar.id}`
        );
      } catch (err: any) {
        setError(err.message || 'Failed to verify enrollment with classroom server.');
        setIsSubmitting(false);
      }
      return;
    }

    // Open session: standard nickname entry
    if (!nickname.trim()) {
      setError('Please choose a display name or nickname.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      navigate(
        `/play/${fullPin}?name=${encodeURIComponent(nickname.trim())}&avatar=${selectedAvatar.id}`
      );
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-alix-slate-50 relative overflow-hidden select-none">
      {/* Decorative backdrop glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-alix-violet-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-alix-cyan-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <AlixLogo size="md" withTagline={false} />
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-alix-slate-300 text-alix-indigo text-xs font-bold hover:border-alix-violet-400 hover:bg-alix-violet-50 transition-all shadow-sm cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-alix-cyan-600" />
          <span>Scan Projector QR</span>
        </button>
      </header>

      {/* Main Join Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-alix-slate-200 shadow-alix-lg p-6 sm:p-8 relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-alix-violet-50 text-alix-violet-700 text-xs font-bold mb-2 border border-alix-violet-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Classroom</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-alix-indigo tracking-tight">
              Join ALIX
            </h1>
            <p className="text-xs sm:text-sm text-alix-slate-500 mt-1">
              Enter the 6-digit room PIN or scan the projector screen.
            </p>
          </div>

          {/* Locked Room Alert */}
          {isLocked && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Session Locked: The instructor has closed entry for this quiz.</span>
            </div>
          )}

          {/* Roster Protection Badge */}
          {requiresRoster && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Protected Roster Active: {sessionCourseName}. Roll Number verification required.
              </span>
            </div>
          )}

          {/* QR Code Auto-fill Notification */}
          {qrDetectedMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-scale-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{qrDetectedMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 6-Digit PIN Boxes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-alix-slate-600">
                  Session PIN
                </label>
                <span className="text-[11px] text-alix-slate-400">6 digits from screen</span>
              </div>

              <div className="flex gap-1.5 sm:gap-2 justify-between">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="flex-1 max-w-[50px] h-12 sm:h-16 text-center text-lg sm:text-2xl font-mono font-black text-alix-indigo bg-alix-slate-50 border-2 border-alix-slate-300 focus:border-alix-violet-600 focus:bg-white rounded-xl shadow-inner outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* University Roll Number (if Roster Required) */}
            {requiresRoster ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>University Roll Number / Reg No *</span>
                </label>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="e.g. AP21110010045"
                  className="w-full px-4 py-3 rounded-xl border border-alix-slate-300 focus:border-emerald-600 outline-none text-sm font-mono font-bold text-alix-indigo uppercase tracking-wider shadow-inner"
                />
                <p className="text-[11px] text-alix-slate-400 mt-1">
                  Only 1 active device allowed per student. Duplicate logins are blocked.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                  Your Name / Nickname
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={24}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-alix-slate-300 focus:border-alix-violet-600 outline-none text-sm font-semibold text-alix-indigo shadow-inner"
                  />
                  <User className="w-4 h-4 text-alix-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            {/* Avatar Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-alix-slate-600">
                  Select Mascot Avatar
                </span>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="text-xs font-bold text-alix-violet-600 hover:text-alix-violet-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Random</span>
                </button>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {ALIX_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center p-1 transition-all ${
                      selectedAvatar.id === av.id
                        ? 'ring-3 ring-alix-violet-600 scale-105 shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:scale-100'
                    } bg-gradient-to-tr ${av.bgGradient}`}
                    title={av.name}
                  >
                    <RenderAvatarSvg avatarId={av.id} size={34} />
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-indigo hover:from-alix-violet-700 hover:to-alix-indigo text-white font-bold text-base shadow-alix-md hover:shadow-alix-glow active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Verifying with Classroom...' : 'Join ALIX Live'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* QR Camera Shortcut */}
          <div className="mt-5 pt-4 border-t border-alix-slate-100 flex items-center justify-between text-xs">
            <span className="text-alix-slate-400">Classroom screen visible?</span>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="text-alix-cyan-700 hover:text-alix-cyan-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Camera Scan</span>
            </button>
          </div>
        </div>
      </main>

      {/* Optical QR Scanner Modal (with real camera feed, no simulation buttons) */}
      <StudentQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleQRDetected}
      />

      {/* Footer disclaimer */}
      <footer className="p-4 text-center text-xs text-alix-slate-400">
        <p>ALIX – Where Every Learner Participates.</p>
      </footer>
    </div>
  );
};

export default JoinPage;
