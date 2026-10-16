'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TournamentPlayerStats } from '@/types/database';
import { SquadProvider, useSquad } from '@/components/builder/squad-context';
import { Pitch } from '@/components/builder/pitch';
import { BackButton } from '@/components/ui/back-button';
import {
  ALL_11V11_FORMATIONS,
  ALL_5V5_FORMATIONS,
  getEAStatColor,
  getPositionBadgeClass,
  cn,
} from '@/lib/utils';
import { FALLBACK_PLAYERS } from '@/lib/mock-league-data';
import {
  Users,
  RotateCcw,
  Wand2,
  Check,
  CheckCircle,
  Save,
  Award,
} from 'lucide-react';

const DEFAULT_ROSTER_FALLBACK: TournamentPlayerStats[] = FALLBACK_PLAYERS.map((p, idx) => ({
  tournament_id: '11111111-1111-1111-1111-111111111111',
  player_id: p.id,
  name: p.name,
  archetype: p.archetype || 'Mágico',
  archetypes: p.archetypes || ['Mágico'],
  positions_declared: p.positions_declared,
  community_position: p.primary_position || p.positions_declared[0] || 'MEI',
  community_confidence: 95,
  total_position_votes: 12,
  participant_role: idx === 0 ? 'captain' : 'player',
  is_captain: idx === 0,
  evaluation_count: 8,
  avg_mechanic: 88,
  avg_iq: 86,
  avg_teamplay: 90,
  overall_score: 88 - idx * 2,
  tier: idx < 2 ? 'S' : 'A',
}));

