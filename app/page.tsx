'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import { TEMPLATE_ASSETS } from '@/lib/assets-catalog';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Calendar,
  Sparkles,
  Camera,
  Flame,
  Clock,
  ChevronRight,
  Shield,
  Users,
  Plus,
} from 'lucide-react';

export default function HomePage() {
  const [activeSegment, setActiveSegment] = useState<'matches' | 'standings' | 'rankings'>(
    'matches'
  );
  const {
    tournament,
    tournaments,
    selectTournament,
    standings,
    scorers,
    assists,
    matches,
    teams,
  } = useLeagueStore();

  const totalPrizePool =
    (tournament.prize_distribution?.first || 0) +
    (tournament.prize_distribution?.second || 0) +
    (tournament.prize_distribution?.third || 0) +
    (tournament.prize_distribution?.top_scorer || 0) +
    (tournament.prize_distribution?.top_assister || 0);

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#0c0e12] text-zinc-900 dark:text-[#f1f3f9] px-3 sm:px-6 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* 1. CABEÇALHO DA LIGA + SELETOR DE CAMPEONATO ATIVO / HISTÓRICO */}
        <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {/* Troféu Oficial Transparente (Sem caixa quadrada apertada) */}
              <img
                src="/assets/awards/1st-place.png"
                alt="Troféu Oficial"
                className="w-14 h-14 object-contain drop-shadow-lg shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#38C958] text-[10px] font-extrabold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38C958] animate-pulse" />
                    {tournament.status === 'finished'
                      ? 'Temporada Encerrada (Histórico)'
                      : `Temporada Oficial ${tournament.game_mode || '5v5'} • EA FC 26`}
                  </div>

                  {/* Troca rápida entre Campeonato Ativo e Passado */}
                  {tournaments.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectTournament(t.id)}
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all border',
                        tournament.id === t.id
                          ? 'bg-[#7C5CFC] text-white border-transparent'
                          : 'bg-[#F5F6FA] dark:bg-[#1c2029] text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10'
                      )}
                    >
                      {t.season_label || t.name}
                    </button>
                  ))}
                </div>

                <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-zinc-900 dark:text-white leading-snug">
                  {tournament.name}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Inscrição R$ {Number(tournament.entry_fee || 70).toFixed(2)} •{' '}
                  {tournament.starters_count || 5} Titulares + {tournament.reserves_count ?? 1}{' '}
                  Reserva
                </p>
              </div>
            </div>

            <Link
              href="/rankings"
              className="flex items-center justify-between sm:justify-start gap-3 px-4 py-3 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] border border-zinc-200/70 dark:border-white/10 hover:border-[#7C5CFC]/50 transition-all shrink-0"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                  Premiação 100% (Sem Taxa)
                </span>
                <span className="text-base sm:text-lg font-mono font-black text-zinc-900 dark:text-white">
                  R$ {totalPrizePool.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-[#38C958] font-bold block">
                  Ver Tabela Completa & Mata-Mata G4 →
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </Link>
          </div>

          {/* Atalhos Rápidos dos 5 Pilares */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
            <Link
              href="/matches"
              className="py-3 px-3.5 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-display font-extrabold text-xs flex items-center justify-between shadow-sm transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Camera className="w-4 h-4 shrink-0" />
                Súmula IA & Jogos
              </span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <Link
              href="/rankings"
              className="py-3 px-3.5 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white font-display font-extrabold text-xs flex items-center justify-between shadow-sm transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Trophy className="w-4 h-4 shrink-0" />
                Tabela & Mata-Mata
              </span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <Link
              href="/studio"
              className="py-3 px-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] hover:border-[#7C5CFC]/40 border border-transparent text-zinc-800 dark:text-zinc-200 font-display font-extrabold text-xs flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                Estúdio 4:5 & Packs
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </Link>

            <Link
              href="/player"
              className="py-3 px-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] hover:border-[#7C5CFC]/40 border border-transparent text-zinc-800 dark:text-zinc-200 font-display font-extrabold text-xs flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Shield className="w-4 h-4 text-[#38C958] shrink-0" />
                Minha Carta FC 26
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </Link>
          </div>
        </section>

        {/* 2. SELETOR SEGMENTADO */}
        <div className="p-1.5 rounded-2xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-xs grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSegment('matches')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeSegment === 'matches'
                ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Jogos da Rodada</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('standings')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeSegment === 'standings'
                ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Resumo Tabela G4</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('rankings')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeSegment === 'rankings'
                ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Top 3 Artilheiros & Garçons</span>
          </button>
        </div>

        {/* ABA 1: JOGOS DA RODADA */}
        {activeSegment === 'matches' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-base font-display font-extrabold text-zinc-900 dark:text-white">
                  Confrontos da Rodada
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Agende horário ou valide a súmula por foto via Gemini Vision
                </p>
              </div>
              <Link
                href="/matches"
                className="px-3.5 py-2 rounded-full bg-[#7C5CFC] text-white text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Súmula / Jogo
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {matches.map((m) => {
                const isCompleted = m.status === 'completed' || m.status === 'approved';
                const isPendingVal = m.status === 'pending_validation';
                const homeTeam = m.home_team || teams.find((t) => t.id === m.home_team_id);
                const awayTeam = m.away_team || teams.find((t) => t.id === m.away_team_id);

                return (
                  <Link
                    key={m.id}
                    href="/matches"
                    className="block p-4 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm hover:border-[#7C5CFC]/50 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
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
                          isCompleted && 'bg-[#38C958]/15 text-[#38C958]',
                          isPendingVal && 'bg-amber-500/15 text-amber-400',
                          !isCompleted && !isPendingVal && 'bg-[#7C5CFC]/15 text-[#7C5CFC]'
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

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={homeTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder}
                          alt={homeTeam?.name || 'Mandante'}
                          className="w-11 h-11 object-contain drop-shadow-md shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              TEMPLATE_ASSETS.crestPlaceholder;
                          }}
                        />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-display font-extrabold text-zinc-900 dark:text-white leading-tight line-clamp-2">
                            {homeTeam?.name || 'Mandante'}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">Mandante</span>
                        </div>
                      </div>

                      <div className="px-3.5 py-1.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] text-sm sm:text-base font-mono font-black text-zinc-900 dark:text-white shrink-0 text-center min-w-[72px]">
                        {isCompleted || isPendingVal
                          ? `${m.home_score} - ${m.away_score}`
                          : 'VS'}
                      </div>

                      <div className="flex items-center justify-end gap-2.5 min-w-0 text-right">
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-display font-extrabold text-zinc-900 dark:text-white leading-tight line-clamp-2">
                            {awayTeam?.name || 'Visitante'}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">Visitante</span>
                        </div>
                        <img
                          src={awayTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder}
                          alt={awayTeam?.name || 'Visitante'}
                          className="w-11 h-11 object-contain drop-shadow-md shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              TEMPLATE_ASSETS.crestPlaceholder;
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 dark:text-zinc-400">
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

        {/* ABA 2: RESUMO TABELA DE CLASSIFICAÇÃO */}
        {activeSegment === 'standings' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-display font-extrabold text-zinc-900 dark:text-white">
                  Classificação Oficial
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Top 4 (<span className="text-[#38C958] font-extrabold">G4</span>) avançam às Semifinais
                </p>
              </div>
              <Link
                href="/rankings"
                className="px-3.5 py-1.5 rounded-full bg-[#7C5CFC] text-white text-xs font-extrabold flex items-center gap-1 shrink-0"
              >
                <span>Abrir Tabela Completa & Mata-Mata</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] font-mono text-zinc-400 uppercase border-b border-zinc-100 dark:border-white/[0.07]">
                  <tr>
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">Clube</th>
                    <th className="py-2.5 px-2 text-center">J</th>
                    <th className="py-2.5 px-2 text-center text-[#38C958]">V</th>
                    <th className="py-2.5 px-2 text-center text-amber-400">E</th>
                    <th className="py-2.5 px-2 text-center text-rose-400">D</th>
                    <th className="py-2.5 px-2 text-center">SG</th>
                    <th className="py-2.5 px-2 text-right font-extrabold text-[#7C5CFC]">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {standings.map((team, idx) => {
                    const isG4 = idx < 4;
                    const teamObj = teams.find((t) => t.id === team.team_id);
                    return (
                      <tr
                        key={team.team_id}
                        className={cn(
                          'transition-colors',
                          isG4
                            ? 'bg-[#38C958]/[0.04]'
                            : 'hover:bg-zinc-50 dark:hover:bg-[#1c2029]/40'
                        )}
                      >
                        <td className="py-3 px-2">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-5 h-5 rounded-full font-mono text-[10px] font-extrabold',
                              isG4
                                ? 'bg-[#38C958] text-white'
                                : 'bg-[#F5F6FA] dark:bg-[#1c2029] text-zinc-500'
                            )}
                          >
                            {team.position}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-display font-extrabold text-zinc-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                team.logo_url ||
                                teamObj?.logo_url ||
                                TEMPLATE_ASSETS.crestPlaceholder
                              }
                              alt={team.team_name}
                              className="w-6 h-6 object-contain drop-shadow-sm shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  TEMPLATE_ASSETS.crestPlaceholder;
                              }}
                            />
                            <span className="leading-tight">{team.team_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-zinc-500 font-semibold">
                          {team.played}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-[#38C958]">
                          {team.won}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-zinc-500">
                          {team.drawn}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-rose-400">
                          {team.lost}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-zinc-600 dark:text-zinc-400 font-semibold">
                          {team.goal_difference > 0
                            ? `+${team.goal_difference}`
                            : team.goal_difference}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-black text-sm text-[#7C5CFC]">
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

        {/* ABA 3: TOP ARTILHEIROS E GARÇONS */}
        {activeSegment === 'rankings' && (
          <section className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/awards/golden-boot.png"
                    alt="Chuteira de Ouro"
                    className="w-10 h-10 object-contain drop-shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-display font-extrabold text-zinc-900 dark:text-white">
                      Artilheiros (Character Name)
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Prêmio: R$ {tournament.prize_distribution?.top_scorer || 30},00
                    </p>
                  </div>
                </div>
                <Link
                  href="/rankings"
                  className="px-2.5 py-1 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] text-[10px] font-extrabold"
                >
                  Ver Pódio →
                </Link>
              </div>

              <div className="space-y-2">
                {scorers.map((sc, i) => (
                  <div
                    key={sc.player_id}
                    className="p-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full font-mono flex items-center justify-center text-xs font-extrabold shrink-0',
                          i === 0
                            ? 'bg-[#7C5CFC] text-white'
                            : 'bg-white dark:bg-[#161920] text-zinc-500'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-display font-black text-zinc-900 dark:text-white block truncate uppercase">
                          {sc.character_name || sc.player_name}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                          {sc.team_name} {sc.full_name ? `• (${sc.full_name})` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white dark:bg-[#161920] text-[#38C958] font-mono font-black text-xs shadow-xs shrink-0">
                      {sc.goals_count} ⚽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/awards/playmaker.png"
                    alt="Garçom"
                    className="w-10 h-10 object-contain drop-shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-display font-extrabold text-zinc-900 dark:text-white">
                      Líderes de Assistência
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Prêmio: R$ {tournament.prize_distribution?.top_assister || 30},00
                    </p>
                  </div>
                </div>
                <Link
                  href="/rankings"
                  className="px-2.5 py-1 rounded-full bg-[#38C958]/15 text-[#38C958] text-[10px] font-extrabold"
                >
                  Ver Pódio →
                </Link>
              </div>

              <div className="space-y-2">
                {assists.map((asst, i) => (
                  <div
                    key={asst.player_id}
                    className="p-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full font-mono flex items-center justify-center text-xs font-extrabold shrink-0',
                          i === 0
                            ? 'bg-[#38C958] text-white'
                            : 'bg-white dark:bg-[#161920] text-zinc-500'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-display font-black text-zinc-900 dark:text-white block truncate uppercase">
                          {asst.character_name || asst.player_name}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                          {asst.team_name} {asst.full_name ? `• (${asst.full_name})` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white dark:bg-[#161920] text-[#7C5CFC] font-mono font-black text-xs shadow-xs shrink-0">
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
