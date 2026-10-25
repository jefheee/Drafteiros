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
  onChange?: (id: string) => void;
  className?: string;
}

export function PillNav({
  items,
  activeId,
  onSelect,
  onChange,
  className = '',
}: PillNavProps) {
  const handleSelect = (id: string) => {
    onSelect?.(id);
    onChange?.(id);
  };

  return (
    <nav
      className={`inline-flex items-center gap-1 p-1.5 rounded-full bg-[#0A0A0A] border border-white/[0.08] ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        const content = (
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 select-none ${
              isActive
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${
                  isActive ? 'bg-black text-white' : 'bg-white/10 text-zinc-300'
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        );

        if (item.href) {
          return (
            <Link key={item.id} href={item.href} onClick={() => handleSelect(item.id)}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
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
