import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import StudentQRScannerModal from '../components/common/StudentQRScannerModal';
import { ALIX_AVATARS, AlixAvatar } from '../components/game/AlixAvatars';
import { RenderAvatarSvg } from '../components/game/AlixSvgAvatars';
import { REALTIME_URL } from '../services/socket';
import {
  Sparkles,
  ArrowRight,
  Camera,
  Shuffle,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  Lock,
  CheckCircle2,
  Globe,
  Radio,
  Compass,
  Play,
  PenTool,
} from 'lucide-react';

export const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pinValue, setPinValue] = useState('');
  const [nickname, setNickname] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [requiresRoster, setRequiresRoster] = useState(false);
  const [sessionCourseName, setSessionCourseName] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [selectedAvatar, setSelectedAvatar] = useState<AlixAvatar>(ALIX_AVATARS[0]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [sessionQuizId, setSessionQuizId] = useState<string | null>(null);
  const [qrDetectedMessage, setQrDetectedMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL query parameters (e.g. from camera QR scan: /join?pin=842915)
  useEffect(() => {
    const urlPin = searchParams.get('pin');
    if (urlPin && urlPin.length === 6) {
      setPinValue(urlPin.toUpperCase());
      setQrDetectedMessage(`PIN ${urlPin} detected from projector scan!`);
      checkSessionRequirements(urlPin.toUpperCase());
    }
  }, [searchParams]);

  const checkSessionRequirements = async (code: string) => {
    const cleaned = code.replace(/\s+/g, '').toUpperCase();
    if (cleaned.length !== 6) return;
    try {
      const res = await fetch(`${REALTIME_URL}/api/sessions/${cleaned}`);
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setIsLocked(!!data.session.isLocked);
          setRequiresRoster(!!data.session.requireRoster);
          if (data.session.quizId) setSessionQuizId(data.session.quizId);
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

  const handlePinInput = (val: string) => {
    // Only accept alphanumeric characters, up to 6
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    setPinValue(cleaned);
    setError(null);
    setQrDetectedMessage(null);

    if (cleaned.length === 6) {
      checkSessionRequirements(cleaned);
    } else {
      setRequiresRoster(false);
      setSessionCourseName(null);
      setIsLocked(false);
    }
  };

  const handleQRDetected = (detectedPin: string) => {
    const cleaned = detectedPin.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    setPinValue(cleaned);
    setQrDetectedMessage(`PIN ${cleaned} loaded from Camera!`);
    checkSessionRequirements(cleaned);
  };

  const handleRandomizeAvatar = () => {
    const random = ALIX_AVATARS[Math.floor(Math.random() * ALIX_AVATARS.length)];
    setSelectedAvatar(random);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinValue.trim().toUpperCase();

    if (cleanPin.length < 6) {
      setError('Please enter the full 6-digit Game PIN.');
      return;
    }

    if (isLocked) {
      setError('This session is locked by the instructor. No late entries permitted.');
      return;
    }

    const urlQuizId = searchParams.get('quizId') || searchParams.get('sessionId') || sessionQuizId || '';

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
            pin: cleanPin,
            rollNo: rollNo.trim().toUpperCase(),
          }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.allowed) {
          setError(verifyData.message || 'Access Denied: You are not enrolled in this section roster.');
          setIsSubmitting(false);
          return;
        }

        const verifiedName = verifyData.student?.name || nickname.trim();
        if (!verifiedName) {
          setError('Please enter your name to join.');
          setIsSubmitting(false);
          return;
        }

        navigate(
          `/play/${cleanPin}?name=${encodeURIComponent(verifiedName)}&rollNo=${encodeURIComponent(
            rollNo.trim().toUpperCase()
          )}&avatar=${selectedAvatar.id}${urlQuizId ? `&quizId=${encodeURIComponent(urlQuizId)}` : ''}`
        );
      } catch (err: any) {
        setError(err.message || 'Network error verifying enrollment with classroom server.');
        setIsSubmitting(false);
      }
      return;
    }

    // Open session: strictly require student nickname / name (no auto fallback)
    if (!nickname.trim()) {
      setError('Please enter your name or nickname to enter the game.');
      return;
    }

    const finalNickname = nickname.trim();

    setIsSubmitting(true);
    setTimeout(() => {
      navigate(
        `/play/${cleanPin}?name=${encodeURIComponent(finalNickname)}&avatar=${selectedAvatar.id}${
          urlQuizId ? `&quizId=${encodeURIComponent(urlQuizId)}` : ''
        }`
      );
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#46178F] via-[#350F6E] to-[#1E0938] text-white flex flex-col justify-between selection:bg-alix-violet-400 selection:text-white relative overflow-hidden select-none">
      {/* Subtle Kahoot-style radial backdrop curves */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/[0.04] rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-alix-violet-500/[0.12] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-alix-cyan-400/[0.08] rounded-full blur-3xl pointer-events-none" />

      {/* Sleek Kahoot-style Top Navigation Bar */}
      <header className="p-3 sm:p-4 flex items-center justify-between max-w-7xl mx-auto w-full z-20">
        {/* Left: Brand Tag (Kahoot! GO style) */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-xs font-black text-white tracking-wide transition-all shadow-sm group"
          >
            <span className="font-heading font-black text-sm">ALIX!</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-alix-cyan-400 text-slate-900 tracking-wider">
              GO
            </span>
          </Link>

          {/* Mode Switcher Pills (Kahoot! top menu) */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-[#26890C]/85 hover:bg-[#26890C] text-white transition-all shadow-sm active:scale-95"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Activities</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-[#A35200]/90 hover:bg-[#A35200] text-white transition-all shadow-sm active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
              <span>Rosters</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-[#1368CE]/90 hover:bg-[#1368CE] text-white transition-all shadow-sm active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Present</span>
            </Link>

            <Link
              to="/create"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-[#E21B3C]/90 hover:bg-[#E21B3C] text-white transition-all shadow-sm active:scale-95"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Make</span>
            </Link>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-[#46178F] ring-2 ring-white/50 text-white shadow-md"
            >
              <span className="flex items-center gap-0.5 text-[10px] font-mono">
                <span className="text-rose-400">▲</span>
                <span className="text-cyan-400">◆</span>
                <span className="text-amber-400">●</span>
                <span className="text-emerald-400">■</span>
              </span>
              <span>Join</span>
            </div>
          </nav>
        </div>

        {/* Right: Quick shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
            title="Scan Projector QR Code"
          >
            <Camera className="w-3.5 h-3.5 text-alix-cyan-300" />
            <span className="hidden sm:inline">Camera Scan</span>
          </button>

          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all"
          >
            Teacher Login
          </Link>
        </div>
      </header>

      {/* Main Hero & Floating Kahoot-style Card */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10 my-auto">
        {/* Giant Centered Brand Wordmark */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-5xl sm:text-7xl font-heading font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center">
            <span>ALIX</span>
            <span className="text-alix-cyan-400 animate-bounce">!</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-semibold tracking-wider mt-1 uppercase">
            Active Learning & Interactive Experience
          </p>
        </div>

        {/* Floating White Card */}
        <div className="w-full max-w-[360px] sm:max-w-[390px] bg-white text-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 sm:p-7 relative border border-white/20 animate-scale-in">
          {/* Locked Alert */}
          {isLocked && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Room Locked by Instructor</span>
            </div>
          )}

          {/* Roster Protection Badge */}
          {requiresRoster && (
            <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                {sessionCourseName || 'Protected Section'} • Roll No Required
              </span>
            </div>
          )}

          {/* QR Scan Message */}
          {qrDetectedMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-scale-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{qrDetectedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Unified Game PIN Input with Kahoot PIN Header */}
            <div>
              <div className="text-center text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                PIN
              </div>
              <input
                id="game-pin-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                autoFocus
                maxLength={6}
                value={pinValue}
                onChange={(e) => handlePinInput(e.target.value)}
                placeholder="Enter PIN"
                className="w-full py-3.5 px-4 text-center text-xl sm:text-2xl font-mono font-black text-slate-900 placeholder-slate-400 bg-white border-2 border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-inner tracking-widest"
              />
            </div>

            {/* University Roll Number (when section roster protection is active) */}
            {requiresRoster ? (
              <div className="animate-fade-in space-y-1">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                    placeholder="University Roll Number"
                    className="w-full py-3 px-4 text-center text-sm font-mono font-bold text-alix-indigo placeholder-alix-slate-400 bg-white border-2 border-emerald-500 rounded-xl focus:ring-2 focus:ring-emerald-200 outline-none uppercase tracking-wider"
                  />
                  <GraduationCap className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[10px] text-center text-alix-slate-400">
                  Strictly 1 device per student. Verified against section roster.
                </p>
              </div>
            ) : (
              /* Nickname / Display Name */
              <div>
                <input
                  type="text"
                  required
                  maxLength={24}
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter Your Name or Nickname *"
                  className="w-full py-3.5 px-4 text-center text-base font-black text-slate-900 placeholder-slate-400 bg-white border-2 border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-inner"
                />
              </div>
            )}

            {/* Mascot Avatar Mini Bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-bold text-alix-slate-500 uppercase tracking-wider">
                  Mascot
                </span>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="text-[11px] font-bold text-alix-violet-600 hover:text-alix-violet-800 flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Random</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                {ALIX_AVATARS.slice(0, 5).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center p-0.5 transition-all cursor-pointer ${
                      selectedAvatar.id === av.id
                        ? 'ring-3 ring-alix-violet-600 scale-110 shadow-md'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    } bg-gradient-to-tr ${av.bgGradient}`}
                    title={av.name}
                  >
                    <RenderAvatarSvg avatarId={av.id} size={28} />
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            {/* Tactile Kahoot-style Join Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLocked || pinValue.length < 6}
              className="w-full py-3.5 px-4 bg-[#333333] hover:bg-[#222222] border-b-4 border-[#1c1c1c] active:border-b-0 active:translate-y-1 disabled:bg-slate-300 disabled:border-none disabled:translate-y-0 text-white font-black text-base uppercase tracking-wider rounded-xl shadow-md transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Entering Room...' : 'Join'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4 stroke-[3]" />}
            </button>
          </form>

          {/* Camera Scan Link */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>Scan Classroom Projector QR Code</span>
            </button>
          </div>
        </div>

        {/* Kahoot-style Disclaimer */}
        <div className="mt-6 text-center text-xs text-white/80 space-y-2">
          <p>
            Get started for FREE at{' '}
            <Link to="/login" className="text-white font-bold underline underline-offset-4 hover:text-alix-cyan-300">
              alix.edu
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-white/60">
            <Link to="/" className="hover:text-white transition-colors">Terms</Link>
            <span>|</span>
            <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
            <span>|</span>
            <Link to="/" className="hover:text-white transition-colors">University Notice</Link>
          </div>
        </div>
      </main>

      {/* Optical QR Scanner Modal */}
      <StudentQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleQRDetected}
      />

      {/* Bottom Footer */}
      <footer className="p-4 text-center text-xs text-white/60 z-10 flex flex-wrap items-center justify-center gap-4">
        <span>Active Learning Platform • ALIX</span>
        <span>•</span>
        <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
        <span>•</span>
        <Link to="/" className="hover:text-white transition-colors">Classroom Security</Link>
      </footer>
    </div>
  );
};

export default JoinPage;
