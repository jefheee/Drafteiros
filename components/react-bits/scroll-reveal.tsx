'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (inView) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':
        return 'translate3d(0, 30px, 0)';
      case 'down':
        return 'translate3d(0, -30px, 0)';
      case 'left':
        return 'translate3d(30px, 0, 0)';
      case 'right':
        return 'translate3d(-30px, 0, 0)';
      default:
        return 'translate3d(0, 30px, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${className}`}
      style={{
        transform: getTransform(),
        opacity: inView ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
