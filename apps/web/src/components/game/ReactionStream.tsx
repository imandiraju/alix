import React, { useState } from 'react';
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

      {/* Floating Reaction Pill Bar with SVGs */}
      {showBar && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 backdrop-blur-md border-2 border-alix-slate-200 shadow-alix-lg rounded-full p-2 flex items-center gap-1.5 sm:gap-2">
          {SVG_REACTION_LIST.map((item) => {
            const Icon = item.Component;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSendReaction(item.id)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center hover:scale-125 active:scale-90 transition-all hover:bg-alix-violet-50 cursor-pointer p-1.5 group"
                title={item.label}
              >
                <Icon size={28} className="transition-transform group-hover:rotate-6" />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default ReactionStream;
