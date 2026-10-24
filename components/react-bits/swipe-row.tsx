'use client';

import React, { useState, useRef } from 'react';

export interface SwipeRowProps {
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  className?: string;
}

export function SwipeRow({
  children,
  rightAction,
  leftAction,
  className = '',
}: SwipeRowProps) {
  const [offset, setOffset] = useState(0);
  const startXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startXRef.current;
    if (deltaX < -80) {
      setOffset(-80);
    } else if (deltaX > 80) {
      setOffset(80);
    } else {
      setOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (offset < -40) {
      setOffset(-80);
    } else if (offset > 40) {
      setOffset(80);
    } else {
      setOffset(0);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Background action buttons */}
      {leftAction && (
        <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center bg-emerald-600/30">
          {leftAction}
        </div>
      )}
      {rightAction && (
        <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-rose-600/30">
          {rightAction}
        </div>
      )}

      {/* Foreground swiped content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative z-10 bg-[#14171f] border border-white/10 rounded-2xl will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeRow;
