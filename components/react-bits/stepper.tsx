'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
  onStepClick?: (stepIndex: number) => void;
}

export function Stepper({
  steps,
  currentStep,
  className = '',
  onStepClick,
}: StepperProps) {
  return (
    <div className={`w-full flex items-center justify-between relative ${className}`}>
      {/* Background connector track */}
      <div className="absolute top-4 left-6 right-6 h-0.5 bg-white/10 z-0" />
      {/* Active connector progress */}
      <div
        className="absolute top-4 left-6 h-0.5 bg-white transition-all duration-500 z-0"
        style={{
          width: `calc(${(currentStep / Math.max(1, steps.length - 1)) * 100}% - 48px)`,
        }}
      />

      {steps.map((step, idx) => {
        const isDone = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div
            key={step.id}
            onClick={() => onStepClick?.(idx)}
            className={`relative z-10 flex flex-col items-center group cursor-pointer ${
              !onStepClick && 'cursor-default'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 ${
                isDone
                  ? 'bg-white text-black shadow-md'
                  : isCurrent
                  ? 'bg-[#141414] border-2 border-white text-white ring-4 ring-white/10'
                  : 'bg-[#0A0A0A] border border-white/10 text-zinc-500'
              }`}
            >
              {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
            </div>

            <span
              className={`mt-2 text-xs font-bold transition-colors ${
                isCurrent ? 'text-white' : isDone ? 'text-zinc-300' : 'text-zinc-500'
              }`}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
