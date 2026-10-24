'use client';

import React from 'react';
import Link from 'next/link';
import { SpecularButton } from '@/components/react-bits/specular-button';
import { StarBorder } from '@/components/react-bits/star-border';
import { ClickSpark } from '@/components/react-bits/click-spark';
import { PwaInstallButton } from '@/components/pwa-install-button';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';

export function LandingCta() {
  return (
    <section className="py-20 lg:py-28 relative max-w-6xl mx-auto px-4 sm:px-6">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#00E599] via-emerald-500 to-teal-600 p-8 sm:p-12 lg:p-16 text-zinc-950 overflow-hidden shadow-2xl shadow-emerald-500/25">
        {/* Marca d'água */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 opacity-15 pointer-events-none">
          <Trophy className="w-full h-full text-zinc-950 stroke-[1.5]" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/15 border border-zinc-950/20 text-zinc-950 text-xs font-mono font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONFIGURAÇÃO EM 2 MINUTOS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-zinc-950 leading-[1.08] [text-wrap:balance]">
            A parte difícil é o jogo.{' '}
            <span className="underline decoration-zinc-950/30 underline-offset-8">
              Deixa o resto com a gente!
            </span>
          </h2>

          <p className="text-zinc-900/90 text-sm sm:text-base font-medium leading-relaxed [text-wrap:balance]">
            Junte-se a mais de 1.200 equipes que abandonaram o estresse das planilhas e grupos do WhatsApp. Dê à sua liga de Pro Clubs o padrão visual e operacional de um e-sport de classe mundial.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/login?action=create_league" className="w-full sm:w-auto">
              <SpecularButton variant="secondary" className="w-full bg-zinc-950 text-white hover:bg-zinc-900 border-zinc-900">
                <Trophy className="w-4 h-4 text-[#00E599]" />
                <span>Criar Minha Liga Agora</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </SpecularButton>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-zinc-950/15 hover:bg-zinc-950/25 border border-zinc-950/20 text-zinc-950 font-bold text-sm transition-all active:scale-[0.98]"
            >
              <span>Explorar Painel ao Vivo</span>
            </Link>

            <div className="sm:hidden w-full">
              <PwaInstallButton
                variant="outline"
                className="w-full justify-center py-3 border-zinc-950/30 text-zinc-950 bg-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingCta;
