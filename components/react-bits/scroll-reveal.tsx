'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ScrollRevealProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  highlightWords?: string[];
}

export function ScrollReveal({
  children,
  text,
  className = '',
  delay = 0,
  direction = 'up',
  highlightWords = [],
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const el = containerRef.current;
    if (!el) return;

    // Se temos texto para scroll-linked reveal palavra por palavra
    if (text) {
      const handleScroll = () => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Inicia quando o topo do elemento chega a 85% da tela e completa quando chega a 35%
        const start = windowHeight * 0.85;
        const end = windowHeight * 0.35;

        const current = rect.top;
        if (current > start) {
          setScrollProgress(0);
        } else if (current < end) {
          setScrollProgress(1);
        } else {
          const p = (start - current) / (start - end);
          setScrollProgress(Math.min(1, Math.max(0, p)));
        }
      };

      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // Caso padrão com IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  if (text) {
    const words = text.split(' ');
    const totalWords = words.length;

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <p className="leading-relaxed select-none">
          {words.map((word, idx) => {
            const wordThreshold = idx / totalWords;
            const isRevealed = scrollProgress >= wordThreshold;
            const cleanWord = word.replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g, '');
            const isHighlight = highlightWords.some(
              (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
            );

            return (
              <span
                key={`${word}-${idx}`}
                className={cn(
                  'inline-block mr-[0.3em] transition-all duration-300 ease-out',
                  isRevealed
                    ? isHighlight
                      ? 'text-emerald-400 font-extrabold filter-none scale-100'
                      : 'text-zinc-100 filter-none opacity-100'
                    : 'text-zinc-600 opacity-20 blur-[1px]'
                )}
                style={{
                  transform: isRevealed ? 'translateY(0)' : 'translateY(2px)',
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    );
  }

  const getTransform = () => {
    if (inView) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':
        return 'translate3d(0, 24px, 0)';
      case 'down':
        return 'translate3d(0, -24px, 0)';
      case 'left':
        return 'translate3d(24px, 0, 0)';
      case 'right':
        return 'translate3d(-24px, 0, 0)';
      default:
        return 'translate3d(0, 24px, 0)';
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        className
      )}
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
