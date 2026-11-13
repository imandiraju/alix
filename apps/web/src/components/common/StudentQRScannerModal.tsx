import React, { useState, useEffect } from 'react';
import { X, Camera, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

export interface StudentQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (pin: string) => void;
}

export const StudentQRScannerModal: React.FC<StudentQRScannerModalProps> = ({
  isOpen,
  onClose,
  onDetected,
}) => {
  const [isSimulatingScan, setIsSimulatingScan] = useState(true);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setScannedSuccess(false);
      setIsSimulatingScan(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerDetection = (pin: string = '842915') => {
    setScannedSuccess(true);
    setTimeout(() => {
      onDetected(pin);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-white text-center shadow-2xl flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-alix-violet-500/20 text-alix-cyan-300 text-xs font-semibold border border-alix-violet-500/30 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>AI Optical Scanner</span>
          </div>
          <h3 className="text-xl font-heading font-black">Scan Classroom QR</h3>
          <p className="text-xs text-slate-400 mt-1">
            Point camera at the projector screen to read the session code.
          </p>
        </div>

        {/* Viewfinder Reticle */}
        <div className="relative w-64 h-64 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex items-center justify-center my-4 shadow-inner">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

          {/* Holographic corner markers */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-alix-cyan-400 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-alix-cyan-400 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-alix-cyan-400 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-alix-cyan-400 rounded-br-lg" />

          {/* Animated Laser Scanning Line */}
          {!scannedSuccess ? (
            <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-alix-coral-400 to-transparent shadow-[0_0_12px_#f97316] animate-[alix-pulse_1.5s_ease-in-out_infinite]" />
          ) : (
            <div className="flex flex-col items-center gap-2 animate-scale-in">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
              <span className="text-sm font-bold text-emerald-300">PIN 842915 Recognized!</span>
            </div>
          )}

          {/* Camera preview badge */}
          <div className="absolute bottom-3 px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-400 font-mono">
            Optical Sensor Active
          </div>
        </div>

        {/* Quick Simulation Trigger for testing */}
        <div className="w-full space-y-2 mt-2">
          <button
            type="button"
            onClick={() => triggerDetection('842915')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-alix-violet-600 to-alix-cyan-600 hover:from-alix-violet-500 hover:to-alix-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Scan Projector (PIN: 842915)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentQRScannerModal;
