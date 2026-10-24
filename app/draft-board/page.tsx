'use client';

import React, { useState, useMemo } from 'react';
import { useLeagueStore } from '@/lib/data-store';
import { ARCHETYPE_ASSETS, TEMPLATE_ASSETS } from '@/lib/assets-catalog';
import { DraftOrderSlot } from '@/types/database';
import { WorkspaceNav } from '@/components/layout/workspace-nav';
import { FC26PlayerCard } from '@/components/players/fc26-player-card';
import { cn } from '@/lib/utils';
import { HoloCard, Stepper, StatusMark, ClickSpark } from '@/components/react-bits';
import {
  Dices,
  Search,
  UserPlus,
  CheckCircle2,
  Crown,
  Sparkles,
  X,
} from 'lucide-react';

export default function OfficialDraftBoardPage() {
  const {
    players,
    teams,
    tournament,
    draftPlayerToTeam,
    updateTournamentInStore,
  } = useLeagueStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<
    'all' | 'free_agents' | 'drafted'
  >('all');

  const [mounted, setMounted] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    teams[0]?.id || 'b3333333-3333-3333-3333-333333333333'
  );
  const [currentPickIndex, setCurrentPickIndex] = useState<number>(0);
  const [draftFeedback, setDraftFeedback] = useState<string | null>(null);
  const [isDrawingLottery, setIsDrawingLottery] = useState(false);
  const [inspectedPlayerId, setInspectedPlayerId] = useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const draftOrder: DraftOrderSlot[] = useMemo(() => {
    if (tournament.draft_order && tournament.draft_order.length > 0) {
      return tournament.draft_order;
    }
    const r1: DraftOrderSlot[] = teams.map((t, i) => ({
      pick_number: i + 1,
      round: 1,
      team_id: t.id,
      team_name: t.name,
      captain_name: `Capitão ${t.name}`,
    }));
    const r2: DraftOrderSlot[] = [...teams].reverse().map((t, i) => ({
      pick_number: teams.length + i + 1,
      round: 2,
      team_id: t.id,
      team_name: t.name,
      captain_name: `Capitão ${t.name}`,
    }));
    return [...r1, ...r2];
  }, [tournament.draft_order, teams]);

  const activePickSlot = draftOrder[currentPickIndex] || draftOrder[0];

  const handleRunDraftLottery = async () => {
    setIsDrawingLottery(true);
    try {
      const shuffledTeams = [...teams];
      for (let i = shuffledTeams.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
          const randArr = new Uint32Array(1);
          window.crypto.getRandomValues(randArr);
          j = randArr[0] % (i + 1);
        }
        const temp = shuffledTeams[i];
        shuffledTeams[i] = shuffledTeams[j];
        shuffledTeams[j] = temp;
      }

      const round1: DraftOrderSlot[] = shuffledTeams.map((t, idx) => ({
        pick_number: idx + 1,
        round: 1,
        team_id: t.id,
        team_name: t.name,
        captain_name: `Capitão ${t.name}`,
      }));

      const round2: DraftOrderSlot[] = [...shuffledTeams]
        .reverse()
        .map((t, idx) => ({
          pick_number: shuffledTeams.length + idx + 1,
          round: 2,
          team_id: t.id,
          team_name: t.name,
          captain_name: `Capitão ${t.name}`,
        }));

      const newOrder = [...round1, ...round2];

      await updateTournamentInStore({
        draft_order: newOrder,
      });

      setCurrentPickIndex(0);
      if (newOrder[0]) {
        setSelectedTeamId(newOrder[0].team_id || newOrder[0].teamId || 'team-furia');
      }

      setDraftFeedback(
        `🎲 Sorteio Snake Draft Concluído! Pick #1: ${newOrder[0]?.team_name || newOrder[0]?.teamName} • Pick #2: ${newOrder[1]?.team_name || newOrder[1]?.teamName}.`
      );
      setTimeout(() => setDraftFeedback(null), 5000);
    } finally {
      setIsDrawingLottery(false);
    }
  };

  const handleDraftPlayer = async (playerId: string, characterName: string) => {
    const targetId = activePickSlot?.team_id || activePickSlot?.teamId || selectedTeamId;
    const targetTeam = teams.find((t) => t.id === targetId) || teams[0];

    await draftPlayerToTeam(playerId, targetTeam.id);

    setDraftFeedback(
      `✅ "${characterName}" foi draftado oficialmente para o elenco do ${targetTeam.name}!`
    );

    if (currentPickIndex + 1 < draftOrder.length) {
      const nextIdx = currentPickIndex + 1;
      setCurrentPickIndex(nextIdx);
      setSelectedTeamId(draftOrder[nextIdx].team_id || draftOrder[nextIdx].teamId || 'team-furia');
    }

    setTimeout(() => setDraftFeedback(null), 4000);
  };

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesQuery =
        !searchQuery.trim() ||
        p.character_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.archetype?.toLowerCase().includes(searchQuery.toLowerCase());

      const pPos = p.primary_position || '';
      const matchesPos =
        posFilter === 'ALL' ||
        (posFilter === 'ATK' && ['ST', 'LW', 'RW', 'ATA'].includes(pPos)) ||
        (posFilter === 'MID' && ['CAM', 'CM', 'CDM', 'MEI', 'MC', 'VOL'].includes(pPos)) ||
        (posFilter === 'DEF' && ['LB', 'RB', 'CB', 'ZAG', 'LD', 'LE'].includes(pPos)) ||
        (posFilter === 'GK' && pPos === 'GK') ||
        pPos === posFilter;

      const matchesAvail =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'free_agents' && p.is_free_agent) ||
        (availabilityFilter === 'drafted' && !p.is_free_agent);

      return matchesQuery && matchesPos && matchesAvail;
    });
  }, [players, searchQuery, posFilter, availabilityFilter]);

  const freeAgentsCount = useMemo(
    () => players.filter((p) => p.is_free_agent).length,
    [players]
  );

  const inspectedPlayer = useMemo(
    () => players.find((p) => p.id === inspectedPlayerId) || null,
    [players, inspectedPlayerId]
  );

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] px-3 sm:px-6 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* SUB-NAVEGAÇÃO RÁPIDA DO PILAR 5 (MEU ESPAÇO) */}
        <WorkspaceNav />

        {/* CABEÇALHO DA SALA DE DRAFT OFICIAL */}
        <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-[10px] font-extrabold uppercase"
                  suppressHydrationWarning
                >
                  Pool Oficial: {mounted ? players.length : 19} Atletas Cadastrados
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#38C958] text-[10px] font-extrabold"
                  suppressHydrationWarning
                >
                  {mounted ? freeAgentsCount : 0} Livres no Mercado
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-white">
                Sala de Draft Oficial & Mercadão (+40 Jogadores)
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ordem Snake Draft sorteada por IA • Inspecione a Carta FC 26 de qualquer jogador antes de draftar!
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunDraftLottery}
              disabled={isDrawingLottery}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#059669] hover:opacity-95 text-white font-display font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00E599]/20 shrink-0"
            >
              <Dices className="w-4 h-4" />
              <span>
                {isDrawingLottery
                  ? 'Sorteando Fila Snake...'
                  : '🎲 Sortear Ordem dos Capitães (IA Lottery)'}
              </span>
            </button>
          </div>

          {draftFeedback && (
            <div className="p-3 rounded-2xl bg-[#38C958]/15 border border-[#38C958]/40 text-[#38C958] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{draftFeedback}</span>
            </div>
          )}

          {/* Fila Snake Draft Ao Vivo */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#00E599] flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                Ordem Oficial de Escolha (Snake Draft: Rodada 1 ➔ Rodada 2)
              </span>
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                Na vez:{' '}
                <strong className="text-[#38C958]">
                  {activePickSlot?.team_name || activePickSlot?.teamName || 'Furia del Plata'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {draftOrder.map((slot, idx) => {
                const isCurrentTurn = idx === currentPickIndex;
                const pickNum = slot.pick_number ?? slot.pickOrder ?? idx + 1;
                const roundNum = slot.round ?? (idx < teams.length ? 1 : 2);
                const tName = slot.team_name || slot.teamName || 'Time';
                const tId = slot.team_id || slot.teamId || 'team-furia';
                return (
                  <button
                    key={`${roundNum}-${pickNum}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCurrentPickIndex(idx);
                      setSelectedTeamId(tId);
                    }}
                    className={cn(
                      'px-3 py-2 rounded-2xl border text-left shrink-0 transition-all',
                      isCurrentTurn
                        ? 'border-[#38C958] bg-[#38C958]/15 shadow-xs'
                        : 'border-zinc-200 dark:border-white/10 bg-white/[0.03] opacity-85'
                    )}
                  >
                    <span className="text-[9px] font-mono font-black uppercase text-[#00E599] block">
                      Pick #{pickNum} • R{roundNum}
                    </span>
                    <span className="text-xs font-extrabold text-white block truncate max-w-[130px]">
                      {tName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FILTROS DE BUSCA E POSIÇÃO */}
        <section className="p-4 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-xs space-y-3">
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por Nome do Personagem (ex: JEFHE, HAALANDINHO)..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-bold"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'all', label: `Todos (${mounted ? players.length : 19})` },
                  { id: 'free_agents', label: `Livres (${mounted ? freeAgentsCount : 0})` },
                  { id: 'drafted', label: 'Com Clube' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAvailabilityFilter(tab.id)}
                  suppressHydrationWarning
                  className={cn(
                    'flex-1 h-10 px-2 rounded-xl text-[11px] font-extrabold transition-all',
                    availabilityFilter === tab.id
                      ? 'bg-[#00E599] text-[#090A0F] font-black'
                      : 'bg-white/[0.03] text-zinc-600 dark:text-zinc-300'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: 'ALL', label: 'Todas Posições' },
              { id: 'ATK', label: 'Atacantes (ATA/ST)' },
              { id: 'MID', label: 'Meias (MEI/MC/VOL)' },
              { id: 'DEF', label: 'Defensores (ZAG/LD/LE)' },
              { id: 'GK', label: 'Goleiros (GK)' },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => setPosFilter(pos.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 transition-all',
                  posFilter === pos.id
                    ? 'bg-[#38C958] text-white'
                    : 'bg-white/[0.03] text-zinc-600 dark:text-zinc-300'
                )}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </section>

        {/* LISTA DE ATLETAS (+40 JOGADORES) */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const currentClub = teams.find((t) => t.id === player.team_id);
            const archAsset =
              ARCHETYPE_ASSETS.find(
                (a) =>
                  a.name.toLowerCase() === (player.archetype || '').toLowerCase() ||
                  a.id === player.archetype
              ) || ARCHETYPE_ASSETS[0];

            const stats = player.career_stats || {};
            const matchesPlayed = stats.matches_played ?? stats.official_matches ?? 10;
            const goalsScored = stats.goals ?? stats.official_goals ?? 6;
            const assistsMade = stats.assists ?? stats.official_assists ?? 4;
            const avgRating = stats.average_rating ?? 8.2;
            const activeTeamFirstName =
              (activePickSlot?.team_name || activePickSlot?.teamName || 'Time').split(' ')[0];

            return (
              <div
                key={player.id}
                className="p-4 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm flex flex-col justify-between gap-3 hover:border-[#00E599]/40 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-14 h-14 rounded-2xl bg-[#0c0e12] overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={player.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                      alt={player.character_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
                      }}
                    />
                    <span className="absolute bottom-0 right-0 px-1.5 py-0.2 bg-[#00E599] text-[#090A0F] font-black font-mono text-[9px] font-black rounded-tl-md">
                      {player.overall}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] font-mono text-[10px] font-black">
                        {player.primary_position}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                          player.accelerate_type === 'Explosiva'
                            ? 'bg-amber-500/15 text-amber-400'
                            : player.accelerate_type === 'Prolongada'
                            ? 'bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599]'
                            : 'bg-[#38C958]/15 text-[#38C958]'
                        )}
                      >
                        ⚡ {player.accelerate_type || 'Controlada'}
                      </span>
                    </div>

                    <h3 className="text-sm font-display font-black uppercase text-white truncate">
                      {player.character_name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      Atleta: <strong>{player.full_name || player.character_name}</strong> •{' '}
                      {player.height_cm || 178}cm / {player.weight_kg || 72}kg
                    </p>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <img
                        src={archAsset.iconUrl}
                        alt={archAsset.name}
                        className="w-5 h-5 object-contain drop-shadow-sm"
                      />
                      <span className="text-[10px] font-extrabold text-zinc-600 dark:text-zinc-300">
                        Arquétipo: {player.archetype || archAsset.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estatísticas de Campeonatos Anteriores */}
                <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-2xl bg-white/[0.03] text-center">
                  <div>
                    <span className="text-xs font-mono font-black text-[#00E599] block">
                      {matchesPlayed}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Jogos</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono font-black text-[#38C958] block">
                      {goalsScored}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Gols</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono font-black text-amber-400 block">
                      {assistsMade}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Assists</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono font-black text-white block">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Nota</span>
                  </div>
                </div>

                {/* Rodapé: Clube Atual + Ver Carta FC 26 + Draftar */}
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-zinc-100 dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setInspectedPlayerId(player.id)}
                    className="py-2 px-2.5 rounded-xl bg-white/[0.03] hover:border-[#00E599] border border-transparent text-[11px] font-extrabold text-[#00E599] flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Carta FC 26</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDraftPlayer(player.id, player.character_name)}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#00E599] to-[#059669] hover:opacity-95 text-white font-extrabold text-[11px] flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Draftar p/ {activeTeamFirstName}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* MODAL DE INSPEÇÃO DA CARTA FC 26 DO JOGADOR */}
        {inspectedPlayer && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setInspectedPlayerId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-[#0D0F17] border border-zinc-200 dark:border-white/15 p-6 text-center space-y-4 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setInspectedPlayerId(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-100 dark:bg-[#1c2029] flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-xs font-extrabold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Scouting Report • Carta Oficial EA FC 26
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
