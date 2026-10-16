'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Home,
  Shield,
  Settings,
  LogIn,
  LogOut,
  CalendarCheck2,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const { session, logout } = useAuth();

  const navItems = [
    { label: 'Início / Rodadas', href: '/', icon: Home },
    { label: 'Agenda & Súmula', href: '/matches', icon: CalendarCheck2 },
    { label: 'Meu Time', href: '/captain', icon: UserCheck },
    { label: 'Passaporte Atleta', href: '/player', icon: Shield },
    { label: 'Estúdio IA', href: '/studio', icon: Sparkles },
    { label: 'Liga / Rankings', href: '/tournaments', icon: Trophy },
    { label: 'Admin ERP', href: '/admin', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand + Active League Badge */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5 group min-h-[44px]">
            <div className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-sm group-hover:border-cyan-500/50 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-slate-100 leading-none">
                  Draft<span className="text-cyan-400">Club</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 tracking-wide">
                EA FC 26 • Liga 5v5 & 11v11
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Only (< md uses BottomNav) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    isActive
                      ? 'bg-slate-900/90 text-cyan-400 border border-slate-800 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5',
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section Auth / Quick Switch */}
        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs min-h-[44px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <div className="flex flex-col leading-tight">
                  <span className="text-slate-200 font-semibold text-[11px] truncate max-w-[110px] sm:max-w-[160px]">
                    {session.name}
                  </span>
                  <span className="text-[9px] text-amber-400 uppercase font-mono">
                    {session.teamName || session.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center"
                title="Desconectar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };
