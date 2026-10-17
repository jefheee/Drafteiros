'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeagueStore, uploadMediaToStorage } from '@/lib/data-store';
import { EVENT_ASSETS } from '@/lib/assets-catalog';
import { AvailabilitySlotRange } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Upload,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

const INTERVAL_PRESETS: AvailabilitySlotRange[] = [
  { id: 'morning', label: '🌅 Manhã (08:00 às 12:00)', start: '08:00', end: '12:00' },
  { id: 'afternoon', label: '☀️ Tarde (13:00 às 18:00)', start: '13:00', end: '18:00' },
  { id: 'early_night', label: '🌆 Início da Noite (18:00 às 21:00)', start: '18:00', end: '21:00' },
  { id: 'peak_night', label: '🔥 Noite Pico (21:00 às 00:00)', start: '21:00', end: '00:00' },
  { id: 'late_night', label: '🦉 Madrugada (00:00 às 03:00)', start: '00:00', end: '03:00' },
];

export default function MatchesPage() {
  const { matches, teams, players, tournament, updateMatchInStore } = useLeagueStore();

  const [mounted, setMounted] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches[0]?.id || 'match-furia-catimba'
  );
  const [activeSubTab, setActiveSubTab] = useState<'sumula_ocr' | 'tinder_schedule' | 'wo_rules'>(
    'sumula_ocr'
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const selectedMatch = useMemo(
    () => matches.find((m) => m.id === selectedMatchId) || matches[0],
    [matches, selectedMatchId]
  );

  const homeTeam = useMemo(
    () =>
      selectedMatch?.home_team ||
      teams.find((t) => t.id === selectedMatch?.home_team_id) ||
      teams[0],
    [selectedMatch, teams]
  );

  const awayTeam = useMemo(
    () =>
      selectedMatch?.away_team ||
      teams.find((t) => t.id === selectedMatch?.away_team_id) ||
      teams[1],
    [selectedMatch, teams]
  );

  // Estado Súmula / OCR
  const [ocrLoading, setOcrLoading] = useState(false);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>(
    selectedMatch?.proof_image_url || ''
  );
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Estado Tinder de Horários por Intervalos
  const [selectedDayLabel, setSelectedDayLabel] = useState('Terça-feira');
  const [selectedIntervals, setSelectedIntervals] = useState<AvailabilitySlotRange[]>([
    INTERVAL_PRESETS[3],
  ]);
  const [customStart, setCustomStart] = useState('21:30');
  const [customEnd, setCustomEnd] = useState('23:30');

  const homeRoster = useMemo(
    () => players.filter((p) => p.team_id === homeTeam?.id),
    [players, homeTeam?.id]
  );
  const awayRoster = useMemo(
    () => players.filter((p) => p.team_id === awayTeam?.id),
    [players, awayTeam?.id]
  );

  // Upload Real do Print de Desempenho + OCR Gemini Vision
  const handleProofAndOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMatch) return;

    setOcrLoading(true);
    setFeedbackMsg('Enviando print para o Storage match-proofs e lendo placar/artilheiros via IA...');

    try {
      const storageUrl = await uploadMediaToStorage(
        'match-proofs',
        `match-${selectedMatch.id}`,
        file
      );
      setProofPreviewUrl(storageUrl);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/ai-studio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ocr_match_sheet',
              imageBase64: base64,
              mimeType: file.type || 'image/jpeg',
              homeTeamName: homeTeam?.name,
              awayTeamName: awayTeam?.name,
            }),
          });
          const json = await res.json();
          if (json.ok && json.data) {
            await updateMatchInStore(selectedMatch.id, {
              home_score: json.data.home_score,
              away_score: json.data.away_score,
              status: 'pending_validation',
              proof_image_url: storageUrl,
              ocr_extracted_data: {
                home_score: json.data.home_score,
                away_score: json.data.away_score,
                motm_name: json.data.motm_name,
                confidence: json.data.confidence,
                players: json.data.players || [],
              },
            });
            setFeedbackMsg(
              `✅ Súmula lida por IA (${json.data.home_score} x ${json.data.away_score}) e salva! Aguardando aprovação do Capitão B.`
            );
          }
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setOcrLoading(false);
    }
  };

  // Aprovação Dupla Validação (Capitão B aprova -> atualiza Tabela e Rankings instantaneamente)
  const handleApproveMatchSheet = async () => {
    if (!selectedMatch) return;
    await updateMatchInStore(selectedMatch.id, {
      status: 'approved',
      validated_by: awayTeam?.captain_id || 'cap-b',
    });
    setFeedbackMsg(
      '✅ Súmula validada! Classificação (G4) e Artilharia (Character Name) atualizadas em tempo real.'
    );
  };

  const toggleIntervalSelection = (preset: AvailabilitySlotRange) => {
    setSelectedIntervals((prev) => {
      const exists = prev.some((i) => i.id === preset.id);
      return exists ? prev.filter((i) => i.id !== preset.id) : [...prev, preset];
    });
  };

  const handleAddCustomWindow = () => {
    const customRange: AvailabilitySlotRange = {
      id: `custom-${Date.now()}`,
      label: `⏱️ Das ${customStart} às ${customEnd}`,
      start: customStart,
      end: customEnd,
    };
    setSelectedIntervals((prev) => [...prev, customRange]);
  };

  const handleConfirmScheduleWindow = async () => {
    if (!selectedMatch) return;
    const summarySlots = selectedIntervals.map(
      (s) => `${selectedDayLabel} • ${s.label}`
    );
    await updateMatchInStore(selectedMatch.id, {
      schedule_status: 'confirmed',
      proposed_slots: summarySlots,
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    });
    setFeedbackMsg(
      `✅ Janela de horário confirmada (${summarySlots.join(', ')}) e notificada aos dois elencos!`
    );
  };

  const handleApplyOfficialWO = async (winnerSide: 'home' | 'away') => {
    if (!selectedMatch) return;
    await updateMatchInStore(selectedMatch.id, {
      home_score: winnerSide === 'home' ? 3 : 0,
      away_score: winnerSide === 'away' ? 3 : 0,
      status: 'wo',
      incident_type: 'wo',
      incident_report: `W.O. oficial 3x0 aplicado conforme regulamento (${
        tournament.rules_config?.wo_tolerance_minutes || 15
      } min de tolerância).`,
    });
    setFeedbackMsg('✅ Placar oficial de W.O. (3 x 0) registrado na partida.');
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 sm:px-4 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-3xl mx-auto space-y-4">
        {/* SELETOR DE PARTIDAS DA RODADA */}
        <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                Central de Partidas • Súmula IA & Agenda
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold">
                Jogos da Rodada & Validação
              </h1>
            </div>
            <Link
              href="/studio"
              className="px-3 py-2 rounded-2xl bg-[#7C5CFC] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Gerar Arte 4:5
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {matches.map((m) => {
              const isSelected = m.id === selectedMatch?.id;
              const hName = m.home_team?.name || 'Mandante';
              const aName = m.away_team?.name || 'Visitante';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMatchId(m.id);
                    setProofPreviewUrl(m.proof_image_url || '');
                    setFeedbackMsg(null);
                  }}
                  className={cn(
                    'p-3.5 rounded-2xl border text-left transition-all space-y-1.5',
                    isSelected
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/10 shadow-xs'
                      : 'border-zinc-100 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/50'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] font-extrabold">
                    <span className="text-zinc-500">Rodada #{m.round_number || 1}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full',
                        m.status === 'approved' || m.status === 'completed'
                          ? 'bg-[#38C958]/15 text-[#229a3e]'
                          : 'bg-amber-500/15 text-amber-600'
                      )}
                    >
                      {m.status === 'approved' || m.status === 'completed'
                        ? 'Validada'
                        : m.status === 'pending_validation'
                        ? 'Pendente B'
                        : 'Agendada'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs font-black" suppressHydrationWarning>
                    <span className="truncate">{hName}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-900 text-[#7C5CFC] shrink-0">
                      {m.home_score} - {m.away_score}
                    </span>
                    <span className="truncate text-right">{aName}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {feedbackMsg && (
            <div className="p-3 rounded-2xl bg-[#38C958]/15 border border-[#38C958]/30 text-[#229a3e] dark:text-[#38C958] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </section>

        {/* SUB-ABAS DA PARTIDA SELECIONADA */}
        <div className="p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('sumula_ocr')}
            className={cn(
              'py-2 px-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1',
              activeSubTab === 'sumula_ocr'
                ? 'bg-[#7C5CFC] text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Súmula IA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('tinder_schedule')}
            className={cn(
              'py-2 px-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1',
              activeSubTab === 'tinder_schedule'
                ? 'bg-[#7C5CFC] text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tinder Horários</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('wo_rules')}
            className={cn(
              'py-2 px-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1',
              activeSubTab === 'wo_rules'
                ? 'bg-[#7C5CFC] text-white'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">W.O. & Regras</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* SUB-ABA 1: SÚMULA POR FOTO IA + DUPLA VALIDAÇÃO                   */}
        {/* ================================================================= */}
        {activeSubTab === 'sumula_ocr' && selectedMatch && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold" suppressHydrationWarning>
                  {homeTeam?.name} {selectedMatch.home_score} - {selectedMatch.away_score}{' '}
                  {awayTeam?.name}
                </h2>
                <p className="text-xs text-zinc-500">
                  Envie o print de Desempenho de Jogadores do EA FC 26. Ele fica salvo para conferência do Admin.
                </p>
              </div>

              <label className="cursor-pointer py-2.5 px-4 rounded-2xl bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-extrabold text-xs flex items-center gap-2 shadow-sm shrink-0">
                <Upload className="w-4 h-4" />
                <span>
                  {ocrLoading ? 'Lendo Print...' : '📸 Subir Print de Desempenho (OCR)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofAndOcrUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview do Print Salvo para o Admin */}
            {(proofPreviewUrl || selectedMatch.proof_image_url) && (
              <div className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <span className="text-[11px] font-extrabold text-[#38C958] block">
                  ✅ Print Oficial de Desempenho Anexado (Visível para o Admin):
                </span>
                <img
                  src={proofPreviewUrl || selectedMatch.proof_image_url || ''}
                  alt="Print da Partida"
                  className="w-full max-h-56 object-contain rounded-xl bg-zinc-950"
                />
              </div>
            )}

            {/* Lista de Estatísticas por Nome do Personagem (Character Name) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                  Desempenho Extraído por Personagem (Character Name)
                </span>
                {selectedMatch.ocr_extracted_data?.motm_name && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[11px] font-black flex items-center gap-1">
                    <img
                      src="/assets/events/motm.png"
                      alt="MVP"
                      className="w-4 h-4 object-contain"
                    />
                    MVP: {selectedMatch.ocr_extracted_data.motm_name}
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {(selectedMatch.ocr_extracted_data?.players || []).map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-black uppercase text-zinc-900 dark:text-white block">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {p.team === 'home' ? homeTeam?.name : awayTeam?.name} • Nota{' '}
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black">
                      {p.goals > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC]">
                          {p.goals} ⚽
                        </span>
                      )}
                      {p.assists > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#38C958]/15 text-[#229a3e]">
                          {p.assists} 👟
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de Dupla Validação (Capitão B aprova) */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {EVENT_ASSETS.slice(0, 4).map((ev) => (
                  <img
                    key={ev.id}
                    src={ev.iconUrl}
                    alt={ev.name}
                    title={ev.name}
                    className="w-6 h-6 object-contain"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleApproveMatchSheet}
                className="py-3 px-5 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs flex items-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Aprovar Súmula (Dupla Validação Capitão B)</span>
              </button>
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* SUB-ABA 2: TINDER DE HORÁRIOS POR INTERVALOS                      */}
        {/* ================================================================= */}
        {activeSubTab === 'tinder_schedule' && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div>
              <h2 className="text-base font-extrabold">
                Tinder de Horários por Intervalos ({homeTeam?.name} vs {awayTeam?.name})
              </h2>
              <p className="text-xs text-zinc-500">
                Selecione turnos inteiros ou defina a faixa personalizada (ex: Das 21:30 às 23:30) para bater a agenda dos dois elencos.
              </p>
            </div>

            {/* Dia da Semana */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[
                'Segunda-feira',
                'Terça-feira',
                'Quarta-feira',
                'Quinta-feira',
                'Sexta-feira',
                'Sábado',
                'Domingo',
              ].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDayLabel(day)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-extrabold shrink-0 transition-all',
                    selectedDayLabel === day
                      ? 'bg-[#7C5CFC] text-white'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Intervalos Predefinidos */}
            <div className="grid sm:grid-cols-2 gap-2.5">
              {INTERVAL_PRESETS.map((preset) => {
                const isSelected = selectedIntervals.some((i) => i.id === preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => toggleIntervalSelection(preset)}
                    className={cn(
                      'p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between',
                      isSelected
                        ? 'border-[#38C958] bg-[#38C958]/10 font-extrabold'
                        : 'border-zinc-100 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/50 text-xs font-semibold'
                    )}
                  >
                    <span className="text-xs">{preset.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#38C958]" />}
                  </button>
                );
              })}
            </div>

            {/* Faixa Personalizada */}
            <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7C5CFC]" />
                <span className="text-xs font-extrabold">Janela Livre: Das</span>
                <input
                  type="time"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
                <span className="text-xs font-extrabold">às</span>
                <input
                  type="time"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-8 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomWindow}
                className="px-3 py-1.5 rounded-xl bg-[#7C5CFC] text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Janela
              </button>
            </div>

            {/* Cruzamento de Disponibilidade dos Elencos */}
            <div className="p-3.5 rounded-2xl bg-[#38C958]/10 border border-[#38C958]/30 space-y-1.5">
              <span className="text-xs font-black text-[#229a3e] dark:text-[#38C958] block">
                🔥 Match de Horário Detectado: {selectedDayLabel} • Noite Pico (21:30 às 23:30)
              </span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                <strong>{homeTeam?.name}:</strong> {homeRoster.length} atletas disponíveis (
                {homeRoster.map((p) => p.character_name).join(', ')}) •{' '}
                <strong>{awayTeam?.name}:</strong> {awayRoster.length} atletas disponíveis (
                {awayRoster.map((p) => p.character_name).join(', ')}).
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirmScheduleWindow}
              className="w-full py-3.5 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Janela Oficial da Partida</span>
            </button>
          </section>
        )}

        {/* ================================================================= */}
        {/* SUB-ABA 3: CENTRAL DE W.O. & REGRAS DA LIGA                       */}
        {/* ================================================================= */}
        {activeSubTab === 'wo_rules' && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/events/red-card.png"
                alt="W.O."
                className="w-10 h-10 object-contain"
              />
              <div>
                <h2 className="text-base font-extrabold">
                  Central Oficial de W.O. & Desconexão
                </h2>
                <p className="text-xs text-zinc-500">
                  Tolerância oficial: {tournament.rules_config?.wo_tolerance_minutes || 15} minutos • Aviso prévio mínimo: {tournament.rules_config?.cancel_notice_minutes || 40} minutos.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {(tournament.custom_rules || []).map((rule, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800/70 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  • {rule}
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleApplyOfficialWO('home')}
                className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs"
              >
                Declarar W.O. a favor de {homeTeam?.name} (3 x 0)
              </button>
              <button
                type="button"
                onClick={() => handleApplyOfficialWO('away')}
                className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs"
              >
                Declarar W.O. a favor de {awayTeam?.name} (3 x 0)
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
