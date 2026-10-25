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
import {
  Users,
  RotateCcw,
  Wand2,
  Check,
  CheckCircle,
  Save,
  Award,
} from 'lucide-react';

function SquadBuilderContent() {
  const params = useParams();
  const tournamentId = (params?.id as string) || '';
  const teamId = (params?.teamId as string) || '';

  const [teamRoster, setTeamRoster] = useState<TournamentPlayerStats[]>([]);
  const [teamName, setTeamName] = useState('Meu Clube');
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
        if (teamId) {
          const { data: teamData } = await supabase
            .from('teams')
            .select('name, active_formation')
            .eq('id', teamId)
            .maybeSingle();
          if (teamData) {
            setTeamName(teamData.name);
            if (teamData.active_formation) {
              setFormation(teamData.active_formation);
            }
          }

          const { data: playersData } = await supabase
            .from('player_profiles')
            .select('*')
            .eq('team_id', teamId);

          if (playersData && playersData.length > 0) {
            const mapped: TournamentPlayerStats[] = playersData.map((p, idx) => ({
              tournament_id: tournamentId,
              player_id: p.id,
              name: p.character_name || p.name,
              archetype: p.archetype || 'Finalizador',
              archetypes: p.archetypes || [p.archetype || 'Finalizador'],
              positions_declared: p.positions_declared || [p.primary_position || 'ATA'],
              community_position: p.primary_position || 'ATA',
              community_confidence: 95,
              total_position_votes: 1,
              participant_role: idx === 0 ? 'captain' : 'player',
              is_captain: idx === 0,
              evaluation_count: 1,
              avg_mechanic: 85,
              avg_iq: 85,
              avg_teamplay: 85,
              overall_score: p.overall || 82,
              tier: 'A',
            }));
            setTeamRoster(mapped);
            await loadLineupFromDatabase(tournamentId, teamId, mapped);
          }
        }
      } catch {
        // Ignora erro
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
    setSaveStatus(ok ? 'Escalação tática salva com sucesso!' : 'Escalação atualizada.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-28">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BackButton fallbackHref="/captain" label="Voltar ao Time" />
              <span className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-white/[0.08] text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                Prancheta Oficial ({gameMode === '5v5' ? '5x5 + 1 Reserva' : '11v11'})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
              Squad Builder — {teamName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-[#0A0A0A] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setGameMode('5v5')}
                className={cn(
                  'h-9 px-3 rounded-lg text-xs font-semibold transition-all',
                  gameMode === '5v5'
                    ? 'bg-white text-black'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                Modo 5x5
              </button>
              <button
                type="button"
                onClick={() => setGameMode('11v11')}
                className={cn(
                  'h-9 px-3 rounded-lg text-xs font-semibold transition-all',
                  gameMode === '11v11'
                    ? 'bg-white text-black'
                    : 'text-[#A1A1AA] hover:text-white'
                )}
              >
                Modo 11v11
              </button>
            </div>

            <div className="flex items-center bg-[#0A0A0A] border border-white/[0.08] px-3.5 py-2 rounded-xl text-xs gap-3 h-10">
              <div className="border-r border-white/[0.08] pr-3">
                <span className="text-[#A1A1AA] mr-1.5">Titulares:</span>
                <span className="font-bold text-white">
                  {squadMetrics.count}/{squadMetrics.totalSlots}
                </span>
              </div>
              {gameMode === '5v5' && (
                <div className="border-r border-white/[0.08] pr-3">
                  <span className="text-[#A1A1AA] mr-1">6º Reserva:</span>
                  <span className="font-bold text-white">
                    {sixthManReserve ? '1/1' : '0/1'}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[#A1A1AA] mr-1">OVR:</span>
                <span className="font-bold text-white">
                  {squadMetrics.avgOverall > 0 ? squadMetrics.avgOverall : '—'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Tática'}</span>
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="p-3.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl text-xs text-[#10B981] flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}

        <div className="bg-[#0A0A0A] border border-white/[0.08] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Esquema Tático ({gameMode}):
            </label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="h-10 bg-[#141414] border border-white/[0.08] rounded-xl px-3 text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {gameMode === '5v5' ? (
                <optgroup label="Formações 5x5">
                  {Object.values(ALL_5V5_FORMATIONS).map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <optgroup label="Formações 11v11">
                  {Object.values(ALL_11V11_FORMATIONS).map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => autoAssignSquad(teamRoster)}
              className="h-10 px-3.5 rounded-xl bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              <span>Auto-Escalar</span>
            </button>

            <button
              onClick={clearPitch}
              className="h-10 px-3.5 rounded-xl bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-[#A1A1AA] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col items-center">
            {selectedBenchPlayer && (
              <div className="mb-3 px-4 py-2 rounded-xl bg-[#141414] border border-white/20 text-white text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>
                  Toque na posição no gramado para escalar{' '}
                  <strong>{selectedBenchPlayer.name}</strong>
                </span>
              </div>
            )}
            <Pitch />
          </div>

          <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-4 space-y-3">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A1A1AA]" />
                Elenco Disponível ({teamRoster.length})
              </h3>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                Selecione um atleta do elenco para posicionar no campo.
              </p>
            </div>

            {teamRoster.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A1A1AA]">
                Nenhum jogador vinculado a este clube ainda.
              </div>
            ) : (
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
                        'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between min-h-[56px]',
                        isSelected
                          ? 'bg-[#141414] border-white'
                          : onPitch
                          ? 'bg-[#0A0A0A] border-white/[0.05] opacity-60'
                          : 'bg-[#141414] border-white/[0.08] hover:border-white/20'
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
                          <span className="text-xs font-bold text-white block">
                            {player.name}
                          </span>
                          <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1">
                            <Award className="w-3 h-3" />
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
                          <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Escalado
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-300 font-semibold">
                            {isSelected ? 'Posicionar ↵' : 'Disponível'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
