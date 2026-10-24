'use client';

import React, { useState, useEffect } from 'react';

export interface RotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function RotatingText({
  texts,
  interval = 2800,
  className = '',
  prefix = '',
  suffix = '',
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    const timer = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setIsFlipping(false);
      }, 250);
    }, interval);

    return () => clearInterval(timer);
  }, [texts, interval]);

  return (
    <span className="inline-flex items-center overflow-hidden">
      {prefix && <span className="mr-1.5">{prefix}</span>}
      <span
        className={`inline-block transition-all duration-300 transform ${
          isFlipping ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        } ${className}`}
      >
        {texts[index]}
      </span>
      {suffix && <span className="ml-1.5">{suffix}</span>}
    </span>
  );
}

export default RotatingText;
