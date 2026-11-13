import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AlixLogo from '../components/common/AlixLogo';
import StudentQRScannerModal from '../components/common/StudentQRScannerModal';
import { ALIX_AVATARS, AlixAvatar } from '../components/game/AlixAvatars';
import { RenderAvatarSvg } from '../components/game/AlixSvgAvatars';
import {
  Sparkles,
  ArrowRight,
  User,
  QrCode,
  CheckCircle2,
  Camera,
  Shuffle,
} from 'lucide-react';

export const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AlixAvatar>(ALIX_AVATARS[0]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrDetectedMessage, setQrDetectedMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL query parameters (e.g. from camera QR code scan: /join?pin=842915)
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
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleQRDetected = (detectedPin: string) => {
    applyPin(detectedPin);
    setQrDetectedMessage(`PIN ${detectedPin} Recognized via Optical Scan!`);
  };

  const handleRandomizeAvatar = () => {
    const random = ALIX_AVATARS[Math.floor(Math.random() * ALIX_AVATARS.length)];
    setSelectedAvatar(random);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');

    if (fullPin.length < 6) {
      setError('Please enter the complete 6-digit session PIN or scan the QR code.');
      return;
    }

    if (!nickname.trim()) {
      setError('Please choose a nickname.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      navigate(
        `/play/${fullPin}?name=${encodeURIComponent(nickname)}&avatar=${selectedAvatar.id}`
      );
    }, 350);
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-alix-slate-300 text-alix-indigo text-xs font-bold hover:border-alix-violet-400 hover:bg-alix-violet-50 transition-all shadow-sm cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-alix-cyan-600" />
          <span>Scan Classroom QR</span>
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
              Scan the projector QR code or enter the 6-digit PIN.
            </p>
          </div>

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
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="text-xs font-bold text-alix-violet-700 hover:text-alix-violet-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3 h-3 text-alix-coral-500" />
                  <span>Scan QR Code</span>
                </button>
              </div>

              <div className="flex justify-center gap-2 sm:gap-2.5">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pin-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-15 text-center text-2xl font-mono font-black rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-4 focus:ring-alix-violet-100 outline-none transition-all text-alix-indigo bg-alix-slate-50/50"
                    placeholder="•"
                    autoFocus={idx === 0 && !searchParams.get('pin')}
                  />
                ))}
              </div>
            </div>

            {/* Mascot Avatar Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-alix-slate-600">
                  Choose Your Mascot Avatar
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="text-[11px] font-semibold text-alix-slate-500 hover:text-alix-violet-600 flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Shuffle</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {ALIX_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar.id === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? `bg-alix-violet-50 border-2 border-alix-violet-600 shadow-md scale-105 ring-2 ring-alix-violet-200`
                          : 'bg-alix-slate-50 hover:bg-alix-slate-100 border border-alix-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center p-0.5">
                        <RenderAvatarSvg avatarId={avatar.id} size={36} />
                      </div>
                      <span className="text-[10px] font-bold text-alix-indigo truncate max-w-[65px] mt-1">
                        {avatar.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nickname Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-alix-slate-600 mb-1.5">
                Your Nickname
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-alix-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Maya Lin"
                  maxLength={24}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-alix-slate-200 focus:border-alix-violet-600 focus:ring-4 focus:ring-alix-violet-100 outline-none transition-all text-alix-indigo font-medium placeholder-alix-slate-400 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-indigo hover:from-alix-violet-700 hover:to-alix-indigo text-white font-bold text-base shadow-alix-md hover:shadow-alix-glow active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              <span>{isSubmitting ? 'Entering Classroom...' : 'Join ALIX Live'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div className="mt-5 pt-4 border-t border-alix-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                applyPin('842915');
                setNickname('Alex Rivera');
              }}
              className="text-alix-violet-600 hover:text-alix-violet-800 font-semibold underline underline-offset-4 cursor-pointer"
            >
              Quick Demo PIN (842915)
            </button>

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

      {/* Optical QR Scanner Modal */}
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
