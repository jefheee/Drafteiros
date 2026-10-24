'use client';

import React, { useState } from 'react';

export interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  pixelColor?: string;
}

export function PixelCard({
  children,
  className = '',
  pixelColor = '#00E599',
}: PixelCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-3xl bg-[#14171f] border border-white/10 hover:border-emerald-500/40 transition-colors p-6 overflow-hidden ${className}`}
    >
      {/* Background pixel dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15 transition-opacity duration-300"
        style={{
          opacity: hovered ? 0.35 : 0.08,
          backgroundImage: `radial-gradient(${pixelColor} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default PixelCard;
