'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/react-bits/scroll-reveal';
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
      title: 'Cadastro & Carta FC 26',
      description:
        'Crie sua conta e escolha seu perfil: Jogador ou Dono de Time. Configure o nome do seu boneco, EA ID, plataforma (PS5, Xbox Series ou PC), posição, altura, perna boa e gere sua Carta FC 26 oficial.',
      icon: UserCheck,
      link: '/login?mode=signup',
      linkLabel: 'Criar meu perfil',
    },
    {
      stepNumber: '02',
      title: 'Draft & Agenda sem confusão no WhatsApp',
      description:
        'Entre diretamente em um clube usando o código de convite do seu capitão ou fique disponível no mercado como Agente Livre para a Sala de Draft. Cruze os horários disponíveis dos dois elencos sem discussões.',
      icon: Calendar,
      link: '/login',
      linkLabel: 'Acessar times e agenda',
    },
    {
      stepNumber: '03',
      title: 'Súmula por IA & Estúdio de Banners',
      description:
        'Ao final da partida no EA FC 26, envie o print de desempenho. A IA extrai placar, gols, assistências e notas para validação do capitão adversário e gera banners prontos nos formatos 9:16, 4:5 e 1:1.',
      icon: Camera,
      link: '/login',
      linkLabel: 'Conhecer o estúdio',
    },
  ];

  const capabilities = [
    {
      icon: Shield,
      title: 'Gestão de Elenco & Rateio',
      description:
        'Capitães acompanham a lista de atletas confirmados, código de convite da equipe, escudo, camisas e controle transparente de inscrições.',
    },
    {
      icon: Search,
      title: 'Busca Social de Times & Jogadores',
      description:
        'Encontre rapidamente qualquer clube ou atleta cadastrado por nome do boneco, posição principal ou disponibilidade.',
    },
    {
      icon: Sparkles,
      title: 'Banners Pós-Jogo em 3 Formatos',
      description:
        'Exporte artes limpas para Story (9:16), Feed Retrato (4:5) ou Quadrado (1:1) com placar, escudos e artilheiros da rodada.',
    },
  ];

  return (
    <div className="space-y-24 py-20 lg:py-28 max-w-6xl mx-auto px-4 sm:px-6">
      {/* SEÇÃO 2: COMO FUNCIONA EM 3 PASSOS */}
      <section id="como-funciona" className="space-y-12 scroll-mt-24">
        <ScrollReveal className="max-w-2xl space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-white [text-wrap:balance]">
            Do cadastro do seu boneco à súmula oficial em 3 passos.
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Fluxo direto pensado para jogadores e capitães de Pro Clubs entrarem em campo sem burocracia.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <AnimatedContent key={step.stepNumber} distance={24} delay={idx * 0.08}>
                <div className="h-full p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] hover:border-white/[0.18] transition-colors flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#A1A1AA]">
                        Passo {step.stepNumber}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-white">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06]">
                    <Link
                      href={step.link}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-zinc-300 transition-colors"
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

      {/* RECURSOS CONCISOS */}
      <section id="recursos" className="space-y-10 scroll-mt-24 pt-4 border-t border-white/[0.08]">
        <ScrollReveal className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white [text-wrap:balance]">
            Tudo o que sua liga precisa em um só aplicativo.
          </h2>
          <p className="text-sm text-[#A1A1AA]">
            Interface limpa, rápida e focada no que importa para a sua competição.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <AnimatedContent key={item.title} distance={20} delay={idx * 0.08}>
                <div className="p-6 rounded-3xl bg-[#141414]/60 border border-white/[0.08] space-y-3 h-full">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-display font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    {item.description}
                  </p>
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
