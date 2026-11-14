import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Sparkles, Smartphone, Users, Wifi, ArrowRight } from 'lucide-react';
import AlixLogo from './AlixLogo';

export interface ProjectorQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: string;
  joinUrl: string;
  participantCount?: number;
}

export const ProjectorQRModal: React.FC<ProjectorQRModalProps> = ({
  isOpen,
  onClose,
  pin,
  joinUrl,
  participantCount = 0,
}) => {
  // Close on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fade-in select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-alix-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-alix-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Projector Card - Responsive scroll container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700 sm:border-2 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl text-white flex flex-col items-center my-auto">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-4 sm:pb-6 border-b border-slate-800 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AlixLogo variant="white" size="sm" />
            <span className="text-[11px] sm:text-sm font-bold uppercase tracking-widest text-alix-cyan-400">
              Classroom Instant Join
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border text-xs transition-colors ${
                participantCount > 0
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Users
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  participantCount > 0 ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span className="font-mono font-bold text-white text-xs sm:text-sm">{participantCount}</span>
              <span className="hidden xs:inline">{participantCount === 1 ? 'Learner Joined' : 'Joined'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Center: Split QR & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center w-full my-auto">
          {/* Left: Giant High-Res QR Code with Center Badge */}
          <div className="flex flex-col items-center">
            <div className="relative p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-alix-glow ring-4 sm:ring-8 ring-alix-violet-600/30 flex items-center justify-center">
              <QRCodeSVG
                value={joinUrl}
                size={220}
                level="H"
                fgColor="#1E1B4B"
                bgColor="#FFFFFF"
                className="w-44 h-44 sm:w-60 sm:h-60"
                imageSettings={{
                  src: '/favicon.svg',
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
              {/* Scan pulsing indicator */}
              <div className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-alix-coral-500 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-md animate-pulse">
                Live Scan
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-slate-400 text-center flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Works instantly from any smartphone camera</span>
            </p>
          </div>

          {/* Right: Joining Directions */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-alix-violet-500/20 text-alix-cyan-300 border border-alix-violet-500/30 text-[10px] sm:text-xs font-semibold">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Zero Installation Required</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-heading font-black leading-tight text-white">
                Scan with Phone Camera
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Open your camera app, point it at the QR code, and tap the notification link to automatically connect.
              </p>
            </div>

            {/* Alternative Manual PIN Box */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider">
                Or join manually in browser:
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-200">
                Go to{' '}
                <span className="text-alix-cyan-400 font-mono">
                  {typeof window !== 'undefined' ? window.location.host : 'alix-alp.vercel.app'}/join
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Classroom PIN:</span>
                <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white bg-alix-violet-900/60 px-3 py-1 rounded-lg border border-alix-violet-500/50">
                  {pin.slice(0, 3)} {pin.slice(3)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-500 font-bold text-xs sm:text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Question Presentation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="w-full mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
          <span>ALIX – Active Learning & Interactive Experience</span>
          <span className="text-alix-slate-400">Press Esc or Close to resume</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectorQRModal;
