'use client';

import React from 'react';

export interface GlideOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface GlideSelectProps {
  options: GlideOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function GlideSelect({
  options,
  activeId,
  onChange,
  className = '',
}: GlideSelectProps) {
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.id === activeId)
  );

  return (
    <div
      className={`relative flex items-center p-1 bg-[#0A0A0A] border border-white/[0.08] rounded-2xl ${className}`}
    >
      {/* Gliding background pill */}
      <div
        className="absolute top-1 bottom-1 bg-[#141414] border border-white/20 rounded-xl transition-all duration-300 ease-out"
        style={{
          width: `calc(${100 / Math.max(1, options.length)}% - 8px)`,
          left: `calc(${(activeIndex * 100) / Math.max(1, options.length)}% + 4px)`,
        }}
      />

      {options.map((opt) => {
        const isActive = opt.id === activeId;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`relative z-10 flex-1 py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors ${
              isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default GlideSelect;
