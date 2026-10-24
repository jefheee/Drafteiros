'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PwaInstallButton } from '@/components/pwa-install-button';
import { ClickSpark } from '@/components/react-bits/click-spark';
import { StatusMark } from '@/components/react-bits/status-mark';
import {
  LogIn,
  Trophy,
  Menu,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Para Quem É', href: '#para-quem-e' },
    { label: 'Recursos', href: '#recursos' },
    { label: 'Estúdio 4:5', href: '#estudio-banners' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="sticky top-0 sm:top-3 z-50 w-full px-2 sm:px-4 transition-all">
      <header className="max-w-6xl mx-auto rounded-2xl sm:rounded-full bg-[#0c0e12]/80 backdrop-blur-2xl border border-white/10 px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between shadow-2xl shadow-black/60">
        {/* Logo / Marca */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl sm:rounded-full bg-gradient-to-tr from-emerald-500 to-[#00E599] flex items-center justify-center p-2 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 text-zinc-950 font-black" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              DRAFTCLUB
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-[#00E599]/15 text-[#00E599] text-[9px] font-black tracking-wider uppercase border border-emerald-500/20">
              PRO
            </span>
          </div>
        </Link>

        {/* Links Desktop Centrais */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white rounded-full hover:bg-white/[0.06] transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Ações da Direita */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Mark Online */}
          <div className="hidden xl:block">
            <StatusMark status="online" label="EA FC 26" pulse />
          </div>

          {/* Botão PWA (Visível em Mobile e Tablets) */}
          <div className="flex items-center">
            <PwaInstallButton variant="compact" className="sm:inline-flex" />
          </div>

          {/* Botão de Login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-all active:scale-95 whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5 text-[#00E599]" />
            <span>Entrar</span>
          </Link>

          {/* CTA Principal Desktop */}
          <div className="hidden md:block">
            <ClickSpark sparkColor="#00E599" sparkCount={6}>
              <Link
                href="/login?action=create_league"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-[#00E599] hover:from-emerald-400 hover:to-[#00f7a5] text-zinc-950 font-black text-xs shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Criar Minha Liga</span>
              </Link>
            </ClickSpark>
          </div>

          {/* Menu Mobile Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.05] border border-white/10 lg:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Dropdown Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-6xl mx-auto rounded-3xl border border-white/10 bg-[#0c0e12]/95 backdrop-blur-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <PwaInstallButton
              variant="primary"
              className="w-full justify-center py-2.5 text-xs"
            />

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5 text-[#00E599]" />
              <span>Acessar Painel</span>
            </Link>

            <Link
              href="/login?action=create_league"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#00E599] text-zinc-950 font-black text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Criar Minha Liga Grátis</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingNavbar;
