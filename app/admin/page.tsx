'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import { calculateBracketOptions } from '@/lib/accelerate';
import { AWARD_ASSETS } from '@/lib/assets-catalog';
import { BracketType } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  Crown,
  Wallet,
  Trophy,
  CheckCircle2,
  Plus,
  Trash2,
  Mail,
  Users,
  Eye,
  Calculator,
  Sparkles,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    tournament,
    teams,
    players,
    matches,
    registrations,
    updateTournamentInStore,
    approveTeamRegistration,
  } = useLeagueStore();

  const [activeTab, setActiveTab] = useState<
    'treasury' | 'builder_brackets' | 'media_audit' | 'email_center'
  >('treasury');

  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // =========================================================================
  // ESTADO ABA 1: TESOURARIA 100% PREMIAÇÃO (ZERO TAXA OPERACIONAL)
  // =========================================================================
  const [entryFee, setEntryFee] = useState<number>(Number(tournament.entry_fee || 70));
  const [prizeFirst, setPrizeFirst] = useState<number>(
    tournament.prize_distribution?.first || 300
  );
  const [prizeSecond, setPrizeSecond] = useState<number>(
    tournament.prize_distribution?.second || 120
  );
  const [prizeThird, setPrizeThird] = useState<number>(
    tournament.prize_distribution?.third || 80
  );
  const [prizeScorer, setPrizeScorer] = useState<number>(
    tournament.prize_distribution?.top_scorer || 30
  );
  const [prizeAssister, setPrizeAssister] = useState<number>(
    tournament.prize_distribution?.top_assister || 30
  );

  const totalCollectedPool = teams.length * entryFee;
  const totalDistributedPrizes =
    prizeFirst + prizeSecond + prizeThird + prizeScorer + prizeAssister;

  const handleConfirmAndReleaseTeam = async (regId: string, teamId: string, teamName: string) => {
    await approveTeamRegistration(regId, teamId);

    // Dispara e-mail automático de confirmação
    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'registration_approved',
          recipients: ['capitao@draftclub.pro'],
          customMessage: `O recebimento integral de R$ ${entryFee.toFixed(
            2
          )} da equipe "${teamName}" foi confirmado pelo Admin. Sua equipe está oficialmente liberada na competição!`,
        }),
      });
    } catch {
      // ignora erro de rede
    }

    setFeedbackBanner(
      `✅ Recebimento integral confirmado! A equipe "${teamName}" foi liberada oficialmente no campeonato.`
    );
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  // =========================================================================
  // ESTADO ABA 2: CRIADOR DINÂMICO DE CAMPEONATOS & CALCULADORA CHAVEAMENTO
  // =========================================================================
  const [champName, setChampName] = useState(tournament.name);
  const [gameMode, setGameMode] = useState(tournament.game_mode || '5v5');
  const [startersCount, setStartersCount] = useState<number>(
    tournament.starters_count || 5
  );
  const [reservesCount, setReservesCount] = useState<number>(
    tournament.reserves_count ?? 1
  );
  const [teamCountInput, setTeamCountInput] = useState<number>(teams.length || 8);
  const [selectedBracketType, setSelectedBracketType] = useState<BracketType>(
    tournament.bracket_type || 'pontos_corridos_g4'
  );
  const [customRules, setCustomRules] = useState<string[]>(
    tournament.custom_rules || [
      'Aviso prévio mínimo de 40 minutos para cancelamento sem W.O.',
      'Tolerância máxima de 15 minutos no lobby após o horário agendado.',
      'Proibido uso de qualquer (ANY) — todos os titulares devem ser Pro.',
    ]
  );
  const [newRuleText, setNewRuleText] = useState('');

  const bracketSuggestions = useMemo(
    () => calculateBracketOptions(teamCountInput),
    [teamCountInput]
  );

  const handleAddCustomRule = () => {
    if (!newRuleText.trim()) return;
    setCustomRules((prev) => [...prev, newRuleText.trim()]);
    setNewRuleText('');
  };

  const handleRemoveCustomRule = (idx: number) => {
    setCustomRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveChampionshipConfig = async () => {
    await updateTournamentInStore({
      name: champName,
      game_mode: gameMode,
      starters_count: startersCount,
      reserves_count: reservesCount,
      max_roster_size: startersCount + reservesCount,
      entry_fee: entryFee,
      bracket_type: selectedBracketType,
      custom_rules: customRules,
      prize_distribution: {
        first: prizeFirst,
        second: prizeSecond,
        third: prizeThird,
        top_scorer: prizeScorer,
        top_assister: prizeAssister,
      },
    });
    setFeedbackBanner(
      `✅ Campeonato "${champName}" (${gameMode} • ${startersCount} Titulares + ${reservesCount} Reservas) salvo com sucesso!`
    );
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  // =========================================================================
  // ESTADO ABA 4: DISPARADOR DE E-MAILS & NOTIFICAÇÕES
  // =========================================================================
  const [emailEventType, setEmailEventType] = useState<
    | 'registration_approved'
    | 'match_scheduled'
    | 'sumula_pending'
    | 'draft_order_drawn'
    | 'custom_broadcast'
  >('registration_approved');
  const [emailRecipientsText, setEmailRecipientsText] = useState(
    'capitao@draftclub.pro, atleta@draftclub.pro, lacatimba@draftclub.pro'
  );
  const [emailCustomMessage, setEmailCustomMessage] = useState(
    'Inscrições confirmadas! Confira a tabela da Rodada #1 e a Sala de Draft (+40 jogadores).'
  );
  const [emailSending, setEmailSending] = useState(false);

  const handleSendEmails = async () => {
    setEmailSending(true);
    try {
      const recipients = emailRecipientsText
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: emailEventType,
          recipients,
          customMessage: emailCustomMessage,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setFeedbackBanner(
          `📧 E-mail disparado para ${json.recipientsCount} destinatário(s): "${json.subject}"`
        );
        setTimeout(() => setFeedbackBanner(null), 5000);
      }
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 sm:px-4 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-3xl mx-auto space-y-4">
        {/* CABEÇALHO DO ADMIN DA LIGA */}
        <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-extrabold uppercase">
                  Organizador Oficial da Liga • 100% Premiação
                </span>
                <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
                  ERP da Liga & Criador de Campeonatos
                </h1>
                <p className="text-xs text-zinc-500">
                  Liberação de equipes mediante pagamento integral, calculadora de chaveamento e auditoria de mídia.
                </p>
              </div>
            </div>

            <Link
              href="/draft-board"
              className="py-2.5 px-4 rounded-2xl bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Users className="w-4 h-4" />
              <span>Sala de Draft (+40)</span>
            </Link>
          </div>

          {feedbackBanner && (
            <div className="p-3 rounded-2xl bg-[#38C958]/15 border border-[#38C958]/30 text-[#229a3e] dark:text-[#38C958] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackBanner}</span>
            </div>
          )}
        </section>

        {/* NAVEGAÇÃO DE ABAS DO ADMIN */}
        <div className="p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('treasury')}
            className={cn(
              'py-2 px-2 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center gap-1',
              activeTab === 'treasury'
                ? 'bg-[#7C5CFC] text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tesouraria</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('builder_brackets')}
            className={cn(
              'py-2 px-2 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center gap-1',
              activeTab === 'builder_brackets'
                ? 'bg-[#7C5CFC] text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Formatos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media_audit')}
            className={cn(
              'py-2 px-2 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center gap-1',
              activeTab === 'media_audit'
                ? 'bg-[#7C5CFC] text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Prints/Fotos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email_center')}
            className={cn(
              'py-2 px-2 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center gap-1',
              activeTab === 'email_center'
                ? 'bg-[#7C5CFC] text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">E-mails</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* ABA 1: TESOURARIA & PREMIAÇÕES 100% (SEM TAXA DA CASA)            */}
        {/* ================================================================= */}
        {activeTab === 'treasury' && (
          <div className="space-y-4">
            {/* Card Resumo 100% Repasse */}
            <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#229a3e] text-[10px] font-extrabold uppercase">
                    ZERO Taxa Operacional • 100% Convertido em Premiação
                  </span>
                  <h2 className="text-base font-extrabold mt-1">
                    Balanço Oficial de Inscrições & Premiações
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {teams.length} equipes × R$ {entryFee.toFixed(2).replace('.', ',')} ={' '}
                    <strong>R$ {totalCollectedPool.toFixed(2).replace('.', ',')}</strong>{' '}
                    integralmente distribuídos aos vencedores.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#38C958]/10 border border-[#38C958]/30 text-right shrink-0">
                  <span className="text-[10px] font-extrabold uppercase text-[#229a3e] block">
                    Bolsa de Premiação (100%)
                  </span>
                  <span className="text-xl font-black text-[#229a3e] dark:text-[#38C958]">
                    R$ {totalDistributedPrizes.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    Taxa da Liga: R$ 0,00 (0%)
                  </span>
                </div>
              </div>

              {/* Cards Visuais de Premiação com Ícones Reais de public/assets/awards/ */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  {
                    label: '1º Lugar (Campeão)',
                    val: prizeFirst,
                    setter: setPrizeFirst,
                    icon: '/assets/awards/1st-place.png',
                  },
                  {
                    label: '2º Lugar (Vice)',
                    val: prizeSecond,
                    setter: setPrizeSecond,
                    icon: '/assets/awards/2nd-place.png',
                  },
                  {
                    label: '3º Lugar (Bronze)',
                    val: prizeThird,
                    setter: setPrizeThird,
                    icon: '/assets/awards/3rd-place.png',
                  },
                  {
                    label: 'Artilheiro',
                    val: prizeScorer,
                    setter: setPrizeScorer,
                    icon: '/assets/awards/golden-boot.png',
                  },
                  {
                    label: 'Garçom (Assists)',
                    val: prizeAssister,
                    setter: setPrizeAssister,
                    icon: '/assets/awards/playmaker-trophy.png',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-800 text-center space-y-1.5"
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-10 h-10 mx-auto object-contain"
                    />
                    <span className="text-[10px] font-extrabold text-zinc-500 block leading-tight">
                      {item.label}
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-bold text-zinc-400">R$</span>
                      <input
                        type="number"
                        value={item.val}
                        onChange={(e) => item.setter(Number(e.target.value))}
                        className="w-16 h-7 text-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-black text-xs text-[#7C5CFC]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Lista de Equipes Inscritas e Liberação Mediante Pagamento Integral do Capitão */}
            <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
              <div>
                <h3 className="text-base font-extrabold">
                  Liberação de Equipes (Pagamento Integral do Capitão)
                </h3>
                <p className="text-xs text-zinc-500">
                  Cada capitão reúne as cotas do seu elenco e envia o comprovante integral de R${' '}
                  {entryFee.toFixed(2).replace('.', ',')} abaixo.
                </p>
              </div>

              <div className="space-y-2.5">
                {registrations.map((reg) => {
                  const teamObj = teams.find((t) => t.id === reg.team_id);
                  const isApproved = reg.payment_status === 'approved';
                  const isPaidByCap = reg.payment_status === 'paid_by_captain';

                  return (
                    <div
                      key={reg.id}
                      className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
                          style={{ backgroundColor: teamObj?.primary_color || '#7C5CFC' }}
                        >
                          {(teamObj?.name || 'FC').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white">
                              {teamObj?.name || 'Clube'}
                            </span>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                                isApproved && 'bg-[#38C958]/15 text-[#229a3e]',
                                isPaidByCap && 'bg-[#7C5CFC]/15 text-[#7C5CFC]',
                                !isApproved && !isPaidByCap && 'bg-amber-500/15 text-amber-600'
                              )}
                            >
                              {isApproved
                                ? '✅ Liberada Oficialmente'
                                : isPaidByCap
                                ? '📤 Comprovante Enviado pelo Capitão'
                                : '⏳ Pendente Cota Integral'}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 block">
                            Valor Integral: R$ {Number(reg.total_fee).toFixed(2).replace('.', ',')} •{' '}
                            {reg.notes}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isApproved ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleConfirmAndReleaseTeam(
                                reg.id,
                                reg.team_id,
                                teamObj?.name || 'Equipe'
                              )
                            }
                            className="py-2.5 px-3.5 rounded-xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>✅ Confirmar Recebimento Integral & Liberar Equipe</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-[#38C958] font-extrabold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Equipe Liberada
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 2: CRIADOR DINÂMICO DE CAMPEONATOS & CALCULADORA CHAVEAMENTO  */}
        {/* ================================================================= */}
        {activeTab === 'builder_brackets' && (
          <div className="space-y-4">
            <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                  Qualquer Formato (3v3, 4v4, 5v5, 7v7, 11v11)
                </span>
                <h2 className="text-base font-extrabold">
                  Criador Dinâmico de Campeonatos & Regras Livres
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                    Nome do Campeonato
                  </label>
                  <input
                    type="text"
                    value={champName}
                    onChange={(e) => setChampName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                    Modalidade em Campo
                  </label>
                  <select
                    value={gameMode}
                    onChange={(e) => {
                      const mode = e.target.value;
                      setGameMode(mode);
                      const num = parseInt(mode.split('v')[0], 10);
                      if (!isNaN(num)) setStartersCount(num);
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                  >
                    <option value="3v3">3v3 (Arena Rápida)</option>
                    <option value="4v4">4v4 (Futebol Compacto)</option>
                    <option value="5v5">5v5 (Liga LPF Rush / Clubs)</option>
                    <option value="7v7">7v7 (Society Pro)</option>
                    <option value="11v11">11v11 (Pro Clubs Oficial)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                    Titulares em Campo
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={11}
                    value={startersCount}
                    onChange={(e) => setStartersCount(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                    Reservas Permitidos
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={reservesCount}
                    onChange={(e) => setReservesCount(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                    Nº de Equipes ($N$)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={64}
                    value={teamCountInput}
                    onChange={(e) => setTeamCountInput(Math.max(2, Number(e.target.value)))}
                    className="w-full h-9 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-black text-[#7C5CFC]"
                  />
                </div>
              </div>

              {/* CALCULADORA AUTOMÁTICA DE CHAVEAMENTO */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-extrabold text-[#7C5CFC] block">
                  Calculadora Automática de Chaveamento para {teamCountInput} Equipes:
                </span>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  {bracketSuggestions.map((opt) => {
                    const isSelected = selectedBracketType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedBracketType(opt.id)}
                        className={cn(
                          'p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2',
                          isSelected
                            ? 'border-[#7C5CFC] bg-[#7C5CFC]/10 shadow-xs'
                            : 'border-zinc-100 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/50'
                        )}
                      >
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#38C958]/15 text-[#229a3e] text-[9px] font-extrabold">
                            {opt.recommendedFor}
                          </span>
                          <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">
                            {opt.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 leading-snug">
                            {opt.summary}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-[#7C5CFC]">
                          📊 Estimativa: {opt.estimatedMatches} jogos totais
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Construtor Dinâmico de Regras Personalizadas Ilimitadas */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-extrabold block">
                  Regras Oficiais do Campeonato ({customRules.length} regras ativas)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    placeholder="Digite uma nova regra personalizada..."
                    className="flex-1 h-9 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRule}
                    className="px-3.5 h-9 rounded-xl bg-[#7C5CFC] text-white text-xs font-extrabold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Regra
                  </button>
                </div>

                <div className="space-y-1.5">
                  {customRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-semibold">
                        {idx + 1}. {rule}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomRule(idx)}
                        className="text-rose-500 hover:text-rose-600 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveChampionshipConfig}
                className="w-full py-3.5 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salvar Formato, Chaveamento & Regulamento
              </button>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 3: AUDITORIA DE FOTOS DE PERSONAGENS & PRINTS DE PARTIDA      */}
        {/* ================================================================= */}
        {activeTab === 'media_audit' && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div>
              <h2 className="text-base font-extrabold">
                Auditoria de Mídia do Admin (Supabase Storage)
              </h2>
              <p className="text-xs text-zinc-500">
                Visualize todas as fotos de rosto/corpo enviadas pelos jogadores e os prints de desempenho das partidas.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#7C5CFC] block">
                Prints de Súmula / Desempenho Enviados nas Partidas:
              </span>
              <div className="grid sm:grid-cols-2 gap-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span>
                        {m.home_team?.name} {m.home_score} - {m.away_score} {m.away_team?.name}
                      </span>
                      <span className="text-[10px] text-[#38C958]"> Rodada #{m.round_number}</span>
                    </div>
                    {m.proof_image_url && (
                      <img
                        src={m.proof_image_url}
                        alt="Print da Partida"
                        className="w-full h-32 object-cover rounded-xl bg-zinc-900"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-extrabold text-[#38C958] block">
                Fotos de Rosto & Corpo dos Atletas (+40 Jogadores):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto">
                {players.slice(0, 16).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-center space-y-1"
                  >
                    <img
                      src={p.avatar_face_url || '/assets/fc-26-clean-card-designs/default/gold-rare.webp'}
                      alt={p.character_name}
                      className="w-12 h-12 mx-auto rounded-xl object-cover"
                    />
                    <span className="text-xs font-black uppercase block truncate">
                      {p.character_name}
                    </span>
                    <span className="text-[10px] text-zinc-500 block truncate">
                      {p.full_name} • {p.primary_position}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* ABA 4: CENTRAL DE DISPARO DE E-MAILS & NOTIFICAÇÕES               */}
        {/* ================================================================= */}
        {activeTab === 'email_center' && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div>
              <h2 className="text-base font-extrabold">
                📧 Disparar E-mails & Notificações Oficiais
              </h2>
              <p className="text-xs text-zinc-500">
                Envie alertas transacionais para os capitães e atletas cadastrados na liga.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Gatilho / Modelo de E-mail
                </label>
                <select
                  value={emailEventType}
                  onChange={(e) => setEmailEventType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                >
                  <option value="registration_approved">
                    🏆 Inscrição Integral Confirmada & Equipe Liberada
                  </option>
                  <option value="match_scheduled">
                    📅 Match de Horário Confirmado (Partida Agendada)
                  </option>
                  <option value="sumula_pending">
                    📸 Súmula Lançada por IA (Aguardando Capitão B)
                  </option>
                  <option value="draft_order_drawn">
                    🎲 Sorteio da Ordem do Draft Concluído
                  </option>
                  <option value="custom_broadcast">
                    📢 Comunicado Geral da Organização
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Destinatários (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={emailRecipientsText}
                  onChange={(e) => setEmailRecipientsText(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                Mensagem Personalizada
              </label>
              <textarea
                rows={3}
                value={emailCustomMessage}
                onChange={(e) => setEmailCustomMessage(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
              />
            </div>

            <button
              type="button"
              onClick={handleSendEmails}
              disabled={emailSending}
              className="w-full py-3.5 rounded-2xl bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Mail className="w-4 h-4" />
              <span>
                {emailSending
                  ? 'Disparando E-mails...'
                  : '📧 Disparar Notificação por E-mail Agora'}
              </span>
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
