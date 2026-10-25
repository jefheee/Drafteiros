'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Calendar,
  Trophy,
  Sparkles,
  User,
  Shield,
  Settings,
  LogOut,
  X,
  Check,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/players', label: 'Buscar', icon: Search },
  { href: '/matches', label: 'Partidas', icon: Calendar },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
  { href: '/studio', label: 'Estúdio', icon: Sparkles },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, switchRole, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (
    pathname === '/' ||
    pathname?.startsWith('/landing') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/onboarding')
  ) {
    return null;
  }

  const handleLogout = async () => {
    setSettingsOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-black/85 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Esquerda: Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-display font-black text-xs tracking-tight">
              DC
            </div>
            <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap">
              DraftClub
            </span>
          </Link>

          {/* Centro: Navegação Concisa Desktop */}
          <nav
            aria-label="Navegação do aplicativo"
            className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#0A0A0A] border border-white/[0.08]"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === '/players' && pathname === '/search') ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'h-9 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-white text-black shadow-xs'
                      : 'text-[#A1A1AA] hover:text-white'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Direita: Botões Proporcionais (h-10 whitespace-nowrap) */}
          <div className="flex items-center gap-2 shrink-0">
            {session ? (
              <>
                <Link
                  href="/player"
                  className={cn(
                    'h-10 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-2 border transition-colors whitespace-nowrap',
                    pathname === '/player'
                      ? 'bg-white text-black border-white'
                      : 'bg-[#141414] hover:bg-zinc-800 text-white border-white/[0.08]'
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[110px] truncate">
                    {session.characterName || session.fullName}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Configurações da conta"
                  className="w-10 h-10 rounded-full bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-[#A1A1AA] hover:text-white inline-flex items-center justify-center transition-colors shrink-0"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-10 px-4 rounded-full bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="h-10 px-4 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap transition-colors"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Configurações & Troca de Perfil */}
      {settingsOpen && session && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#0A0A0A] border border-white/[0.08] p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-display font-bold text-white">
                  Configurações da Conta
                </h2>
                <p className="text-xs text-[#A1A1AA]">{session.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#141414] hover:bg-zinc-800 text-[#A1A1AA] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alternar Perfil Ativo */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#A1A1AA] block">
                Modo de uso ativo
              </span>
              <div className="space-y-2">
                {(
                  [
                    {
                      id: 'player',
                      label: 'Jogador / Atleta',
                      desc: 'Minha Carta FC 26, atributos e disponibilidade',
                      href: '/player',
                      icon: User,
                    },
                    {
                      id: 'captain',
                      label: 'Dono de Time / Capitão',
                      desc: 'Gestão do elenco, código de convite e escudo',
                      href: '/captain',
                      icon: Shield,
                    },
                    {
                      id: 'admin',
                      label: 'Organizador da Liga',
                      desc: 'Criar campeonatos, chaveamento e tesouraria',
                      href: '/admin',
                      icon: Trophy,
                    },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = session.role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={async () => {
                        await switchRole(item.id);
                        setSettingsOpen(false);
                        router.push(item.href);
                      }}
                      className={cn(
                        'w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all',
                        active
                          ? 'bg-[#141414] border-white text-white'
                          : 'bg-black border-white/[0.08] text-[#A1A1AA] hover:border-white/20 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center',
                            active ? 'bg-white text-black' : 'bg-[#141414] text-white'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-[#A1A1AA] block">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      {active && <Check className="w-4 h-4 text-[#10B981]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              <Link
                href="/onboarding"
                onClick={() => setSettingsOpen(false)}
                className="w-full h-10 rounded-2xl bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold flex items-center justify-center transition-colors"
              >
                Reconfigurar Cadastro / Entrar em Time com Código
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-10 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Header;
