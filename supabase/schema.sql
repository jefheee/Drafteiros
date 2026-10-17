-- =========================================================================
-- DRAFTCLUB SAAS - PRODUÇÃO REAL SUPABASE (MULTI-PERFIL, RLS ESTRITO & STORAGE)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP VIEW IF EXISTS vw_top_assists CASCADE;
DROP VIEW IF EXISTS vw_top_scorers CASCADE;
DROP VIEW IF EXISTS vw_tournament_standings CASCADE;
DROP VIEW IF EXISTS vw_tournament_player_stats CASCADE;
DROP VIEW IF EXISTS vw_community_positions CASCADE;
DROP TABLE IF EXISTS tournament_registrations CASCADE;
DROP TABLE IF EXISTS tournament_finances CASCADE;
DROP TABLE IF EXISTS match_incidents CASCADE;
DROP TABLE IF EXISTS free_agents CASCADE;
DROP TABLE IF EXISTS match_events CASCADE;
DROP TABLE IF EXISTS tournament_phases CASCADE;
DROP TABLE IF EXISTS match_player_stats CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS squad_lineups CASCADE;
DROP TABLE IF EXISTS draft_picks CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS position_votes CASCADE;
DROP TABLE IF EXISTS player_stats CASCADE;
DROP TABLE IF EXISTS tournament_participants CASCADE;
DROP TABLE IF EXISTS player_profiles CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =========================================================================
-- 1. TABELA PROFILES (CONTA ÚNICA MULTI-PERFIL: ATLETA, CAPITÃO & ADMIN)
-- =========================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    character_name TEXT NOT NULL,
    roles TEXT[] NOT NULL DEFAULT ARRAY['player']::TEXT[],
    active_role_view TEXT NOT NULL DEFAULT 'player' CHECK (active_role_view IN ('player', 'captain', 'admin')),
    whatsapp TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 2. TORNEIOS DINÂMICOS (QUALQUER FORMATO, REGRAS LIVRES & RATEIO 100%)
-- =========================================================================
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT '5v5',
    format_label TEXT NOT NULL DEFAULT '5v5',
    game_mode TEXT NOT NULL DEFAULT '5v5',
    players_on_pitch INTEGER NOT NULL DEFAULT 5,
    max_reserves INTEGER NOT NULL DEFAULT 1,
    max_roster_size INTEGER NOT NULL DEFAULT 6,
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 70.00,
    bracket_type TEXT NOT NULL DEFAULT 'league_playoffs' CHECK (bracket_type IN ('league_playoffs', 'groups_knockout', 'swiss', 'double_elimination', 'single_elimination')),
    bracket_config JSONB NOT NULL DEFAULT '{"teams_count": 8, "playoff_spots": 4, "legs": 1}'::jsonb,
    custom_rules JSONB NOT NULL DEFAULT '["Tolerância de W.O. no lobby: 15 minutos com print do relógio", "Queda até 20 min do 1º tempo: reinicia partida de 90 min mantendo gols", "Queda no intervalo ou 2º tempo: joga apenas 1 tempo mantendo placar", "Adiamento somente com 60 minutos de antecedência"]'::jsonb,
    prize_distribution JSONB NOT NULL DEFAULT '{"first": 300, "second": 120, "third": 80, "top_scorer": 30, "top_assister": 30}'::jsonb,
    prize_breakdown JSONB NOT NULL DEFAULT '{"first": 300, "second": 120, "third": 80, "top_scorer": 30, "top_assister": 30}'::jsonb,
    rules_config JSONB NOT NULL DEFAULT '{"cancel_notice_minutes": 60, "wo_tolerance_minutes": 15, "disconnect_full_restart_limit_min": 20, "extra_time_group_stage": false}'::jsonb,
    draft_order JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('REGISTRATION', 'SCOUTING', 'DRAFT', 'ACTIVE', 'FINISHED')),
    rules JSONB NOT NULL DEFAULT '{"crossplay_gen": "current_gen", "min_human_players": 5, "any_allowed": false, "gk_required": false}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 3. PLAYER PROFILES (IDENTIDADE DUPLA, BUILD, ACCELERATE & PLAYSTYLES)
