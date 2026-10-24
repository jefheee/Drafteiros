'use client';

import React from 'react';
import { PixelCard } from '@/components/react-bits/pixel-card';
import { ThoughtLine } from '@/components/react-bits/thought-line';
import { StatusMark } from '@/components/react-bits/status-mark';
import {
  Camera,
  Calendar,
  Layers,
  Users,
  Award,
  Wallet,
  Cpu,
  CheckCircle,
} from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      tag: 'VISÃO COMPUTACIONAL',
      title: 'Súmula por Foto com IA',
      description:
        'Tire uma foto da tela pós-jogo no seu PlayStation 5, Xbox Series ou PC. O modelo Google Gemini 2.5 Pro analisa o placar, posse de bola, atletas, gols e notas em menos de 15 segundos.',
      highlight: '99.8% de precisão de leitura',
      icon: Camera,
      status: 'success' as const,
      statusLabel: 'Gemini Vision',
      pixelColor: '#00E599',
    },
    {
      tag: 'ORGANIZAÇÃO ÁGIL',
      title: 'Combinação Inteligente de Horários',
      description:
        'Capitães definem os dias e turnos em que seus elencos estão disponíveis. O sistema cruza os dados e agenda automaticamente as partidas nos horários ideais sem discussões.',
      highlight: 'Fim dos atrasos e W.O.',
      icon: Calendar,
      status: 'online' as const,
      statusLabel: 'Agenda Sync',
      pixelColor: '#38bdf8',
    },
    {
      tag: 'REDES SOCIAIS',
      title: 'Estúdio de Banners 4:5',
      description:
        'Crie artes profissionais no padrão exato do feed do Instagram (1080x1350) em instantes: Banner de Dia de Jogo, Placar Final e Craque da Rodada prontos para publicar.',
      highlight: 'Formato nativo 4:5 em HD',
      icon: Layers,
      status: 'live' as const,
      statusLabel: 'Feed 4:5',
      pixelColor: '#c084fc',
    },
    {
      tag: 'SALA AO VIVO',
      title: 'Draft & Mercado de Passes',
      description:
        'Viva a emoção de uma noite de Draft estilo NBA. Capitães escolhem seus atletas rodada a rodada com cronômetro regressivo, limites salariais e negociações em tempo real.',
      highlight: 'Sorteio Snake com timer',
      icon: Users,
      status: 'warning' as const,
      statusLabel: 'Estilo NBA',
      pixelColor: '#f59e0b',
    },
    {
      tag: 'IDENTIDADE DO JOGADOR',
      title: 'Ficha & Passaporte do Atleta',
      description:
        'Tenha sua própria carta no estilo EA FC 26 Ultimate Team. Acompanhe seu OVR dinâmico, notas médias por partida, histórico de clubes, arquétipos e PlayStyles+.',
      highlight: 'Estatísticas auditadas',
      icon: Award,
      status: 'online' as const,
      statusLabel: 'Cartas FC 26',
      pixelColor: '#00E599',
    },
    {
      tag: 'FINANCEIRO LIMPO',
      title: 'Gestão Financeira & PIX',
      description:
        'Acompanhe entradas de inscrições e repasses de premiações em tempo real. Painel público e transparente para todos os membros da liga com pagamento direto aos campeões.',
      highlight: 'Premiação 100% integral',
      icon: Wallet,
      status: 'success' as const,
      statusLabel: 'Rateio Limpo',
      pixelColor: '#10b981',
    },
  ];

  return (
    <section id="recursos" className="py-20 lg:py-28 relative max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#00E599] text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" />
          <span>TECNOLOGIA DE PONTA</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-tight">
          A INFRAESTRUTURA COMPLETA DA SUA{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#00E599]">
            COMPETIÇÃO.
          </span>
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
          Todas as ferramentas necessárias para profissionalizar sua liga de EA FC 26 Pro Clubs com padrão de elite mundial.
        </p>
      </div>

      <ThoughtLine color="#00E599" />

      {/* Grid Bento com PixelCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <PixelCard
              key={idx}
              pixelColor={feat.pixelColor}
              className="flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#00E599]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <StatusMark status={feat.status} label={feat.statusLabel} />
                </div>

                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400 block">
                    {feat.tag}
                  </span>
                  <h3 className="text-lg font-display font-black text-white mt-1">
                    {feat.title}
                  </h3>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-semibold text-[#00E599]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{feat.highlight}</span>
              </div>
            </PixelCard>
          );
        })}
      </div>
    </section>
  );
}

export default LandingFeatures;
