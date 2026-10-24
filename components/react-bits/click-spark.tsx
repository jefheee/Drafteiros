'use client';

import React, { useRef, useState } from 'react';

export interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export function ClickSpark({
  sparkColor = '#00E599',
  sparkSize = 6,
  sparkRadius = 25,
  sparkCount = 8,
  duration = 400,
  children,
  className = '',
}: ClickSparkProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparks: Spark[] = Array.from({ length: sparkCount }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (i * 360) / sparkCount,
    }));

    setSparks((prev) => [...prev, ...newSparks]);

    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.includes(s)));
    }, duration);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative inline-block overflow-hidden ${className}`}
    >
      {children}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="pointer-events-none absolute rounded-full animate-ping"
          style={{
            left: `${spark.x}px`,
            top: `${spark.y}px`,
            width: `${sparkSize}px`,
            height: `${sparkSize}px`,
            backgroundColor: sparkColor,
            transform: `translate(-50%, -50%) rotate(${spark.angle}deg) translate(${sparkRadius}px)`,
            boxShadow: `0 0 8px ${sparkColor}`,
          }}
        />
      ))}
    </div>
  );
}

export default ClickSpark;
