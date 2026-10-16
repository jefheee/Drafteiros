'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  FALLBACK_TOURNAMENT,
  FALLBACK_STANDINGS,
  FALLBACK_SCORERS,
  FALLBACK_ASSISTS,
  FALLBACK_MATCHES,
} from '@/lib/mock-league-data';
import {
  TournamentStanding,
  TopScorer,
  TopAssist,
  Match,
} from '@/types/database';
import { cn } from '@/lib/utils';
import {
  Trophy,
  CalendarCheck2,
  Sparkles,
  FileCheck2,
  Flame,
  Award,
  Clock,
  ArrowRight,
  Shield,
  Users,
  DollarSign,
} from 'lucide-react';

export default function HomePage() {
  const [standings, setStandings] = useState<TournamentStanding[]>(FALLBACK_STANDINGS);
  const [scorers, setScorers] = useState<TopScorer[]>(FALLBACK_SCORERS);
  const [assists, setAssists] = useState<TopAssist[]>(FALLBACK_ASSISTS);
  const [matches, setMatches] = useState<Match[]>(FALLBACK_MATCHES);

  useEffect(() => {
    async function loadLiveHubData() {
      try {
        const { data: stData } = await supabase
          .from('vw_tournament_standings')
          .select('*')
          .order('position', { ascending: true });
        if (stData && stData.length > 0) setStandings(stData);

        const { data: scData } = await supabase
          .from('vw_top_scorers')
          .select('*')
          .order('rank', { ascending: true })
          .limit(3);
        if (scData && scData.length > 0) setScorers(scData as any);

        const { data: asData } = await supabase
          .from('vw_top_assists')
          .select('*')
          .order('rank', { ascending: true })
          .limit(3);
        if (asData && asData.length > 0) setAssists(asData as any);

        const { data: mData } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(*),
            away_team:teams!matches_away_team_id_fkey(*)
          `)
          .order('created_at', { ascending: false })
          .limit(6);
        if (mData && mData.length > 0) setMatches(mData as any);
      } catch {
        // mantém fallback da Liga Argentina 5x5
      }
    }
    loadLiveHubData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <main className="max-w-6xl mx-auto space-y-6">
        {/* ================================================================= */}
        {/* 1. CARD DE DESTAQUE DA LIGA ATIVA + ATALHOS RÁPIDOS MOBILE-FIRST */}
        {/* ================================================================= */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[11px] font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Temporada Oficial EA FC 26 • Pro Clubs
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
                {FALLBACK_TOURNAMENT.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Formato 5x5 (5 Titulares + 1 Reserva) • Agendamento Inteligente, Súmula via Gemini Vision OCR com Dupla Validação de Capitães e Rateio Automático de Premiações.
              </p>
            </div>

            {/* Pote de Premiação em Destaque */}
            <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-2xl border border-amber-500/40 shrink-0">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Premiação Oficial
                </span>
                <span className="text-lg font-black text-slate-100 font-mono">
                  R$ 560,00 em Jogo
                </span>
                <span className="text-[10px] text-slate-400 block">
                  1º R$300 • 2º R$120 • 3º R$80 • Art/Gar R$30
                </span>
              </div>
            </div>
          </div>

          {/* 3 Atalhos Rápidos Direto ao Ponto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
            <Link
              href="/matches"
              className="min-h-[48px] p-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-between shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5" />
                <span>Lançar / Validar Súmula IA</span>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/matches"
              className="min-h-[48px] p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 text-cyan-400 font-bold text-xs sm:text-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <CalendarCheck2 className="w-5 h-5 text-cyan-400" />
                <span>Bater Horário (Tinder 5x5)</span>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/studio"
              className="min-h-[48px] p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-400 font-bold text-xs sm:text-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Estúdio IA (Banners & Resenha)</span>
              </div>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. SEÇÃO "JOGOS DA RODADA" (SWIPEABLE / SCROLL HORIZONTAL MOBILE) */}
        {/* ================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Jogos da Rodada & Últimos Resultados
              </h2>
              <p className="text-xs text-slate-400">
                Deslize para o lado para ver os confrontos agendados e súmulas homologadas
              </p>
            </div>
            <Link
              href="/matches"
              className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Ver Todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x snap-mandatory">
            {matches.map((m) => {
              const isCompleted = m.status === 'completed' || m.status === 'approved';
              const isPendingVal = m.status === 'pending_validation';

              return (
                <Link
                  key={m.id}
                  href="/matches"
                  className="min-w-[275px] sm:min-w-[310px] snap-start p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3 shrink-0"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold text-slate-400">
                      RODADA #{m.round_number || 1}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded font-bold uppercase border',
                        isCompleted &&
                          'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
                        isPendingVal &&
                          'bg-amber-950/60 text-amber-300 border-amber-800/60',
                        !isCompleted &&
                          !isPendingVal &&
                          'bg-slate-950 text-cyan-400 border-slate-800'
                      )}
                    >
                      {isCompleted
                        ? 'Finalizado'
                        : isPendingVal
                        ? 'Validação Dupla'
                        : m.schedule_status === 'confirmed'
                        ? 'Confirmado'
                        : 'Bater Horário'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="w-2.5 h-7 rounded-full shrink-0"
                        style={{ backgroundColor: m.home_team?.primary_color || '#38bdf8' }}
                      />
                      <span className="text-xs font-extrabold text-slate-100 truncate">
                        {m.home_team?.name || 'Time Casa'}
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-sm font-black font-mono text-amber-400 shrink-0">
                      {isCompleted || isPendingVal
                        ? `${m.home_score} - ${m.away_score}`
                        : 'VS'}
                    </div>

                    <div className="flex items-center justify-end gap-2 flex-1 min-w-0 text-right">
                      <span className="text-xs font-extrabold text-slate-100 truncate">
                        {m.away_team?.name || 'Time Fora'}
                      </span>
                      <span
                        className="w-2.5 h-7 rounded-full shrink-0"
                        style={{ backgroundColor: m.away_team?.primary_color || '#eab308' }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {m.scheduled_at
                        ? new Date(m.scheduled_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Horário em aberto'}
                    </span>
                    <span className="text-cyan-400 font-semibold">Abrir Súmula →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. TABELA DE CLASSIFICAÇÃO (DESTAQUE G4 CIANO) + TOP 3 LADO A LADO */}
        {/* ================================================================= */}
        <section className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Tabela de Classificação Limpa (7 Colunas) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-cyan-400" />
                  Classificação Oficial — Liga 5x5
                </h2>
                <p className="text-xs text-slate-400">
                  Os <span className="text-cyan-400 font-bold">4 primeiros (G4)</span> avançam direto para as Semifinais
                </p>
              </div>
              <Link
                href="/rankings"
                className="text-xs font-bold text-cyan-400 hover:underline"
              >
                Tabela Completa →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-950 border-y border-slate-800">
                  <tr>
                    <th className="py-2.5 px-2.5">#</th>
                    <th className="py-2.5 px-2.5">Clube</th>
                    <th className="py-2.5 px-2 text-center">J</th>
                    <th className="py-2.5 px-2 text-center">V</th>
                    <th className="py-2.5 px-2 text-center">E</th>
                    <th className="py-2.5 px-2 text-center">D</th>
                    <th className="py-2.5 px-2 text-center">SG</th>
                    <th className="py-2.5 px-2.5 text-right font-extrabold text-cyan-400">
                      PTS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {standings.map((team, idx) => {
                    const isG4 = idx < 4;
                    return (
                      <tr
                        key={team.team_id}
                        className={cn(
                          'transition-colors',
                          isG4
                            ? 'bg-cyan-950/15 hover:bg-cyan-950/25'
                            : 'hover:bg-slate-950/40'
                        )}
                      >
                        <td className="py-3 px-2.5 font-bold">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px]',
                              isG4
                                ? 'bg-cyan-500 text-slate-950 font-black'
                                : 'bg-slate-950 text-slate-400 border border-slate-800'
                            )}
                          >
                            {team.position}
                          </span>
                        </td>
                        <td className="py-3 px-2.5 font-sans font-bold text-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{team.team_name}</span>
                            {isG4 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase">
                                G4
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-400">{team.played}</td>
                        <td className="py-3 px-2 text-center text-slate-300">{team.won}</td>
                        <td className="py-3 px-2 text-center text-slate-400">{team.drawn}</td>
                        <td className="py-3 px-2 text-center text-slate-400">{team.lost}</td>
                        <td className="py-3 px-2 text-center text-slate-300">
                          {team.goal_difference > 0
                            ? `+${team.goal_difference}`
                            : team.goal_difference}
                        </td>
                        <td className="py-3 px-2.5 text-right font-black text-sm text-cyan-400">
                          {team.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 3 Artilheiros e Top 3 Garçons Lado a Lado (5 Colunas) */}
          <div className="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Top 3 Artilheiros */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Top 3 Artilheiros (Prêmio R$ 30)
                </h3>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  ⚽ Gols
                </span>
              </div>

              <div className="space-y-2">
                {scorers.slice(0, 3).map((sc, i) => (
                  <div
                    key={sc.player_id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black font-mono',
                          i === 0
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">
                          {sc.player_name}
                        </span>
                        <span className="text-[10px] text-slate-400">{sc.team_name}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-black text-xs">
                      {sc.goals_count} ⚽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Garçons */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Top 3 Garçons (Prêmio R$ 30)
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                  👟 Assists
                </span>
              </div>

              <div className="space-y-2">
                {assists.slice(0, 3).map((asst, i) => (
                  <div
                    key={asst.player_id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black font-mono',
                          i === 0
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">
                          {asst.player_name}
                        </span>
                        <span className="text-[10px] text-slate-400">{asst.team_name}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-black text-xs">
                      {asst.assists_count} 👟
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