-- =========================================================================
CREATE TABLE player_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    character_name TEXT NOT NULL,
    full_name TEXT,
    team_id UUID,
    avatar_url TEXT,
    avatar_face_url TEXT,
    avatar_body_url TEXT,
    card_design TEXT NOT NULL DEFAULT '/assets/fc-26-clean-card-designs/default/gold-rare.webp',
    primary_position TEXT NOT NULL DEFAULT 'MEI',
    secondary_positions TEXT[] NOT NULL DEFAULT '{}',
    positions_declared TEXT[] NOT NULL DEFAULT '{"MEI"}'::TEXT[],
    archetype TEXT NOT NULL DEFAULT 'Maestro',
    archetypes TEXT[] NOT NULL DEFAULT '{"Maestro"}'::TEXT[],
    height_cm INTEGER NOT NULL DEFAULT 185,
    weight_kg INTEGER NOT NULL DEFAULT 78,
    gender TEXT NOT NULL DEFAULT 'M' CHECK (gender IN ('M', 'F')),
    attributes JSONB NOT NULL DEFAULT '{
      "acceleration": 88, "sprint_speed": 90,
      "attack_positioning": 86, "finishing": 88, "shot_power": 87, "long_shots": 84, "volleys": 80, "penalties": 85,
      "vision": 90, "crossing": 84, "free_kick": 82, "short_passing": 91, "long_passing": 88, "curve": 86,
      "agility": 86, "balance": 84, "reactions": 89, "ball_control": 90, "dribbling": 89, "composure": 88,
      "interceptions": 68, "heading_accuracy": 75, "def_awareness": 66, "standing_tackle": 70, "sliding_tackle": 64,
      "jumping": 82, "stamina": 92, "strength": 80, "aggression": 76, "skill_moves": 5, "weak_foot": 5
    }'::jsonb,
    accelerate_type TEXT NOT NULL DEFAULT 'Controlada' CHECK (accelerate_type IN ('Prolongada', 'Explosiva', 'Controlada')),
    accelerate_sub_type TEXT NOT NULL DEFAULT 'Controlled (100% Controlada)',
    playstyles JSONB NOT NULL DEFAULT '[]'::jsonb,
    availability_slots JSONB NOT NULL DEFAULT '{
      "seg": {"periods": ["noite_pico"], "customStart": "21:30", "customEnd": "23:30"},
      "ter": {"periods": ["noite_pico"], "customStart": "21:30", "customEnd": "23:30"},
      "qui": {"periods": ["noite_pico"], "customStart": "21:30", "customEnd": "23:30"}
    }'::jsonb,
    career_stats JSONB NOT NULL DEFAULT '{
      "official_matches": 0,
      "official_goals": 0,
      "official_assists": 0,
      "official_motm": 0,
      "titles_won": 0
    }'::jsonb,
    platform TEXT DEFAULT 'PS5' CHECK (platform IN ('PS5', 'Xbox Series', 'PC', 'OldGen')),
    contact_discord TEXT,
    contact_whatsapp TEXT,
    is_looking_for_team BOOLEAN DEFAULT false,
    bio TEXT,
    visual_traits JSONB NOT NULL DEFAULT '{"skin_tone": "Médio", "hair_style": "Disfarçado (Fade)", "hair_color": "Preto", "facial_hair": "Barba cerrada", "accessories": ["Munhequeira"], "shirt_number": 10, "celebration": "Braços abertos"}'::jsonb,
    availability JSONB NOT NULL DEFAULT '{"seg": ["21:00", "22:00", "23:00"], "ter": ["22:00", "23:00"]}'::jsonb,
    medals JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 4. TIMES DO CAMPEONATO (COM UNIFORMES REAIS, ESCUDO E INVITE CODE)
-- =========================================================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name TEXT DEFAULT 'CLB',
    captain_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    active_formation TEXT NOT NULL DEFAULT '5v5-1-2-1',
    logo_url TEXT,
    kit_home_url TEXT,
    kit_away_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#7C5CFC',
    secondary_color TEXT NOT NULL DEFAULT '#38bdf8',
    invite_code TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 6),
    kit_description TEXT,
    sponsors JSONB NOT NULL DEFAULT '[]'::jsonb,
    whatsapp_group_link TEXT,
    instagram_handle TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 5. TOURNAMENT REGISTRATIONS (RATEIO INTERNO DO CAPITÃO + LIBERAÇÃO ADMIN)
