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

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  loginAsDemo: (demoKey: keyof typeof DEMO_USERS, redirectTo?: string) => void;
  loginWithSupabase: (email: string, pass: string, redirectTo?: string) => Promise<{ error?: string }>;
  switchProfileRole: (role: 'captain' | 'player' | 'admin') => void;
  logout: () => void;
  isAdmin: boolean;
  isCaptain: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  loginAsDemo: () => {},
  loginWithSupabase: async () => ({}),
  switchProfileRole: () => {},
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
      // Sincroniza cookies HTTP caso a sessão estivesse apenas no localStorage
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
          const role = email.includes('admin')
            ? 'admin'
            : email.includes('atleta')
            ? 'player'
            : 'captain';
          const newSession: AuthSession = {
            userId: sbSession.user.id,
            email,
            name: sbSession.user.user_metadata?.name || email.split('@')[0],
            role,
            teamId: 'b3333333-3333-3333-3333-333333333333',
            teamName: 'Furia del Plata',
            tournamentId: '11111111-1111-1111-1111-111111111111',
          };
          setStoredSession(newSession);
          setSession(newSession);
        } else {
          // Define sessão padrão Dono de Time (Furia del Plata) para experiência Jogueiros imediata
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

  const navigateByRole = (role: string, redirectTo?: string) => {
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

  const switchProfileRole = (role: 'captain' | 'player' | 'admin') => {
    const targetUser =
      role === 'admin'
        ? DEMO_USERS.admin
        : role === 'player'
        ? DEMO_USERS.player
        : DEMO_USERS.captain;
    setStoredSession(targetUser);
    setSession(targetUser);
  };

  const loginWithSupabase = async (
    email: string,
    pass: string,
    redirectTo?: string
  ): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Verifica credenciais oficiais de avaliação / demonstração (123456)
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

    // 2. Caso seja outro e-mail, tenta autenticar via Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        // Fallback amigável caso o e-mail contenha admin/capitao/atleta e senha seja 123456
        if (pass === '123456') {
          const fallbackRole = cleanEmail.includes('admin')
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
        const role = cleanEmail.includes('admin')
          ? 'admin'
          : cleanEmail.includes('atleta')
          ? 'player'
          : 'captain';
        const newSession: AuthSession = {
          userId: data.user.id,
          email: data.user.email || cleanEmail,
          name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
          role,
          teamId: 'b3333333-3333-3333-3333-333333333333',
          teamName: 'Furia del Plata',
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
        switchProfileRole,
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
