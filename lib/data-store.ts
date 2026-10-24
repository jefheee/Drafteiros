'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Tournament,
  Team,
  PlayerProfile,
  Match,
  TournamentStanding,
  TopScorer,
  TopAssist,
  TournamentRegistration,
  MatchIncident,
  TournamentFinance,
  DraftOrderSlot,
} from '@/types/database';
import {
  FALLBACK_TOURNAMENT,
  FALLBACK_TOURNAMENTS,
  FALLBACK_PAST_TOURNAMENT,
  FALLBACK_TEAMS,
  FALLBACK_PLAYERS,
  FALLBACK_MATCHES,
  FALLBACK_STANDINGS,
  FALLBACK_SCORERS,
  FALLBACK_ASSISTS,
  FALLBACK_REGISTRATIONS,
  FALLBACK_INCIDENTS,
  FALLBACK_FINANCES,
} from '@/lib/mock-league-data';
import { calculateFC26MacroAndOvr } from '@/lib/accelerate';

const STORE_KEY = 'draftclub_persistent_state_v2';
const EVENT_NAME = 'draftclub-store-sync';

export interface LeagueStoreState {
  tournaments: Tournament[];
  activeTournamentId: string;
  teams: Team[];
  players: PlayerProfile[];
  matches: Match[];
  standings: TournamentStanding[];
  scorers: TopScorer[];
  assists: TopAssist[];
  registrations: TournamentRegistration[];
  incidents: MatchIncident[];
  finances: TournamentFinance[];
}

function getBaseStoreState(): LeagueStoreState {
  return {
    tournaments: FALLBACK_TOURNAMENTS,
    activeTournamentId: FALLBACK_TOURNAMENT.id,
    teams: FALLBACK_TEAMS,
    players: FALLBACK_PLAYERS,
    matches: FALLBACK_MATCHES,
    standings: FALLBACK_STANDINGS,
    scorers: FALLBACK_SCORERS,
    assists: FALLBACK_ASSISTS,
    registrations: FALLBACK_REGISTRATIONS,
    incidents: FALLBACK_INCIDENTS,
    finances: FALLBACK_FINANCES,
  };
}

function getInitialStoreState(): LeagueStoreState {
  const base = getBaseStoreState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<LeagueStoreState>;
    const mergedTournaments =
      parsed.tournaments && parsed.tournaments.length > 0
        ? parsed.tournaments.some((t) => t.id === FALLBACK_PAST_TOURNAMENT.id)
          ? parsed.tournaments
          : [...parsed.tournaments, FALLBACK_PAST_TOURNAMENT]
        : base.tournaments;

    return {
      ...base,
      ...parsed,
      tournaments: mergedTournaments,
    };
  } catch {
    return base;
  }
}

