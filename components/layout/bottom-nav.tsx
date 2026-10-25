'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Calendar,
  IdCard,
  User,
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { session } = useAuth();

  if (
    pathname === '/' ||
    pathname?.startsWith('/landing') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/onboarding')
  ) {
    return null;
  }

  const profileHref =
    session?.role === 'captain'
      ? '/captain'
      : session?.role === 'admin'
      ? '/admin'
      : '/player';

  const items = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/players', label: 'Buscar', icon: Search },
    { href: '/matches', label: 'Partidas', icon: Calendar },
    { href: '/player', label: 'Carta Pro', icon: IdCard },
    { href: profileHref, label: 'Perfil', icon: User },
  ];

  return (
    <nav
      aria-label="Navegação inferior móvel"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0D0D0F]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 pb-safe"
    >
      <div className="max-w-md mx-auto h-16 grid grid-cols-5 items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/players' && pathname === '/search');

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 h-full transition-colors',
                isActive ? 'text-white' : 'text-[#A1A1AA] hover:text-zinc-300'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform',
                  isActive ? 'stroke-[2.25] scale-105' : 'stroke-[1.6]'
                )}
              />
              <span className="text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
export default BottomNav;
