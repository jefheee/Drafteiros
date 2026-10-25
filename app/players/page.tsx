'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import { FC26PlayerCard } from '@/components/players/fc26-player-card';
import { RubberSegment } from '@/components/react-bits/rubber-segment';
import { PillNav } from '@/components/react-bits/pill-nav';
import { HoloCard } from '@/components/react-bits/holo-card';
import {
  Search,
  Users,
  Shield,
  X,
  Plus,
  ChevronRight,
} from 'lucide-react';

const POSITION_FILTERS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'ATK', label: 'Ataque (ATA)' },
  { id: 'MID', label: 'Meio (MEI/MC/VOL)' },
  { id: 'DEF', label: 'Defesa (ZAG/LD/LE)' },
  { id: 'GK', label: 'Goleiro (GK)' },
  { id: 'FREE', label: 'Agentes Livres' },
];

export default function SearchPlayersAndTeamsPage() {
  const { players, teams, standings, loading } = useLeagueStore();

  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState<string>('ALL');
  const [inspectedPlayerId, setInspectedPlayerId] = useState<string | null>(null);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.character_name?.toLowerCase().includes(q) ||
        p.full_name?.toLowerCase().includes(q) ||
        p.ea_Tag?.toLowerCase().includes(q) ||
        p.archetype?.toLowerCase().includes(q);

      const pos = p.primary_position || '';
      const matchesPos =
        posFilter === 'ALL' ||
        (posFilter === 'ATK' && ['ATA', 'ST', 'LW', 'RW'].includes(pos)) ||
        (posFilter === 'MID' && ['MEI', 'MC', 'VOL', 'CAM', 'CM', 'CDM'].includes(pos)) ||
        (posFilter === 'DEF' && ['ZAG', 'LD', 'LE', 'CB', 'LB', 'RB'].includes(pos)) ||
        (posFilter === 'GK' && pos === 'GK') ||
        (posFilter === 'FREE' && (!p.team_id || p.is_free_agent));

      return matchesQuery && matchesPos;
    });
  }, [players, searchQuery, posFilter]);

  const filteredTeams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return teams.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.short_name || '').toLowerCase().includes(q) ||
        (t.invite_code || '').toLowerCase().includes(q)
    );
  }, [teams, searchQuery]);

  const inspectedPlayer = useMemo(
    () => players.find((p) => p.id === inspectedPlayerId) || null,
    [players, inspectedPlayerId]
  );

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6 pb-28">
      <main className="max-w-3xl mx-auto space-y-5">
        {/* Cabeçalho Minimalista */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">
              Buscar
            </h1>
            <p className="text-xs text-[#A1A1AA]">
              Encontre jogadores pelo nome do boneco ou pesquise clubes da liga
            </p>
          </div>
          <Link
            href="/draft-board"
            className="h-9 px-4 rounded-full bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Sala de Draft</span>
          </Link>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'players'
                ? 'Buscar atleta por Nome ou Nick / ID no Jogo...'
                : 'Buscar time pelo nome ou sigla...'
            }
            className="w-full h-12 pl-11 pr-10 rounded-2xl bg-[#141414] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm text-white placeholder:text-zinc-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Abas Jogadores vs Times com RubberSegment (React Bits) */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <RubberSegment
            options={[
              {
                id: 'players',
                label: 'Jogadores',
                badge: filteredPlayers.length,
              },
              {
                id: 'teams',
                label: 'Times',
                badge: filteredTeams.length,
              },
            ]}
            value={activeTab}
            onChange={(id) => setActiveTab(id as 'players' | 'teams')}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Filtro de Posição com PillNav quando na aba Jogadores */}
        {activeTab === 'players' && (
          <div className="overflow-x-auto pb-1 no-scrollbar">
            <PillNav
              items={POSITION_FILTERS}
              activeId={posFilter}
              onSelect={setPosFilter}
            />
          </div>
        )}

        {/* RESULTADOS: JOGADORES */}
        {activeTab === 'players' && (
          <div className="space-y-2.5">
            {loading ? (
              <div className="p-12 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center text-xs text-[#A1A1AA]">
                Buscando jogadores no banco...
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center mx-auto text-[#A1A1AA]">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h2 className="text-sm font-bold text-white">
                    Nenhum jogador encontrado
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Assim que os atletas criarem suas contas e personagens no onboarding, eles aparecerão aqui automaticamente.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Meu Personagem</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.08] rounded-3xl bg-[#0A0A0A] border border-white/[0.08] overflow-hidden">
                {filteredPlayers.map((player) => {
                  const club = teams.find((t) => t.id === player.team_id);
                  return (
                    <div
                      key={player.id}
                      className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#141414] border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0">
                          {player.avatar_face_url ? (
                            <img
                              src={player.avatar_face_url}
                              alt={player.character_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-display font-bold text-xs text-white">
                              {(player.character_name || 'DC')
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-display font-bold text-white uppercase truncate">
                              {player.character_name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-white/[0.08] text-[10px] font-mono font-bold text-white">
                              {player.primary_position} • {player.overall || 82}
                            </span>
                          </div>

                          <p className="text-xs text-[#A1A1AA] truncate">
                            {club ? club.name : 'Agente Livre'} •{' '}
                            {player.platform || 'PS5'} • Pé {player.preferred_foot || 'D'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectedPlayerId(player.id)}
                        className="h-9 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shrink-0 transition-colors"
                      >
                        Ver Carta
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RESULTADOS: TIMES */}
        {activeTab === 'teams' && (
          <div className="space-y-2.5">
            {loading ? (
              <div className="p-12 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center text-xs text-[#A1A1AA]">
                Buscando times no banco...
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="p-10 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center mx-auto text-[#A1A1AA]">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h2 className="text-sm font-bold text-white">
                    Nenhum time cadastrado ainda
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Capitães podem registrar seu clube no Onboarding para receber o código de convite do elenco.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Meu Time</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.08] rounded-3xl bg-[#0A0A0A] border border-white/[0.08] overflow-hidden">
                {filteredTeams.map((team) => {
                  const standing = standings.find((s) => s.team_id === team.id);
                  const rosterCount = players.filter(
                    (p) => p.team_id === team.id
                  ).length;

                  return (
                    <Link
                      key={team.id}
                      href="/captain"
                      className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center overflow-hidden shrink-0">
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={team.name}
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <span className="font-mono font-bold text-xs text-white">
                              {team.short_name ||
                                team.name.substring(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-display font-bold text-white truncate">
                              {team.name}
                            </span>
                            {team.short_name && (
                              <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-white/[0.08] text-[10px] font-mono text-[#A1A1AA]">
                                {team.short_name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#A1A1AA]">
                            {rosterCount} atletas no elenco •{' '}
                            {standing
                              ? `${standing.won}V ${standing.drawn}E ${standing.lost}D`
                              : '0V 0E 0D'}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#A1A1AA] shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal de Visualização da Carta FC 26 do Jogador */}
        {inspectedPlayer && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setInspectedPlayerId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl bg-[#0A0A0A] border border-white/[0.1] p-6 flex flex-col items-center space-y-4 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setInspectedPlayerId(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#141414] text-[#A1A1AA] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                  Carta Oficial EA Sports FC 26
                </span>
                <h3 className="text-base font-display font-bold text-white uppercase">
                  {inspectedPlayer.character_name}
                </h3>
              </div>

              <HoloCard className="p-2 bg-black border-white/[0.08]">
                <FC26PlayerCard
                  player={inspectedPlayer}
                  team={teams.find((t) => t.id === inspectedPlayer.team_id)}
                  size="md"
                />
              </HoloCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
