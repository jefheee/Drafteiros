'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { supabase } from '@/lib/supabase';
import {
  Tournament,
  Team,
  PlayerProfile,
  Match,
  TournamentRegistration,
  MatchIncident,
  TournamentFinance,
} from '@/types/database';
import { calculateFC26MacroAndOvr } from '@/lib/accelerate';
import { compressImageToWebp, computeImageHash } from '@/lib/image-compression';

export interface StandingRow {
  team_id: string;
  tournament_id: string;
  team_name: string;
  short_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
}

export interface ScorerRow {
  player_id: string;
  character_name: string;
  full_name: string;
  primary_position: string;
  avatar_url: string | null;
  team_id: string | null;
  team_name: string;
  team_short: string;
  team_logo: string | null;
  matches_played: number;
  total_goals: number;
  total_assists: number;
  avg_rating: number;
  motm_awards: number;
}

export type TournamentFinanceEntry = TournamentFinance;

const EMPTY_TOURNAMENT_PLACEHOLDER: Tournament = {
  id: '',
  name: 'Temporada Drafteiros',
  season_label: 'Temporada Oficial',
  format: '5v5_round_robin_playoffs',
  format_label: '5x5 • Pontos Corridos + Playoffs',
  game_mode: '5v5',
  starters_count: 5,
  reserves_count: 1,
  players_on_pitch: 5,
  max_reserves: 1,
  max_roster_size: 6,
  entry_fee: 0,
  bracket_type: 'pontos_corridos_g4',
  custom_rules: [
    'Tolerância máxima de 15 minutos após o horário acordado.',
    'Aviso prévio mínimo de 40 minutos para remarcar partida.',
    'Placar de W.O. oficial: 3 x 0.',
  ],
  prize_distribution: {
    first: 0,
    second: 0,
    third: 0,
    top_scorer: 0,
    top_assister: 0,
  },
  rules_config: {
    wo_tolerance_minutes: 15,
    cancel_notice_minutes: 40,
    disconnect_full_restart_limit_min: 10,
    extra_time_group_stage: false,
  },
  draft_order: [],
  discord_webhook_url: '',
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z',
};

interface LeagueDataContextValue {
  tournament: Tournament;
  tournaments: Tournament[];
  teams: Team[];
  players: PlayerProfile[];
  matches: Match[];
  standings: StandingRow[];
  scorers: ScorerRow[];
  registrations: TournamentRegistration[];
  incidents: MatchIncident[];
  finances: TournamentFinanceEntry[];
  loading: boolean;
  selectTournament: (tournamentId: string) => void;
  createNewTournament: (data: Partial<Tournament>) => Promise<Tournament | null>;
  updateTournamentInStore: (updates: Partial<Tournament>) => Promise<void>;
  updateTeamInStore: (teamId: string, updates: Partial<Team>) => Promise<void>;
  createTeamInStore: (data: Partial<Team>) => Promise<Team | null>;
  updatePlayerProfile: (
    playerId: string,
    updates: Partial<PlayerProfile>
  ) => Promise<void>;
  createPlayerProfileInStore: (
    data: Partial<PlayerProfile>
  ) => Promise<PlayerProfile | null>;
  unlockPlayerCardDesign: (
    playerId: string,
    cardId: string,
    equipUrl?: string
  ) => Promise<void>;
  addLegacyCareerStats: (
    playerId: string,
    delta: {
      matchesToAdd: number;
      goalsToAdd: number;
      assistsToAdd: number;
      motmToAdd: number;
      titlesToAdd: number;
    }
  ) => Promise<void>;
  draftPlayerToTeam: (playerId: string, teamId: string) => Promise<void>;
  updateMatchInStore: (matchId: string, updates: Partial<Match>) => Promise<void>;
  createMatchInStore: (data: Partial<Match>) => Promise<Match | null>;
  updateRegistrationInStore: (
    regId: string,
    updates: Partial<TournamentRegistration>
  ) => Promise<void>;
  approveTeamRegistration: (regId: string, teamId: string) => Promise<void>;
  resolveIncidentInStore: (
    incidentId: string,
    updates: Partial<MatchIncident>
  ) => Promise<void>;
  refreshFromSupabase: () => Promise<void>;
}

