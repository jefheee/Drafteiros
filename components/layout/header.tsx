'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Users,
  Home,
  Trophy,
  CircleDot,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { useLeagueStore } from '@/lib/data-store';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, switchProfileRole, logout } = useAuth();
  const { players, teams, tournament, tournaments, selectTournament } = useLeagueStore();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);

  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [metricsScore, setMetricsScore] = useState({
    gol: 8,
    assistencia: 5,
    golSofrido: -1,
    defesaDificil: 1,
    cartaoAmarelo: -1,
    cartaoVermelho: -3,
    destaque: 5,
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('draftclub_theme');
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      } else {
        document.documentElement.classList.add('dark');
        setIsDark(true);
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
    switchProfileRole(role, false);
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

  const characterName = session?.characterName || 'JEFHE';
  const fullName = session?.fullName || 'Jefherson';

  const activePlayer = useMemo(() => {
    return (
      players.find(
        (p) =>
          p.id === session?.playerId ||
          p.character_name?.toLowerCase() === characterName.toLowerCase() ||
          p.ea_Tag?.toLowerCase() === characterName.toLowerCase()
      ) || players[0]
    );
  }, [players, session?.playerId, characterName]);

  const activeTeam = useMemo(() => {
    return (
      teams.find(
        (t) =>
          t.id === session?.teamId ||
          t.name?.toLowerCase() === (session?.teamName || 'Furia del Plata').toLowerCase()
      ) || teams[0]
    );
  }, [teams, session?.teamId, session?.teamName]);

  const playerPhoto =
    activePlayer?.avatar_face_url ||
    session?.avatarUrl ||
    '/assets/templates/avatar-placeholder.jpg';

  const teamLogo =
    activeTeam?.logo_url ||
    '/assets/templates/crest-placeholder.png';

  const adminIcon = '/assets/awards/1st-place.png';

  const currentAvatarSrc =
    session?.role === 'player'
      ? playerPhoto
      : session?.role === 'captain'
      ? teamLogo
      : adminIcon;

  const currentRoleLabel =
    session?.role === 'admin'
      ? '👑 Visão Admin'
      : session?.role === 'player'
      ? `🏃 ${characterName}`
      : `🛡️ ${activeTeam?.name || 'Furia del Plata'}`;

  const currentInitials =
    session?.role === 'admin'
      ? 'LPF'
      : session?.role === 'player'
      ? characterName.slice(0, 2).toUpperCase()
      : 'FP';

  const workspaceHref =
    session?.role === 'admin'
      ? '/admin'
      : session?.role === 'player'
      ? '/player'
      : '/captain';

  const desktopPillars = [
    {
      id: 'home',
      label: 'Início',
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
    {
      id: 'rankings',
      label: 'Tabela & Rankings',
      href: '/rankings',
      icon: Trophy,
      active: pathname.startsWith('/rankings') || pathname.startsWith('/tournaments'),
    },
    {
      id: 'matches',
      label: 'Jogos & Súmula IA',
      href: '/matches',
      icon: CircleDot,
      active: pathname.startsWith('/matches'),
    },
    {
      id: 'studio',
      label: 'Estúdio & Packs',
      href: '/studio',
      icon: Images,
      active: pathname.startsWith('/studio'),
    },
    {
      id: 'workspace',
      label: 'Meu Espaço',
      href: workspaceHref,
      icon: User,
      active:
        pathname.startsWith('/player') ||
        pathname.startsWith('/captain') ||
        pathname.startsWith('/draft-board') ||
        pathname.startsWith('/admin'),
    },
  ];

  const notifications = [
    {
      id: 'n1',
      title: 'Pós-Jogo Oficial: Furia del Plata 2 - 7 La Catimba',
      desc: 'Arte 4:5 full-bleed em estádio noturno pronta no Estúdio & Packs.',
      time: 'Agora',
      href: '/studio',
      icon: Images,
      badge: 'Banner 4:5',
    },
    {
      id: 'n2',
      title: 'Tabela & Chaveamento G4 Atualizados',
      desc: 'HAALANDINHO (5 gols) assumiu a artilharia isolada da LPF 5x5.',
      time: 'Há 10 min',
      href: '/rankings',
      icon: Trophy,
      badge: 'Rankings',
    },
    {
      id: 'n3',
      title: 'Carta FC 26 Ultimate Team Evoluída',
      desc: 'Seu OVR de carreira subiu com os novos bônus históricos!',
      time: 'Há 25 min',
      href: '/player',
      icon: Sparkles,
      badge: 'Carta FC 26',
    },
    {
      id: 'n4',
      title: 'Sala de Draft Oficial (+40 Atletas)',
      desc: 'Sorteio de ordem por IA (Snake Draft) liberado para os capitães.',
      time: 'Hoje',
      href: '/draft-board',
      icon: UserPlus,
      badge: 'Draft',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F5F6FA]/90 dark:bg-[#0c0e12]/90 backdrop-blur-xl border-b border-zinc-200/70 dark:border-white/[0.07] transition-colors">
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 overflow-hidden">
          {/* 1. CANTO ESQUERDO: Brand + Seletor Multi-Perfil na Mesma Conta */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 pr-2 border-r border-zinc-200 dark:border-white/10"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#5b3fd9] flex items-center justify-center shadow-md shadow-[#7C5CFC]/25">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="leading-none">
                <span className="font-display font-black text-sm tracking-tight text-zinc-900 dark:text-white block">
                  DRAFT<span className="text-[#7C5CFC]">CLUB</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#38C958]">
                  PRO EDITION
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen(!accountMenuOpen);
                setSeasonMenuOpen(false);
              }}
              className="max-w-[160px] sm:max-w-[220px] h-9 pl-1.5 pr-2.5 rounded-full bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-1.5 hover:border-[#7C5CFC] transition-all shrink-0 overflow-hidden"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-100 dark:bg-[#1c2029] flex items-center justify-center shrink-0">
                {mounted ? (
                  <img
                    src={currentAvatarSrc}
                    alt={currentRoleLabel}
                    className={cn(
                      'w-full h-full',
                      session?.role === 'player' ? 'object-cover' : 'object-contain drop-shadow-sm p-0.5'
                    )}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (session?.role === 'captain') {
                        target.src = '/assets/templates/crest-placeholder.png';
                      } else if (session?.role === 'player') {
                        target.src = '/assets/templates/avatar-placeholder.jpg';
                      } else {
                        target.src = '/assets/awards/1st-place.png';
                      }
                    }}
                  />
                ) : (
                  <span className="text-[9px] font-black text-[#7C5CFC]">{currentInitials}</span>
                )}
              </div>
              <span
                className="text-[11px] font-extrabold text-[#18181B] dark:text-white truncate"
                suppressHydrationWarning
              >
                {mounted ? currentRoleLabel : '🛡️ Furia del Plata'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#7C5CFC] shrink-0" />
            </button>

            {/* Botão rápido direto para /admin quando estiver em Visão Admin */}
            {mounted && session?.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] font-extrabold hover:bg-amber-500/25 transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                Painel Admin
              </Link>
            )}
          </div>

          {/* 2. CENTRO DESKTOP: 5 Pilares de Navegação (Stitch Topbar) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/80 dark:bg-[#161920]/90 p-1 rounded-full border border-zinc-200/70 dark:border-white/[0.07]">
            {desktopPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Link
                  key={pillar.id}
                  href={pillar.href}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all',
                    pillar.active
                      ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-sm shadow-[#7C5CFC]/30'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pillar.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. CENTRO MOBILE / DIREITA: Seletor de Campeonato Ativo/Passado + Ações */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSeasonMenuOpen(!seasonMenuOpen);
                setAccountMenuOpen(false);
              }}
              className="max-w-[125px] sm:max-w-[205px] h-9 px-2.5 rounded-full bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-1.5 hover:border-[#7C5CFC] transition-all overflow-hidden"
              title="Alternar Campeonato Ativo ou Histórico"
            >
              <Calendar className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
              <span className="truncate text-[11px] font-extrabold text-[#18181B] dark:text-white">
                {tournament?.season_label || tournament?.name || 'LPF 5x5'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:flex w-9 h-9 shrink-0 rounded-full bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs items-center justify-center text-[#18181B] dark:text-white hover:border-[#7C5CFC] transition-all"
              title={isDark ? 'Mudar para Light Mode (Pitch Clean)' : 'Mudar para Dark Mode (Tactical Obsidian)'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#7C5CFC]" />}
            </button>

            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative w-9 h-9 shrink-0 rounded-full bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs flex items-center justify-center text-[#18181B] dark:text-white hover:border-[#7C5CFC] transition-all"
              title="Suas Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#38C958]" />
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 shrink-0 rounded-full bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs flex items-center justify-center text-[#18181B] dark:text-white hover:border-[#7C5CFC] transition-all"
              title="Configurações e Perfis"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* DROPDOWN MULTI-PERFIL (CONTA ÚNICA - REDIRECIONA IMEDIATAMENTE) */}
      {accountMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setAccountMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-14 ml-3 sm:ml-6 w-[calc(100vw-24px)] max-w-xs rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200 dark:border-white/10 shadow-2xl p-3.5 space-y-2.5"
          >
            <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                  Conta Única Multi-Perfil
                </span>
                <span className="text-xs font-extrabold text-[#18181B] dark:text-white">
                  {fullName} • <span className="text-[#38C958]">{characterName}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-[#1c2029] flex items-center justify-center text-zinc-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Opção Visão Atleta -> /player */}
            <button
              type="button"
              onClick={() => handleSelectRole('player')}
              className={cn(
                'w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all',
                session?.role === 'player'
                  ? 'bg-[#7C5CFC]/15 border border-[#7C5CFC]/40'
                  : 'hover:bg-zinc-50 dark:hover:bg-[#1c2029]'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-[#1c2029] border border-emerald-500/30 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={playerPhoto}
                    alt={characterName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/templates/avatar-placeholder.jpg';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                    🏃 Visão Atleta ({characterName})
                  </p>
                  <p className="text-[10px] text-[#38C958] font-semibold truncate">
                    Abre /player • Carta FC 26, Build & Pack Opener
                  </p>
                </div>
              </div>
              {session?.role === 'player' && (
                <Check className="w-4 h-4 text-[#7C5CFC] shrink-0" />
              )}
            </button>

            {/* 2. Opção Visão Capitão -> /captain */}
            <button
              type="button"
              onClick={() => handleSelectRole('captain')}
              className={cn(
                'w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all',
                session?.role === 'captain'
                  ? 'bg-[#7C5CFC]/15 border border-[#7C5CFC]/40'
                  : 'hover:bg-zinc-50 dark:hover:bg-[#1c2029]'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-[#1c2029] p-1 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={teamLogo}
                    alt={activeTeam?.name || 'Clube'}
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/templates/crest-placeholder.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                    🛡️ Visão Capitão ({activeTeam?.name || 'Furia del Plata'})
                  </p>
                  <p className="text-[10px] text-[#7C5CFC] font-semibold truncate">
                    Abre /captain • Elenco, Uniformes & Rateio PIX
                  </p>
                </div>
              </div>
              {session?.role === 'captain' && (
                <Check className="w-4 h-4 text-[#7C5CFC] shrink-0" />
              )}
            </button>

            {/* 3. Opção Visão Admin / Liga -> /admin */}
            <button
              type="button"
              onClick={() => handleSelectRole('admin')}
              className={cn(
                'w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all',
                session?.role === 'admin'
                  ? 'bg-[#7C5CFC]/15 border border-[#7C5CFC]/40'
                  : 'hover:bg-zinc-50 dark:hover:bg-[#1c2029]'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 p-1 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={adminIcon}
                    alt="Admin da Liga"
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/templates/crest-placeholder.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                    👑 Visão Admin / Liga ({tournament?.season_label || 'LPF 5x5'})
                  </p>
                  <p className="text-[10px] text-amber-500 font-semibold truncate">
                    Abre /admin • Campeonatos, Legacy Stats & Caixa
                  </p>
                </div>
              </div>
              {session?.role === 'admin' && (
                <Check className="w-4 h-4 text-[#7C5CFC] shrink-0" />
              )}
            </button>

            <div className="pt-1.5 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between px-1">
              <Link
                href="/draft-board"
                onClick={() => setAccountMenuOpen(false)}
                className="text-[11px] font-bold text-[#7C5CFC] hover:underline py-1 flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" /> Sala de Draft (+40)
              </Link>
              <Link
                href="/admin"
                onClick={() => {
                  switchProfileRole('admin', false);
                  setAccountMenuOpen(false);
                }}
                className="text-[11px] font-bold text-amber-500 hover:underline py-1 flex items-center gap-1"
              >
                <Crown className="w-3 h-3" /> Painel Admin
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
        </div>
      )}

      {/* DROPDOWN SELETOR DE CAMPEONATO ATIVO & HISTÓRICO */}
      {seasonMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setSeasonMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-14 mx-auto sm:mr-16 w-80 rounded-3xl bg-white dark:bg-[#161920] border border-zinc-200 dark:border-white/10 shadow-2xl p-3 space-y-1.5"
          >
            <div className="px-2 py-1 border-b border-zinc-100 dark:border-white/10 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                Campeonatos & Temporadas
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Alterne entre a temporada em andamento e o histórico encerrado
              </span>
            </div>
            {tournaments.map((t) => {
              const isSelected = tournament?.id === t.id;
              const isFinished = t.status === 'finished';
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    selectTournament(t.id);
                    setSeasonMenuOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-2',
                    isSelected
                      ? 'bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-md'
                      : 'text-[#18181B] dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#1c2029]'
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold truncate">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          'text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full',
                          isSelected
                            ? 'bg-white/20 text-white'
                            : isFinished
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-[#38C958]/15 text-[#38C958]'
                        )}
                      >
                        {isFinished ? 'Encerrado' : 'Em Andamento'}
                      </span>
                      {t.champion_team_name && (
                        <span className="text-[10px] opacity-85 truncate">
                          🏆 {t.champion_team_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: SUAS NOTIFICAÇÕES */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#161920] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-200 dark:border-white/10 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Suas Notificações
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Súmulas validadas, artes 4:5 e alertas oficiais da liga
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-[#1c2029] flex items-center justify-center text-zinc-500"
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
                    className="block p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] hover:bg-[#7C5CFC]/15 border border-zinc-200/60 dark:border-white/[0.06] transition-all"
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
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
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

      {/* MODAL: CONFIGURAÇÕES & TROCA DE PERFIL */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#F5F6FA] dark:bg-[#0c0e12] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-200 dark:border-white/10 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Configurações & Acesso Rápido
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-9 h-9 rounded-full bg-white dark:bg-[#161920] flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] text-white shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">{characterName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#38C958] text-white text-[10px] font-extrabold">
                      Conta Multi-Perfil
                    </span>
                  </div>
                  <p className="text-xs text-white/85">
                    Titular: {fullName} • Alterne entre Atleta, Capitão e Admin com redirecionamento imediato.
                  </p>
                </div>
              </div>
            </div>

            {/* Alternador de Visão na mesma conta */}
            <div className="bg-white dark:bg-[#161920] rounded-3xl p-4 border border-zinc-200/70 dark:border-white/[0.07] space-y-2.5">
              <span className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Alternar Papel e Ir para o Painel
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRole('player')}
                  className={cn(
                    'p-2.5 rounded-2xl border text-center transition-all',
                    session?.role === 'player'
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/15 text-[#7C5CFC] font-extrabold'
                      : 'border-zinc-200/60 dark:border-white/10 text-xs font-semibold'
                  )}
                >
                  <User className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">🏃 Atleta</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('captain')}
                  className={cn(
                    'p-2.5 rounded-2xl border text-center transition-all',
                    session?.role === 'captain'
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/15 text-[#7C5CFC] font-extrabold'
                      : 'border-zinc-200/60 dark:border-white/10 text-xs font-semibold'
                  )}
                >
                  <Shield className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">🛡️ Capitão</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className={cn(
                    'p-2.5 rounded-2xl border text-center transition-all',
                    session?.role === 'admin'
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/15 text-[#7C5CFC] font-extrabold'
                      : 'border-zinc-200/60 dark:border-white/10 text-xs font-semibold'
                  )}
                >
                  <Crown className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-[11px] block">👑 Admin</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161920] rounded-3xl p-2 border border-zinc-200/70 dark:border-white/[0.07] divide-y divide-zinc-100 dark:divide-white/[0.06]">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-[#1c2029] rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-[#7C5CFC]" />
                  ) : (
                    <Sun className="w-5 h-5 text-[#7C5CFC]" />
                  )}
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Tema Stitch E-sports
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {isDark ? 'Tactical Obsidian (#0c0e12)' : 'Pitch Clean Light (#F5F6FA)'}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] text-[11px] font-bold">
                  Alternar
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  setMetricsModalOpen(true);
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-[#1c2029] rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-[#7C5CFC]" />
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Pontuação da Súmula
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Gol ({metricsScore.gol}), Assistência ({metricsScore.assistencia}), Cartões...
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7C5CFC]">Editar &gt;</span>
              </button>

              <Link
                href="/rankings"
                onClick={() => setSettingsOpen(false)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-[#1c2029] rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-[#38C958]" />
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Tabela & Chaveamento Mata-Mata
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Classificação Pro, Semifinais G4 e Líderes da Temporada
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7C5CFC]">Abrir &gt;</span>
              </Link>

              <Link
                href="/draft-board"
                onClick={() => setSettingsOpen(false)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-[#1c2029] rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#7C5CFC]" />
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Sala de Draft Oficial (+40 Jogadores)
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Sorteio de Ordem por IA & Contratação ao Vivo
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7C5CFC]">Abrir &gt;</span>
              </Link>

              <Link
                href="/admin"
                onClick={() => {
                  switchProfileRole('admin', false);
                  setSettingsOpen(false);
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-[#1c2029] rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Painel Master Admin & Legacy Stats
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Histórico Antigo de Carreira, Campeonatos e Tesouraria
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400">Abrir &gt;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PONTUAÇÃO DA SÚMULA */}
      {metricsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#161920] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Pontuação da súmula
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Personalize o peso de cada estatística no ranking geral
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMetricsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-[#1c2029] flex items-center justify-center text-zinc-500"
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
                { key: 'destaque', label: '⭐ Destaque (MVP)', val: metricsScore.destaque },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-[#1c2029] flex items-center justify-between"
                >
                  <span className="text-xs font-extrabold text-[#18181B] dark:text-white">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjustMetric(item.key as keyof typeof metricsScore, -1)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-[#161920] border border-zinc-200 dark:border-white/10 font-black text-sm text-[#7C5CFC] flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-extrabold text-sm text-[#18181B] dark:text-white">
                      {item.val}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustMetric(item.key as keyof typeof metricsScore, 1)}
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

export default Header;
