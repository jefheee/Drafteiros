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
      : '/captain';

  const tabs = [
    {
      id: 'home',
      label: 'Início',
      href: '/',
      icon: Home,
      isActive: pathname === '/' || pathname.startsWith('/rankings') || pathname.startsWith('/tournaments'),
      isAvatar: false,
    },
    {
      id: 'search',
      label: 'Buscar',
      href: '/market',
      icon: Search,
      isActive: pathname.startsWith('/market'),
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
      ? 'JF'
      : session?.role === 'admin'
      ? 'LPF'
      : 'FP';

  return (
    <nav
      aria-label="Navegação Principal Jogueiros"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-16 bg-[#7C5CFC] rounded-full px-3 flex items-center justify-between shadow-xl z-50 select-none"
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
                ? 'bg-white text-[#7C5CFC] px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm shadow-sm transition-all'
                : 'text-white/90 hover:text-white p-2.5 rounded-full flex items-center justify-center transition-all'
            )}
          >
            {tab.isAvatar ? (
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all shrink-0',
                  active
                    ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                    : 'bg-white/20 text-white border-white/70'
                )}
              >
                {initials}
              </span>
            ) : (
              <Icon className="w-5 h-5 shrink-0" />
            )}

            {active && <span className="truncate">{tab.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
