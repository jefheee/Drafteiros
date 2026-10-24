'use client';

import React from 'react';

export interface ChromaGridProps {
  className?: string;
  children?: React.ReactNode;
}

export function ChromaGrid({ className = '', children }: ChromaGridProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background chromatic glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default ChromaGrid;
