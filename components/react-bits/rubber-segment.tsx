'use client';

import React, { useState } from 'react';

export interface RubberSegmentItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface RubberSegmentProps {
  segments?: RubberSegmentItem[];
  options?: RubberSegmentItem[];
  activeId?: string;
  value?: string;
  onChange: (id: string) => void;
  className?: string;
}

export function RubberSegment({
  segments,
  options,
  activeId,
  value,
  onChange,
  className = '',
}: RubberSegmentProps) {
  const [bouncing, setBouncing] = useState(false);
  const list = segments || options || [];
  const currentId = activeId ?? value ?? '';

  const handleClick = (id: string) => {
    if (id === currentId) return;
    setBouncing(true);
    onChange(id);
    setTimeout(() => setBouncing(false), 300);
  };

  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-[#0A0A0A] border border-white/[0.08] ${className}`}
    >
      {list.map((s) => {
        const isActive = s.id === currentId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => handleClick(s.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive
                ? `bg-white text-black shadow-sm ${
                    bouncing ? 'scale-105' : 'scale-100'
                  }`
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>{s.label}</span>
            {s.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-400'
                }`}
              >
                {s.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default RubberSegment;