-- =========================================================================
CREATE TABLE tournament_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 70.00,
    member_contributions JSONB NOT NULL DEFAULT '[]'::jsonb,
    full_fee_paid_to_admin BOOLEAN NOT NULL DEFAULT false,
    payment_proof_url TEXT,
    approved_by_admin_at TIMESTAMPTZ,
    is_cleared_to_play BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_id, team_id)
);

-- =========================================================================
-- 6. PARTICIPANTES, STATS, VOTOS, AVALIAÇÕES, DRAFT E ESCALAÇÕES
-- =========================================================================
CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'captain', 'player')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_id, player_id)
);

CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL UNIQUE REFERENCES player_profiles(id) ON DELETE CASCADE,
    pace INTEGER NOT NULL DEFAULT 85 CHECK (pace BETWEEN 1 AND 99),
    shooting INTEGER NOT NULL DEFAULT 85 CHECK (shooting BETWEEN 1 AND 99),
    passing INTEGER NOT NULL DEFAULT 85 CHECK (passing BETWEEN 1 AND 99),
    dribbling INTEGER NOT NULL DEFAULT 85 CHECK (dribbling BETWEEN 1 AND 99),
    defending INTEGER NOT NULL DEFAULT 70 CHECK (defending BETWEEN 1 AND 99),
    physical INTEGER NOT NULL DEFAULT 82 CHECK (physical BETWEEN 1 AND 99),
    build_image_url TEXT,
    ocr_extracted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE position_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL DEFAULT gen_random_uuid(),
    voted_position TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(player_id, voter_id)
);

CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL DEFAULT gen_random_uuid(),
    mechanic_score INTEGER NOT NULL CHECK (mechanic_score BETWEEN 1 AND 99),
    iq_score INTEGER NOT NULL CHECK (iq_score BETWEEN 1 AND 99),
    teamplay_score INTEGER NOT NULL CHECK (teamplay_score BETWEEN 1 AND 99),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE draft_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    pick_number INTEGER NOT NULL,
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_id, player_id),
    UNIQUE(tournament_id, round, pick_number)
);

CREATE TABLE squad_lineups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    slot_id TEXT NOT NULL,
    position_code TEXT NOT NULL,
    player_id UUID REFERENCES player_profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, slot_id)
);

CREATE TABLE tournament_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phase_type TEXT NOT NULL DEFAULT 'groups' CHECK (phase_type IN ('groups', 'knockout')),
    order_num INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'finished')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 7. PARTIDAS, SÚMULAS E INCIDENTES
-- =========================================================================
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES tournament_phases(id) ON DELETE SET NULL,
    round_number INTEGER NOT NULL DEFAULT 1,
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ,
    schedule_status TEXT NOT NULL DEFAULT 'unscheduled' CHECK (schedule_status IN ('unscheduled', 'proposed_by_home', 'proposed_by_away', 'confirmed')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'pending_validation', 'completed', 'disputed', 'wo', 'pending', 'approved', 'rejected')),
    home_score INTEGER NOT NULL DEFAULT 0,
    away_score INTEGER NOT NULL DEFAULT 0,
    proof_image_url TEXT,
    submitted_by_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    validated_by_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    motm_player_id UUID REFERENCES player_profiles(id) ON DELETE SET NULL,
    reported_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID
);

CREATE TABLE match_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES player_profiles(id) ON DELETE SET NULL,
    guest_name TEXT,
    character_name TEXT,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    goals INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    yellow_cards INTEGER NOT NULL DEFAULT 0,
    red_cards INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3, 1) DEFAULT 7.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE match_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    reported_by_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    incident_type TEXT NOT NULL CHECK (incident_type IN ('wo_delay', 'late_cancellation', 'player_disconnect_first_20', 'player_disconnect_halftime', 'game_bug')),
    minute_occurred INTEGER,
    score_at_incident TEXT,
    evidence_url TEXT,
    admin_resolution_notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tournament_finances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    entry_fee_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMPTZ,
    payment_proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tournament_id, team_id)
);

CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('goal', 'assist', 'yellow_card', 'red_card', 'clean_sheet')),
    minute INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE free_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL UNIQUE REFERENCES player_profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL DEFAULT 'PS5' CHECK (platform IN ('PS5', 'Xbox Series', 'PC', 'OldGen')),
    primary_position TEXT NOT NULL,
    secondary_positions TEXT[] DEFAULT '{}',
    description TEXT,
    contact_discord TEXT,
    contact_whatsapp TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 8. ÍNDICES DE PERFORMANCE
-- =========================================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_pp_character_name ON player_profiles(character_name);
CREATE INDEX idx_tp_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tp_role ON tournament_participants(role);
CREATE INDEX idx_eval_tourn ON evaluations(tournament_id, player_id);
CREATE INDEX idx_pv_player ON position_votes(player_id);
CREATE INDEX idx_dp_team ON draft_picks(tournament_id, team_id);
CREATE INDEX idx_sl_team ON squad_lineups(team_id);
CREATE INDEX idx_matches_tourn ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_mps_match ON match_player_stats(match_id);
CREATE INDEX idx_mi_match ON match_incidents(match_id);
CREATE INDEX idx_tr_tourn ON tournament_registrations(tournament_id);

-- =========================================================================
-- 9. VIEWS ANALÍTICAS DESTACANDO CHARACTER_NAME
-- =========================================================================
CREATE OR REPLACE VIEW vw_community_positions AS
WITH vote_counts AS (
    SELECT 
        player_id,
        voted_position,
        COUNT(*)::INT AS votes_for_pos,
        ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER (PARTITION BY player_id) * 100, 1) AS vote_percentage,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY COUNT(*) DESC) AS rank
    FROM position_votes
    GROUP BY player_id, voted_position
)
SELECT 
    p.id AS player_id,
    COALESCE(vc.voted_position, p.primary_position, (p.positions_declared)[1]) AS top_voted_position,
    COALESCE(vc.vote_percentage, 100.0) AS top_position_confidence,
    COALESCE(total_v.total_votes, 0) AS total_position_votes
FROM player_profiles p
LEFT JOIN vote_counts vc ON p.id = vc.player_id AND vc.rank = 1
LEFT JOIN (
    SELECT player_id, COUNT(*)::INT AS total_votes 
    FROM position_votes 
    GROUP BY player_id
) total_v ON p.id = total_v.player_id;

ALTER VIEW vw_community_positions SET (security_invoker = on);

CREATE OR REPLACE VIEW vw_tournament_player_stats AS
SELECT 
    tp.tournament_id,
    p.id AS player_id,
    COALESCE(p.character_name, p.name) AS name,
    p.character_name,
    p.full_name,
    p.archetype,
    p.positions_declared,
    COALESCE(cp.top_voted_position, p.primary_position, (p.positions_declared)[1]) AS community_position,
    COALESCE(cp.top_position_confidence, 0.0) AS community_confidence,
    cp.total_position_votes,
    tp.role AS participant_role,
    (tp.role = 'captain') AS is_captain,
    COUNT(e.id)::INT AS evaluation_count,
    COALESCE(ROUND(AVG(e.mechanic_score), 1), 0.0) AS avg_mechanic,
    COALESCE(ROUND(AVG(e.iq_score), 1), 0.0) AS avg_iq,
    COALESCE(ROUND(AVG(e.teamplay_score), 1), 0.0) AS avg_teamplay,
    COALESCE(ROUND(AVG((e.mechanic_score + e.iq_score + e.teamplay_score) / 3.0), 1), 0.0) AS overall_score,
    CASE 
        WHEN COUNT(e.id) = 0 THEN 'UNRATED'
        WHEN ROUND(AVG((e.mechanic_score + e.iq_score + e.teamplay_score) / 3.0), 1) >= 90.0 THEN 'S'
        WHEN ROUND(AVG((e.mechanic_score + e.iq_score + e.teamplay_score) / 3.0), 1) >= 80.0 THEN 'A'
        WHEN ROUND(AVG((e.mechanic_score + e.iq_score + e.teamplay_score) / 3.0), 1) >= 70.0 THEN 'B'
        WHEN ROUND(AVG((e.mechanic_score + e.iq_score + e.teamplay_score) / 3.0), 1) >= 60.0 THEN 'C'
        ELSE 'D'
    END AS tier,
    dp.team_id AS drafted_team_id,
    t.name AS drafted_team_name,
    dp.round AS draft_round,
    dp.pick_number AS draft_pick_number
