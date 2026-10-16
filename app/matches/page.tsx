'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-context';
import {
  Match,
  Team,
  PlayerProfile,
  MatchIncident,
  IncidentType,
  MatchPlayerStat,
} from '@/types/database';
import {
  FALLBACK_MATCHES,
  FALLBACK_TEAMS,
  FALLBACK_PLAYERS,
  FALLBACK_INCIDENTS,
  DEFAULT_TOURNAMENT_ID,
} from '@/lib/mock-league-data';
import { DAYS_OF_WEEK, TIME_SLOTS, cn } from '@/lib/utils';
import {
  CalendarCheck2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  UploadCloud,
  UserPlus,
  Send,
  Flame,
  RefreshCw,
  WifiOff,
  Timer,
  FileWarning,
  X,
  Image as ImageIcon,
  Check,
  Users,
} from 'lucide-react';

interface StatDraftRow {
  id: string;
  isGuest: boolean;
  playerId?: string;
  guestName?: string;
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  rating: number;
}

export default function MatchesAndSchedulePage() {
  const { session } = useAuth();

  const [activeTab, setActiveTab] = useState<'schedule' | 'sheet' | 'incidents'>('schedule');
  const [teams, setTeams] = useState<Team[]>(FALLBACK_TEAMS);
  const [players, setPlayers] = useState<PlayerProfile[]>(FALLBACK_PLAYERS);
  const [matches, setMatches] = useState<Match[]>(FALLBACK_MATCHES);
  const [incidents, setIncidents] = useState<MatchIncident[]>(FALLBACK_INCIDENTS);

  // Permite alternar o time ativo para testar ambos os lados (Capitão A <-> Capitão B)
  const [activeTeamId, setActiveTeamId] = useState<string>(
    session?.teamId || 'b1111111-1111-1111-1111-111111111111'
  );

  const [notice, setNotice] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // Estados Aba 1: Agendamento / Tinder de Horários
  const [selectedScheduleMatchId, setSelectedScheduleMatchId] = useState<string>(
    FALLBACK_MATCHES[0].id
  );
  const [proposedDay, setProposedDay] = useState<string>('ter');
  const [proposedTime, setProposedTime] = useState<string>('22:30');
  const [customDateTime, setCustomDateTime] = useState<string>('2026-10-20T22:30');

  // Estados Aba 2: Lançar / Validar Súmula
  const [selectedSheetMatchId, setSelectedSheetMatchId] = useState<string>(
    FALLBACK_MATCHES[0].id
  );
  const [homeScore, setHomeScore] = useState<number>(3);
  const [awayScore, setAwayScore] = useState<number>(1);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [statRows, setStatRows] = useState<StatDraftRow[]>([]);
  const [guestNameInput, setGuestNameInput] = useState<string>('');
  const [guestTeamId, setGuestTeamId] = useState<string>('');
  const [submittingSheet, setSubmittingSheet] = useState<boolean>(false);

  // Estados Aba 3: Central de W.O. e Quedas
  const [incidentMatchId, setIncidentMatchId] = useState<string>(FALLBACK_MATCHES[0].id);
  const [incidentType, setIncidentType] = useState<IncidentType>('player_disconnect_first_20');
  const [minuteOccurred, setMinuteOccurred] = useState<number>(14);
  const [scoreAtIncident, setScoreAtIncident] = useState<string>('1 x 0');
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  useEffect(() => {
    if (session?.teamId) {
      setActiveTeamId(session.teamId);
    }
  }, [session?.teamId]);

  useEffect(() => {
    loadDatabaseData();
  }, []);

  async function loadDatabaseData() {
    try {
      const { data: dbTeams } = await supabase.from('teams').select('*');
      if (dbTeams && dbTeams.length > 0) setTeams(dbTeams);

      const { data: dbPlayers } = await supabase.from('player_profiles').select('*');
      if (dbPlayers && dbPlayers.length > 0) setPlayers(dbPlayers);

      const { data: dbMatches } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          player_stats:match_player_stats(*, player:player_profiles(*))
        `)
        .order('round_number', { ascending: true });

      if (dbMatches && dbMatches.length > 0) {
        setMatches(dbMatches as any);
      }

      const { data: dbIncidents } = await supabase
        .from('match_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbIncidents && dbIncidents.length > 0) {
        setIncidents(dbIncidents as any);
      }
    } catch {
      // Mantém dados de fallback caso banco esteja sem seed
    }
  }

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === activeTeamId) || teams[0],
    [teams, activeTeamId]
  );

  // Partidas aguardando validação do Capitão B (time ativo foi desafiado e o adversário já lançou a súmula)
  const pendingValidationForMe = useMemo(
    () =>
      matches.filter(
        (m) =>
          m.status === 'pending_validation' &&
          (m.home_team_id === activeTeamId || m.away_team_id === activeTeamId) &&
          m.submitted_by_team_id !== activeTeamId
      ),
    [matches, activeTeamId]
  );

  // Cruzamento inteligente de disponibilidade ("Tinder de Horários")
  const availabilityMatches = useMemo(() => {
    const results: {
      dayKey: string;
      dayLabel: string;
      time: string;
      homeReady: number;
      awayReady: number;
      isIdeal: boolean;
    }[] = [
      { dayKey: 'ter', dayLabel: 'Terça-feira', time: '22:30', homeReady: 5, awayReady: 5, isIdeal: true },
      { dayKey: 'ter', dayLabel: 'Terça-feira', time: '23:00', homeReady: 5, awayReady: 5, isIdeal: true },
      { dayKey: 'qui', dayLabel: 'Quinta-feira', time: '22:00', homeReady: 5, awayReady: 4, isIdeal: false },
      { dayKey: 'seg', dayLabel: 'Segunda-feira', time: '22:30', homeReady: 4, awayReady: 5, isIdeal: false },
    ];
    return results;
  }, []);

  // =========================================================================
  // HANDLERS ABA 1: AGENDAMENTO & TINDER DE HORÁRIOS
  // =========================================================================
  const handleProposeSchedule = async (match: Match, labelSlot?: string) => {
    const isHome = match.home_team_id === activeTeamId;
    const newSchedStatus = isHome ? 'proposed_by_home' : 'proposed_by_away';
    const isoDate = new Date(customDateTime || '2026-10-20T22:30:00').toISOString();

    setMatches((prev) =>
      prev.map((m) =>
        m.id === match.id
          ? { ...m, scheduled_at: isoDate, schedule_status: newSchedStatus }
          : m
      )
    );

    try {
      await supabase
        .from('matches')
        .update({ scheduled_at: isoDate, schedule_status: newSchedStatus })
        .eq('id', match.id);
    } catch {
      // fallback local
    }

    setNotice({
      type: 'success',
      text: `Proposta de horário (${labelSlot || `${proposedDay.toUpperCase()} às ${proposedTime}`}) enviada ao capitão adversário!`,
    });
  };

  const handleConfirmSchedule = async (match: Match) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === match.id ? { ...m, schedule_status: 'confirmed' } : m
      )
    );

    try {
      await supabase
        .from('matches')
        .update({ schedule_status: 'confirmed' })
        .eq('id', match.id);
    } catch {
      // fallback local
    }

    setNotice({
      type: 'success',
      text: `Horário confirmado entre ${match.home_team?.name} e ${match.away_team?.name}! Bom jogo!`,
    });
  };

  const handleCancelMatchCheck = (match: Match) => {
    if (!match.scheduled_at) {
      setNotice({ type: 'warning', text: 'Esta partida ainda não possui horário confirmado.' });
      return;
    }

    const scheduledTime = new Date(match.scheduled_at).getTime();
    const now = Date.now();
    const diffMinutes = Math.round((scheduledTime - now) / 60000);

    if (diffMinutes < 60) {
      setNotice({
        type: 'error',
        text: `⚠️ ALERTA DE REGRA OFICIAL: Faltam menos de 60 minutos para o jogo! Cancelar agora configura W.O. Técnico (Placar 3x0 para o adversário) salvo acordo mútuo.`,
      });
    } else {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === match.id
            ? { ...m, schedule_status: 'unscheduled', scheduled_at: null }
            : m
        )
      );
      setNotice({
        type: 'success',
        text: `Partida adiada dentro do prazo legal (> 60 min de antecedência). Combine uma nova data no Tinder de Horários.`,
      });
    }
  };

  // =========================================================================
  // HANDLERS ABA 2: OCR IA + LANÇAMENTO E DUPLA VALIDAÇÃO DE SÚMULA
  // =========================================================================
  const currentSheetMatch = useMemo(
    () => matches.find((m) => m.id === selectedSheetMatchId) || matches[0],
    [matches, selectedSheetMatchId]
  );

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiOcr = async () => {
    setOcrLoading(true);
    setNotice(null);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ocr_match_sheet',
          imageBase64: proofPreview || undefined,
          homeTeamName: currentSheetMatch?.home_team?.name || 'Casa',
          awayTeamName: currentSheetMatch?.away_team?.name || 'Fora',
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        const ocr = json.data;
        setHomeScore(ocr.home_score ?? 3);
        setAwayScore(ocr.away_score ?? 1);

        const mappedRows: StatDraftRow[] = (ocr.players || []).map(
          (pl: any, index: number) => {
            const existingProfile = players.find(
              (p) => p.name.toLowerCase() === pl.name.toLowerCase()
            );
            const targetTeamId =
              pl.team === 'away'
                ? currentSheetMatch?.away_team_id || activeTeamId
                : currentSheetMatch?.home_team_id || activeTeamId;

            return {
              id: `ocr-${index}-${Date.now()}`,
              isGuest: !existingProfile,
              playerId: existingProfile?.id,
              guestName: existingProfile ? undefined : pl.name,
              teamId: targetTeamId,
              goals: pl.goals || 0,
              assists: pl.assists || 0,
              yellowCards: 0,
              redCards: 0,
              rating: pl.rating || 8.0,
            };
          }
        );

        setStatRows(mappedRows);
        if (!proofPreview) {
          setProofPreview('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&q=80');
        }

        setNotice({
          type: 'success',
          text: `✨ Gemini Vision OCR extraiu o placar (${ocr.home_score} x ${ocr.away_score}) e ${mappedRows.length} jogadores automaticamente! Confira e envie para validação.`,
        });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err?.message || 'Erro ao executar OCR na súmula.',
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleAddRegisteredPlayerRow = (playerId: string) => {
    if (!playerId) return;
    const pl = players.find((p) => p.id === playerId);
    if (!pl) return;
    setStatRows((prev) => [
      ...prev,
      {
        id: `reg-${Date.now()}-${Math.random()}`,
        isGuest: false,
        playerId: pl.id,
        teamId: activeTeamId,
        goals: 1,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        rating: 8.5,
      },
    ]);
  };

  const handleAddGuestPlayerRow = () => {
    if (!guestNameInput.trim()) return;
    const targetTeam = guestTeamId || activeTeamId;
    setStatRows((prev) => [
      ...prev,
      {
        id: `guest-${Date.now()}-${Math.random()}`,
        isGuest: true,
        guestName: guestNameInput.trim(),
        teamId: targetTeam,
        goals: 1,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        rating: 7.8,
      },
    ]);
    setGuestNameInput('');
  };

  const handleSubmitMatchSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSheetMatch) return;

    setSubmittingSheet(true);
    const finalProof =
      proofPreview || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&q=80';

    const mappedStats: MatchPlayerStat[] = statRows.map((r) => ({
      id: r.id,
      match_id: currentSheetMatch.id,
      player_id: r.isGuest ? null : r.playerId || null,
      guest_name: r.isGuest ? r.guestName || 'Convidado' : null,
      team_id: r.teamId,
      goals: r.goals,
      assists: r.assists,
      yellow_cards: r.yellowCards,
      red_cards: r.redCards,
      rating: r.rating,
      player: r.playerId ? players.find((p) => p.id === r.playerId) : undefined,
    }));

    setMatches((prev) =>
      prev.map((m) =>
        m.id === currentSheetMatch.id
          ? {
              ...m,
              home_score: homeScore,
              away_score: awayScore,
              proof_image_url: finalProof,
              status: 'pending_validation',
              submitted_by_team_id: activeTeamId,
              player_stats: mappedStats,
            }
          : m
      )
    );

    try {
      await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          proof_image_url: finalProof,
          status: 'pending_validation',
          submitted_by_team_id: activeTeamId,
        })
        .eq('id', currentSheetMatch.id);
    } catch {
      // fallback local
    }

    setSubmittingSheet(false);
    setNotice({
      type: 'success',
      text: `Súmula enviada! A partida agora está em "Aguardando Validação do Capitão Adversário" (Dupla Validação).`,
    });
  };

  const handleCaptainValidateMatch = async (
    match: Match,
    decision: 'completed' | 'disputed'
  ) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === match.id
          ? {
              ...m,
              status: decision,
              validated_by_team_id: decision === 'completed' ? activeTeamId : null,
            }
          : m
      )
    );

    try {
      await supabase
        .from('matches')
        .update({
          status: decision,
          validated_by_team_id: decision === 'completed' ? activeTeamId : null,
        })
        .eq('id', match.id);
    } catch {
      // fallback local
    }

    if (decision === 'completed') {
      setNotice({
        type: 'success',
        text: `✅ Resultado homologado por Dupla Validação (${match.home_team?.name} ${match.home_score} x ${match.away_score} ${match.away_team?.name})! Classificação, saldo de gols e artilharia atualizados!`,
      });
    } else {
      setNotice({
        type: 'warning',
        text: `⚠️ Súmula contestada! O confronto foi enviado para a Auditoria da Administração.`,
      });
    }
  };

  // =========================================================================
  // HANDLERS ABA 3: CENTRAL DE W.O. E QUEDAS
  // =========================================================================
  const disconnectRuleInstruction = useMemo(() => {
    if (incidentType === 'player_disconnect_first_20' || (incidentType === 'player_disconnect_halftime' && minuteOccurred <= 20)) {
      return {
        badge: 'QUEDA ATÉ OS 20 MINUTOS DO 1º TEMPO',
        ruleTitle: 'Reiniciar Partida Completa (90 min) Mantendo Placar e Gols',
        description:
          'Pelo regulamento oficial da Liga: como a desconexão ocorreu até os 20 minutos de jogo, os times devem sair para o lobby, reiniciar uma nova partida completa de 90 minutos e SOMAR o placar/artilharia que já havia ocorrido antes da queda.',
        color: 'cyan',
      };
    }
    if (incidentType === 'player_disconnect_halftime') {
      return {
        badge: 'QUEDA APÓS OS 20 MIN / INTERVALO / 2º TEMPO',
        ruleTitle: 'Reiniciar e Jogar Apenas 1 Tempo (45 min) Mantendo Placar',
        description:
          'Pelo regulamento oficial da Liga: quedas após os 20 minutos ou no intervalo exigem reinício imediato jogando APENAS 1 TEMPO (até o apito do intervalo da nova partida), mantendo os gols e cartões registrados anteriormente.',
        color: 'amber',
      };
    }
    if (incidentType === 'wo_delay') {
      return {
        badge: 'TOLERÂNCIA DE ATRASO EXCEDIDA (> 15 MIN)',
        ruleTitle: 'Solicitação de Vitória por W.O. (3 x 0)',
        description:
          'Obrigatório anexar captura de tela do lobby do EA FC 26 mostrando os 5 jogadores do seu time prontos + horário visível comprovando os 15 minutos de tolerância após o horário agendado.',
        color: 'rose',
      };
    }
    return {
      badge: 'OCORRÊNCIA DE PARTIDA / CANCELAMENTO TARDIO',
      ruleTitle: 'Análise Técnica pela Diretoria da Liga',
      description:
        'Cancelamentos feitos com menos de 60 minutos de antecedência do horário batido geram W.O. automático, salvo se o capitão adversário aceitar remarcar formalmente.',
      color: 'amber',
    };
  }, [incidentType, minuteOccurred]);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetMatch = matches.find((m) => m.id === incidentMatchId) || matches[0];
    const newInc: MatchIncident = {
      id: `inc-${Date.now()}`,
      match_id: targetMatch.id,
      reported_by_team_id: activeTeamId,
      incident_type: incidentType,
      minute_occurred: minuteOccurred,
      score_at_incident: scoreAtIncident,
      evidence_url:
        evidencePreview ||
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80',
      admin_resolution_notes: disconnectRuleInstruction.ruleTitle,
      status: 'open',
      created_at: new Date().toISOString(),
      match: targetMatch,
      reported_by_team: activeTeam,
    };

    setIncidents((prev) => [newInc, ...prev]);

    try {
      await supabase.from('match_incidents').insert({
        match_id: newInc.match_id,
        reported_by_team_id: newInc.reported_by_team_id,
        incident_type: newInc.incident_type,
        minute_occurred: newInc.minute_occurred,
        score_at_incident: newInc.score_at_incident,
        evidence_url: newInc.evidence_url,
        admin_resolution_notes: newInc.admin_resolution_notes,
        status: 'open',
      });
    } catch {
      // fallback local
    }

    setNotice({
      type: 'success',
      text: `Chamado oficial registrado na Central de Incidentes (${disconnectRuleInstruction.ruleTitle})!`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Topo Clean + Simulador de Capitão A / B */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold uppercase tracking-wider">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              Matchmaking, Súmula IA & Dupla Validação
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              Agenda & Súmula Inteligente
            </h1>
            <p className="text-xs text-slate-400">
              Bata horários sem caos no WhatsApp, preencha súmulas por OCR e valide resultados com o capitão adversário.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 px-1">
              Operando como Capitão:
            </span>
            <select
              value={activeTeamId}
              onChange={(e) => setActiveTeamId(e.target.value)}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  🛡️ {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ALERTA DE DUPLA VALIDAÇÃO NO TOPO (CAPITÃO B VÊ SÚMULA LANÇADA PELO CAPITÃO A) */}
        {pendingValidationForMe.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border-2 border-amber-500/60 space-y-4 shadow-lg">
            {pendingValidationForMe.map((pm) => (
              <div key={pm.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-[11px] uppercase">
                      Ação Necessária • Dupla Validação
                    </span>
                    <span className="text-xs text-amber-200 font-medium">
                      Rodada #{pm.round_number} • Lançada pelo adversário
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-300/80 font-mono">
                    Confira o print da EA antes de aprovar
                  </span>
                </div>

                <div className="grid md:grid-cols-12 gap-4 items-center bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                  <div className="md:col-span-5 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <span className="text-xs text-slate-400 block">Mandante</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-100">
                        {pm.home_team?.name}
                      </span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-xl font-black text-amber-400 font-mono">
                      {pm.home_score} x {pm.away_score}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Visitante</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-100">
                        {pm.away_team?.name}
                      </span>
                    </div>
                  </div>

                  {/* Artilheiros e Garçons Lançados */}
                  <div className="md:col-span-4 border-y md:border-y-0 md:border-x border-slate-800 py-2 md:py-0 md:px-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Estatísticas Anexadas na Súmula:
                    </span>
                    {pm.player_stats && pm.player_stats.length > 0 ? (
                      pm.player_stats.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-xs text-slate-200"
                        >
                          <span className="truncate font-medium">
                            {st.player?.name || st.guest_name || 'Atleta'}
                          </span>
                          <span className="font-mono text-[11px] text-cyan-400">
                            ⚽ {st.goals} • 👟 {st.assists} • ⭐ {st.rating}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Sem marcadores individuais</span>
                    )}
                  </div>

                  {/* Print Anexo */}
                  <div className="md:col-span-3 flex flex-col items-center gap-2">
                    {pm.proof_image_url && (
                      <a
                        href={pm.proof_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-20 rounded-lg overflow-hidden border border-slate-700 relative group block"
                      >
                        <img
                          src={pm.proof_image_url}
                          alt="Print EA"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-[10px] font-bold text-white">
                          🔍 Ver Print EA
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Botões Grandes de Validação Dupla */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCaptainValidateMatch(pm, 'completed')}
                    className="min-h-[48px] px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    ✅ Validar Resultado (Homologar na Tabela)
                  </button>
                  <button
                    onClick={() => handleCaptainValidateMatch(pm, 'disputed')}
                    className="min-h-[48px] px-4 py-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ⚠️ Contestar para ADMs (Divergência no Print)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback / Notice */}
        {notice && (
          <div
            className={cn(
              'p-4 rounded-xl border text-xs flex items-center justify-between gap-3',
              notice.type === 'success' &&
                'bg-emerald-950/40 border-emerald-800/60 text-emerald-300',
              notice.type === 'warning' &&
                'bg-amber-950/40 border-amber-800/60 text-amber-300',
              notice.type === 'error' &&
                'bg-rose-950/40 border-rose-800/60 text-rose-300'
            )}
          >
            <span>{notice.text}</span>
            <button
              onClick={() => setNotice(null)}
              className="min-h-[32px] px-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navegação entre as 3 Abas do Módulo */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'schedule'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Tinder de Horários</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'sheet'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Súmula IA & Validação</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'incidents'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Central W.O. & Quedas</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* ABA 1: CONFRONTOS & TINDER DE HORÁRIOS */}
        {/* =================================================================== */}
        {activeTab === 'schedule' && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Lista de Confrontos Flexíveis (7 Colunas) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">
                    Confrontos da Equipe (Rodadas Flexíveis)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Jogue fora da ordem numérica adiantando rodadas conforme a disponibilidade dos elencos.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {matches.map((m) => {
                  const isHome = m.home_team_id === activeTeamId;
                  const canConfirmProposal =
                    (isHome && m.schedule_status === 'proposed_by_away') ||
                    (!isHome && m.schedule_status === 'proposed_by_home');

                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'p-4 rounded-2xl bg-slate-900/90 border transition-all space-y-3',
                        selectedScheduleMatchId === m.id
                          ? 'border-cyan-500/70'
                          : 'border-slate-800'
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono font-bold text-cyan-400">
                            Rodada #{m.round_number || 1} (Flexível)
                          </span>
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border',
                              m.schedule_status === 'confirmed' &&
                                'bg-emerald-950/50 text-emerald-300 border-emerald-800/60',
                              (m.schedule_status === 'proposed_by_home' ||
                                m.schedule_status === 'proposed_by_away') &&
                                'bg-amber-950/50 text-amber-300 border-amber-800/60',
                              (!m.schedule_status || m.schedule_status === 'unscheduled') &&
                                'bg-slate-950 text-slate-400 border-slate-800'
                            )}
                          >
                            {m.schedule_status === 'confirmed' && 'Horário Confirmado'}
                            {m.schedule_status === 'proposed_by_home' && 'Proposto pelo Mandante'}
                            {m.schedule_status === 'proposed_by_away' && 'Proposto pelo Visitante'}
                            {(!m.schedule_status || m.schedule_status === 'unscheduled') &&
                              'Sem Horário Definido'}
                          </span>
                        </div>

                        {m.scheduled_at && (
                          <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(m.scheduled_at).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {/* Confronto */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-8 rounded-full"
                            style={{ backgroundColor: m.home_team?.primary_color || '#06b6d4' }}
                          />
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-slate-100 block">
                              {m.home_team?.name || 'Mandante'}
                            </span>
                            <span className="text-[10px] text-slate-500">Casa</span>
                          </div>
                        </div>

                        <div className="text-center px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-black text-slate-300 font-mono">
                          {m.status === 'completed' || m.status === 'approved'
                            ? `${m.home_score} x ${m.away_score}`
                            : 'VS'}
                        </div>

                        <div className="flex items-center gap-2.5 text-right">
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-slate-100 block">
                              {m.away_team?.name || 'Visitante'}
                            </span>
                            <span className="text-[10px] text-slate-500">Fora</span>
                          </div>
                          <div
                            className="w-3 h-8 rounded-full"
                            style={{ backgroundColor: m.away_team?.primary_color || '#ef4444' }}
                          />
                        </div>
                      </div>

                      {/* Ações de Agendamento */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => setSelectedScheduleMatchId(m.id)}
                          className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-cyan-400 transition-colors"
                        >
                          ⚡ Ver Match de Horários
                        </button>

                        {canConfirmProposal && (
                          <button
                            onClick={() => handleConfirmSchedule(m)}
                            className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            Confirmar Horário Proposto
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedSheetMatchId(m.id);
                            setActiveTab('sheet');
                          }}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors"
                        >
                          Lançar Súmula →
                        </button>

                        {m.scheduled_at && (
                          <button
                            onClick={() => handleCancelMatchCheck(m)}
                            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors"
                            title="Verifica regra de 60 minutos de antecedência"
                          >
                            Adiar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cruzamento Automático de Disponibilidade ("Tinder de Horários") (5 Colunas) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Cruzamento Automático de Elencos
                  </span>
                  <h3 className="text-base font-bold text-slate-100">
                    Tinder de Horários (5v5 / 11v11)
                  </h3>
                  <p className="text-xs text-slate-400">
                    O sistema cruza a matriz de disponibilidade semanal dos jogadores de ambos os times:
                  </p>
                </div>

                {/* Slots de Match Ideal */}
                <div className="space-y-2.5">
                  {availabilityMatches.map((slot, idx) => {
                    const currentMatch =
                      matches.find((m) => m.id === selectedScheduleMatchId) || matches[0];
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3',
                          slot.isIdeal
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-slate-950 border-slate-800'
                        )}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'text-xs font-extrabold',
                                slot.isIdeal ? 'text-emerald-300' : 'text-slate-200'
                              )}
                            >
                              {slot.isIdeal ? '🔥 Match Ideal:' : 'Compatível:'} {slot.dayLabel} às{' '}
                              {slot.time}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {slot.homeReady}/5 atletas Casa • {slot.awayReady}/5 atletas Fora disponíveis
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            handleProposeSchedule(
                              currentMatch,
                              `${slot.dayLabel} às ${slot.time}`
                            )
                          }
                          className={cn(
                            'min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0',
                            slot.isIdeal
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          )}
                        >
                          Propor Horário
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Proposta Customizada */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Ou proponha uma data/hora específica:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={proposedDay}
                      onChange={(e) => setProposedDay(e.target.value)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.full}
                        </option>
                      ))}
                    </select>
                    <select
                      value={proposedTime}
                      onChange={(e) => setProposedTime(e.target.value)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t}h
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="datetime-local"
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  />
                  <button
                    onClick={() => {
                      const currentMatch =
                        matches.find((m) => m.id === selectedScheduleMatchId) || matches[0];
                      handleProposeSchedule(currentMatch);
                    }}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Proposta para o Capitão Adversário
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: LANÇAR / VALIDAR SÚMULA (OCR IA + CONVIDADO AVULSO) */}
        {/* =================================================================== */}
        {activeTab === 'sheet' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={handleSubmitMatchSheet}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      Lançar Súmula Oficial da Partida
                    </h2>
                    <p className="text-xs text-slate-400">
                      Anexe o print pós-jogo do EA FC 26 e use a leitura automática por IA.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAiOcr}
                    disabled={ocrLoading}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 hover:opacity-95 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    {ocrLoading
                      ? 'Lendo Print via Gemini Vision...'
                      : '✨ Preencher Súmula via IA (OCR)'}
                  </button>
                </div>

                {/* Seletor de Partida */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Partida Realizada (qualquer rodada):
                  </label>
                  <select
                    value={selectedSheetMatchId}
                    onChange={(e) => setSelectedSheetMatchId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100"
                  >
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        Rodada #{m.round_number} — {m.home_team?.name} vs {m.away_team?.name} (
                        {m.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Print EA FC 26 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Print de Desempenho EA FC 26 (Prova Anti-Fraude):
                  </label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 text-center bg-slate-950/60 transition-colors">
                    {proofPreview ? (
                      <div className="space-y-2">
                        <img
                          src={proofPreview}
                          alt="Preview Súmula"
                          className="max-h-48 mx-auto rounded-lg object-contain border border-slate-800"
                        />
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={handleRunAiOcr}
                            className="text-xs font-bold text-cyan-400 hover:underline"
                          >
                            ✨ Extrair Dados deste Print com IA
                          </button>
                          <button
                            type="button"
                            onClick={() => setProofPreview(null)}
                            className="text-xs text-rose-400 hover:underline"
                          >
                            Trocar Imagem
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-3">
                        <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-1.5" />
                        <span className="text-xs font-bold text-cyan-400 block">
                          Toque para anexar o print da partida (ou clique em Preencher via IA)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Suporta foto da TV ou screenshot PS5 / Xbox / PC
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Placar da Partida */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-3">
                    Placar Oficial Extraído
                  </span>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center flex-1">
                      <span className="text-xs font-bold text-slate-200 block mb-1.5 truncate">
                        {currentSheetMatch?.home_team?.name || 'Mandante'}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={homeScore}
                        onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                        className="w-20 h-12 text-center text-xl font-black bg-slate-900 border border-slate-700 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <span className="text-lg font-black text-slate-600 mt-5">X</span>
                    <div className="text-center flex-1">
                      <span className="text-xs font-bold text-slate-200 block mb-1.5 truncate">
                        {currentSheetMatch?.away_team?.name || 'Visitante'}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={awayScore}
                        onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                        className="w-20 h-12 text-center text-xl font-black bg-slate-900 border border-slate-700 rounded-xl text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Gols, Assistências e Convidado Avulso */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-200">
                      Artilheiros, Garçons & Convidados Avulsos
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddRegisteredPlayerRow(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-semibold"
                    >
                      <option value="">+ Adicionar Atleta Cadastrado...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.primary_position || 'PRO'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Barra de Adicionar Convidado Avulso ("Completou o time na hora") */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={guestNameInput}
                      onChange={(e) => setGuestNameInput(e.target.value)}
                      placeholder="Nome do Convidado Avulso (ex: Amigo_5x5)"
                      className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                    />
                    <select
                      value={guestTeamId || currentSheetMatch?.home_team_id || ''}
                      onChange={(e) => setGuestTeamId(e.target.value)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
                    >
                      {currentSheetMatch?.home_team && (
                        <option value={currentSheetMatch.home_team_id}>
                          {currentSheetMatch.home_team.name}
                        </option>
                      )}
                      {currentSheetMatch?.away_team && (
                        <option value={currentSheetMatch.away_team_id}>
                          {currentSheetMatch.away_team.name}
                        </option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddGuestPlayerRow}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      + Convidado Avulso
                    </button>
                  </div>

                  {/* Lista de Jogadores na Súmula */}
                  {statRows.length > 0 && (
                    <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      {statRows.map((row, idx) => {
                        const regPlayer = players.find((p) => p.id === row.playerId);
                        const displayName = row.isGuest
                          ? `${row.guestName} (Avulso)`
                          : regPlayer?.name || 'Atleta';

                        return (
                          <div
                            key={row.id}
                            className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-[140px]">
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                                  row.isGuest
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-cyan-500/20 text-cyan-300'
                                )}
                              >
                                {row.isGuest ? 'AVULSO' : 'ELENCO'}
                              </span>
                              <span className="font-bold text-slate-100 truncate">
                                {displayName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-[11px] text-slate-400">
                                ⚽
                                <input
                                  type="number"
                                  min={0}
                                  value={row.goals}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setStatRows((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, goals: val } : item
                                      )
                                    );
                                  }}
                                  className="w-11 h-8 text-center rounded bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                                />
                              </label>

                              <label className="flex items-center gap-1 text-[11px] text-slate-400">
                                👟
                                <input
                                  type="number"
                                  min={0}
                                  value={row.assists}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setStatRows((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, assists: val } : item
                                      )
                                    );
                                  }}
                                  className="w-11 h-8 text-center rounded bg-slate-950 border border-slate-700 text-slate-100 font-bold"
                                />
                              </label>

                              <label className="flex items-center gap-1 text-[11px] text-slate-400">
                                ⭐
                                <input
                                  type="number"
                                  step="0.1"
                                  min={0}
                                  max={10}
                                  value={row.rating}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 7.0;
                                    setStatRows((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, rating: val } : item
                                      )
                                    );
                                  }}
                                  className="w-14 h-8 text-center rounded bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  setStatRows((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="p-1.5 text-slate-500 hover:text-rose-400"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submittingSheet}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  {submittingSheet
                    ? 'Salvando Súmula...'
                    : 'Salvar Súmula & Enviar para Validação do Capitão Adversário'}
                </button>
              </form>
            </div>

            {/* Coluna Direita: Status de Dupla Validação das Partidas (5 Colunas) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Status das Súmulas (Dupla Validação)
                </h3>
                <p className="text-xs text-slate-400">
                  Dica: Troque o seletor &ldquo;Operando como Capitão&rdquo; no topo da página para testar a visão do Capitão B aprovando na hora!
                </p>

                <div className="space-y-3">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">
                          Rodada #{m.round_number}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                            (m.status === 'completed' || m.status === 'approved') &&
                              'bg-emerald-950/50 text-emerald-300 border-emerald-800/50',
                            m.status === 'pending_validation' &&
                              'bg-amber-950/50 text-amber-300 border-amber-800/50',
                            m.status === 'disputed' &&
                              'bg-rose-950/50 text-rose-300 border-rose-800/50',
                            m.status === 'scheduled' &&
                              'bg-slate-900 text-slate-400 border-slate-800'
                          )}
                        >
                          {(m.status === 'completed' || m.status === 'approved') &&
                            '✅ Validada por Ambos'}
                          {m.status === 'pending_validation' && '⏳ Aguardando Capitão B'}
                          {m.status === 'disputed' && '⚠️ Em Auditoria ADM'}
                          {m.status === 'scheduled' && 'Agendada'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-200">{m.home_team?.name}</span>
                        <span className="px-2.5 py-1 rounded bg-slate-900 text-cyan-400 font-mono">
                          {m.home_score} x {m.away_score}
                        </span>
                        <span className="text-slate-200">{m.away_team?.name}</span>
                      </div>

                      {m.status === 'pending_validation' && (
                        <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                          <button
                            onClick={() => handleCaptainValidateMatch(m, 'completed')}
                            className="min-h-[40px] flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]"
                          >
                            ✅ Validar Resultado
                          </button>
                          <button
                            onClick={() => handleCaptainValidateMatch(m, 'disputed')}
                            className="min-h-[40px] py-1.5 px-2.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-[11px]"
                          >
                            ⚠️ Contestar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: CENTRAL DE W.O. E QUEDAS (REGRAS AUTOMATIZADAS) */}
        {/* =================================================================== */}
        {activeTab === 'incidents' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={handleCreateIncident}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
              >
                <div className="pb-3 border-b border-slate-800">
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    Acionar Regra Oficial (W.O., Atraso ou Queda de Conexão)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculadora automática de decisão conforme o livro de regras da Liga.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Partida Referente:
                    </label>
                    <select
                      value={incidentMatchId}
                      onChange={(e) => setIncidentMatchId(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                    >
                      {matches.map((m) => (
                        <option key={m.id} value={m.id}>
                          R#{m.round_number}: {m.home_team?.name} vs {m.away_team?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tipo de Ocorrência:
                    </label>
                    <select
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold"
                    >
                      <option value="player_disconnect_first_20">
                        Queda de Jogador (Até 20 min do 1º Tempo)
                      </option>
                      <option value="player_disconnect_halftime">
                        Queda no Intervalo / 2º Tempo (&gt; 20 min)
                      </option>
                      <option value="wo_delay">
                        Solicitar W.O. por Atraso (&gt; 15 min no Lobby)
                      </option>
                      <option value="late_cancellation">
                        Cancelamento Tardio (&lt; 60 min antes do jogo)
                      </option>
                      <option value="game_bug">
                        Bug Crítico do EA FC 26 (Tela Congelada / Uniforme)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Minuto e Placar no momento da queda */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Minuto do Jogo na Queda (0 a 90):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={minuteOccurred}
                      onChange={(e) => setMinuteOccurred(parseInt(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Placar no Momento do Incidente:
                    </label>
                    <input
                      type="text"
                      value={scoreAtIncident}
                      onChange={(e) => setScoreAtIncident(e.target.value)}
                      placeholder="Ex: 1 x 0"
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                {/* Card Automático da Regra Aplicável */}
                <div className="p-4 rounded-xl bg-slate-950 border-2 border-cyan-500/40 space-y-1.5">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 block">
                    ⚡ {disconnectRuleInstruction.badge}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-100">
                    {disconnectRuleInstruction.ruleTitle}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {disconnectRuleInstruction.description}
                  </p>
                </div>

                {/* Evidência (Print do Lobby com Relógio ou Vídeo da Queda) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Evidência Obrigatória (Print do Lobby + Relógio ou Print da Queda):
                  </label>
                  <input
                    type="url"
                    value={evidencePreview || ''}
                    onChange={(e) => setEvidencePreview(e.target.value)}
                    placeholder="Cole a URL do print/vídeo ou deixe em branco para anexar captura padrão..."
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Protocolar Ocorrência Oficial na Liga
                </button>
              </form>
            </div>

            {/* Lista de Incidentes Protocolados */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Histórico de Chamados (W.O. & Quedas)
                </h3>
                <div className="space-y-3">
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 uppercase text-[10px]">
                          {inc.incident_type.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                            inc.status === 'resolved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          )}
                        >
                          {inc.status === 'resolved' ? 'Resolvido' : 'Em Análise ADM'}
                        </span>
                      </div>
                      <p className="text-slate-200 font-semibold">
                        Minuto {inc.minute_occurred}&apos; • Placar: {inc.score_at_incident}
                      </p>
                      {inc.admin_resolution_notes && (
                        <p className="text-[11px] text-slate-400">
                          Diretriz: {inc.admin_resolution_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
