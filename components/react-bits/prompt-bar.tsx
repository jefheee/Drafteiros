'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';

export interface PromptBarProps {
  placeholder?: string;
  onSubmit: (val: string) => void;
  className?: string;
}

export function PromptBar({
  placeholder = 'Buscar jogador, time ou estatística...',
  onSubmit,
  className = '',
}: PromptBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full rounded-2xl bg-[#14171f] border border-white/10 hover:border-emerald-500/40 focus-within:border-[#00E599] p-1.5 transition-all shadow-xl shadow-black/40 ${className}`}
    >
      <div className="pl-3 pr-2 text-emerald-400">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 text-white placeholder-zinc-500 text-sm focus:outline-none px-2"
      />

      <div className="flex items-center gap-1.5 pr-1">
        <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">
          <span>Enter</span>
          <CornerDownLeft className="w-2.5 h-2.5" />
        </span>

        <button
          type="submit"
          disabled={!value.trim()}
          className="w-8 h-8 rounded-xl bg-[#00E599] disabled:bg-white/10 disabled:text-zinc-600 text-zinc-950 font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

export default PromptBar;
