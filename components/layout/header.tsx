'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  Check,
  Crown,
  Shield,
  User,
  Sun,
  Moon,
  Sparkles,
  Wallet,
  Calculator,
  X,
  LogOut,
  CheckCircle2,
  Images,
  FileCheck2,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const { session, switchProfileRole, logout } = useAuth();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState('Liga 5x5 LPF');
  const [isDark, setIsDark] = useState(false);

  // Pontuação da Súmula (Idêntica à print do Jogueiros)
  const [metricsScore, setMetricsScore] = useState({
    gol: 8,
    assistencia: 5,
    golSofrido: -1,
    defesaDificil: 1,
    cartaoAmarelo: -1,
    cartaoVermelho: -3,
    destaque: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('draftclub_theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof window !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('draftclub_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('draftclub_theme', 'light');
      }
    }
  };

  const handleSelectRole = (role: 'captain' | 'player' | 'admin') => {
    switchProfileRole(role);
    setAccountMenuOpen(false);
    setSettingsOpen(false);
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'player') {
      router.push('/player');
    } else {
      router.push('/captain');
    }
  };

  const adjustMetric = (key: keyof typeof metricsScore, delta: number) => {
    setMetricsScore((prev) => ({
      ...prev,
      [key]: prev[key] + delta,
    }));
  };

  const currentRoleLabel =
    session?.role === 'admin'
      ? 'Admin LPF 5x5'
      : session?.role === 'player'
      ? 'Jefhe (Atleta)'
      : 'Furia del Plata';

  const currentInitials =
    session?.role === 'admin' ? 'LPF' : session?.role === 'player' ? 'JF' : 'FP';

  const notifications = [
    {
      id: 'n1',
      title: 'Súmula aguardando sua aprovação',
      desc: 'Furia del Plata 3 x 1 Boca Juniors FC • Dupla Validação pendente.',
      time: 'Há 5 min',
      href: '/matches',
      icon: FileCheck2,
      badge: 'Urgente',
    },
    {
      id: 'n2',
      title: 'Novos Banners @atleticodapalhoca liberados!',
      desc: 'Gere o banner pós-jogo 4:5 ou Story 9:16 com 1 toque usando a foto da partida.',
      time: 'Há 18 min',
      href: '/studio',
      icon: Images,
      badge: 'Novo',
    },
    {
      id: 'n3',
      title: 'Tinder de Horários: Match de agenda!',
      desc: '5 titulares confirmaram presença Terça-feira às 22:30h.',
      time: 'Há 1h',
      href: '/matches',
      icon: Calendar,
      badge: 'Agenda',
    },
    {
      id: 'n4',
      title: 'Convite de Elenco (Código 192Y4I)',
      desc: 'Jefhe aceitou o convite e entrou no elenco do Furia del Plata.',
      time: 'Ontem',
      href: '/captain',
      icon: UserPlus,
      badge: 'Time',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F5F6FA]/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-3xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* 1. CANTO ESQUERDO: Seletor Rápido de Conta/Perfil ("Mudar de conta") */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen(!accountMenuOpen);
                setSeasonMenuOpen(false);
              }}
              className="h-10 pl-1.5 pr-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-2 hover:border-[#7C5CFC] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#7C5CFC] text-white font-extrabold text-[11px] flex items-center justify-center shadow-sm">
                {currentInitials}
              </div>
              <span className="text-xs font-extrabold text-[#18181B] dark:text-white truncate max-w-[95px] sm:max-w-[140px]">
                {currentRoleLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7C5CFC]" />
            </button>

            {accountMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl p-3 space-y-2 z-50">
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#71717A]">
                    Mudar de Conta (1 Clique)
                  </span>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectRole('captain')}
                  className={cn(
                    'w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all',
                    session?.role === 'captain'
                      ? 'bg-[#7C5CFC]/10 border border-[#7C5CFC]/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center font-black text-xs">
                      FP
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#18181B] dark:text-white">
                        Furia del Plata
                      </p>
                      <p className="text-[10px] text-[#7C5CFC] font-semibold">
                        Dono do Time / Capitão
                      </p>
                    </div>
                  </div>
                  {session?.role === 'captain' && (
                    <Check className="w-4 h-4 text-[#7C5CFC]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('player')}
                  className={cn(
                    'w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all',
                    session?.role === 'player'
                      ? 'bg-[#7C5CFC]/10 border border-[#7C5CFC]/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#38C958] text-white flex items-center justify-center font-black text-xs">
                      JF
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#18181B] dark:text-white">
                        Jefhe
                      </p>
                      <p className="text-[10px] text-[#38C958] font-semibold">
                        Visão Jogador (Atleta)
                      </p>
                    </div>
                  </div>
                  {session?.role === 'player' && (
                    <Check className="w-4 h-4 text-[#7C5CFC]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className={cn(
                    'w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all',
                    session?.role === 'admin'
                      ? 'bg-[#7C5CFC]/10 border border-[#7C5CFC]/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#18181B] dark:text-white">
                        Admin da Liga (LPF 5x5)
                      </p>
                      <p className="text-[10px] text-amber-600 font-semibold">
                        Organizador & ERP Financeiro
                      </p>
                    </div>
                  </div>
                  {session?.role === 'admin' && (
                    <Check className="w-4 h-4 text-[#7C5CFC]" />
                  )}
                </button>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-1">
                  <Link
                    href="/login"
                    onClick={() => setAccountMenuOpen(false)}
                    className="text-[11px] font-bold text-[#7C5CFC] hover:underline py-1"
                  >
                    Tela de Login Completa →
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      logout();
                    }}
                    className="text-[11px] font-bold text-rose-500 flex items-center gap-1 py-1"
                  >
                    <LogOut className="w-3 h-3" /> Sair
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. CENTRO: Seletor de Temporada / Liga */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSeasonMenuOpen(!seasonMenuOpen);
                setAccountMenuOpen(false);
              }}
              className="h-10 px-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-1.5 hover:border-[#7C5CFC] transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-[#18181B] dark:text-white truncate max-w-[125px] sm:max-w-[180px]">
                <span className="hidden sm:inline text-[#71717A] font-medium">Temporada: </span>
                {selectedSeason}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
            </button>

            {seasonMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-60 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl p-2.5 space-y-1 z-50">
                {[
                  'Liga 5x5 LPF',
                  'Temporada 2026 • 11v11',
                  'Copa Relâmpago Pro Clubs',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSeason(s);
                      setSeasonMenuOpen(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between text-left transition-all',
                      selectedSeason === s
                        ? 'bg-[#7C5CFC] text-white'
                        : 'text-[#18181B] dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    <span>📅 {s}</span>
                    {selectedSeason === s && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. CANTO DIREITO: Sino de Notificações + Menu/Configurações */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#18181B] dark:text-white hover:border-[#7C5CFC] transition-all"
              title="Suas Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#7C5CFC]" />
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#18181B] dark:text-white hover:border-[#7C5CFC] transition-all"
              title="Configurações e Métricas"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MODAL: SUAS NOTIFICAÇÕES (ESTILO JOGUEIROS) */}
      {/* ===================================================================== */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Suas Notificações
                </h2>
                <p className="text-xs text-[#71717A]">
                  Aprovações de súmula, novos banners e convites do time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setNotificationsOpen(false)}
                    className="block p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 hover:bg-[#7C5CFC]/10 border border-zinc-100 dark:border-zinc-800 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#7C5CFC]/15 text-[#7C5CFC] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                            {n.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C5CFC] text-white shrink-0">
                            {n.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-[#7C5CFC] font-semibold mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setNotificationsOpen(false)}
              className="w-full py-3 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-xs shadow-md"
            >
              Marcar todas como lidas
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIGURAÇÕES DO TIME, TEMA & PONTUAÇÃO DA SÚMULA */}
      {/* ===================================================================== */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#F5F6FA] dark:bg-zinc-950 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Configurações
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card PRO Team (Ativado) igual à print */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E5] text-white shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">PRO Team</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#38C958] text-white text-[10px] font-extrabold">
                      Ativado
                    </span>
                  </div>
                  <p className="text-xs text-white/85">
                    Banners ilimitados, Súmula por IA Vision e Caixa do Time liberados.
                  </p>
                </div>
              </div>
            </div>

            {/* Card Mudar de Conta */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 space-y-2.5">
              <span className="text-xs font-extrabold text-[#71717A] uppercase tracking-wider block">
                Mudar de Conta
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRole('captain')}
                  className={cn(
                    'p-2.5 rounded-2xl border text-center transition-all',
                    session?.role === 'captain'
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/10 text-[#7C5CFC] font-extrabold'
                      : 'border-zinc-100 dark:border-zinc-800 text-xs font-semibold'
                  )}
                >
                  <Shield className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Dono Time</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('player')}
                  className={cn(
                    'p-2.5 rounded-2xl border text-center transition-all',
                    session?.role === 'player'
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/10 text-[#7C5CFC] font-extrabold'
                      : 'border-zinc-100 dark:border-zinc-800 text-xs font-semibold'
                  )}
                >
                  <User className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Jogador</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className={cn(
                    'p-2.5 rounded-2xl border text-center transition-all',
                    session?.role === 'admin'
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/10 text-[#7C5CFC] font-extrabold'
                      : 'border-zinc-100 dark:border-zinc-800 text-xs font-semibold'
                  )}
                >
                  <Crown className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Admin Liga</span>
                </button>
              </div>
            </div>

            {/* Opções de Menu */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-2 border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-[#7C5CFC]" />
                  ) : (
                    <Sun className="w-5 h-5 text-[#7C5CFC]" />
                  )}
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Aparência do Aplicativo
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      {isDark ? 'Dark Mode Pro ativado' : 'Light Mode Jogueiros (Padrão)'}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-[11px] font-bold">
                  Alternar
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  setMetricsModalOpen(true);
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-[#7C5CFC]" />
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Pontuação de métricas
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      Gol ({metricsScore.gol}), Assistência ({metricsScore.assistencia}), Cartões...
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7C5CFC]">Editar &gt;</span>
              </button>

              <Link
                href="/captain"
                onClick={() => setSettingsOpen(false)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[#7C5CFC]" />
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Financeiro & Caixa do Time
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      Saldo atual: R$ 560,00 • Mensalidades e Inscrições
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7C5CFC]">Abrir &gt;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: PONTUAÇÃO DA SÚMULA (GOL 8, ASSIST 5, ETC.) */}
      {/* ===================================================================== */}
      {metricsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Pontuação da súmula
                </h2>
                <p className="text-xs text-[#71717A]">
                  Personalize quanto vale cada ação para o ranking de destaques do time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMetricsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { key: 'gol', label: '⚽ Gol', val: metricsScore.gol },
                { key: 'assistencia', label: '👟 Assistência', val: metricsScore.assistencia },
                { key: 'golSofrido', label: '🥅 Gol sofrido', val: metricsScore.golSofrido },
                { key: 'defesaDificil', label: '🧤 Defesa difícil', val: metricsScore.defesaDificil },
                { key: 'cartaoAmarelo', label: '🟨 Cartão amarelo', val: metricsScore.cartaoAmarelo },
                { key: 'cartaoVermelho', label: '🟥 Cartão vermelho', val: metricsScore.cartaoVermelho },
                { key: 'destaque', label: '⭐ Destaque (Craque)', val: metricsScore.destaque },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-between"
                >
                  <span className="text-xs font-extrabold text-[#18181B] dark:text-white">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjustMetric(item.key as any, -1)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-black text-sm text-[#7C5CFC] flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-extrabold text-sm text-[#18181B] dark:text-white">
                      {item.val}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustMetric(item.key as any, 1)}
                      className="w-8 h-8 rounded-full bg-[#7C5CFC] text-white font-black text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMetricsModalOpen(false)}
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Pontuação da Súmula
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { Header };
