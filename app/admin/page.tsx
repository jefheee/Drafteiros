'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Tournament,
  PlayerProfile,
  Match,
  TournamentStanding,
  TournamentPhase,
  Team,
  TournamentFinance,
  MatchIncident,
  TopScorer,
  TopAssist,
} from '@/types/database';
import {
  FALLBACK_TOURNAMENT,
  FALLBACK_TEAMS,
  FALLBACK_MATCHES,
  FALLBACK_STANDINGS,
  FALLBACK_SCORERS,
  FALLBACK_ASSISTS,
  FALLBACK_FINANCES,
  FALLBACK_INCIDENTS,
  FALLBACK_PLAYERS,
} from '@/lib/mock-league-data';
import { BackButton } from '@/components/ui/back-button';
import {
  Plus,
  Users,
  Trophy,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  KeyRound,
  SlidersHorizontal,
  GitFork,
  ExternalLink,
  DollarSign,
  Gavel,
  Award,
  Flame,
} from 'lucide-react';
import {
  getPositionBadgeClass,
  cn,
} from '@/lib/utils';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'erp' | 'audit' | 'phases' | 'captains' | 'rules' | 'athletes'
  >('erp');

  const [tournaments, setTournaments] = useState<Tournament[]>([FALLBACK_TOURNAMENT]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    FALLBACK_TOURNAMENT.id
  );
  const [teams, setTeams] = useState<Team[]>(FALLBACK_TEAMS);
  const [phases, setPhases] = useState<TournamentPhase[]>([
    {
      id: 'ph-1',
      tournament_id: FALLBACK_TOURNAMENT.id,
      name: 'Fase de Classificação (Pontos Corridos)',
      phase_type: 'groups',
      order_num: 1,
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ph-2',
      tournament_id: FALLBACK_TOURNAMENT.id,
      name: 'Semifinais (Top 4 G4)',
      phase_type: 'knockout',
      order_num: 2,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ]);
  const [matches, setMatches] = useState<Match[]>(FALLBACK_MATCHES);
  const [standings, setStandings] = useState<TournamentStanding[]>(FALLBACK_STANDINGS);
  const [scorers, setScorers] = useState<TopScorer[]>(FALLBACK_SCORERS);
  const [assists, setAssists] = useState<TopAssist[]>(FALLBACK_ASSISTS);
  const [finances, setFinances] = useState<TournamentFinance[]>(FALLBACK_FINANCES);
  const [incidents, setIncidents] = useState<MatchIncident[]>(FALLBACK_INCIDENTS);
  const [allProfiles, setAllProfiles] = useState<PlayerProfile[]>(FALLBACK_PLAYERS);

  const [saving, setSaving] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [inspectingMatch, setInspectingMatch] = useState<Match | null>(null);

  // Valores de Inscrição e Premiação Configuráveis (ERP)
  const [entryFee] = useState<number>(70);
  const [prizeFirst] = useState<number>(300);
  const [prizeSecond] = useState<number>(120);
  const [prizeThird] = useState<number>(80);
  const [prizeScorer] = useState<number>(30);
  const [prizeAssister] = useState<number>(30);

  // Formulários adicionais
  const [newTournName, setNewTournName] = useState('');
  const [newTournFormat, setNewTournFormat] = useState('5v5');
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseType, setNewPhaseType] = useState<'groups' | 'knockout'>('knockout');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPositions, setNewPlayerPositions] = useState('VOL, MEI');
  const [selectedTeamForAuth, setSelectedTeamForAuth] = useState<string>(FALLBACK_TEAMS[0].id);
  const [captainEmail, setCaptainEmail] = useState('');
  const [captainPassword, setCaptainPassword] = useState('');
  const [generatedCredentialMsg, setGeneratedCredentialMsg] = useState<{
    email: string;
    pass: string;
    team: string;
  } | null>(null);

  useEffect(() => {
    loadSupabaseData();
  }, []);

  async function loadSupabaseData() {
    try {
      const { data: tData } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      if (tData && tData.length > 0) {
        setTournaments(tData);
        setSelectedTournamentId(tData[0].id);
      }

      const { data: teamsData } = await supabase.from('teams').select('*');
      if (teamsData && teamsData.length > 0) setTeams(teamsData);

      const { data: matchesData } = await supabase
        .from('matches')
        .select(`*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)`)
        .order('created_at', { ascending: false });
      if (matchesData && matchesData.length > 0) setMatches(matchesData as any);

      const { data: stData } = await supabase
        .from('vw_tournament_standings')
        .select('*')
        .order('position', { ascending: true });
      if (stData && stData.length > 0) setStandings(stData);

      const { data: finData } = await supabase
        .from('tournament_finances')
        .select('*, team:teams(*)');
      if (finData && finData.length > 0) setFinances(finData as any);

      const { data: incData } = await supabase
        .from('match_incidents')
        .select('*')
        .order('created_at', { ascending: false });
      if (incData && incData.length > 0) setIncidents(incData as any);
    } catch {
      // mantém fallback completo
    }
  }

  // Métricas Financeiras ERP
  const erpMetrics = useMemo(() => {
    const totalTeams = teams.length;
    const paidCount = finances.filter((f) => f.entry_fee_paid).length;
    const totalExpected = totalTeams * entryFee;
    const totalCollected = paidCount * entryFee;
    const totalPrizes = prizeFirst + prizeSecond + prizeThird + prizeScorer + prizeAssister;
    const operationalBalance = totalExpected - totalPrizes;

    return {
      totalTeams,
      paidCount,
      totalExpected,
      totalCollected,
      totalPrizes,
      operationalBalance,
    };
  }, [teams.length, finances, entryFee, prizeFirst, prizeSecond, prizeThird, prizeScorer, prizeAssister]);

  const handleToggleTeamFeePaid = async (financeItem: TournamentFinance) => {
    const nextPaid = !financeItem.entry_fee_paid;
    const nextPaidAt = nextPaid ? new Date().toISOString() : null;

    setFinances((prev) =>
      prev.map((f) =>
        f.team_id === financeItem.team_id
          ? {
              ...f,
              entry_fee_paid: nextPaid,
              paid_at: nextPaidAt,
              notes: nextPaid ? 'PIX confirmado pelo Admin' : 'Pendente de envio do PIX',
            }
          : f
      )
    );

    try {
      await supabase.from('tournament_finances').upsert(
        {
          tournament_id: selectedTournamentId,
          team_id: financeItem.team_id,
          entry_fee_paid: nextPaid,
          paid_at: nextPaidAt,
        },
        { onConflict: 'tournament_id,team_id' }
      );
    } catch {
      // fallback local
    }

    setNotice({
      type: 'success',
      text: `Status financeiro de "${financeItem.team?.name}" atualizado para ${
        nextPaid ? 'PAGO ✅' : 'PENDENTE ⏳'
      }!`,
    });
  };

  const handleAdminForceMatchStatus = async (
    matchId: string,
    status: 'completed' | 'wo' | 'rejected'
  ) => {
    setSaving(true);
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status,
              home_score: status === 'wo' ? 3 : m.home_score,
              away_score: status === 'wo' ? 0 : m.away_score,
              reviewed_at: new Date().toISOString(),
            }
          : m
      )
    );

    try {
      await supabase
        .from('matches')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', matchId);
    } catch {
      // fallback local
    } finally {
      setSaving(false);
      setInspectingMatch(null);
      setNotice({
        type: 'success',
        text:
          status === 'completed'
            ? 'Súmula homologada pela Administração! Pontos e artilharia atualizados.'
            : status === 'wo'
            ? 'W.O. Oficial (3 x 0) aplicado na partida!'
            : 'Súmula rejeitada pela auditoria.',
      });
    }
  };

  const handleResolveIncident = async (
    incId: string,
    newStatus: 'resolved' | 'rejected',
    resolutionNote: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incId
          ? { ...inc, status: newStatus, admin_resolution_notes: resolutionNote }
          : inc
      )
    );

    try {
      await supabase
        .from('match_incidents')
        .update({ status: newStatus, admin_resolution_notes: resolutionNote })
        .eq('id', incId);
    } catch {
      // fallback local
    }

    setNotice({
      type: 'success',
      text: `Chamado #${incId.substring(0, 6)} julgado como ${
        newStatus === 'resolved' ? 'DEFERIDO (Resolvido)' : 'INDEFERIDO'
      }!`,
    });
  };

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseName.trim()) return;
    const newPh: TournamentPhase = {
      id: `ph-${Date.now()}`,
      tournament_id: selectedTournamentId,
      name: newPhaseName.trim(),
      phase_type: newPhaseType,
      order_num: phases.length + 1,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    setPhases((prev) => [...prev, newPh]);
    setNewPhaseName('');
    setNotice({ type: 'success', text: `Fase "${newPh.name}" criada com sucesso!` });
  };

  const handleGenerateCaptainCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captainEmail || !selectedTeamForAuth) return;
    const targetTeam = teams.find((t) => t.id === selectedTeamForAuth);
    const generatedPass =
      captainPassword.trim() || `Cap@${Math.random().toString(36).substring(2, 8)}!`;
    setGeneratedCredentialMsg({
      email: captainEmail.trim(),
      pass: generatedPass,
      team: targetTeam?.name || 'Clube',
    });
    setNotice({
      type: 'success',
      text: `Credenciais geradas para o Capitão do ${targetTeam?.name}!`,
    });
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournName.trim()) return;
    const created: Tournament = {
      id: `t-${Date.now()}`,
      name: newTournName.trim(),
      format: newTournFormat,
      game_mode: newTournFormat === '5v5' ? '5v5' : '11v11',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };
    setTournaments((prev) => [created, ...prev]);
    setSelectedTournamentId(created.id);
    setNewTournName('');
    setNotice({ type: 'success', text: `Campeonato "${created.name}" criado!` });
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const positions = newPlayerPositions
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);
    const newPl: PlayerProfile = {
      id: `pl-${Date.now()}`,
      name: newPlayerName.trim(),
      positions_declared: positions.length > 0 ? positions : ['MEI'],
      archetype: 'Mágico',
      archetypes: ['Mágico'],
      created_at: new Date().toISOString(),
    };
    setAllProfiles((prev) => [newPl, ...prev]);
    setNewPlayerName('');
    setNotice({ type: 'success', text: `Atleta "${newPl.name}" cadastrado!` });
  };

  const disputedOrPendingMatches = matches.filter(
    (m) =>
      m.status === 'pending_validation' ||
      m.status === 'disputed' ||
      m.status === 'pending'
  );

  const openIncidentsCount = incidents.filter((i) => i.status === 'open').length;

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-4 py-5 pb-28">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header Superior */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton fallbackHref="/" label="Início" />
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                Organizador da Liga
              </span>
              <h1 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                Painel Master Admin & ERP Financeiro
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-[#7C5CFC] focus:outline-none"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  🏆 {t.name} ({t.format})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notificações */}
        {notice && (
          <div
            className={cn(
              'p-4 rounded-2xl text-xs font-bold flex items-center justify-between border',
              notice.type === 'success'
                ? 'bg-[#38C958]/15 border-[#38C958]/30 text-[#1f8a38] dark:text-[#38C958]'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-600'
            )}
          >
            <div className="flex items-center gap-2">
              {notice.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{notice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-zinc-400 hover:text-zinc-800 px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Abas de Navegação do Admin (Estilo Pílulas Jogueiros) */}
        <div className="flex gap-2 text-xs overflow-x-auto pb-1">
          {[
            { id: 'erp', label: 'Financeiro & Premiações', icon: DollarSign },
            {
              id: 'audit',
              label: 'Auditoria & W.O.',
              icon: Gavel,
              badge: disputedOrPendingMatches.length + openIncidentsCount,
            },
            { id: 'phases', label: 'Fases', icon: GitFork },
            { id: 'captains', label: 'Capitães', icon: KeyRound },
            { id: 'rules', label: 'Regras LPF', icon: SlidersHorizontal },
            { id: 'athletes', label: `Atletas (${allProfiles.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-4 py-2.5 rounded-full font-extrabold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm',
                  isActive
                    ? 'bg-[#7C5CFC] text-white'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/70 dark:border-zinc-800'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* =================================================================== */}
        {/* ABA 1: FINANCEIRO & PREMIAÇÕES (ERP)                                */}
        {/* =================================================================== */}
        {activeTab === 'erp' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-zinc-400">
                  Arrecadação Prevista
                </span>
                <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  R$ {erpMetrics.totalExpected.toFixed(2)}
                </div>
                <span className="text-[11px] text-[#7C5CFC] font-bold block">
                  {erpMetrics.totalTeams} clubes x R$ {entryFee}
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[#38C958]">
                  PIX Confirmado
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#38C958]">
                  R$ {erpMetrics.totalCollected.toFixed(2)}
                </div>
                <span className="text-[11px] text-zinc-500 block">
                  {erpMetrics.paidCount} de {erpMetrics.totalTeams} quitados
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[#7C5CFC]">
                  Pote de Premiações
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#7C5CFC]">
                  R$ {erpMetrics.totalPrizes.toFixed(2)}
                </div>
                <span className="text-[11px] text-zinc-500 block">
                  1º, 2º, 3º + Art/Gar
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-zinc-400">
                  Saldo Operacional
                </span>
                <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  R$ {erpMetrics.operationalBalance.toFixed(2)}
                </div>
                <span className="text-[11px] text-zinc-500 block">
                  Caixa líquido da Liga
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-5">
              {/* Controle de Inscrições */}
              <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    Controle de Inscrições por Time
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Toque no status para alternar entre Inscrição Paga e Pendente.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {finances.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs"
                          style={{
                            backgroundColor: item.team?.primary_color || '#7C5CFC',
                          }}
                        >
                          {(item.team?.name || 'CL').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 block">
                            {item.team?.name || 'Clube'}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {item.notes || 'Inscrição Liga 5x5'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                          R$ {entryFee.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleTeamFeePaid(item)}
                          className={cn(
                            'px-3.5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5',
                            item.entry_fee_paid
                              ? 'bg-[#38C958] text-white'
                              : 'bg-amber-500/15 text-amber-600'
                          )}
                        >
                          {item.entry_fee_paid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Pago
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              Pendente
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rateio Automático */}
              <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC]">
                    Rateio Automático em Tempo Real
                  </span>
                  <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    Quadro Oficial de Premiações
                  </h2>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-[#7C5CFC]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-5 h-5 text-[#7C5CFC] shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold text-[#7C5CFC] block">
                          🥇 1º Lugar (Campeão)
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {standings[0]?.team_name || 'Furia del Plata'} ({standings[0]?.points || 13} pts)
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#7C5CFC]">
                      R$ {prizeFirst.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-zinc-500 shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold text-zinc-500 block">
                          🥈 2º Lugar (Vice)
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {standings[1]?.team_name || 'Boca Juniors FC'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                      R$ {prizeSecond.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold text-amber-600 block">
                          🥉 3º Lugar
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {standings[2]?.team_name || 'River Plate eSports'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                      R$ {prizeThird.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#38C958]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-5 h-5 text-[#38C958] shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold text-[#229a3e] block">
                          ⚽ Artilheiro da Liga
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {scorers[0]?.player_name || 'Jefhe'} ({scorers[0]?.goals_count || 9} gols)
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#229a3e]">
                      R$ {prizeScorer.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#38C958]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-[#38C958] shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold text-[#229a3e] block">
                          👟 Garçom da Liga
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {assists[0]?.player_name || 'Deivy_10'} ({assists[0]?.assists_count || 8} assists)
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#229a3e]">
                      R$ {prizeAssister.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: AUDITORIA DE SÚMULAS & CHAMADOS (W.O. / QUEDAS)              */}
        {/* =================================================================== */}
        {activeTab === 'audit' && (
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Auditoria de Súmulas
                </h2>
                <p className="text-xs text-zinc-500">
                  Homologue resultados ou aplique W.O. oficial com base nos prints.
                </p>
              </div>

              {matches.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#7C5CFC]">
                      Rodada #{m.round_number || 1}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-900">
                      {m.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-extrabold bg-white dark:bg-zinc-900 p-3 rounded-xl">
                    <span>{m.home_team?.name}</span>
                    <span className="text-sm font-black text-[#7C5CFC]">
                      {m.home_score} x {m.away_score}
                    </span>
                    <span>{m.away_team?.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAdminForceMatchStatus(m.id, 'completed')}
                      disabled={saving}
                      className="py-2 px-2 rounded-full bg-[#38C958] text-white font-extrabold text-[11px] flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminForceMatchStatus(m.id, 'wo')}
                      disabled={saving}
                      className="py-2 px-2 rounded-full bg-[#7C5CFC] text-white font-extrabold text-[11px]"
                    >
                      W.O. (3x0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminForceMatchStatus(m.id, 'rejected')}
                      disabled={saving}
                      className="py-2 px-2 rounded-full bg-rose-500/15 text-rose-600 font-extrabold text-[11px] flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-6 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Tribunal Desportivo ({incidents.length})
                </h2>
                <p className="text-xs text-zinc-500">
                  Analise o print do lobby com relógio ou queda e emita o parecer.
                </p>
              </div>

              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#7C5CFC] uppercase">
                      ⚡ {inc.incident_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-900">
                      {inc.status}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                    <p>
                      <strong>Minuto / Placar:</strong> {inc.minute_occurred}&apos; ({inc.score_at_incident})
                    </p>
                    {inc.admin_resolution_notes && (
                      <p>
                        <strong>Parecer:</strong> {inc.admin_resolution_notes}
                      </p>
                    )}
                  </div>

                  {inc.evidence_url && (
                    <a
                      href={inc.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#7C5CFC] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Print Anexado
                    </a>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleResolveIncident(
                          inc.id,
                          'resolved',
                          'Deferido pela Diretoria conforme print comprobatório.'
                        )
                      }
                      className="py-2 px-3 rounded-full bg-[#38C958] text-white font-extrabold text-xs"
                    >
                      ✅ Deferir Pedido
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleResolveIncident(
                          inc.id,
                          'rejected',
                          'Indeferido por falta de evidência do relógio no lobby.'
                        )
                      }
                      className="py-2 px-3 rounded-full bg-rose-500/15 text-rose-600 font-extrabold text-xs"
                    >
                      ❌ Indeferir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: FASES DO CAMPEONATO                                          */}
        {/* =================================================================== */}
        {activeTab === 'phases' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-extrabold">Criar Nova Fase</h3>
              <form onSubmit={handleCreatePhase} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  placeholder="Ex: Quartas de Final"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
                <select
                  value={newPhaseType}
                  onChange={(e) => setNewPhaseType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                >
                  <option value="groups">Fase de Grupos (Pontos Corridos)</option>
                  <option value="knockout">Mata-Mata (Eliminatória)</option>
                </select>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-full bg-[#38C958] text-white font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Fase
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-2.5">
              {phases.map((ph, idx) => (
                <div
                  key={ph.id}
                  className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#7C5CFC]/10 flex items-center justify-center text-xs font-extrabold text-[#7C5CFC]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-extrabold block">{ph.name}</span>
                      <span className="text-[10px] text-zinc-500">
                        {ph.phase_type === 'groups' ? 'Pontos Corridos' : 'Mata-Mata'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-[#38C958]/15 text-[#229a3e]">
                    {ph.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 4: CAPITÃES & CREDENCIAIS                                       */}
        {/* =================================================================== */}
        {activeTab === 'captains' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-extrabold">Gerar Credenciais de Capitão</h3>
              <form onSubmit={handleGenerateCaptainCredentials} className="space-y-3">
                <select
                  value={selectedTeamForAuth}
                  onChange={(e) => setSelectedTeamForAuth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  required
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                  placeholder="capitao@clube.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
                <input
                  type="text"
                  value={captainPassword}
                  onChange={(e) => setCaptainPassword(e.target.value)}
                  placeholder="Senha provisória (opcional)"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-full bg-[#7C5CFC] text-white font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Gerar Acesso do Capitão
                </button>
              </form>

              {generatedCredentialMsg && (
                <div className="p-4 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 text-xs space-y-1">
                  <p className="text-[#7C5CFC] font-extrabold">Credenciais Geradas:</p>
                  <p>Clube: {generatedCredentialMsg.team}</p>
                  <p>Login: {generatedCredentialMsg.email}</p>
                  <p>Senha: {generatedCredentialMsg.pass}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 space-y-2.5">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-extrabold block">{t.name}</span>
                    <span className="text-[11px] text-zinc-500">
                      Formação: {t.active_formation} • {t.instagram_handle || '@clube'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#38C958]/15 text-[#229a3e]">
                    Ativo
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 5: REGRAS DE PRO CLUBS                                          */}
        {/* =================================================================== */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-extrabold">
                Parâmetros Oficiais da Liga (5v5 & 11v11)
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800">
                  <span className="text-zinc-500 block">Aviso Prévio p/ Cancelar Jogo:</span>
                  <span className="text-base font-black text-[#7C5CFC]">60 minutos antes</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800">
                  <span className="text-zinc-500 block">Tolerância de W.O. no Lobby:</span>
                  <span className="text-base font-black text-[#7C5CFC]">15 minutos (c/ print)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800">
                  <span className="text-zinc-500 block">Queda até 20 min do 1º Tempo:</span>
                  <span className="text-xs font-extrabold text-[#38C958]">
                    Reiniciar 90 min mantendo gols
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800">
                  <span className="text-zinc-500 block">Queda no Intervalo / 2º Tempo:</span>
                  <span className="text-xs font-extrabold text-[#38C958]">
                    Reiniciar e jogar apenas 1 tempo
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
              <h3 className="text-sm font-extrabold">Criar Novo Torneio</h3>
              <form onSubmit={handleCreateTournament} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newTournName}
                  onChange={(e) => setNewTournName(e.target.value)}
                  placeholder="Nome da Liga ou Copa..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
                <select
                  value={newTournFormat}
                  onChange={(e) => setNewTournFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                >
                  <option value="5v5">5v5 (Pro Clubs Rush / LPF)</option>
                  <option value="11v11">11v11 (Oficial)</option>
                </select>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-full bg-[#38C958] text-white font-extrabold text-xs"
                >
                  + Criar Campeonato
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 6: ATLETAS                                                      */}
        {/* =================================================================== */}
        {activeTab === 'athletes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-extrabold">Cadastrar Atleta</h3>
              <form onSubmit={handleCreatePlayer} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Gamertag EA..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
                <input
                  type="text"
                  value={newPlayerPositions}
                  onChange={(e) => setNewPlayerPositions(e.target.value)}
                  placeholder="Ex: ATA, MEI"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-full bg-[#38C958] text-white font-extrabold text-xs"
                >
                  + Cadastrar Atleta
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-2.5">
              {allProfiles.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold">{p.name}</span>
                    {p.positions_declared.map((pos) => (
                      <span
                        key={pos}
                        className={cn(
                          'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                          getPositionBadgeClass(pos)
                        )}
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#7C5CFC] font-extrabold">
                    {p.archetype}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Lightbox de Inspeção de Print */}
        {inspectingMatch && inspectingMatch.proof_image_url && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold">Inspeção de Súmula Oficial EA FC 26</h4>
                  <p className="text-xs text-zinc-500">
                    {inspectingMatch.home_team?.name} ({inspectingMatch.home_score}) x (
                    {inspectingMatch.away_score}) {inspectingMatch.away_team?.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingMatch(null)}
                  className="text-zinc-400 hover:text-zinc-800 p-2"
                >
                  ✕
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden bg-zinc-950 max-h-[60vh] flex items-center justify-center">
                <img
                  src={inspectingMatch.proof_image_url}
                  alt="Print da Partida"
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingMatch(null)}
                  className="px-4 py-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-extrabold"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminForceMatchStatus(inspectingMatch.id, 'completed')}
                  className="px-4 py-2 rounded-full bg-[#38C958] text-white text-xs font-extrabold"
                >
                  ✅ Homologar Súmula
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
