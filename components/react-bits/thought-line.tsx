'use client';

import React from 'react';

export interface ThoughtLineProps {
  color?: string;
  className?: string;
}

export function ThoughtLine({
  color = '#00E599',
  className = '',
}: ThoughtLineProps) {
  return (
    <div className={`relative w-full h-[1px] bg-white/10 overflow-hidden ${className}`}>
      <div
        className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#00E599] to-transparent animate-marquee"
        style={{
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </div>
  );
}

export default ThoughtLine;