export function recomputeLeagueAnalytics(
  teams: Team[],
  players: PlayerProfile[],
  matches: Match[],
  tournamentId: string
): {
  standings: TournamentStanding[];
  scorers: TopScorer[];
  assists: TopAssist[];
} {
  const completedMatches = matches.filter(
    (m) => m.status === 'completed' || m.status === 'approved' || m.status === 'wo'
  );

  const standingsMap = new Map<string, TournamentStanding>();

  teams.forEach((t, idx) => {
    const fallbackSt = FALLBACK_STANDINGS.find((s) => s.team_id === t.id);
    standingsMap.set(t.id, {
      team_id: t.id,
      tournament_id: tournamentId,
      team_name: t.name,
      logo_url: t.logo_url,
      captain_id: t.captain_id,
      played: fallbackSt ? fallbackSt.played : 0,
      won: fallbackSt ? fallbackSt.won : 0,
      drawn: fallbackSt ? fallbackSt.drawn : 0,
      lost: fallbackSt ? fallbackSt.lost : 0,
      goals_for: fallbackSt ? fallbackSt.goals_for : 0,
      goals_against: fallbackSt ? fallbackSt.goals_against : 0,
      goal_difference: fallbackSt ? fallbackSt.goal_difference : 0,
      points: fallbackSt ? fallbackSt.points : 0,
      position: idx + 1,
    });
  });

  completedMatches.forEach((m) => {
    const wasInitiallyCompleted =
      m.id === 'm4444444-4444-4444-4444-444444444444' ||
      m.id === 'match-furia-catimba';
    if (wasInitiallyCompleted) return;

    const home = standingsMap.get(m.home_team_id);
    const away = standingsMap.get(m.away_team_id);
    if (home) {
      home.played += 1;
      home.goals_for += m.home_score;
      home.goals_against += m.away_score;
      home.goal_difference = home.goals_for - home.goals_against;
      if (m.home_score > m.away_score) {
        home.won += 1;
        home.points += 3;
      } else if (m.home_score === m.away_score) {
        home.drawn += 1;
        home.points += 1;
      } else {
        home.lost += 1;
      }
    }
    if (away) {
      away.played += 1;
      away.goals_for += m.away_score;
      away.goals_against += m.home_score;
      away.goal_difference = away.goals_for - away.goals_against;
      if (m.away_score > m.home_score) {
        away.won += 1;
        away.points += 3;
      } else if (m.away_score === m.home_score) {
        away.drawn += 1;
        away.points += 1;
      } else {
        away.lost += 1;
      }
    }
  });

  const sortedStandings = Array.from(standingsMap.values())
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goal_difference - a.goal_difference ||
        b.goals_for - a.goals_for
    )
    .map((item, i) => ({ ...item, position: i + 1 }));

  const goalsMap = new Map<string, TopScorer>();
  const assistsMap = new Map<string, TopAssist>();

  FALLBACK_SCORERS.forEach((s) => {
    const pl = players.find((p) => p.id === s.player_id);
    const charName = pl?.character_name || s.character_name || s.player_name;
    goalsMap.set(s.player_id, {
      ...s,
      player_name: charName,
      character_name: charName,
      full_name: pl?.full_name || s.full_name,
    });
  });

  FALLBACK_ASSISTS.forEach((a) => {
    const pl = players.find((p) => p.id === a.player_id);
    const charName = pl?.character_name || a.character_name || a.player_name;
    assistsMap.set(a.player_id, {
      ...a,
      player_name: charName,
      character_name: charName,
      full_name: pl?.full_name || a.full_name,
    });
  });

  completedMatches.forEach((m) => {
    if (
      m.id === 'm4444444-4444-4444-4444-444444444444' ||
      m.id === 'match-furia-catimba'
    )
      return;

    const ocrPlayers = m.ocr_extracted_data?.players || [];
    ocrPlayers.forEach((op, idx) => {
      const key = op.name.toUpperCase();
      const tId = op.team === 'home' ? m.home_team_id : m.away_team_id;
      const tm = teams.find((t) => t.id === tId);
      if (op.goals > 0) {
        const ex = goalsMap.get(key);
        if (ex) {
          ex.goals_count += op.goals;
          ex.matches_played += 1;
        } else {
          goalsMap.set(key, {
            player_id: `ocr-${key}-${idx}`,
            player_name: key,
            character_name: key,
            team_id: tId,
            team_name: tm?.name || 'Clube',
            tournament_id: tournamentId,
            goals_count: op.goals,
            matches_played: 1,
            goals_per_match: op.goals,
            rank: 99,
          });
        }
      }
      if (op.assists > 0) {
        const exA = assistsMap.get(key);
        if (exA) {
          exA.assists_count += op.assists;
          exA.matches_played += 1;
        } else {
          assistsMap.set(key, {
            player_id: `ocr-a-${key}-${idx}`,
            player_name: key,
            character_name: key,
            team_id: tId,
            team_name: tm?.name || 'Clube',
            tournament_id: tournamentId,
            assists_count: op.assists,
            matches_played: 1,
            rank: 99,
          });
        }
      }
    });
  });

  const sortedScorers = Array.from(goalsMap.values())
    .sort((a, b) => b.goals_count - a.goals_count)
    .map((s, idx) => ({ ...s, rank: idx + 1 }));

  const sortedAssists = Array.from(assistsMap.values())
    .sort((a, b) => b.assists_count - a.assists_count)
    .map((a, idx) => ({ ...a, rank: idx + 1 }));

  return {
    standings: sortedStandings,
    scorers: sortedScorers,
    assists: sortedAssists,
  };
}

