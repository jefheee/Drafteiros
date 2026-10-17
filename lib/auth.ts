import { ParticipantRole } from '@/types/database';

export interface AuthSession {
  userId: string;
  email: string;
  name: string; // Exibido no header / compatibilidade
  fullName: string; // Nome real da pessoa (uso administrativo/financeiro, ex: "Jefherson")
  characterName: string; // Nome do boneco no Pro Clubs (destaque absoluto, ex: "Jefhe")
  role: ParticipantRole; // Visão ativa no momento ('player' | 'captain' | 'admin')
  roles: ParticipantRole[]; // Todos os papéis acumulados na mesma conta
  playerId?: string;
  teamId?: string | null;
  teamName?: string | null;
  tournamentId?: string;
  avatarUrl?: string;
}

export const DEMO_USERS: Record<string, AuthSession> = {
  captain: {
    userId: 'u0000000-0000-0000-0000-000000000004',
    email: 'capitao@draftclub.pro',
    name: 'Jefhe',
    fullName: 'Jefherson',
    characterName: 'Jefhe',
    role: 'captain',
    roles: ['player', 'captain', 'admin'],
    playerId: 'p1111111-1111-1111-1111-111111111111',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Furia del Plata',
    tournamentId: '11111111-1111-1111-1111-111111111111',
    avatarUrl: '/assets/templates/avatar-placeholder.jpg',
  },
  admin: {
    userId: 'u0000000-0000-0000-0000-000000000001',
    email: 'admin@draftclub.pro',
    name: 'Jefhe (Admin LPF)',
    fullName: 'Jefherson',
    characterName: 'Jefhe',
    role: 'admin',
    roles: ['player', 'captain', 'admin'],
    playerId: 'p1111111-1111-1111-1111-111111111111',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Furia del Plata',
    tournamentId: '11111111-1111-1111-1111-111111111111',
    avatarUrl: '/assets/templates/avatar-placeholder.jpg',
  },
  player: {
    userId: 'p1111111-1111-1111-1111-111111111111',
    email: 'atleta@draftclub.pro',
    name: 'Jefhe',
    fullName: 'Jefherson',
    characterName: 'Jefhe',
    role: 'player',
    roles: ['player', 'captain', 'admin'],
    playerId: 'p1111111-1111-1111-1111-111111111111',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Furia del Plata',
    tournamentId: '11111111-1111-1111-1111-111111111111',
    avatarUrl: '/assets/templates/avatar-placeholder.jpg',
  },
  captain_boca: {
    userId: 'u0000000-0000-0000-0000-000000000002',
    email: 'haalandinho@lacatimba.gg',
    name: 'Haalandinho',
    fullName: 'Lucas Andrade',
    characterName: 'Haalandinho',
    role: 'captain',
    roles: ['player', 'captain', 'admin'],
    playerId: 'p4444444-4444-4444-4444-444444444444',
    teamId: 'b1111111-1111-1111-1111-111111111111',
    teamName: 'La Catimba',
    tournamentId: '11111111-1111-1111-1111-111111111111',
  },
  captain_river: {
    userId: 'u0000000-0000-0000-0000-000000000003',
    email: 'deivy@riverplate.gg',
    name: 'Deivy_10',
    fullName: 'Deivid Oliveira',
    characterName: 'Deivy_10',
    role: 'captain',
    roles: ['player', 'captain', 'admin'],
    playerId: 'p2222222-2222-2222-2222-222222222222',
    teamId: 'b2222222-2222-2222-2222-222222222222',
    teamName: 'River Plate eSports',
    tournamentId: '11111111-1111-1111-1111-111111111111',
  },
  captain_racing: {
    userId: 'u0000000-0000-0000-0000-000000000004',
    email: 'capitao@draftclub.pro',
    name: 'Jefhe',
    fullName: 'Jefherson',
    characterName: 'Jefhe',
    role: 'captain',
    roles: ['player', 'captain', 'admin'],
    playerId: 'p1111111-1111-1111-1111-111111111111',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Furia del Plata',
    tournamentId: '11111111-1111-1111-1111-111111111111',
  },
};

const STORAGE_KEY = 'draftclub_auth_session_v3';

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    return {
      ...parsed,
      fullName: parsed.fullName || parsed.name || 'Atleta',
      characterName: parsed.characterName || parsed.name || 'Jefhe',
      roles: ['player', 'captain', 'admin'],
    };
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized: AuthSession = {
      ...session,
      roles: ['player', 'captain', 'admin'],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    document.cookie = "draftclub-demo-role=" + normalized.role + "; path=/; max-age=604800; SameSite=Lax";
    document.cookie = "draftclub_role=" + normalized.role + "; path=/; max-age=604800; SameSite=Lax";
    document.cookie = `sb-access-token=demo-session-token; path=/; max-age=604800; SameSite=Lax`;
    if (normalized.teamId) {
      document.cookie = `draftclub_team=${normalized.teamId}; path=/; max-age=604800; SameSite=Lax`;
    }
  } catch (err) {
    console.warn('Erro ao salvar sessão local:', err);
  }
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = 'draftclub-demo-role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'draftclub_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'draftclub_team=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
  } catch (err) {
    console.warn('Erro ao limpar sessão:', err);
  }
}
