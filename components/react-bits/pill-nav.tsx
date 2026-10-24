'use client';

import React from 'react';
import Link from 'next/link';

export interface PillNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface PillNavProps {
  items: PillNavItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function PillNav({
  items,
  activeId,
  onSelect,
  className = '',
}: PillNavProps) {
  return (
    <nav
      className={`inline-flex items-center gap-1 p-1.5 rounded-full bg-[#14171f]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        const content = (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 select-none ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 to-[#00E599] text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                  isActive ? 'bg-zinc-950 text-[#00E599]' : 'bg-white/10 text-zinc-300'
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        );

        if (item.href) {
          return (
            <Link key={item.id} href={item.href} onClick={() => onSelect?.(item.id)}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className="focus:outline-none"
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}

export default PillNav;
