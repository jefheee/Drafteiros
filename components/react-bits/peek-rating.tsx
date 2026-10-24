'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface PeekRatingProps {
  max?: number;
  initialValue?: number;
  onChange?: (val: number) => void;
  className?: string;
  readonly?: boolean;
}

export function PeekRating({
  max = 5,
  initialValue = 5,
  onChange,
  className = '',
  readonly = false,
}: PeekRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [value, setValue] = useState(initialValue);

  const displayValue = hovered !== null ? hovered : value;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: max }).map((_, i) => {
        const starNum = i + 1;
        const active = starNum <= displayValue;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onMouseEnter={() => !readonly && setHovered(starNum)}
            onMouseLeave={() => !readonly && setHovered(null)}
            onClick={() => {
              if (readonly) return;
              setValue(starNum);
              if (onChange) onChange(starNum);
            }}
            className={`transition-all duration-150 p-0.5 ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'
            }`}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                active
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                  : 'text-zinc-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default PeekRating;
