'use client';

import React, { useEffect, useRef } from 'react';

export interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children?: React.ReactNode;
  className?: string;
}

interface SparkParticle {
  x: number;
  y: number;
  angle: number;
  speed: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export function ClickSpark({
  sparkColor = '#FFFFFF',
  sparkSize = 2.5,
  sparkRadius = 28,
  sparkCount = 8,
  duration = 420,
  children,
  className = '',
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<SparkParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Apenas desktop / telas que não são touch-only para performance
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleClick = (e: MouseEvent) => {
      // Dispara as faíscas exatamente onde o usuário clicou
      const originX = e.clientX;
      const originY = e.clientY;

      const newSparks: SparkParticle[] = Array.from({ length: sparkCount }).map((_, i) => {
        const angle = (i * 2 * Math.PI) / sparkCount + (Math.random() - 0.5) * 0.4;
        return {
          x: originX,
          y: originY,
          angle,
          speed: sparkRadius / (duration / 16.6) * (0.8 + Math.random() * 0.4),
          radius: 0,
          maxRadius: sparkRadius,
          alpha: 0.9,
          color: sparkColor,
        };
      });

      sparksRef.current.push(...newSparks);

      if (!animFrameRef.current) {
        animate();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      sparksRef.current = sparksRef.current.filter((s) => s.alpha > 0.04);

      for (let i = 0; i < sparksRef.current.length; i++) {
        const s = sparksRef.current[i];
        s.radius += s.speed;
        s.alpha *= 0.91;

        const currentX = s.x + Math.cos(s.angle) * s.radius;
        const currentY = s.y + Math.sin(s.angle) * s.radius;

        ctx.save();
        ctx.beginPath();
        ctx.arc(currentX, currentY, sparkSize, 0, 2 * Math.PI);
        ctx.fillStyle = s.color === '#FFFFFF' ? `rgba(255, 255, 255, ${s.alpha})` : s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      if (sparksRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        animFrameRef.current = null;
      }
    };

    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handleClick);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [sparkColor, sparkCount, sparkRadius, sparkSize, duration]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export default ClickSpark;
