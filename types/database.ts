export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'UNRATED';
export type TournamentStatus = 'REGISTRATION' | 'SCOUTING' | 'DRAFT' | 'ACTIVE' | 'FINISHED';
export type ParticipantRole = 'admin' | 'captain' | 'player';
export type GameMode = '5v5' | '11v11';

export type MatchScheduleStatus = 'unscheduled' | 'proposed_by_home' | 'proposed_by_away' | 'confirmed';
export type MatchStatus =
  | 'scheduled'
  | 'pending_validation'
  | 'completed'
  | 'disputed'
  | 'wo'
  | 'pending'
  | 'approved'
  | 'rejected';

export type IncidentType =
  | 'wo_delay'
  | 'late_cancellation'
  | 'player_disconnect_first_20'
  | 'player_disconnect_halftime'
  | 'game_bug';

export type IncidentStatus = 'open' | 'resolved' | 'rejected';

export interface TournamentRules {
  crossplay_gen: 'current_gen' | 'old_gen';
  min_human_players: number;
  any_allowed: boolean;
  gk_required: boolean;
}

export interface TournamentPrizeDistribution {
  first: number;
  second: number;
  third: number;
  top_scorer: number;
  top_assister: number;
}

export interface TournamentRulesConfig {
  cancel_notice_minutes: number;
  wo_tolerance_minutes: number;
  disconnect_full_restart_limit_min: number;
  extra_time_group_stage: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  format: string;
  game_mode?: GameMode;
  max_roster_size?: number;
  entry_fee?: number;
  prize_distribution?: TournamentPrizeDistribution;
  rules_config?: TournamentRulesConfig;
  status: TournamentStatus;
  rules?: TournamentRules;
  created_at: string;
}

export interface PlayerVisualTraits {
  skin_tone?: string;
  hair_style?: string;
  hair_color?: string;
  facial_hair?: string;
  accessories?: string[];
  shirt_number?: number;
  celebration?: string;
}

export type WeeklyAvailability = Record<string, string[]>;

export interface PlayerMedal {
  id: string;
  title: string;
  icon?: string;
  unlocked_at?: string;
}

export interface PlayerProfile {
  id: string;
  user_id?: string;
  name: string;
  positions_declared: string[];
  archetype?: string;
  archetypes?: string[];
  avatar_url?: string;
  platform?: 'PS5' | 'Xbox Series' | 'PC' | 'OldGen';
  primary_position?: string;
  secondary_positions?: string[];
  contact_discord?: string;
  contact_whatsapp?: string;
  is_looking_for_team?: boolean;
  bio?: string;
  visual_traits?: PlayerVisualTraits;
  availability?: WeeklyAvailability;
  medals?: PlayerMedal[];
  created_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  player_id: string;
  user_id?: string;
  role: ParticipantRole;
  created_at: string;
  player?: PlayerProfile;
}

export interface Player {
  id: string;
  name: string;
  positions: string[];
  is_captain: boolean;
  created_at?: string;
}

export interface PlayerStats {
  id?: string;
  player_id: string;
  name?: string;
  positions?: string[];
  is_captain?: boolean;
  evaluation_count?: number;
  avg_mechanic?: number;
  avg_iq?: number;
  avg_teamplay?: number;
  overall_score?: number;
  tier?: Tier;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physical?: number;
  build_image_url?: string;
  ocr_extracted_at?: string;
  updated_at?: string;
}

export interface PositionVote {
  id: string;
  player_id: string;
  voter_id: string;
  voted_position: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  player_id: string;
  tournament_id: string;
  reviewer_id?: string;
  mechanic_score: number;
  iq_score: number;
  teamplay_score: number;
  created_at: string;
}

export interface TeamSponsor {
  name: string;
  logo_url?: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  captain_id?: string;
  active_formation: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  kit_description?: string;
  sponsors?: TeamSponsor[];
  whatsapp_group_link?: string;
  instagram_handle?: string;
  created_at: string;
}

export interface DraftPick {
  id: string;
  tournament_id: string;
  team_id: string;
  player_id: string;
  round: number;
  pick_number: number;
  selected_at: string;
}

