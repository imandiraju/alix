import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, Maximize2, Sparkles, Smartphone } from 'lucide-react';

export interface AlixQRCodeProps {
  value: string;
  size?: number;
  showCopyButton?: boolean;
  onExpand?: () => void;
  className?: string;
  label?: string;
}

export const AlixQRCode: React.FC<AlixQRCodeProps> = ({
  value,
  size = 180,
  showCopyButton = true,
  onExpand,
  className = '',
  label = 'Scan to Join',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-alix-slate-200 shadow-md group transition-all hover:border-alix-violet-400 ${className}`}
    >
      {/* QR Code Container */}
      <div className="relative p-2 bg-white rounded-xl shadow-inner flex items-center justify-center">
        <QRCodeSVG
          value={value}
          size={size}
          level="H" // High error correction so center badge works smoothly
          fgColor="#1E1B4B" // Deep Indigo
          bgColor="#FFFFFF"
          imageSettings={{
            src: '/favicon.svg',
            x: undefined,
            y: undefined,
            height: Math.floor(size * 0.22),
            width: Math.floor(size * 0.22),
            excavate: true,
          }}
        />

        {/* Floating Expand Button for Projector */}
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="absolute inset-0 bg-alix-indigo/80 backdrop-blur-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5 cursor-pointer"
            title="Expand QR Code for Projector"
          >
            <Maximize2 className="w-7 h-7 text-alix-cyan-300 animate-bounce" />
            <span className="text-xs font-bold tracking-wide">Projector View</span>
          </button>
        )}
      </div>

      {/* Label and Quick Action */}
      <div className="w-full mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-alix-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-alix-indigo">
          <Smartphone className="w-3.5 h-3.5 text-alix-cyan-600" />
          <span>{label}</span>
        </div>

        {showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-alix-slate-100 hover:bg-alix-violet-50 text-alix-slate-700 hover:text-alix-violet-700 transition-colors"
            title="Copy join link"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AlixQRCode;
