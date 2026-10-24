'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function SplitText({ text, className = '', delay = 35 }: SplitTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`inline-block overflow-hidden ${className}`}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block transition-transform duration-500 ease-out"
          style={{
            transitionDelay: `${index * delay}ms`,
            transform: inView ? 'translateY(0%)' : 'translateY(110%)',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default SplitText;
