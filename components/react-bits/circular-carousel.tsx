'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CircularCarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function CircularCarousel({
  items,
  autoPlay = true,
  interval = 3500,
  className = '',
}: CircularCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div className={`relative flex items-center justify-center py-8 ${className}`}>
      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative w-full max-w-lg h-72 sm:h-80 flex items-center justify-center perspective-[1200px]">
        {items.map((item, index) => {
          const offset = (index - currentIndex + items.length) % items.length;
          let transform = '';
          let zIndex = 0;
          let opacity = 0;

          if (offset === 0) {
            transform = 'translate3d(0, 0, 0) scale(1)';
            zIndex = 20;
            opacity = 1;
          } else if (offset === 1) {
            transform = 'translate3d(120px, 0, -100px) scale(0.85) rotateY(-15deg)';
            zIndex = 10;
            opacity = 0.6;
          } else if (offset === items.length - 1) {
            transform = 'translate3d(-120px, 0, -100px) scale(0.85) rotateY(15deg)';
            zIndex = 10;
            opacity = 0.6;
          } else {
            transform = 'translate3d(0, 0, -250px) scale(0.6)';
            zIndex = 0;
            opacity = 0;
          }

          return (
            <div
              key={index}
              className="absolute transition-all duration-500 ease-out will-change-transform"
              style={{
                transform,
                zIndex,
                opacity,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default CircularCarousel;