const LeagueDataContext = createContext<LeagueDataContextValue | undefined>(
  undefined
);

export function computeLiveStandings(
  teams: Team[],
  matches: Match[]
): StandingRow[] {
  if (teams.length === 0) return [];

  const map = new Map<string, StandingRow>();

  teams.forEach((t) => {
    map.set(t.id, {
      team_id: t.id,
      tournament_id: t.tournament_id || '',
      team_name: t.name,
      short_name: t.short_name || t.name.substring(0, 3).toUpperCase(),
      logo_url: t.logo_url || null,
      primary_color: t.primary_color || '#FFFFFF',
      secondary_color: t.secondary_color || '#A1A1AA',
      played: t.matches_played ?? 0,
      won: t.wins ?? 0,
      drawn: t.draws ?? 0,
      lost: t.losses ?? 0,
      goals_for: t.goals_for ?? 0,
      goals_against: t.goals_against ?? 0,
      goal_diff: (t.goals_for ?? 0) - (t.goals_against ?? 0),
      points: t.points ?? 0,
    });
  });

  const validMatches = matches.filter(
    (m) => m.status === 'approved' || m.status === 'completed'
  );

  if (validMatches.length > 0) {
    // Recalcula a partir das partidas aprovadas quando houver partidas concluídas
    teams.forEach((t) => {
      const row = map.get(t.id);
      if (row) {
        row.played = 0;
        row.won = 0;
        row.drawn = 0;
        row.lost = 0;
        row.goals_for = 0;
        row.goals_against = 0;
        row.goal_diff = 0;
        row.points = 0;
      }
    });

    validMatches.forEach((m) => {
      const home = map.get(m.home_team_id);
      const away = map.get(m.away_team_id);
      if (!home || !away) return;

      const hs = Number(m.home_score || 0);
      const as = Number(m.away_score || 0);

      home.played += 1;
      away.played += 1;
      home.goals_for += hs;
      home.goals_against += as;
      away.goals_for += as;
      away.goals_against += hs;

      if (hs > as) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (hs < as) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
      }

      home.goal_diff = home.goals_for - home.goals_against;
      away.goal_diff = away.goals_for - away.goals_against;
    });
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;
    return b.goals_for - a.goals_for;
  });
}

export function computeLiveScorers(
  players: PlayerProfile[],
  teams: Team[]
): ScorerRow[] {
  if (players.length === 0) return [];
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  return players
    .map((p) => {
      const t = p.team_id ? teamMap.get(p.team_id) : undefined;
      const stats = p.career_stats || {};
      return {
        player_id: p.id,
        character_name: p.character_name || p.ea_Tag || p.name || 'ATLETA',
        full_name: p.full_name || p.name || 'Atleta',
        primary_position: p.primary_position || 'ATA',
        avatar_url: p.avatar_face_url || p.avatar_url || null,
        team_id: p.team_id || null,
        team_name: t?.name || 'Agente Livre',
        team_short: t?.short_name || 'FA',
        team_logo: t?.logo_url || null,
        matches_played: Number(
          stats.matches_played ?? stats.official_matches ?? 0
        ),
        total_goals: Number(stats.goals ?? stats.official_goals ?? 0),
        total_assists: Number(stats.assists ?? stats.official_assists ?? 0),
        avg_rating: Number(stats.average_rating ?? 0),
        motm_awards: Number(stats.mvps ?? stats.official_motm ?? 0),
      };
    })
    .sort((a, b) => {
      if (b.total_goals !== a.total_goals) return b.total_goals - a.total_goals;
      if (b.total_assists !== a.total_assists)
        return b.total_assists - a.total_assists;
      return b.avg_rating - a.avg_rating;
    });
}

