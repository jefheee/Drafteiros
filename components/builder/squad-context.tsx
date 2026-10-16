'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  PitchPositionSlot,
  TournamentPlayerStats,
  FormationPreset,
  GameMode,
} from '@/types/database';
import { ALL_11V11_FORMATIONS, ALL_5V5_FORMATIONS } from '@/lib/utils';

interface SquadContextType {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  formation: string;
  setFormation: (formation: string) => void;
  slots: PitchPositionSlot[];
  assignments: Record<string, TournamentPlayerStats | null>;
  sixthManReserve: TournamentPlayerStats | null;
  setSixthManReserve: (player: TournamentPlayerStats | null) => void;
  selectedBenchPlayer: TournamentPlayerStats | null;
  setSelectedBenchPlayer: (player: TournamentPlayerStats | null) => void;
  assignPlayerToSlot: (slotId: string, player: TournamentPlayerStats) => void;
  removePlayerFromSlot: (slotId: string) => void;
  autoAssignSquad: (availablePlayers: TournamentPlayerStats[]) => void;
  clearPitch: () => void;
  saveLineupToDatabase: (tournamentId: string, teamId: string) => Promise<boolean>;
  isPlayerOnPitch: (playerId: string) => boolean;
  loadLineupFromDatabase: (
    tournamentId: string,
    teamId: string,
    roster: TournamentPlayerStats[]
  ) => Promise<void>;
}

const SquadContext = createContext<SquadContextType | null>(null);

