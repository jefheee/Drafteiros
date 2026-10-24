'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface SpringCheckProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  className?: string;
}

export function SpringCheck({
  checked,
  onChange,
  label,
  className = '',
}: SpringCheckProps) {
  return (
    <label
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <div
        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-300 ${
          checked
            ? 'bg-[#00E599] border-[#00E599] text-zinc-950 scale-105'
            : 'bg-white/5 border-white/20 group-hover:border-white/40 scale-100'
        }`}
      >
        <Check
          className={`w-3.5 h-3.5 transition-transform duration-200 stroke-[3] ${
            checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        />
      </div>
      {label && <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">{label}</span>}
    </label>
  );
}

export default SpringCheck;
