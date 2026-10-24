'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="w-full bg-[#08090d] border-t border-white/[0.08] pt-16 pb-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Coluna 1: Marca & Status */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-[#00E599] flex items-center justify-center p-2 text-zinc-950 font-black">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight">
                DRAFTCLUB <span className="text-[#00E599]">PRO</span>
              </span>
            </Link>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              A plataforma definitiva de e-sports para ligas e torneios de EA FC 26 Pro Clubs. Súmula automatizada com Visão Computacional por Inteligência Artificial, Estúdio de Banners 4:5 para Instagram e Sala de Draft estilo NBA.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
              <span>Sistemas & API IA 100% Operacionais</span>
            </div>
          </div>

          {/* Coluna 2: Recursos */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs">
              Recursos
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#como-funciona" className="hover:text-emerald-400 transition-colors">
                  Súmula por Foto (IA)
                </a>
              </li>
              <li>
                <a href="#estudio-banners" className="hover:text-emerald-400 transition-colors">
                  Estúdio de Banners 4:5
                </a>
              </li>
              <li>
                <Link href="/draft-board" className="hover:text-emerald-400 transition-colors">
                  Sala de Draft ao Vivo
                </Link>
              </li>
              <li>
                <Link href="/rankings" className="hover:text-emerald-400 transition-colors">
                  Tabela & Classificação
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-emerald-400 transition-colors">
                  Mercado de Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Comunidade */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs">
              Comunidade
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Servidor Discord
                </a>
              </li>
              <li>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Comunidade de Capitães
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Instagram Oficial
                </a>
              </li>
              <li>
                <a
                  href="https://twitch.tv"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Twitch Transmissões
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Institucional */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs">
              Institucional
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Acesso de Capitães
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Termos de Uso</span>
              </li>
              <li>
                <span className="text-zinc-500">Privacidade & Dados</span>
              </li>
              <li>
                <span className="text-zinc-500">Regulamento de E-Sports</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha Inferior com Copyright e Disclaimer */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>
            © {new Date().getFullYear()} DraftClub PRO. Todos os direitos reservados. Feito com paixão pelo futebol virtual.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>PlayStation 5 • Xbox Series X|S • PC</span>
            <span>•</span>
            <span>Progressive Web App (PWA)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
