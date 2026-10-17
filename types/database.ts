export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'UNRATED';
export type TournamentStatus = 'REGISTRATION' | 'SCOUTING' | 'DRAFT' | 'ACTIVE' | 'FINISHED' | 'active' | 'finished' | 'completed';
export type ParticipantRole = 'admin' | 'captain' | 'player';
export type GameMode = '3v3' | '4v4' | '5v5' | '7v7' | '11v11' | string;
export type PlayerPosition =
  | 'ST'
  | 'LW'
  | 'RW'
  | 'CAM'
  | 'CM'
  | 'CDM'
  | 'LB'
  | 'RB'
  | 'CB'
  | 'GK'
  | 'ATA'
  | 'MEI'
  | 'MC'
  | 'VOL'
  | 'ZAG'
  | string;

export type AccelerateType = 'Prolongada' | 'Explosiva' | 'Controlada';
export type AccelerateSubType =
  | 'Lengthy (100% Prolongada)'
  | 'Mostly Lengthy (70% Prolongada / 30% Controlada)'
  | 'Controlled Lengthy (50% Prolongada / 50% Controlada)'
  | 'Controlled (100% Controlada)'
  | 'Controlled Explosive (50% Explosiva / 50% Controlada)'
  | 'Mostly Explosive (70% Explosiva / 30% Controlada)'
  | 'Explosive (100% Explosiva)'
  | string;

export type BracketType =
  | 'league_playoffs'
  | 'groups_knockout'
  | 'swiss'
  | 'double_elimination'
  | 'single_elimination'
  | 'pontos_corridos_g4'
  | 'grupos_mata_mata'
  | 'mata_mata_puro'
  | 'suico_top8'
  | string;

export type MatchScheduleStatus =
  | 'unscheduled'
  | 'proposed_by_home'
  | 'proposed_by_away'
  | 'confirmed';

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
  | 'game_bug'
  | 'wo'
  | string;

export type IncidentStatus = 'open' | 'resolved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  character_name: string;
  roles: ParticipantRole[];
  active_role_view: ParticipantRole;
  whatsapp?: string;
  created_at: string;
}

export interface PlayerAttributes {
  // Ritmo
  acceleration: number;
  sprint_speed: number;
  // Artilharia / Finalização
  attack_positioning: number;
  finishing: number;
  shot_power: number;
  long_shots: number;
  volleys: number;
  penalties: number;
  // Passe
  vision: number;
  crossing: number;
  free_kick: number;
  free_kick_accuracy?: number;
  short_passing: number;
  long_passing: number;
  curve: number;
  // Controle de Bola / Drible
  agility: number;
  balance: number;
  reactions: number;
  ball_control: number;
  dribbling: number;
  composure: number;
  // Defesa
  interceptions: number;
  heading_accuracy: number;
  def_awareness: number;
  standing_tackle: number;
  sliding_tackle: number;
  // Físico & Estrelas
  jumping: number;
  stamina: number;
  strength: number;
  aggression: number;
  skill_moves?: number;
  weak_foot?: number;
  // Goleiro
  gk_diving?: number;
  gk_handling?: number;
  gk_kicking?: number;
  gk_positioning?: number;
  gk_reflexes?: number;
}

export interface PlayStyleSelection {
  id: string;
  name?: string;
  category?: string;
  icon?: string;
  plusIcon?: string;
  tier?: 'silver' | 'gold';
  level?: 'silver' | 'gold';
}

export type TimeIntervalPeriod =
  | 'manha'
  | 'tarde'
  | 'inicio_noite'
  | 'noite_pico'
  | 'madrugada'
  | 'custom';

export interface AvailabilitySlotRange {
  id?: string;
  label?: string;
  start?: string;
  end?: string;
  periods?: TimeIntervalPeriod[];
  customStart?: string;
  customEnd?: string;
}

export type WeeklyAvailabilitySlots = Record<string, AvailabilitySlotRange>;

export interface PlayerCareerStats {
  official_matches?: number;
  official_goals?: number;
  official_assists?: number;
  official_motm?: number;
  titles_won?: number;
  tournaments_played?: number;
  matches_played?: number;
  goals?: number;
  assists?: number;
  mvps?: number;
  clean_sheets?: number;
  average_rating?: number;
}

export interface PlayerVisualTraits {
  skin_tone?: string;
  hair_style?: string;
  hair_color?: string;
  facial_hair?: string;
  accessories?: string[];
  shirt_number?: number;
  celebration?: string;
  avatar_photo_url?: string;
  body_photo_url?: string;
}

