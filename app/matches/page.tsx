'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Check,
} from 'lucide-react';
import {
  GlideSelect,
  SlideCommit,
  StatusMark,
  SquishSwitch,
  ClickSpark,
} from '@/components/react-bits';

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

  useEffect(() => {
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
  const [autoNotifyCaptain, setAutoNotifyCaptain] = useState(true);

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
    await updateMatchInStore(selectedMatch.id, {
      schedule_status: 'confirmed',
      scheduled_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    setFeedbackMsg(
      `📅 Horário confirmado oficialmente para ${selectedDayLabel}! Notificações enviadas aos capitães.`
    );
  };

  const handleApplyOfficialWO = async (winnerSide: 'home' | 'away') => {
    if (!selectedMatch) return;
    const isHome = winnerSide === 'home';
    await updateMatchInStore(selectedMatch.id, {
      home_score: isHome ? 3 : 0,
      away_score: isHome ? 0 : 3,
      status: 'approved',
      ocr_extracted_data: {
        home_score: isHome ? 3 : 0,
        away_score: isHome ? 0 : 3,
        motm_name: isHome ? homeTeam?.name : awayTeam?.name,
        confidence: 1,
        players: [],
      },
    });
    setFeedbackMsg(
      `⚖️ W.O. aplicado conforme regulamento oficial da LPF: Placar 3 x 0 a favor de ${
        isHome ? homeTeam?.name : awayTeam?.name
      }.`
    );
  };

  const subTabOptions = [
    {
      id: 'sumula_ocr',
      label: 'Súmula IA & Print',
      icon: <Camera className="w-3.5 h-3.5" />,
    },
    {
      id: 'tinder_schedule',
      label: 'Tinder de Horários',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      id: 'wo_rules',
      label: 'Regras & W.O.',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] px-3 sm:px-6 py-5 pb-28 overflow-x-hidden selection:bg-[#00E599]/30 selection:text-[#00E599]">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* ================================================================= */}
        {/* CABEÇALHO DO PILAR DE JOGOS & SELEÇÃO DE PARTIDA                  */}
        {/* ================================================================= */}
        <section className="p-5 sm:p-6 rounded-3xl bg-[#0D0F17] border border-white/[0.08] shadow-lg shadow-black/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-[10px] font-mono font-bold uppercase tracking-wider">
                  Pilar 3 • Central de Partidas
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {tournament?.name}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white mt-1">
                Jogos, Horários & Súmula por Foto OCR
              </h1>
            </div>
            <Link
              href="/studio"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 shadow-xs shrink-0 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              Estúdio de Artes 4:5
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {matches.map((m) => {
              const isSelected = m.id === selectedMatch?.id;
              const hName = m.home_team?.name || 'Mandante';
              const aName = m.away_team?.name || 'Visitante';
              const isApproved = m.status === 'approved' || m.status === 'completed';
              const isPending = m.status === 'pending_validation';

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
                    'p-3.5 rounded-2xl border text-left transition-all space-y-2',
                    isSelected
                      ? 'border-[#00E599] bg-[#00E599]/[0.06] shadow-md shadow-[#00E599]/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-400">Rodada #{m.round_number || 1}</span>
                    <StatusMark
                      status={isApproved ? 'success' : isPending ? 'warning' : 'pending'}
                      label={isApproved ? 'Validada' : isPending ? 'Pendente B' : 'Agendada'}
                      pulse={isPending}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs font-black" suppressHydrationWarning>
                    <span className="truncate text-white">{hName}</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10 font-mono text-[#00E599] shrink-0">
                      {m.home_score} - {m.away_score}
                    </span>
                    <span className="truncate text-right text-white">{aName}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {feedbackMsg && (
            <div className="p-3 rounded-2xl bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </section>

        {/* SUB-ABAS DA PARTIDA SELECIONADA VIA GLIDE SELECT */}
        <GlideSelect
          options={subTabOptions}
          activeId={activeSubTab}
          onChange={(id) => setActiveSubTab(id as 'sumula_ocr' | 'tinder_schedule' | 'wo_rules')}
          className="bg-[#0D0F17] border-white/10"
        />

        {/* ================================================================= */}
        {/* SUB-ABA 1: SÚMULA POR FOTO IA + SLIDE COMMIT DUPLA VALIDAÇÃO      */}
        {/* ================================================================= */}
        {activeSubTab === 'sumula_ocr' && selectedMatch && (
          <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-white/[0.08] shadow-lg shadow-black/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-display font-black text-white" suppressHydrationWarning>
                  {homeTeam?.name} {selectedMatch.home_score} - {selectedMatch.away_score}{' '}
                  {awayTeam?.name}
                </h2>
                <p className="text-xs text-zinc-400">
                  Envie o print de Desempenho de Jogadores do EA FC 26. O Gemini Vision extrai placar, gols e notas instantaneamente.
                </p>
              </div>

              <label className="cursor-pointer py-2.5 px-4 rounded-xl bg-[#00E599] hover:bg-[#00c985] text-[#090A0F] font-display font-black text-xs flex items-center gap-2 shadow-md shadow-[#00E599]/20 shrink-0 transition-all">
                <Upload className="w-4 h-4" />
                <span>
                  {ocrLoading ? 'Lendo Print com IA...' : '📸 Subir Print de Desempenho'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofAndOcrUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview do Print Salvo no Storage */}
            {(proofPreviewUrl || selectedMatch.proof_image_url) && (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[11px] font-mono font-bold text-[#00E599] block">
                  ✅ Print Oficial de Desempenho Anexado (Storage match-proofs):
                </span>
                <img
                  src={proofPreviewUrl || selectedMatch.proof_image_url || ''}
                  alt="Print da Partida"
                  className="w-full max-h-64 object-contain rounded-xl bg-black"
                />
              </div>
            )}

            {/* Lista de Estatísticas Extraídas por IA */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-white">
                  Desempenho Extraído por Personagem (Character Name)
                </span>
                {selectedMatch.ocr_extracted_data?.motm_name && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold flex items-center gap-1.5">
                    <img
                      src="/assets/events/motm.png"
                      alt="MVP"
                      className="w-4 h-4 object-contain"
                    />
                    Craque: {selectedMatch.ocr_extracted_data.motm_name}
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {(selectedMatch.ocr_extracted_data?.players || []).map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-display font-black uppercase text-white block">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {p.team === 'home' ? homeTeam?.name : awayTeam?.name} • Nota{' '}
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                      {p.goals > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599]">
                          {p.goals} ⚽
                        </span>
                      )}
                      {p.assists > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                          {p.assists} 👟
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DUPLA VALIDAÇÃO COM SLIDE COMMIT (REACT BITS) */}
            <div className="pt-3 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-zinc-300">
                  Dupla Validação Oficial (Aprovação Capitão B)
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Deslize até o fim para confirmar
                </span>
              </div>

              <SlideCommit
                label="Deslize para Aprovar Súmula Oficial"
                completedLabel="Súmula Aprovada com Sucesso!"
                onCommit={handleApproveMatchSheet}
                className="max-w-md mx-auto"
              />
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* SUB-ABA 2: TINDER DE HORÁRIOS POR INTERVALOS                      */}
        {/* ================================================================= */}
        {activeSubTab === 'tinder_schedule' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-white/[0.08] shadow-lg shadow-black/50 space-y-4">
            <div>
              <h2 className="text-base font-display font-black text-white">
                Tinder de Horários por Intervalos ({homeTeam?.name} vs {awayTeam?.name})
              </h2>
              <p className="text-xs text-zinc-400">
                Selecione os turnos disponíveis ou digite a janela exata para cruzar a escala de ambos os elencos.
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
                    'px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shrink-0 transition-all border',
                    selectedDayLabel === day
                      ? 'bg-[#00E599] text-[#090A0F] border-[#00E599]'
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
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
                        ? 'border-[#00E599] bg-[#00E599]/10 text-white font-bold'
                        : 'border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    <span className="text-xs">{preset.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00E599]" />}
                  </button>
                );
              })}
            </div>

            {/* Faixa Personalizada */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00E599]" />
                <span className="text-xs font-bold text-white">Janela Livre:</span>
                <input
                  type="time"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-white"
                />
                <span className="text-xs text-zinc-400">às</span>
                <input
                  type="time"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleAddCustomWindow}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Janela
              </button>
            </div>

            {/* Cruzamento de Disponibilidade */}
            <div className="p-3.5 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 space-y-1.5">
              <span className="text-xs font-display font-black text-[#00E599] block">
                🔥 Match de Horário Detectado: {selectedDayLabel} • Noite Pico (21:30 às 23:30)
              </span>
              <p className="text-[11px] text-zinc-300">
                <strong>{homeTeam?.name}:</strong> {homeRoster.length} atletas disponíveis (
                {homeRoster.map((p) => p.character_name).join(', ')}) •{' '}
                <strong>{awayTeam?.name}:</strong> {awayRoster.length} atletas disponíveis (
                {awayRoster.map((p) => p.character_name).join(', ')}).
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-xs text-zinc-300 font-medium">
                Notificar capitães automaticamente via WhatsApp / PWA
              </span>
              <SquishSwitch checked={autoNotifyCaptain} onChange={setAutoNotifyCaptain} />
            </div>

            <ClickSpark sparkColor="#00E599">
              <button
                type="button"
                onClick={handleConfirmScheduleWindow}
                className="w-full py-3.5 rounded-xl bg-[#00E599] hover:bg-[#00c985] text-[#090A0F] font-display font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-[#00E599]/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Horário Oficial da Partida</span>
              </button>
            </ClickSpark>
          </section>
        )}

        {/* ================================================================= */}
        {/* SUB-ABA 3: CENTRAL DE W.O. & REGRAS DA LIGA                       */}
        {/* ================================================================= */}
        {activeSubTab === 'wo_rules' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-white/[0.08] shadow-lg shadow-black/50 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/events/red-card.png"
                alt="W.O."
                className="w-10 h-10 object-contain"
              />
              <div>
                <h2 className="text-base font-display font-black text-white">
                  Central Oficial de W.O. & Desconexão
                </h2>
                <p className="text-xs text-zinc-400">
                  Tolerância oficial: {tournament.rules_config?.wo_tolerance_minutes || 15} minutos • Aviso prévio mínimo: {tournament.rules_config?.cancel_notice_minutes || 40} minutos.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {(tournament.custom_rules || [
                'Tolerância máxima de 15 minutos de atraso a partir do horário oficial acordado.',
                'Aviso prévio mínimo de cancelamento: 40 minutos de antecedência.',
                'Em caso de queda/desconexão antes dos 10min de jogo com placar 0x0, a partida é reiniciada.',
                'O placar oficial de W.O. é 3 x 0 a favor da equipe presente.',
              ]).map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300"
                >
                  • {rule}
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleApplyOfficialWO('home')}
                className="py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-display font-black text-xs transition-colors"
              >
                Declarar W.O. a favor de {homeTeam?.name} (3 x 0)
              </button>
              <button
                type="button"
                onClick={() => handleApplyOfficialWO('away')}
                className="py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-display font-black text-xs transition-colors"
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
