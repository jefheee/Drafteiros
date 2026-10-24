'use client';

import React, { useState, useRef } from 'react';

export interface ScrubFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  className?: string;
  unit?: string;
}

export function ScrubField({
  label,
  value,
  min = 1,
  max = 99,
  step = 1,
  onChange,
  className = '',
  unit = '',
}: ScrubFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startValRef = useRef(value);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startValRef.current = value;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      const change = Math.round(deltaX / 4) * step;
      const nextVal = Math.min(max, Math.max(min, startValRef.current + change));
      onChange(nextVal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`inline-flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#14171f] border border-white/10 hover:border-emerald-500/40 select-none cursor-ew-resize transition-colors ${
        isDragging ? 'border-[#00E599] ring-2 ring-emerald-500/20' : ''
      } ${className}`}
    >
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <span className="font-mono font-bold text-sm text-[#00E599] tabular-nums">
        {value}
        {unit}
      </span>
    </div>
  );
}

export default ScrubField;