export function saveStoreState(next: LeagueStoreState): void {
  if (typeof window === 'undefined') return;
  try {
    const analytics = recomputeLeagueAnalytics(
      next.teams,
      next.players,
      next.matches,
      next.activeTournamentId
    );
    const enriched: LeagueStoreState = {
      ...next,
      standings: analytics.standings,
      scorers: analytics.scorers,
      assists: analytics.assists,
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(enriched));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: enriched }));
  } catch (err) {
    console.warn('Falha ao persistir estado global:', err);
  }
}

export async function uploadMediaToStorage(
  bucket: 'player-media' | 'team-media' | 'match-proofs',
  filePrefix: string,
  file: File
): Promise<string> {
  const isRealSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('seu-projeto');

  if (isRealSupabase) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${filePrefix}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (!error && data?.path) {
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
        if (pub?.publicUrl) {
          return pub.publicUrl;
        }
      }
    } catch {
      // prossegue para o fallback Base64 otimizado
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function useLeagueStore() {
  const [state, setState] = useState<LeagueStoreState>(() => getBaseStoreState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const current = getInitialStoreState();
    setState(current);
    setHydrated(true);

    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<LeagueStoreState>;
      if (custom.detail) {
        setState(custom.detail);
      } else {
        setState(getInitialStoreState());
      }
    };

    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener('storage', () => setState(getInitialStoreState()));
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
    };
  }, []);

  useEffect(() => {
    async function syncFromSupabase() {
      try {
        const isRealSupabase =
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('seu-projeto');
        if (!isRealSupabase) return;

        const [tRes, tmRes, plRes, mRes, stdRes, scRes, asRes, regRes, incRes, finRes] =
          await Promise.all([
            supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
            supabase.from('teams').select('*').order('name', { ascending: true }),
            supabase.from('player_profiles').select('*').order('name', { ascending: true }),
            supabase.from('matches').select('*').order('round_number', { ascending: true }),
            supabase.from('vw_tournament_standings').select('*'),
            supabase.from('vw_top_scorers').select('*'),
            supabase.from('vw_top_assists').select('*'),
            supabase.from('tournament_registrations').select('*'),
            supabase.from('match_incidents').select('*').order('created_at', { ascending: false }),
            supabase.from('tournament_finances').select('*'),
          ]);

        const current = getInitialStoreState();
        const next: LeagueStoreState = {
          ...current,
          tournaments: tRes.data && tRes.data.length > 0 ? (tRes.data as any) : current.tournaments,
          teams: tmRes.data && tmRes.data.length > 0 ? (tmRes.data as any) : current.teams,
          players: plRes.data && plRes.data.length > 0 ? (plRes.data as any) : current.players,
          matches: mRes.data && mRes.data.length > 0 ? (mRes.data as any) : current.matches,
          standings: stdRes.data && stdRes.data.length > 0 ? (stdRes.data as any) : current.standings,
          scorers: scRes.data && scRes.data.length > 0 ? (scRes.data as any) : current.scorers,
          assists: asRes.data && asRes.data.length > 0 ? (asRes.data as any) : current.assists,
          registrations:
            regRes.data && regRes.data.length > 0 ? (regRes.data as any) : current.registrations,
          incidents:
            incRes.data && incRes.data.length > 0 ? (incRes.data as any) : current.incidents,
          finances: finRes.data && finRes.data.length > 0 ? (finRes.data as any) : current.finances,
        };
        saveStoreState(next);
      } catch {
        // mantém store sincronizada
      }
    }
    syncFromSupabase();
  }, []);

  const updatePlayer = useCallback(async (updatedPlayer: PlayerProfile) => {
    const normalized: PlayerProfile = {
      ...updatedPlayer,
      character_name: updatedPlayer.character_name || updatedPlayer.name,
      name: updatedPlayer.character_name || updatedPlayer.name,
      ea_Tag: updatedPlayer.character_name || updatedPlayer.ea_Tag || updatedPlayer.name,
      avatar_url:
        updatedPlayer.avatar_face_url ||
        updatedPlayer.avatar_url ||
        '/assets/templates/guest-avatar.png',
    };
    const curr = getInitialStoreState();
    const exists = curr.players.some((p) => p.id === normalized.id);
    const nextPlayers = exists
      ? curr.players.map((p) => (p.id === normalized.id ? normalized : p))
      : [normalized, ...curr.players];

    saveStoreState({ ...curr, players: nextPlayers });

    try {
      await supabase.from('player_profiles').upsert({
        id: normalized.id,
        user_id: normalized.user_id,
        name: normalized.name,
        character_name: normalized.character_name,
        full_name: normalized.full_name,
        team_id: normalized.team_id,
        avatar_url: normalized.avatar_url,
        avatar_face_url: normalized.avatar_face_url,
        avatar_body_url: normalized.avatar_body_url,
        card_design: normalized.card_design,
        primary_position: normalized.primary_position,
        secondary_positions: normalized.secondary_positions,
        positions_declared: normalized.positions_declared,
        archetype: normalized.archetype,
        height_cm: normalized.height_cm,
        weight_kg: normalized.weight_kg,
        gender: normalized.gender,
        attributes: normalized.attributes,
        accelerate_type: normalized.accelerate_type,
        accelerate_sub_type: normalized.accelerate_sub_type,
        playstyles: normalized.playstyles,
        availability_slots: normalized.availability_slots,
        career_stats: normalized.career_stats,
        bio: normalized.bio,
      });
    } catch {
      // sincronizado na store
    }
  }, []);

  const updatePlayerProfile = useCallback(
    async (playerId: string, partial: Partial<PlayerProfile>) => {
      const curr = getInitialStoreState();
      const target = curr.players.find((p) => p.id === playerId) || curr.players[0];
      if (!target) return;
      await updatePlayer({
        ...target,
        ...partial,
      });
    },
    [updatePlayer]
  );

  const updateTeam = useCallback(async (updatedTeam: Team) => {
    const curr = getInitialStoreState();
    const exists = curr.teams.some((t) => t.id === updatedTeam.id);
    const nextTeams = exists
      ? curr.teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t))
      : [...curr.teams, updatedTeam];

    const nextMatches = curr.matches.map((m) => ({
      ...m,
      home_team: m.home_team_id === updatedTeam.id ? updatedTeam : m.home_team,
      away_team: m.away_team_id === updatedTeam.id ? updatedTeam : m.away_team,
    }));

    saveStoreState({ ...curr, teams: nextTeams, matches: nextMatches });

    try {
      await supabase.from('teams').upsert({
        id: updatedTeam.id,
        tournament_id: updatedTeam.tournament_id,
        name: updatedTeam.name,
        short_name: updatedTeam.short_name,
        logo_url: updatedTeam.logo_url,
        kit_home_url: updatedTeam.kit_home_url,
        kit_away_url: updatedTeam.kit_away_url,
        primary_color: updatedTeam.primary_color,
        secondary_color: updatedTeam.secondary_color,
        active_formation: updatedTeam.active_formation,
        invite_code: updatedTeam.invite_code,
      });
    } catch {
      // sincronizado na store
    }
  }, []);

  const updateTeamInStore = useCallback(
    async (teamId: string, partial: Partial<Team>) => {
      const curr = getInitialStoreState();
      const target = curr.teams.find((t) => t.id === teamId) || curr.teams[0];
      if (!target) return;
      await updateTeam({
        ...target,
        ...partial,
      });
    },
    [updateTeam]
  );

  const updateMatch = useCallback(async (updatedMatch: Match) => {
    const curr = getInitialStoreState();
    const exists = curr.matches.some((m) => m.id === updatedMatch.id);
    const nextMatches = exists
      ? curr.matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
      : [updatedMatch, ...curr.matches];

    saveStoreState({ ...curr, matches: nextMatches });

    try {
      await supabase.from('matches').upsert({
        id: updatedMatch.id,
        tournament_id: updatedMatch.tournament_id,
        round_number: updatedMatch.round_number,
        home_team_id: updatedMatch.home_team_id,
        away_team_id: updatedMatch.away_team_id,
        scheduled_at: updatedMatch.scheduled_at,
        schedule_status: updatedMatch.schedule_status,
        status: updatedMatch.status,
        home_score: updatedMatch.home_score,
        away_score: updatedMatch.away_score,
        proof_image_url: updatedMatch.proof_image_url,
        submitted_by_team_id: updatedMatch.submitted_by_team_id,
        validated_by_team_id: updatedMatch.validated_by_team_id,
      });
    } catch {
      // sincronizado na store
    }
  }, []);

  const updateMatchInStore = useCallback(
    async (matchId: string, partial: Partial<Match>) => {
      const curr = getInitialStoreState();
      const target = curr.matches.find((m) => m.id === matchId) || curr.matches[0];
      if (!target) return;
      await updateMatch({
        ...target,
        ...partial,
      });
    },
    [updateMatch]
  );

  const updateRegistration = useCallback(async (updatedReg: TournamentRegistration) => {
    const curr = getInitialStoreState();
    const exists = curr.registrations.some((r) => r.id === updatedReg.id);
    const nextRegs = exists
      ? curr.registrations.map((r) => (r.id === updatedReg.id ? updatedReg : r))
      : [...curr.registrations, updatedReg];

    const nextFinances = curr.finances.map((f) =>
      f.team_id === updatedReg.team_id
        ? {
            ...f,
            entry_fee_paid:
              (updatedReg.full_fee_paid_to_admin && updatedReg.is_cleared_to_play) ||
              updatedReg.payment_status === 'approved',
            payment_proof_url: updatedReg.payment_proof_url,
            paid_at: updatedReg.approved_by_admin_at,
          }
        : f
    );

    saveStoreState({ ...curr, registrations: nextRegs, finances: nextFinances });

    try {
      await supabase.from('tournament_registrations').upsert({
        id: updatedReg.id,
        tournament_id: updatedReg.tournament_id,
        team_id: updatedReg.team_id,
        total_fee: updatedReg.total_fee,
        member_contributions: updatedReg.member_contributions,
        full_fee_paid_to_admin: updatedReg.full_fee_paid_to_admin,
        payment_proof_url: updatedReg.payment_proof_url,
        approved_by_admin_at: updatedReg.approved_by_admin_at,
        is_cleared_to_play: updatedReg.is_cleared_to_play,
      });
    } catch {
      // sincronizado na store
    }
  }, []);

  const updateRegistrationInStore = useCallback(
    async (regId: string, partial: Partial<TournamentRegistration>) => {
      const curr = getInitialStoreState();
      const target =
        curr.registrations.find((r) => r.id === regId) || curr.registrations[0];
      if (!target) return;
      await updateRegistration({
        ...target,
        ...partial,
      });
    },
    [updateRegistration]
  );

  const approveTeamRegistration = useCallback(
    async (regId: string, teamId: string) => {
      const curr = getInitialStoreState();
      const nextRegs = curr.registrations.map((r) =>
        r.id === regId || r.team_id === teamId
          ? {
              ...r,
              full_fee_paid_to_admin: true,
              is_cleared_to_play: true,
              payment_status: 'approved',
              approved_by_admin_at: new Date().toISOString(),
            }
          : r
      );
      const nextTeams = curr.teams.map((t) =>
        t.id === teamId ? { ...t, is_approved: true } : t
      );
      saveStoreState({ ...curr, registrations: nextRegs, teams: nextTeams });
    },
    []
  );

  const updateTournament = useCallback(async (updatedTourn: Tournament) => {
    const curr = getInitialStoreState();
    const exists = curr.tournaments.some((t) => t.id === updatedTourn.id);
    const nextTourns = exists
      ? curr.tournaments.map((t) => (t.id === updatedTourn.id ? updatedTourn : t))
      : [updatedTourn, ...curr.tournaments];

    saveStoreState({
      ...curr,
      tournaments: nextTourns,
      activeTournamentId: updatedTourn.id,
    });

    try {
      await supabase.from('tournaments').upsert({
        id: updatedTourn.id,
        name: updatedTourn.name,
        format: updatedTourn.format,
        format_label: updatedTourn.format_label || updatedTourn.format,
        players_on_pitch: updatedTourn.players_on_pitch,
        max_reserves: updatedTourn.max_reserves,
        entry_fee: updatedTourn.entry_fee,
        bracket_type: updatedTourn.bracket_type,
        bracket_config: updatedTourn.bracket_config,
        custom_rules: updatedTourn.custom_rules,
        prize_breakdown: updatedTourn.prize_breakdown || updatedTourn.prize_distribution,
        draft_order: updatedTourn.draft_order,
        status: updatedTourn.status,
      });
    } catch {
      // sincronizado na store
    }
  }, []);

  const updateTournamentInStore = useCallback(
    async (partial: Partial<Tournament>) => {
      const curr = getInitialStoreState();
      const active =
        curr.tournaments.find((t) => t.id === curr.activeTournamentId) ||
        curr.tournaments[0] ||
        FALLBACK_TOURNAMENT;
      await updateTournament({
        ...active,
        ...partial,
      });
    },
    [updateTournament]
  );

  const draftPlayerToTeam = useCallback(
    async (playerId: string, targetTeamId: string) => {
      const curr = getInitialStoreState();
      const nextPlayers = curr.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              team_id: targetTeamId,
              is_free_agent: false,
              is_looking_for_team: false,
            }
          : p
      );
      saveStoreState({ ...curr, players: nextPlayers });
    },
    []
  );

  const addIncident = useCallback(async (newInc: MatchIncident) => {
    const curr = getInitialStoreState();
    saveStoreState({ ...curr, incidents: [newInc, ...curr.incidents] });
  }, []);

  const updateIncident = useCallback(async (updatedInc: MatchIncident) => {
    const curr = getInitialStoreState();
    const nextInc = curr.incidents.map((i) => (i.id === updatedInc.id ? updatedInc : i));
    saveStoreState({ ...curr, incidents: nextInc });
  }, []);

  const saveDraftOrder = useCallback(async (order: DraftOrderSlot[]) => {
    const curr = getInitialStoreState();
    const activeTourn =
      curr.tournaments.find((t) => t.id === curr.activeTournamentId) || curr.tournaments[0];
    const updatedTourn: Tournament = {
      ...activeTourn,
      draft_order: order,
    };
    const nextTourns = curr.tournaments.map((t) =>
      t.id === updatedTourn.id ? updatedTourn : t
    );
    saveStoreState({ ...curr, tournaments: nextTourns });
  }, []);

  const selectTournament = useCallback((tournamentId: string) => {
    const curr = getInitialStoreState();
    saveStoreState({
      ...curr,
      activeTournamentId: tournamentId,
    });
  }, []);

  const createNewTournament = useCallback(
    async (partial: Partial<Tournament>) => {
      const curr = getInitialStoreState();
      const newTourn: Tournament = {
        ...FALLBACK_TOURNAMENT,
        ...partial,
        id: partial.id || `tourn-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const nextTourns = [newTourn, ...curr.tournaments];
      saveStoreState({
        ...curr,
        tournaments: nextTourns,
        activeTournamentId: newTourn.id,
      });
      try {
        await supabase.from('tournaments').upsert({
          id: newTourn.id,
          name: newTourn.name,
          format: newTourn.format,
          format_label: newTourn.format_label || newTourn.format,
          players_on_pitch: newTourn.players_on_pitch,
          max_reserves: newTourn.max_reserves,
          entry_fee: newTourn.entry_fee,
          bracket_type: newTourn.bracket_type,
          custom_rules: newTourn.custom_rules,
          prize_breakdown: newTourn.prize_distribution,
          status: newTourn.status,
        });
      } catch {
        // sincronizado localmente
      }
      return newTourn;
    },
    []
  );

  const addLegacyCareerStats = useCallback(
    async (
      playerId: string,
      delta: {
        matches?: number;
        goals?: number;
        assists?: number;
        mvps?: number;
        titles?: number;
        cleanSheets?: number;
        matchesToAdd?: number;
        goalsToAdd?: number;
        assistsToAdd?: number;
        motmToAdd?: number;
        titlesToAdd?: number;
      }
    ) => {
      const curr = getInitialStoreState();
      const target = curr.players.find((p) => p.id === playerId);
      if (!target) return;

      const addMatches = delta.matches ?? delta.matchesToAdd ?? 0;
      const addGoals = delta.goals ?? delta.goalsToAdd ?? 0;
      const addAssists = delta.assists ?? delta.assistsToAdd ?? 0;
      const addMvps = delta.mvps ?? delta.motmToAdd ?? 0;
      const addTitles = delta.titles ?? delta.titlesToAdd ?? 0;
      const addCleanSheets = delta.cleanSheets ?? 0;

      const prevStats = target.career_stats || {};
      const nextMatches =
        (prevStats.matches_played ?? prevStats.official_matches ?? 10) + addMatches;
      const nextGoals =
        (prevStats.goals ?? prevStats.official_goals ?? 5) + addGoals;
      const nextAssists =
        (prevStats.assists ?? prevStats.official_assists ?? 3) + addAssists;
      const nextMvps =
        (prevStats.mvps ?? prevStats.official_motm ?? 1) + addMvps;
      const nextTitles = (prevStats.titles_won ?? 0) + addTitles;
      const nextCleanSheets = (prevStats.clean_sheets ?? 0) + addCleanSheets;

      const computed = calculateFC26MacroAndOvr({
        attributes: target.attributes,
        primaryPosition: target.primary_position,
        careerStats: {
          matches: nextMatches,
          goals: nextGoals,
          assists: nextAssists,
          mvps: nextMvps,
          titles: nextTitles,
          cleanSheets: nextCleanSheets,
        },
        extraUnlockedCards: target.unlocked_cards,
      });

      const updatedPlayer: PlayerProfile = {
        ...target,
        overall: computed.finalOvr,
        unlocked_cards: computed.unlockedCardIds,
        career_stats: {
          ...prevStats,
          official_matches: nextMatches,
          matches_played: nextMatches,
          official_goals: nextGoals,
          goals: nextGoals,
          official_assists: nextAssists,
          assists: nextAssists,
          official_motm: nextMvps,
          mvps: nextMvps,
          titles_won: nextTitles,
          clean_sheets: nextCleanSheets,
          tournaments_played: (prevStats.tournaments_played ?? 2) + (addTitles > 0 ? 1 : 0),
          average_rating: Math.min(9.9, (prevStats.average_rating ?? 8.2) + 0.2),
        },
      };

      await updatePlayer(updatedPlayer);
    },
    [updatePlayer]
  );

  const unlockPlayerCardDesign = useCallback(
    async (playerId: string, cardId: string, equipUrl?: string) => {
      const curr = getInitialStoreState();
      const target = curr.players.find((p) => p.id === playerId) || curr.players[0];
      if (!target) return;

      const existing = new Set<string>(target.unlocked_cards || ['gold-rare']);
      existing.add(cardId);

      await updatePlayer({
        ...target,
        unlocked_cards: Array.from(existing),
        card_design: equipUrl || target.card_design,
      });
    },
    [updatePlayer]
  );

  const activeTournament =
    state.tournaments.find((t) => t.id === state.activeTournamentId) ||
    state.tournaments[0] ||
    FALLBACK_TOURNAMENT;

  return {
    ...state,
    hydrated,
    activeTournament,
    tournament: activeTournament,
    selectTournament,
    createNewTournament,
    addLegacyCareerStats,
    unlockPlayerCardDesign,
    updatePlayer,
    updatePlayerProfile,
    updateTeam,
    updateTeamInStore,
    updateMatch,
    updateMatchInStore,
    updateRegistration,
    updateRegistrationInStore,
    approveTeamRegistration,
    updateTournament,
    updateTournamentInStore,
    draftPlayerToTeam,
    addIncident,
    updateIncident,
    saveDraftOrder,
  };
}
