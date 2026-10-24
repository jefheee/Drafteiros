'use client';

import React from 'react';
import {
  Sparkles,
  Zap,
  Camera,
  Layers,
  Users,
  Trophy,
  ShieldCheck,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react';

export function LandingMarquee() {
  const items = [
    { text: 'SÚMULA AUTOMÁTICA POR IA (GEMINI 2.5 PRO)', icon: Camera },
    { text: 'GERADOR DE BANNERS 4:5 PARA INSTAGRAM', icon: Layers },
    { text: 'SISTEMA DE DRAFT AO VIVO ESTILO NBA', icon: Users },
    { text: 'CRUZAMENTO INTELIGENTE DE HORÁRIOS', icon: Zap },
    { text: 'TESOURARIA TRANSPARENTE COM PIX', icon: CircleDollarSign },
    { text: 'CARTAS FC 26 COM STATS HISTÓRICAS', icon: Trophy },
    { text: 'CONFIRMAÇÃO DÚPLICE DE CAPITÃES', icon: ShieldCheck },
  ];

  // Duplicar para loop contínuo infinito
  const fullItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-[#0e1117] border-y border-white/[0.08] py-4 overflow-hidden relative select-none">
      {/* Sombras laterais para fade out suave */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0c0e12] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0c0e12] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee gap-8 items-center">
        {fullItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-300"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#00E599]">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-zinc-200">{item.text}</span>
              <span className="text-emerald-500/40 text-lg mx-2">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LandingMarquee;
