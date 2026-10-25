'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '@/components/react-bits/scroll-reveal';

const FAQ_ITEMS = [
  {
    q: 'Como faço para entrar em um time ou cadastrar meu boneco?',
    a: 'Ao criar sua conta, você passa pelo onboarding rápido de 4 etapas: escolhe se é Jogador ou Dono de Time, preenche os dados do seu personagem no EA FC 26 (Nome do Boneco, EA ID, Plataforma, Posição e Perna) e digita o código de convite do seu clube ou entra como Agente Livre.',
  },
  {
    q: 'Por que no celular preciso instalar o aplicativo (PWA)?',
    a: 'O DraftClub funciona como um aplicativo dedicado no celular para garantir tela cheia, rapidez, notificações de partidas e acesso direto pela tela de início do seu iPhone ou Android, sem barras de navegador atrapalhando.',
  },
  {
    q: 'Como funciona a leitura de súmula por foto (IA)?',
    a: 'Ao término da partida no EA Sports FC 26, o capitão envia o print da tela de Desempenho de Jogadores. Nossa integração com o Gemini Vision extrai placar, gols, assistências e notas automaticamente, e o capitão adversário confirma com um deslize.',
  },
  {
    q: 'Posso usar tanto perfil de Dono de Time quanto de Jogador?',
    a: 'Sim. Se você for Capitão/Dono de Time, você cadastra o escudo e nome do seu clube e também possui sua própria Carta FC 26 de jogador, podendo alternar a visão a qualquer momento no seu perfil.',
  },
  {
    q: 'Quais formatos de arte estão disponíveis no Estúdio de Banners?',
    a: 'Você pode gerar e baixar banners pós-jogo e cards da rodada nos formatos Story (9:16), Retrato para Feed (4:5) e Quadrado (1:1), prontos para compartilhar no Instagram e nos grupos da liga.',
  },
];

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="duvidas"
      className="py-16 lg:py-24 max-w-3xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-20 border-t border-white/[0.08]"
    >
      <ScrollReveal className="space-y-2 text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
          Dúvidas frequentes
        </h2>
        <p className="text-sm text-[#A1A1AA]">
          Respostas diretas sobre o funcionamento da plataforma.
        </p>
      </ScrollReveal>

      <div className="space-y-2.5">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#0A0A0A] border border-white/[0.08] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-semibold text-white">
                  {item.q}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-[#A1A1AA] shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180 text-white'
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed border-t border-white/[0.05] pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default LandingFaq;
