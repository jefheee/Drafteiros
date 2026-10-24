'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, PlusSquare, Check, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'compact' | 'pill';
  showAlways?: boolean;
}

export function PwaInstallButton({
  className = '',
  variant = 'primary',
  showAlways = false,
}: PwaInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verificar se já está rodando em PWA standalone
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);

      // Detectar iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isAppleMobile);

      // Detectar dispositivo móvel
      setIsMobile(
        isAppleMobile ||
        /android|mobile|touch/.test(userAgent) ||
        window.innerWidth < 768
      );

      // Capturar evento de instalação nativa do PWA (Android / Chrome)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) {
      alert('O aplicativo DraftClub já está instalado no seu dispositivo!');
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Erro na instalação PWA:', err);
      }
    } else if (isIOS) {
      setShowIosModal(true);
    } else {
      // Fallback para outros dispositivos móveis ou navegadores desktop
      setShowIosModal(true);
    }
  };

  // Se já estiver instalado como standalone, mostra status
  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold ${className}`}>
        <Check className="w-3.5 h-3.5" />
        <span>PWA Instalado</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'primary' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E599] text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 active:scale-95 transition-all ${className}`}
        >
          <Smartphone className="w-4 h-4 text-zinc-950" />
          <span>Instalar App PWA</span>
        </button>
      )}

      {variant === 'outline' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-zinc-200 hover:text-white font-semibold text-xs transition-all active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-[#00E599]" />
          <span>Instalar no Celular</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-all ${className}`}
          title="Instalar como Aplicativo PWA"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>App PWA</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all shadow-sm ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App (PWA)</span>
        </button>
      )}

      {/* Modal / Sheet explicativo para iOS Safari e outros navegadores */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#161920] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Como Instalar o DraftClub PWA</h3>
                  <p className="text-xs text-zinc-400">Tenha a experiência de app nativo sem precisar de App Store</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-300">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 font-bold text-emerald-400">
                  1
                </div>
                <div>
                  No seu navegador (Safari ou Chrome), toque no botão <strong className="text-white">Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 font-bold text-emerald-400">
                  2
                </div>
                <div>
                  Role as opções e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 font-bold text-emerald-400">
                  3
                </div>
                <div>
                  Confirme em <strong className="text-white">"Adicionar"</strong> no topo direito. Pronto! O ícone do DraftClub estará junto com seus apps com abertura instantânea.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-3 rounded-2xl bg-[#00E599] text-zinc-950 font-bold text-sm hover:bg-[#00c985] transition-all"
            >
              Entendi, vou adicionar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
