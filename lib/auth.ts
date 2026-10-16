import { ParticipantRole } from '@/types/database';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: ParticipantRole;
  teamId?: string | null;
  teamName?: string | null;
  tournamentId?: string;
  avatarUrl?: string;
}

export const DEMO_USERS: Record<string, AuthSession> = {
  captain: {
    userId: 'u0000000-0000-0000-0000-000000000004',
    email: 'capitao@draftclub.pro',
    name: 'Furia del Plata',
    role: 'captain',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Furia del Plata',
    tournamentId: '11111111-1111-1111-1111-111111111111',
    avatarUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&q=80',
  },
  admin: {
    userId: 'u0000000-0000-0000-0000-000000000001',
    email: 'admin@draftclub.pro',
    name: 'Admin Liga LPF 5x5',
    role: 'admin',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Liga Argentina 5x5',
    tournamentId: '11111111-1111-1111-1111-111111111111',
    avatarUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&q=80',
  },
  player: {
    userId: 'p1111111-1111-1111-1111-111111111111',
    email: 'atleta@draftclub.pro',
    name: 'Jefhe',
    role: 'player',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Furia del Plata',
    tournamentId: '11111111-1111-1111-1111-111111111111',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
  },
  captain_boca: {
    userId: 'u0000000-0000-0000-0000-000000000002',
    email: 'capitao@draftclub.pro',
    name: 'Furia del Plata',
    role: 'captain',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Furia del Plata',
    tournamentId: '11111111-1111-1111-1111-111111111111',
  },
  captain_river: {
    userId: 'u0000000-0000-0000-0000-000000000003',
    email: 'deivy@riverplate.gg',
    name: 'Deivy (River Plate)',
    role: 'captain',
    teamId: 'b2222222-2222-2222-2222-222222222222',
    teamName: 'River Plate eSports',
    tournamentId: '11111111-1111-1111-1111-111111111111',
  },
  captain_racing: {
    userId: 'u0000000-0000-0000-0000-000000000004',
    email: 'capitao@draftclub.pro',
    name: 'Furia del Plata',
    role: 'captain',
    teamId: 'b3333333-3333-3333-3333-333333333333',
    teamName: 'Furia del Plata',
    tournamentId: '11111111-1111-1111-1111-111111111111',
  },
};

const STORAGE_KEY = 'draftclub_auth_session';

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    // Grava cookies HTTP para proteção imediata no middleware.ts
    document.cookie = `draftclub-demo-role=${session.role}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `draftclub_role=${session.role}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `sb-access-token=demo-session-token; path=/; max-age=604800; SameSite=Lax`;
    if (session.teamId) {
      document.cookie = `draftclub_team=${session.teamId}; path=/; max-age=604800; SameSite=Lax`;
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
