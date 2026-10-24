'use client';

import React, { useRef, useState } from 'react';

export interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function HoloCard({
  children,
  className = '',
  glowColor = 'rgba(0, 229, 153, 0.35)',
}: HoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl overflow-hidden bg-[#14171f] border border-white/10 transition-all duration-300 group ${className}`}
    >
      {/* Holographic light layer */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 mix-blend-screen"
        style={{
          opacity,
          background: `radial-gradient(circle 220px at ${coords.x}% ${coords.y}%, ${glowColor}, transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)`,
        }}
      />
      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
}

export default HoloCard;
