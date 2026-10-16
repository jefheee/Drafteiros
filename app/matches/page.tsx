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
} from '@/lib/mock-league-data';
import { DAYS_OF_WEEK, TIME_SLOTS, cn } from '@/lib/utils';
import {
  CalendarCheck2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Camera,
  UserPlus,
  Send,
  X,
  Check,
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
    return [
      { dayKey: 'ter', dayLabel: 'Terça-feira', time: '22:30', homeReady: 5, awayReady: 5, isIdeal: true },
      { dayKey: 'ter', dayLabel: 'Terça-feira', time: '23:00', homeReady: 5, awayReady: 5, isIdeal: true },
      { dayKey: 'qui', dayLabel: 'Quinta-feira', time: '22:00', homeReady: 5, awayReady: 4, isIdeal: false },
      { dayKey: 'seg', dayLabel: 'Segunda-feira', time: '22:30', homeReady: 4, awayReady: 5, isIdeal: false },
    ];
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
  // HANDLERS ABA 2: OCR IA (ZERO DIGITAÇÃO) + DUPLA VALIDAÇÃO DE SÚMULA
  // =========================================================================
  const currentSheetMatch = useMemo(
    () => matches.find((m) => m.id === selectedSheetMatchId) || matches[0],
    [matches, selectedSheetMatchId]
  );

  const runAiOcrWithImage = async (base64Img?: string) => {
    setOcrLoading(true);
    setNotice(null);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ocr_match_sheet',
          imageBase64: base64Img || proofPreview || undefined,
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
        if (!base64Img && !proofPreview) {
          setProofPreview('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&q=80');
        }

        setNotice({
          type: 'success',
          text: `✨ Zero Digitação: Gemini Vision leu a foto e preencheu placar (${ocr.home_score} x ${ocr.away_score}) e ${mappedRows.length} atletas!`,
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

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProofPreview(base64);
      // Zero Digitação: dispara o OCR automaticamente assim que o capitão seleciona a foto!
      runAiOcrWithImage(base64);
    };
    reader.readAsDataURL(file);
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
        text: `✅ Resultado homologado por Dupla Validação (${match.home_team?.name} ${match.home_score} x ${match.away_score} ${match.away_team?.name})! Classificação e artilharia atualizadas!`,
      });
    } else {
      setNotice({
        type: 'warning',
        text: `⚠️ Súmula contestada! O confronto foi enviado para a Auditoria da Administração.`,
      });
    }
  };

  // =========================================================================
  // HANDLERS ABA 3: CENTRAL DE W.O. E QUEDAS (REGULAMENTO LPF)
  // =========================================================================
  const disconnectRuleInstruction = useMemo(() => {
    if (
      incidentType === 'player_disconnect_first_20' ||
      (incidentType === 'player_disconnect_halftime' && minuteOccurred <= 20)
    ) {
      return {
        badge: 'QUEDA ATÉ OS 20 MINUTOS DO 1º TEMPO',
        ruleTitle: 'Reiniciar Partida Completa (90 min) Mantendo Placar e Gols',
        description:
          'Pelo regulamento oficial da Liga: como a desconexão ocorreu até os 20 minutos de jogo, os times devem sair para o lobby, reiniciar uma nova partida completa de 90 minutos e SOMAR o placar/artilharia que já havia ocorrido antes da queda.',
      };
    }
    if (incidentType === 'player_disconnect_halftime') {
      return {
        badge: 'QUEDA APÓS OS 20 MIN / INTERVALO / 2º TEMPO',
        ruleTitle: 'Reiniciar e Jogar Apenas 1 Tempo (45 min) Mantendo Placar',
        description:
          'Pelo regulamento oficial da Liga: quedas após os 20 minutos ou no intervalo exigem reinício imediato jogando APENAS 1 TEMPO (até o apito do intervalo da nova partida), mantendo os gols e cartões registrados anteriormente.',
      };
    }
    if (incidentType === 'wo_delay') {
      return {
        badge: 'TOLERÂNCIA DE ATRASO EXCEDIDA (> 15 MIN)',
        ruleTitle: 'Solicitação de Vitória por W.O. (3 x 0)',
        description:
          'Obrigatório anexar captura de tela do lobby do EA FC 26 mostrando os 5 jogadores do seu time prontos + horário visível comprovando os 15 minutos de tolerância após o horário agendado.',
      };
    }
    return {
      badge: 'OCORRÊNCIA DE PARTIDA / CANCELAMENTO TARDIO',
      ruleTitle: 'Análise Técnica pela Diretoria da Liga',
      description:
        'Cancelamentos feitos com menos de 60 minutos de antecedência do horário batido geram W.O. automático, salvo se o capitão adversário aceitar remarcar formalmente.',
    };
  }, [incidentType, minuteOccurred]);

  const handleEvidencePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidencePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-4 py-5 pb-28">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Topo Clean Jogueiros + Seletor de Capitão A / B */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-[11px] font-extrabold">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              Jogos, Súmula por Foto & Regras LPF
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Agenda & Súmula Inteligente
            </h1>
            <p className="text-xs text-zinc-500">
              Bata horários sem caos no WhatsApp e envie apenas a foto da TV para a IA preencher tudo.
            </p>
          </div>

          <div className="flex flex-col gap-1 bg-[#F5F6FA] dark:bg-zinc-800 p-2.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-700 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 px-1">
              Simular visão do Capitão:
            </span>
            <select
              value={activeTeamId}
              onChange={(e) => setActiveTeamId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-[#7C5CFC] focus:outline-none"
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
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-[#7C5CFC] shadow-[0_8px_30px_-4px_rgba(124,92,252,0.18)] space-y-4">
            {pendingValidationForMe.map((pm) => (
              <div key={pm.id} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#7C5CFC] text-white font-extrabold text-[11px]">
                      Validação Dupla Pendente
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-300 font-bold">
                      Rodada #{pm.round_number} • Lançada pelo Capitão Adversário
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Confira a foto oficial da partida antes de aprovar
                  </span>
                </div>

                <div className="grid md:grid-cols-12 gap-4 items-center bg-[#F5F6FA] dark:bg-zinc-800/80 p-4 rounded-2xl">
                  <div className="md:col-span-5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block">Mandante</span>
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                        {pm.home_team?.name}
                      </span>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 text-lg font-black text-[#7C5CFC] shadow-sm">
                      {pm.home_score} x {pm.away_score}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-bold block">Visitante</span>
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                        {pm.away_team?.name}
                      </span>
                    </div>
                  </div>

                  {/* Artilheiros e Garçons Lançados */}
                  <div className="md:col-span-4 border-y md:border-y-0 md:border-x border-zinc-200 dark:border-zinc-700 py-2 md:py-0 md:px-4 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-zinc-400 block">
                      Extraído via IA da Foto:
                    </span>
                    {pm.player_stats && pm.player_stats.length > 0 ? (
                      pm.player_stats.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-xs text-zinc-800 dark:text-zinc-200"
                        >
                          <span className="truncate font-bold">
                            {st.player?.name || st.guest_name || 'Atleta'}
                          </span>
                          <span className="text-[11px] font-extrabold text-[#7C5CFC]">
                            ⚽ {st.goals} • 👟 {st.assists}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">Sem marcadores individuais</span>
                    )}
                  </div>

                  {/* Print Anexo */}
                  <div className="md:col-span-3">
                    {pm.proof_image_url && (
                      <a
                        href={pm.proof_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 relative block"
                      >
                        <img
                          src={pm.proof_image_url}
                          alt="Print EA"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-[10px] font-extrabold text-white">
                          🔍 Ver Print EA
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Botões Grandes de Validação Dupla (Padrão Jogueiros Green) */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCaptainValidateMatch(pm, 'completed')}
                    className="py-3.5 px-4 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    ✅ Validar Resultado (Homologar na Tabela)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCaptainValidateMatch(pm, 'disputed')}
                    className="py-3.5 px-4 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    ⚠️ Contestar para ADMs
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
              'p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3',
              notice.type === 'success' &&
                'bg-[#38C958]/15 border-[#38C958]/30 text-[#1f8a38] dark:text-[#38C958]',
              notice.type === 'warning' &&
                'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300',
              notice.type === 'error' &&
                'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-300'
            )}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="px-2 text-zinc-400 hover:text-zinc-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navegação entre as 3 Abas (Segmented Control Estilo Jogueiros) */}
        <div className="p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={cn(
              'py-2.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'schedule'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tinder de Horários</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={cn(
              'py-2.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'sheet'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Súmula por Foto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('incidents')}
            className={cn(
              'py-2.5 px-3 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'incidents'
                ? 'bg-[#7C5CFC] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">W.O. & Quedas</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* ABA 1: CONFRONTOS & TINDER DE HORÁRIOS                              */}
        {/* =================================================================== */}
        {activeTab === 'schedule' && (
          <div className="grid lg:grid-cols-12 gap-5">
            {/* Lista de Confrontos Flexíveis (7 Colunas) */}
            <div className="lg:col-span-7 space-y-3.5">
              {matches.map((m) => {
                const isHome = m.home_team_id === activeTeamId;
                const canConfirmProposal =
                  (isHome && m.schedule_status === 'proposed_by_away') ||
                  (!isHome && m.schedule_status === 'proposed_by_home');

                return (
                  <div
                    key={m.id}
                    className={cn(
                      'p-5 rounded-3xl bg-white dark:bg-zinc-900 border transition-all space-y-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]',
                      selectedScheduleMatchId === m.id
                        ? 'border-[#7C5CFC] ring-2 ring-[#7C5CFC]/15'
                        : 'border-zinc-100 dark:border-zinc-800'
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 text-[11px] font-extrabold text-[#7C5CFC]">
                          Rodada #{m.round_number || 1}
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[10px] font-extrabold',
                            m.schedule_status === 'confirmed' &&
                              'bg-[#38C958]/15 text-[#229a3e] dark:text-[#38C958]',
                            (m.schedule_status === 'proposed_by_home' ||
                              m.schedule_status === 'proposed_by_away') &&
                              'bg-amber-500/15 text-amber-600',
                            (!m.schedule_status || m.schedule_status === 'unscheduled') &&
                              'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
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
                        <span className="text-xs font-extrabold text-[#7C5CFC] flex items-center gap-1">
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
                    <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs"
                          style={{ backgroundColor: m.home_team?.primary_color || '#7C5CFC' }}
                        >
                          {(m.home_team?.name || 'CA').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 block">
                            {m.home_team?.name || 'Mandante'}
                          </span>
                          <span className="text-[10px] text-zinc-500">Casa</span>
                        </div>
                      </div>

                      <div className="text-center px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 text-xs font-black text-zinc-800 dark:text-zinc-200 shadow-sm">
                        {m.status === 'completed' || m.status === 'approved'
                          ? `${m.home_score} x ${m.away_score}`
                          : 'VS'}
                      </div>

                      <div className="flex items-center gap-2.5 text-right">
                        <div>
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 block">
                            {m.away_team?.name || 'Visitante'}
                          </span>
                          <span className="text-[10px] text-zinc-500">Fora</span>
                        </div>
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs"
                          style={{ backgroundColor: m.away_team?.primary_color || '#18181B' }}
                        >
                          {(m.away_team?.name || 'VI').substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Ações de Agendamento */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedScheduleMatchId(m.id)}
                        className="flex-1 py-2.5 px-3 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 hover:bg-zinc-200/70 text-xs font-extrabold text-[#7C5CFC] transition-colors"
                      >
                        ⚡ Ver Match de Horários
                      </button>

                      {canConfirmProposal && (
                        <button
                          type="button"
                          onClick={() => handleConfirmSchedule(m)}
                          className="flex-1 py-2.5 px-3 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Confirmar Horário
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSheetMatchId(m.id);
                          setActiveTab('sheet');
                        }}
                        className="py-2.5 px-3.5 rounded-full bg-[#7C5CFC]/10 hover:bg-[#7C5CFC]/20 text-[#7C5CFC] text-xs font-extrabold transition-colors"
                      >
                        Súmula por Foto →
                      </button>

                      {m.scheduled_at && (
                        <button
                          type="button"
                          onClick={() => handleCancelMatchCheck(m)}
                          className="py-2.5 px-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-500 text-xs font-bold transition-colors"
                          title="Trava de 60 minutos de antecedência"
                        >
                          Adiar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tinder de Horários (5 Colunas) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38C958]">
                    Cruzamento Automático de Elencos
                  </span>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    Tinder de Horários (5x5 / 11v11)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Horários em que ambos os elencos possuem quórum completo:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {availabilityMatches.map((slot, idx) => {
                    const currentMatch =
                      matches.find((m) => m.id === selectedScheduleMatchId) || matches[0];
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3',
                          slot.isIdeal
                            ? 'bg-[#38C958]/10 border-[#38C958]/30'
                            : 'bg-[#F5F6FA] dark:bg-zinc-800 border-zinc-200/60 dark:border-zinc-700'
                        )}
                      >
                        <div>
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 block">
                            {slot.isIdeal ? '🔥 Match Ideal:' : 'Compatível:'} {slot.dayLabel} às{' '}
                            {slot.time}
                          </span>
                          <span className="text-[11px] text-zinc-500 block">
                            {slot.homeReady}/5 Casa • {slot.awayReady}/5 Fora prontos
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleProposeSchedule(
                              currentMatch,
                              `${slot.dayLabel} às ${slot.time}`
                            )
                          }
                          className={cn(
                            'px-3.5 py-2 rounded-full text-xs font-extrabold transition-colors shrink-0',
                            slot.isIdeal
                              ? 'bg-[#38C958] hover:bg-[#2fb34d] text-white'
                              : 'bg-[#7C5CFC] text-white'
                          )}
                        >
                          Propor
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Proposta Customizada */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                    Ou proponha outro horário:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={proposedDay}
                      onChange={(e) => setProposedDay(e.target.value)}
                      className="px-3 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
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
                      className="px-3 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
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
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentMatch =
                        matches.find((m) => m.id === selectedScheduleMatchId) || matches[0];
                      handleProposeSchedule(currentMatch);
                    }}
                    className="w-full py-3 px-4 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Proposta de Jogo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: LANÇAR / VALIDAR SÚMULA (100% POR FOTO - ZERO DIGITAÇÃO)     */}
        {/* =================================================================== */}
        {activeTab === 'sheet' && (
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={handleSubmitMatchSheet}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC]">
                      Zero Digitação • Gemini Vision OCR
                    </span>
                    <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      Cadastrar Resultado por Foto
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Tire uma foto da tela pós-jogo e a IA preenche placar, gols e notas sozinha.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => runAiOcrWithImage()}
                    disabled={ocrLoading}
                    className="px-4 py-2.5 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    {ocrLoading ? 'Lendo Foto...' : '✨ Ler Súmula por IA'}
                  </button>
                </div>

                {/* Seletor de Partida */}
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Confronto Realizado:
                  </label>
                  <select
                    value={selectedSheetMatchId}
                    onChange={(e) => setSelectedSheetMatchId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                  >
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        Rodada #{m.round_number} — {m.home_team?.name} vs {m.away_team?.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Print EA FC 26 (Dispara OCR ao anexar) */}
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Foto / Print da Tela de Desempenho EA FC 26:
                  </label>
                  <div className="border-2 border-dashed border-[#7C5CFC]/40 hover:border-[#7C5CFC] rounded-3xl p-5 text-center bg-[#F5F6FA]/70 dark:bg-zinc-800/50 transition-colors">
                    {proofPreview ? (
                      <div className="space-y-3">
                        <img
                          src={proofPreview}
                          alt="Preview Súmula"
                          className="max-h-48 mx-auto rounded-2xl object-contain"
                        />
                        <div className="flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => runAiOcrWithImage(proofPreview)}
                            className="text-xs font-extrabold text-[#7C5CFC] hover:underline"
                          >
                            ✨ Reler Dados da Foto com IA
                          </button>
                          <button
                            type="button"
                            onClick={() => setProofPreview(null)}
                            className="text-xs font-bold text-rose-500 hover:underline"
                          >
                            Trocar Foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/10 text-[#7C5CFC] flex items-center justify-center mx-auto mb-2">
                          <Camera className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-extrabold text-[#7C5CFC] block">
                          📸 Enviar Print da Súmula (Leitura Automática IA)
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Ao selecionar a foto da TV ou PS5/Xbox/PC, o placar e gols são preenchidos na hora
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
                <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block text-center mb-3">
                    Placar Oficial Extraído
                  </span>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center flex-1">
                      <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 block mb-1.5 truncate">
                        {currentSheetMatch?.home_team?.name || 'Mandante'}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={homeScore}
                        onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                        className="w-20 h-12 text-center text-xl font-black bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[#7C5CFC]"
                      />
                    </div>
                    <span className="text-lg font-black text-zinc-400 mt-5">X</span>
                    <div className="text-center flex-1">
                      <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 block mb-1.5 truncate">
                        {currentSheetMatch?.away_team?.name || 'Visitante'}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={awayScore}
                        onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                        className="w-20 h-12 text-center text-xl font-black bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[#7C5CFC]"
                      />
                    </div>
                  </div>
                </div>

                {/* Gols, Assistências e Convidado Avulso */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                      Artilheiros, Garçons & Convidado Avulso
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddRegisteredPlayerRow(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-[#7C5CFC] font-extrabold"
                    >
                      <option value="">+ Atleta do Elenco...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.primary_position || 'PRO'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Barra de Adicionar Convidado Avulso */}
                  <div className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/80 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={guestNameInput}
                      onChange={(e) => setGuestNameInput(e.target.value)}
                      placeholder="Jogador Convidado Avulso (completou o time)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleAddGuestPlayerRow}
                      className="px-3.5 py-2 rounded-xl bg-[#7C5CFC]/15 text-[#7C5CFC] text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      + Avulso
                    </button>
                  </div>

                  {/* Lista de Jogadores na Súmula */}
                  {statRows.length > 0 && (
                    <div className="space-y-2 p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/60">
                      {statRows.map((row, idx) => {
                        const regPlayer = players.find((p) => p.id === row.playerId);
                        const displayName = row.isGuest
                          ? `${row.guestName} (Avulso)`
                          : regPlayer?.name || 'Atleta';

                        return (
                          <div
                            key={row.id}
                            className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-[130px]">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase',
                                  row.isGuest
                                    ? 'bg-amber-500/15 text-amber-600'
                                    : 'bg-[#7C5CFC]/10 text-[#7C5CFC]'
                                )}
                              >
                                {row.isGuest ? 'AVULSO' : 'ELENCO'}
                              </span>
                              <span className="font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                                {displayName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-[11px] font-bold text-zinc-500">
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
                                  className="w-11 h-8 text-center rounded-lg bg-[#F5F6FA] dark:bg-zinc-800 font-extrabold text-zinc-900 dark:text-zinc-100"
                                />
                              </label>

                              <label className="flex items-center gap-1 text-[11px] font-bold text-zinc-500">
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
                                  className="w-11 h-8 text-center rounded-lg bg-[#F5F6FA] dark:bg-zinc-800 font-extrabold text-zinc-900 dark:text-zinc-100"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  setStatRows((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="p-1 text-zinc-400 hover:text-rose-500"
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
                  className="w-full py-3.5 px-5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  {submittingSheet
                    ? 'Enviando Súmula...'
                    : 'Prosseguir e Enviar para Validação do Adversário'}
                </button>
              </form>
            </div>

            {/* Coluna Direita: Status de Dupla Validação das Partidas (5 Colunas) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                  Status das Súmulas (Dupla Validação)
                </h3>
                <p className="text-xs text-zinc-500">
                  Mude o seletor de Capitão no topo da tela para testar a visão do Capitão B aprovando em 1 toque.
                </p>

                <div className="space-y-3">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-500">
                          Rodada #{m.round_number}
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold',
                            (m.status === 'completed' || m.status === 'approved') &&
                              'bg-[#38C958]/15 text-[#229a3e] dark:text-[#38C958]',
                            m.status === 'pending_validation' &&
                              'bg-amber-500/15 text-amber-600',
                            m.status === 'disputed' &&
                              'bg-rose-500/15 text-rose-600',
                            m.status === 'scheduled' &&
                              'bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                          )}
                        >
                          {(m.status === 'completed' || m.status === 'approved') &&
                            '✅ Validada'}
                          {m.status === 'pending_validation' && '⏳ Aguardando Capitão B'}
                          {m.status === 'disputed' && '⚠️ Em Auditoria ADM'}
                          {m.status === 'scheduled' && 'Agendada'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="truncate">{m.home_team?.name}</span>
                        <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-900 text-[#7C5CFC]">
                          {m.home_score} x {m.away_score}
                        </span>
                        <span className="truncate">{m.away_team?.name}</span>
                      </div>

                      {m.status === 'pending_validation' && (
                        <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCaptainValidateMatch(m, 'completed')}
                            className="flex-1 py-2 px-3 rounded-full bg-[#38C958] text-white font-extrabold text-[11px]"
                          >
                            ✅ Validar Resultado
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCaptainValidateMatch(m, 'disputed')}
                            className="py-2 px-3 rounded-full bg-rose-500/15 text-rose-600 font-extrabold text-[11px]"
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
        {/* ABA 3: CENTRAL DE W.O. E QUEDAS (REGRAS AUTOMATIZADAS LPF)          */}
        {/* =================================================================== */}
        {activeTab === 'incidents' && (
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-4">
              <form
                onSubmit={handleCreateIncident}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4"
              >
                <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#7C5CFC]" />
                    Assistente de Regras LPF (W.O., Atraso ou Queda)
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Cálculo automático de decisão conforme o livro de regras da Liga 5x5 LPF.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                      Partida Referente:
                    </label>
                    <select
                      value={incidentMatchId}
                      onChange={(e) => setIncidentMatchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                    >
                      {matches.map((m) => (
                        <option key={m.id} value={m.id}>
                          R#{m.round_number}: {m.home_team?.name} vs {m.away_team?.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                      Ocorrência:
                    </label>
                    <select
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-[#7C5CFC] font-extrabold"
                    >
                      <option value="player_disconnect_first_20">
                        Queda de Conexão (Até 20 min do 1º Tempo)
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
                        Bug do EA FC 26 (Lobby / Congelamento)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Minuto e Placar no momento da queda */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                      Minuto do Jogo na Queda (0 a 90):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={minuteOccurred}
                      onChange={(e) => setMinuteOccurred(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                      Placar no Momento:
                    </label>
                    <input
                      type="text"
                      value={scoreAtIncident}
                      onChange={(e) => setScoreAtIncident(e.target.value)}
                      placeholder="Ex: 1 x 0"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                    />
                  </div>
                </div>

                {/* Card Automático da Regra Aplicável */}
                <div className="p-4 rounded-2xl bg-[#7C5CFC]/10 border border-[#7C5CFC]/30 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                    ⚡ {disconnectRuleInstruction.badge}
                  </span>
                  <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    {disconnectRuleInstruction.ruleTitle}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {disconnectRuleInstruction.description}
                  </p>
                </div>

                {/* Upload de Foto do Lobby com Relógio (Zero Digitação) */}
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Foto do Lobby EA FC 26 com Relógio / Print da Queda:
                  </label>
                  <label className="cursor-pointer flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#7C5CFC] bg-[#F5F6FA] dark:bg-zinc-800/60 text-xs font-extrabold text-[#7C5CFC]">
                    <Camera className="w-4 h-4" />
                    <span>
                      {evidencePreview
                        ? '✅ Foto Anexada (Toque para trocar)'
                        : '📸 Anexar Print do Lobby com Horário'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEvidencePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Protocolar Ocorrência Oficial na Liga
                </button>
              </form>
            </div>

            {/* Lista de Incidentes Protocolados */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                  Histórico de Chamados (W.O. & Quedas)
                </h3>
                <div className="space-y-3">
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#7C5CFC] uppercase text-[10px]">
                          {inc.incident_type.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold',
                            inc.status === 'resolved'
                              ? 'bg-[#38C958]/15 text-[#229a3e]'
                              : 'bg-amber-500/15 text-amber-600'
                          )}
                        >
                          {inc.status === 'resolved' ? 'Resolvido' : 'Em Análise ADM'}
                        </span>
                      </div>
                      <p className="text-zinc-900 dark:text-zinc-100 font-bold">
                        Minuto {inc.minute_occurred}&apos; • Placar: {inc.score_at_incident}
                      </p>
                      {inc.admin_resolution_notes && (
                        <p className="text-[11px] text-zinc-500">
                          Regra: {inc.admin_resolution_notes}
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