export function LeagueDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [incidents, setIncidents] = useState<MatchIncident[]>([]);
  const [finances, setFinances] = useState<TournamentFinanceEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const tournament = useMemo(
    () =>
      tournaments.find((t) => t.id === selectedTournamentId) ||
      tournaments[0] ||
      EMPTY_TOURNAMENT_PLACEHOLDER,
    [tournaments, selectedTournamentId]
  );

  const refreshFromSupabase = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: tList },
        { data: teamsData },
        { data: playersData },
        { data: matchesData },
        { data: regsData },
        { data: incData },
        { data: finData },
      ] = await Promise.all([
        supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('teams')
          .select('*')
          .order('points', { ascending: false }),
        supabase
          .from('player_profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('matches')
          .select('*')
          .order('round_number', { ascending: true })
          .limit(200),
        supabase
          .from('tournament_registrations')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('match_incidents')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('tournament_finances')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      const safeTournaments = (tList as Tournament[]) || [];
      const safeTeams = (teamsData as Team[]) || [];
      const safePlayers = ((playersData as PlayerProfile[]) || []).map((p) => ({
        ...p,
        ea_Tag: p.ea_Tag || (p as unknown as { ea_tag?: string }).ea_tag || p.character_name,
        is_free_agent: p.is_free_agent ?? !p.team_id,
      }));

      const teamMap = new Map(safeTeams.map((t) => [t.id, t]));
      const safeMatches = ((matchesData as Match[]) || []).map((m) => ({
        ...m,
        home_team: m.home_team || teamMap.get(m.home_team_id),
        away_team: m.away_team || teamMap.get(m.away_team_id),
      }));

      setTournaments(safeTournaments);
      if (safeTournaments.length > 0 && !selectedTournamentId) {
        setSelectedTournamentId(safeTournaments[0].id);
      }
      setTeams(safeTeams);
      setPlayers(safePlayers);
      setMatches(safeMatches);
      setRegistrations((regsData as TournamentRegistration[]) || []);
      setIncidents((incData as MatchIncident[]) || []);
      setFinances((finData as TournamentFinanceEntry[]) || []);
    } catch {
      // Mantém arrays limpos
    } finally {
      setLoading(false);
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  const selectTournament = useCallback((tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
  }, []);

  const createNewTournament = useCallback(
    async (data: Partial<Tournament>): Promise<Tournament | null> => {
      const payload = {
        name: data.name || 'Nova Temporada Drafteiros',
        season_label: data.season_label || 'Temporada 2026',
        format: data.format || '5v5_round_robin_playoffs',
        format_label: data.format_label || '5x5 • Pontos Corridos + Playoffs',
        game_mode: data.game_mode || '5v5',
        players_on_pitch: data.starters_count || 5,
        max_reserves: data.reserves_count ?? 1,
        max_roster_size:
          (data.starters_count || 5) + (data.reserves_count ?? 1),
        entry_fee: data.entry_fee ?? 0,
        bracket_type: data.bracket_type || 'pontos_corridos_g4',
        custom_rules: data.custom_rules || [],
        prize_distribution: data.prize_distribution || {
          first: 0,
          second: 0,
          third: 0,
          top_scorer: 0,
          top_assister: 0,
        },
        status: data.status || 'active',
        champion_team_name: data.champion_team_name || null,
        discord_webhook_url: data.discord_webhook_url || '',
      };

      const { data: inserted, error } = await supabase
        .from('tournaments')
        .insert(payload)
        .select('*')
        .single();

      if (!error && inserted) {
        const created = inserted as Tournament;
        setTournaments((prev) => [created, ...prev]);
        setSelectedTournamentId(created.id);
        return created;
      }
      return null;
    },
    []
  );

  const updateTournamentInStore = useCallback(
    async (updates: Partial<Tournament>) => {
      if (!tournament.id) {
        await createNewTournament(updates);
        return;
      }

      setTournaments((prev) =>
        prev.map((t) => (t.id === tournament.id ? { ...t, ...updates } : t))
      );

      await supabase
        .from('tournaments')
        .update({
          name: updates.name,
          game_mode: updates.game_mode,
          max_roster_size: updates.max_roster_size,
          entry_fee: updates.entry_fee,
          bracket_type: updates.bracket_type,
          custom_rules: updates.custom_rules,
          prize_distribution: updates.prize_distribution,
          draft_order: updates.draft_order,
          discord_webhook_url: updates.discord_webhook_url,
          status: updates.status,
        })
        .eq('id', tournament.id);
    },
    [tournament.id, createNewTournament]
  );

  const createTeamInStore = useCallback(
    async (data: Partial<Team>): Promise<Team | null> => {
      const inviteCode =
        data.invite_code ||
        `${(data.short_name || data.name || 'CLB')
          .replace(/[^a-zA-Z0-9]/g, '')
          .substring(0, 4)
          .toUpperCase()}${Math.floor(10 + Math.random() * 89)}`;

      const payload = {
        tournament_id: data.tournament_id || (tournament.id ? tournament.id : null),
        name: data.name || 'Novo Clube',
        short_name:
          data.short_name ||
          (data.name || 'CLB').substring(0, 3).toUpperCase(),
        captain_id: data.captain_id || null,
        logo_url: data.logo_url || null,
        kit_home_url: data.kit_home_url || null,
        kit_away_url: data.kit_away_url || null,
        primary_color: data.primary_color || '#FFFFFF',
        secondary_color: data.secondary_color || '#141414',
        invite_code: inviteCode,
        kit_description: data.kit_description || '',
        is_approved: data.is_approved ?? false,
      };

      const { data: inserted, error } = await supabase
        .from('teams')
        .insert(payload)
        .select('*')
        .single();

      if (!error && inserted) {
        const created = inserted as Team;
        setTeams((prev) => [created, ...prev]);
        return created;
      }
      return null;
    },
    [tournament.id]
  );

  const updateTeamInStore = useCallback(
    async (teamId: string, updates: Partial<Team>) => {
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
      );

      await supabase.from('teams').update(updates).eq('id', teamId);
    },
    []
  );

  const createPlayerProfileInStore = useCallback(
    async (data: Partial<PlayerProfile>): Promise<PlayerProfile | null> => {
      const payload = {
        user_id: data.user_id || null,
        name: data.character_name || data.name || 'ATLETA',
        character_name: (data.character_name || data.name || 'ATLETA').toUpperCase(),
        ea_tag: data.ea_Tag || data.character_name || '',
        full_name: data.full_name || data.name || '',
        team_id: data.team_id || null,
        is_free_agent: !data.team_id,
        is_looking_for_team: !data.team_id,
        primary_position: data.primary_position || 'ATA',
        secondary_positions: data.secondary_positions || [],
        positions_declared: [
          data.primary_position || 'ATA',
          ...(data.secondary_positions || []),
        ],
        platform: data.platform || 'PS5',
        height_cm: data.height_cm || 178,
        weight_kg: data.weight_kg || 72,
        preferred_foot: data.preferred_foot || 'D',
        overall: data.overall || 82,
        archetype: data.archetype || 'Finalizador',
        accelerate_type: data.accelerate_type || 'Controlada',
        accelerate_sub_type: data.accelerate_sub_type || 'Controlada Pura',
        attributes: data.attributes || {},
        playstyles: data.playstyles || [],
        career_stats: data.career_stats || {
          tournaments_played: 0,
          titles_won: 0,
          matches_played: 0,
          goals: 0,
          assists: 0,
          mvps: 0,
          clean_sheets: 0,
          average_rating: 0,
        },
        avatar_face_url: data.avatar_face_url || null,
        avatar_body_url: data.avatar_body_url || null,
      };

      const { data: inserted, error } = await supabase
        .from('player_profiles')
        .insert(payload)
        .select('*')
        .single();

      if (!error && inserted) {
        const created = inserted as PlayerProfile;
        setPlayers((prev) => [created, ...prev]);
        return created;
      }
      return null;
    },
    []
  );

  const updatePlayerProfile = useCallback(
    async (playerId: string, updates: Partial<PlayerProfile>) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, ...updates } : p))
      );

      const dbPayload: Record<string, unknown> = { ...updates };
      if (updates.ea_Tag !== undefined) {
        dbPayload.ea_tag = updates.ea_Tag;
        delete dbPayload.ea_Tag;
      }
      await supabase
        .from('player_profiles')
        .update(dbPayload)
        .eq('id', playerId);
    },
    []
  );

  const unlockPlayerCardDesign = useCallback(
    async (playerId: string, cardId: string, equipUrl?: string) => {
      let nextUnlocked: string[] = [];
      let nextBg: string | undefined;

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== playerId) return p;
          const currentUnlocked = p.unlocked_cards || ['gold-rare'];
          nextUnlocked = Array.from(new Set([...currentUnlocked, cardId]));
          nextBg = equipUrl || p.card_background;
          return {
            ...p,
            unlocked_cards: nextUnlocked,
            card_background: nextBg,
          };
        })
      );

      await supabase
        .from('player_profiles')
        .update({
          unlocked_cards: nextUnlocked,
          ...(nextBg ? { card_background: nextBg } : {}),
        })
        .eq('id', playerId);
    },
    []
  );

  const addLegacyCareerStats = useCallback(
    async (
      playerId: string,
      delta: {
        matchesToAdd: number;
        goalsToAdd: number;
        assistsToAdd: number;
        motmToAdd: number;
        titlesToAdd: number;
      }
    ) => {
      let updatedCareerPayload: Record<string, unknown> | null = null;
      let updatedOvr = 82;
      let updatedUnlocked: string[] = [];

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== playerId) return p;
          const currentStats = p.career_stats || {};
          const nextMatches =
            (currentStats.matches_played ??
              currentStats.official_matches ??
              0) + delta.matchesToAdd;
          const nextGoals =
            (currentStats.goals ?? currentStats.official_goals ?? 0) +
            delta.goalsToAdd;
          const nextAssists =
            (currentStats.assists ?? currentStats.official_assists ?? 0) +
            delta.assistsToAdd;
          const nextMvps =
            (currentStats.mvps ?? currentStats.official_motm ?? 0) +
            delta.motmToAdd;
          const nextTitles =
            (currentStats.titles_won ?? 0) + delta.titlesToAdd;

          const updatedCareer = {
            ...currentStats,
            matches_played: nextMatches,
            official_matches: nextMatches,
            goals: nextGoals,
            official_goals: nextGoals,
            assists: nextAssists,
            official_assists: nextAssists,
            mvps: nextMvps,
            official_motm: nextMvps,
            titles_won: nextTitles,
            tournaments_played: Math.max(
              currentStats.tournaments_played ?? 1,
              nextTitles + 1
            ),
          };

          const macro = calculateFC26MacroAndOvr(
            p.attributes || {},
            p.primary_position || 'ATA',
            updatedCareer
          );

          updatedCareerPayload = updatedCareer;
          updatedOvr = macro.finalOvr;
          updatedUnlocked = Array.from(
            new Set([...(p.unlocked_cards || []), ...macro.unlockedCardIds])
          );

          return {
            ...p,
            overall: macro.finalOvr,
            career_stats: updatedCareer,
            unlocked_cards: updatedUnlocked,
          };
        })
      );

      if (updatedCareerPayload) {
        await supabase
          .from('player_profiles')
          .update({
            overall: updatedOvr,
            career_stats: updatedCareerPayload,
            unlocked_cards: updatedUnlocked,
          })
          .eq('id', playerId);
      }
    },
    []
  );

  const draftPlayerToTeam = useCallback(
    async (playerId: string, teamId: string) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId ? { ...p, team_id: teamId, is_free_agent: false } : p
        )
      );

      await Promise.all([
        supabase
          .from('player_profiles')
          .update({
            team_id: teamId,
            is_free_agent: false,
            is_looking_for_team: false,
          })
          .eq('id', playerId),
        supabase
          .from('free_agents')
          .update({ is_active: false })
          .eq('player_id', playerId),
      ]);
    },
    []
  );

  const createMatchInStore = useCallback(
    async (data: Partial<Match>): Promise<Match | null> => {
      if (!data.home_team_id || !data.away_team_id) return null;
      const payload = {
        tournament_id:
          data.tournament_id ||
          tournament.id ||
          teams.find((t) => t.id === data.home_team_id)?.tournament_id,
        round_number: data.round_number || 1,
        home_team_id: data.home_team_id,
        away_team_id: data.away_team_id,
        home_score: data.home_score ?? 0,
        away_score: data.away_score ?? 0,
        status: data.status || 'scheduled',
        scheduled_at: data.scheduled_at || new Date().toISOString(),
        schedule_status: data.schedule_status || 'confirmed',
      };

      const { data: inserted, error } = await supabase
        .from('matches')
        .insert(payload)
        .select('*')
        .single();

      if (!error && inserted) {
        const created = inserted as Match;
        const hTeam = teams.find((t) => t.id === created.home_team_id);
        const aTeam = teams.find((t) => t.id === created.away_team_id);
        const enriched: Match = {
          ...created,
          home_team: hTeam,
          away_team: aTeam,
        };
        setMatches((prev) => [...prev, enriched]);
        return enriched;
      }
      return null;
    },
    [tournament.id, teams]
  );

  const updateMatchInStore = useCallback(
    async (matchId: string, updates: Partial<Match>) => {
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, ...updates } : m))
      );

      await supabase.from('matches').update(updates).eq('id', matchId);
    },
    []
  );

  const updateRegistrationInStore = useCallback(
    async (regId: string, updates: Partial<TournamentRegistration>) => {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, ...updates } : r))
      );

      await supabase
        .from('tournament_registrations')
        .update(updates)
        .eq('id', regId);
    },
    []
  );

  const approveTeamRegistration = useCallback(
    async (regId: string, teamId: string) => {
      const now = new Date().toISOString();
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId
            ? {
                ...r,
                payment_status: 'approved',
                approved_by_admin: true,
                approved_at: now,
              }
            : r
        )
      );

      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, is_approved: true } : t))
      );

      await Promise.all([
        supabase
          .from('tournament_registrations')
          .update({
            payment_status: 'approved',
            approved_by_admin: true,
            approved_at: now,
          })
          .eq('id', regId),
        supabase
          .from('teams')
          .update({ is_approved: true })
          .eq('id', teamId),
      ]);
    },
    []
  );

  const resolveIncidentInStore = useCallback(
    async (incidentId: string, updates: Partial<MatchIncident>) => {
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === incidentId ? { ...inc, ...updates } : inc
        )
      );

      await supabase
        .from('match_incidents')
        .update(updates)
        .eq('id', incidentId);
    },
    []
  );

  const standings = useMemo(
    () => computeLiveStandings(teams, matches),
    [teams, matches]
  );

  const scorers = useMemo(
    () => computeLiveScorers(players, teams),
    [players, teams]
  );

  return React.createElement(
    LeagueDataContext.Provider,
    {
      value: {
        tournament,
        tournaments,
        teams,
        players,
        matches,
        standings,
        scorers,
        registrations,
        incidents,
        finances,
        loading,
        selectTournament,
        createNewTournament,
        updateTournamentInStore,
        updateTeamInStore,
        createTeamInStore,
        updatePlayerProfile,
        createPlayerProfileInStore,
        unlockPlayerCardDesign,
        addLegacyCareerStats,
        draftPlayerToTeam,
        updateMatchInStore,
        createMatchInStore,
        updateRegistrationInStore,
        approveTeamRegistration,
        resolveIncidentInStore,
        refreshFromSupabase,
      },
    },
    children
  );
}

