'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import { ARCHETYPE_ASSETS, TEMPLATE_ASSETS } from '@/lib/assets-catalog';
import { DraftOrderSlot } from '@/types/database';
import { WorkspaceNav } from '@/components/layout/workspace-nav';
import { FC26PlayerCard } from '@/components/players/fc26-player-card';
import { sendDraftPickEmbed } from '@/lib/discord-webhook';
import { cn } from '@/lib/utils';
import {
  Dices,
  Search,
  UserPlus,
  CheckCircle2,
  Crown,
  Sparkles,
  X,
  Users,
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
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [currentPickIndex, setCurrentPickIndex] = useState<number>(0);
  const [draftFeedback, setDraftFeedback] = useState<string | null>(null);
  const [isDrawingLottery, setIsDrawingLottery] = useState(false);
  const [inspectedPlayerId, setInspectedPlayerId] = useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const draftOrder: DraftOrderSlot[] = useMemo(() => {
    if (tournament?.draft_order && tournament.draft_order.length > 0) {
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
  }, [tournament?.draft_order, teams]);

  const activePickSlot = draftOrder[currentPickIndex] || draftOrder[0] || null;

  const handleRunDraftLottery = async () => {
    if (teams.length < 2) {
      setDraftFeedback('Cadastre pelo menos 2 clubes para realizar o sorteio Snake Draft.');
      return;
    }
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
        setSelectedTeamId(newOrder[0].team_id || newOrder[0].teamId || '');
      }

      setDraftFeedback(
        `Sorteio Snake Draft concluído! Pick #1: ${newOrder[0]?.team_name} • Pick #2: ${newOrder[1]?.team_name}.`
      );
      setTimeout(() => setDraftFeedback(null), 5000);
    } finally {
      setIsDrawingLottery(false);
    }
  };

  const handleDraftPlayer = async (playerId: string, characterName: string) => {
    const targetId = activePickSlot?.team_id || activePickSlot?.teamId || selectedTeamId;
    const targetTeam = teams.find((t) => t.id === targetId) || teams[0];
    if (!targetTeam) {
      setDraftFeedback('Cadastre ao menos um clube antes de convocar atletas.');
      return;
    }

    await draftPlayerToTeam(playerId, targetTeam.id);

    setDraftFeedback(
      `"${characterName}" foi convocado oficialmente para o elenco do ${targetTeam.name}!`
    );

    // Dispara webhook do Discord se configurado
    if (tournament?.discord_webhook_url) {
      const pObj = players.find((p) => p.id === playerId);
      sendDraftPickEmbed(tournament.discord_webhook_url, {
        teamName: targetTeam.name,
        playerName: characterName,
        position: pObj?.primary_position,
        overall: pObj?.overall,
        round: activePickSlot?.round,
        pickNumber: (activePickSlot?.pick_number ?? currentPickIndex) + 1,
        tournamentName: tournament.name,
        teamLogo: targetTeam.logo_url,
        avatarUrl: pObj?.avatar_face_url || pObj?.avatar_url,
      });
    }

    if (currentPickIndex + 1 < draftOrder.length) {
      const nextIdx = currentPickIndex + 1;
      setCurrentPickIndex(nextIdx);
      setSelectedTeamId(draftOrder[nextIdx].team_id || draftOrder[nextIdx].teamId || '');
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
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        <WorkspaceNav />

        {/* CABEÇALHO DA SALA DE DRAFT OFICIAL */}
        <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[10px] font-bold uppercase">
                  Pool Oficial: {mounted ? players.length : 0} Atletas Cadastrados
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[10px] font-bold">
                  {mounted ? freeAgentsCount : 0} Livres no Mercado
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-white">
                Sala de Draft Oficial & Mercadão
              </h1>
              <p className="text-xs text-zinc-400">
                Ordem Snake Draft entre clubes cadastrados • Inspecione o Card Pro de qualquer atleta antes de convocar.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunDraftLottery}
              disabled={isDrawingLottery}
              className="py-3 px-5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all"
            >
              <Dices className="w-4 h-4" />
              <span>
                {isDrawingLottery
                  ? 'Sorteando Fila Snake...'
                  : 'Sortear Ordem dos Capitães'}
              </span>
            </button>
          </div>

          {draftFeedback && (
            <div className="p-3 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{draftFeedback}</span>
            </div>
          )}

          {draftOrder.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Ordem Oficial de Escolha (Snake Draft: Rodada 1 ➔ Rodada 2)
                </span>
                <span className="text-[11px] font-bold text-zinc-400">
                  Na vez:{' '}
                  <strong className="text-white">
                    {activePickSlot?.team_name || activePickSlot?.teamName || 'Clube'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {draftOrder.map((slot, idx) => {
                  const isCurrentTurn = idx === currentPickIndex;
                  const pickNum = slot.pick_number ?? slot.pickOrder ?? idx + 1;
                  const roundNum = slot.round ?? (idx < teams.length ? 1 : 2);
                  const tName = slot.team_name || slot.teamName || 'Clube';
                  const tId = slot.team_id || slot.teamId || '';
                  return (
                    <button
                      key={`${roundNum}-${pickNum}-${idx}`}
                      type="button"
                      onClick={() => {
                        setCurrentPickIndex(idx);
                        setSelectedTeamId(tId);
                      }}
                      className={cn(
                        'px-3.5 py-2 rounded-2xl border text-left shrink-0 transition-all',
                        isCurrentTurn
                          ? 'border-white bg-[#141414]'
                          : 'border-white/[0.06] bg-black opacity-75'
                      )}
                    >
                      <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 block">
                        Pick #{pickNum} • R{roundNum}
                      </span>
                      <span className="text-xs font-bold text-white block truncate max-w-[130px]">
                        {tName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* FILTROS DE BUSCA E POSIÇÃO */}
        <section className="p-4 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-3">
          <div className="grid sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por Nome do Personagem..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#141414] border border-white/10 text-xs font-medium text-white"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'all', label: `Todos (${mounted ? players.length : 0})` },
                  { id: 'free_agents', label: `Livres (${mounted ? freeAgentsCount : 0})` },
                  { id: 'drafted', label: 'Com Clube' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAvailabilityFilter(tab.id)}
                  className={cn(
                    'flex-1 h-10 px-2 rounded-xl text-[11px] font-bold transition-all',
                    availabilityFilter === tab.id
                      ? 'bg-white text-black'
                      : 'bg-[#141414] text-zinc-400 hover:text-white'
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
                  'px-3.5 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all border',
                  posFilter === pos.id
                    ? 'bg-white text-black border-white'
                    : 'bg-[#141414] text-zinc-400 border-white/10 hover:text-white'
                )}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </section>

        {/* LISTA DE ATLETAS */}
        {filteredPlayers.length === 0 ? (
          <section className="p-10 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white">
                Nenhum atleta encontrado neste filtro
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Compartilhe o link da plataforma para que os jogadores criem suas contas e cadastrem seus personagens no pool oficial do Draft.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
            >
              Cadastrar Meu Personagem
            </Link>
          </section>
        ) : (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => {
              const archAsset =
                ARCHETYPE_ASSETS.find(
                  (a) =>
                    a.name.toLowerCase() === (player.archetype || '').toLowerCase() ||
                    a.id === player.archetype
                ) || ARCHETYPE_ASSETS[0];

              const stats = player.career_stats || {};
              const matchesPlayed = stats.matches_played ?? stats.official_matches ?? 0;
              const goalsScored = stats.goals ?? stats.official_goals ?? 0;
              const assistsMade = stats.assists ?? stats.official_assists ?? 0;
              const avgRating = stats.average_rating ?? 0;
              const activeTeamFirstName =
                (activePickSlot?.team_name || activePickSlot?.teamName || 'Clube').split(' ')[0];

              return (
                <div
                  key={player.id}
                  className="p-4 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] flex flex-col justify-between gap-3 hover:border-white/25 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-14 h-14 rounded-2xl bg-[#141414] overflow-hidden border border-white/10 shrink-0">
                      <img
                        src={player.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                        alt={player.character_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
                        }}
                      />
                      <span className="absolute bottom-0 right-0 px-1.5 py-0.5 bg-white text-black font-mono text-[9px] font-black rounded-tl-md">
                        {player.overall}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold">
                          {player.primary_position}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-white/10 text-zinc-300 text-[10px] font-semibold">
                          {player.accelerate_type || 'Controlada'}
                        </span>
                      </div>

                      <h3 className="text-sm font-display font-black uppercase text-white truncate">
                        {player.character_name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {player.full_name || player.character_name} • {player.height_cm || 178}cm /{' '}
                        {player.weight_kg || 72}kg
                      </p>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <img
                          src={archAsset.iconUrl}
                          alt={archAsset.name}
                          className="w-4 h-4 object-contain"
                        />
                        <span className="text-[10px] font-semibold text-zinc-400">
                          {player.archetype || archAsset.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas Reais */}
                  <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-2xl bg-[#141414] text-center">
                    <div>
                      <span className="text-xs font-mono font-black text-white block">
                        {matchesPlayed}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Jogos</span>
                    </div>
                    <div>
                      <span className="text-xs font-mono font-black text-white block">
                        {goalsScored}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Gols</span>
                    </div>
                    <div>
                      <span className="text-xs font-mono font-black text-white block">
                        {assistsMade}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Assists</span>
                    </div>
                    <div>
                      <span className="text-xs font-mono font-black text-white block">
                        {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Nota</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setInspectedPlayerId(player.id)}
                      className="py-2 px-3 rounded-full bg-[#141414] hover:border-white/30 border border-white/10 text-[11px] font-bold text-white flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Carta Pro</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDraftPlayer(player.id, player.character_name)}
                      className="py-2 px-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-[11px] flex items-center gap-1.5 shrink-0 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Convocar p/ {activeTeamFirstName}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* MODAL DE INSPEÇÃO DA CARTA FC 26 */}
        {inspectedPlayer && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setInspectedPlayerId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-[#0A0A0A] border border-white/15 p-6 text-center space-y-4 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setInspectedPlayerId(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#141414] flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Scouting Report • Card Oficial de Atleta Pro
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
