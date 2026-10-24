'use client';

import React from 'react';

export type StatusType = 'online' | 'live' | 'pending' | 'success' | 'warning' | 'error';

export interface StatusMarkProps {
  status: StatusType;
  label: string;
  pulse?: boolean;
  className?: string;
}

export function StatusMark({
  status,
  label,
  pulse = true,
  className = '',
}: StatusMarkProps) {
  const config = {
    online: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    live: { dot: 'bg-red-500', bg: 'bg-red-500/15 border-red-500/30 text-red-400' },
    pending: { dot: 'bg-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
    success: { dot: 'bg-[#00E599]', bg: 'bg-[#00E599]/15 border-[#00E599]/30 text-[#00E599]' },
    warning: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400' },
    error: { dot: 'bg-rose-500', bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400' },
  }[status] || { dot: 'bg-zinc-400', bg: 'bg-white/5 border-white/10 text-zinc-400' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold uppercase tracking-wider ${config.bg} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${pulse ? 'animate-pulse' : ''}`}
      />
      <span>{label}</span>
    </span>
  );
}

export default StatusMark;