FROM tournament_participants tp
JOIN player_profiles p ON tp.player_id = p.id
LEFT JOIN vw_community_positions cp ON p.id = cp.player_id
LEFT JOIN evaluations e ON tp.player_id = e.player_id AND tp.tournament_id = e.tournament_id
LEFT JOIN draft_picks dp ON tp.tournament_id = dp.tournament_id AND tp.player_id = dp.player_id
LEFT JOIN teams t ON dp.team_id = t.id
GROUP BY 
    tp.tournament_id, p.id, p.character_name, p.name, p.full_name, p.archetype, p.positions_declared, p.primary_position,
    cp.top_voted_position, cp.top_position_confidence, cp.total_position_votes,
    tp.role, dp.team_id, t.name, dp.round, dp.pick_number;

ALTER VIEW vw_tournament_player_stats SET (security_invoker = on);

CREATE OR REPLACE VIEW vw_tournament_standings AS
WITH team_matches AS (
    SELECT 
        m.tournament_id,
        m.home_team_id AS team_id,
        1 AS played,
        CASE WHEN m.home_score > m.away_score THEN 1 ELSE 0 END AS won,
        CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END AS drawn,
        CASE WHEN m.home_score < m.away_score THEN 1 ELSE 0 END AS lost,
        m.home_score AS goals_for,
        m.away_score AS goals_against,
        CASE 
            WHEN m.home_score > m.away_score THEN 3
            WHEN m.home_score = m.away_score THEN 1
            ELSE 0 
        END AS points
    FROM matches m
    WHERE m.status IN ('approved', 'completed', 'wo')
    
    UNION ALL
    
    SELECT 
        m.tournament_id,
        m.away_team_id AS team_id,
        1 AS played,
        CASE WHEN m.away_score > m.home_score THEN 1 ELSE 0 END AS won,
        CASE WHEN m.away_score = m.home_score THEN 1 ELSE 0 END AS drawn,
        CASE WHEN m.away_score < m.home_score THEN 1 ELSE 0 END AS lost,
        m.away_score AS goals_for,
        m.home_score AS goals_against,
        CASE 
            WHEN m.away_score > m.home_score THEN 3
            WHEN m.away_score = m.home_score THEN 1
            ELSE 0 
        END AS points
    FROM matches m
    WHERE m.status IN ('approved', 'completed', 'wo')
),
aggregated AS (
    SELECT 
        t.id AS team_id,
        t.tournament_id,
        t.name AS team_name,
        t.logo_url,
        t.captain_id,
        COALESCE(SUM(tm.played), 0)::INT AS played,
        COALESCE(SUM(tm.won), 0)::INT AS won,
        COALESCE(SUM(tm.drawn), 0)::INT AS drawn,
        COALESCE(SUM(tm.lost), 0)::INT AS lost,
        COALESCE(SUM(tm.goals_for), 0)::INT AS goals_for,
        COALESCE(SUM(tm.goals_against), 0)::INT AS goals_against,
        COALESCE(SUM(tm.goals_for - tm.goals_against), 0)::INT AS goal_difference,
        COALESCE(SUM(tm.points), 0)::INT AS points
    FROM teams t
    LEFT JOIN team_matches tm ON t.id = tm.team_id AND t.tournament_id = tm.tournament_id
    GROUP BY t.id, t.tournament_id, t.name, t.logo_url, t.captain_id
)
SELECT 
    a.*,
    ROW_NUMBER() OVER (
        PARTITION BY a.tournament_id 
        ORDER BY a.points DESC, a.goal_difference DESC, a.goals_for DESC, a.won DESC
    )::INT AS position
FROM aggregated a;

ALTER VIEW vw_tournament_standings SET (security_invoker = on);

