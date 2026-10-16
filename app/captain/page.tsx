'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-context';
import {
  Team,
  PlayerProfile,
  PlayerStats,
  TournamentPlayerStats,
} from '@/types/database';
import {
  EA_FC_26_ARCHETYPES,
  ALL_5V5_FORMATIONS,
  ALL_11V11_FORMATIONS,
  getArchetypeBadgeClass,
  getPositionBadgeClass,
  cn,
} from '@/lib/utils';
import {
  FALLBACK_TEAMS,
  FALLBACK_PLAYERS,
} from '@/lib/mock-league-data';
import { SquadProvider, useSquad } from '@/components/builder/squad-context';
import { Pitch } from '@/components/builder/pitch';
import {
  Shield,
  Users,
  LayoutGrid,
  Palette,
  CalendarCheck2,
  Sparkles,
  CheckCircle2,
  Save,
  X,
  Wand2,
  RotateCcw,
} from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

function EmbeddedTacticalBuilder({ roster }: { roster: PlayerProfile[] }) {
  const {
    gameMode,
    setGameMode,
    formation,
    setFormation,
    selectedBenchPlayer,
    setSelectedBenchPlayer,
    autoAssignSquad,
    clearPitch,
    isPlayerOnPitch,
  } = useSquad();

  const mappedRoster: TournamentPlayerStats[] = roster.map((p, idx) => ({
    tournament_id: '11111111-1111-1111-1111-111111111111',
    player_id: p.id,
    name: p.name,
    archetype: p.archetype || 'Mágico',
    positions_declared: p.positions_declared,
    community_position: p.primary_position || p.positions_declared[0] || 'MEI',
    community_confidence: 95,
    total_position_votes: 10,
    participant_role: idx === 0 ? 'captain' : 'player',
    is_captain: idx === 0,
    evaluation_count: 5,
    avg_mechanic: 85,
    avg_iq: 85,
    avg_teamplay: 88,
    overall_score: 86 - idx,
    tier: 'A',
  }));

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setGameMode('5v5')}
              className={cn(
                'min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all',
                gameMode === '5v5'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              ⚡ Modo 5x5 (5 Titulares + 1 Reserva)
            </button>
            <button
              type="button"
              onClick={() => setGameMode('11v11')}
              className={cn(
                'min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all',
                gameMode === '11v11'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              🏟️ Modo 11v11
            </button>
          </div>

          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-400"
          >
            {gameMode === '5v5'
              ? Object.values(ALL_5V5_FORMATIONS).map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))
              : Object.values(ALL_11V11_FORMATIONS).map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => autoAssignSquad(mappedRoster)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
          >
            <Wand2 className="w-4 h-4" />
            Auto-Escalar {gameMode}
          </button>
          <button
            type="button"
            onClick={clearPitch}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <Pitch />
        </div>
        <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Toque no Atleta e depois na Posição do Campo:
          </h4>
          {mappedRoster.map((pl) => {
            const selected = selectedBenchPlayer?.player_id === pl.player_id;
            const onPitch = isPlayerOnPitch(pl.player_id);
            return (
              <div
                key={pl.player_id}
                onClick={() => setSelectedBenchPlayer(selected ? null : pl)}
                className={cn(
                  'min-h-[48px] p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all',
                  selected
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                    : onPitch
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-65'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                )}
              >
                <span className="font-bold text-slate-100">{pl.name}</span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {onPitch ? '✓ Escalado' : selected ? 'Escolher vaga ↵' : pl.community_position}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CaptainPage() {
  const { session } = useAuth();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    session?.teamId || 'b1111111-1111-1111-1111-111111111111'
  );

  const [activeTab, setActiveTab] = useState<'squad' | 'tactics' | 'branding'>('squad');

  const [teams, setTeams] = useState<Team[]>(FALLBACK_TEAMS);
  const [myTeam, setMyTeam] = useState<Team>(FALLBACK_TEAMS[0]);
  const [squad, setSquad] = useState<(PlayerProfile & { stats?: PlayerStats })[]>(FALLBACK_PLAYERS);

  // Edição de arquétipos
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>([]);
  const [savingPlayer, setSavingPlayer] = useState(false);

  // Edição de Identidade Visual & Patrocinadores do Time
  const [primaryColor, setPrimaryColor] = useState('#eab308');
  const [secondaryColor, setSecondaryColor] = useState('#1d4ed8');
  const [kitDescription, setKitDescription] = useState(
    'Azul marinho tradicional com faixa horizontal amarelo ouro no peito e patrocínio Betsson'
  );
  const [sponsorsInput, setSponsorsInput] = useState('Betsson, DirecTV Sports, Adidas');
  const [whatsappLink, setWhatsappLink] = useState('https://chat.whatsapp.com/boca5x5');
  const [instagramHandle, setInstagramHandle] = useState('@atleticodapalhoca');
  const [brandingSavedMsg, setBrandingSavedMsg] = useState('');

  useEffect(() => {
    const found = teams.find((t) => t.id === selectedTeamId) || teams[0];
    if (found) {
      setMyTeam(found);
      setPrimaryColor(found.primary_color || '#06b6d4');
      setSecondaryColor(found.secondary_color || '#ffffff');
      setKitDescription(
        found.kit_description ||
          'Listrado azul claro e branco estilo Racing com patrocínio Betsson'
      );
      if (found.sponsors?.length) {
        setSponsorsInput(found.sponsors.map((s) => s.name).join(', '));
      }
      setWhatsappLink(found.whatsapp_group_link || '');
      setInstagramHandle(found.instagram_handle || '@atleticodapalhoca');
    }
  }, [selectedTeamId, teams]);

  useEffect(() => {
    async function fetchFromDb() {
      try {
        const { data: dbTeams } = await supabase.from('teams').select('*');
        if (dbTeams && dbTeams.length > 0) setTeams(dbTeams);

        const { data: dbPlayers } = await supabase.from('player_profiles').select('*').limit(8);
        if (dbPlayers && dbPlayers.length > 0) setSquad(dbPlayers);
      } catch {
        // mantém fallback
      }
    }
    fetchFromDb();
  }, []);

  const toggleArchetype = (arch: string) => {
    if (selectedArchetypes.includes(arch)) {
      if (selectedArchetypes.length === 1) return;
      setSelectedArchetypes(selectedArchetypes.filter((a) => a !== arch));
    } else {
      setSelectedArchetypes([...selectedArchetypes, arch]);
    }
  };

  const handleStartEditArchetypes = (player: PlayerProfile) => {
    setEditingPlayerId(player.id);
    const existing =
      player.archetypes && player.archetypes.length > 0
        ? player.archetypes
        : [player.archetype || 'Mágico'];
    setSelectedArchetypes(existing);
  };

  const handleSaveArchetypes = async () => {
    if (!editingPlayerId) return;
    setSavingPlayer(true);
    try {
      const primary = selectedArchetypes[0] || 'Mágico';
      await supabase
        .from('player_profiles')
        .update({
          archetypes: selectedArchetypes,
          archetype: primary,
        })
        .eq('id', editingPlayerId);

      setSquad((prev) =>
        prev.map((p) =>
          p.id === editingPlayerId
            ? { ...p, archetypes: selectedArchetypes, archetype: primary }
            : p
        )
      );
      setEditingPlayerId(null);
    } finally {
      setSavingPlayer(false);
    }
  };

  const handleSaveTeamBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSponsors = sponsorsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, logo_url: '' }));

    setTeams((prev) =>
      prev.map((t) =>
        t.id === selectedTeamId
          ? {
              ...t,
              primary_color: primaryColor,
              secondary_color: secondaryColor,
              kit_description: kitDescription,
              sponsors: parsedSponsors,
              whatsapp_group_link: whatsappLink,
              instagram_handle: instagramHandle,
            }
          : t
      )
    );

    try {
      await supabase
        .from('teams')
        .update({
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          kit_description: kitDescription,
          sponsors: parsedSponsors,
          whatsapp_group_link: whatsappLink,
          instagram_handle: instagramHandle,
        })
        .eq('id', selectedTeamId);
    } catch {
      // fallback local
    }

    setBrandingSavedMsg(
      'Uniforme IA, cores do clube e patrocinadores salvos e sincronizados com o Estúdio IA!'
    );
    setTimeout(() => setBrandingSavedMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton fallbackHref="/" label="Início" />
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Central do Meu Time (5x5 & 11v11)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Clube Ativo:</span>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="min-h-[44px] bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-400 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  🛡️ {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Principal do Clube */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl border-2 border-white/20 flex items-center justify-center text-slate-950 font-black text-lg shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              {myTeam?.name?.substring(0, 3).toUpperCase() || 'PRO'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-100">{myTeam?.name}</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Capitão Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {kitDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/matches"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-colors"
            >
              <CalendarCheck2 className="w-4 h-4" />
              Bater Horário & Súmula IA
            </Link>
            <Link
              href="/studio"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Arte de Placar
            </Link>
          </div>
        </div>

        {/* Abas de Gestão do Clube */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setActiveTab('squad')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'squad'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Elenco & Horários ({squad.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tactics')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'tactics'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Prancheta 5x5 & 11v11</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'branding'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Uniforme IA & Patrocínios</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* ABA 1: MEU ELENCO, ARQUÉTIPOS E DISPONIBILIDADE */}
        {/* =================================================================== */}
        {activeTab === 'squad' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {squad.map((player) => {
              const isEditing = editingPlayerId === player.id;
              const currentArchs =
                player.archetypes && player.archetypes.length > 0
                  ? player.archetypes
                  : [player.archetype || 'Mágico'];

              return (
                <div
                  key={player.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">{player.name}</span>
                        <div className="flex gap-1">
                          {player.positions_declared.map((pos) => (
                            <span
                              key={pos}
                              className={cn(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                                getPositionBadgeClass(pos)
                              )}
                            >
                              {pos}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {currentArchs.map((arch) => (
                          <span
                            key={arch}
                            className={cn(
                              'text-[10px] font-medium px-2 py-0.5 rounded border',
                              getArchetypeBadgeClass(arch)
                            )}
                          >
                            {arch}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isEditing ? (
                      <button
                        onClick={() => handleStartEditArchetypes(player)}
                        className="min-h-[38px] px-3 py-1 text-[11px] rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-semibold transition-colors"
                      >
                        Editar Estilos
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingPlayerId(null)}
                        className="p-1 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Disponibilidade Semanal do Atleta */}
                  {player.availability && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                      <span className="font-bold text-emerald-400 block mb-1">
                        🕒 Disponibilidade Semanal Cadastrada:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(player.availability).map(([day, hours]) => (
                          <span
                            key={day}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono"
                          >
                            {day.toUpperCase()}: {(hours as string[]).join(', ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="space-y-2">
                        {Object.entries(EA_FC_26_ARCHETYPES).map(([category, items]) => (
                          <div key={category} className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {items.map((item) => {
                                const active = selectedArchetypes.includes(item);
                                return (
                                  <button
                                    type="button"
                                    key={item}
                                    onClick={() => toggleArchetype(item)}
                                    className={cn(
                                      'text-[10px] px-2.5 py-1 rounded-lg border transition-all',
                                      active
                                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                                        : 'bg-slate-900 text-slate-400 border-slate-800'
                                    )}
                                  >
                                    {item} {active && '✓'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={handleSaveArchetypes}
                          disabled={savingPlayer}
                          className="min-h-[38px] px-3 py-1 rounded-xl text-xs bg-cyan-500 text-slate-950 font-bold flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {savingPlayer ? 'Salvando...' : 'Salvar Estilos'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: PRANCHETA TÁTICA 5x5 (5 TITULARES + 1 RESERVA) E 11v11 */}
        {/* =================================================================== */}
        {activeTab === 'tactics' && (
          <SquadProvider initialFormation="5v5-1-2-1" initialGameMode="5v5">
            <EmbeddedTacticalBuilder roster={squad} />
          </SquadProvider>
        )}

        {/* =================================================================== */}
        {/* ABA 3: UNIFORME IA, CORES E PATROCINADORES DO CLUBE */}
        {/* =================================================================== */}
        {activeTab === 'branding' && (
          <form
            onSubmit={handleSaveTeamBranding}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 max-w-3xl"
          >
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Identidade Visual do Clube, Uniforme para IA & Patrocinadores
              </h2>
              <p className="text-xs text-slate-400">
                Essas configurações alimentam os Banners 4:5 de fim de jogo e o gerador de imagens 8K dos atletas.
              </p>
            </div>

            {brandingSavedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{brandingSavedMsg}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Cor Primária (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Cor Secundária (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Descrição do Uniforme para o Estúdio de IA (kit_description)
              </label>
              <textarea
                rows={2}
                value={kitDescription}
                onChange={(e) => setKitDescription(e.target.value)}
                placeholder="Ex: Listrado azul claro e branco estilo Racing com patrocínio Betsson"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Patrocinadores Oficiais (separados por vírgula — exibidos nos Banners)
              </label>
              <input
                type="text"
                value={sponsorsInput}
                onChange={(e) => setSponsorsInput(e.target.value)}
                placeholder="Ex: Betsson, RedBull Gaming, Monster Energy"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-400"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Link do Grupo de WhatsApp do Time
                </label>
                <input
                  type="text"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Instagram Oficial do Clube
                </label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Uniforme, Cores & Patrocinadores
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
