'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatedContent } from '@/components/react-bits/animated-content';
import {
  UserCheck,
  Shield,
  Camera,
  Calendar,
  Sparkles,
  Search,
  ArrowUpRight,
} from 'lucide-react';

export function LandingFeatures() {
  const steps = [
    {
      stepNumber: '01',
      title: 'Perfil & Card de Atleta Pro',
      description:
        'Crie sua conta e escolha seu perfil: Atleta ou Gestor de Equipe. Configure seu personagem, Nick / ID no Jogo, plataforma, atributos de destaque e gere sua Carta Pro oficial.',
      icon: UserCheck,
      link: '/login?mode=signup',
      linkLabel: 'Criar meu perfil',
    },
    {
      stepNumber: '02',
      title: 'Draft ao Vivo & Agenda Integrada',
      description:
        'Entre diretamente em um time com código de convite ou fique disponível no mercado como Agente Livre para o Draft ao vivo. Calendário e confirmação de partidas sem bagunça.',
      icon: Calendar,
      link: '/login',
      linkLabel: 'Acessar times e agenda',
    },
    {
      stepNumber: '03',
      title: 'Súmula por IA & Estúdio de Artes',
      description:
        'Ao fim do jogo, envie a foto da tela de resultados. A inteligência artificial extrai placar, gols, assistências e estatísticas com validação rápida e gera banners prontos para redes.',
      icon: Camera,
      link: '/login',
      linkLabel: 'Conhecer o estúdio',
    },
  ];

  const capabilities = [
    {
      icon: Shield,
      title: 'Gestão de Elenco & Inscrições',
      description:
        'Capitães e gestores acompanham a lista de atletas confirmados, código de acesso da equipe, escudo oficial e controle financeiro das inscrições.',
    },
    {
      icon: Search,
      title: 'Busca de Equipes & Atletas',
      description:
        'Encontre rapidamente qualquer clube ou jogador cadastrado por nome, Nick, posição principal ou disponibilidade para novos campeonatos.',
    },
    {
      icon: Sparkles,
      title: 'Banners Prontos em Alta Resolução',
      description:
        'Exporte artes personalizadas para Story (9:16), Feed (4:5) ou Quadrado (1:1) com placar oficial, escudos e craque do confronto.',
    },
  ];

  return (
    <div className="space-y-24 py-20 lg:py-28 max-w-6xl mx-auto px-4 sm:px-6">
      {/* SEÇÃO: COMO FUNCIONA EM 3 PASSOS */}
      <section id="como-funciona" className="space-y-12 scroll-mt-24">
        <AnimatedContent distance={20} className="flex flex-col items-center text-center mx-auto max-w-3xl space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white leading-[1.15] text-balance text-center">
            Do cadastro do seu atleta à súmula oficial em 3 passos
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed text-pretty text-center max-w-2xl mx-auto">
            Fluxo simplificado pensado para jogadores e capitães entrarem em quadra e campo sem atrito.
          </p>
        </AnimatedContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <AnimatedContent key={step.stepNumber} distance={24} delay={idx * 90} className="h-full">
                <div className="h-full p-6 sm:p-8 rounded-3xl bg-[#1A1A1E] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#222227] transition-all flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-[#141417] border border-white/[0.08] flex items-center justify-center text-white shadow-xs">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-zinc-400">
                        Passo {step.stepNumber}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-white tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-sm text-zinc-400 leading-relaxed text-pretty">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.08]">
                    <Link
                      href={step.link}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-emerald-400 transition-colors"
                    >
                      <span>{step.linkLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </AnimatedContent>
            );
          })}
        </div>
      </section>

      {/* SEÇÃO: RECURSOS DA PLATAFORMA */}
      <section id="recursos" className="space-y-12 scroll-mt-24 pt-6 border-t border-white/[0.08]">
        <AnimatedContent distance={20} className="flex flex-col items-center text-center mx-auto max-w-3xl space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white leading-[1.15] text-balance text-center">
            Tudo o que sua liga precisa em uma experiência moderna
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed text-pretty text-center max-w-2xl mx-auto">
            Interface rápida, escura e focada na competição e na comunidade.
          </p>
        </AnimatedContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <AnimatedContent key={item.title} distance={20} delay={idx * 90} className="h-full">
                <div className="h-full p-6 sm:p-8 rounded-3xl bg-[#1A1A1E] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#222227] transition-all flex flex-col justify-between space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#141417] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-display font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed text-pretty">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AnimatedContent>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default LandingFeatures;
