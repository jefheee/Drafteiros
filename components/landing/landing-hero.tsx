'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Particles } from '@/components/react-bits/particles';
import { StrokeText } from '@/components/react-bits/stroke-text';
import { AnimatedContent } from '@/components/react-bits/animated-content';
import { ClickSpark } from '@/components/react-bits/click-spark';
import { PwaInstallButton } from '@/components/pwa-install-button';

export function LandingHero() {
  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden border-b border-white/[0.08] bg-[#0D0D0F]">
      {/* Background Desktop: Particles cobrindo a primeira dobra (desativado no celular por performance) */}
      <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0">
        <Particles
          className="w-full h-full"
          quantity={45}
          color="#FFFFFF"
          size={1.2}
          staticity={40}
          ease={40}
        />
      </div>

      {/* Gradiente sutil posicionado no topo */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-700/20 via-[#0D0D0F]/80 to-[#0D0D0F]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-8">
        {/* Headline centralizada com StrokeText com destaque tipográfico */}
        <div className="space-y-4 flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-[1.08] text-balance text-center">
            <StrokeText
              text="Organize sua liga, monte seu elenco e dispute o draft ao vivo."
              highlightWords={['liga,', 'draft']}
              animated
            />
          </h1>

          <AnimatedContent distance={16} delay={0.1}>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed text-pretty text-center max-w-2xl mx-auto">
              Cadastre seu Card de Atleta, participe do Draft ou entre no time com código de convite. Agendamento inteligente, súmula lida por IA e estúdio de artes sem bagunça no WhatsApp.
            </p>
          </AnimatedContent>
        </div>

        {/* 2 CTAs Claros e Proporcionais */}
        <AnimatedContent distance={16} delay={0.18}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <ClickSpark sparkColor="#FFFFFF">
              <Link
                href="/login?mode=signup"
                className="h-12 px-7 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap shadow-lg active:scale-[0.98]"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </ClickSpark>

            <PwaInstallButton variant="hero" label="Baixar App PWA" />
          </div>
        </AnimatedContent>

        {/* Pontos objetivos de funcionamento real */}
        <AnimatedContent distance={14} delay={0.25}>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Perfis para Jogador e Dono de Time
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Card de Atleta Pro Evolutivo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Leitura de Súmula por Foto (IA)
            </span>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}

export default LandingHero;