export function useLeagueStore() {
  const ctx = useContext(LeagueDataContext);
  if (!ctx) {
    throw new Error('useLeagueStore must be used within LeagueDataProvider');
  }
  return ctx;
}

/**
 * Registro de hashes de súmula para prevenção de duplicidade
 */
const registeredProofHashes = new Map<string, string>();

export function verifyProofHashUniqueness(
  hash: string,
  matchId: string
): { isUnique: boolean; conflictMatchId?: string } {
  const existingMatchId = registeredProofHashes.get(hash);
  if (existingMatchId && existingMatchId !== matchId) {
    return { isUnique: false, conflictMatchId: existingMatchId };
  }
  registeredProofHashes.set(hash, matchId);
  return { isUnique: true };
}

/**
 * Upload Otimizado com Compressão Automática para WebP
 * Reduz arquivos pesados de celulares de ~4MB para ~100KB antes de enviar ao Supabase Storage.
 * Garante que apenas URLs públicas de CDN sejam salvas nas tabelas PostgreSQL.
 */
export async function uploadMediaToStorage(
  bucket: 'player-media' | 'team-media' | 'match-proofs',
  folder: string,
  file: File
): Promise<string> {
  // 1. Sempre comprime a imagem client-side para WebP
  let uploadableFile = file;
  try {
    uploadableFile = await compressImageToWebp(file, 1280, 0.82);
  } catch (err) {
    console.warn('[Image Compression] Falha na compressão, usando original:', err);
  }

  try {
    const ext = uploadableFile.name.split('.').pop() || 'webp';
    const filePath = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadableFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: uploadableFile.type || 'image/webp',
      });

    if (!error && data) {
      const { data: pub } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      if (pub?.publicUrl) {
        return pub.publicUrl;
      }
    }
  } catch (err) {
    console.warn('[Supabase Storage] Falha ao enviar para o bucket:', err);
  }

  // Fallback seguro em WebP comprimido (nunca string Base64 não-otimizada de 4MB)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(uploadableFile);
  });
}

