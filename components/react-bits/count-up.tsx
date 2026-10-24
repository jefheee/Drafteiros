'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  separator?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  to,
  from = 0,
  duration = 2,
  separator = '.',
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const [value, setValue] = useState(from);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * easeOut;
      setValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setValue(to);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, to, from, duration]);

  const formattedNumber = value
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return (
    <span ref={elementRef} className={`tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}

export default CountUp;
