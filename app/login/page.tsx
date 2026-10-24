'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-context';
import { RefineFrame } from '@/components/react-bits/refine-frame';
import { StatusMark } from '@/components/react-bits/status-mark';
import { ClickSpark } from '@/components/react-bits/click-spark';
import { SpringCheck } from '@/components/react-bits/spring-check';
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
  Trophy,
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
  const [rememberMe, setRememberMe] = useState(true);

  // Estados de Login
  const [email, setEmail] = useState('capitao@draftclub.pro');
  const [password, setPassword] = useState('123456');

  // Estados de Cadastro Real
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [primaryPosition, setPrimaryPosition] = useState('MEI');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        'Preencha seu Nome Real, Nome do Personagem no EA FC 26, e-mail e senha.'
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
    } else {
      setSuccessMsg('Conta criada com sucesso! Faça login abaixo para entrar.');
      setMode('login');
      setEmail(regEmail);
      setPassword(regPassword);
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
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 pb-24 overflow-x-hidden selection:bg-[#00E599] selection:text-zinc-950">
      <div className="max-w-md w-full space-y-6">
        {/* Topo / Header da Autenticação */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-[#00E599] flex items-center justify-center p-2 text-zinc-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="font-display font-black text-2xl text-white tracking-tight">
              DRAFTCLUB <span className="text-[#00E599]">PRO</span>
            </span>
          </Link>

          <div className="flex items-center justify-center gap-2">
            <StatusMark status="online" label="EA FC 26" pulse />
            <span className="text-xs font-mono text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-semibold">Conta Única Multi-Perfil</span>
          </div>

          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Alterne entre Atleta, Capitão de Time e Administrador da Liga sem precisar deslogar.
          </p>
        </div>

        {/* Seletor Entrar vs Criar Conta */}
        <div className="p-1 rounded-2xl bg-[#14171f] border border-white/10 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              mode === 'login'
                ? 'bg-[#00E599] text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
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
              'py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              mode === 'register'
                ? 'bg-[#00E599] text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Nova Conta</span>
          </button>
        </div>

        {redirectPath && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Autentique-se para continuar para <strong>{redirectPath}</strong>.
            </span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 1: LOGIN                                                      */}
        {/* ================================================================= */}
        {mode === 'login' && (
          <div className="space-y-4">
            {/* Quick Demo Switchers */}
            <div className="rounded-3xl bg-[#14171f] border border-white/10 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500">
                  Acesso Rápido de Testes (1 Toque)
                </span>
                <StatusMark status="success" label="Demo Ativo" pulse={false} />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickCredentialClick('capitao@draftclub.pro', 'captain')}
                  className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[#00E599] flex items-center justify-center font-black text-xs shrink-0">
                      FDP
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate group-hover:text-emerald-400 transition-colors">
                        Capitão • Furia del Plata (JEFHE)
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block truncate">
                        capitao@draftclub.pro
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#00E599] group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickCredentialClick('atleta@draftclub.pro', 'player')}
                  className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate group-hover:text-cyan-400 transition-colors">
                        Atleta Pro Clubs • JEFHE #10
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block truncate">
                        atleta@draftclub.pro
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickCredentialClick('admin@draftclub.pro', 'admin')}
                  className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate group-hover:text-amber-400 transition-colors">
                        Administrador da Liga • LPF 5x5
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block truncate">
                        admin@draftclub.pro
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              </div>
            </div>

            {/* Formulário Manual */}
            <RefineFrame badge="SUPABASE AUTH">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <span className="text-xs font-bold text-white block">
                  Ou entre com seu e-mail registrado:
                </span>

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0c0e12] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E599] transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0c0e12] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E599] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <SpringCheck
                    checked={rememberMe}
                    onChange={setRememberMe}
                    label="Lembrar acesso"
                  />
                  <span className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                    Esqueceu a senha?
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <ClickSpark sparkColor="#00E599">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#00E599] hover:bg-[#00c985] text-zinc-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{loading ? 'Validando Credenciais...' : 'Entrar na Plataforma'}</span>
                  </button>
                </ClickSpark>
              </form>
            </RefineFrame>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 2: CADASTRO COM IDENTIDADE DUPLA                              */}
        {/* ================================================================= */}
        {mode === 'register' && (
          <RefineFrame badge="NOVO ATLETA">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h2 className="text-sm font-black text-white">
                  Criar Conta de Atleta / Capitão
                </h2>
                <p className="text-xs text-zinc-400">
                  Seu Nome de Personagem será exibido nas súmulas, rankings e cartas FC 26.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1">
                    Nome do Personagem no EA FC 26
                  </label>
                  <div className="relative">
                    <Gamepad2 className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      placeholder="Ex: JEFHE, HAALANDINHO, RONALDINHO..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0c0e12] border border-white/15 text-xs text-white uppercase font-bold focus:outline-none focus:border-[#00E599]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                    Seu Nome Real
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Jefherson Silva"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0c0e12] border border-white/15 text-xs text-white focus:outline-none focus:border-[#00E599]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                    Posição Principal
                  </label>
                  <select
                    value={primaryPosition}
                    onChange={(e) => setPrimaryPosition(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-2xl bg-[#0c0e12] border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-[#00E599]"
                  >
                    <option value="ST">ST — Centroavante</option>
                    <option value="LW">LW — Ponta Esquerda</option>
                    <option value="RW">RW — Ponta Direita</option>
                    <option value="MEI">MEI / CAM — Meia Armador</option>
                    <option value="CM">CM — Meio-Campista Central</option>
                    <option value="VOL">VOL / CDM — Volante</option>
                    <option value="ZAG">ZAG / CB — Zagueiro</option>
                    <option value="LE">LE / LB — Lateral Esquerdo</option>
                    <option value="LD">LD / RB — Lateral Direito</option>
                    <option value="GL">GL / GK — Goleiro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0c0e12] border border-white/15 text-xs text-white focus:outline-none focus:border-[#00E599]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0c0e12] border border-white/15 text-xs text-white focus:outline-none focus:border-[#00E599]"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <ClickSpark sparkColor="#00E599">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-[#00E599] hover:bg-[#00c985] text-zinc-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loading ? 'Cadastrando Perfil...' : 'Criar Conta Oficial'}</span>
                </button>
              </ClickSpark>
            </form>
          </RefineFrame>
        )}

        {/* Sessão Ativa */}
        {session && (
          <div className="rounded-3xl bg-[#14171f] p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-[#00E599] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {session.characterName || session.name} ({session.fullName || 'Titular'})
                </p>
                <p className="text-[10px] text-emerald-400 font-mono truncate">
                  {session.email} • Papel: {session.role.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={
                  session.role === 'admin'
                    ? '/admin'
                    : session.role === 'player'
                    ? '/player'
                    : '/captain'
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#00E599] text-zinc-950 text-xs font-black shadow-md"
              >
                Abrir Painel
              </Link>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
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
        <div className="min-h-screen bg-[#0c0e12] text-zinc-400 flex flex-col items-center justify-center gap-2 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#00E599]" />
          <span>Carregando autenticação...</span>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
