'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0D0D0F] py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-2.5">
          <Image
            src="/branding/logo-transparent.png"
            alt="Drafteiros"
            width={24}
            height={24}
            className="rounded-md object-contain"
          />
          <span className="font-semibold text-white">Drafteiros</span>
          <span>•</span>
          <span>Plataforma Oficial de Campeonatos, Draft & Gestão de Equipes</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#como-funciona" className="hover:text-white transition-colors">
            Como Funciona
          </a>
          <a href="#recursos" className="hover:text-white transition-colors">
            Recursos
          </a>
          <a href="#duvidas" className="hover:text-white transition-colors">
            Dúvidas
          </a>
          <Link href="/login" className="hover:text-white transition-colors font-semibold text-white">
            Entrar
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