CREATE OR REPLACE VIEW vw_top_scorers AS
SELECT 
    COALESCE(p.id, gen_random_uuid()) AS player_id,
    COALESCE(p.character_name, p.name, mps.character_name, mps.guest_name, 'Convidado') AS player_name,
    COALESCE(p.character_name, p.name, mps.character_name, mps.guest_name, 'Convidado') AS character_name,
    p.full_name,
    t.id AS team_id,
    t.name AS team_name,
    t.logo_url AS team_logo_url,
    m.tournament_id,
    SUM(mps.goals)::INT AS goals_count,
    COUNT(DISTINCT mps.match_id)::INT AS matches_played,
    ROUND(SUM(mps.goals)::NUMERIC / NULLIF(COUNT(DISTINCT mps.match_id), 0), 2) AS goals_per_match,
    ROW_NUMBER() OVER (PARTITION BY m.tournament_id ORDER BY SUM(mps.goals) DESC, COUNT(DISTINCT mps.match_id) ASC)::INT AS rank
FROM match_player_stats mps
JOIN matches m ON mps.match_id = m.id
LEFT JOIN player_profiles p ON mps.player_id = p.id
JOIN teams t ON mps.team_id = t.id
WHERE mps.goals > 0 AND m.status IN ('approved', 'completed')
GROUP BY p.id, p.character_name, p.name, p.full_name, mps.character_name, mps.guest_name, t.id, t.name, t.logo_url, m.tournament_id;

ALTER VIEW vw_top_scorers SET (security_invoker = on);

CREATE OR REPLACE VIEW vw_top_assists AS
SELECT 
    COALESCE(p.id, gen_random_uuid()) AS player_id,
    COALESCE(p.character_name, p.name, mps.character_name, mps.guest_name, 'Convidado') AS player_name,
    COALESCE(p.character_name, p.name, mps.character_name, mps.guest_name, 'Convidado') AS character_name,
    p.full_name,
    t.id AS team_id,
    t.name AS team_name,
    t.logo_url AS team_logo_url,
    m.tournament_id,
    SUM(mps.assists)::INT AS assists_count,
    COUNT(DISTINCT mps.match_id)::INT AS matches_played,
    ROW_NUMBER() OVER (PARTITION BY m.tournament_id ORDER BY SUM(mps.assists) DESC, COUNT(DISTINCT mps.match_id) ASC)::INT AS rank
FROM match_player_stats mps
JOIN matches m ON mps.match_id = m.id
LEFT JOIN player_profiles p ON mps.player_id = p.id
JOIN teams t ON mps.team_id = t.id
WHERE mps.assists > 0 AND m.status IN ('approved', 'completed')
GROUP BY p.id, p.character_name, p.name, p.full_name, mps.character_name, mps.guest_name, t.id, t.name, t.logo_url, m.tournament_id;

ALTER VIEW vw_top_assists SET (security_invoker = on);

-- =========================================================================
-- 10. SUPABASE STORAGE BUCKETS & POLICIES (PLAYER-MEDIA, TEAM-MEDIA, MATCH-PROOFS)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('player-media', 'player-media', true),
  ('team-media', 'team-media', true),
  ('match-proofs', 'match-proofs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Storage Objects" ON storage.objects;
CREATE POLICY "Public Read Storage Objects"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('player-media', 'team-media', 'match-proofs'));

DROP POLICY IF EXISTS "Authenticated Upload Storage Objects" ON storage.objects;
CREATE POLICY "Authenticated Upload Storage Objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('player-media', 'team-media', 'match-proofs'));

DROP POLICY IF EXISTS "Owner Update Storage Objects" ON storage.objects;
CREATE POLICY "Owner Update Storage Objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- =========================================================================
-- 11. ROW LEVEL SECURITY (RLS) ESTRITO COM VALIDAÇÃO AUTH.UID()
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_agents ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar se o usuário logado possui papel de admin
CREATE OR REPLACE FUNCTION public.is_league_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND ('admin' = ANY(roles))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES: Leitura pública; escrita restrita ao próprio dono da conta (auth.uid() = id) ou Admin
CREATE POLICY "Profiles Public Select" ON profiles FOR SELECT TO public USING (true);
CREATE POLICY "Profiles Self Insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles Self Update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_league_admin());

-- PLAYER_PROFILES: Leitura pública; escrita restrita ao dono do boneco (auth.uid() = user_id) ou Admin
CREATE POLICY "Player Profiles Public Select" ON player_profiles FOR SELECT TO public USING (true);
CREATE POLICY "Player Profiles Owner Insert" ON player_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_league_admin());
CREATE POLICY "Player Profiles Owner Update" ON player_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_league_admin());
CREATE POLICY "Player Profiles Admin Delete" ON player_profiles FOR DELETE TO authenticated USING (public.is_league_admin());

