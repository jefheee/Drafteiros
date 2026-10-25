'use client';

import React from 'react';
import Link from 'next/link';
import { StatusMark } from '@/components/react-bits/status-mark';
import { ClickSpark } from '@/components/react-bits/click-spark';
import {
  XCircle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  MessageSquareWarning,
  Coins,
  Bot,
  CalendarCheck,
  Sparkles,
  Trophy,
  ArrowRight,
} from 'lucide-react';

export function LandingComparison() {
  const problems = [
    {
      title: 'Horas digitando tabelas e calculando saldo em planilhas',
      desc: 'Capitães atrasam o envio de prints e você vira escravo de arquivos corrompidos do Excel.',
      icon: FileSpreadsheet,
    },
    {
      title: 'Súmulas manuais com erros e brigas por autoria de gols',
      desc: 'Prints cortados, jogadores marcando gols de terceiros e discussão infinita em áudios de WhatsApp.',
      icon: MessageSquareWarning,
    },
    {
      title: 'Atrasos eternos para combinar horários dos confrontos',
      desc: 'Mensagens desencontradas no grupo até conseguir que ambos os times estejam online.',
      icon: Clock,
    },
    {
      title: 'Cobrança constrangedora de inscrições e premiações',
      desc: 'Comprovantes de PIX soltos no privado, dinheiro misturado com contas pessoais e desconfiança.',
      icon: Coins,
    },
  ];

  const solutions = [
    {
      title: 'Cruzamento de Disponibilidade Instantâneo',
      desc: 'Os capitães informam seus turnos disponíveis e o sistema fecha as janelas ideais agendando as partidas.',
      icon: CalendarCheck,
    },
    {
      title: 'Súmula por Foto Lida por IA em 15 Segundos',
      desc: 'A IA (Google Gemini 2.5 Pro) analisa a tela final do EA FC, extrai placar, autores, notas e atualiza a tabela na hora.',
      icon: Bot,
    },
    {
      title: 'Estúdio de Banners 4:5 pro Instagram',
      desc: 'Gere artes profissionais no formato feed 4:5 (Dia de Jogo, Placar Final e Craque) com 1 único clique.',
      icon: Sparkles,
    },
    {
      title: 'Tesouraria Transparente & Premiação 100%',
      desc: 'Painel público com saldo e extrato auditável em tempo real. Premiação repassada aos campeões sem atrito.',
      icon: Trophy,
    },
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-28 relative max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wider uppercase">
          <span>CHEGA DE CONFUSÃO</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-tight">
          A PARTE DIFÍCIL DEVIA SER O JOGO.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#00E599]">
            NÃO A ORGANIZAÇÃO.
          </span>
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
          Chega de planilhas corrompidas, capitães brigando no WhatsApp e noites perdidas somando estatísticas.
        </p>
      </div>

      {/* Grid Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Antes no Zap */}
        <div className="rounded-3xl bg-[#14171f]/70 border border-red-500/20 p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-red-500/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-red-400 block">
                  O CAOS ANTIGO
                </span>
                <h3 className="text-lg font-display font-black text-white">
                  Organizar no Grupo de WhatsApp
                </h3>
              </div>
            </div>
            <StatusMark status="error" label="Caótico" pulse={false} />
          </div>

          <div className="space-y-3.5">
            {problems.map((prob, i) => {
              const Icon = prob.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-200">{prob.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{prob.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center text-xs text-red-400/80 font-mono">
            Resultado: Campeonatos abandonados no meio e organizadores esgotados.
          </div>
        </div>

        {/* Hoje no Drafteiros */}
        <div className="rounded-3xl bg-gradient-to-b from-[#14171f] to-[#161a24] border border-[#00E599]/30 p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl shadow-emerald-500/10 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00E599] font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#00E599] block">
                    A NOVA ERA
                  </span>
                  <h3 className="text-lg font-display font-black text-white">
                    Com a Plataforma Drafteiros
                  </h3>
                </div>
              </div>
              <StatusMark status="success" label="100% Automático" />
            </div>

            <div className="space-y-3.5">
              {solutions.map((sol, i) => {
                const Icon = sol.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15 hover:border-emerald-500/30 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00E599] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{sol.title}</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">{sol.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <ClickSpark sparkColor="#00E599">
              <Link
                href="/login?action=create_league"
                className="w-full py-3.5 rounded-2xl bg-[#00E599] hover:bg-[#00c985] text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                <span>Profissionalizar Minha Competição Agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </ClickSpark>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingComparison;
