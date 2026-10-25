'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  AppSession,
  AppUserRole,
  getStoredSession,
  saveStoredSession,
  buildAppSessionForUser,
  clearSession,
} from '@/lib/auth';

interface AuthContextValue {
  session: AppSession | null;
  loading: boolean;
  loginWithEmail: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; session?: AppSession }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ ok: boolean; error?: string; session?: AppSession }>;
  switchRole: (role: AppUserRole) => Promise<void>;
  updateSessionIdentity: (updates: Partial<AppSession>) => void;
  refreshSession: () => Promise<AppSession | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async (): Promise<AppSession | null> => {
    try {
      const {
        data: { session: supaSession },
      } = await supabase.auth.getSession();

      if (supaSession?.user) {
        const built = await buildAppSessionForUser(
          supaSession.user.id,
          supaSession.user.email || '',
          supaSession.user.user_metadata
        );
        setSession(built);
        return built;
      }

      const cached = getStoredSession();
      if (cached) {
        setSession(cached);
        return cached;
      }

      setSession(null);
      return null;
    } catch {
      setSession(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getStoredSession();
    if (cached) {
      setSession(cached);
    }
    refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, supaSession) => {
      if (event === 'SIGNED_OUT') {
        clearSession();
        setSession(null);
        setLoading(false);
        return;
      }
      if (supaSession?.user) {
        const built = await buildAppSessionForUser(
          supaSession.user.id,
          supaSession.user.email || '',
          supaSession.user.user_metadata
        );
        setSession(built);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return {
          ok: false,
          error:
            error?.message === 'Invalid login credentials'
              ? 'E-mail ou senha incorretos. Verifique seus dados ou crie uma conta.'
              : error?.message || 'Não foi possível entrar.',
        };
      }

      const built = await buildAppSessionForUser(
        data.user.id,
        data.user.email || cleanEmail,
        data.user.user_metadata
      );
      setSession(built);
      return { ok: true, session: built };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Erro inesperado ao entrar.',
      };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim() || cleanEmail.split('@')[0];

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error || !data.user) {
        return {
          ok: false,
          error: error?.message || 'Não foi possível criar sua conta.',
        };
      }

      // Garante sessão ativa imediata (graças ao trigger de auto-confirmação no banco)
      if (!data.session) {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      }

      // Cria registro inicial em profiles no Supabase
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          character_name: cleanName.toUpperCase(),
          roles: ['player'],
          active_role_view: 'player',
          onboarding_completed: false,
        },
        { onConflict: 'id' }
      );

      const built = await buildAppSessionForUser(
        data.user.id,
        cleanEmail,
        { full_name: cleanName }
      );
      setSession(built);
      return { ok: true, session: built };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Erro ao criar conta.',
      };
    }
  };

  const switchRole = async (role: AppUserRole) => {
    if (!session) return;
    const next: AppSession = {
      ...session,
      role,
      roles: Array.from(new Set([...(session.roles || []), role])),
    };
    setSession(next);
    saveStoredSession(next);

    try {
      await supabase
        .from('profiles')
        .update({
          active_role_view: role,
          roles: next.roles,
        })
        .eq('id', session.userId);
    } catch {
      // ignora falha de rede
    }
  };

  const updateSessionIdentity = (updates: Partial<AppSession>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      saveStoredSession(updated);
      return updated;
    });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignora erro
    }
    clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        loginWithEmail,
        signUpWithEmail,
        switchRole,
        updateSessionIdentity,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
