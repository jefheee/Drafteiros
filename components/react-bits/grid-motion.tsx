'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export interface GridMotionProps {
  items?: (string | React.ReactNode)[];
  gradientColor?: string;
  className?: string;
}

export function GridMotion({
  items = [],
  gradientColor = '#0c0e12',
  className = '',
}: GridMotionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Garantir pelo menos 28 itens distribuídos em 4 linhas de 7
  const totalSlots = 28;
  const gridItems = Array.from({ length: totalSlots }, (_, i) => {
    if (items.length > 0) {
      return items[i % items.length];
    }
    return `Item ${i + 1}`;
  });

  const rows = [
    gridItems.slice(0, 7),
    gridItems.slice(7, 14),
    gridItems.slice(14, 21),
    gridItems.slice(21, 28),
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Linhas válidas no DOM
    const validRows = rowRefs.current.filter(Boolean) as HTMLDivElement[];
    if (validRows.length === 0) return;

    let mouseX = 0;
    let targetX = 0;
    let isTouch = false;

    // Detectar toque / mobile
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      isTouch = true;
    }

    // Animação contínua sutil (idle drift) especialmente benéfica em celulares
    const idleTweens: gsap.core.Tween[] = [];
    validRows.forEach((row, idx) => {
      const direction = idx % 2 === 0 ? 1 : -1;
      const tween = gsap.to(row, {
        x: direction * (isTouch ? 40 : 25),
        duration: isTouch ? 4.5 + idx * 0.5 : 5 + idx * 0.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      idleTweens.push(tween);
    });

    // Se houver mouse/ponteiro, adiciona interação responsiva
    const handlePointerMove = (e: MouseEvent) => {
      const { innerWidth } = window;
      const normalizedX = (e.clientX / innerWidth - 0.5) * 2; // -1 a 1

      validRows.forEach((row, idx) => {
        const direction = idx % 2 === 0 ? 1 : -1;
        const moveAmount = direction * normalizedX * 120;
        gsap.to(row, {
          x: moveAmount,
          duration: 1.1,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      idleTweens.forEach((t) => t.kill());
      gsap.killTweensOf(validRows);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        perspective: '1200px',
      }}
    >
      {/* Grade inclinada em 3D estilo React Bits */}
      <div
        className="absolute inset-0 flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 w-[140%] -left-[20%] h-[150%] -top-[25%]"
        style={{
          transform: 'rotateX(14deg) rotateY(-8deg) rotateZ(3deg) scale(1.05)',
          transformStyle: 'preserve-3d',
        }}
      >
        {rows.map((rowItems, rowIndex) => (
          <div
            key={rowIndex}
            ref={(el) => {
              rowRefs.current[rowIndex] = el;
            }}
            className="flex items-center gap-3 sm:gap-4 md:gap-5 will-change-transform"
          >
            {rowItems.map((item, colIndex) => {
              const isString = typeof item === 'string';
              const isImageUrl =
                isString &&
                (item.startsWith('http') || item.startsWith('/') || item.includes('.png') || item.includes('.jpg') || item.includes('.webp'));

              return (
                <div
                  key={colIndex}
                  className="shrink-0 w-32 sm:w-44 md:w-56 h-20 sm:h-28 md:h-36 rounded-2xl bg-[#14171f]/85 border border-white/[0.08] backdrop-blur-md p-3 flex items-center justify-center shadow-xl shadow-black/40 relative overflow-hidden group hover:border-[#00E599]/40 transition-colors"
                >
                  {/* Subtle inner highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

                  {isImageUrl ? (
                    <img
                      src={item as string}
                      alt="Grid item"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : isString ? (
                    <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-400/90 text-center px-2">
                      {item}
                    </span>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Máscara Radial Gradient & Fade para legibilidade perfeita do conteúdo */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(12, 14, 18, 0.45) 0%, rgba(12, 14, 18, 0.88) 65%, ${gradientColor} 100%)`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-40 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${gradientColor}, transparent)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-48 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${gradientColor}, transparent)`,
        }}
      />
    </div>
  );
}

export default GridMotion;