export type WeeklyAvailability = Record<string, any>;

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
  ea_Tag?: string;
  character_name: string;
  full_name?: string;
  team_id?: string | null;
  is_free_agent?: boolean;
  overall?: number;
  avatar_url?: string;
  avatar_face_url?: string;
  avatar_body_url?: string;
  attributes_screenshot_url?: string;
  card_design?: string;
  card_background?: string;
  unlocked_cards?: string[];
  preferred_foot?: 'D' | 'E' | 'R' | 'L';
  skill_moves?: number;
  weak_foot?: number;
  nationality?: string;
  positions_declared: string[];
  primary_position?: PlayerPosition;
  secondary_positions?: string[];
  archetype?: string;
  archetypes?: string[];
  height_cm?: number;
  weight_kg?: number;
  gender?: 'M' | 'F';
  attributes?: PlayerAttributes;
  accelerate_type?: AccelerateType;
  accelerate_sub_type?: AccelerateSubType;
  playstyles?: PlayStyleSelection[];
  availability_slots?: WeeklyAvailabilitySlots;
  career_stats?: PlayerCareerStats;
  platform?: 'PS5' | 'Xbox Series' | 'PC' | 'OldGen';
  contact_discord?: string;
  contact_whatsapp?: string;
  is_looking_for_team?: boolean;
  bio?: string;
  visual_traits?: PlayerVisualTraits;
  availability?: WeeklyAvailability;
  medals?: PlayerMedal[];
  created_at: string;
}

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

export interface DraftOrderSlot {
  pickOrder?: number;
  pick_number?: number;
  round?: number;
  teamId?: string;
  team_id?: string;
  teamName?: string;
  team_name?: string;
  captainName?: string;
  captain_name?: string;
}

export interface Tournament {
  id: string;
  name: string;
  format: string;
  format_label?: string;
  game_mode?: GameMode;
  players_on_pitch?: number;
  starters_count?: number;
  max_reserves?: number;
  reserves_count?: number;
  max_roster_size?: number;
  entry_fee?: number;
  bracket_type?: BracketType;
  bracket_config?: Record<string, any>;
  custom_rules?: string[];
  prize_distribution?: TournamentPrizeDistribution;
  prize_breakdown?: TournamentPrizeDistribution;
  rules_config?: TournamentRulesConfig;
  draft_order?: DraftOrderSlot[];
  status: TournamentStatus;
  champion_team_name?: string;
  top_scorer_name?: string;
  season_label?: string;
  rules?: TournamentRules;
  created_at: string;
}

export interface MemberContribution {
  player_id: string;
  character_name: string;
  full_name?: string;
  amount: number;
  paid?: boolean;
  paid_to_captain?: boolean;
  paid_at?: string | null;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  team_id: string;
  total_fee: number;
  member_contributions: MemberContribution[];
  full_fee_paid_to_admin: boolean;
  payment_status?: 'pending' | 'paid_by_captain' | 'approved' | string;
  payment_proof_url?: string | null;
  approved_by_admin_at?: string | null;
  is_cleared_to_play: boolean;
  notes?: string;
  created_at?: string;
  team?: Team;
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
  short_name?: string;
  captain_id?: string;
  active_formation: string;
  logo_url?: string;
  kit_home_url?: string;
  kit_away_url?: string;
  primary_color?: string;
  secondary_color?: string;
  invite_code?: string;
  kit_description?: string;
  sponsors?: TeamSponsor[];
  whatsapp_group_link?: string;
  instagram_handle?: string;
  is_approved?: boolean;
  points?: number;
  matches_played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goals_for?: number;
  goals_against?: number;
  standings?: {
    points: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    gf: number;
    ga: number;
    gd: number;
    form: ('V' | 'E' | 'D')[];
  };
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
  character_name?: string | null;
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
  character_name?: string;
  full_name?: string;
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
  character_name?: string;
  full_name?: string;
  team_id: string;
  team_name: string;
  team_logo_url?: string | null;
  tournament_id: string;
  assists_count: number;
  matches_played: number;
  rank: number;
}

export interface MatchOcrExtractedData {
  home_score: number;
  away_score: number;
  motm_name?: string;
  confidence?: number;
  players?: {
    name: string;
    team: 'home' | 'away';
    goals: number;
    assists: number;
    rating: number;
    is_motm?: boolean;
  }[];
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
  proposed_slots?: string[];
  status: MatchStatus;
  home_score: number;
  away_score: number;
  proof_image_url?: string | null;
  ocr_extracted_data?: MatchOcrExtractedData | null;
  submitted_by_team_id?: string | null;
  validated_by_team_id?: string | null;
  validated_by?: string | null;
  incident_type?: string | null;
  incident_report?: string | null;
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

export interface TournamentPlayerStatsView {
  tournament_id: string;
  player_id: string;
  name: string;
  character_name?: string;
  full_name?: string;
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

export type TournamentPlayerStats = TournamentPlayerStatsView;

export interface PitchPositionSlot {
  slotId: string;
  positionCode: string;
  displayName: string;
  xPercent: number;
  yPercent: number;
}

export interface FormationPreset {
  key: string;
  label: string;
  category: string;
  gameMode?: GameMode;
  slots: PitchPositionSlot[];
}

export interface CommunityPositionView {
  player_id: string;
  top_voted_position: string;
  top_position_confidence: number;
  total_position_votes: number;
}
