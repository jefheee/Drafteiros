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
        className="absolute top-4 left-6 h-0.5 bg-[#00E599] transition-all duration-500 z-0"
        style={{
          width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 48px)`,
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
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 ${
                isDone
                  ? 'bg-[#00E599] text-zinc-950 shadow-md shadow-emerald-500/20'
                  : isCurrent
                  ? 'bg-[#14171f] border-2 border-[#00E599] text-[#00E599] ring-4 ring-emerald-500/15'
                  : 'bg-[#14171f] border border-white/10 text-zinc-500'
              }`}
            >
              {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
            </div>

            <span
              className={`mt-2 text-xs font-bold transition-colors ${
                isCurrent ? 'text-white' : isDone ? 'text-emerald-400' : 'text-zinc-500'
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
