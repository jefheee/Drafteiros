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
  Calendar,
  Sparkles,
  Camera,
  Flame,
  Award,
  Clock,
  ChevronRight,
  Shield,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';

export default function HomePage() {
  const [activeSegment, setActiveSegment] = useState<'matches' | 'standings' | 'rankings'>('matches');
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
          .limit(5);
        if (scData && scData.length > 0) setScorers(scData as any);

        const { data: asData } = await supabase
          .from('vw_top_assists')
          .select('*')
          .order('rank', { ascending: true })
          .limit(5);
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
        // mantém fallback da Liga Argentina 5x5 LPF
      }
    }
    loadLiveHubData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-4 py-5 pb-28">
      <main className="max-w-3xl mx-auto space-y-5">
        {/* ================================================================= */}
        {/* 1. CABEÇALHO ELEGANTE DA LIGA 5x5 LPF (PADRÃO JOGUEIROS CLEAN)    */}
        {/* ================================================================= */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#7C5CFC]/10 border border-[#7C5CFC]/20 flex items-center justify-center text-[#7C5CFC] shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#229a3e] dark:text-[#38C958] text-[11px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38C958] animate-pulse" />
                  Temporada Oficial 5x5 • Zero Digitação
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {FALLBACK_TOURNAMENT.name}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Inscrição R$ 70,00 • 5 Titulares + 1 Reserva • Súmula por Foto (IA)
                </p>
              </div>
            </div>

            {/* Pílula Premiação R$ 560 */}
            <Link
              href="/admin"
              className="flex items-center justify-between sm:justify-start gap-3 px-4 py-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700 hover:border-[#7C5CFC]/40 transition-all shrink-0"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                  Premiação Total
                </span>
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  R$ 560,00
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  1º R$300 • 2º R$120 • 3º R$80
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>

          {/* Atalhos Rápidos Estilo Jogueiros */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/matches"
              className="py-3 px-4 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all"
            >
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 shrink-0" />
                Lançar Súmula
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/studio"
              className="py-3 px-4 rounded-2xl bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                Criar Banner IA
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/captain"
              className="col-span-2 sm:col-span-1 py-3 px-4 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 hover:bg-zinc-200/70 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#7C5CFC] shrink-0" />
                Meu Time (Caixa)
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. SELETOR SEGMENTADO (SEGMENTED CONTROL LIMPO ESTILO JOGUEIROS)  */}
        {/* ================================================================= */}
        <div className="p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveSegment('matches')}
            className={cn(
              'py-2.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeSegment === 'matches'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jogos da Rodada</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('standings')}
            className={cn(
              'py-2.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeSegment === 'standings'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Classificação (G4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('rankings')}
            className={cn(
              'py-2.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeSegment === 'rankings'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Rankings</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* ABA SEGMENTADA 1: JOGOS DA RODADA                                 */}
        {/* ================================================================= */}
        {activeSegment === 'matches' && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Confrontos da Rodada
                </h2>
                <p className="text-xs text-zinc-500">
                  Toque em qualquer partida para bater horário ou validar a súmula por foto
                </p>
              </div>
              <Link
                href="/matches"
                className="px-3.5 py-1.5 rounded-full bg-[#7C5CFC] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Jogo
              </Link>
            </div>

            <div className="space-y-3">
              {matches.map((m) => {
                const isCompleted = m.status === 'completed' || m.status === 'approved';
                const isPendingVal = m.status === 'pending_validation';

                return (
                  <Link
                    key={m.id}
                    href="/matches"
                    className="block p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-[#7C5CFC]/40 transition-all space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#7C5CFC]" />
                        {m.scheduled_at
                          ? new Date(m.scheduled_at).toLocaleString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : `Rodada #${m.round_number || 1} • Horário flexível`}
                      </span>

                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-extrabold',
                          isCompleted && 'bg-[#38C958]/15 text-[#229a3e] dark:text-[#38C958]',
                          isPendingVal && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                          !isCompleted && !isPendingVal && 'bg-[#7C5CFC]/10 text-[#7C5CFC]'
                        )}
                      >
                        {isCompleted
                          ? 'Súmula Validada'
                          : isPendingVal
                          ? 'Aguardando Capitão B'
                          : m.schedule_status === 'confirmed'
                          ? 'Horário Confirmado'
                          : 'Bater Horário'}
                      </span>
                    </div>

                    {/* Placar Estilo Jogueiros (Escudo Circular + X + Escudo Circular) */}
                    <div className="flex items-center justify-between gap-2 py-1">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm"
                          style={{ backgroundColor: m.home_team?.primary_color || '#7C5CFC' }}
                        >
                          {(m.home_team?.name || 'CA').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 block truncate">
                            {m.home_team?.name || 'Mandante'}
                          </span>
                          <span className="text-[10px] text-zinc-400">Mandante</span>
                        </div>
                      </div>

                      <div className="px-3.5 py-1.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 shrink-0">
                        {isCompleted || isPendingVal
                          ? `${m.home_score}  x  ${m.away_score}`
                          : 'VS'}
                      </div>

                      <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 block truncate">
                            {m.away_team?.name || 'Visitante'}
                          </span>
                          <span className="text-[10px] text-zinc-400">Visitante</span>
                        </div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm"
                          style={{ backgroundColor: m.away_team?.primary_color || '#18181B' }}
                        >
                          {(m.away_team?.name || 'VI').substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">
                        Rodada #{m.round_number || 1} • Futebol 5x5 (EA FC 26)
                      </span>
                      <span className="font-extrabold text-[#7C5CFC] flex items-center gap-1">
                        {isPendingVal ? 'Validar Resultado' : 'Abrir Súmula'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* ABA SEGMENTADA 2: TABELA DE CLASSIFICAÇÃO (G4 DESTACADO)          */}
        {/* ================================================================= */}
        {activeSegment === 'standings' && (
          <section className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Tabela Oficial — Liga 5x5 LPF
                </h2>
                <p className="text-xs text-zinc-500">
                  Os <span className="text-[#38C958] font-extrabold">4 primeiros (G4)</span> classificam para as Semifinais
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#38C958]/15 text-[#229a3e] text-[10px] font-extrabold">
                G4 Semifinal
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">Time</th>
                    <th className="py-2.5 px-1.5 text-center">J</th>
                    <th className="py-2.5 px-1.5 text-center text-[#38C958]">V</th>
                    <th className="py-2.5 px-1.5 text-center text-amber-500">E</th>
                    <th className="py-2.5 px-1.5 text-center text-rose-500">D</th>
                    <th className="py-2.5 px-1.5 text-center">SG</th>
                    <th className="py-2.5 px-2 text-right font-extrabold text-[#7C5CFC]">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {standings.map((team, idx) => {
                    const isG4 = idx < 4;
                    return (
                      <tr
                        key={team.team_id}
                        className={cn(
                          'transition-colors',
                          isG4 ? 'bg-[#38C958]/[0.04]' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        )}
                      >
                        <td className="py-3 px-2">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-extrabold',
                              isG4
                                ? 'bg-[#38C958] text-white'
                                : 'bg-[#F5F6FA] dark:bg-zinc-800 text-zinc-500'
                            )}
                          >
                            {team.position}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-extrabold text-zinc-900 dark:text-zinc-100">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{team.team_name}</span>
                            {isG4 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#229a3e] font-extrabold uppercase">
                                G4
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-1.5 text-center text-zinc-500 font-semibold">
                          {team.played}
                        </td>
                        <td className="py-3 px-1.5 text-center font-bold text-zinc-700 dark:text-zinc-300">
                          {team.won}
                        </td>
                        <td className="py-3 px-1.5 text-center text-zinc-500">{team.drawn}</td>
                        <td className="py-3 px-1.5 text-center text-zinc-500">{team.lost}</td>
                        <td className="py-3 px-1.5 text-center text-zinc-600 dark:text-zinc-400 font-semibold">
                          {team.goal_difference > 0
                            ? `+${team.goal_difference}`
                            : team.goal_difference}
                        </td>
                        <td className="py-3 px-2 text-right font-black text-sm text-[#7C5CFC]">
                          {team.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* ABA SEGMENTADA 3: RANKINGS (ARTILHEIROS E GARÇONS)                */}
        {/* ================================================================= */}
        {activeSegment === 'rankings' && (
          <section className="grid sm:grid-cols-2 gap-4">
            {/* Artilheiros */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#7C5CFC]" />
                    Artilheiros da Liga
                  </h3>
                  <p className="text-[11px] text-zinc-500">Prêmio Oficial: R$ 30,00</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-[10px] font-extrabold">
                  ⚽ Gols
                </span>
              </div>

              <div className="space-y-2.5">
                {scorers.map((sc, i) => (
                  <div
                    key={sc.player_id}
                    className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold',
                          i === 0
                            ? 'bg-[#7C5CFC] text-white'
                            : 'bg-white dark:bg-zinc-900 text-zinc-500'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 block">
                          {sc.player_name}
                        </span>
                        <span className="text-[10px] text-zinc-500">{sc.team_name}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-zinc-900 text-[#7C5CFC] font-black text-xs shadow-sm">
                      {sc.goals_count} ⚽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Garçons */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#38C958]" />
                    Líderes de Assistência
                  </h3>
                  <p className="text-[11px] text-zinc-500">Prêmio Oficial: R$ 30,00</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#38C958]/15 text-[#229a3e] text-[10px] font-extrabold">
                  👟 Assists
                </span>
              </div>

              <div className="space-y-2.5">
                {assists.map((asst, i) => (
                  <div
                    key={asst.player_id}
                    className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold',
                          i === 0
                            ? 'bg-[#38C958] text-white'
                            : 'bg-white dark:bg-zinc-900 text-zinc-500'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 block">
                          {asst.player_name}
                        </span>
                        <span className="text-[10px] text-zinc-500">{asst.team_name}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-zinc-900 text-[#229a3e] dark:text-[#38C958] font-black text-xs shadow-sm">
                      {asst.assists_count} 👟
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
