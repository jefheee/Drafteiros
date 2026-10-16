'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarCheck2,
  Shield,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { session, isAdmin } = useAuth();

  // Define rota inteligente para "Meu Time" e "Liga / Admin"
  const myTeamHref = session?.role === 'captain' || session?.role === 'admin' ? '/captain' : '/player';
  const leagueAdminHref = isAdmin ? '/admin' : '/tournaments';

  const tabs = [
    {
      id: 'home',
      label: 'Início',
      href: '/',
      icon: Home,
      matchPrefix: ['/'],
      exact: true,
    },
    {
      id: 'matches',
      label: 'Agenda & Súmula',
      href: '/matches',
      icon: CalendarCheck2,
      matchPrefix: ['/matches'],
      exact: false,
    },
    {
      id: 'team',
      label: 'Meu Time',
      href: myTeamHref,
      icon: Shield,
      matchPrefix: ['/captain', '/player', '/players'],
      exact: false,
    },
    {
      id: 'studio',
      label: 'Estúdio IA',
      href: '/studio',
      icon: Sparkles,
      matchPrefix: ['/studio'],
      exact: false,
    },
    {
      id: 'league',
      label: isAdmin ? 'Admin ERP' : 'Liga',
      href: leagueAdminHref,
      icon: Trophy,
      matchPrefix: ['/tournaments', '/admin', '/rankings', '/market'],
      exact: false,
    },
  ];

  return (
    <nav
      aria-label="Navegação Principal Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 z-50 px-1.5 flex items-center justify-around select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? pathname === '/'
          : tab.matchPrefix.some((prefix) => pathname.startsWith(prefix));

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              'min-h-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all px-1 relative',
              isActive
                ? 'text-cyan-400 font-bold bg-slate-900/90 border border-slate-800/90'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Icon
              className={cn(
                'w-4 h-4 transition-transform',
                isActive ? 'text-cyan-400 scale-105' : 'text-slate-400'
              )}
            />
            <span className="text-[10px] leading-tight tracking-tight truncate max-w-[68px]">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-cyan-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
