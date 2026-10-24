'use client';

import React, { useState } from 'react';

export interface WarmTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function WarmTooltip({
  content,
  children,
  position = 'top',
  className = '',
}: WarmTooltipProps) {
  const [visible, setVisible] = useState(false);

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 pointer-events-none px-3 py-1.5 rounded-xl bg-[#161922] border border-white/15 text-zinc-200 text-xs shadow-xl shadow-black/60 backdrop-blur-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${posClasses}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default WarmTooltip;
