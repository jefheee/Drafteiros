'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PwaInstallButton } from '@/components/pwa-install-button';
import { AnimatedContent } from '@/components/react-bits/animated-content';

export function LandingCta() {
  return (
    <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6">
      <AnimatedContent distance={24}>
        <div className="p-8 sm:p-12 rounded-3xl bg-[#1A1A1E] border border-white/[0.08] text-center space-y-6 shadow-2xl">
          <div className="space-y-3 max-w-2xl mx-auto flex flex-col items-center text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white leading-[1.15] text-balance text-center">
              Pronto para criar seu Card de Atleta e disputar o campeonato?
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed text-pretty text-center max-w-2xl mx-auto">
              Crie sua conta em menos de 1 minuto, configure suas preferências de jogo e vincule-se à sua equipe.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login?mode=signup"
              className="h-12 px-8 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap active:scale-[0.98] shadow-lg"
            >
              <span>Criar Minha Conta</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <PwaInstallButton variant="hero" label="Instalar Aplicativo PWA" />
          </div>
        </div>
      </AnimatedContent>
    </section>
  );
}

export default LandingCta;
