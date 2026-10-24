'use client';

import React from 'react';
import { PixelCard } from '@/components/react-bits/pixel-card';
import { WarmTooltip } from '@/components/react-bits/warm-tooltip';
import { StatusMark } from '@/components/react-bits/status-mark';
import {
  Crown,
  Shield,
  Gamepad2,
  Palette,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export function LandingTargetAudience() {
  const audiences = [
    {
      badge: 'ADMINISTRADORES',
      status: 'success' as const,
      statusLabel: 'Automação 100%',
      title: 'Organizadores de Ligas & Copas',
      description:
        'Crie torneios mata-mata e ligas por pontos corridos sem passar a madrugada somando gols em Excel. Deixe que a IA atualize tabelas, artilharia e rateio de prêmios.',
      benefits: [
        'Chaveamento automático & controle de regulamento',
        'Tesouraria transparente com divisão de prêmios via PIX',
        'Fim das contestações e W.O. indevido com prints validados',
      ],
      icon: Crown,
      pixelColor: '#f59e0b',
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    },
    {
      badge: 'LÍDERES DE TIME',
      status: 'online' as const,
      statusLabel: 'Draft & Agenda',
      title: 'Capitães e Gestores de Elenco',
      description:
        'Monte o esquadrão perfeito na noite de Draft estilo NBA. Marque os confrontos com outros capitães sem trocar 40 mensagens no WhatsApp e valide súmulas em 15 segundos.',
      benefits: [
        'Sala de Draft ao vivo com timer regressivo por pick',
        'Cruzamento automático da disponibilidade do elenco',
        'Envio de súmula por foto direto da tela da partida',
      ],
      icon: Shield,
      pixelColor: '#00E599',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-[#00E599]',
    },
    {
      badge: 'ATLETAS VIRTUAIS',
      status: 'online' as const,
      statusLabel: 'Ficha FC 26',
      title: 'Jogadores de Pro Clubs',
      description:
        'Construa sua reputação no cenário competitivo. Receba sua própria Carta Oficial estilo EA FC 26 Ultimate Team com OVR dinâmico, notas médias por partida e PlayStyles+.',
      benefits: [
        'Carta personalizada com OVR, foto e arquétipo',
        'Estatísticas auditadas de gols, assistências e notas de cada jogo',
        'Passaporte único do atleta para competir em qualquer liga',
      ],
      icon: Gamepad2,
      pixelColor: '#06b6d4',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    },
    {
      badge: 'MÍDIA & SOCIAL',
      status: 'live' as const,
      statusLabel: 'Feed 4:5',
      title: 'Criadores de Conteúdo & Streamers',
      description:
        'Eleve a identidade visual das suas redes. Publique cards instantâneos de Dia de Jogo, Placar Final e Craque da Rodada formatados com proporção 4:5 para o Instagram e Discord.',
      benefits: [
        'Banners automáticos com escudos, notas e fotos em HD',
        'Gere artes profissionais em segundos sem Photoshop ou Canva',
        'Engaje seguidores e valorize os patrocinadores do campeonato',
      ],
      icon: Palette,
      pixelColor: '#a855f7',
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    },
  ];

  return (
    <section id="para-quem-e" className="py-20 lg:py-28 bg-[#0a0c10] border-y border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#00E599] text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>PÚBLICO-ALVO & ECOSSISTEMA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-tight">
            FEITO SOB MEDIDA PARA CADA PAPEL DO{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#00E599]">
              PRO CLUBS.
            </span>
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
            Seja você o organizador que busca tranquilidade, o capitão que lidera o elenco ou o atleta que quer brilhar nas estatísticas, o DraftClub resolve a sua rotina.
          </p>
        </div>

        {/* 4 Cards com PixelCard do React Bits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {audiences.map((aud, idx) => {
            const Icon = aud.icon;
            return (
              <PixelCard key={idx} pixelColor={aud.pixelColor} className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <StatusMark status={aud.status} label={aud.statusLabel} />
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${aud.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500 block">
                      {aud.badge}
                    </span>
                    <h3 className="text-xl font-display font-black text-white mt-1">
                      {aud.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {aud.description}
                  </p>

                  <div className="pt-2 space-y-2">
                    {aud.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2.5 text-xs text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] shrink-0 mt-1.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-zinc-400">
                  <WarmTooltip content={`Ver ferramentas para ${aud.badge.toLowerCase()}`}>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Ferramentas exclusivas
                    </span>
                  </WarmTooltip>
                  <span className="text-[#00E599] font-black">→</span>
                </div>
              </PixelCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default LandingTargetAudience;
