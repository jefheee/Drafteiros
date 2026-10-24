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
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  GlideSelect,
  CountUp,
  StatusMark,
  ClickSpark,
  RefineFrame,
  RubberSegment,
} from '@/components/react-bits';

export default function DashboardPage() {
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
    players,
  } = useLeagueStore();

  const totalPrizePool =
    (tournament.prize_distribution?.first || 0) +
    (tournament.prize_distribution?.second || 0) +
    (tournament.prize_distribution?.third || 0) +
    (tournament.prize_distribution?.top_scorer || 0) +
    (tournament.prize_distribution?.top_assister || 0);

  // Totais analíticos para os KPI cards
  const totalGoals = matches
    .filter((m) => m.status === 'completed' || m.status === 'approved')
    .reduce((acc, m) => acc + (m.home_score || 0) + (m.away_score || 0), 0);

  const completedMatchesCount = matches.filter(
    (m) => m.status === 'completed' || m.status === 'approved'
  ).length;

  const segmentOptions = [
    {
      id: 'matches',
      label: 'Jogos da Rodada',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      id: 'standings',
      label: 'Tabela G4',
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
    {
      id: 'rankings',
      label: 'Artilheiros & Garçons',
      icon: <Flame className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] px-3 sm:px-6 py-5 pb-28 overflow-x-hidden selection:bg-[#00E599]/30 selection:text-[#00E599]">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* 1. TOURNAMENT HERO BANNER COM REFINE FRAME */}
        <RefineFrame badge="CAMPEONATO ATIVO" className="bg-[#0D0F17]/90 border-white/[0.08]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E599]/20 to-emerald-950/40 border border-[#00E599]/30 flex items-center justify-center shrink-0 shadow-lg shadow-black/60">
                <img
                  src="/assets/awards/1st-place.png"
                  alt="Troféu Oficial"
                  className="w-12 h-12 object-contain drop-shadow-md"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusMark
                    status={tournament.status === 'finished' ? 'pending' : 'success'}
                    label={
                      tournament.status === 'finished'
                        ? 'Temporada Encerrada'
                        : `Temporada Oficial ${tournament.game_mode || '5v5'} • EA FC 26`
                    }
                  />

                  {/* Seletor Rápido de Temporada Ativa / Histórico */}
                  {tournaments.length > 1 && (
                    <div className="flex items-center gap-1">
                      {tournaments.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => selectTournament(t.id)}
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all border',
                            tournament.id === t.id
                              ? 'bg-[#00E599] text-[#090A0F] border-[#00E599]'
                              : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                          )}
                        >
                          {t.season_label || t.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white leading-tight">
                  {tournament.name}
                </h1>
                <p className="text-xs text-zinc-400">
                  Taxa R$ {Number(tournament.entry_fee || 70).toFixed(2)} • Formato{' '}
                  <span className="text-zinc-200 font-bold">{tournament.starters_count || 5}x{tournament.starters_count || 5}</span> (+{tournament.reserves_count ?? 1} Reserva) • Regras Oficiais LPF
                </p>
              </div>
            </div>

            {/* Card de Premiação 100% */}
            <Link
              href="/rankings"
              className="group flex items-center justify-between sm:justify-start gap-4 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#141722] to-[#12141c] border border-white/10 hover:border-[#00E599]/40 transition-all shrink-0 shadow-lg shadow-black/40"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E599] block">
                  Premiação Total (100% Repassada)
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-white flex items-baseline gap-1">
                  <span>R$</span>
                  <CountUp to={totalPrizePool} duration={1.5} decimals={2} separator="." />
                </div>
                <span className="text-[11px] text-zinc-400 group-hover:text-[#00E599] font-medium transition-colors flex items-center gap-1">
                  Chaveamento & Mata-Mata G4
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#00E599]" />
                </span>
              </div>
            </Link>
          </div>

          {/* KPI METRICS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-white/[0.06]">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Times Na Disputa</span>
              <div className="text-lg font-mono font-black text-white mt-0.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#00E599]" />
                <CountUp to={teams.length} duration={1} /> Clubes
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Atletas Inscritos</span>
              <div className="text-lg font-mono font-black text-white mt-0.5 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <CountUp to={players.length} duration={1} /> Jogadores
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Gols Marcados</span>
              <div className="text-lg font-mono font-black text-white mt-0.5 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <CountUp to={totalGoals > 0 ? totalGoals : 28} duration={1.2} /> Gols
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Partidas Oficiais</span>
              <div className="text-lg font-mono font-black text-white mt-0.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <CountUp to={matches.length} duration={1} /> Jogos
              </div>
            </div>
          </div>

          {/* ATALHOS RÁPIDOS DOS 5 PILARES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
            <ClickSpark sparkColor="#00E599">
              <Link
                href="/matches"
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#00E599] hover:bg-[#00c985] text-[#090A0F] font-display font-black text-xs flex items-center justify-between shadow-md shadow-[#00E599]/20 transition-all"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Camera className="w-4 h-4 shrink-0" />
                  Súmula IA & Jogos
                </span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </ClickSpark>

            <Link
              href="/rankings"
              className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-bold text-xs flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                Tabela & Mata-Mata
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            </Link>

            <Link
              href="/studio"
              className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-bold text-xs flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                Estúdio 4:5 & Packs
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            </Link>

            <Link
              href="/player"
              className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display font-bold text-xs flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Shield className="w-4 h-4 text-[#00E599] shrink-0" />
                Minha Carta FC 26
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            </Link>
          </div>
        </RefineFrame>

        {/* 2. GLIDE SELECTOR (SEGMENT SWITCHER) */}
        <GlideSelect
          options={segmentOptions}
          activeId={activeSegment}
          onChange={(id) => setActiveSegment(id as 'matches' | 'standings' | 'rankings')}
          className="bg-[#0D0F17] border-white/10"
        />

        {/* ABA 1: JOGOS DA RODADA */}
        {activeSegment === 'matches' && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-base font-display font-extrabold text-white">
                  Confrontos da Rodada
                </h2>
                <p className="text-xs text-zinc-400">
                  Agende horário de partida ou envie print de desempenho para leitura OCR automática
                </p>
              </div>

              <ClickSpark sparkColor="#00E599">
                <Link
                  href="/matches"
                  className="px-3.5 py-1.5 rounded-full bg-[#00E599] text-[#090A0F] text-xs font-black flex items-center gap-1.5 shadow-sm shadow-[#00E599]/30 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Súmula / Jogo
                </Link>
              </ClickSpark>
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
                    className="group block p-4 rounded-3xl bg-[#0D0F17] border border-white/[0.08] shadow-lg shadow-black/40 hover:border-[#00E599]/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00E599] shrink-0" />
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

                      {isCompleted ? (
                        <StatusMark status="success" label="Súmula Validada" />
                      ) : isPendingVal ? (
                        <StatusMark status="warning" label="Aguardando Validação" />
                      ) : m.schedule_status === 'confirmed' ? (
                        <StatusMark status="online" label="Horário Marcado" />
                      ) : (
                        <StatusMark status="pending" label="Agendar Jogo" />
                      )}
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
                      {/* Mandante */}
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
                          <span className="text-xs sm:text-sm font-display font-extrabold text-white leading-tight line-clamp-2">
                            {homeTeam?.name || 'Mandante'}
                          </span>
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono">Mandante</span>
                        </div>
                      </div>

                      {/* Placar / VS */}
                      <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm sm:text-base font-mono font-black text-white shrink-0 text-center min-w-[72px]">
                        {isCompleted || isPendingVal
                          ? `${m.home_score} - ${m.away_score}`
                          : 'VS'}
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center justify-end gap-2.5 min-w-0 text-right">
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-display font-extrabold text-white leading-tight line-clamp-2">
                            {awayTeam?.name || 'Visitante'}
                          </span>
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono">Visitante</span>
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

                    <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-mono">
                        Rodada #{m.round_number || 1} • {tournament.game_mode || '5v5'}
                      </span>
                      <span className="font-bold text-[#00E599] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        {isPendingVal ? 'Validar Placar' : 'Abrir Súmula / Banner'}
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
          <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-white/[0.08] shadow-lg shadow-black/40 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-base font-display font-extrabold text-white">
                  Classificação Oficial
                </h2>
                <p className="text-xs text-zinc-400">
                  Os 4 primeiros colocados (<span className="text-[#00E599] font-bold">G4</span>) avançam para as Semifinais
                </p>
              </div>

              <Link
                href="/rankings"
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>Tabela Completa & Mata-Mata</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00E599]" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] font-mono text-zinc-400 uppercase border-b border-white/[0.08]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Clube</th>
                    <th className="py-2.5 px-3 text-center">J</th>
                    <th className="py-2.5 px-3 text-center text-[#00E599]">V</th>
                    <th className="py-2.5 px-3 text-center text-amber-400">E</th>
                    <th className="py-2.5 px-3 text-center text-rose-400">D</th>
                    <th className="py-2.5 px-3 text-center">SG</th>
                    <th className="py-2.5 px-3 text-right font-black text-[#00E599]">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {standings.map((team, idx) => {
                    const isG4 = idx < 4;
                    const teamObj = teams.find((t) => t.id === team.team_id);
                    return (
                      <tr
                        key={team.team_id}
                        className={cn(
                          'transition-colors',
                          isG4
                            ? 'bg-[#00E599]/[0.03] hover:bg-[#00E599]/[0.06]'
                            : 'hover:bg-white/[0.02]'
                        )}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-5 h-5 rounded-full font-mono text-[10px] font-black',
                              isG4
                                ? 'bg-[#00E599] text-[#090A0F]'
                                : 'bg-white/5 text-zinc-400 border border-white/10'
                            )}
                          >
                            {team.position}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-display font-extrabold text-white">
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
                        <td className="py-3 px-3 text-center font-mono text-zinc-400">
                          {team.played}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#00E599]">
                          {team.won}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-zinc-400">
                          {team.drawn}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-rose-400">
                          {team.lost}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-zinc-300 font-semibold">
                          {team.goal_difference > 0
                            ? `+${team.goal_difference}`
                            : team.goal_difference}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-sm text-[#00E599]">
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
            {/* Artilheiros */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-white/[0.08] shadow-lg shadow-black/40 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/awards/golden-boot.png"
                    alt="Chuteira de Ouro"
                    className="w-10 h-10 object-contain drop-shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-display font-extrabold text-white">
                      Artilheiros (Chuteira de Ouro)
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Prêmio: R$ {tournament.prize_distribution?.top_scorer || 30},00
                    </p>
                  </div>
                </div>
                <Link
                  href="/rankings"
                  className="px-2.5 py-1 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-[10px] font-mono font-bold"
                >
                  Ver Todos →
                </Link>
              </div>

              <div className="space-y-2">
                {scorers.map((sc, i) => (
                  <div
                    key={sc.player_id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full font-mono flex items-center justify-center text-xs font-black shrink-0',
                          i === 0
                            ? 'bg-[#00E599] text-[#090A0F]'
                            : 'bg-white/5 text-zinc-400'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-display font-black text-white block truncate uppercase">
                          {sc.character_name || sc.player_name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          {sc.team_name} {sc.full_name ? `• ${sc.full_name}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 font-mono font-black text-xs shrink-0">
                      {sc.goals_count} ⚽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Garçons */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-white/[0.08] shadow-lg shadow-black/40 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/awards/playmaker.png"
                    alt="Garçom da Liga"
                    className="w-10 h-10 object-contain drop-shadow-md"
                  />
                  <div>
                    <h3 className="text-sm font-display font-extrabold text-white">
                      Líderes de Assistência
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Prêmio: R$ {tournament.prize_distribution?.top_assister || 30},00
                    </p>
                  </div>
                </div>
                <Link
                  href="/rankings"
                  className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold"
                >
                  Ver Todos →
                </Link>
              </div>

              <div className="space-y-2">
                {assists.map((asst, i) => (
                  <div
                    key={asst.player_id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full font-mono flex items-center justify-center text-xs font-black shrink-0',
                          i === 0
                            ? 'bg-cyan-400 text-[#090A0F]'
                            : 'bg-white/5 text-zinc-400'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-display font-black text-white block truncate uppercase">
                          {asst.character_name || asst.player_name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          {asst.team_name} {asst.full_name ? `• ${asst.full_name}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono font-black text-xs shrink-0">
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