function SquadBuilderContent() {
  const params = useParams();
  const tournamentId = (params?.id as string) || '11111111-1111-1111-1111-111111111111';
  const teamId = (params?.teamId as string) || 'b1111111-1111-1111-1111-111111111111';

  const [teamRoster, setTeamRoster] = useState<TournamentPlayerStats[]>(DEFAULT_ROSTER_FALLBACK);
  const [teamName, setTeamName] = useState('Boca Juniors FC');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const {
    gameMode,
    setGameMode,
    formation,
    setFormation,
    assignments,
    sixthManReserve,
    selectedBenchPlayer,
    setSelectedBenchPlayer,
    autoAssignSquad,
    clearPitch,
    saveLineupToDatabase,
    loadLineupFromDatabase,
    isPlayerOnPitch,
  } = useSquad();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: teamData } = await supabase
          .from('teams')
          .select('name, active_formation')
          .eq('id', teamId)
          .single();
        if (teamData) {
          setTeamName(teamData.name);
          if (teamData.active_formation) {
            setFormation(teamData.active_formation);
          }
        }

        const { data: statsData } = await supabase
          .from('vw_tournament_player_stats')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('drafted_team_id', teamId);

        if (statsData && statsData.length > 0) {
          setTeamRoster(statsData as TournamentPlayerStats[]);
          await loadLineupFromDatabase(tournamentId, teamId, statsData as TournamentPlayerStats[]);
        }
      } catch (err) {
        console.warn('Erro ao carregar time:', err);
      }
    }
    loadData();
  }, [tournamentId, teamId, loadLineupFromDatabase, setFormation]);

  const squadMetrics = useMemo(() => {
    const assignedPlayers = Object.values(assignments).filter(
      (p): p is TournamentPlayerStats => p !== null
    );
    const count = assignedPlayers.length;
    const totalSlots = gameMode === '5v5' ? 5 : 11;
    const avgOverall =
      count > 0
        ? Math.round(
            (assignedPlayers.reduce((acc, p) => acc + (p.overall_score || 80), 0) / count) * 10
          ) / 10
        : 0;

    return { count, totalSlots, avgOverall };
  }, [assignments, gameMode]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const ok = await saveLineupToDatabase(tournamentId, teamId);
    setIsSaving(false);
    if (ok) {
      setSaveStatus('Escalação tática salva com sucesso!');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus('Escalação salva localmente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BackButton fallbackHref="/captain" label="Voltar ao Time" />
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                Prancheta Oficial ({gameMode === '5v5' ? '5x5 + 1 Reserva' : '11v11'})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Squad Builder — <span className="text-cyan-400">{teamName}</span>
            </h1>
          </div>

          {/* Toggle 5x5 vs 11v11 + Save */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
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
                ⚡ Modo 5x5 (Rush / LPF)
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

            <div className="flex items-center bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs gap-3 min-h-[44px]">
              <div className="border-r border-slate-800 pr-3">
                <span className="text-slate-400 font-medium mr-1.5">Titulares:</span>
                <span className="font-bold text-cyan-400">
                  {squadMetrics.count}/{squadMetrics.totalSlots}
                </span>
              </div>
              {gameMode === '5v5' && (
                <div className="border-r border-slate-800 pr-3">
                  <span className="text-slate-400 font-medium mr-1">6º Reserva:</span>
                  <span className="font-bold text-amber-400">
                    {sixthManReserve ? '1/1' : '0/1'}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-medium mr-1">OVR:</span>
                <span className="font-bold text-slate-100">
                  {squadMetrics.avgOverall > 0 ? squadMetrics.avgOverall : '—'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="min-h-[44px] py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Tática'}</span>
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Controls Bar: Formação Oficial EA FC 26 */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Esquema Tático ({gameMode}):
            </label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-cyan-400 focus:outline-none cursor-pointer"
            >
              {gameMode === '5v5' ? (
                <optgroup label="Formações 5x5 (5 Titulares + 1 Reserva)">
                  {Object.values(ALL_5V5_FORMATIONS).map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <>
                  <optgroup label="Formações com 4 Defensores">
                    {Object.values(ALL_11V11_FORMATIONS)
                      .filter((f) => f.category === '4-defenders')
                      .map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Formações com 5 Defensores">
                    {Object.values(ALL_11V11_FORMATIONS)
                      .filter((f) => f.category === '5-defenders')
                      .map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Formações com 3 Defensores">
                    {Object.values(ALL_11V11_FORMATIONS)
                      .filter((f) => f.category === '3-defenders')
                      .map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => autoAssignSquad(teamRoster)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <span>Auto-Escalar ({gameMode})</span>
            </button>

            <button
              onClick={clearPitch}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Tactical Pitch + Bench Panel */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col items-center">
            {selectedBenchPlayer && (
              <div className="mb-3 px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  Toque na posição no gramado (ou na vaga de 6º Reserva) para escalar{' '}
                  <strong>{selectedBenchPlayer.name}</strong>
                </span>
              </div>
            )}
            <Pitch />
          </div>

          {/* Elenco Lateral */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Elenco Disponível ({teamRoster.length})
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toque em um atleta para selecioná-lo e depois toque na posição desejada no campo.
              </p>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {teamRoster.map((player) => {
                const onPitch = isPlayerOnPitch(player.player_id);
                const isSelected = selectedBenchPlayer?.player_id === player.player_id;
                const statColor = getEAStatColor(player.overall_score || 80);

                return (
                  <div
                    key={player.player_id}
                    onClick={() => setSelectedBenchPlayer(isSelected ? null : player)}
                    className={cn(
                      'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between min-h-[56px]',
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400'
                        : onPitch
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-65'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs border',
                          statColor.badge
                        )}
                      >
                        {player.overall_score > 0 ? player.overall_score : '82'}
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-100 block">
                          {player.name}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          {player.archetype}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-1">
                        {player.positions_declared?.slice(0, 2).map((pos) => (
                          <span
                            key={pos}
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                              getPositionBadgeClass(pos)
                            )}
                          >
                            {pos}
                          </span>
                        ))}
                      </div>

                      {onPitch ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Escalado
                        </span>
                      ) : (
                        <span className="text-[10px] text-cyan-400 font-semibold">
                          {isSelected ? 'Posicionar ↵' : 'Disponível'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamSquadBuilderPage() {
  return (
    <SquadProvider initialFormation="5v5-1-2-1" initialGameMode="5v5">
      <SquadBuilderContent />
    </SquadProvider>
  );
}
