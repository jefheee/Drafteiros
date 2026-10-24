'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeagueStore } from '@/lib/data-store';
import { calculateBracketOptions, calculateFC26MacroAndOvr } from '@/lib/accelerate';
import { TEMPLATE_ASSETS } from '@/lib/assets-catalog';
import { BracketType } from '@/types/database';
import { WorkspaceNav } from '@/components/layout/workspace-nav';
import { FC26PlayerCard } from '@/components/players/fc26-player-card';
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
  ShieldCheck,
  History,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    tournament,
    tournaments,
    selectTournament,
    createNewTournament,
    teams,
    players,
    matches,
    registrations,
    updateTournamentInStore,
    approveTeamRegistration,
    addLegacyCareerStats,
  } = useLeagueStore();

  const [activeTab, setActiveTab] = useState<
    'treasury' | 'legacy_stats' | 'builder_brackets' | 'media_audit' | 'email_center'
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

  const handleConfirmAndReleaseTeam = async (
    regId: string,
    teamId: string,
    teamName: string
  ) => {
    await approveTeamRegistration(regId, teamId);

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
  // ESTADO ABA 2: HISTÓRICO ANTIGO & AJUSTE DE CARREIRA (LEGACY STATS)
  // =========================================================================
  const [legacyPlayerId, setLegacyPlayerId] = useState<string>(players[0]?.id || '');
  const [legacyMatches, setLegacyMatches] = useState<number>(10);
  const [legacyGoals, setLegacyGoals] = useState<number>(12);
  const [legacyAssists, setLegacyAssists] = useState<number>(6);
  const [legacyMotm, setLegacyMotm] = useState<number>(3);
  const [legacyTitles, setLegacyTitles] = useState<number>(1);
  const [legacyNotes, setLegacyNotes] = useState<string>(
    '1ª Copa Palhoça 5x5 + Temporada Histórica Pro Clubs'
  );

  const selectedLegacyPlayer = useMemo(
    () => players.find((p) => p.id === legacyPlayerId) || players[0],
    [players, legacyPlayerId]
  );

  const selectedLegacyTeam = useMemo(
    () => teams.find((t) => t.id === selectedLegacyPlayer?.team_id) || teams[0],
    [teams, selectedLegacyPlayer?.team_id]
  );

  const currentLegacyMacro = useMemo(() => {
    if (!selectedLegacyPlayer) return null;
    return calculateFC26MacroAndOvr({
      attributes: selectedLegacyPlayer.attributes || {},
      position: selectedLegacyPlayer.primary_position || 'ATA',
      careerStats: selectedLegacyPlayer.career_stats,
    });
  }, [selectedLegacyPlayer]);

  const handleApplyLegacyStats = async () => {
    if (!selectedLegacyPlayer) return;
    await addLegacyCareerStats(selectedLegacyPlayer.id, {
      matchesToAdd: legacyMatches,
      goalsToAdd: legacyGoals,
      assistsToAdd: legacyAssists,
      motmToAdd: legacyMotm,
      titlesToAdd: legacyTitles,
    });
    setFeedbackBanner(
      `🏛️ Histórico Antigo creditado para "${selectedLegacyPlayer.character_name}" (+${legacyGoals} gols, +${legacyAssists} assists, +${legacyTitles} títulos)! OVR da Carta FC 26 atualizado automaticamente.`
    );
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  // =========================================================================
  // ESTADO ABA 3: CRIADOR DINÂMICO DE CAMPEONATOS & CALCULADORA CHAVEAMENTO
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

  // Novo campeonato histórico / ativo
  const [newTourneyName, setNewTourneyName] = useState('');
  const [newTourneySeason, setNewTourneySeason] = useState('Temporada 2026 • 5x5');
  const [newTourneyFinished, setNewTourneyFinished] = useState(false);
  const [newTourneyChampion, setNewTourneyChampion] = useState('Furia del Plata');

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

  const handleCreateNewTournament = async () => {
    if (!newTourneyName.trim()) return;
    await createNewTournament({
      name: newTourneyName.trim(),
      season_label: newTourneySeason,
      game_mode: gameMode,
      status: newTourneyFinished ? 'finished' : 'active',
      champion_team_name: newTourneyFinished ? newTourneyChampion : undefined,
      entry_fee: entryFee,
    });
    setNewTourneyName('');
    setFeedbackBanner(
      `🏆 Campeonato "${newTourneyName}" criado e adicionado ao Seletor Global de Temporadas!`
    );
    setTimeout(() => setFeedbackBanner(null), 4500);
  };

  // =========================================================================
  // ESTADO ABA 5: DISPARADOR DE E-MAILS & NOTIFICAÇÕES
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
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] px-3 sm:px-6 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* SUB-NAVEGAÇÃO RÁPIDA DO PILAR 5 (MEU ESPAÇO) */}
        <WorkspaceNav />

        {/* CABEÇALHO DO ADMIN DA LIGA */}
        <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/assets/awards/1st-place.png"
                alt="Admin Liga"
                className="w-13 h-13 object-contain drop-shadow-lg shrink-0"
              />
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                  Painel Master Admin • 100% Premiação & Legacy Stats
                </span>
                <h1 className="text-xl sm:text-2xl font-display font-black text-white">
                  ERP da Liga, Histórico Antigo de Carreira & Campeonatos
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Liberação de equipes mediante pagamento integral, ajuste de estatísticas antigas (evolução de OVR FC 26) e chaveamento automático.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/rankings"
                className="py-2.5 px-4 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Trophy className="w-4 h-4" />
                <span>Ver Tabela & G4</span>
              </Link>
              <Link
                href="/draft-board"
                className="py-2.5 px-4 rounded-2xl bg-[#00E599] text-[#090A0F] hover:bg-[#6b4be8] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Users className="w-4 h-4" />
                <span>Sala de Draft (+40)</span>
              </Link>
            </div>
          </div>

          {feedbackBanner && (
            <div className="p-3.5 rounded-2xl bg-[#38C958]/15 border border-[#38C958]/40 text-[#38C958] text-xs font-extrabold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackBanner}</span>
            </div>
          )}
        </section>

        {/* NAVEGAÇÃO DE ABAS DO ADMIN (5 ABAS INCLUINDO LEGACY STATS) */}
        <div className="p-1.5 rounded-2xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-xs grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('treasury')}
            className={cn(
              'py-2.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'treasury'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tesouraria 100%</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('legacy_stats')}
            className={cn(
              'py-2.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'legacy_stats'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <History className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate">🏛️ Legacy Stats</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('builder_brackets')}
            className={cn(
              'py-2.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'builder_brackets'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Campeonatos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media_audit')}
            className={cn(
              'py-2.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'media_audit'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Prints & Fotos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email_center')}
            className={cn(
              'py-2.5 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'email_center'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
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
            <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#38C958] text-[10px] font-extrabold uppercase">
                    ZERO Taxa Operacional • 100% Convertido em Premiação
                  </span>
                  <h2 className="text-base font-display font-extrabold mt-1">
                    Balanço Oficial de Inscrições & Premiações
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {teams.length} equipes × R$ {entryFee.toFixed(2).replace('.', ',')} ={' '}
                    <strong>R$ {totalCollectedPool.toFixed(2).replace('.', ',')}</strong>{' '}
                    integralmente distribuídos aos vencedores.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#38C958]/10 border border-[#38C958]/30 text-right shrink-0">
                  <span className="text-[10px] font-extrabold uppercase text-[#38C958] block">
                    Bolsa de Premiação (100%)
                  </span>
                  <span className="text-xl font-mono font-black text-[#38C958]">
                    R$ {totalDistributedPrizes.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
                    Taxa da Liga: R$ 0,00 (0%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                    icon: '/assets/awards/playmaker.png',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.06] text-center space-y-2"
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-12 h-12 mx-auto object-contain drop-shadow-md"
                    />
                    <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 block leading-tight">
                      {item.label}
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-bold text-zinc-400">R$</span>
                      <input
                        type="number"
                        value={item.val}
                        onChange={(e) => item.setter(Number(e.target.value))}
                        className="w-16 h-7 text-center rounded-lg bg-[#0D0F17] border border-zinc-200 dark:border-white/10 font-mono font-black text-xs text-[#00E599]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Liberação de Equipes */}
            <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-3.5">
              <div>
                <h3 className="text-base font-display font-extrabold">
                  Liberação de Equipes (Pagamento Integral do Capitão)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={teamObj?.logo_url || TEMPLATE_ASSETS.crestPlaceholder}
                          alt={teamObj?.name || 'Clube'}
                          className="w-10 h-10 object-contain drop-shadow-md shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-display font-extrabold text-white">
                              {teamObj?.name || 'Clube'}
                            </span>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                                isApproved && 'bg-[#38C958]/15 text-[#38C958]',
                                isPaidByCap && 'bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599]',
                                !isApproved && !isPaidByCap && 'bg-amber-500/15 text-amber-400'
                              )}
                            >
                              {isApproved
                                ? '✅ Liberada Oficialmente'
                                : isPaidByCap
                                ? '📤 Comprovante Enviado pelo Capitão'
                                : '⏳ Pendente Cota Integral'}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
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
                            <span>✅ Confirmar Recebimento & Liberar</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-[#0D0F17] text-[#38C958] font-extrabold text-xs flex items-center gap-1">
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
        {/* ABA 2: 🏛️ HISTÓRICO ANTIGO & AJUSTE DE CARREIRA (LEGACY STATS)    */}
        {/* ================================================================= */}
        {activeTab === 'legacy_stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <section className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                  Evolução de Carreira & Desbloqueio de Cartas FC 26
                </span>
                <h2 className="text-lg font-display font-black text-white mt-1">
                  🏛️ Lançar Histórico Antigo de Campeonatos Passados
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Credite partidas, gols, assistências, MVPs e títulos de ligas anteriores na ficha oficial de qualquer jogador. Isso aumenta o OVR de Carreira e libera cartas raras (TOTY, Icon, Heroes) imediatamente!
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase text-[#00E599] block">
                  Selecionar Jogador da Liga (+40 Atletas)
                </label>
                <select
                  value={legacyPlayerId}
                  onChange={(e) => setLegacyPlayerId(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                >
                  {players.map((p) => {
                    const pTeam = teams.find((t) => t.id === p.team_id);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.character_name} ({p.full_name || 'Atleta'} • {p.primary_position} •{' '}
                        {pTeam?.name || 'Free Agent'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Métricas a Somar no Histórico do Atleta */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-zinc-400 block">
                    + Partidas
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={legacyMatches}
                    onChange={(e) => setLegacyMatches(Math.max(0, Number(e.target.value)))}
                    className="w-full h-9 text-center rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 font-mono font-black text-sm text-white"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-[#38C958] block">
                    + Gols ⚽
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={legacyGoals}
                    onChange={(e) => setLegacyGoals(Math.max(0, Number(e.target.value)))}
                    className="w-full h-9 text-center rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 font-mono font-black text-sm text-[#38C958]"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-[#00E599] block">
                    + Assists 👟
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={legacyAssists}
                    onChange={(e) => setLegacyAssists(Math.max(0, Number(e.target.value)))}
                    className="w-full h-9 text-center rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 font-mono font-black text-sm text-[#00E599]"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 block">
                    + MVPs ⭐
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={legacyMotm}
                    onChange={(e) => setLegacyMotm(Math.max(0, Number(e.target.value)))}
                    className="w-full h-9 text-center rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 font-mono font-black text-sm text-amber-400"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/10 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-amber-500 block">
                    + Títulos 🏆
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={legacyTitles}
                    onChange={(e) => setLegacyTitles(Math.max(0, Number(e.target.value)))}
                    className="w-full h-9 text-center rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 font-mono font-black text-sm text-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Referência Histórica / Temporada Origem
                </label>
                <input
                  type="text"
                  value={legacyNotes}
                  onChange={(e) => setLegacyNotes(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-semibold"
                />
              </div>

              {/* Resumo Atual do Atleta */}
              {selectedLegacyPlayer && (
                <div className="p-4 rounded-2xl bg-white/[0.03]/70 border border-zinc-200/60 dark:border-white/[0.06] grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block">Jogos Atuais</span>
                    <span className="font-mono font-black text-sm">
                      {selectedLegacyPlayer.career_stats?.matches_played ??
                        selectedLegacyPlayer.career_stats?.official_matches ??
                        0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block">Gols Atuais</span>
                    <span className="font-mono font-black text-sm text-[#38C958]">
                      {selectedLegacyPlayer.career_stats?.goals ??
                        selectedLegacyPlayer.career_stats?.official_goals ??
                        0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block">Assists Atuais</span>
                    <span className="font-mono font-black text-sm text-[#00E599]">
                      {selectedLegacyPlayer.career_stats?.assists ??
                        selectedLegacyPlayer.career_stats?.official_assists ??
                        0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block">Títulos Atuais</span>
                    <span className="font-mono font-black text-sm text-amber-400">
                      {selectedLegacyPlayer.career_stats?.titles_won ?? 0}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleApplyLegacyStats}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#059669] hover:opacity-95 text-white font-display font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00E599]/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  Creditar Histórico Antigo & Evoluir Carta FC 26 de{' '}
                  {selectedLegacyPlayer?.character_name}
                </span>
              </button>
            </section>

            {/* PREVIEW AO VIVO DA CARTA FC 26 DO ATLETA SELECIONADO */}
            <aside className="lg:col-span-5 p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-xl flex flex-col items-center space-y-3">
              <div className="w-full flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38C958] block">
                    Impacto Direto na Carta FC 26
                  </span>
                  <h3 className="text-sm font-display font-black text-white">
                    {selectedLegacyPlayer?.character_name} • OVR {currentLegacyMacro?.finalOvr}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-mono text-[11px] font-extrabold">
                  +{currentLegacyMacro?.careerBonus || 0} Bônus Carreira
                </span>
              </div>

              {selectedLegacyPlayer && (
                <FC26PlayerCard
                  player={selectedLegacyPlayer}
                  team={selectedLegacyTeam}
                  size="md"
                  showActions={true}
                />
              )}
            </aside>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 3: CRIADOR DE CAMPEONATOS (ATIVOS & HISTÓRICOS) & CHAVEAMENTO */}
        {/* ================================================================= */}
        {activeTab === 'builder_brackets' && (
          <div className="space-y-5">
            {/* GESTÃO DE MÚLTIPLOS CAMPEONATOS (ATIVO & ENCERRADOS) */}
            <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38C958] block">
                    Múltiplas Temporadas & Histórico da Liga
                  </span>
                  <h2 className="text-base font-display font-extrabold text-white">
                    Campeonatos Cadastrados ({tournaments.length})
                  </h2>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {tournaments.map((t) => {
                  const isCurrent = tournament?.id === t.id;
                  const isFinished = t.status === 'finished';
                  return (
                    <div
                      key={t.id}
                      onClick={() => selectTournament(t.id)}
                      className={cn(
                        'cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between gap-3',
                        isCurrent
                          ? 'border-[#00E599] bg-[#00E599]/15 border border-[#00E599]/30'
                          : 'border-zinc-200/70 dark:border-white/10 bg-white/[0.03]'
                      )}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[9px] font-black uppercase',
                              isFinished
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-[#38C958]/20 text-[#38C958]'
                            )}
                          >
                            {isFinished ? 'Encerrado' : 'Em Andamento'}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {t.game_mode || '5v5'}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-display font-black truncate">
                          {t.name}
                        </h3>
                        {t.champion_team_name && (
                          <p className="text-[11px] text-amber-400 font-bold">
                            🏆 Campeão: {t.champion_team_name}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] font-extrabold text-[#00E599] shrink-0">
                        {isCurrent ? 'Selecionado' : 'Selecionar'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Criar Novo Campeonato ou Registrar Edição Passada */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-zinc-200/70 dark:border-white/10 space-y-3">
                <span className="text-xs font-extrabold text-[#00E599] block">
                  + Criar Novo Campeonato ou Cadastrar Edição Passada no Histórico
                </span>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newTourneyName}
                    onChange={(e) => setNewTourneyName(e.target.value)}
                    placeholder="Nome (Ex: 2ª Copa Sul-Americana 5x5)"
                    className="h-9 px-3 rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={newTourneySeason}
                    onChange={(e) => setNewTourneySeason(e.target.value)}
                    placeholder="Rótulo Curto (Ex: Copa Sul 5x5)"
                    className="h-9 px-3 rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewTournament}
                    className="h-9 px-4 rounded-xl bg-[#38C958] hover:bg-[#2fb34d] text-white text-xs font-extrabold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Campeonato
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={newTourneyFinished}
                      onChange={(e) => setNewTourneyFinished(e.target.checked)}
                      className="rounded accent-[#00E599]"
                    />
                    Cadastrar como Campeonato Encerrado (Histórico)
                  </label>
                  {newTourneyFinished && (
                    <input
                      type="text"
                      value={newTourneyChampion}
                      onChange={(e) => setNewTourneyChampion(e.target.value)}
                      placeholder="Clube Campeão"
                      className="h-8 px-2.5 rounded-lg bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-bold"
                    />
                  )}
                </div>
              </div>
            </section>

            {/* CONFIGURAÇÃO DE FORMATO E CHAVEAMENTO */}
            <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00E599] block">
                  Qualquer Formato (3v3, 4v4, 5v5, 7v7, 11v11)
                </span>
                <h2 className="text-base font-display font-extrabold">
                  Configurar Formato & Calculadora de Chaveamento
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                    Nome do Campeonato Selecionado
                  </label>
                  <input
                    type="text"
                    value={champName}
                    onChange={(e) => setChampName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
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
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
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
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-black"
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
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                    Nº de Equipes (N)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={64}
                    value={teamCountInput}
                    onChange={(e) => setTeamCountInput(Math.max(2, Number(e.target.value)))}
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-black text-[#00E599]"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
                <span className="text-xs font-extrabold text-[#00E599] block">
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
                            ? 'border-[#00E599] bg-[#00E599]/15 border border-[#00E599]/30 shadow-xs'
                            : 'border-transparent bg-white/[0.03]/60'
                        )}
                      >
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#38C958]/15 text-[#38C958] text-[9px] font-extrabold">
                            {opt.recommendedFor}
                          </span>
                          <h4 className="text-xs font-extrabold text-white">
                            {opt.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                            {opt.summary}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-[#00E599]">
                          📊 Estimativa: {opt.estimatedMatches} jogos totais
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
                <span className="text-xs font-extrabold block">
                  Regras Oficiais do Campeonato ({customRules.length} regras ativas)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    placeholder="Digite uma nova regra personalizada..."
                    className="flex-1 h-9 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRule}
                    className="px-3.5 h-9 rounded-xl bg-[#00E599] text-[#090A0F] font-black text-xs font-extrabold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Regra
                  </button>
                </div>

                <div className="space-y-1.5">
                  {customRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] flex items-center justify-between gap-2 text-xs"
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
        {/* ABA 4: AUDITORIA DE FOTOS DE PERSONAGENS & PRINTS DE PARTIDA      */}
        {/* ================================================================= */}
        {activeTab === 'media_audit' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-display font-extrabold">
                Auditoria de Mídia do Admin (Supabase Storage)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Visualize todas as fotos de rosto/corpo enviadas pelos jogadores e os prints de desempenho das partidas.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#00E599] block">
                Prints de Súmula / Desempenho Enviados nas Partidas:
              </span>
              <div className="grid sm:grid-cols-2 gap-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span>
                        {m.home_team?.name} {m.home_score} - {m.away_score} {m.away_team?.name}
                      </span>
                      <span className="text-[10px] text-[#38C958]">Rodada #{m.round_number}</span>
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

            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
              <span className="text-xs font-extrabold text-[#38C958] block">
                Fotos de Rosto & Corpo dos Atletas (+40 Jogadores):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto">
                {players.slice(0, 18).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/10 text-center space-y-1"
                  >
                    <img
                      src={p.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                      alt={p.character_name}
                      className="w-12 h-12 mx-auto rounded-xl object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          TEMPLATE_ASSETS.avatarPlaceholder;
                      }}
                    />
                    <span className="text-xs font-black uppercase block truncate">
                      {p.character_name}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                      {p.full_name} • {p.primary_position}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* ABA 5: CENTRAL DE DISPARO DE E-MAILS & NOTIFICAÇÕES               */}
        {/* ================================================================= */}
        {activeTab === 'email_center' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-display font-extrabold">
                📧 Disparar E-mails & Notificações Oficiais
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
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
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-semibold"
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
                className="w-full p-3 rounded-2xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-semibold"
              />
            </div>

            <button
              type="button"
              onClick={handleSendEmails}
              disabled={emailSending}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#059669] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
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
