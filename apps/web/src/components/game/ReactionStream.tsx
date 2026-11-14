import React, { useState } from 'react';
import { Smile, X } from 'lucide-react';
import {
  SVG_REACTION_LIST,
  FlameReactionSvg,
  RocketReactionSvg,
  BrainReactionSvg,
  LightningReactionSvg,
  PartyReactionSvg,
  StarburstReactionSvg,
} from './AlixSvgReactions';

interface FloatingReaction {
  id: string;
  reactionId: string;
  leftPercent: number;
}

const REACTION_COMPONENT_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  flame: FlameReactionSvg,
  rocket: RocketReactionSvg,
  brain: BrainReactionSvg,
  lightning: LightningReactionSvg,
  party: PartyReactionSvg,
  starburst: StarburstReactionSvg,
};

export interface ReactionStreamProps {
  onReact?: (reactionId: string) => void;
  showBar?: boolean;
}

export const ReactionStream: React.FC<ReactionStreamProps> = ({
  onReact,
  showBar = true,
}) => {
  const [floatingList, setFloatingList] = useState<FloatingReaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendReaction = (reactionId: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const leftPercent = 30 + Math.random() * 50; // spread around center-right
    const newReaction: FloatingReaction = { id, reactionId, leftPercent };

    setFloatingList((prev) => [...prev, newReaction]);
    onReact?.(reactionId);

    // Auto-remove after 1.8s
    setTimeout(() => {
      setFloatingList((prev) => prev.filter((r) => r.id !== id));
    }, 1800);
  };

  return (
    <>
      {/* Floating SVG Particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingList.map((item) => {
          const SvgIcon = REACTION_COMPONENT_MAP[item.reactionId] || FlameReactionSvg;
          return (
            <div
              key={item.id}
              className="absolute bottom-24 animate-[alix-fade-up_1.8s_ease-out_forwards] select-none filter drop-shadow-md"
              style={{
                left: `${item.leftPercent}%`,
                transform: `translateY(-${Math.random() * 220 + 160}px) scale(${1 + Math.random() * 0.4})`,
                transition: 'all 1.8s cubic-bezier(0.1, 0.8, 0.3, 1)',
                opacity: 0,
              }}
            >
              <SvgIcon size={44} />
            </div>
          );
        })}
      </div>

      {/* Non-intrusive Collapsible Reaction Trigger */}
      {showBar && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
          {/* Reaction Palette (Hidden by default, opens on click) */}
          {isOpen && (
            <div className="mb-2 bg-[#1B0A3C]/95 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1 animate-scale-in">
              {SVG_REACTION_LIST.map((item) => {
                const Icon = item.Component;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSendReaction(item.id)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center hover:scale-125 active:scale-90 transition-all hover:bg-white/15 cursor-pointer p-1"
                    title={item.label}
                  >
                    <Icon size={24} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Compact Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1.5 transition-all cursor-pointer text-xs font-bold"
            title={isOpen ? 'Close reaction palette' : 'React with emoji'}
          >
            {isOpen ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Smile className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">React</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default ReactionStream;
