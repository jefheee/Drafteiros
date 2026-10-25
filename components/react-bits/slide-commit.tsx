'use client';

import React, { useState, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';

export interface SlideCommitProps {
  onCommit: () => void;
  label?: string;
  completedLabel?: string;
  className?: string;
}

export function SlideCommit({
  onCommit,
  label = 'Deslize para Confirmar Súmula',
  completedLabel = 'Confirmado com Sucesso!',
  className = '',
}: SlideCommitProps) {
  const [dragProgress, setDragProgress] = useState(0);
  const [isCommitted, setIsCommitted] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isCommitted || !trackRef.current) return;
    const track = trackRef.current;
    const trackWidth = track.clientWidth - 48;
    const startX = e.clientX;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const progress = Math.max(0, Math.min(1, deltaX / trackWidth));
      setDragProgress(progress);

      if (progress >= 0.95) {
        setIsCommitted(true);
        setDragProgress(1);
        onCommit();
        cleanup();
      }
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    const handlePointerUp = () => {
      if (dragProgress < 0.95) {
        setDragProgress(0);
      }
      cleanup();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      ref={trackRef}
      className={`relative h-14 rounded-2xl bg-[#141414] border border-white/10 p-1 flex items-center select-none overflow-hidden ${className}`}
    >
      {/* Background progress fill */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-white/10 transition-all pointer-events-none"
        style={{ width: `${dragProgress * 100}%` }}
      />

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs sm:text-sm font-bold text-zinc-300">
        {isCommitted ? (
          <span className="text-[#10B981] flex items-center gap-1.5 font-black">
            <Check className="w-4 h-4" /> {completedLabel}
          </span>
        ) : (
          label
        )}
      </div>

      {/* Thumb handle */}
      <div
        onPointerDown={handlePointerDown}
        className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform touch-none shadow-lg ${
          isCommitted
            ? 'bg-[#10B981] text-black'
            : 'bg-white text-black hover:bg-zinc-200'
        }`}
        style={{
          transform: `translateX(${dragProgress * ((trackRef.current?.clientWidth || 250) - 56)}px)`,
        }}
      >
        {isCommitted ? (
          <Check className="w-5 h-5 font-bold" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </div>
    </div>
  );
}

export default SlideCommit;
