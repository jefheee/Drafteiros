'use client';

import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  CheckCircle2,
  Shield,
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
    __draftclubDeferredPrompt?: BeforeInstallPromptEvent | null;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setOsTab('ios');
    } else {
      setOsTab('android');
    }

    if (window.__draftclubDeferredPrompt) {
      setDeferredPrompt(window.__draftclubDeferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      window.__draftclubDeferredPrompt = evt;
      setDeferredPrompt(evt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__draftclubDeferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          window.__draftclubDeferredPrompt = null;
          setDeferredPrompt(null);
          return;
        }
      } catch {
        // Fallback para instruções visuais
      }
    }
    setShowInstructions(true);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white flex flex-col justify-between px-5 py-7 relative overflow-hidden select-none">
      {/* Gradiente estático posicionado no topo (leve, sem canvas pesado no mobile) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/45 via-black/80 to-black"
        aria-hidden="true"
      />

      {/* Topo: Logo DraftClub */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm tracking-tight shadow-sm">
            DC
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base tracking-tight text-white">
              DraftClub
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-medium text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              EA FC 26
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">App Oficial PWA</span>
      </header>

      {/* Centro Acima da Dobra: Headline + CTA Gigante + Tutorial iPhone vs Android */}
      <main className="relative z-10 my-auto py-6 space-y-6 max-w-md mx-auto w-full">
        <div className="space-y-3 text-left">
          <h1 className="text-3xl font-display font-bold tracking-tight text-white leading-[1.12] [text-wrap:balance]">
            Sua liga de EA FC 26 e sua Carta Pro no celular.
          </h1>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            Para criar sua conta, cadastrar seu boneco e entrar em um time, instale o aplicativo oficial do DraftClub na tela de início do seu celular.
          </p>
        </div>

        {/* Card de Ação Principal */}
        <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4 shadow-2xl">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-4 px-5 text-base font-bold bg-white text-black hover:bg-zinc-200 active:scale-[0.99] rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5"
          >
            <Download className="w-5 h-5 stroke-[2.25]" />
            <span>Instalar Aplicativo no Celular</span>
          </button>

          {/* Seletor de Tutorial Interativo: iPhone (iOS) vs Android */}
          <div className="pt-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A1A1AA]">
                Como instalar em 10 segundos:
              </span>
              {showInstructions && (
                <span className="text-[11px] font-semibold text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Siga os passos abaixo
                </span>
              )}
            </div>

            {/* Seletor de Plataforma */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#141414] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setOsTab('ios')}
                className={cn(
                  'py-2 rounded-lg text-xs font-semibold transition-all',
                  osTab === 'ios'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                iPhone (Safari)
              </button>
              <button
                type="button"
                onClick={() => setOsTab('android')}
                className={cn(
                  'py-2 rounded-lg text-xs font-semibold transition-all',
                  osTab === 'android'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                Android (Chrome)
              </button>
            </div>

            {osTab === 'ios' ? (
              <ol className="space-y-2.5 text-xs text-zinc-300 pt-1">
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Toque em Compartilhar <Share className="w-3.5 h-3.5 text-white inline" />
                    </span>
                    <p className="text-[#A1A1AA] text-[11px] leading-snug">
                      Na barra inferior do Safari, toque no ícone de quadrado com uma seta para cima.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Adicionar à Tela de Início <PlusSquare className="w-3.5 h-3.5 text-white inline" />
                    </span>
                    <p className="text-[#A1A1AA] text-[11px] leading-snug">
                      Role as opções para baixo e selecione &ldquo;Adicionar à Tela de Início&rdquo;.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">
                      Confirme em &ldquo;Adicionar&rdquo; e abra o app
                    </span>
                    <p className="text-[#A1A1AA] text-[11px] leading-snug">
                      Toque em Adicionar no canto superior direito e abra o ícone DraftClub na sua tela inicial.
                    </p>
                  </div>
                </li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-xs text-zinc-300 pt-1">
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Toque no botão branco acima ou no menu <MoreVertical className="w-3.5 h-3.5 text-white inline" />
                    </span>
                    <p className="text-[#A1A1AA] text-[11px] leading-snug">
                      Se a janela automática não abrir, toque nos 3 pontinhos no canto superior direito do Chrome.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Selecione &ldquo;Instalar aplicativo&rdquo; <Smartphone className="w-3.5 h-3.5 text-white inline" />
                    </span>
                    <p className="text-[#A1A1AA] text-[11px] leading-snug">
                      Toque em &ldquo;Instalar aplicativo&rdquo; ou &ldquo;Adicionar à tela inicial&rdquo;.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">
                      Abra o DraftClub pela tela inicial
                    </span>
                    <p className="text-[#A1A1AA] text-[11px] leading-snug">
                      O aplicativo abrirá em tela cheia para você fazer login e cadastrar seu personagem.
                    </p>
                  </div>
                </li>
              </ol>
            )}
          </div>
        </div>
      </main>

      {/* Rodapé enxuto */}
      <footer className="relative z-10 flex items-center justify-between text-[11px] text-[#A1A1AA] pt-2 border-t border-white/[0.08]">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-white" />
          Acesso exclusivo via App no celular
        </span>
        <span>PC: acesse normalmente pelo navegador</span>
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
      window.__draftclubDeferredPrompt = e as BeforeInstallPromptEvent;
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
