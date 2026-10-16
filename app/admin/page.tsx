'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Tournament,
  TournamentRules,
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
  Shield,
  Plus,
  Users,
  Trophy,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  KeyRound,
  SlidersHorizontal,
  Save,
  GitFork,
  ExternalLink,
  DollarSign,
  Gavel,
  Award,
  Flame,
} from 'lucide-react';
import {
  ALL_ARCHETYPES,
  getArchetypeBadgeClass,
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

  // Regras
  const [currentRules, setCurrentRules] = useState<TournamentRules>({
    crossplay_gen: 'current_gen',
    min_human_players: 5,
    any_allowed: false,
    gk_required: false,
  });

  // Valores de Inscrição e Premiação Configuráveis (ERP)
  const [entryFee, setEntryFee] = useState<number>(70);
  const [prizeFirst, setPrizeFirst] = useState<number>(300);
  const [prizeSecond, setPrizeSecond] = useState<number>(120);
  const [prizeThird, setPrizeThird] = useState<number>(80);
  const [prizeScorer, setPrizeScorer] = useState<number>(30);
  const [prizeAssister, setPrizeAssister] = useState<number>(30);

  // Formulários adicionais
  const [newTournName, setNewTournName] = useState('');
  const [newTournFormat, setNewTournFormat] = useState('5v5');
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseType, setNewPhaseType] = useState<'groups' | 'knockout'>('knockout');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerArchetypes, setNewPlayerArchetypes] = useState<string[]>(['Mágico']);
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

  // Toggle Rápido de Inscrição Paga / Pendente
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

  // Auditoria de Súmulas (Forçar Aprovação ou Aplicar W.O.)
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

  // Julgar Chamado de W.O. / Queda
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
      archetype: newPlayerArchetypes[0] || 'Mágico',
      archetypes: newPlayerArchetypes,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton fallbackHref="/" label="Início" />
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Painel Master Admin & ERP Financeiro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Campeonato Ativo:</span>
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="min-h-[44px] bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-400 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.format})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notificações */}
        {notice && (
          <div
            className={cn(
              'p-4 rounded-xl text-xs flex items-center justify-between border',
              notice.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
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
              onClick={() => setNotice(null)}
              className="text-slate-400 hover:text-white px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Abas de Navegação do Admin */}
        <div className="flex border-b border-slate-800 gap-2 text-xs sm:text-sm overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('erp')}
            className={cn(
              'min-h-[44px] px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap',
              activeTab === 'erp'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            )}
          >
            <DollarSign className="w-4 h-4" />
            Financeiro & Premiações (ERP)
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={cn(
              'min-h-[44px] px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap',
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            )}
          >
            <Gavel className="w-4 h-4" />
            Auditoria de Súmulas & W.O.
            {(disputedOrPendingMatches.length > 0 || openIncidentsCount > 0) && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {disputedOrPendingMatches.length + openIncidentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('phases')}
            className={cn(
              'min-h-[44px] px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap',
              activeTab === 'phases'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            )}
          >
            <GitFork className="w-4 h-4" />
            Fases & Chaveamento
          </button>

          <button
            onClick={() => setActiveTab('captains')}
            className={cn(
              'min-h-[44px] px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap',
              activeTab === 'captains'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            )}
          >
            <KeyRound className="w-4 h-4" />
            Acessos & Capitães
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={cn(
              'min-h-[44px] px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap',
              activeTab === 'rules'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Regras Pro Clubs
          </button>

          <button
            onClick={() => setActiveTab('athletes')}
            className={cn(
              'min-h-[44px] px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap',
              activeTab === 'athletes'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            )}
          >
            <Users className="w-4 h-4" />
            Atletas ({allProfiles.length})
          </button>
        </div>

        {/* =================================================================== */}
        {/* ABA 1: FINANCEIRO & PREMIAÇÕES (ERP) */}
        {/* =================================================================== */}
        {activeTab === 'erp' && (
          <div className="space-y-6">
            {/* Cards Executivos de Resumo da Liga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Arrecadação Prevista ({erpMetrics.totalTeams} x R$ {entryFee})
                </span>
                <div className="text-2xl font-black text-slate-100 font-mono">
                  R$ {erpMetrics.totalExpected.toFixed(2)}
                </div>
                <span className="text-[11px] text-cyan-400 block">
                  Taxa de inscrição: R$ {entryFee.toFixed(2)} / clube
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-1">
                <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                  Caixa Confirmado (PIX Recebido)
                </span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  R$ {erpMetrics.totalCollected.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {erpMetrics.paidCount} de {erpMetrics.totalTeams} equipes quitadas
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-1">
                <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">
                  Pote Total de Premiações
                </span>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  R$ {erpMetrics.totalPrizes.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  1º, 2º, 3º + Artilheiro + Garçom
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Fundo Operacional da Liga
                </span>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  R$ {erpMetrics.operationalBalance.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Saldo líquido após premiações
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Lista de Equipes com Toggle Rápido Inscrição Paga / Pendente (7 Colunas) */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      Controle de Inscrições por Equipe
                    </h2>
                    <p className="text-xs text-slate-400">
                      Toque no botão de status para alternar entre Inscrição Paga e Pendente.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {finances.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-9 rounded-full"
                          style={{
                            backgroundColor: item.team?.primary_color || '#06b6d4',
                          }}
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-100 block">
                            {item.team?.name || 'Clube'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {item.notes || 'Inscrição Liga 5x5'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          R$ {entryFee.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleToggleTeamFeePaid(item)}
                          className={cn(
                            'min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border',
                            item.entry_fee_paid
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                          )}
                        >
                          {item.entry_fee_paid ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Inscrição Paga
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-amber-400" />
                              Pendente (Marcar Pago)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quadro Automático de Rateio de Premiação em Tempo Real (5 Colunas) */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Rateio Automático em Tempo Real
                  </span>
                  <h2 className="text-base font-bold text-slate-100">
                    Quadro Oficial de Premiações
                  </h2>
                  <p className="text-xs text-slate-400">
                    Aponta automaticamente os líderes atuais da tabela, artilharia e assistências:
                  </p>
                </div>

                <div className="space-y-3">
                  {/* 1º Lugar */}
                  <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold text-amber-300 uppercase block">
                          🥇 1º Lugar (Campeão)
                        </span>
                        <span className="text-xs font-bold text-slate-100">
                          Líder Atual: {standings[0]?.team_name || 'Racing Club Digital'} (
                          {standings[0]?.points || 13} pts)
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black font-mono text-amber-400">
                      R$ {prizeFirst.toFixed(2)}
                    </span>
                  </div>

                  {/* 2º Lugar */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-slate-300 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-300 uppercase block">
                          🥈 2º Lugar (Vice-Campeão)
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          Atual 2º: {standings[1]?.team_name || 'Boca Juniors FC'} (
                          {standings[1]?.points || 12} pts)
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black font-mono text-slate-200">
                      R$ {prizeSecond.toFixed(2)}
                    </span>
                  </div>

                  {/* 3º Lugar */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-amber-700 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-amber-500/90 uppercase block">
                          🥉 3º Lugar (Pódio)
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          Atual 3º: {standings[2]?.team_name || 'River Plate eSports'} (
                          {standings[2]?.points || 10} pts)
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black font-mono text-slate-200">
                      R$ {prizeThird.toFixed(2)}
                    </span>
                  </div>

                  {/* Artilheiro */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold text-cyan-300 uppercase block">
                          ⚽ Artilheiro da Liga
                        </span>
                        <span className="text-xs font-bold text-slate-100">
                          Líder: {scorers[0]?.player_name || 'Buzz_ProClubs'} (
                          {scorers[0]?.goals_count || 9} gols • {scorers[0]?.team_name})
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black font-mono text-cyan-400">
                      R$ {prizeScorer.toFixed(2)}
                    </span>
                  </div>

                  {/* Líder de Assistências */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold text-emerald-300 uppercase block">
                          👟 Líder de Assistências (Garçom)
                        </span>
                        <span className="text-xs font-bold text-slate-100">
                          Líder: {assists[0]?.player_name || 'Deivy_10'} (
                          {assists[0]?.assists_count || 8} assists • {assists[0]?.team_name})
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      R$ {prizeAssister.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: AUDITORIA DE SÚMULAS & CHAMADOS (W.O. / QUEDAS) */}
        {/* =================================================================== */}
        {activeTab === 'audit' && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Súmulas Contestadas ou Pendentes de Forçar Aprovação (6 Colunas) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    Auditoria de Súmulas (Contestadas ou Pendentes)
                  </h2>
                  <p className="text-xs text-slate-400">
                    O Admin pode forçar a aprovação de uma súmula ou decretar W.O. com base nos prints.
                  </p>
                </div>

                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        Rodada #{m.round_number || 1}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded uppercase border',
                          m.status === 'disputed' &&
                            'bg-rose-950 text-rose-300 border-rose-800',
                          m.status === 'pending_validation' &&
                            'bg-amber-950 text-amber-300 border-amber-800',
                          (m.status === 'completed' || m.status === 'approved') &&
                            'bg-emerald-950 text-emerald-300 border-emerald-800'
                        )}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span>{m.home_team?.name}</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {m.home_score} x {m.away_score}
                      </span>
                      <span>{m.away_team?.name}</span>
                    </div>

                    {m.proof_image_url && (
                      <div
                        onClick={() => setInspectingMatch(m)}
                        className="cursor-pointer h-28 rounded-lg overflow-hidden border border-slate-800 relative group"
                      >
                        <img
                          src={m.proof_image_url}
                          alt="Print EA"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center">
                          <span className="px-3 py-1 rounded-lg bg-slate-900 text-xs font-bold text-white border border-slate-700">
                            🔍 Inspecionar Print EA
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => handleAdminForceMatchStatus(m.id, 'completed')}
                        disabled={saving}
                        className="min-h-[40px] py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Forçar Aprovação
                      </button>
                      <button
                        onClick={() => handleAdminForceMatchStatus(m.id, 'wo')}
                        disabled={saving}
                        className="min-h-[40px] py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] flex items-center justify-center gap-1"
                      >
                        Aplicar W.O. (3x0)
                      </button>
                      <button
                        onClick={() => handleAdminForceMatchStatus(m.id, 'rejected')}
                        disabled={saving}
                        className="min-h-[40px] py-2 px-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold text-[11px] flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Julgamento de Chamados de W.O. e Quedas (6 Colunas) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    Tribunal Desportivo: Pedidos de W.O. & Quedas ({incidents.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Analise o print do lobby com relógio ou vídeo da queda e emita o parecer oficial.
                  </p>
                </div>

                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-400 uppercase">
                        ⚡ {inc.incident_type.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded uppercase border',
                          inc.status === 'open' &&
                            'bg-amber-950 text-amber-300 border-amber-800',
                          inc.status === 'resolved' &&
                            'bg-emerald-950 text-emerald-300 border-emerald-800',
                          inc.status === 'rejected' &&
                            'bg-rose-950 text-rose-300 border-rose-800'
                        )}
                      >
                        {inc.status === 'open'
                          ? 'Aguardando Julgamento'
                          : inc.status === 'resolved'
                          ? 'Deferido'
                          : 'Indeferido'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <p>
                        <strong>Reportado por:</strong>{' '}
                        {inc.reported_by_team?.name || 'Equipe da Liga'}
                      </p>
                      <p>
                        <strong>Minuto / Placar no Incidente:</strong> {inc.minute_occurred}&apos; (
                        {inc.score_at_incident})
                      </p>
                      {inc.admin_resolution_notes && (
                        <p className="text-slate-400">
                          <strong>Parecer:</strong> {inc.admin_resolution_notes}
                        </p>
                      )}
                    </div>

                    {inc.evidence_url && (
                      <a
                        href={inc.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir Print do Lobby / Evidência Anexada
                      </a>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() =>
                          handleResolveIncident(
                            inc.id,
                            'resolved',
                            'Deferido pela Diretoria conforme print comprobatório e regra oficial.'
                          )
                        }
                        className="min-h-[40px] py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs"
                      >
                        ✅ Deferir Pedido / W.O.
                      </button>
                      <button
                        onClick={() =>
                          handleResolveIncident(
                            inc.id,
                            'rejected',
                            'Indeferido por falta de evidência do relógio no lobby.'
                          )
                        }
                        className="min-h-[40px] py-2 px-3 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold text-xs"
                      >
                        ❌ Indeferir Chamado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: FASES DO CAMPEONATO */}
        {/* =================================================================== */}
        {activeTab === 'phases' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100">Criar Nova Fase</h3>
                <form onSubmit={handleCreatePhase} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={newPhaseName}
                    onChange={(e) => setNewPhaseName(e.target.value)}
                    placeholder="Ex: Quartas de Final"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                  <select
                    value={newPhaseType}
                    onChange={(e) => setNewPhaseType(e.target.value as any)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  >
                    <option value="groups">Fase de Grupos (Pontos Corridos)</option>
                    <option value="knockout">Mata-Mata (Eliminatória)</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Fase
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-2.5">
              {phases.map((ph, idx) => (
                <div
                  key={ph.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono text-cyan-400">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-100 block">{ph.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {ph.phase_type === 'groups' ? 'Pontos Corridos' : 'Mata-Mata'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800">
                    {ph.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 4: CAPITÃES & CREDENCIAIS */}
        {/* =================================================================== */}
        {activeTab === 'captains' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100">
                  Gerar Credenciais Oficiais de Capitão
                </h3>
                <form onSubmit={handleGenerateCaptainCredentials} className="space-y-3.5">
                  <select
                    value={selectedTeamForAuth}
                    onChange={(e) => setSelectedTeamForAuth(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
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
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    value={captainPassword}
                    onChange={(e) => setCaptainPassword(e.target.value)}
                    placeholder="Senha provisória (opcional)"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    Gerar Acesso do Capitão
                  </button>
                </form>

                {generatedCredentialMsg && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 text-xs font-mono space-y-1">
                    <p className="text-amber-400 font-bold">Credenciais Geradas:</p>
                    <p>Clube: {generatedCredentialMsg.team}</p>
                    <p>Login: {generatedCredentialMsg.email}</p>
                    <p>Senha: {generatedCredentialMsg.pass}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-2.5">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">{t.name}</span>
                    <span className="text-[11px] text-slate-400">
                      Formação: {t.active_formation} • {t.instagram_handle || '@clube'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-400 border border-slate-800">
                    Ativo
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 5: REGRAS DE PRO CLUBS */}
        {/* =================================================================== */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100">
                Parâmetros Oficiais da Liga (5v5 & 11v11)
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Aviso Prévio p/ Cancelar Jogo:</span>
                  <span className="text-base font-black text-cyan-400 font-mono">
                    60 minutos antes
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Tolerância de W.O. no Lobby:</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    15 minutos (c/ print)
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Queda até 20 min do 1º Tempo:</span>
                  <span className="text-xs font-bold text-emerald-400">
                    Reiniciar 90 min mantendo gols
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Queda no Intervalo / 2º Tempo:</span>
                  <span className="text-xs font-bold text-emerald-400">
                    Reiniciar e jogar apenas 1 tempo
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-100">Criar Novo Torneio</h3>
              <form onSubmit={handleCreateTournament} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newTournName}
                  onChange={(e) => setNewTournName(e.target.value)}
                  placeholder="Nome da Liga ou Copa..."
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
                <select
                  value={newTournFormat}
                  onChange={(e) => setNewTournFormat(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                >
                  <option value="5v5">5v5 (Pro Clubs Rush / LPF)</option>
                  <option value="11v11">11v11 (Oficial)</option>
                </select>
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs"
                >
                  + Criar Campeonato
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 6: ATLETAS */}
        {/* =================================================================== */}
        {activeTab === 'athletes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Cadastrar Atleta</h3>
              <form onSubmit={handleCreatePlayer} className="space-y-3">
                <input
                  type="text"
                  required
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Gamertag EA..."
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
                <input
                  type="text"
                  value={newPlayerPositions}
                  onChange={(e) => setNewPlayerPositions(e.target.value)}
                  placeholder="Ex: ATA, MEI"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs"
                >
                  + Cadastrar Atleta
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              {allProfiles.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{p.name}</span>
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
                  <span className="text-[10px] text-amber-400 font-semibold">
                    {p.archetype}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Lightbox de Inspeção de Print */}
        {inspectingMatch && inspectingMatch.proof_image_url && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Inspeção de Súmula Oficial EA FC 26
                  </h4>
                  <p className="text-xs text-slate-400">
                    {inspectingMatch.home_team?.name} ({inspectingMatch.home_score}) x (
                    {inspectingMatch.away_score}) {inspectingMatch.away_team?.name}
                  </p>
                </div>
                <button
                  onClick={() => setInspectingMatch(null)}
                  className="text-slate-400 hover:text-white p-2"
                >
                  ✕
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[60vh] flex items-center justify-center">
                <img
                  src={inspectingMatch.proof_image_url}
                  alt="Print da Partida"
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setInspectingMatch(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
                >
                  Fechar
                </button>
                <button
                  onClick={() => handleAdminForceMatchStatus(inspectingMatch.id, 'completed')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold"
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
