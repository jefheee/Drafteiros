'use client';

import React from 'react';
import { ScrollReveal } from '@/components/react-bits/scroll-reveal';
import { ShieldAlert } from 'lucide-react';

export function LandingManifesto() {
  return (
    <section className="py-20 lg:py-28 bg-[#141417] border-b border-white/[0.08] relative overflow-hidden">
      {/* Sutil brilho de fundo */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>O Manifesto Drafteiros</span>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-balance text-center leading-[1.25]">
            <ScrollReveal
              text="A parte difícil do campeonato deveria ser vencer dentro de campo. Nunca organizar tabelas, cobrar inscrições ou discutir resultados no WhatsApp."
              highlightWords={['vencer', 'WhatsApp.']}
            />
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-lg mx-auto text-pretty">
          Automatizamos as súmulas com inteligência artificial e eliminamos o atrito para você focar no que importa: competir.
        </p>
      </div>
    </section>
  );
}

export default LandingManifesto;
