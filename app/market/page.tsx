'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Team, PlayerProfile, TournamentStanding } from '@/types/database';
import {
  FALLBACK_TEAMS,
  FALLBACK_PLAYERS,
  FALLBACK_STANDINGS,
} from '@/lib/mock-league-data';
import { cn } from '@/lib/utils';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  MessageCircle,
  X,
} from 'lucide-react';

export default function MarketSearchPage() {
  const [activeTab, setActiveTab] = useState<'teams' | 'players'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');

  const [teams, setTeams] = useState<Team[]>(FALLBACK_TEAMS);
  const [standings, setStandings] = useState<TournamentStanding[]>(FALLBACK_STANDINGS);
  const [players, setPlayers] = useState<PlayerProfile[]>(FALLBACK_PLAYERS);

  useEffect(() => {
    async function loadDirectory() {
      try {
        const { data: dbTeams } = await supabase.from('teams').select('*');
        if (dbTeams && dbTeams.length > 0) setTeams(dbTeams);

        const { data: dbStandings } = await supabase
          .from('vw_tournament_standings')
          .select('*');
        if (dbStandings && dbStandings.length > 0) setStandings(dbStandings);

        const { data: dbPlayers } = await supabase
          .from('player_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (dbPlayers && dbPlayers.length > 0) setPlayers(dbPlayers);
      } catch {
        // fallback ativo
      }
    }
    loadDirectory();
  }, []);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teams, searchTerm]);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.bio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.primary_position || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchPos =
        selectedPosition === 'ALL' ||
        p.primary_position === selectedPosition ||
        p.positions_declared.includes(selectedPosition);
      const matchPlat =
        selectedPlatform === 'ALL' || (p.platform || 'PS5') === selectedPlatform;
      return matchSearch && matchPos && matchPlat;
    });
  }, [players, searchTerm, selectedPosition, selectedPlatform]);

  const getTeamRecord = (teamId: string, idx: number) => {
    const found = standings.find((s) => s.team_id === teamId);
    if (found) {
      return { won: found.won, drawn: found.drawn, lost: found.lost };
    }
    return {
      won: Math.max(0, 4 - (idx % 4)),
      drawn: idx % 2,
      lost: idx % 3,
    };
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-[#18181B] dark:text-zinc-100 px-3.5 sm:px-6 py-5">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 1. Título Centralizado "Buscar" */}
        <div className="text-center pt-1">
          <h1 className="text-xl font-extrabold tracking-tight text-[#18181B] dark:text-white">
            Buscar
          </h1>
        </div>

        {/* 2. Segmented Control no Topo: [ Times ] | [ Jogadores ] */}
        <div className="grid grid-cols-2 p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={cn(
              'py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all',
              activeTab === 'teams'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-[#71717A] hover:text-[#18181B] dark:hover:text-white'
            )}
          >
            Times ({filteredTeams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('players')}
            className={cn(
              'py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all',
              activeTab === 'players'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-[#71717A] hover:text-[#18181B] dark:hover:text-white'
            )}
          >
            Jogadores ({filteredPlayers.length})
          </button>
        </div>

        {/* 3. Barra de Busca Branca Arredondada + Botão de Filtro ao Lado */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'teams'
                  ? 'Buscar time pelo nome...'
                  : 'Buscar jogador, posição ou horário...'
              }
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-xs font-semibold text-[#18181B] dark:text-white placeholder-[#71717A] focus:outline-none focus:border-[#7C5CFC]"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              'w-12 h-12 rounded-full border flex items-center justify-center shrink-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all',
              filterOpen
                ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                : 'bg-white dark:bg-zinc-900 text-[#7C5CFC] border-zinc-200/70 dark:border-zinc-800'
            )}
            title="Filtrar"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Gaveta de Filtros Rápidos */}
        {filterOpen && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#18181B] dark:text-white">
                Filtros de Busca
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedPosition('ALL');
                  setSelectedPlatform('ALL');
                  setFilterOpen(false);
                }}
                className="text-[11px] font-bold text-[#7C5CFC]"
              >
                Limpar filtros
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'ATA', 'MEI', 'MC', 'VOL', 'ZAG', 'GK'].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setSelectedPosition(pos)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                    selectedPosition === pos
                      ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  {pos === 'ALL' ? 'Todas Posições' : pos}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'PS5', 'Xbox Series', 'PC'].map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatform(plat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                    selectedPlatform === plat
                      ? 'bg-[#38C958] text-white border-[#38C958]'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  {plat === 'ALL' ? 'Todas Plataformas' : plat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 1: TIMES (COM PÍLULAS V / E / D COLORIDAS IGUAL AO JOGUEIROS) */}
        {/* ================================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-3">
            {filteredTeams.map((team, idx) => {
              const rec = getTeamRecord(team.id, idx);
              const regionSubtitle =
                idx === 0
                  ? 'EA FC 26 • Grande Florianópolis / Liga LPF'
                  : 'EA FC 26 • Liga Argentina 5x5 (LPF)';

              return (
                <Link
                  key={team.id}
                  href="/captain"
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-[#7C5CFC]/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Escudo Circular à Esquerda */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 overflow-hidden shadow-xs border-2 border-zinc-100 dark:border-zinc-800"
                      style={{ backgroundColor: team.primary_color || '#7C5CFC' }}
                    >
                      {team.logo_url ? (
                        <img
                          src={team.logo_url}
                          alt={team.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        team.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      {/* Nome do Time em Negrito */}
                      <h3 className="text-sm sm:text-base font-extrabold text-[#18181B] dark:text-white truncate">
                        {team.name}
                      </h3>

                      {/* 3 Pílulas Coloridas de Retrospecto (V verde, E amarelo, D vermelho) */}
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#2fb34d] text-[11px] font-extrabold">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#38C958] text-white text-[9px] flex items-center justify-center font-black">
                            V
                          </span>
                          {rec.won}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold">
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-white text-[9px] flex items-center justify-center font-black">
                            E
                          </span>
                          {rec.drawn}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[11px] font-extrabold">
                          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-black">
                            D
                          </span>
                          {rec.lost}
                        </span>
                      </div>

                      {/* Subtítulo Roxo */}
                      <p className="text-[11px] font-bold text-[#7C5CFC] truncate">
                        {regionSubtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-zinc-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 2: JOGADORES / MERCADÃO (FOTO CIRCULAR + BIO + LINHA ROXA) */}
        {/* ================================================================= */}
        {activeTab === 'players' && (
          <div className="space-y-3">
            {filteredPlayers.map((player, idx) => {
              const posLabel =
                player.primary_position === 'ATA'
                  ? 'Atacante'
                  : player.primary_position === 'MEI' || player.primary_position === 'MC'
                  ? 'Meia'
                  : player.primary_position === 'VOL'
                  ? 'Volante'
                  : player.primary_position === 'GK'
                  ? 'Goleiro'
                  : 'Defensor';

              const footed = idx % 3 === 1 ? 'Canhoto' : 'Destro';
              const age = 19 + (idx % 6);

              return (
                <div
                  key={player.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-[#7C5CFC]/50 transition-all flex items-center justify-between gap-3"
                >
                  <Link
                    href="/player"
                    className="flex items-center gap-3.5 min-w-0 flex-1"
                  >
                    {/* Foto Circular do Atleta */}
                    <div className="w-14 h-14 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] font-black text-sm flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#7C5CFC]/20">
                      {player.avatar_url ? (
                        <img
                          src={player.avatar_url}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        player.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#18181B] dark:text-white truncate">
                          {player.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#38C958]/15 text-[#2fb34d] text-[10px] font-extrabold">
                          {player.platform || 'PS5'}
                        </span>
                      </div>

                      {/* Bio Curta */}
                      <p className="text-xs text-[#71717A] dark:text-zinc-400 line-clamp-1">
                        {player.bio ||
                          'Atleta competitivo EA FC 26 Pro Clubs • Disponível para peneira e jogos 5x5.'}
                      </p>

                      {/* Linha Roxa igual à print */}
                      <p className="text-[11px] font-bold text-[#7C5CFC] truncate pt-0.5">
                        {posLabel} • {footed} • {age} anos • Disponível 22h
                      </p>
                    </div>
                  </Link>

                  <a
                    href={`https://wa.me/5511998887766?text=${encodeURIComponent(
                      `Olá ${player.name}, vi seu perfil na busca do DraftClub Jogueiros PRO!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Convidar</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
