'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Users, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { cn } from '@/lib/utils';

const WORKSPACE_TABS = [
  {
    id: 'player',
    label: 'Minha Build & Carta FC 26',
    shortLabel: 'Build & Carta',
    href: '/player',
    icon: User,
    roleHint: 'player' as const,
    accent: 'text-[#38C958]',
  },
  {
    id: 'captain',
    label: 'Meu Clube & Caixa',
    shortLabel: 'Clube & Caixa',
    href: '/captain',
    icon: Shield,
    roleHint: 'captain' as const,
    accent: 'text-[#00E599]',
  },
  {
    id: 'draft',
    label: 'Sala de Draft & Mercadão',
    shortLabel: 'Sala de Draft',
    href: '/draft-board',
    icon: Users,
    roleHint: 'captain' as const,
    accent: 'text-[#00E599]',
  },
  {
    id: 'admin',
    label: 'Painel Master Admin',
    shortLabel: 'Master Admin',
    href: '/admin',
    icon: Crown,
    roleHint: 'admin' as const,
    accent: 'text-[#f59e0b]',
  },
];

export function WorkspaceNav() {
  const pathname = usePathname();
  const { switchProfileRole } = useAuth();

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#161920] border border-zinc-200/80 dark:border-white/[0.07] p-1.5 shadow-sm mb-4">
      <div className="flex items-center justify-between px-2.5 py-1 mb-1 border-b border-zinc-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#00E599]" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Pilar 5 • Meu Espaço & Gestão Multi-Perfil
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#38C958] hidden sm:inline">
          Acesso livre entre Atleta, Capitão, Draft e Admin
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {WORKSPACE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => {
                if (tab.id === 'admin') switchProfileRole('admin', false);
                else if (tab.id === 'player') switchProfileRole('player', false);
                else if (tab.id === 'captain') switchProfileRole('captain', false);
              }}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center sm:justify-start gap-2 transition-all',
                active
                  ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-md shadow-[#00E599]/20'
                  : 'bg-[#F5F6FA] dark:bg-[#1c2029]/70 text-zinc-700 dark:text-zinc-300 hover:border-[#00E599]/40 border border-transparent'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 shrink-0', active ? 'text-white' : tab.accent)} />
              <span className="truncate hidden md:inline">{tab.label}</span>
              <span className="truncate md:hidden">{tab.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
