'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import { TEMPLATE_ASSETS } from '@/lib/assets-catalog';
import { FC26PlayerCard } from '@/components/players/fc26-player-card';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Calendar,
  Flame,
  Wallet,
  Crown,
  ChevronRight,
  Sparkles,
  X,
  Shield,
  Users,
} from 'lucide-react';

export default function RankingsAndBracketPage() {
  const { tournament, tournaments, selectTournament, teams, players, matches } =
    useLeagueStore();

  const [selectedPlayerForCardId, setSelectedPlayerForCardId] = useState<string | null>(
    null
  );

  const isPastTournament = tournament?.status === 'finished';

  // Ordenação oficial 100% real da Tabela de Classificação (começa zerada)
  const sortedStandings = useMemo(() => {
    const normalized = teams.map((t) => ({
      ...t,
      points: t.points ?? t.standings?.points ?? 0,
      matches_played: t.matches_played ?? t.standings?.played ?? 0,
      wins: t.wins ?? t.standings?.wins ?? 0,
      draws: t.draws ?? t.standings?.draws ?? 0,
      losses: t.losses ?? t.standings?.losses ?? 0,
      goals_for: t.goals_for ?? t.standings?.gf ?? 0,
      goals_against: t.goals_against ?? t.standings?.ga ?? 0,
      form: [] as ('V' | 'E' | 'D')[],
    }));

    return [...normalized].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      const sgA = a.goals_for - a.goals_against;
      const sgB = b.goals_for - b.goals_against;
      if (sgB !== sgA) return sgB - sgA;
      return b.goals_for - a.goals_for;
    });
  }, [teams]);

  const g1 = sortedStandings[0] || null;
  const g2 = sortedStandings[1] || null;
  const g3 = sortedStandings[2] || null;
  const g4 = sortedStandings[3] || null;

  const totalGoals = useMemo(() => {
    return sortedStandings.reduce((acc, t) => acc + (t.goals_for || 0), 0);
  }, [sortedStandings]);

  const totalMatchesPlayed = useMemo(() => {
    const completed = matches.filter(
      (m) => m.status === 'approved' || m.status === 'completed'
    ).length;
    if (completed > 0) return completed;
    return Math.round(
      sortedStandings.reduce((acc, t) => acc + (t.matches_played || 0), 0) / 2
    );
  }, [sortedStandings, matches]);

  const avgGoalsPerMatch =
    totalMatchesPlayed > 0
      ? (totalGoals / totalMatchesPlayed).toFixed(1)
      : '0.0';

  const prizePoolTotal = useMemo(() => {
    const pd = tournament?.prize_distribution;
    if (pd) {
      return (
        (pd.first || 0) +
        (pd.second || 0) +
        (pd.third || 0) +
        (pd.top_scorer || 0) +
        (pd.top_assister || 0)
      );
    }
    return teams.length * Number(tournament?.entry_fee || 0);
  }, [tournament, teams.length]);

  const topScorers = useMemo(() => {
    return [...players]
      .sort(
        (a, b) =>
          (b.career_stats?.goals ?? b.career_stats?.official_goals ?? 0) -
          (a.career_stats?.goals ?? a.career_stats?.official_goals ?? 0)
      )
      .slice(0, 5);
  }, [players]);

  const topPlaymakers = useMemo(() => {
    return [...players]
      .sort(
        (a, b) =>
          (b.career_stats?.assists ?? b.career_stats?.official_assists ?? 0) -
          (a.career_stats?.assists ?? a.career_stats?.official_assists ?? 0)
      )
      .slice(0, 5);
  }, [players]);

  const topMvps = useMemo(() => {
    return [...players]
      .sort(
        (a, b) =>
          (b.career_stats?.mvps ?? b.career_stats?.official_motm ?? 0) -
          (a.career_stats?.mvps ?? a.career_stats?.official_motm ?? 0)
      )
      .slice(0, 5);
  }, [players]);

  const inspectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerForCardId) || null,
    [players, selectedPlayerForCardId]
  );

  const getCaptainTag = (teamId: string) => {
    const cap = players.find((p) => p.team_id === teamId);
    if (cap?.character_name) return `@${cap.character_name.toLowerCase()}`;
    return 'Capitão';
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-6">
        {/* 1. TOPO: SELETOR DE CAMPEONATO ATIVO & RESUMO */}
        <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                  Tabela & Rankings Oficiais
                </span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                    isPastTournament
                      ? 'bg-white/[0.06] text-zinc-300 border-white/15'
                      : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                  )}
                >
                  {isPastTournament ? 'Temporada Encerrada' : 'Temporada Ativa • G4 Playoffs'}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-display font-black tracking-tight text-white">
                {tournament?.name || 'DraftClub — Liga Oficial EA FC 26'}
              </h1>
              <p className="text-xs text-zinc-400">
                Classificação real atualizada por súmula, chaveamento G4 e líderes de estatísticas.
              </p>
            </div>

            {tournaments.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                {tournaments.map((t) => {
                  const active = tournament?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectTournament(t.id)}
                      className={cn(
                        'px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border',
                        active
                          ? 'bg-white text-black border-white'
                          : 'bg-[#141414] text-zinc-300 border-white/10 hover:border-white/30'
                      )}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{t.season_label || t.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Clubes Inscritos
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-white">
                  {teams.length} CLUBES
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {players.length} atletas cadastrados
                </span>
              </div>
              <Calendar className="w-6 h-6 text-zinc-400" />
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Gols Marcados
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-white">
                  {totalGoals} GOLS
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  Em {totalMatchesPlayed} partidas oficiais
                </span>
              </div>
              <Trophy className="w-6 h-6 text-zinc-400" />
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Média de Gols / Jogo
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-white">
                  {avgGoalsPerMatch} G/J
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  Estatística oficial
                </span>
              </div>
              <Flame className="w-6 h-6 text-zinc-400" />
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Prize Pool Oficial
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-[#10B981]">
                  R$ {prizePoolTotal.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  100% Repasse aos Campeões
                </span>
              </div>
              <Wallet className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </section>

        {/* 2. GRID PRINCIPAL: TABELA DE CLASSIFICAÇÃO + MATA-MATA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-display font-black text-white">
                  Tabela de Classificação Oficial
                </h2>
                <p className="text-xs text-zinc-400">
                  Os 4 primeiros avançam às Semifinais (1º vs 4º e 2º vs 3º)
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Zona G4 (Playoffs)
                </span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-zinc-700" />
                  Demais Colocações
                </span>
              </div>
            </div>

            {sortedStandings.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center mx-auto">
                  <Shield className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    Nenhum clube inscrito na tabela ainda
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Assim que os capitães cadastrarem suas equipes na liga, a tabela de classificação aparecerá aqui iniciando com pontuação zerada.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
                >
                  Criar Clube ou Conta
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-[#141414]">
                      <th className="py-3 pl-4 pr-2 w-12">POS</th>
                      <th className="py-3 px-3">CLUBE & CAPITÃO</th>
                      <th className="py-3 px-2.5 text-center text-white">PTS</th>
                      <th className="py-3 px-2 text-center">J</th>
                      <th className="py-3 px-2 text-center">V</th>
                      <th className="py-3 px-2 text-center">E</th>
                      <th className="py-3 px-2 text-center">D</th>
                      <th className="py-3 px-2 text-center">GP</th>
                      <th className="py-3 px-2 text-center">GC</th>
                      <th className="py-3 px-2 text-center">SG</th>
                      <th className="py-3 pl-2 pr-4 text-center">FORMA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs">
                    {sortedStandings.map((team, idx) => {
                      const pos = idx + 1;
                      const isG4 = pos <= 4;
                      const sg = (team.goals_for || 0) - (team.goals_against || 0);

                      return (
                        <tr
                          key={team.id}
                          className="transition-colors hover:bg-[#141414]/70"
                        >
                          <td className="py-3.5 pl-4 pr-2 relative font-mono font-black">
                            <span
                              className={cn(
                                'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full',
                                isG4 ? 'bg-[#10B981]' : 'bg-transparent'
                              )}
                            />
                            <span
                              className={cn(
                                'inline-flex w-6 h-6 rounded-lg items-center justify-center text-xs',
                                isG4
                                  ? 'bg-white/10 text-white font-black'
                                  : 'text-zinc-500'
                              )}
                            >
                              {pos}º
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={team.logo_url || TEMPLATE_ASSETS.crestPlaceholder}
                                alt={team.name}
                                className="w-8 h-8 object-contain shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = TEMPLATE_ASSETS.crestPlaceholder;
                                }}
                              />
                              <div className="min-w-0">
                                <span className="font-display font-bold text-white truncate block">
                                  {team.name}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500 block">
                                  {getCaptainTag(team.id)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-2.5 text-center font-mono font-black text-sm text-white tabular-nums">
                            {team.points}
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono text-zinc-300 tabular-nums">
                            {team.matches_played}
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono font-bold text-[#10B981] tabular-nums">
                            {team.wins}
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono text-zinc-400 tabular-nums">
                            {team.draws}
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono text-zinc-500 tabular-nums">
                            {team.losses}
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono text-zinc-300 tabular-nums">
                            {team.goals_for}
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono text-zinc-300 tabular-nums">
                            {team.goals_against}
                          </td>
                          <td
                            className={cn(
                              'py-3.5 px-2 text-center font-mono font-bold tabular-nums',
                              sg > 0 ? 'text-[#10B981]' : sg < 0 ? 'text-zinc-500' : 'text-zinc-400'
                            )}
                          >
                            {sg > 0 ? `+${sg}` : sg}
                          </td>

                          <td className="py-3.5 pl-2 pr-4">
                            <div className="flex items-center justify-center gap-1">
                              {(team.form && team.form.length > 0 ? team.form : ['-']).map((res, fIdx) => (
                                <span
                                  key={fIdx}
                                  className={cn(
                                    'w-5 h-5 rounded-full font-mono text-[9px] font-bold flex items-center justify-center',
                                    res === 'V'
                                      ? 'bg-[#10B981]/20 text-[#10B981]'
                                      : res === 'E'
                                      ? 'bg-white/10 text-zinc-300'
                                      : res === 'D'
                                      ? 'bg-white/5 text-zinc-500'
                                      : 'bg-white/5 text-zinc-600'
                                  )}
                                >
                                  {res}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* VISUALIZADOR DE CHAVEAMENTO MATA-MATA G4 */}
          <aside className="lg:col-span-4 p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Playoffs Oficial G4
                </span>
                <h2 className="text-base font-display font-black text-white">
                  Chaveamento Mata-Mata
                </h2>
              </div>
              <Crown className="w-5 h-5 text-zinc-300" />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-zinc-400">
                <span>Semifinal A (1º vs 4º)</span>
                <span>Ida & Volta</span>
              </div>

              <div className="space-y-1.5">
                <div className="p-2.5 rounded-xl bg-black border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#10B981]">1º</span>
                    <span className="text-xs font-bold text-white truncate">
                      {g1?.name || 'A definir (1º G4)'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-zinc-400">-</span>
                </div>

                <div className="p-2.5 rounded-xl bg-black border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">4º</span>
                    <span className="text-xs font-bold text-white truncate">
                      {g4?.name || 'A definir (4º G4)'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-zinc-400">-</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-zinc-400">
                <span>Semifinal B (2º vs 3º)</span>
                <span>Ida & Volta</span>
              </div>

              <div className="space-y-1.5">
                <div className="p-2.5 rounded-xl bg-black border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#10B981]">2º</span>
                    <span className="text-xs font-bold text-white truncate">
                      {g2?.name || 'A definir (2º G4)'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-zinc-400">-</span>
                </div>

                <div className="p-2.5 rounded-xl bg-black border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">3º</span>
                    <span className="text-xs font-bold text-white truncate">
                      {g3?.name || 'A definir (3º G4)'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-zinc-400">-</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-white/15 space-y-2.5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase">
                <Crown className="w-3.5 h-3.5" />
                Grande Final Oficial
              </div>

              <div className="flex items-center justify-around py-2">
                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                  Vencedor Semi A
                </span>
                <span className="font-mono font-black text-sm text-zinc-400">VS</span>
                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                  Vencedor Semi B
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* 3. LÍDERES DE ESTATÍSTICAS DA TEMPORADA */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Rankings Individuais • Toque em qualquer atleta para inspecionar a Carta FC 26
              </span>
              <h2 className="text-lg sm:text-xl font-display font-black text-white">
                Líderes da Temporada (Artilharia, Assistências & MVPs)
              </h2>
            </div>
            <Link
              href="/player"
              className="text-xs font-bold text-white hover:underline flex items-center gap-1"
            >
              Ver Minha Carta FC 26 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {players.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center space-y-2">
              <Users className="w-6 h-6 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">
                Nenhum atleta registrado no ranking ainda
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Os rankings de Artilharia, Assistências e MVPs serão preenchidos automaticamente conforme os jogadores criarem suas contas e disputarem partidas oficiais.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* ARTILHEIROS */}
              <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Chuteira de Ouro
                  </span>
                  <h3 className="text-base font-display font-black text-white">
                    Artilheiros da Liga
                  </h3>
                </div>

                <div className="space-y-2">
                  {topScorers.map((p, idx) => {
                    const pTeam = teams.find((t) => t.id === p.team_id);
                    const goals = p.career_stats?.goals ?? p.career_stats?.official_goals ?? 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlayerForCardId(p.id)}
                        className="w-full p-2.5 rounded-2xl bg-[#141414] hover:border-white/30 border border-white/[0.06] transition-all flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0',
                              idx === 0
                                ? 'bg-white text-black'
                                : 'bg-black text-zinc-400'
                            )}
                          >
                            {idx + 1}
                          </span>
                          <img
                            src={p.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                            alt={p.character_name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-display font-bold text-white uppercase block truncate">
                              {p.character_name}
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate block">
                              {pTeam?.name || 'Free Agent'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-mono font-black text-white block tabular-nums">
                            {goals} G
                          </span>
                          <span className="text-[9px] text-zinc-500">Ver Carta</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ASSISTÊNCIAS */}
              <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Playmaker
                  </span>
                  <h3 className="text-base font-display font-black text-white">
                    Líderes de Assistências
                  </h3>
                </div>

                <div className="space-y-2">
                  {topPlaymakers.map((p, idx) => {
                    const pTeam = teams.find((t) => t.id === p.team_id);
                    const assists =
                      p.career_stats?.assists ?? p.career_stats?.official_assists ?? 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlayerForCardId(p.id)}
                        className="w-full p-2.5 rounded-2xl bg-[#141414] hover:border-white/30 border border-white/[0.06] transition-all flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0',
                              idx === 0
                                ? 'bg-white text-black'
                                : 'bg-black text-zinc-400'
                            )}
                          >
                            {idx + 1}
                          </span>
                          <img
                            src={p.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                            alt={p.character_name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-display font-bold text-white uppercase block truncate">
                              {p.character_name}
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate block">
                              {pTeam?.name || 'Free Agent'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-mono font-black text-white block tabular-nums">
                            {assists} A
                          </span>
                          <span className="text-[9px] text-zinc-500">Ver Carta</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MVPs */}
              <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Man of the Match
                  </span>
                  <h3 className="text-base font-display font-black text-white">
                    Ranking de MVPs
                  </h3>
                </div>

                <div className="space-y-2">
                  {topMvps.map((p, idx) => {
                    const pTeam = teams.find((t) => t.id === p.team_id);
                    const mvps = p.career_stats?.mvps ?? p.career_stats?.official_motm ?? 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlayerForCardId(p.id)}
                        className="w-full p-2.5 rounded-2xl bg-[#141414] hover:border-white/30 border border-white/[0.06] transition-all flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0',
                              idx === 0
                                ? 'bg-white text-black'
                                : 'bg-black text-zinc-400'
                            )}
                          >
                            {idx + 1}
                          </span>
                          <img
                            src={p.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                            alt={p.character_name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-display font-bold text-white uppercase block truncate">
                              {p.character_name}
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate block">
                              {pTeam?.name || 'Free Agent'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-mono font-black text-white block tabular-nums">
                            {mvps} MVP
                          </span>
                          <span className="text-[9px] text-zinc-500">Ver Carta</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* MODAL DE INSPEÇÃO DA CARTA FC 26 DO ATLETA */}
        {inspectedPlayer && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPlayerForCardId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-[#0A0A0A] border border-white/15 p-6 text-center space-y-4 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedPlayerForCardId(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#141414] flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white text-xs font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Carta Oficial EA FC 26
              </div>

              <FC26PlayerCard
                player={inspectedPlayer}
                team={teams.find((t) => t.id === inspectedPlayer.team_id)}
                size="md"
                showActions={true}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
