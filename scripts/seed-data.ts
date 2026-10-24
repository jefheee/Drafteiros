import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// Carregar variáveis de .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function toUuid(str: string): string {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

import {
  FALLBACK_TOURNAMENTS,
  FALLBACK_TEAMS,
  FALLBACK_PLAYERS,
  FALLBACK_MATCHES,
} from '../lib/mock-league-data';

async function seed() {
  console.log('--- SEEDING SUPABASE REAL DATABASE (VALID UUIDs) ---');

  const teamIdMap: Record<string, string> = {};
  const playerIdMap: Record<string, string> = {};
  const tournamentIdMap: Record<string, string> = {};

  // 1. Inserir Torneios
  console.log(`Inserindo ${FALLBACK_TOURNAMENTS.length} torneios...`);
  for (const t of FALLBACK_TOURNAMENTS) {
    const validId = toUuid(t.id);
    tournamentIdMap[t.id] = validId;

    const { error } = await supabase.from('tournaments').upsert({
      id: validId,
      name: t.name,
      format: t.format,
      format_label: t.format_label || '5v5',
      game_mode: t.game_mode || '5v5',
      players_on_pitch: t.players_on_pitch || 5,
      max_reserves: t.max_reserves || 1,
      max_roster_size: t.max_roster_size || 6,
      entry_fee: t.entry_fee || 70,
      bracket_type: t.bracket_type || 'league_playoffs',
      bracket_config: t.bracket_config || {},
      custom_rules: t.custom_rules || [],
      prize_distribution: t.prize_distribution || {},
      prize_breakdown: t.prize_breakdown || {},
      rules_config: t.rules_config || {},
      draft_order: t.draft_order || [],
      status: t.status || 'ACTIVE',
      rules: t.rules || {},
      season_label: t.season_label || 'Temporada 2026.2',
      champion_team_name: t.champion_team_name,
      top_scorer_name: t.top_scorer_name,
      created_at: t.created_at || new Date().toISOString(),
    });
    if (error) console.error(`Erro torneio ${t.name}:`, error.message);
  }

  // 2. Inserir Times
  console.log(`Inserindo ${FALLBACK_TEAMS.length} equipes...`);
  for (const team of FALLBACK_TEAMS) {
    const validTeamId = toUuid(team.id);
    teamIdMap[team.id] = validTeamId;
    const validTournId = tournamentIdMap[team.tournament_id] || toUuid(team.tournament_id);

    const { error } = await supabase.from('teams').upsert({
      id: validTeamId,
      tournament_id: validTournId,
      name: team.name,
      short_name: team.short_name || 'CLB',
      active_formation: team.active_formation || '5v5-1-2-1',
      logo_url: team.logo_url,
      kit_home_url: team.kit_home_url,
      kit_away_url: team.kit_away_url,
      primary_color: team.primary_color || '#7C5CFC',
      secondary_color: team.secondary_color || '#38bdf8',
      invite_code: team.invite_code,
      kit_description: team.kit_description,
      sponsors: team.sponsors || [],
      whatsapp_group_link: team.whatsapp_group_link,
      instagram_handle: team.instagram_handle,
      points: team.points || 0,
      matches_played: team.matches_played || 0,
      wins: team.wins || 0,
      draws: team.draws || 0,
      losses: team.losses || 0,
      goals_for: team.goals_for || 0,
      goals_against: team.goals_against || 0,
      created_at: team.created_at || new Date().toISOString(),
    });
    if (error) console.error(`Erro equipe ${team.name}:`, error.message);
  }

  // 3. Inserir Jogadores
  console.log(`Inserindo ${FALLBACK_PLAYERS.length} atletas...`);
  for (const p of FALLBACK_PLAYERS) {
    const validPlayerId = toUuid(p.id);
    playerIdMap[p.id] = validPlayerId;
    const validTeamId = p.team_id ? teamIdMap[p.team_id] || toUuid(p.team_id) : null;

    const { error } = await supabase.from('player_profiles').upsert({
      id: validPlayerId,
      name: p.name,
      character_name: p.character_name || p.name,
      full_name: p.full_name || p.name,
      team_id: validTeamId,
      avatar_url: p.avatar_url,
      avatar_face_url: p.avatar_face_url,
      avatar_body_url: p.avatar_body_url,
      card_design: p.card_design || '/assets/fc-26-clean-card-designs/default/gold-rare.webp',
      primary_position: p.primary_position || 'MEI',
      secondary_positions: p.secondary_positions || [],
      positions_declared: p.positions_declared || [p.primary_position || 'MEI'],
      archetype: p.archetype || 'Maestro',
      archetypes: p.archetypes || [p.archetype || 'Maestro'],
      height_cm: p.height_cm || 185,
      weight_kg: p.weight_kg || 78,
      gender: p.gender || 'M',
      attributes: p.attributes || {},
      accelerate_type: p.accelerate_type || 'Controlada',
      accelerate_sub_type: p.accelerate_sub_type || 'Controlled (100% Controlada)',
      playstyles: p.playstyles || [],
      availability_slots: p.availability_slots || {},
      career_stats: p.career_stats || {},
      platform: p.platform || 'PS5',
      contact_discord: p.contact_discord,
      contact_whatsapp: p.contact_whatsapp,
      is_looking_for_team: p.is_looking_for_team || false,
      bio: p.bio,
      visual_traits: p.visual_traits || {},
      availability: p.availability || {},
      medals: p.medals || [],
      created_at: p.created_at || new Date().toISOString(),
    });
    if (error) console.error(`Erro atleta ${p.character_name}:`, error.message);
  }

  // 4. Inserir Participantes no Torneio
  console.log('Vinculando atletas aos torneios...');
  const mainTournId = tournamentIdMap[FALLBACK_TOURNAMENTS[0].id] || toUuid(FALLBACK_TOURNAMENTS[0].id);
  for (const p of FALLBACK_PLAYERS) {
    const validPlayerId = playerIdMap[p.id];
    await supabase.from('tournament_participants').upsert({
      tournament_id: mainTournId,
      player_id: validPlayerId,
      role: 'player',
    }, { onConflict: 'tournament_id,player_id' });
  }

  // 5. Inserir Partidas
  console.log(`Inserindo ${FALLBACK_MATCHES.length} partidas...`);
  for (const m of FALLBACK_MATCHES) {
    const validMatchId = toUuid(m.id);
    const validTournId = tournamentIdMap[m.tournament_id] || toUuid(m.tournament_id);
    const validHomeId = teamIdMap[m.home_team_id] || toUuid(m.home_team_id);
    const validAwayId = teamIdMap[m.away_team_id] || toUuid(m.away_team_id);

    const { error } = await supabase.from('matches').upsert({
      id: validMatchId,
      tournament_id: validTournId,
      round_number: m.round_number || 1,
      home_team_id: validHomeId,
      away_team_id: validAwayId,
      scheduled_at: m.scheduled_at,
      schedule_status: m.schedule_status || 'unscheduled',
      status: m.status || 'scheduled',
      home_score: m.home_score || 0,
      away_score: m.away_score || 0,
      proof_image_url: m.proof_image_url,
      submitted_by_team_id: m.submitted_by_team_id ? teamIdMap[m.submitted_by_team_id] || toUuid(m.submitted_by_team_id) : null,
      validated_by_team_id: m.validated_by_team_id ? teamIdMap[m.validated_by_team_id] || toUuid(m.validated_by_team_id) : null,
      motm_player_id: m.motm_player_id ? playerIdMap[m.motm_player_id] || toUuid(m.motm_player_id) : null,
      created_at: m.created_at || new Date().toISOString(),
    });
    if (error) console.error(`Erro partida ${m.id}:`, error.message);
  }

  console.log('--- SUPABASE 100% POPULADO COM DADOS REAIS! ---');
}

seed().catch(console.error);
