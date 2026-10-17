'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { useLeagueStore } from '@/lib/data-store';
import { cn } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const { session, switchProfileRole, logout } = useAuth();
  const { players, teams, tournament } = useLeagueStore();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState('LPF 5x5');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
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

  const characterName = session?.characterName || 'JEFHE';
  const fullName = session?.fullName || 'Jefherson';

  // Obter jogador e clube atualizados da store
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
    '/assets/templates/guest-avatar.png';

  const teamLogo =
    activeTeam?.logo_url ||
    '/assets/templates/default-crest.png';

  const adminIcon = '/assets/awards/1st-place.png';

  // Imagem exibida no botão fechado de acordo com o papel ativo
  const currentAvatarSrc =
    session?.role === 'player'
      ? playerPhoto
      : session?.role === 'captain'
      ? teamLogo
      : adminIcon;

  const currentRoleLabel =
    session?.role === 'admin'
      ? 'Admin da Liga'
      : session?.role === 'player'
      ? `${characterName} (Atleta)`
      : activeTeam?.name || 'Furia del Plata';

  const currentInitials =
    session?.role === 'admin'
      ? 'LPF'
      : session?.role === 'player'
      ? characterName.slice(0, 2).toUpperCase()
      : 'FP';

  const notifications = [
    {
      id: 'n1',
      title: 'Pós-Jogo Oficial: Furia del Plata 2 - 7 La Catimba',
      desc: 'Arte 4:5 full-bleed sem patrocinadores pronta para download no Estúdio.',
      time: 'Agora',
      href: '/studio',
      icon: Images,
      badge: 'Banner 4:5',
    },
    {
      id: 'n2',
      title: 'Súmula validada & Tabela atualizada',
      desc: 'HAALANDINHO (5 gols) assumiu a artilharia isolada da LPF 5x5.',
      time: 'Há 10 min',
      href: '/matches',
      icon: FileCheck2,
      badge: 'Súmula',
    },
    {
      id: 'n3',
      title: 'Tinder de Horários por Intervalos',
      desc: 'Janela ideal detectada: Terça-feira (Noite Pico • 21:30 às 23:30).',
      time: 'Há 35 min',
      href: '/matches',
      icon: Calendar,
      badge: 'Agenda',
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
      <header className="sticky top-0 z-40 w-full bg-[#F5F6FA]/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-3xl mx-auto w-full px-3 py-2.5 flex items-center justify-between gap-1.5 overflow-hidden">
          {/* 1. CANTO ESQUERDO: Seletor Multi-Perfil na Mesma Conta */}
          <button
            type="button"
            onClick={() => {
              setAccountMenuOpen(!accountMenuOpen);
              setSeasonMenuOpen(false);
            }}
            className="max-w-[155px] sm:max-w-[210px] h-9 pl-1 pr-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-1.5 hover:border-[#7C5CFC] transition-all shrink-0 overflow-hidden"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center shrink-0">
              {mounted ? (
                <img
                  src={currentAvatarSrc}
                  alt={currentRoleLabel}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (session?.role === 'captain') {
                      target.src = '/assets/templates/default-crest.png';
                    } else if (session?.role === 'player') {
                      target.src = '/assets/templates/guest-avatar.png';
                    } else {
                      target.src = '/assets/awards/1st-place.png';
                    }
                  }}
                />
              ) : (
                <span className="text-[9px] font-black text-[#7C5CFC]">{currentInitials}</span>
              )}
            </div>
            <span className="text-[11px] font-extrabold text-[#18181B] dark:text-white truncate" suppressHydrationWarning>
              {mounted ? (session?.teamName || currentRoleLabel) : 'Furia del Plata'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#7C5CFC] shrink-0" />
          </button>

          {/* 2. CENTRO: Pílula Compacta da Liga */}
          <button
            type="button"
            onClick={() => {
              setSeasonMenuOpen(!seasonMenuOpen);
              setAccountMenuOpen(false);
            }}
            className="max-w-[115px] sm:max-w-[180px] h-9 px-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-1 hover:border-[#7C5CFC] transition-all overflow-hidden"
          >
            <Calendar className="w-3 h-3 text-[#7C5CFC] shrink-0" />
            <span className="truncate text-xs font-semibold text-[#18181B] dark:text-white">
              {selectedSeason}
            </span>
            <ChevronDown className="w-3 h-3 text-[#71717A] shrink-0" />
          </button>

          {/* 3. CANTO DIREITO: Ícones Circulares Compactos w-9 h-9 shrink-0 */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative w-9 h-9 shrink-0 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-center text-[#18181B] dark:text-white hover:border-[#7C5CFC] transition-all"
              title="Suas Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#7C5CFC]" />
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 shrink-0 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-center text-[#18181B] dark:text-white hover:border-[#7C5CFC] transition-all"
              title="Configurações e Perfis"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* DROPDOWN MULTI-PERFIL (CONTA ÚNICA) */}
      {accountMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setAccountMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-14 ml-3 w-[calc(100vw-24px)] max-w-xs rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl p-3.5 space-y-2.5"
          >
            <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
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
                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Opção Atleta (Foto do Personagem) */}
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
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-emerald-500/30 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={playerPhoto}
                    alt={characterName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/templates/guest-avatar.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                    Atleta ({characterName})
                  </p>
                  <p className="text-[10px] text-[#38C958] font-semibold truncate">
                    Minha Build, Qualidades, PlayStyles & AcceleRATE
                  </p>
                </div>
              </div>
              {session?.role === 'player' && (
                <Check className="w-4 h-4 text-[#7C5CFC] shrink-0" />
              )}
            </button>

            {/* 2. Opção Capitão (Escudo Real do Clube) */}
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
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-[#7C5CFC]/30 p-1 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={teamLogo}
                    alt={activeTeam?.name || 'Clube'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/templates/default-crest.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                    Capitão ({activeTeam?.name || 'Furia del Plata'})
                  </p>
                  <p className="text-[10px] text-[#7C5CFC] font-semibold truncate">
                    Elenco, Escudo/Uniformes & Rateio da Inscrição
                  </p>
                </div>
              </div>
              {session?.role === 'captain' && (
                <Check className="w-4 h-4 text-[#7C5CFC] shrink-0" />
              )}
            </button>

            {/* 3. Opção Admin da Liga (Ícone Oficial de Troféu) */}
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
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 p-1.5 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={adminIcon}
                    alt="Admin da Liga"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/templates/default-crest.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                    Admin da Liga ({tournament?.name || 'LPF 5x5'})
                  </p>
                  <p className="text-[10px] text-amber-600 font-semibold truncate">
                    Tesouraria 100%, Chaveamento & E-mails
                  </p>
                </div>
              </div>
              {session?.role === 'admin' && (
                <Check className="w-4 h-4 text-[#7C5CFC] shrink-0" />
              )}
            </button>

            <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-1">
              <Link
                href="/draft-board"
                onClick={() => setAccountMenuOpen(false)}
                className="text-[11px] font-bold text-[#7C5CFC] hover:underline py-1 flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" /> Sala de Draft (+40)
              </Link>
              <Link
                href="/login"
                onClick={() => setAccountMenuOpen(false)}
                className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:underline py-1"
              >
                Conta / Cadastro →
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

      {/* DROPDOWN SELETOR DE CAMPEONATO */}
      {seasonMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setSeasonMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-14 mx-auto w-64 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl p-2.5 space-y-1"
          >
            {[
              'LPF 5x5',
              'Superliga 11v11',
              'Copa Relâmpago 7v7',
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
                <span>🏆 {s}</span>
                {selectedSeason === s && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SUAS NOTIFICAÇÕES */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Suas Notificações
                </h2>
                <p className="text-xs text-[#71717A]">
                  Súmulas validadas, artes 4:5 e alertas oficiais da liga
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

      {/* MODAL: CONFIGURAÇÕES & TROCA DE PERFIL */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#F5F6FA] dark:bg-zinc-950 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Configurações da Conta
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E5] text-white shadow-lg flex items-center justify-between">
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
                    Titular: {fullName} • Alterne entre Atleta, Capitão e Admin sem deslogar.
                  </p>
                </div>
              </div>
            </div>

            {/* Alternador de Visão na mesma conta */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 space-y-2.5">
              <span className="text-xs font-extrabold text-[#71717A] uppercase tracking-wider block">
                Alternar Papel na Mesma Conta
              </span>
              <div className="grid grid-cols-3 gap-2">
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
                  <span className="text-[11px] block">Atleta</span>
                </button>
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
                  <span className="text-[11px] block">Capitão</span>
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
                      {isDark ? 'Dark Mode ativado' : 'Light Mode Clean (Padrão)'}
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
                      Pontuação da Súmula
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      Gol ({metricsScore.gol}), Assistência ({metricsScore.assistencia}), Cartões...
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7C5CFC]">Editar &gt;</span>
              </button>

              <Link
                href="/draft-board"
                onClick={() => setSettingsOpen(false)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#7C5CFC]" />
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Sala de Draft Oficial (+40 Jogadores)
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      Sorteio de Ordem por IA & Contratação ao Vivo
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7C5CFC]">Abrir &gt;</span>
              </Link>

              <Link
                href="/captain"
                onClick={() => setSettingsOpen(false)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[#7C5CFC]" />
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      Rateio da Inscrição & Caixa do Time
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      Divisão automática por jogador + comprovante integral
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#7C5CFC]">Abrir &gt;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PONTUAÇÃO DA SÚMULA */}
      {metricsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Pontuação da súmula
                </h2>
                <p className="text-xs text-[#71717A]">
                  Personalize o peso de cada estatística no ranking geral
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
                { key: 'destaque', label: '⭐ Destaque (MVP)', val: metricsScore.destaque },
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
                      onClick={() => adjustMetric(item.key as keyof typeof metricsScore, -1)}
                      className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-black text-sm text-[#7C5CFC] flex items-center justify-center"
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

export { Header };