export interface SquadLineup {
  id: string;
  tournament_id: string;
  team_id: string;
  slot_id: string;
  position_code: string;
  player_id: string | null;
  updated_at: string;
}

export interface MatchPlayerStat {
  id: string;
  match_id: string;
  player_id?: string | null;
  guest_name?: string | null;
  team_id: string;
  goals: number;
  assists: number;
  red_cards: number;
  yellow_cards: number;
  rating: number;
  player?: PlayerProfile;
}

export interface MatchIncident {
  id: string;
  match_id: string;
  reported_by_team_id: string;
  incident_type: IncidentType;
  minute_occurred?: number | null;
  score_at_incident?: string | null;
  evidence_url?: string | null;
  admin_resolution_notes?: string | null;
  status: IncidentStatus;
  created_at: string;
  match?: Match;
  reported_by_team?: Team;
}

export interface TournamentFinance {
  id: string;
  tournament_id: string;
  team_id: string;
  entry_fee_paid: boolean;
  paid_at?: string | null;
  payment_proof_url?: string | null;
  notes?: string | null;
  created_at?: string;
  team?: Team;
}

export interface TournamentPhase {
  id: string;
  tournament_id: string;
  name: string;
  phase_type: 'groups' | 'knockout';
  order_num: number;
  status: 'pending' | 'active' | 'finished';
  created_at: string;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'clean_sheet';
  minute?: number | null;
  created_at: string;
  player?: PlayerProfile;
  team?: Team;
}

export interface FreeAgent {
  id: string;
  player_id: string;
  platform: 'PS5' | 'Xbox Series' | 'PC' | 'OldGen';
  primary_position: string;
  secondary_positions: string[];
  description?: string | null;
  contact_discord?: string | null;
  contact_whatsapp?: string | null;
  is_active: boolean;
  created_at: string;
  player?: PlayerProfile;
}

export interface TopScorer {
  player_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  team_logo_url?: string | null;
  tournament_id: string;
  goals_count: number;
  matches_played: number;
  goals_per_match: number;
  rank: number;
}

export interface TopAssist {
  player_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  team_logo_url?: string | null;
  tournament_id: string;
  assists_count: number;
  matches_played: number;
  rank: number;
}

export interface Match {
  id: string;
  tournament_id: string;
  phase_id?: string | null;
  round_number?: number;
  home_team_id: string;
  away_team_id: string;
  scheduled_at?: string | null;
  schedule_status?: MatchScheduleStatus;
  status: MatchStatus;
  home_score: number;
  away_score: number;
  proof_image_url?: string | null;
  submitted_by_team_id?: string | null;
  validated_by_team_id?: string | null;
  motm_player_id?: string | null;
  reported_by?: string | null;
  notes?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  home_team?: Team;
  away_team?: Team;
  phase?: TournamentPhase;
  player_stats?: MatchPlayerStat[];
  events?: MatchEvent[];
  incidents?: MatchIncident[];
}

export interface TournamentStanding {
  team_id: string;
  tournament_id: string;
  team_name: string;
  logo_url?: string | null;
  captain_id?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  position: number;
}

export interface TournamentPlayerStats {
  tournament_id: string;
  player_id: string;
  name: string;
  archetype: string;
  archetypes?: string[];
  positions_declared: string[];
  community_position: string;
  community_confidence: number;
  total_position_votes: number;
  participant_role: ParticipantRole;
  is_captain: boolean;
  evaluation_count: number;
  avg_mechanic: number;
  avg_iq: number;
  avg_teamplay: number;
  overall_score: number;
  tier: Tier;
  drafted_team_id?: string | null;
  drafted_team_name?: string | null;
  draft_round?: number | null;
  draft_pick_number?: number | null;
}

export interface PitchPositionSlot {
  slotId: string;
  positionCode: string;
  displayName: string;
  xPercent: number; // 0 a 100 da largura do campo
  yPercent: number; // 0 a 100 da altura (90 = GK, 15 = ATA)
  assignedPlayerId?: string | null;
}

export interface FormationPreset {
  key: string;
  label: string;
  category: '4-defenders' | '5-defenders' | '3-defenders' | '5v5-rush';
  gameMode?: GameMode;
  slots: PitchPositionSlot[];
}
