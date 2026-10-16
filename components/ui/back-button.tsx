'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  label?: string;
  fallbackHref?: string;
  className?: string;
}

export function BackButton({ label = 'Voltar', fallbackHref, className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[#18181B] dark:text-zinc-200 hover:border-[#7C5CFC] hover:text-[#7C5CFC] transition-all text-xs font-bold shadow-sm',
        className
      )}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
