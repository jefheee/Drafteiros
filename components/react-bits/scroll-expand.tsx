'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface ScrollExpandProps {
  children: React.ReactNode;
  maxScale?: number;
  className?: string;
}

export function ScrollExpand({
  children,
  maxScale = 1.05,
  className = '',
}: ScrollExpandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.92);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const visiblePercent = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height))
      );
      // smooth interpolation
      const targetScale = 0.92 + (maxScale - 0.92) * visiblePercent;
      setScale(targetScale);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScale]);

  return (
    <div
      ref={ref}
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.1s cubic-bezier(0,0,0.2,1)',
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

export default ScrollExpand;
