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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fade-in select-none"
    >
      {/* Main Projector Card - Crisp Kahoot-inspired light theme */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white border border-[#E5E5E5] rounded-3xl p-5 sm:p-8 shadow-2xl text-[#252525] flex flex-col items-center my-auto">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-4 sm:pb-5 border-b border-[#E5E5E5] mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <AlixLogo variant="primary" size="sm" showEduBadge={true} />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#46178F]">
              Classroom Instant Join
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors ${
                participantCount > 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-[#F3F3F3] border-[#E5E5E5] text-[#626262]'
              }`}
            >
              <Users
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  participantCount > 0 ? 'text-emerald-600 animate-pulse' : 'text-[#626262]'
                }`}
              />
              <span className="font-mono font-black text-xs sm:text-sm">{participantCount}</span>
              <span className="hidden xs:inline">{participantCount === 1 ? 'Learner Joined' : 'Joined'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F3F3F3] hover:bg-[#E5E5E5] text-[#626262] hover:text-[#252525] transition-colors cursor-pointer"
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
            <div className="relative p-5 sm:p-6 bg-white rounded-3xl shadow-md border-2 border-[#E5E5E5] ring-4 ring-purple-100 flex items-center justify-center">
              <QRCodeSVG
                value={joinUrl}
                size={220}
                level="H"
                fgColor="#46178F"
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
              <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-[#E21B5A] text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md animate-pulse">
                Live Scan
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-[#626262] text-center flex items-center gap-1.5 font-medium">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Works instantly from any smartphone camera</span>
            </p>
          </div>

          {/* Right: Joining Directions */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#46178F] border border-purple-200 text-[10px] sm:text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Zero Installation Required</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-heading font-black leading-tight text-[#252525]">
                Scan with Phone Camera
              </h2>
              <p className="text-xs sm:text-sm text-[#626262] leading-relaxed">
                Open your camera app, point it at the QR code, and tap the notification link to automatically connect.
              </p>
            </div>

            {/* Alternative Manual PIN Box */}
            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E5] space-y-2">
              <div className="text-[10px] sm:text-xs uppercase font-black text-[#626262] tracking-wider">
                Or join manually in browser:
              </div>
              <div className="text-xs sm:text-sm font-semibold text-[#252525]">
                Go to{' '}
                <span className="text-[#46178F] font-mono font-bold">
                  {typeof window !== 'undefined' ? window.location.host : 'alix-alp.vercel.app'}/join
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#626262] font-medium">Classroom PIN:</span>
                <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-[#1368CE] bg-white px-3 py-1 rounded-xl border border-[#E5E5E5] shadow-xs">
                  {pin.slice(0, 3)} {pin.slice(3)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#46178F] hover:bg-[#350F6E] border-b-4 border-[#240A4B] active:border-b-0 active:translate-y-1 font-heading font-black text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Question Presentation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="w-full mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-[10px] sm:text-xs text-[#626262]">
          <span>ALIX – Active Learning & Interactive Experience</span>
          <span className="text-[#626262]">Press Esc or Close to resume</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectorQRModal;
