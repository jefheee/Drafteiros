'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedContent } from '@/components/react-bits/animated-content';

const FAQ_ITEMS = [
  {
    q: 'Como faço para entrar em um time ou cadastrar meu atleta?',
    a: 'Ao criar sua conta no Drafteiros, você passa por um onboarding rápido: escolhe se é Atleta ou Dono de Time, preenche os dados do seu personagem (Nome, Nick / ID no Jogo, Plataforma, Posição ou Função) e digita o código de convite do seu time ou fica livre para o Draft.',
  },
  {
    q: 'Por que no celular preciso instalar o aplicativo (PWA)?',
    a: 'O Drafteiros funciona como um aplicativo instalado no celular para garantir tela cheia, navegação instantânea, notificações de jogos e acesso direto pela tela de início do seu iPhone ou Android, sem barras de navegador.',
  },
  {
    q: 'Como funciona a leitura de súmula por foto com IA?',
    a: 'Ao término de cada confronto, o capitão envia o print da tela de resultados. Nossa inteligência artificial extrai placar, gols, assistências e estatísticas automaticamente, e o capitão adversário confirma com um toque.',
  },
  {
    q: 'Posso atuar tanto como Dono de Time quanto Atleta?',
    a: 'Sim. Se você for Capitão/Gestor, você cadastra o escudo e nome da sua equipe e também possui seu próprio Card de Atleta Pro, podendo alternar a visão a qualquer momento no seu perfil.',
  },
  {
    q: 'Quais modalidades e formatos de arte estão disponíveis?',
    a: 'O Drafteiros suporta futebol virtual, modalidades de esportes eletrônicos e torneios presenciais. O Estúdio gera banners automáticos nos formatos Story (9:16), Retrato para Feed (4:5) e Quadrado (1:1), prontos para compartilhar nas redes sociais.',
  },
];

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="duvidas"
      className="py-16 lg:py-24 max-w-3xl mx-auto px-4 sm:px-6 space-y-10 scroll-mt-20 border-t border-white/[0.08]"
    >
      <AnimatedContent distance={20} className="flex flex-col items-center text-center mx-auto max-w-2xl space-y-3">
        <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white leading-[1.15] text-balance text-center">
          Dúvidas frequentes
        </h2>
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed text-pretty text-center max-w-2xl mx-auto">
          Respostas diretas sobre o funcionamento e recursos do Drafteiros.
        </p>
      </AnimatedContent>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <AnimatedContent key={idx} distance={16} delay={idx * 60}>
              <div
                className="rounded-2xl bg-[#1A1A1E] border border-white/[0.08] hover:border-white/[0.14] overflow-hidden transition-colors"
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
                      'w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180 text-white'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-3.5 text-pretty">
                    {item.a}
                  </div>
                )}
              </div>
            </AnimatedContent>
          );
        })}
      </div>
    </section>
  );
}

export default LandingFaq;
