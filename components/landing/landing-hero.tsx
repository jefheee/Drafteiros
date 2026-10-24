'use client';

import React from 'react';
import Link from 'next/link';
import { GridMotion } from '@/components/react-bits/grid-motion';
import { CountUp } from '@/components/react-bits/count-up';
import { RotatingText } from '@/components/react-bits/rotating-text';
import { ClickSpark } from '@/components/react-bits/click-spark';
import { RefineFrame } from '@/components/react-bits/refine-frame';
import { StatusMark } from '@/components/react-bits/status-mark';
import { PwaInstallButton } from '@/components/pwa-install-button';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  Scan,
  TrendingUp,
  Camera,
  Eye,
} from 'lucide-react';

export function LandingHero() {
  const gridMotionItems = [
    '/assets/awards/1st-place.png',
    '/assets/archetypes/Atacante/Bruxo/Bruxo.png',
    'SÚMULA IA VISION',
    '/assets/awards/golden-boot.png',
    '/assets/archetypes/Meio-Campista/Maestro/Maestro.png',
    'DRAFT ESTILO NBA',
    '/assets/tactics/captain-band.png',
    '/assets/archetypes/Defensor/Chefia/Chefia.png',
    'ESTÚDIO BANNERS 4:5',
    '/assets/awards/playmaker-trophy.png',
    '/assets/archetypes/Goleiro/Muralha/Muralha.png',
    'PREMIAÇÃO 100% PIX',
    '/assets/awards/2nd-place.png',
    'PASSAPORTE DO ATLETA',
    '/assets/awards/3rd-place.png',
    'FICHAS FC 26 ULTIMATE',
    '/assets/archetypes/Atacante/Alvo/Alvo.png',
    'CRUZAMENTO DE HORÁRIOS',
    '/assets/archetypes/Defensor/Compasso/Compasso.png',
    'RADAR TÁTICO',
    '/assets/templates/crest-placeholder.png',
    'MATA-MATA AUTOMÁTICO',
    '/assets/awards/1st-place.png',
    'GEMINI 2.5 PRO VISION',
    '/assets/awards/golden-boot.png',
    'TABELA EM TEMPO REAL',
    '/assets/archetypes/Meio-Campista/Comandante/Comandante.png',
    'EA FC 26 PRO CLUBS',
  ];

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-center items-center overflow-hidden pt-8 pb-20 md:py-20">
      {/* Background Interativo "Grid Motion" do React Bits */}
      <div className="absolute inset-0 z-0">
        <GridMotion
          items={gridMotionItems}
          gradientColor="#0c0e12"
          className="opacity-45 sm:opacity-60"
        />
      </div>

      {/* Camada tática escura de alto contraste para foco e legibilidade de elite */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0c0e12]/80 via-[#0c0e12]/70 to-[#0c0e12] pointer-events-none" />

      {/* Brilho e Ambient Glow Central */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-10" />

      {/* Conteúdo do Hero */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7">
        {/* Super Badge com RotatingText do React Bits */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14171f]/90 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold tracking-wide shadow-xl backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
          <span>A MAIOR PLATAFORMA DE PRO CLUBS • </span>
          <RotatingText
            texts={['EA FC 26', 'SÚMULA IA', 'DRAFT NBA', 'RATEIO PIX']}
            className="text-white font-mono font-black"
          />
        </div>

        {/* Headline Titular com [text-wrap:balance] para eliminar quebras feias */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-[1.12] [text-wrap:balance]">
            Sua Liga de Pro Clubs Sem Discussão no WhatsApp.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#00E599] to-teal-300">
              Do Draft ao Troféu.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
            Plataforma completa para competições de EA FC 26: leitura de súmula por IA em 15 segundos, estúdio de banners para redes sociais, sala de draft estilo NBA e gestão financeira com PIX. Esqueça planilhas corrompidas e discussões em áudios.
          </p>
        </div>

        {/* Ações (ClickSpark + Specular) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-xl mx-auto">
          <ClickSpark sparkColor="#00E599" sparkCount={8} className="w-full sm:w-auto">
            <Link
              href="/login?action=create_league"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E599] hover:from-emerald-400 hover:to-[#00f7a5] text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-zinc-950" />
              <span>Criar Minha Liga Grátis</span>
            </Link>
          </ClickSpark>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-bold text-sm backdrop-blur-md transition-all active:scale-[0.98]"
          >
            <Eye className="w-4 h-4 text-[#00E599]" />
            <span>Ver Demonstração ao Vivo</span>
          </Link>

          {/* Botão Mobile PWA */}
          <div className="sm:hidden w-full pt-1">
            <PwaInstallButton
              variant="outline"
              className="w-full justify-center py-3 border-emerald-500/30 text-emerald-300"
            />
          </div>
        </div>

        {/* Métricas Reais com CountUp do React Bits */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-[#14171f]/85 border border-white/10 backdrop-blur-md text-center space-y-1">
            <div className="text-xl sm:text-2xl font-display font-black text-white">
              +<CountUp to={1200} separator="." duration={1.8} />
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Clubes Cadastrados
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#14171f]/85 border border-white/10 backdrop-blur-md text-center space-y-1">
            <div className="text-xl sm:text-2xl font-display font-black text-[#00E599]">
              <CountUp to={16000} separator="." duration={2.2} />+
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Partidas Lidas por IA
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#14171f]/85 border border-white/10 backdrop-blur-md text-center space-y-1">
            <div className="text-xl sm:text-2xl font-display font-black text-emerald-400">
              R$ <CountUp to={180} duration={1.6} />K+
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Premiações Pagas
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#14171f]/85 border border-white/10 backdrop-blur-md text-center space-y-1">
            <div className="text-xl sm:text-2xl font-display font-black text-white">
              <CountUp to={99.8} decimals={1} duration={1.5} />%
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Precisão da Súmula
            </div>
          </div>
        </div>

        {/* Mockup Tático com RefineFrame do React Bits */}
        <div className="pt-2 max-w-3xl mx-auto">
          <RefineFrame badge="SÚMULA IA • EA FC 26">
            <div className="space-y-4 text-left">
              {/* Header do Mockup */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-zinc-400 ml-2">
                    Partida #124 • Final da Copa Pro Clubs
                  </span>
                </div>
                <StatusMark status="success" label="IA Vision 2.5 Pro" />
              </div>

              {/* Placar e Confronto */}
              <div className="grid grid-cols-3 items-center py-2">
                <div className="flex flex-col items-center sm:items-start space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-lg">
                    FDP
                  </div>
                  <span className="font-display font-black text-sm text-white">
                    FURIA DEL PLATA
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">Capitão: @jefhe</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider">
                    4 : 1
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E599] bg-[#00E599]/10 px-2 py-0.5 rounded-full mt-1">
                    Tempo Regular
                  </span>
                  <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                    Posse: 58% - 42%
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-lg">
                    CAT
                  </div>
                  <span className="font-display font-black text-sm text-white">
                    LA CATIMBA
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">Capitão: @haalandinho</span>
                </div>
              </div>

              {/* Rodapé com validação */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Foto lida pela API em 12s com gols, assistências e notas</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#00E599] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Súmula Validada por Ambos os Capitães</span>
                </div>
              </div>
            </div>
          </RefineFrame>
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
