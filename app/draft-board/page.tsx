'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/components/auth/auth-context';
import { useLeagueStore } from '@/lib/data-store';
import { ARCHETYPE_ASSETS } from '@/lib/assets-catalog';
import { DraftOrderSlot } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  Dices,
  Search,
  UserPlus,
  CheckCircle2,
  Zap,
  Trophy,
  Shield,
  Sparkles,
  Crown,
} from 'lucide-react';

export default function OfficialDraftBoardPage() {
  const { session } = useAuth();
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
    teams[0]?.id || 'team-furia'
  );
  const [currentPickIndex, setCurrentPickIndex] = useState<number>(0);
  const [draftFeedback, setDraftFeedback] = useState<string | null>(null);
  const [isDrawingLottery, setIsDrawingLottery] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const draftOrder: DraftOrderSlot[] = useMemo(() => {
    if (tournament.draft_order && tournament.draft_order.length > 0) {
      return tournament.draft_order;
    }
    // Snake draft padrão
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

  // Sorteio Criptográfico de Ordem dos Capitães (Snake Draft IA Lottery)
  const handleRunDraftLottery = async () => {
    setIsDrawingLottery(true);
    try {
      const shuffledTeams = [...teams];
      // Embaralhamento Fisher-Yates com Web Crypto quando disponível
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

  // Contratar / Draftar Jogador Imediatamente para o Elenco
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
        (posFilter === 'DEF' && ['LB', 'RB', 'CB', 'ZAG'].includes(pPos)) ||
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

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 sm:px-4 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-3xl mx-auto space-y-4">
        {/* ================================================================= */}
        {/* 1. CABEÇALHO DA SALA DE DRAFT OFICIAL (+40 JOGADORES)             */}
        {/* ================================================================= */}
        <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] text-[10px] font-extrabold uppercase" suppressHydrationWarning>
                  Pool Oficial: {mounted ? players.length : 19} Atletas Cadastrados
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#229a3e] text-[10px] font-extrabold" suppressHydrationWarning>
                  {mounted ? freeAgentsCount : 0} Livres no Mercado
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
                Sala de Draft Oficial & Mercadão (+40 Jogadores)
              </h1>
              <p className="text-xs text-zinc-500">
                Ordem Snake Draft sorteada por IA • Contratação imediata com Nome do Personagem, Arquétipo e AcceleRATE.
              </p>
            </div>

            {/* Botão do Admin: Sortear Ordem de Escolha dos Capitães (IA Draft Lottery) */}
            <button
              type="button"
              onClick={handleRunDraftLottery}
              disabled={isDrawingLottery}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E5] hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shrink-0"
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
            <div className="p-3 rounded-2xl bg-[#38C958]/15 border border-[#38C958]/30 text-[#229a3e] dark:text-[#38C958] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{draftFeedback}</span>
            </div>
          )}

          {/* Fila Snake Draft Ao Vivo */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#7C5CFC] flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                Ordem Oficial de Escolha (Snake Draft: Rodada 1 ➔ Rodada 2)
              </span>
              <span className="text-[11px] font-bold text-zinc-500">
                Na vez: <strong className="text-[#38C958]">{activePickSlot?.team_name || activePickSlot?.teamName || 'Furia del Plata'}</strong>
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
                        : 'border-zinc-200 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/60 opacity-80'
                    )}
                  >
                    <span className="text-[9px] font-black uppercase text-[#7C5CFC] block">
                      Pick #{pickNum} • R{roundNum}
                    </span>
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-white block truncate max-w-[125px]">
                      {tName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. FILTROS DE BUSCA E POSIÇÃO                                     */}
        {/* ================================================================= */}
        <section className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por Nome do Personagem (ex: JEFHE, HAALANDINHO)..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
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
                    'flex-1 h-9 px-2 rounded-xl text-[11px] font-extrabold transition-all',
                    availabilityFilter === tab.id
                      ? 'bg-[#7C5CFC] text-white'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
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
              { id: 'ATK', label: 'Atacantes (ST/LW/RW)' },
              { id: 'MID', label: 'Meias (CAM/CM/CDM)' },
              { id: 'DEF', label: 'Defensores (CB/LB/RB)' },
              { id: 'GK', label: 'Goleiros (GK)' },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => setPosFilter(pos.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 transition-all',
                  posFilter === pos.id
                    ? 'bg-[#38C958] text-white'
                    : 'bg-[#F5F6FA] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                )}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. LISTA DOS +40 JOGADORES COM CHARACTER_NAME & CAREER STATS      */}
        {/* ================================================================= */}
        <section className="grid sm:grid-cols-2 gap-3">
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
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Foto do Personagem */}
                  <div className="relative w-14 h-14 rounded-2xl bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                    <img
                      src={
                        player.avatar_face_url ||
                        '/assets/fc-26-clean-card-designs/default/gold-rare.webp'
                      }
                      alt={player.character_name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 px-1.5 py-0.2 bg-[#7C5CFC] text-white text-[9px] font-black rounded-tl-md">
                      {player.overall}
                    </span>
                  </div>

                  {/* Identidade Dupla + Arquétipo + AcceleRATE */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] text-[10px] font-black">
                        {player.primary_position}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                          player.accelerate_type === 'Explosiva'
                            ? 'bg-amber-500/15 text-amber-600'
                            : player.accelerate_type === 'Prolongada'
                            ? 'bg-[#7C5CFC]/15 text-[#7C5CFC]'
                            : 'bg-[#38C958]/15 text-[#229a3e]'
                        )}
                      >
                        ⚡ {player.accelerate_type || 'Controlada'}
                      </span>
                    </div>

                    <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white truncate">
                      {player.character_name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 truncate">
                      Atleta: <strong>{player.full_name || player.character_name}</strong> •{' '}
                      {player.height_cm || 178}cm / {player.weight_kg || 72}kg
                    </p>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <img
                        src={archAsset.iconUrl}
                        alt={archAsset.name}
                        className="w-4 h-4 object-contain"
                      />
                      <span className="text-[10px] font-extrabold text-zinc-600 dark:text-zinc-300">
                        Arquétipo: {player.archetype || archAsset.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estatísticas de Campeonatos Anteriores */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 text-center">
                  <div>
                    <span className="text-xs font-black text-[#7C5CFC] block">
                      {matchesPlayed}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">
                      Jogos
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#38C958] block">
                      {goalsScored}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">
                      Gols
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-500 block">
                      {assistsMade}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">
                      Assists
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-zinc-900 dark:text-white block">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">
                      Nota
                    </span>
                  </div>
                </div>

                {/* Rodapé: Clube Atual + Botão Draftar Jogador */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-500 truncate">
                    {currentClub ? (
                      <>
                        Clube: <strong className="text-zinc-800 dark:text-zinc-200">{currentClub.name}</strong>
                      </>
                    ) : (
                      <span className="text-[#38C958] font-extrabold">
                        🟢 Agente Livre para Draft
                      </span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      handleDraftPlayer(player.id, player.character_name)
                    }
                    className="py-2 px-3.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-extrabold text-[11px] flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>
                      Draftar p/ {activeTeamFirstName}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
