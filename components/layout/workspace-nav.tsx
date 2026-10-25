'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Shield, Users, Settings, Sparkles } from 'lucide-react';

const WORKSPACE_TABS = [
  { href: '/player', label: 'Minha Carta FC 26', icon: User },
  { href: '/captain', label: 'Meu Clube', icon: Shield },
  { href: '/draft-board', label: 'Sala de Draft', icon: Users },
  { href: '/studio', label: 'Estúdio de Banners', icon: Sparkles },
  { href: '/admin', label: 'Painel da Liga', icon: Settings },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {WORKSPACE_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'h-9 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 shrink-0 border transition-all whitespace-nowrap',
              active
                ? 'bg-white text-black border-white shadow-xs'
                : 'bg-[#0A0A0A] text-[#A1A1AA] border-white/[0.08] hover:text-white hover:border-white/20'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
export default WorkspaceNav;
