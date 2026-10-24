'use client';

import React from 'react';

export interface SpecularButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gold';
  className?: string;
}

export function SpecularButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: SpecularButtonProps) {
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-emerald-500 via-[#00E599] to-emerald-400 text-zinc-950 shadow-emerald-500/25',
    secondary:
      'bg-gradient-to-r from-white/10 via-white/15 to-white/10 text-white border border-white/15 shadow-black/40',
    gold:
      'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-zinc-950 shadow-amber-500/25',
  }[variant];

  return (
    <button
      {...props}
      className={`relative group overflow-hidden px-6 py-3 rounded-2xl font-display font-black text-sm tracking-wide shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${variantStyles} ${className}`}
    >
      {/* Specular light sweep */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      {/* Subtle top edge gloss */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/40 pointer-events-none" />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

export default SpecularButton;
