'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PwaInstallButton } from '@/components/pwa-install-button';

export function LandingCta() {
  return (
    <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center space-y-6">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white [text-wrap:balance]">
            Pronto para criar sua Carta FC 26 e entrar em campo?
          </h2>
          <p className="text-sm text-[#A1A1AA]">
            Crie sua conta em menos de 1 minuto, configure seu personagem e vincule-se ao seu clube.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?mode=signup"
            className="h-12 px-7 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <span>Criar Minha Conta</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <PwaInstallButton variant="hero" label="Instalar Aplicativo PWA" />
        </div>
      </div>
    </section>
  );
}

export default LandingCta;