export function SquadProvider({
  children,
  initialFormation = '5v5-1-2-1',
  initialGameMode = '5v5',
}: {
  children: React.ReactNode;
  initialFormation?: string;
  initialGameMode?: GameMode;
}) {
  const [gameMode, setGameModeState] = useState<GameMode>(initialGameMode);
  const [formation, setFormationState] = useState<string>(initialFormation);
  const [assignments, setAssignments] = useState<Record<string, TournamentPlayerStats | null>>({});
  const [sixthManReserve, setSixthManReserve] = useState<TournamentPlayerStats | null>(null);
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState<TournamentPlayerStats | null>(null);

  const allFormations = useMemo(
    () => ({ ...ALL_11V11_FORMATIONS, ...ALL_5V5_FORMATIONS }),
    []
  );

  const currentPreset: FormationPreset = useMemo(() => {
    if (gameMode === '5v5') {
      return ALL_5V5_FORMATIONS[formation] || ALL_5V5_FORMATIONS['5v5-1-2-1'];
    }
    return ALL_11V11_FORMATIONS[formation] || ALL_11V11_FORMATIONS['4-3-3'];
  }, [gameMode, formation]);

  const slots = currentPreset.slots;

  const setGameMode = useCallback((mode: GameMode) => {
    setGameModeState(mode);
    if (mode === '5v5') {
      setFormationState('5v5-1-2-1');
    } else {
      setFormationState('4-3-3');
    }
    setAssignments({});
  }, []);

  const setFormation = useCallback(
    (newFormation: string) => {
      if (allFormations[newFormation]) {
        setFormationState(newFormation);
        if (ALL_5V5_FORMATIONS[newFormation]) {
          setGameModeState('5v5');
        } else {
          setGameModeState('11v11');
        }
      }
    },
    [allFormations]
  );

  const assignPlayerToSlot = useCallback((slotId: string, player: TournamentPlayerStats) => {
    if (slotId === 'reserve_6th') {
      setSixthManReserve(player);
      setSelectedBenchPlayer(null);
      return;
    }
    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k]?.player_id === player.player_id) {
          next[k] = null;
        }
      });
      next[slotId] = player;
      return next;
    });
    setSelectedBenchPlayer(null);
  }, []);

  const removePlayerFromSlot = useCallback((slotId: string) => {
    if (slotId === 'reserve_6th') {
      setSixthManReserve(null);
      return;
    }
    setAssignments((prev) => ({ ...prev, [slotId]: null }));
  }, []);

  const clearPitch = useCallback(() => {
    setAssignments({});
    setSixthManReserve(null);
  }, []);

  const isPlayerOnPitch = useCallback(
    (playerId: string) =>
      Object.values(assignments).some((p) => p?.player_id === playerId) ||
      sixthManReserve?.player_id === playerId,
    [assignments, sixthManReserve]
  );

  const autoAssignSquad = useCallback(
    (availablePlayers: TournamentPlayerStats[]) => {
      const newAssignments: Record<string, TournamentPlayerStats | null> = {};
      const used = new Set<string>();

      slots.forEach((slot) => {
        const match = availablePlayers.find(
          (p) =>
            !used.has(p.player_id) &&
            (p.positions_declared?.includes(slot.positionCode) ||
              p.community_position === slot.positionCode)
        );

        if (match) {
          newAssignments[slot.slotId] = match;
          used.add(match.player_id);
        } else {
          const fallback = availablePlayers.find((p) => !used.has(p.player_id));
          if (fallback) {
            newAssignments[slot.slotId] = fallback;
            used.add(fallback.player_id);
          }
        }
      });

      setAssignments(newAssignments);

      if (gameMode === '5v5') {
        const sixth = availablePlayers.find((p) => !used.has(p.player_id)) || null;
        setSixthManReserve(sixth);
      }
    },
    [slots, gameMode]
  );

  const saveLineupToDatabase = useCallback(
    async (tournamentId: string, teamId: string): Promise<boolean> => {
      try {
        await supabase
          .from('teams')
          .update({ active_formation: formation })
          .eq('id', teamId);

        const upsertPromises = slots.map((slot) => {
          const assigned = assignments[slot.slotId];
          return supabase.from('squad_lineups').upsert(
            {
              tournament_id: tournamentId,
              team_id: teamId,
              slot_id: slot.slotId,
              position_code: slot.positionCode,
              player_id: assigned ? assigned.player_id : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'team_id,slot_id' }
          );
        });

        await Promise.all(upsertPromises);
        return true;
      } catch (e) {
        console.warn('Erro ao persistir escalação:', e);
        return false;
      }
    },
    [formation, slots, assignments]
  );

  const loadLineupFromDatabase = useCallback(
    async (tournamentId: string, teamId: string, roster: TournamentPlayerStats[]) => {
      try {
        const { data: teamData } = await supabase
          .from('teams')
          .select('active_formation')
          .eq('id', teamId)
          .single();

        if (teamData?.active_formation && allFormations[teamData.active_formation]) {
          setFormationState(teamData.active_formation);
          if (ALL_5V5_FORMATIONS[teamData.active_formation]) {
            setGameModeState('5v5');
          } else {
            setGameModeState('11v11');
          }
        }

        const { data: lineupData } = await supabase
          .from('squad_lineups')
          .select('*')
          .eq('team_id', teamId);

        if (lineupData && lineupData.length > 0) {
          const loadedAssignments: Record<string, TournamentPlayerStats | null> = {};
          lineupData.forEach((row) => {
            if (row.player_id) {
              const matchedPlayer = roster.find((p) => p.player_id === row.player_id);
              if (matchedPlayer) {
                loadedAssignments[row.slot_id] = matchedPlayer;
              }
            }
          });
          setAssignments(loadedAssignments);
        }
      } catch (e) {
        console.warn('Erro ao carregar escalação salva:', e);
      }
    },
    [allFormations]
  );

  const value = useMemo(
    () => ({
      gameMode,
      setGameMode,
      formation,
      setFormation,
      slots,
      assignments,
      sixthManReserve,
      setSixthManReserve,
      selectedBenchPlayer,
      setSelectedBenchPlayer,
      assignPlayerToSlot,
      removePlayerFromSlot,
      autoAssignSquad,
      clearPitch,
      saveLineupToDatabase,
      loadLineupFromDatabase,
      isPlayerOnPitch,
    }),
    [
      gameMode,
      setGameMode,
      formation,
      setFormation,
      slots,
      assignments,
      sixthManReserve,
      selectedBenchPlayer,
      assignPlayerToSlot,
      removePlayerFromSlot,
      autoAssignSquad,
      clearPitch,
      saveLineupToDatabase,
      loadLineupFromDatabase,
      isPlayerOnPitch,
    ]
  );

  return <SquadContext.Provider value={value}>{children}</SquadContext.Provider>;
}

export function useSquad() {
  const context = useContext(SquadContext);
  if (!context) throw new Error('useSquad deve ser utilizado dentro de SquadProvider');
  return context;
}
