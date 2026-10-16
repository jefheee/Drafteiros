'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Tournament } from '@/types/database';
import { FALLBACK_TOURNAMENT } from '@/lib/mock-league-data';
import {
  Trophy,
  Users,
  Shield,
  CalendarCheck2,
  Sparkles,
  Settings,
  Award,
  BookOpen,
} from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    FALLBACK_TOURNAMENT,
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: '🏆 Copa Libertadores Pro Clubs — 11v11',
      format: '11v11',
      game_mode: '11v11',
      max_roster_size: 18,
      entry_fee: 150.0,
      status: 'ACTIVE',
      created_at: '2026-10-05T18:00:00Z',
    },
  ]);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setTournaments(data);
        }
      } catch {
        // mantém fallback
      }
    }
    fetchTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BackButton fallbackHref="/" label="Início" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Central da Liga & Regulamento
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Ligas Oficiais (5x5 & 11v11)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Consulte as regras oficiais, rankings de artilharia, Mercadão de Free Agents e painel ERP.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/rankings"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Award className="w-4 h-4" />
              Rankings & Artilharia
            </Link>
            <Link
              href="/market"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4" />
              Mercadão Free Agents
            </Link>
            <Link
              href="/admin"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Painel ERP Admin
            </Link>
          </div>
        </div>

        {/* Resumo do Regulamento Oficial Automatizado */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            Livro de Regras Automatizado no Sistema
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 block">1. Tolerância de W.O.</span>
              <p className="text-slate-400">
                15 minutos após o horário confirmado. Exige print do lobby com relógio visível.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 block">2. Cancelamento / Adiar</span>
              <p className="text-slate-400">
                Aviso obrigatório com no mínimo 60 minutos de antecedência do horário batido.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 block">3. Queda até 20 Minutos</span>
              <p className="text-slate-400">
                Reinicia partida completa (90 min) mantendo o placar e gols já marcados.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 block">4. Queda Intervalo / 2º T</span>
              <p className="text-slate-400">
                Reinicia partida e joga apenas 1 tempo (45 min) somando o placar anterior.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Torneios */}
        <div className="grid md:grid-cols-2 gap-4">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                    Modo {tournament.game_mode || tournament.format}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    ● {tournament.status}
                  </span>
                </div>

                <h2 className="text-lg font-extrabold text-slate-100">{tournament.name}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inscrição: R$ {(tournament.entry_fee || 70).toFixed(2)} • Elenco máx:{' '}
                  {tournament.max_roster_size || 6} atletas • Dupla validação de súmulas ativa.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2">
                <Link
                  href="/matches"
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center transition-colors"
                >
                  Súmulas
                </Link>
                <Link
                  href={`/tournaments/${tournament.id}/teams/b1111111-1111-1111-1111-111111111111/builder`}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                >
                  Prancheta
                </Link>
                <Link
                  href={`/tournaments/${tournament.id}/draft`}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center transition-colors"
                >
                  Draft Board
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
