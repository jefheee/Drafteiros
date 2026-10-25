'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLeagueStore, uploadMediaToStorage, verifyProofHashUniqueness } from '@/lib/data-store';
import { computeImageHash } from '@/lib/image-compression';
import { sendMatchValidatedEmbed } from '@/lib/discord-webhook';
import { AvailabilitySlotRange } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Plus,
  Image as ImageIcon,
  Swords,
} from 'lucide-react';
import {
  GlideSelect,
  SlideCommit,
  StatusMark,
  SquishSwitch,
  ClickSpark,
} from '@/components/react-bits';

const INTERVAL_PRESETS: AvailabilitySlotRange[] = [
  { id: 'morning', label: 'Manhã (08:00 às 12:00)', start: '08:00', end: '12:00' },
  { id: 'afternoon', label: 'Tarde (13:00 às 18:00)', start: '13:00', end: '18:00' },
  { id: 'early_night', label: 'Início da Noite (18:00 às 21:00)', start: '18:00', end: '21:00' },
  { id: 'peak_night', label: 'Noite Pico (21:00 às 00:00)', start: '21:00', end: '00:00' },
  { id: 'late_night', label: 'Madrugada (00:00 às 03:00)', start: '00:00', end: '03:00' },
];

export default function MatchesPage() {
  const { matches, teams, players, tournament, updateMatchInStore, createMatchInStore } =
    useLeagueStore();

  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'sumula_ocr' | 'tinder_schedule' | 'wo_rules'>(
    'sumula_ocr'
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHomeTeamId, setNewHomeTeamId] = useState(teams[0]?.id || '');
  const [newAwayTeamId, setNewAwayTeamId] = useState(teams[1]?.id || '');
  const [newRoundNumber, setNewRoundNumber] = useState(1);
  const [creatingMatch, setCreatingMatch] = useState(false);

  useEffect(() => {
    if (!selectedMatchId && matches[0]?.id) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches, selectedMatchId]);

  useEffect(() => {
    if (!newHomeTeamId && teams[0]?.id) setNewHomeTeamId(teams[0].id);
    if (!newAwayTeamId && teams[1]?.id) setNewAwayTeamId(teams[1].id);
  }, [teams, newHomeTeamId, newAwayTeamId]);

  const selectedMatch = useMemo(
    () => matches.find((m) => m.id === selectedMatchId) || matches[0] || null,
    [matches, selectedMatchId]
  );

  const homeTeam = useMemo(
    () =>
      selectedMatch?.home_team ||
      teams.find((t) => t.id === selectedMatch?.home_team_id) ||
      null,
    [selectedMatch, teams]
  );

  const awayTeam = useMemo(
    () =>
      selectedMatch?.away_team ||
      teams.find((t) => t.id === selectedMatch?.away_team_id) ||
      null,
    [selectedMatch, teams]
  );

  const [ocrLoading, setOcrLoading] = useState(false);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>(
    selectedMatch?.proof_image_url || ''
  );
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

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

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeTeamId || !newAwayTeamId || newHomeTeamId === newAwayTeamId) {
      setFeedbackMsg('Selecione duas equipes distintas para agendar a partida.');
      return;
    }
    setCreatingMatch(true);
    try {
      const created = await createMatchInStore({
        home_team_id: newHomeTeamId,
        away_team_id: newAwayTeamId,
        round_number: newRoundNumber,
      });
      if (created) {
        setSelectedMatchId(created.id);
        setShowCreateForm(false);
        setFeedbackMsg('Partida agendada com sucesso!');
      }
    } finally {
      setCreatingMatch(false);
    }
  };

  const handleProofAndOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMatch) return;

    // Verificação de hash para impedir envio duplicado do mesmo print
    const imageHash = await computeImageHash(file);
    const hashCheck = verifyProofHashUniqueness(imageHash, selectedMatch.id);
    if (!hashCheck.isUnique) {
      setFeedbackMsg(
        '⚠️ Este mesmo print de súmula já foi enviado para outra partida! O reenvio duplicado foi bloqueado para integridade da liga.'
      );
      return;
    }

    setOcrLoading(true);
    setFeedbackMsg('Otimizando imagem WebP e processando súmula com Gemini 3.8 Flash...');

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
              homeTeamName: homeTeam?.name || 'Mandante',
              awayTeamName: awayTeam?.name || 'Visitante',
              gameMode: tournament?.name ? 'soccer' : 'generic',
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
              `Súmula lida por IA (${json.data.home_score} x ${json.data.away_score}) e salva! Aguardando validação do capitão adversário.`
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

  const handleApproveMatchSheet = async () => {
    if (!selectedMatch) return;
    await updateMatchInStore(selectedMatch.id, {
      status: 'approved',
      validated_by: awayTeam?.captain_id || 'captain',
    });
    setFeedbackMsg(
      'Súmula validada! Classificação e Artilharia atualizadas. Gerando crônica jornalística...'
    );

    // Gera crônica da partida via IA (gemini-3.5-flash-lite)
    let chronicleText = '';
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_match_chronicle',
          homeTeamName: homeTeam?.name || 'Mandante',
          awayTeamName: awayTeam?.name || 'Visitante',
          homeScore: selectedMatch.home_score,
          awayScore: selectedMatch.away_score,
          motmName: selectedMatch.ocr_extracted_data?.motm_name,
          gameMode: tournament?.name || 'Campeonato Oficial',
        }),
      });
      const json = await res.json();
      if (json.ok && json.data?.chronicle) {
        chronicleText = json.data.chronicle;
        await updateMatchInStore(selectedMatch.id, {
          match_chronicle: chronicleText,
        });
      }
    } catch (err) {
      console.warn('Erro ao gerar crônica:', err);
    }

    // Se houver Webhook do Discord configurado, dispara notificação
    if (tournament?.discord_webhook_url) {
      sendMatchValidatedEmbed(tournament.discord_webhook_url, {
        homeTeamName: homeTeam?.name || 'Mandante',
        awayTeamName: awayTeam?.name || 'Visitante',
        homeScore: selectedMatch.home_score,
        awayScore: selectedMatch.away_score,
        homeLogo: homeTeam?.logo_url,
        awayLogo: awayTeam?.logo_url,
        motmName: selectedMatch.ocr_extracted_data?.motm_name,
        chronicle: chronicleText,
        tournamentName: tournament.name,
        roundNumber: selectedMatch.round_number,
        proofImageUrl: selectedMatch.proof_image_url,
      });
    }

    setFeedbackMsg(
      'Súmula oficial validada! Crônica esportiva publicada na Zona Mista.'
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
      label: `Das ${customStart} às ${customEnd}`,
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
      `Horário confirmado oficialmente para ${selectedDayLabel}!`
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
      `W.O. aplicado conforme regulamento: Placar 3 x 0 a favor de ${
        isHome ? homeTeam?.name || 'Mandante' : awayTeam?.name || 'Visitante'
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
      label: 'Agenda de Horários',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      id: 'wo_rules',
      label: 'Regras & W.O.',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6 pb-28 overflow-x-hidden">
      <main className="max-w-5xl mx-auto space-y-5">
        {/* CABEÇALHO DA CENTRAL DE PARTIDAS */}
        <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Central de Partidas
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {tournament?.name}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white mt-1">
                Jogos, Horários & Súmula por Foto
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {teams.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setShowCreateForm((v) => !v)}
                  className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agendar Jogo
                </button>
              )}
              <Link
                href="/studio"
                className="px-4 py-2 rounded-full bg-[#141414] hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-zinc-300" />
                Estúdio
              </Link>
            </div>
          </div>

          {showCreateForm && teams.length >= 2 && (
            <form
              onSubmit={handleCreateMatch}
              className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-3"
            >
              <span className="text-xs font-bold text-white block">
                Agendar Nova Partida Oficial
              </span>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">
                    Mandante
                  </label>
                  <select
                    value={newHomeTeamId}
                    onChange={(e) => setNewHomeTeamId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-black border border-white/10 text-xs text-white font-semibold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">
                    Visitante
                  </label>
                  <select
                    value={newAwayTeamId}
                    onChange={(e) => setNewAwayTeamId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-black border border-white/10 text-xs text-white font-semibold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">
                    Rodada #
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={38}
                    value={newRoundNumber}
                    onChange={(e) => setNewRoundNumber(Number(e.target.value) || 1)}
                    className="w-full h-10 px-3 rounded-xl bg-black border border-white/10 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3.5 py-2 rounded-full bg-white/[0.06] text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingMatch}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold"
                >
                  {creatingMatch ? 'Criando...' : 'Confirmar Conffronto'}
                </button>
              </div>
            </form>
          )}

          {matches.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#141414]/60 border border-white/[0.06] text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto">
                <Swords className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white">
                  Nenhuma partida agendada ainda
                </h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Assim que ao menos 2 clubes estiverem cadastrados, os capitães ou a direção podem agendar os confrontos e enviar os prints de desempenho aqui.
                </p>
              </div>
              {teams.length < 2 && (
                <Link
                  href="/captain"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
                >
                  Cadastrar Clube
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {matches.map((m) => {
                const isSelected = m.id === selectedMatch?.id;
                const hName = m.home_team?.name || teams.find((t) => t.id === m.home_team_id)?.name || 'Mandante';
                const aName = m.away_team?.name || teams.find((t) => t.id === m.away_team_id)?.name || 'Visitante';
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
                        ? 'border-white bg-[#141414]'
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
                    <div className="flex items-center justify-between gap-2 text-xs font-black">
                      <span className="truncate text-white">{hName}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-black border border-white/10 font-mono text-white shrink-0">
                        {m.home_score} - {m.away_score}
                      </span>
                      <span className="truncate text-right text-white">{aName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {feedbackMsg && (
            <div className="p-3 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </section>

        {selectedMatch && (
          <>
            <GlideSelect
              options={subTabOptions}
              activeId={activeSubTab}
              onChange={(id) => setActiveSubTab(id as 'sumula_ocr' | 'tinder_schedule' | 'wo_rules')}
              className="bg-[#0A0A0A] border-white/10"
            />

            {/* SUB-ABA 1: SÚMULA POR FOTO IA + SLIDE COMMIT */}
            {activeSubTab === 'sumula_ocr' && (
              <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-display font-black text-white">
                      {homeTeam?.name || 'Mandante'} {selectedMatch.home_score} - {selectedMatch.away_score}{' '}
                      {awayTeam?.name || 'Visitante'}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Envie o print de resultado ou estatísticas da partida. A inteligência artificial extrai placar, gols e notas.
                    </p>
                  </div>

                  <label className="cursor-pointer py-2.5 px-4 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-2 shrink-0 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>
                      {ocrLoading ? 'Lendo Print com IA...' : 'Subir Print de Desempenho'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofAndOcrUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {(proofPreviewUrl || selectedMatch.proof_image_url) && (
                  <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
                    <span className="text-[11px] font-mono font-bold text-[#10B981] block">
                      Print Oficial de Desempenho Anexado:
                    </span>
                    <img
                      src={proofPreviewUrl || selectedMatch.proof_image_url || ''}
                      alt="Print da Partida"
                      className="w-full max-h-64 object-contain rounded-xl bg-black"
                    />
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Desempenho Extraído por Personagem
                    </span>
                    {selectedMatch.ocr_extracted_data?.motm_name && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-200 text-[11px] font-mono font-bold">
                        Craque: {selectedMatch.ocr_extracted_data.motm_name}
                      </span>
                    )}
                  </div>

                  {(selectedMatch.ocr_extracted_data?.players || []).length === 0 ? (
                    <div className="p-4 rounded-2xl bg-[#141414]/60 border border-white/[0.06] text-xs text-zinc-400 text-center">
                      Suba a captura de tela do pós-jogo para extrair automaticamente os gols, assistências e notas de cada personagem.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {(selectedMatch.ocr_extracted_data?.players || []).map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-[#141414] border border-white/[0.06] flex items-center justify-between"
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
                              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white">
                                {p.goals} G
                              </span>
                            )}
                            {p.assists > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300">
                                {p.assists} A
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedMatch.match_chronicle && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                        📰 Crônica da Partida • Zona Mista
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                      {selectedMatch.match_chronicle}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">
                      Dupla Validação Oficial (Capitão Adversário)
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

            {/* SUB-ABA 2: AGENDA DE HORÁRIOS */}
            {activeSubTab === 'tinder_schedule' && (
              <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div>
                  <h2 className="text-base font-display font-black text-white">
                    Alinhamento de Horários ({homeTeam?.name || 'Mandante'} vs {awayTeam?.name || 'Visitante'})
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Selecione os turnos disponíveis ou defina a janela exata da partida.
                  </p>
                </div>

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
                          ? 'bg-white text-black border-white'
                          : 'bg-[#141414] text-zinc-400 border-white/10 hover:text-white'
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>

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
                            ? 'border-white bg-[#141414] text-white font-bold'
                            : 'border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 hover:text-zinc-200'
                        )}
                      >
                        <span className="text-xs">{preset.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-300" />
                    <span className="text-xs font-bold text-white">Janela Livre:</span>
                    <input
                      type="time"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="h-8 px-2.5 rounded-lg bg-black border border-white/10 text-xs font-mono text-white"
                    />
                    <span className="text-xs text-zinc-400">às</span>
                    <input
                      type="time"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="h-8 px-2.5 rounded-lg bg-black border border-white/10 text-xs font-mono text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomWindow}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Janela
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 space-y-1.5">
                  <span className="text-xs font-bold text-white block">
                    Disponibilidade dos Elencos ({selectedDayLabel})
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    <strong>{homeTeam?.name || 'Mandante'}:</strong> {homeRoster.length} atletas vinculados •{' '}
                    <strong>{awayTeam?.name || 'Visitante'}:</strong> {awayRoster.length} atletas vinculados.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141414] border border-white/10">
                  <span className="text-xs text-zinc-300 font-medium">
                    Notificar capitães quando o horário for confirmado
                  </span>
                  <SquishSwitch checked={autoNotifyCaptain} onChange={setAutoNotifyCaptain} />
                </div>

                <ClickSpark sparkColor="#FFFFFF">
                  <button
                    type="button"
                    onClick={handleConfirmScheduleWindow}
                    className="w-full py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Horário Oficial da Partida</span>
                  </button>
                </ClickSpark>
              </section>
            )}

            {/* SUB-ABA 3: CENTRAL DE W.O. & REGRAS */}
            {activeSubTab === 'wo_rules' && (
              <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div>
                  <h2 className="text-base font-display font-black text-white">
                    Central Oficial de W.O. & Desconexão
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Tolerância oficial: {tournament?.rules_config?.wo_tolerance_minutes || 15} minutos • Aviso prévio mínimo: {tournament?.rules_config?.cancel_notice_minutes || 40} minutos.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {(tournament?.custom_rules || [
                    'Tolerância máxima de 15 minutos de atraso a partir do horário oficial acordado.',
                    'Aviso prévio mínimo de cancelamento: 40 minutos de antecedência.',
                    'Em caso de queda/desconexão antes dos 10min de jogo com placar 0x0, a partida é reiniciada.',
                    'O placar oficial de W.O. é 3 x 0 a favor da equipe presente.',
                  ]).map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] text-xs text-zinc-300"
                    >
                      • {rule}
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleApplyOfficialWO('home')}
                    className="py-3 px-4 rounded-2xl bg-[#141414] hover:bg-white/10 border border-white/15 text-white font-bold text-xs transition-colors"
                  >
                    Declarar W.O. a favor de {homeTeam?.name || 'Mandante'} (3 x 0)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyOfficialWO('away')}
                    className="py-3 px-4 rounded-2xl bg-[#141414] hover:bg-white/10 border border-white/15 text-white font-bold text-xs transition-colors"
                  >
                    Declarar W.O. a favor de {awayTeam?.name || 'Visitante'} (3 x 0)
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
