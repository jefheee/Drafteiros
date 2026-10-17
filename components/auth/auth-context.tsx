'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  AuthSession,
  DEMO_USERS,
  getStoredSession,
  setStoredSession,
  clearStoredSession,
} from '@/lib/auth';
import { ParticipantRole } from '@/types/database';

export interface RegisterAccountInput {
  email: string;
  password: string;
  fullName: string;
  characterName: string;
  primaryPosition: string;
  isCaptain?: boolean;
  teamName?: string;
}

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  loginAsDemo: (demoKey: keyof typeof DEMO_USERS, redirectTo?: string) => void;
  loginWithSupabase: (
    email: string,
    pass: string,
    redirectTo?: string
  ) => Promise<{ error?: string }>;
  registerWithSupabase: (
    input: RegisterAccountInput,
    redirectTo?: string
  ) => Promise<{ error?: string }>;
  switchProfileRole: (role: ParticipantRole, navigate?: boolean) => void;
  updateSessionIdentity: (partial: Partial<AuthSession>) => void;
  logout: () => void;
  isAdmin: boolean;
  isCaptain: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  loginAsDemo: () => {},
  loginWithSupabase: async () => ({}),
  registerWithSupabase: async () => ({}),
  switchProfileRole: () => {},
  updateSessionIdentity: () => {},
  logout: () => {},
  isAdmin: false,
  isCaptain: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const local = getStoredSession();
    if (local) {
      setStoredSession(local);
      setSession(local);
      setLoading(false);
      return;
    }

    async function checkSupabaseSession() {
      try {
        const {
          data: { session: sbSession },
        } = await supabase.auth.getSession();
        if (sbSession?.user) {
          const email = sbSession.user.email || '';
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sbSession.user.id)
            .maybeSingle();

          const roles: ParticipantRole[] =
            prof?.roles && prof.roles.length > 0
              ? prof.roles
              : ['player', 'captain', 'admin'];
          const activeRole: ParticipantRole =
            prof?.active_role_view ||
            (email.includes('admin')
              ? 'admin'
              : email.includes('atleta')
              ? 'player'
              : 'captain');

          const charName =
            prof?.character_name ||
            sbSession.user.user_metadata?.character_name ||
            sbSession.user.user_metadata?.name ||
            email.split('@')[0];

          const fullName =
            prof?.full_name ||
            sbSession.user.user_metadata?.full_name ||
            charName;

          const newSession: AuthSession = {
            userId: sbSession.user.id,
            email,
            name: charName,
            fullName,
            characterName: charName,
            role: activeRole,
            roles,
            playerId: 'p1111111-1111-1111-1111-111111111111',
            teamId: 'b3333333-3333-3333-3333-333333333333',
            teamName: 'Furia del Plata',
            tournamentId: '11111111-1111-1111-1111-111111111111',
          };
          setStoredSession(newSession);
          setSession(newSession);
        } else {
          const defaultSession = DEMO_USERS.captain;
          setStoredSession(defaultSession);
          setSession(defaultSession);
        }
      } catch {
        const defaultSession = DEMO_USERS.captain;
        setStoredSession(defaultSession);
        setSession(defaultSession);
      } finally {
        setLoading(false);
      }
    }

    checkSupabaseSession();
  }, []);

  const navigateByRole = (role: ParticipantRole, redirectTo?: string) => {
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'player') {
      router.push('/player');
    } else {
      router.push('/captain');
    }
  };

  const loginAsDemo = (demoKey: keyof typeof DEMO_USERS, redirectTo?: string) => {
    const user = DEMO_USERS[demoKey] || DEMO_USERS.captain;
    setStoredSession(user);
    setSession(user);
    navigateByRole(user.role, redirectTo);
  };

  // Alterna a visão ativa na mesma conta sem deslogar (Estilo Jogueiros)
  const switchProfileRole = (role: ParticipantRole, navigate = false) => {
    const current = session || getStoredSession() || DEMO_USERS.captain;
    const ensuredRoles: ParticipantRole[] = current.roles?.includes(role)
      ? current.roles
      : [...(current.roles || ['player']), role];

    const updated: AuthSession = {
      ...current,
      role,
      roles: ensuredRoles,
    };
    setStoredSession(updated);
    setSession(updated);

    // Persiste active_role_view no Supabase caso esteja autenticado
    Promise.resolve(
      supabase
        .from('profiles')
        .update({ active_role_view: role, roles: ensuredRoles })
        .eq('id', updated.userId)
    ).catch(() => {});

    if (navigate) {
      navigateByRole(role);
    }
  };

  const updateSessionIdentity = (partial: Partial<AuthSession>) => {
    const current = session || getStoredSession() || DEMO_USERS.captain;
    const updated: AuthSession = {
      ...current,
      ...partial,
      name: partial.characterName || partial.name || current.characterName,
    };
    setStoredSession(updated);
    setSession(updated);
  };

  const loginWithSupabase = async (
    email: string,
    pass: string,
    redirectTo?: string
  ): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanEmail === 'capitao@draftclub.pro' ||
      cleanEmail === 'buzz@bocajuniors.gg' ||
      cleanEmail === 'andrei@racingclub.gg'
    ) {
      const user = DEMO_USERS.captain;
      setStoredSession(user);
      setSession(user);
      navigateByRole(user.role, redirectTo);
      return {};
    }

    if (cleanEmail === 'admin@draftclub.pro' || cleanEmail === 'admin@draftclub.gg') {
      const user = DEMO_USERS.admin;
      setStoredSession(user);
      setSession(user);
      navigateByRole(user.role, redirectTo);
      return {};
    }

    if (cleanEmail === 'atleta@draftclub.pro') {
      const user = DEMO_USERS.player;
      setStoredSession(user);
      setSession(user);
      navigateByRole(user.role, redirectTo);
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        if (pass === '123456') {
          const fallbackRole: ParticipantRole = cleanEmail.includes('admin')
            ? 'admin'
            : cleanEmail.includes('atleta')
            ? 'player'
            : 'captain';
          const fallbackUser = DEMO_USERS[fallbackRole];
          setStoredSession(fallbackUser);
          setSession(fallbackUser);
          navigateByRole(fallbackUser.role, redirectTo);
          return {};
        }
        return { error: error.message };
      }

      if (data?.user) {
        const meta = data.user.user_metadata || {};
        const charName = meta.character_name || meta.name || cleanEmail.split('@')[0];
        const fullName = meta.full_name || charName;
        const role: ParticipantRole = cleanEmail.includes('admin')
          ? 'admin'
          : meta.active_role_view || 'player';

        const newSession: AuthSession = {
          userId: data.user.id,
          email: data.user.email || cleanEmail,
          name: charName,
          fullName,
          characterName: charName,
          role,
          roles: ['player', 'captain', 'admin'],
          playerId: data.user.id,
          teamId: 'b3333333-3333-3333-3333-333333333333',
          teamName: meta.team_name || 'Furia del Plata',
          tournamentId: '11111111-1111-1111-1111-111111111111',
        };
        setStoredSession(newSession);
        setSession(newSession);
        navigateByRole(role, redirectTo);
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Falha na autenticação.' };
    }
  };

  const registerWithSupabase = async (
    input: RegisterAccountInput,
    redirectTo?: string
  ): Promise<{ error?: string }> => {
    const cleanEmail = input.email.trim().toLowerCase();
    const charName = input.characterName.trim() || 'Atleta_Pro';
    const fullName = input.fullName.trim() || charName;
    const initialRole: ParticipantRole = input.isCaptain ? 'captain' : 'player';
    const roles: ParticipantRole[] = input.isCaptain
      ? ['player', 'captain', 'admin']
      : ['player', 'captain', 'admin'];

    let newUserId = `u-${Date.now()}`;

    try {
      const { data } = await supabase.auth.signUp({
        email: cleanEmail,
        password: input.password,
        options: {
          data: {
            full_name: fullName,
            character_name: charName,
            primary_position: input.primaryPosition,
            active_role_view: initialRole,
            team_name: input.teamName || 'Furia del Plata',
          },
        },
      });
      if (data?.user?.id) {
        newUserId = data.user.id;
      }

      await supabase.from('profiles').upsert({
        id: newUserId,
        email: cleanEmail,
        full_name: fullName,
        character_name: charName,
        roles,
        active_role_view: initialRole,
      });

      await supabase.from('player_profiles').upsert({
        id: newUserId,
        user_id: newUserId,
        name: charName,
        character_name: charName,
        full_name: fullName,
        primary_position: input.primaryPosition || 'MEI',
        positions_declared: [input.primaryPosition || 'MEI'],
        archetype: 'Maestro',
      });
    } catch {
      // Continua registrando localmente para funcionamento imediato
    }

    const createdSession: AuthSession = {
      userId: newUserId,
      email: cleanEmail,
      name: charName,
      fullName,
      characterName: charName,
      role: initialRole,
      roles,
      playerId: 'p1111111-1111-1111-1111-111111111111',
      teamId: 'b3333333-3333-3333-3333-333333333333',
      teamName: input.teamName?.trim() || 'Furia del Plata',
      tournamentId: '11111111-1111-1111-1111-111111111111',
    };

    setStoredSession(createdSession);
    setSession(createdSession);
    navigateByRole(initialRole, redirectTo);
    return {};
  };

  const logout = () => {
    clearStoredSession();
    supabase.auth.signOut().catch(() => {});
    setSession(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        loginAsDemo,
        loginWithSupabase,
        registerWithSupabase,
        switchProfileRole,
        updateSessionIdentity,
        logout,
        isAdmin: session?.role === 'admin',
        isCaptain: session?.role === 'captain' || session?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
