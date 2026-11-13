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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 animate-fade-in select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-alix-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-alix-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Projector Card */}
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl text-white flex flex-col items-center">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <AlixLogo variant="white" size="sm" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-alix-cyan-400">
              Classroom Instant Join
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="font-mono font-bold text-white text-sm">{participantCount}</span>
              <span>Joined</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center: Split QR & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full my-auto">
          {/* Left: Giant High-Res QR Code with Center Badge */}
          <div className="flex flex-col items-center">
            <div className="relative p-6 sm:p-8 bg-white rounded-3xl shadow-alix-glow ring-8 ring-alix-violet-600/30 flex items-center justify-center">
              <QRCodeSVG
                value={joinUrl}
                size={280}
                level="H"
                fgColor="#1E1B4B"
                bgColor="#FFFFFF"
                imageSettings={{
                  src: '/favicon.svg',
                  x: undefined,
                  y: undefined,
                  height: 60,
                  width: 60,
                  excavate: true,
                }}
              />
              {/* Scan pulsing indicator */}
              <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-alix-coral-500 text-white font-bold text-xs uppercase tracking-wider shadow-md animate-pulse">
                Live Scan
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400 text-center flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Works instantly from any smartphone camera</span>
            </p>
          </div>

          {/* Right: Joining Directions */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-alix-violet-500/20 text-alix-cyan-300 border border-alix-violet-500/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Installation Required</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black leading-tight text-white">
                Scan with Phone Camera
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Open your camera app, point it at the QR code, and tap the notification link to automatically connect.
              </p>
            </div>

            {/* Alternative Manual PIN Box */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Or join manually in browser:
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Go to <span className="text-alix-cyan-400 font-mono">alix.edu/join</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Classroom PIN:</span>
                <span className="font-mono text-2xl font-black tracking-widest text-white bg-alix-violet-900/60 px-3 py-1 rounded-lg border border-alix-violet-500/50">
                  {pin.slice(0, 3)} {pin.slice(3)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-xl bg-alix-violet-600 hover:bg-alix-violet-500 font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Question Presentation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="w-full mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>ALIX – Active Learning & Interactive Experience</span>
          <span className="text-alix-slate-400">Press Esc or Close to resume</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectorQRModal;
