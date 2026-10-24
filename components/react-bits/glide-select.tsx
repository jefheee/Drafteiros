'use client';

import React, { useState } from 'react';

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
  const activeIndex = options.findIndex((o) => o.id === activeId);

  return (
    <div
      className={`relative flex items-center p-1 bg-[#14171f] border border-white/10 rounded-2xl ${className}`}
    >
      {/* Gliding background pill */}
      <div
        className="absolute top-1 bottom-1 bg-gradient-to-r from-emerald-500/20 to-[#00E599]/20 border border-[#00E599]/40 rounded-xl transition-all duration-300 ease-out shadow-sm"
        style={{
          width: `calc(${100 / options.length}% - 8px)`,
          left: `calc(${(activeIndex * 100) / options.length}% + 4px)`,
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
              isActive ? 'text-[#00E599]' : 'text-zinc-400 hover:text-white'
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
