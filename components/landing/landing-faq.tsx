'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Como a inteligência artificial lê a foto da partida?',
      answer:
        'Utilizamos o modelo de visão multimodal Google Gemini 2.5 Pro integrado à nossa engine. Quando o capitão envia a foto ou print da tela de fim de jogo do EA FC (com as notas dos atletas ou visão geral), a IA extrai automaticamente os nomes dos jogadores, gols, assistências, defesas do goleiro, posse de bola e cartões, computando os pontos na tabela em menos de 15 segundos.',
    },
    {
      question: 'Funciona tanto para PC quanto para PlayStation 5 e Xbox Series?',
      answer:
        'Sim, 100%! O DraftClub foi desenhado para todas as plataformas de EA FC 26 Pro Clubs com crossplay ativo (PS5, Xbox Series X/S e PC). A leitura da súmula e o sistema de convites funcionam igualmente em qualquer uma dessas plataformas.',
    },
    {
      question: 'Posso usar para cobrar inscrições e distribuir premiações via PIX?',
      answer:
        'Com certeza. O organizador pode definir a taxa de inscrição por equipe ou atleta e a divisão percentual dos prêmios (ex: 50% 1º lugar, 30% 2º lugar, 10% 3º lugar, 5% Artilheiro e 5% Líder em Assistências). O painel é 100% transparente para todos os participantes acompanharem o montante acumulado.',
    },
    {
      question: 'Como funciona a Sala de Draft estilo NBA?',
      answer:
        'A sala de draft reúne todos os capitães ao vivo com cronômetro de escolha regressivo (ex: 60 segundos por pick). Os atletas cadastrados no banco de talentos são selecionados em rodadas alternadas (draft tradicional ou snake draft), permitindo montar elencos equilibrados e cheios de emoção.',
    },
    {
      question: 'O aplicativo é gratuito para criar torneios?',
      answer:
        'Você pode começar a organizar sua liga e testar todos os recursos de súmula com IA, tabela e draft gratuitamente. Oferecemos opções sob medida para ligas casuais de amigos até grandes federações competitivas com dezenas de divisões.',
    },
    {
      question: 'Como funciona a instalação como aplicativo no celular (PWA)?',
      answer:
        'O DraftClub é um Progressive Web App (PWA) de última geração. Você não precisa baixar centenas de megabytes na App Store ou Play Store. Basta tocar no botão "Instalar App PWA" no topo da página ou adicionar à tela de início no Safari/Chrome. Ele funciona em tela cheia, com carregamento instantâneo e suporte offline!',
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#0a0c10] border-t border-white/[0.08] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>DÚVIDAS FREQUENTES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-tight">
            TUDO O QUE VOCÊ PRECISA SABER SOBRE O{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00E599]">
              DRAFTCLUB.
            </span>
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg">
            Respostas diretas para as perguntas mais comuns de capitães e organizadores.
          </p>
        </div>

        {/* Lista de Acordeões Untitled UI */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#14171f] border border-white/[0.08] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-display font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
                  <div
                    className={`w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.04] pt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default LandingFaq;
