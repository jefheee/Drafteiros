'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-context';

export function LandingNavbar() {
  const { session } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.08] bg-[#0D0D0F]/85 backdrop-blur-xl">
      <nav
        aria-label="Navegação principal"
        className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4"
      >
        {/* Esquerda: Logo Oficial Drafteiros */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Image
            src="/branding/logo-transparent.png"
            alt="Drafteiros Logo"
            width={28}
            height={28}
            className="rounded-lg object-contain transition-transform group-hover:scale-105"
            priority
          />
          <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap">
            Drafteiros
          </span>
        </Link>

        {/* Centro: 3 Âncoras Concisas */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
          <a
            href="#como-funciona"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Como Funciona
          </a>
          <a
            href="#recursos"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Recursos
          </a>
          <a
            href="#duvidas"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Dúvidas
          </a>
        </div>

        {/* Direita: 2 Botões Proporcionais */}
        <div className="flex items-center gap-2.5 shrink-0">
          {session ? (
            <Link
              href={session.onboardingCompleted ? '/dashboard' : '/onboarding'}
              className="h-10 px-5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap transition-colors"
            >
              Abrir Meu Painel
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="h-10 px-4 rounded-full bg-[#1A1A1E] hover:bg-[#222227] border border-white/[0.08] text-white text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/login?mode=signup"
                className="h-10 px-5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap transition-colors"
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default LandingNavbar;
