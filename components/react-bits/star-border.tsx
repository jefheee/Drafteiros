'use client';

import React from 'react';

export interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function StarBorder({
  as: Component = 'button',
  className = '',
  color = '#00E599',
  speed = '4s',
  children,
  onClick,
  ...rest
}: StarBorderProps) {
  return (
    <Component
      onClick={onClick}
      className={`relative inline-block py-[1px] overflow-hidden rounded-2xl group ${className}`}
      {...rest}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-bottom pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-10 w-full h-full bg-[#12151c] text-white rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
        {children}
      </div>
    </Component>
  );
}

export default StarBorder;
