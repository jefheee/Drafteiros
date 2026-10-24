'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  config?: { tension: number; friction: number };
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  className?: string;
}

export function AnimatedContent({
  children,
  distance = 40,
  direction = 'vertical',
  reverse = false,
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  className = '',
}: AnimatedContentProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const offset = reverse ? -distance : distance;
  const transform = inView
    ? 'translate3d(0, 0, 0) scale(1)'
    : direction === 'vertical'
    ? `translate3d(0, ${offset}px, 0) scale(${scale})`
    : `translate3d(${offset}px, 0, 0) scale(${scale})`

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) will-change-transform ${className}`}
      style={{
        transform,
        opacity: inView ? 1 : animateOpacity ? initialOpacity : 1,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default AnimatedContent;
