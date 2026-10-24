'use client';

import React, { useState } from 'react';

export interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  trigger?: 'hover' | 'click';
}

export function FlipCard({
  front,
  back,
  className = '',
  trigger = 'hover',
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`relative [perspective:1000px] cursor-pointer ${className}`}
      onClick={() => trigger === 'click' && setIsFlipped(!isFlipped)}
      onMouseEnter={() => trigger === 'hover' && setIsFlipped(true)}
      onMouseLeave={() => trigger === 'hover' && setIsFlipped(false)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <div className="w-full h-full [backface-visibility:hidden]">
          {front}
        </div>
        <div className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {back}
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
