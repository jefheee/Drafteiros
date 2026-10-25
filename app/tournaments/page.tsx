'use client';

import React from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import {
  Trophy,
  Users,
  Settings,
  Award,
  BookOpen,
  Plus,
} from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

export default function TournamentsPage() {
  const { tournaments, loading } = useLeagueStore();

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-28">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BackButton fallbackHref="/dashboard" label="Início" />
              <span className="text-xs font-mono font-medium text-[#A1A1AA] uppercase tracking-wider">
                Central da Liga & Regulamento
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
              Campeonatos Oficiais (5x5 & 11v11)
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Consulte as regras oficiais, rankings de artilharia, busca de jogadores e painel da liga.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/rankings"
              className="h-10 px-4 rounded-full bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              Rankings
            </Link>
            <Link
              href="/players"
              className="h-10 px-4 rounded-full bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              Buscar
            </Link>
            <Link
              href="/admin"
              className="h-10 px-4 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Settings className="w-4 h-4" />
              Criar / Gerenciar Liga
            </Link>
          </div>
        </div>

        {/* Resumo do Regulamento Oficial */}
        <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#A1A1AA]" />
            Regras Oficiais Padrão
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-1">
              <span className="font-semibold text-white block">1. Tolerância de W.O.</span>
              <p className="text-[#A1A1AA]">
                15 minutos após o horário confirmado. Exige print do lobby com relógio visível.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-1">
              <span className="font-semibold text-white block">2. Remarcar Partida</span>
              <p className="text-[#A1A1AA]">
                Aviso obrigatório com no mínimo 40 minutos de antecedência do horário agendado.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-1">
              <span className="font-semibold text-white block">3. Queda no 1º Tempo</span>
              <p className="text-[#A1A1AA]">
                Reinicia a partida mantendo o placar e os gols registrados até o momento da queda.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-1">
              <span className="font-semibold text-white block">4. Dupla Validação</span>
              <p className="text-[#A1A1AA]">
                Súmula lida por IA a partir do print pós-jogo do EA FC 26 e confirmada pelos capitães.
              </p>
            </div>
          </div>
        </div>

        {/* Lista Real de Torneios no Supabase */}
        {loading ? (
          <div className="p-12 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center text-sm text-[#A1A1AA]">
            Carregando campeonatos...
          </div>
        ) : tournaments.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center mx-auto text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-display font-bold text-white">
                Nenhum campeonato cadastrado ainda
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Crie a primeira temporada oficial no painel da liga para iniciar a tabela e os jogos.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Campeonato
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-[#0A0A0A] border border-white/[0.08] p-5 rounded-3xl flex flex-col justify-between space-y-4 hover:border-white/20 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-white/[0.08] text-zinc-300 text-[10px] font-semibold uppercase tracking-wider">
                      Modo {tournament.game_mode || tournament.format}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#10B981] uppercase font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      {tournament.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-display font-bold text-white">
                    {tournament.name}
                  </h2>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Inscrição: R$ {Number(tournament.entry_fee || 0).toFixed(2)} • Elenco máx:{' '}
                    {tournament.max_roster_size || 6} atletas
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] grid grid-cols-3 gap-2">
                  <Link
                    href="/matches"
                    className="h-10 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center transition-colors"
                  >
                    Partidas
                  </Link>
                  <Link
                    href="/rankings"
                    className="h-10 px-3 rounded-xl bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white font-semibold text-xs flex items-center justify-center transition-colors"
                  >
                    Tabela
                  </Link>
                  <Link
                    href="/draft-board"
                    className="h-10 px-3 rounded-xl bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white font-semibold text-xs flex items-center justify-center transition-colors"
                  >
                    Draft
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
