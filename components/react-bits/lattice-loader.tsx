'use client';

import React from 'react';

export interface LatticeLoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

export function LatticeLoader({
  size = 40,
  color = '#00E599',
  className = '',
}: LatticeLoaderProps) {
  return (
    <div
      className={`inline-grid grid-cols-3 gap-1.5 p-1 ${className}`}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="rounded-sm animate-pulse"
          style={{
            backgroundColor: color,
            animationDelay: `${(i % 3) * 150 + Math.floor(i / 3) * 150}ms`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}

export default LatticeLoader;
