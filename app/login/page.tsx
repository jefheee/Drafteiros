'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-context';
import {
  Shield,
  Crown,
  User,
  AlertCircle,
  ArrowRight,
  LogOut,
  Loader2,
  CheckCircle2,
  Sparkles,
  Lock,
  Mail,
} from 'lucide-react';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const { session, loginAsDemo, loginWithSupabase, logout } = useAuth();

  const [email, setEmail] = useState('capitao@draftclub.pro');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Preencha seu e-mail e senha para continuar.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const res = await loginWithSupabase(email, password, redirectPath || undefined);
    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleQuickCredentialClick = async (
    targetEmail: string,
    demoKey: 'captain' | 'admin' | 'player'
  ) => {
    setEmail(targetEmail);
    setPassword('123456');
    loginAsDemo(demoKey, redirectPath || undefined);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-[#18181B] dark:text-zinc-100 flex flex-col items-center justify-center p-4 pb-28">
      <div className="max-w-md w-full space-y-5">
        {/* Hero Card Estilo Jogueiros ("Você também tem um time?") */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#7C5CFC]/10 border-2 border-[#7C5CFC]/20 flex items-center justify-center mx-auto text-[#7C5CFC]">
            <Shield className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-[11px] font-extrabold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            EA FC 26 • Liga 5x5 & 11v11
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#18181B] dark:text-white">
            Você também tem um time?
          </h1>
          <p className="text-xs text-[#71717A] dark:text-zinc-400 leading-relaxed">
            Gerencie seu clube no Pro Clubs, escale no 5x5 ou 11v11, aprove súmulas por foto e crie banners automáticos em segundos.
          </p>
        </div>

        {/* Aviso de Redirecionamento */}
        {redirectPath && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Escolha uma conta abaixo para acessar <strong>{redirectPath}</strong> imediatamente.
            </span>
          </div>
        )}

        {/* Acesso Rápido em 1 Toque (Credenciais Oficiais de Teste) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#18181B] dark:text-white">
              Entrar com 1 Toque (Contas de Teste)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#2fb34d]">
              Instantâneo
            </span>
          </div>
          <p className="text-xs text-[#71717A] dark:text-zinc-400">
            Toque em qualquer perfil para entrar direto ou use os dados no formulário abaixo:
          </p>

          <div className="space-y-2.5 pt-1">
            {/* 1. Dono de Time / Capitão */}
            <button
              type="button"
              onClick={() => handleQuickCredentialClick('capitao@draftclub.pro', 'captain')}
              className="w-full p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 hover:bg-[#7C5CFC]/10 border border-zinc-200/80 dark:border-zinc-700 hover:border-[#7C5CFC] transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
                  FP
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                      Dono de Time / Capitão
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC]">
                      Furia del Plata
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] dark:text-zinc-400 font-mono mt-0.5 truncate">
                    capitao@draftclub.pro • Senha: 123456
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#7C5CFC] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 2. Organizador / Admin da Liga */}
            <button
              type="button"
              onClick={() => handleQuickCredentialClick('admin@draftclub.pro', 'admin')}
              className="w-full p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 hover:bg-[#7C5CFC]/10 border border-zinc-200/80 dark:border-zinc-700 hover:border-[#7C5CFC] transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                      Organizador / Admin da Liga
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      LPF 5x5
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] dark:text-zinc-400 font-mono mt-0.5 truncate">
                    admin@draftclub.pro • Senha: 123456
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#7C5CFC] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 3. Jogador (Atleta Pro Clubs) */}
            <button
              type="button"
              onClick={() => handleQuickCredentialClick('atleta@draftclub.pro', 'player')}
              className="w-full p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 hover:bg-[#7C5CFC]/10 border border-zinc-200/80 dark:border-zinc-700 hover:border-[#7C5CFC] transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#38C958] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                      Jogador (Atleta Pro Clubs)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#38C958]/15 text-[#2fb34d]">
                      Jefhe #10
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] dark:text-zinc-400 font-mono mt-0.5 truncate">
                    atleta@draftclub.pro • Senha: 123456
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#7C5CFC] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Formulário de Login por E-mail e Senha */}
        <form
          onSubmit={handleManualSubmit}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4"
        >
          <h2 className="text-sm font-extrabold text-[#18181B] dark:text-white">
            Entrar com E-mail e Senha
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#71717A] dark:text-zinc-400 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="capitao@draftclub.pro"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-[#18181B] dark:text-white focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#71717A] dark:text-zinc-400 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-[#18181B] dark:text-white focus:outline-none focus:border-[#7C5CFC]"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? 'Entrando...' : 'Prosseguir'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Sessão Atual */}
        {session && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#38C958]" />
              <div>
                <p className="text-xs font-extrabold text-[#18181B] dark:text-white">
                  Conectado como {session.name}
                </p>
                <p className="text-[11px] text-[#7C5CFC] font-semibold">
                  {session.email} ({session.role.toUpperCase()})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={
                  session.role === 'admin'
                    ? '/admin'
                    : session.role === 'player'
                    ? '/player'
                    : '/captain'
                }
                className="px-3.5 py-2 rounded-full bg-[#7C5CFC] text-white text-xs font-bold"
              >
                Abrir Perfil
              </Link>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-500"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F6FA] text-[#71717A] flex flex-col items-center justify-center gap-2 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#7C5CFC]" />
          <span>Carregando acesso Jogueiros PRO...</span>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
