'use client';

import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-black py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center font-display font-black text-[10px]">
            DC
          </div>
          <span className="font-semibold text-white">DraftClub</span>
          <span>•</span>
          <span>Plataforma para Ligas EA Sports FC 26</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#como-funciona" className="hover:text-white transition-colors">
            Como Funciona
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
