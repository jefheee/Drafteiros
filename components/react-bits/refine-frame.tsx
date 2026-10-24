'use client';

import React from 'react';

export interface RefineFrameProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
}

export function RefineFrame({ children, className = '', badge }: RefineFrameProps) {
  return (
    <div className={`relative rounded-3xl bg-[#14171f]/90 border border-white/10 p-6 ${className}`}>
      {/* Corner crosshairs */}
      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#00E599]" />
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#00E599]" />
      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#00E599]" />
      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#00E599]" />

      {badge && (
        <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-[#0c0e12] border border-emerald-500/40 text-[10px] font-mono font-black uppercase text-emerald-400">
          {badge}
        </div>
      )}

      {children}
    </div>
  );
}

export default RefineFrame;
