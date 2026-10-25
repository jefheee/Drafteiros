'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Smartphone, X, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BeforeInstallPromptEvent } from '@/components/pwa-register';

interface PwaInstallButtonProps {
  className?: string;
  variant?: 'hero' | 'navbar' | 'outline';
  label?: string;
}

export function PwaInstallButton({
  className,
  variant = 'hero',
  label,
}: PwaInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [osTab, setOsTab] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
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

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvt = deferredPrompt || window.__drafteirosDeferredPrompt;
    if (promptEvt) {
      try {
        await promptEvt.prompt();
        const { outcome } = await promptEvt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          return;
        }
      } catch {
        // Fallback para modal
      }
    }
    setShowModal(true);
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap active:scale-[0.98]',
          variant === 'hero' &&
            'h-12 px-6 rounded-full bg-[#1A1A1E] hover:bg-[#222227] border border-white/[0.12] text-white font-semibold text-sm shadow-md',
          variant === 'navbar' &&
            'h-10 px-4 rounded-full bg-[#1A1A1E] hover:bg-[#222227] border border-white/[0.12] text-white font-semibold text-xs',
          variant === 'outline' &&
            'h-11 px-5 rounded-2xl bg-[#1A1A1E] hover:bg-[#222227] border border-white/[0.12] text-white font-semibold text-xs',
          className
        )}
      >
        <Download className="w-4 h-4 shrink-0 text-emerald-400" />
        <span>{label || 'Baixar App PWA'}</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#141417] border border-white/[0.1] p-6 space-y-5 shadow-2xl text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/branding/logo-transparent.png"
                  alt="Drafteiros"
                  width={40}
                  height={40}
                  className="rounded-xl object-contain shrink-0"
                />
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    Instalar Drafteiros PWA
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Acesse como aplicativo oficial no celular ou computador
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#1A1A1E] hover:bg-[#222227] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0D0D0F] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setOsTab('ios')}
                className={cn(
                  'py-2 rounded-lg text-xs font-semibold transition-all',
                  osTab === 'ios' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                )}
              >
                iPhone (Safari)
              </button>
              <button
                type="button"
                onClick={() => setOsTab('android')}
                className={cn(
                  'py-2 rounded-lg text-xs font-semibold transition-all',
                  osTab === 'android' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                )}
              >
                Android / Chrome
              </button>
            </div>

            {osTab === 'ios' ? (
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Abra no Safari e toque em Compartilhar <Share className="w-3.5 h-3.5 inline" />
                    </span>
                    <p className="text-zinc-400 mt-0.5">
                      Na barra inferior do Safari no seu iPhone.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Adicionar à Tela de Início <PlusSquare className="w-3.5 h-3.5 inline" />
                    </span>
                    <p className="text-zinc-400 mt-0.5">
                      Role as opções e toque em &ldquo;Adicionar à Tela de Início&rdquo;.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-white">Toque em Adicionar</span>
                    <p className="text-zinc-400 mt-0.5">
                      Abra o Drafteiros direto pela tela inicial do seu iPhone.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Toque no menu do Chrome <MoreVertical className="w-3.5 h-3.5 inline" />
                    </span>
                    <p className="text-zinc-400 mt-0.5">
                      Nos três pontinhos no canto superior direito.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      Instalar aplicativo <Smartphone className="w-3.5 h-3.5 inline" />
                    </span>
                    <p className="text-zinc-400 mt-0.5">
                      Ou &ldquo;Adicionar à tela inicial&rdquo;.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-white">Abra pela tela inicial</span>
                    <p className="text-zinc-400 mt-0.5">
                      O Drafteiros funcionará em tela cheia com alta performance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default PwaInstallButton;
