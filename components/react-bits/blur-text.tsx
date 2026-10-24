'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
}

export function BlurText({
  text,
  delay = 50,
  className = '',
  animateBy = 'words',
}: BlurTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <p ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((item, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            transitionDelay: `${index * delay}ms`,
            filter: inView ? 'blur(0px)' : 'blur(10px)',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(8px)',
            marginRight: animateBy === 'words' ? '0.28em' : '0',
          }}
        >
          {item === ' ' ? '\u00A0' : item}
        </span>
      ))}
    </p>
  );
}

export default BlurText;
