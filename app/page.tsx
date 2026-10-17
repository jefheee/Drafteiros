'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import { AWARD_ASSETS } from '@/lib/assets-catalog';
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
  Users,
  Plus,
} from 'lucide-react';

export default function HomePage() {
  const [activeSegment, setActiveSegment] = useState<'matches' | 'standings' | 'rankings'>('matches');
  const { tournament, standings, scorers, assists, matches, teams } = useLeagueStore();

  const totalPrizePool =
    (tournament.prize_distribution?.first || 0) +
    (tournament.prize_distribution?.second || 0) +
    (tournament.prize_distribution?.third || 0) +
    (tournament.prize_distribution?.top_scorer || 0) +
    (tournament.prize_distribution?.top_assister || 0);

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 sm:px-4 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-3xl mx-auto space-y-4">
        {/* 1. CABEÇALHO DA LIGA (LIMPO E CONCISO) */}
        <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/10 border border-[#7C5CFC]/20 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
                <img
                  src={AWARD_ASSETS[0]?.iconUrl || '/assets/awards/Troféu de Ouro (Campeão)/Troféu de Ouro (Campeão).png'}
                  alt="Troféu Oficial"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#229a3e] dark:text-[#38C958] text-[10px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38C958] animate-pulse" />
                  Temporada Oficial {tournament.game_mode || '5v5'} • EA FC 26
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
                  {tournament.name}
                </h1>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Inscrição R$ {Number(tournament.entry_fee || 70).toFixed(2)} • {tournament.starters_count || 5} Titulares + {tournament.reserves_count ?? 1} Reserva
                </p>
              </div>
            </div>

            <Link
              href="/admin"
              className="flex items-center justify-between sm:justify-start gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700 hover:border-[#7C5CFC]/40 transition-all shrink-0"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                  Premiação 100% (Sem Taxa)
                </span>
                <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                  R$ {totalPrizePool.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  1º R${tournament.prize_distribution?.first || 300} • 2º R${tournament.prize_distribution?.second || 120} • 3º R${tournament.prize_distribution?.third || 80}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </Link>
          </div>

          {/* Atalhos Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/matches"
              className="py-2.5 px-3 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Camera className="w-3.5 h-3.5 shrink-0" />
                Súmula IA
              </span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <Link
              href="/studio"
              className="py-2.5 px-3 rounded-2xl bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                Banner 4:5
              </span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <Link
              href="/draft-board"
              className="py-2.5 px-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 hover:bg-zinc-200/70 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Users className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
                Draft (+40)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </Link>

            <Link
              href="/player"
              className="py-2.5 px-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 hover:bg-zinc-200/70 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Shield className="w-3.5 h-3.5 text-[#38C958] shrink-0" />
                Minha Build
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </Link>
          </div>
        </section>

        {/* 2. SELETOR SEGMENTADO */}
        <div className="p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveSegment('matches')}
            className={cn(
              'py-2 px-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1',
              activeSegment === 'matches'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Jogos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('standings')}
            className={cn(
              'py-2 px-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1',
              activeSegment === 'standings'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tabela (G4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('rankings')}
            className={cn(
              'py-2 px-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1',
              activeSegment === 'rankings'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Rankings</span>
          </button>
        </div>

        {/* ABA 1: JOGOS DA RODADA (NOMES E ESCUDOS BEM VISÍVEIS) */}
        {activeSegment === 'matches' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Confrontos da Rodada
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Agende horário ou valide a súmula por foto
                </p>
              </div>
              <Link
                href="/matches"
                className="px-3 py-1.5 rounded-full bg-[#7C5CFC] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Súmula / Jogo
              </Link>
            </div>

            <div className="space-y-2.5">
              {matches.map((m) => {
                const isCompleted = m.status === 'completed' || m.status === 'approved';
                const isPendingVal = m.status === 'pending_validation';
                const homeTeam = m.home_team || teams.find((t) => t.id === m.home_team_id);
                const awayTeam = m.away_team || teams.find((t) => t.id === m.away_team_id);

                return (
                  <Link
                    key={m.id}
                    href="/matches"
                    className="block p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-[#7C5CFC]/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
                        {m.scheduled_at
                          ? new Date(m.scheduled_at).toLocaleString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : `Rodada #${m.round_number || 1}`}
                      </span>

                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0',
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

                    {/* Placar com Escudos e Nomes Completos Visíveis */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 py-1">
                      {/* Mandante */}
                      <div className="flex items-center gap-2 min-w-0">
                        {homeTeam?.logo_url ? (
                          <img
                            src={homeTeam.logo_url}
                            alt={homeTeam.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                            style={{ backgroundColor: homeTeam?.primary_color || '#7C5CFC' }}
                          >
                            {(homeTeam?.name || 'CA').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">
                            {homeTeam?.name || 'Mandante'}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">Mandante</span>
                        </div>
                      </div>

                      {/* Placar Central */}
                      <div className="px-3 py-1.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 shrink-0 text-center min-w-[68px]">
                        {isCompleted || isPendingVal
                          ? `${m.home_score} - ${m.away_score}`
                          : 'VS'}
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center justify-end gap-2 min-w-0 text-right">
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">
                            {awayTeam?.name || 'Visitante'}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">Visitante</span>
                        </div>
                        {awayTeam?.logo_url ? (
                          <img
                            src={awayTeam.logo_url}
                            alt={awayTeam.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                            style={{ backgroundColor: awayTeam?.primary_color || '#18181B' }}
                          >
                            {(awayTeam?.name || 'VI').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">
                        Rodada #{m.round_number || 1} • {tournament.game_mode || '5v5'}
                      </span>
                      <span className="font-extrabold text-[#7C5CFC] flex items-center gap-1">
                        {isPendingVal ? 'Validar Placar' : 'Ver Súmula / Arte 4:5'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ABA 2: TABELA DE CLASSIFICAÇÃO */}
        {activeSegment === 'standings' && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Classificação Oficial
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Top 4 (<span className="text-[#38C958] font-extrabold">G4</span>) avançam às Semifinais
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#38C958]/15 text-[#229a3e] text-[10px] font-extrabold shrink-0">
                G4 Semifinal
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-1.5">#</th>
                    <th className="py-2.5 px-2">Clube</th>
                    <th className="py-2.5 px-1 text-center">J</th>
                    <th className="py-2.5 px-1 text-center text-[#38C958]">V</th>
                    <th className="py-2.5 px-1 text-center text-amber-500">E</th>
                    <th className="py-2.5 px-1 text-center text-rose-500">D</th>
                    <th className="py-2.5 px-1 text-center">SG</th>
                    <th className="py-2.5 px-1.5 text-right font-extrabold text-[#7C5CFC]">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {standings.map((team, idx) => {
                    const isG4 = idx < 4;
                    const teamObj = teams.find((t) => t.id === team.team_id);
                    return (
                      <tr
                        key={team.team_id}
                        className={cn(
                          'transition-colors',
                          isG4 ? 'bg-[#38C958]/[0.04]' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        )}
                      >
                        <td className="py-2.5 px-1.5">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold',
                              isG4
                                ? 'bg-[#38C958] text-white'
                                : 'bg-[#F5F6FA] dark:bg-zinc-800 text-zinc-500'
                            )}
                          >
                            {team.position}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-extrabold text-zinc-900 dark:text-zinc-100">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                              style={{ backgroundColor: teamObj?.primary_color || '#7C5CFC' }}
                            >
                              {team.team_name.substring(0, 2).toUpperCase()}
                            </span>
                            <span className="leading-tight">{team.team_name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-1 text-center text-zinc-500 font-semibold">
                          {team.played}
                        </td>
                        <td className="py-2.5 px-1 text-center font-bold text-zinc-700 dark:text-zinc-300">
                          {team.won}
                        </td>
                        <td className="py-2.5 px-1 text-center text-zinc-500">{team.drawn}</td>
                        <td className="py-2.5 px-1 text-center text-zinc-500">{team.lost}</td>
                        <td className="py-2.5 px-1 text-center text-zinc-600 dark:text-zinc-400 font-semibold">
                          {team.goal_difference > 0
                            ? `+${team.goal_difference}`
                            : team.goal_difference}
                        </td>
                        <td className="py-2.5 px-1.5 text-right font-black text-sm text-[#7C5CFC]">
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

        {/* ABA 3: RANKINGS COM NOME DO PERSONAGEM (CHARACTER_NAME) EM DESTAQUE */}
        {activeSegment === 'rankings' && (
          <section className="grid sm:grid-cols-2 gap-3.5">
            {/* Artilheiros */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/awards/Chuteira de Ouro (Artilheiro)/Chuteira de Ouro (Artilheiro).png"
                    alt="Chuteira de Ouro"
                    className="w-7 h-7 object-contain"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      Artilheiros (Character Name)
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Prêmio: R$ {tournament.prize_distribution?.top_scorer || 30},00
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-[10px] font-extrabold">
                  ⚽ Gols
                </span>
              </div>

              <div className="space-y-2">
                {scorers.map((sc, i) => (
                  <div
                    key={sc.player_id}
                    className="p-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0',
                          i === 0
                            ? 'bg-[#7C5CFC] text-white'
                            : 'bg-white dark:bg-zinc-900 text-zinc-500'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 block truncate uppercase">
                          {sc.character_name || sc.player_name}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {sc.team_name} {sc.full_name ? `• (${sc.full_name})` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 text-[#7C5CFC] font-black text-xs shadow-xs shrink-0">
                      {sc.goals_count} ⚽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Garçons */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/awards/Troféu Melhor Assistente (Garçom)/Troféu Melhor Assistente (Garçom).png"
                    alt="Garçom"
                    className="w-7 h-7 object-contain"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      Líderes de Assistência
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Prêmio: R$ {tournament.prize_distribution?.top_assister || 30},00
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#38C958]/15 text-[#229a3e] text-[10px] font-extrabold">
                  👟 Assists
                </span>
              </div>

              <div className="space-y-2">
                {assists.map((asst, i) => (
                  <div
                    key={asst.player_id}
                    className="p-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0',
                          i === 0
                            ? 'bg-[#38C958] text-white'
                            : 'bg-white dark:bg-zinc-900 text-zinc-500'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 block truncate uppercase">
                          {asst.character_name || asst.player_name}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {asst.team_name} {asst.full_name ? `• (${asst.full_name})` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 text-[#229a3e] dark:text-[#38C958] font-black text-xs shadow-xs shrink-0">
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
