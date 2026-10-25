'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface StrokeTextProps {
  text: string;
  className?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: string;
  highlightWords?: string[];
  highlightColor?: string;
  animated?: boolean;
}

export function StrokeText({
  text,
  className = '',
  strokeColor = 'rgba(255, 255, 255, 0.4)',
  fillColor = '#FFFFFF',
  strokeWidth = '1px',
  highlightWords = [],
  highlightColor = '#00E599',
  animated = true,
}: StrokeTextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const words = text.split(' ');

  return (
    <span
      className={cn(
        'inline-block transition-all duration-700 ease-out font-display',
        className
      )}
    >
      {words.map((word, wordIdx) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g, '');
        const isHighlight = highlightWords.some(
          (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
        );

        return (
          <span
            key={`${word}-${wordIdx}`}
            className="inline-block mr-[0.28em] last:mr-0 transition-all duration-500 will-change-transform"
            style={{
              transitionDelay: animated ? `${wordIdx * 45}ms` : '0ms',
              opacity: mounted ? 1 : 0.4,
              transform: mounted ? 'translateY(0)' : 'translateY(6px)',
            }}
          >
            {isHighlight ? (
              <span
                className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 font-extrabold"
                style={{
                  WebkitTextStroke: `1px rgba(16, 185, 129, 0.4)`,
                  filter: 'drop-shadow(0 0 24px rgba(16, 185, 129, 0.25))',
                }}
              >
                {word}
              </span>
            ) : (
              <span
                className="relative inline-block text-white"
                style={{
                  textShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
                }}
              >
                {word}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export default StrokeText;
