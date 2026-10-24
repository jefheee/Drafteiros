'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export interface PulseHeartProps {
  initialLiked?: boolean;
  count?: number;
  onToggle?: (liked: boolean) => void;
  className?: string;
}

export function PulseHeart({
  initialLiked = false,
  count,
  onToggle,
  className = '',
}: PulseHeartProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [pulsing, setPulsing] = useState(false);

  const handleClick = () => {
    const next = !liked;
    setLiked(next);
    setPulsing(true);
    setTimeout(() => setPulsing(false), 400);
    if (onToggle) onToggle(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 p-2 rounded-xl transition-all ${
        liked
          ? 'text-red-500 bg-red-500/10'
          : 'text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10'
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform duration-300 ${
          liked ? 'fill-current' : ''
        } ${pulsing ? 'scale-150 animate-bounce' : 'scale-100'}`}
      />
      {typeof count === 'number' && (
        <span className="text-xs font-mono font-bold tabular-nums">
          {count + (liked ? 1 : 0)}
        </span>
      )}
    </button>
  );
}

export default PulseHeart;
