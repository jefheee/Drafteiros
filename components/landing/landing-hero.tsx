'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { GridMotion } from '@/components/react-bits/grid-motion';
import { BlurText } from '@/components/react-bits/blur-text';
import { AnimatedContent } from '@/components/react-bits/animated-content';
import { ClickSpark } from '@/components/react-bits/click-spark';
import { PwaInstallButton } from '@/components/pwa-install-button';

export function LandingHero() {
  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden border-b border-white/[0.08]">
      {/* Background Desktop: GridMotion com opacidade sutil (desativado no celular) */}
      <div className="hidden md:block absolute inset-0 opacity-20 pointer-events-none">
        <GridMotion />
      </div>

      {/* Background Estático Posicionado no Topo */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/35 via-black/80 to-black"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Headline Estática com BlurText e [text-wrap:balance] — zero saltos verticais */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
            <BlurText
              text="Organize sua liga de EA FC 26, monte seu clube e crie sua Carta Pro."
              delay={35}
            />
          </h1>

          <AnimatedContent distance={16} delay={0.1}>
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
              Cadastre seu personagem com atributos reais, participe do Draft ou entre no time com código de convite. Agendamento de jogos, súmula lida por IA e estúdio de banners sem bagunça no WhatsApp.
            </p>
          </AnimatedContent>
        </div>

        {/* 2 CTAs Claros e Proporcionais */}
        <AnimatedContent distance={16} delay={0.18}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <ClickSpark sparkColor="#FFFFFF">
              <Link
                href="/login?mode=signup"
                className="h-12 px-7 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap shadow-lg"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </ClickSpark>

            <PwaInstallButton variant="hero" label="Baixar App PWA" />
          </div>
        </AnimatedContent>

        {/* Pontos objetivos de funcionamento real (sem números inventados) */}
        <AnimatedContent distance={14} delay={0.25}>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#A1A1AA]">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              Perfis para Jogador e Dono de Time
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              Carta EA FC 26 Evolutiva
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              Leitura de Súmula por Foto (IA)
            </span>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}

export default LandingHero;