-- TEAMS: Leitura pública; atualização apenas pelo Capitão dono do time ou Admin
CREATE POLICY "Teams Public Select" ON teams FOR SELECT TO public USING (true);
CREATE POLICY "Teams Captain Insert" ON teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = captain_id OR public.is_league_admin());
CREATE POLICY "Teams Captain Update" ON teams FOR UPDATE TO authenticated USING (auth.uid() = captain_id OR public.is_league_admin());
CREATE POLICY "Teams Admin Delete" ON teams FOR DELETE TO authenticated USING (public.is_league_admin());

-- TOURNAMENTS: Leitura pública; escrita exclusiva de Admin
CREATE POLICY "Tournaments Public Select" ON tournaments FOR SELECT TO public USING (true);
CREATE POLICY "Tournaments Admin Write" ON tournaments FOR ALL TO authenticated USING (public.is_league_admin()) WITH CHECK (public.is_league_admin());

-- TOURNAMENT_REGISTRATIONS: Leitura pública; atualização pelo Capitão do time ou Admin
CREATE POLICY "Registrations Public Select" ON tournament_registrations FOR SELECT TO public USING (true);
CREATE POLICY "Registrations Captain Or Admin Write" ON tournament_registrations FOR ALL TO authenticated
USING (
  public.is_league_admin() OR EXISTS (
    SELECT 1 FROM public.teams t WHERE t.id = tournament_registrations.team_id AND t.captain_id = auth.uid()
  )
)
WITH CHECK (
  public.is_league_admin() OR EXISTS (
    SELECT 1 FROM public.teams t WHERE t.id = tournament_registrations.team_id AND t.captain_id = auth.uid()
  )
);

-- MATCHES: Leitura pública; atualização apenas pelos Capitães dos 2 times envolvidos no confronto ou Admin
-- E impede que o mesmo time que enviou a súmula faça a auto-validação como time adversário
CREATE POLICY "Matches Public Select" ON matches FOR SELECT TO public USING (true);
CREATE POLICY "Matches Captains Or Admin Update" ON matches FOR UPDATE TO authenticated
USING (
  public.is_league_admin() OR EXISTS (
    SELECT 1 FROM public.teams t
    WHERE (t.id = matches.home_team_id OR t.id = matches.away_team_id)
      AND t.captain_id = auth.uid()
  )
)
WITH CHECK (
  public.is_league_admin() OR (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE (t.id = matches.home_team_id OR t.id = matches.away_team_id)
        AND t.captain_id = auth.uid()
    )
    AND (
      matches.validated_by_team_id IS NULL
      OR matches.validated_by_team_id <> matches.submitted_by_team_id
    )
  )
);
CREATE POLICY "Matches Admin Insert" ON matches FOR INSERT TO authenticated WITH CHECK (public.is_league_admin());

-- Demais tabelas auxiliares com leitura pública e escrita autenticada
CREATE POLICY "Public Select Participants" ON tournament_participants FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Participants" ON tournament_participants FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Player Stats" ON player_stats FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Player Stats" ON player_stats FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Votes" ON position_votes FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Votes" ON position_votes FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Evaluations" ON evaluations FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Evaluations" ON evaluations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Public Select Draft Picks" ON draft_picks FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Draft Picks" ON draft_picks FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Lineups" ON squad_lineups FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Lineups" ON squad_lineups FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Phases" ON tournament_phases FOR SELECT TO public USING (true);
CREATE POLICY "Admin Write Phases" ON tournament_phases FOR ALL TO authenticated USING (public.is_league_admin());
CREATE POLICY "Public Select Match Player Stats" ON match_player_stats FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Match Player Stats" ON match_player_stats FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Incidents" ON match_incidents FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Incidents" ON match_incidents FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Finances" ON tournament_finances FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Finances" ON tournament_finances FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Events" ON match_events FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Events" ON match_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Public Select Free Agents" ON free_agents FOR SELECT TO public USING (true);
CREATE POLICY "Auth Write Free Agents" ON free_agents FOR ALL TO authenticated USING (true);
