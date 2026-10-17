'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Trophy,
  CircleDot,
  Images,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { useLeagueStore } from '@/lib/data-store';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { session } = useAuth();
  const { players, teams } = useLeagueStore();

  const activePlayer = players.find(
    (p) =>
      p.id === session?.playerId ||
      p.character_name?.toLowerCase() === (session?.characterName || '').toLowerCase()
  );
  const activeTeam = teams.find(
    (t) =>
      t.id === session?.teamId ||
      t.name?.toLowerCase() === (session?.teamName || '').toLowerCase()
  );

  const profileAvatarSrc =
    session?.role === 'player'
      ? activePlayer?.avatar_face_url || session?.avatarUrl || '/assets/templates/avatar-placeholder.jpg'
      : session?.role === 'captain'
      ? activeTeam?.logo_url || '/assets/templates/crest-placeholder.png'
      : '/assets/awards/1st-place.png';

  const profileHref =
    session?.role === 'player'
      ? '/player'
      : session?.role === 'admin'
      ? '/admin'
      : '/captain';

  // 5 Pilares Oficiais (Mobile Bottom Nav)
  const tabs = [
    {
      id: 'home',
      label: 'Início',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
      isAvatar: false,
    },
    {
      id: 'rankings',
      label: 'Tabela',
      href: '/rankings',
      icon: Trophy,
      isActive: pathname.startsWith('/rankings') || pathname.startsWith('/tournaments'),
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
      label: 'Estúdio',
      href: '/studio',
      icon: Images,
      isActive: pathname.startsWith('/studio'),
      isAvatar: false,
    },
    {
      id: 'workspace',
      label: 'Espaço',
      href: profileHref,
      icon: User,
      isActive:
        pathname.startsWith('/captain') ||
        pathname.startsWith('/player') ||
        pathname.startsWith('/players') ||
        pathname.startsWith('/draft-board') ||
        pathname.startsWith('/admin'),
      isAvatar: true,
    },
  ];

  return (
    <nav
      aria-label="Navegação Principal Mobile"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-20px)] max-w-[430px] h-14 bg-gradient-to-r from-[#7C5CFC] to-[#5b3fd9] rounded-full px-2.5 flex items-center justify-between shadow-2xl shadow-[#7C5CFC]/30 border border-white/20 select-none lg:hidden"
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
                ? 'px-3 py-1.5 rounded-full bg-white text-[#7C5CFC] font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-all'
                : 'w-9 h-9 flex items-center justify-center text-white/90 hover:text-white shrink-0 rounded-full transition-all'
            )}
          >
            {tab.isAvatar ? (
              <span
                suppressHydrationWarning
                className={cn(
                  'w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border transition-all shrink-0 bg-white/20',
                  active ? 'border-[#7C5CFC]' : 'border-white/70'
                )}
              >
                <img
                  src={profileAvatarSrc}
                  alt="Meu Espaço"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/templates/avatar-placeholder.jpg';
                  }}
                />
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
