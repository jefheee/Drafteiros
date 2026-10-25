import { supabase } from '@/lib/supabase';

export type AppUserRole = 'admin' | 'captain' | 'player';

export interface AppSession {
  userId: string;
  email: string;
  fullName: string;
  characterName: string;
  role: AppUserRole;
  roles: AppUserRole[];
  teamId?: string;
  teamName?: string;
  onboardingCompleted?: boolean;
  avatarUrl?: string;
}

const SESSION_KEY = 'drafteiros_auth_session_v1';

export function setAuthCookie(role: AppUserRole) {
  if (typeof document === 'undefined') return;
  document.cookie = `drafteiros_role=${role}; path=/; max-age=2592000; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'drafteiros_role=; path=/; max-age=0; SameSite=Lax';
}

export function getStoredSession(): AppSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppSession;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: AppSession | null) {
  if (typeof window === 'undefined') return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    clearAuthCookie();
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setAuthCookie(session.role);
}

export async function buildAppSessionForUser(
  userId: string,
  email: string,
  metadata?: Record<string, unknown>
): Promise<AppSession> {
  const fallbackName =
    (typeof metadata?.full_name === 'string' && metadata.full_name) ||
    email.split('@')[0] ||
    'Atleta';

  const [{ data: profileRow }, { data: playerRow }, { data: captainTeamRow }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase
        .from('player_profiles')
        .select('*')
        .or(`user_id.eq.${userId},id.eq.${userId}`)
        .maybeSingle(),
      supabase.from('teams').select('*').eq('captain_id', userId).maybeSingle(),
    ]);

  let teamId = playerRow?.team_id || captainTeamRow?.id || undefined;
  let teamName = captainTeamRow?.name || undefined;

  if (teamId && !teamName) {
    const { data: teamData } = await supabase
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .maybeSingle();
    if (teamData?.name) teamName = teamData.name;
  }

  const roles: AppUserRole[] = Array.isArray(profileRow?.roles) && profileRow.roles.length > 0
    ? (profileRow.roles as AppUserRole[])
    : captainTeamRow
    ? ['captain', 'player']
    : ['player'];

  const activeRole: AppUserRole =
    (profileRow?.active_role_view as AppUserRole) ||
    (captainTeamRow ? 'captain' : roles[0] || 'player');

  const onboardingCompleted = Boolean(
    profileRow?.onboarding_completed || playerRow || captainTeamRow
  );

  const session: AppSession = {
    userId,
    email: profileRow?.email || email,
    fullName: profileRow?.full_name || playerRow?.full_name || fallbackName,
    characterName:
      playerRow?.character_name ||
      profileRow?.character_name ||
      fallbackName.toUpperCase(),
    role: activeRole,
    roles,
    teamId,
    teamName,
    onboardingCompleted,
    avatarUrl:
      playerRow?.avatar_face_url ||
      playerRow?.avatar_url ||
      profileRow?.avatar_url ||
      undefined,
  };

  saveStoredSession(session);
  return session;
}

export function clearSession() {
  saveStoredSession(null);
}
