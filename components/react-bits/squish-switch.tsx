'use client';

import React, { useState } from 'react';

export interface SquishSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function SquishSwitch({
  checked,
  onChange,
  label,
  className = '',
}: SquishSwitchProps) {
  const [squishing, setSquishing] = useState(false);

  const handleToggle = () => {
    setSquishing(true);
    onChange(!checked);
    setTimeout(() => setSquishing(false), 250);
  };

  return (
    <label
      onClick={handleToggle}
      className={`inline-flex items-center gap-3 cursor-pointer select-none group ${className}`}
    >
      <div
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 p-0.5 border ${
          checked
            ? 'bg-emerald-500/20 border-emerald-500'
            : 'bg-white/5 border-white/15'
        }`}
      >
        <div
          className={`h-5 rounded-full bg-white transition-all duration-300 transform shadow-md ${
            checked ? 'translate-x-6 bg-[#00E599]' : 'translate-x-0 bg-zinc-400'
          } ${squishing ? 'scale-x-125' : 'scale-x-100'}`}
          style={{ width: '20px' }}
        />
      </div>
      {label && (
        <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
          {label}
        </span>
      )}
    </label>
  );
}

export default SquishSwitch;
