'use client';

import React, { useState } from 'react';

export interface RubberSegmentProps {
  segments: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function RubberSegment({
  segments,
  activeId,
  onChange,
  className = '',
}: RubberSegmentProps) {
  const [bouncing, setBouncing] = useState(false);

  const handleClick = (id: string) => {
    if (id === activeId) return;
    setBouncing(true);
    onChange(id);
    setTimeout(() => setBouncing(false), 300);
  };

  return (
    <div className={`inline-flex items-center p-1 rounded-2xl bg-[#14171f] border border-white/10 ${className}`}>
      {segments.map((s) => {
        const isActive = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => handleClick(s.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? `bg-[#00E599] text-zinc-950 shadow-md ${
                    bouncing ? 'scale-105' : 'scale-100'
                  }`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export default RubberSegment;
