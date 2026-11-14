import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedPin, setDetectedPin] = useState<string | null>(null);

  // Stop active video track stream
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setDetectedPin(null);
      setCameraError(null);
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is not supported by your browser.');
        }

        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        activeStream = media;
        setStream(media);

        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.play().catch(() => {});
        }

        // Native BarcodeDetector API scanner loop if supported
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code'],
          });

          const scanInterval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue || '';
                  // Extract 6-digit PIN from raw text or query param (pin=123456)
                  let parsedPin = '';
                  const match = rawValue.match(/pin=([A-Za-z0-9]{6})/i);
                  if (match) {
                    parsedPin = match[1];
                  } else if (/^[A-Za-z0-9]{6}$/.test(rawValue.trim())) {
                    parsedPin = rawValue.trim();
                  }

                  if (parsedPin) {
                    clearInterval(scanInterval);
                    setDetectedPin(parsedPin);
                    setTimeout(() => {
                      onDetected(parsedPin);
                      onClose();
                    }, 500);
                  }
                }
              } catch {
                // ignore frame detect errors
              }
            }
          }, 350);

          return () => clearInterval(scanInterval);
        }
      } catch (err: any) {
        console.warn('Camera stream error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow camera access in browser settings, or enter the 6-digit PIN manually.'
            : 'Could not activate camera. Please scan the projector with your default phone camera or enter the PIN.'
        );
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopStream();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-none"
    >
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-white text-center shadow-2xl flex flex-col items-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-alix-violet-500/20 text-alix-cyan-300 text-xs font-semibold border border-alix-violet-500/30 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Optical Scanner</span>
          </div>
          <h3 className="text-xl font-heading font-black">Scan Classroom QR</h3>
          <p className="text-xs text-slate-400 mt-1">
            Align camera viewfinder with the projector QR code.
          </p>
        </div>

        {/* Viewfinder Reticle */}
        <div className="relative w-64 h-64 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex items-center justify-center my-3 shadow-inner">
          {/* Live Camera Stream */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

          {/* Corner Viewfinder Markers */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-alix-cyan-400 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-alix-cyan-400 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-alix-cyan-400 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-alix-cyan-400 rounded-br-lg pointer-events-none" />

          {/* Laser Scanning Line */}
          {!detectedPin && !cameraError && (
            <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-alix-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[alix-pulse_1.5s_ease-in-out_infinite]" />
          )}

          {/* Success Overlay */}
          {detectedPin && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 animate-scale-in">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
              <span className="text-sm font-bold text-emerald-300">
                PIN {detectedPin} Verified!
              </span>
            </div>
          )}

          {/* Error Message if Camera Blocked */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-8 h-8 text-amber-400 mb-2 shrink-0" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {cameraError}
              </p>
            </div>
          )}

          {/* Live Badge */}
          {!cameraError && !detectedPin && (
            <div className="absolute bottom-2 px-2.5 py-0.5 rounded-full bg-black/70 text-[10px] text-alix-cyan-300 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Camera Active</span>
            </div>
          )}
        </div>

        {/* Tip text */}
        <p className="text-[11px] text-slate-400 mt-2">
          Tip: You can also use your smartphone's native camera app to scan the classroom screen.
        </p>
      </div>
    </div>
  );
};

export default StudentQRScannerModal;
