'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import { cn } from '@/lib/utils';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Users,
} from 'lucide-react';

export default function MarketSearchPage() {
  const { teams, players, standings } = useLeagueStore();

  const [activeTab, setActiveTab] = useState<'teams' | 'players'>('players');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');

  const filteredTeams = useMemo(() => {
    return teams.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teams, searchTerm]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const charName = (p.character_name || p.ea_Tag || '').toLowerCase();
      const realName = (p.full_name || '').toLowerCase();
      const pos = (p.primary_position || '').toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        charName.includes(searchTerm.toLowerCase()) ||
        realName.includes(searchTerm.toLowerCase()) ||
        pos.includes(searchTerm.toLowerCase());
      const matchPos =
        selectedPosition === 'ALL' || p.primary_position === selectedPosition;
      return matchSearch && matchPos;
    });
  }, [players, searchTerm, selectedPosition]);

  const getTeamRecord = (teamId: string) => {
    const found = standings.find((s) => s.team_id === teamId);
    if (found) {
      return { won: found.won, drawn: found.drawn, lost: found.lost };
    }
    return { won: 0, drawn: 0, lost: 0 };
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-[#18181B] dark:text-zinc-100 px-3 sm:px-4 py-4 pb-28 overflow-x-hidden">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#18181B] dark:text-white">
              Diretório de Clubes & +40 Atletas
            </h1>
            <p className="text-xs text-zinc-500">
              Pesquise pelo Nome do Personagem no EA FC 26 ou abra a Sala de Draft
            </p>
          </div>
          <Link
            href="/draft-board"
            className="px-3.5 py-2 rounded-2xl bg-[#7C5CFC] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            Sala de Draft
          </Link>
        </div>

        {/* Segmented Control: [ Jogadores ] | [ Times ] */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('players')}
            className={cn(
              'py-2 rounded-full text-xs font-extrabold transition-all',
              activeTab === 'players'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B] dark:hover:text-white'
            )}
          >
            Jogadores ({filteredPlayers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={cn(
              'py-2 rounded-full text-xs font-extrabold transition-all',
              activeTab === 'teams'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B] dark:hover:text-white'
            )}
          >
            Times ({filteredTeams.length})
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'teams'
                  ? 'Buscar time pelo nome...'
                  : 'Buscar por Nome do Personagem (ex: JEFHE, HAALANDINHO)...'
              }
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-xs font-semibold"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              'w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all',
              filterOpen
                ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                : 'bg-white dark:bg-zinc-900 text-[#7C5CFC] border-zinc-200/70 dark:border-zinc-800'
            )}
            title="Filtrar"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {filterOpen && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">Filtrar por Posição</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedPosition('ALL');
                  setFilterOpen(false);
                }}
                className="text-[11px] font-bold text-[#7C5CFC]"
              >
                Limpar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'CB', 'LB', 'RB', 'GK'].map(
                (pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setSelectedPosition(pos)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold border transition-all',
                      selectedPosition === pos
                        ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                        : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {pos === 'ALL' ? 'Todas' : pos}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-2.5">
            {filteredTeams.map((team) => {
              const rec = getTeamRecord(team.id);
              return (
                <Link
                  key={team.id}
                  href="/captain"
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 hover:border-[#7C5CFC]/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 overflow-hidden"
                      style={{ backgroundColor: team.primary_color || '#7C5CFC' }}
                    >
                      <img
                        src={team.logo_url || '/assets/templates/default-crest.png'}
                        alt={team.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/templates/default-crest.png';
                        }}
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-extrabold text-[#18181B] dark:text-white">
                        {team.name}
                      </h3>

                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#38C958]/15 text-[#2fb34d] text-[10px] font-extrabold">
                          V {rec.won}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-extrabold">
                          E {rec.drawn}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 text-[10px] font-extrabold">
                          D {rec.lost}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {activeTab === 'players' && (
          <div className="grid sm:grid-cols-2 gap-2.5">
            {filteredPlayers.map((player) => {
              const club = teams.find((t) => t.id === player.team_id);
              return (
                <Link
                  key={player.id}
                  href="/draft-board"
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-3.5 border border-zinc-100 dark:border-zinc-800 hover:border-[#7C5CFC]/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/15 text-[#7C5CFC] font-black text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={
                          player.avatar_face_url ||
                          '/assets/fc-26-clean-card-designs/default/gold-rare.webp'
                        }
                        alt={player.character_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-black uppercase text-[#18181B] dark:text-white truncate">
                          {player.character_name || player.ea_Tag}
                        </h3>
                        <span className="px-2 py-0.2 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] text-[10px] font-extrabold">
                          {player.primary_position} • {player.overall}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#71717A] truncate">
                        Atleta: {player.full_name} • {club?.name || 'Agente Livre'}
                      </p>

                      <p className="text-[10px] font-extrabold text-[#38C958] truncate">
                        ⚡ {player.accelerate_type || 'Controlada'} • {player.archetype}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
