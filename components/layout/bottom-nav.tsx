'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  CircleDot,
  Images,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { session } = useAuth();

  const profileHref =
    session?.role === 'player'
      ? '/player'
      : session?.role === 'admin'
      ? '/admin'
      : '/captain';

  const tabs = [
    {
      id: 'home',
      label: 'Início',
      href: '/',
      icon: Home,
      isActive:
        pathname === '/' ||
        pathname.startsWith('/rankings') ||
        pathname.startsWith('/tournaments'),
      isAvatar: false,
    },
    {
      id: 'search',
      label: 'Draft',
      href: '/draft-board',
      icon: Search,
      isActive:
        pathname.startsWith('/draft-board') || pathname.startsWith('/market'),
      isAvatar: false,
    },
    {
      id: 'matches',
      label: 'Jogos',
      href: '/matches',
      icon: CircleDot,
      isActive: pathname.startsWith('/matches'),
      isAvatar: false,
    },
    {
      id: 'studio',
      label: 'Banners',
      href: '/studio',
      icon: Images,
      isActive: pathname.startsWith('/studio'),
      isAvatar: false,
    },
    {
      id: 'profile',
      label: 'Perfil',
      href: profileHref,
      icon: User,
      isActive:
        pathname.startsWith('/captain') ||
        pathname.startsWith('/player') ||
        pathname.startsWith('/players') ||
        pathname.startsWith('/admin'),
      isAvatar: true,
    },
  ];

  const initials =
    session?.role === 'player'
      ? (session?.characterName || 'JF').slice(0, 2).toUpperCase()
      : session?.role === 'admin'
      ? 'LPF'
      : 'FP';

  return (
    <nav
      aria-label="Navegação Principal"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-20px)] max-w-[420px] h-14 bg-[#7C5CFC] rounded-full px-2 flex items-center justify-between shadow-2xl border border-white/15 select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.isActive;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              active
                ? 'px-3 py-1.5 rounded-full bg-white text-[#7C5CFC] font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-all'
                : 'w-9 h-9 flex items-center justify-center text-white/90 hover:text-white shrink-0 rounded-full transition-all'
            )}
          >
            {tab.isAvatar ? (
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border transition-all shrink-0',
                  active
                    ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                    : 'bg-white/20 text-white border-white/70'
                )}
              >
                {initials}
              </span>
            ) : (
              <Icon className="w-4 h-4 shrink-0" />
            )}

            {active && <span className="truncate">{tab.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
