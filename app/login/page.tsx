'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-context';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loginWithEmail, signUpWithEmail } = useAuth();

  const initialMode =
    searchParams?.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams?.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  useEffect(() => {
    if (session) {
      if (session.onboardingCompleted) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Preencha seu e-mail e sua senha.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const res = await signUpWithEmail(email, password, fullName);
        if (!res.ok) {
          setErrorMsg(res.error || 'Erro ao criar sua conta.');
          return;
        }
        router.push('/onboarding');
      } else {
        const res = await loginWithEmail(email, password);
        if (!res.ok) {
          setErrorMsg(res.error || 'E-mail ou senha inválidos.');
          return;
        }
        if (res.session?.onboardingCompleted) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0D0D0F] text-[#F4F4F5] flex flex-col justify-between px-4 py-6 relative overflow-hidden">
      {/* Gradiente estático sutil no topo */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-700/20 via-[#0D0D0F]/80 to-[#0D0D0F]"
        aria-hidden="true"
      />

      {/* Topo Minimalista */}
      <header className="relative z-10 max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>

        <div className="flex items-center gap-2">
          <Image
            src="/branding/logo-transparent.png"
            alt="Drafteiros"
            width={28}
            height={28}
            className="rounded-lg object-contain"
            priority
          />
          <span className="font-display font-bold text-sm text-white">
            Drafteiros
          </span>
        </div>
      </header>

      {/* Card Central / Modal de Autenticação */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <div className="rounded-3xl bg-[#1A1A1E] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">
              {mode === 'signin' ? 'Entrar no Drafteiros' : 'Criar sua conta'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              {mode === 'signin'
                ? 'Acesse sua Carta Pro, seu clube e a agenda da liga.'
                : 'Cadastre-se para criar seu atleta ou registrar sua equipe.'}
            </p>
          </div>

          {/* Segmented Toggle: Entrar vs Criar Conta */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#141417] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={cn(
                'py-2.5 rounded-xl text-xs font-semibold transition-all',
                mode === 'signin'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={cn(
                'py-2.5 rounded-xl text-xs font-semibold transition-all',
                mode === 'signup'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              Criar Conta
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  Seu Nome ou Apelido
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Jefherson Silva"
                  className="w-full h-11 px-4 rounded-2xl bg-[#141417] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm text-white placeholder:text-zinc-600 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                E-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-11 px-4 rounded-2xl bg-[#141417] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm text-white placeholder:text-zinc-600 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full h-11 pl-4 pr-11 rounded-2xl bg-[#141417] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm text-white placeholder:text-zinc-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-60 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {mode === 'signin' ? 'Entrando...' : 'Criando conta...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'signin' ? 'Continuar' : 'Criar conta e configurar perfil'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="relative z-10 text-center text-[11px] text-zinc-500">
        Drafteiros • Plataforma Oficial de Campeonatos e Draft
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0F] text-white flex items-center justify-center text-xs text-zinc-400">
          Carregando...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
