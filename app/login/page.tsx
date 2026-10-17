'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';
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
  UserPlus,
  Gamepad2,
} from 'lucide-react';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const {
    session,
    loginAsDemo,
    loginWithSupabase,
    registerWithSupabase,
    logout,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Estados de Login
  const [email, setEmail] = useState('capitao@draftclub.pro');
  const [password, setPassword] = useState('123456');

  // Estados de Cadastro Real (Identidade Dupla)
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [primaryPosition, setPrimaryPosition] = useState('ST');

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !fullName || !characterName) {
      setErrorMsg(
        'Preencha Seu Nome Real, o Nome do Seu Personagem no EA FC 26, e-mail e senha.'
      );
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'account_registered',
          recipients: [regEmail],
          customMessage: `Olá ${fullName}! Sua conta única Multi-Perfil com o personagem "${characterName.toUpperCase()}" (${primaryPosition}) foi ativada no DraftClub Pro Clubs!`,
        }),
      });
    } catch {
      // ignora erro de rede
    }

    const res = await registerWithSupabase({
      email: regEmail,
      password: regPassword,
      fullName,
      characterName: characterName.toUpperCase(),
      primaryPosition,
    });
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
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-[#18181B] dark:text-zinc-100 flex flex-col items-center justify-center p-3 sm:p-4 pb-28 overflow-x-hidden">
      <div className="max-w-md w-full space-y-4">
        {/* Card Principal */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-[#7C5CFC]/10 border border-[#7C5CFC]/20 flex items-center justify-center mx-auto text-[#7C5CFC]">
            <Shield className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-[10px] font-extrabold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Conta Única Multi-Perfil • EA FC 26
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#18181B] dark:text-white">
            DraftClub Pro Clubs
          </h1>
          <p className="text-xs text-[#71717A] dark:text-zinc-400">
            Acumule os papéis de Atleta, Capitão e Admin na mesma conta e alterne no topo sem deslogar.
          </p>
        </div>

        {/* Seletor Entrar vs Criar Minha Conta */}
        <div className="p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={cn(
              'py-2.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              mode === 'login'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>Entrar na Conta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={cn(
              'py-2.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              mode === 'register'
                ? 'bg-[#38C958] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Minha Conta</span>
          </button>
        </div>

        {redirectPath && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Autentique-se abaixo para acessar <strong>{redirectPath}</strong>.
            </span>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 1: ENTRAR NA CONTA                                            */}
        {/* ================================================================= */}
        {mode === 'login' && (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  Acesso Instantâneo (1 Toque)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#38C958]/15 text-[#2fb34d]">
                  Multi-Perfil Ativo
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickCredentialClick('capitao@draftclub.pro', 'captain')
                  }
                  className="w-full p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 hover:bg-[#7C5CFC]/10 border border-zinc-200/80 dark:border-zinc-700 hover:border-[#7C5CFC] transition-all flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                      FP
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold text-[#18181B] dark:text-white block truncate">
                        Capitão • Furia del Plata (JEFHE)
                      </span>
                      <span className="text-[10px] text-[#71717A] font-mono block truncate">
                        capitao@draftclub.pro • 123456
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#7C5CFC] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickCredentialClick('atleta@draftclub.pro', 'player')
                  }
                  className="w-full p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 hover:bg-[#7C5CFC]/10 border border-zinc-200/80 dark:border-zinc-700 hover:border-[#7C5CFC] transition-all flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#38C958] text-white flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold text-[#18181B] dark:text-white block truncate">
                        Atleta Pro Clubs • JEFHE #10
                      </span>
                      <span className="text-[10px] text-[#71717A] font-mono block truncate">
                        atleta@draftclub.pro • 123456
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#7C5CFC] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickCredentialClick('admin@draftclub.pro', 'admin')
                  }
                  className="w-full p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 hover:bg-[#7C5CFC]/10 border border-zinc-200/80 dark:border-zinc-700 hover:border-[#7C5CFC] transition-all flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold text-[#18181B] dark:text-white block truncate">
                        Organizador / Admin da Liga (LPF 5x5)
                      </span>
                      <span className="text-[10px] text-[#71717A] font-mono block truncate">
                        admin@draftclub.pro • 123456
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#7C5CFC] shrink-0" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleManualSubmit}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5"
            >
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                Entrar com Seu E-mail e Senha
              </h2>

              <div className="space-y-2.5">
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                  />
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
                className="w-full py-3 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? 'Entrando...' : 'Entrar na Plataforma'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {/* ================================================================= */}
        {/* ABA 2: CRIAR MINHA CONTA DE ATLETA / CAPITÃO (IDENTIDADE DUPLA)   */}
        {/* ================================================================= */}
        {mode === 'register' && (
          <form
            onSubmit={handleRegisterSubmit}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#38C958] block">
                Cadastro Oficial no Supabase Auth
              </span>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Criar Minha Conta de Atleta / Capitão
              </h2>
              <p className="text-xs text-zinc-500">
                Seu Nome do Personagem será exibido nas súmulas, artilharia, Sala de Draft e banners 4:5.
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7C5CFC] block mb-1">
                  Nome do Seu Personagem no EA FC 26 (Destaque nas Tabelas/Artes)
                </label>
                <div className="relative">
                  <Gamepad2 className="w-4 h-4 text-[#7C5CFC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Ex: JEFHE, HAALANDINHO, RONALDINHO..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Seu Nome Real (Uso Administrativo e Rateio de Inscrição)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Jefherson Silva"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Posição Principal em Campo
                </label>
                <select
                  value={primaryPosition}
                  onChange={(e) => setPrimaryPosition(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                >
                  <option value="ST">ST — Centroavante</option>
                  <option value="LW">LW — Ponta Esquerda</option>
                  <option value="RW">RW — Ponta Direita</option>
                  <option value="CAM">CAM — Meia Armador</option>
                  <option value="CM">CM — Meio-Campista Central</option>
                  <option value="CDM">CDM — Volante</option>
                  <option value="CB">CB — Zagueiro</option>
                  <option value="LB">LB — Lateral Esquerdo</option>
                  <option value="RB">RB — Lateral Direito</option>
                  <option value="GK">GK — Goleiro</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Seu E-mail
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Crie uma Senha
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                />
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
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {loading
                ? 'Criando Conta & Perfil...'
                : 'Criar Minha Conta e Configurar Build'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Sessão Ativa */}
        {session && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-[#38C958] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                  {session.characterName || session.name} ({session.fullName || 'Titular'})
                </p>
                <p className="text-[10px] text-[#7C5CFC] font-semibold truncate">
                  {session.email} • Visão ativa: {session.role.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={
                  session.role === 'admin'
                    ? '/admin'
                    : session.role === 'player'
                    ? '/player'
                    : '/captain'
                }
                className="px-3 py-1.5 rounded-full bg-[#7C5CFC] text-white text-xs font-bold"
              >
                Abrir
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
          <span>Carregando acesso...</span>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
