'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  CheckCircle2,
  Shield,
  ArrowRight,
  Trophy,
  Sparkles,
  HelpCircle,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __drafteirosDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
  const hasBypassParam = window.location.search.includes('pwa=1');
  return isStandaloneMedia || isIosStandalone || hasBypassParam;
}

export function MobilePwaInstallScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [osTab, setOsTab] = useState<'android' | 'ios'>('android');
  const [showInstructions, setShowInstructions] = useState(false);
  const [viewMode, setViewMode] = useState<'install' | 'explore'>('install');
  const [activeSlide, setActiveSlide] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setOsTab('ios');
    } else {
      setOsTab('android');
    }

    if (window.__drafteirosDeferredPrompt) {
      setDeferredPrompt(window.__drafteirosDeferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      window.__drafteirosDeferredPrompt = evt;
      setDeferredPrompt(evt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__drafteirosDeferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          window.__drafteirosDeferredPrompt = null;
          setDeferredPrompt(null);
          return;
        }
      } catch {
        // Fallback para instruções visuais
      }
    }
    setShowInstructions(true);
  };

  // MODO 2: LANDING PAGE MOBILE ESPECÍFICA (3 SLIDES COMPACTOS EM 100DVH)
  if (viewMode === 'explore') {
    return (
      <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#0D0D0F] text-[#F4F4F5] flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden relative">
        {/* Topo Compacto */}
        <header className="relative z-10 flex items-center justify-between shrink-0 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Image
              src="/branding/logo-transparent.png"
              alt="Drafteiros"
              width={26}
              height={26}
              className="rounded-lg object-contain"
              priority
            />
            <span className="font-display font-bold text-sm tracking-tight text-white">
              Drafteiros
            </span>
          </div>

          <button
            type="button"
            onClick={() => setViewMode('install')}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1A1A1E] border border-white/[0.08]"
          >
            <span>Voltar</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Abas / Indicador de Slides Estilo Stories */}
        <div className="relative z-10 pt-2 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#141417] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveSlide(0)}
              className={cn(
                'py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                activeSlide === 0
                  ? 'bg-white text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              1. O que é
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide(1)}
              className={cn(
                'py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                activeSlide === 1
                  ? 'bg-white text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              2. IA & Artes
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide(2)}
              className={cn(
                'py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                activeSlide === 2
                  ? 'bg-white text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              3. Dúvidas
            </button>
          </div>
        </div>

        {/* Conteúdo do Slide Compacto em 100dvh */}
        <main className="relative z-10 flex-1 flex flex-col justify-center py-2 overflow-hidden">
          {activeSlide === 0 && (
            <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-white/[0.08] space-y-3.5 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#141417] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-display font-bold text-white leading-tight">
                    Campeonatos & Draft ao Vivo
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Sua competição sem planilhas ou bagunça no WhatsApp
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sala de Draft ao vivo com relógio e ordem de escolha oficial.</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Agendamento inteligente cruzando horários disponíveis das equipes.</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Mercado de atletas e agentes livres em tempo real.</span>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 1 && (
            <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-white/[0.08] space-y-3.5 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#141417] border border-white/[0.08] flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-display font-bold text-white leading-tight">
                    Súmula por IA & Card Pro
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Foto do resultado vira estatística instantânea
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Envie a foto do final da partida e a IA extrai placar, gols e notas.</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Card de Atleta Pro oficial com atributos, arquétipo e histórico.</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Estúdio de banners em 9:16 e 4:5 prontos para o Instagram.</span>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 2 && (
            <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-white/[0.08] space-y-2.5 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                  Dúvidas Rápidas
                </h2>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="font-semibold text-white block">Preciso pagar para usar?</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Não. O cadastro do atleta, criação de card e participação em ligas são gratuitos.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="font-semibold text-white block">Funciona em qual aparelho?</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    No iPhone (Safari) e Android (Chrome) diretamente adicionado à tela inicial.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="font-semibold text-white block">Quais modalidades suporta?</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Futebol virtual, eSports competitivos e ligas presenciais com súmula digital.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Barra Fixa Inferior: Voltar / Instalar */}
        <footer className="relative z-10 shrink-0 pt-2 border-t border-white/[0.08] space-y-2">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 text-sm font-bold bg-white text-black hover:bg-zinc-200 active:scale-[0.99] rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.25]" />
            <span>Instalar App Agora</span>
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setViewMode('install')}
              className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2"
            >
              Voltar ao tutorial de instalação
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // MODO 1: TELA PRINCIPAL ZERO-SCROLL (100dvh EXATO SEM OVERFLOW)
  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#0D0D0F] text-[#F4F4F5] flex flex-col justify-between p-4 sm:p-5 select-none overflow-hidden relative">
      {/* Gradiente estático sutil */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-700/25 via-[#0D0D0F]/80 to-[#0D0D0F]"
        aria-hidden="true"
      />

      {/* Topo: Logo Oficial Drafteiros + Status */}
      <header className="relative z-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Image
            src="/branding/logo-transparent.png"
            alt="Drafteiros"
            width={32}
            height={32}
            className="rounded-xl object-contain shadow-xs"
            priority
          />
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base tracking-tight text-white">
              Drafteiros
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Oficial
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">PWA Nativo</span>
      </header>

      {/* Centro: Headline Curta + Botão Gigante + Switch Compacto */}
      <main className="relative z-10 my-auto py-2 space-y-3.5 max-w-sm mx-auto w-full">
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white leading-tight text-balance">
            Sua liga e seu Card Pro no celular
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed text-pretty">
            Instale o app oficial para acesso em tela cheia, sem barra de navegador e com alta resposta.
          </p>
        </div>

        {/* Card de Ação Principal Compacto */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-[#1A1A1E] border border-white/[0.08] space-y-3 shadow-2xl">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 text-sm font-bold bg-white text-black hover:bg-zinc-200 active:scale-[0.99] rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.25]" />
            <span>Instalar App no Celular</span>
          </button>

          {/* Switch Compacto iPhone / Android */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#141417] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setOsTab('ios')}
                className={cn(
                  'py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                  osTab === 'ios'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                iPhone (Safari)
              </button>
              <button
                type="button"
                onClick={() => setOsTab('android')}
                className={cn(
                  'py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                  osTab === 'android'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                Android (Chrome)
              </button>
            </div>

            {/* 3 Linhas Diretas de Instrução Compactas */}
            {osTab === 'ios' ? (
              <ol className="space-y-1.5 text-[11px] text-zinc-300">
                <li className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="leading-tight">
                    Toque em <strong className="text-white">Compartilhar</strong> <Share className="w-3 h-3 text-white inline ml-0.5" /> na barra inferior
                  </span>
                </li>
                <li className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="leading-tight">
                    Role e toque em <strong className="text-white">Adicionar à Tela de Início</strong> <PlusSquare className="w-3 h-3 text-white inline ml-0.5" />
                  </span>
                </li>
                <li className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="leading-tight">
                    Toque em <strong className="text-white">Adicionar</strong> e abra o Drafteiros
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-1.5 text-[11px] text-zinc-300">
                <li className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="leading-tight">
                    Toque no botão branco acima ou no menu <MoreVertical className="w-3 h-3 text-white inline ml-0.5" />
                  </span>
                </li>
                <li className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="leading-tight">
                    Selecione <strong className="text-white">Instalar aplicativo</strong> <Smartphone className="w-3 h-3 text-white inline ml-0.5" />
                  </span>
                </li>
                <li className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141417] border border-white/[0.06]">
                  <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="leading-tight">
                    Abra o <strong className="text-white">Drafteiros</strong> direto pela tela inicial
                  </span>
                </li>
              </ol>
            )}
          </div>
        </div>
      </main>

      {/* Rodapé: Botão Secundário Estilizado Conhecer o Projeto */}
      <footer className="relative z-10 shrink-0 pt-2 border-t border-white/[0.08] flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => setViewMode('explore')}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A1E] hover:bg-[#222227] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Conhecer o projeto antes de instalar</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        <span className="text-[10px] text-zinc-500">
          No computador, o acesso pelo navegador é liberado normalmente.
        </span>
      </footer>
    </div>
  );
}

export function PwaRegisterAndGatekeeper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [lockedOnMobileBrowser, setLockedOnMobileBrowser] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Registra o Service Worker (/sw.js)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Captura beforeinstallprompt globalmente
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__drafteirosDeferredPrompt = e as BeforeInstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    const checkViewportAndStandalone = () => {
      const isMobileWidth = window.innerWidth < 768;
      const standalone = isStandalonePwa();
      setLockedOnMobileBrowser(isMobileWidth && !standalone);
    };

    checkViewportAndStandalone();
    window.addEventListener('resize', checkViewportAndStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('resize', checkViewportAndStandalone);
    };
  }, []);

  if (mounted && lockedOnMobileBrowser) {
    return <MobilePwaInstallScreen />;
  }

  return <>{children}</>;
}