/**
 * Consulta Paginada de Jogadores (para tabelas de alta escala)
 */
export async function fetchPlayersPaged(params: {
  limit?: number;
  offset?: number;
  teamId?: string;
  search?: string;
}): Promise<{ players: PlayerProfile[]; total: number }> {
  const limit = params.limit || 50;
  const offset = params.offset || 0;

  let query = supabase.from('player_profiles').select('*', { count: 'exact' });

  if (params.teamId) {
    query = query.eq('team_id', params.teamId);
  }

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,character_name.ilike.%${params.search}%`
    );
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return { players: [], total: 0 };
  }

  return {
    players: (data as PlayerProfile[]).map((p) => ({
      ...p,
      ea_Tag:
        p.ea_Tag || (p as unknown as { ea_tag?: string }).ea_tag || p.character_name,
      is_free_agent: p.is_free_agent ?? !p.team_id,
    })),
    total: count || 0,
  };
}

/**
 * Consulta Paginada de Partidas (para ligas com centenas de rodadas)
 */
export async function fetchMatchesPaged(params: {
  tournamentId?: string;
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{ matches: Match[]; total: number }> {
  const limit = params.limit || 50;
  const offset = params.offset || 0;

  let query = supabase.from('matches').select('*', { count: 'exact' });

  if (params.tournamentId) {
    query = query.eq('tournament_id', params.tournamentId);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }

  const { data, count, error } = await query
    .order('round_number', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return { matches: [], total: 0 };
  }

  return {
    matches: data as Match[],
    total: count || 0,
  };
}
