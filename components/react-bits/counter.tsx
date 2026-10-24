'use client';

import React from 'react';
import { Plus, Minus } from 'lucide-react';

export interface CounterProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
  label?: string;
}

export function Counter({
  value,
  min = 0,
  max = 99,
  step = 1,
  onChange,
  className = '',
  label,
}: CounterProps) {
  const handleDec = () => {
    onChange(Math.max(min, value - step));
  };

  const handleInc = () => {
    onChange(Math.min(max, value + step));
  };

  return (
    <div className={`inline-flex items-center gap-2 p-1 rounded-2xl bg-[#14171f] border border-white/10 ${className}`}>
      {label && <span className="text-xs font-semibold text-zinc-400 pl-2">{label}</span>}
      <button
        type="button"
        onClick={handleDec}
        disabled={value <= min}
        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-zinc-300 transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="font-mono font-black text-sm text-white w-8 text-center tabular-nums">
        {value}
      </span>

      <button
        type="button"
        onClick={handleInc}
        disabled={value >= max}
        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-zinc-300 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default Counter;
