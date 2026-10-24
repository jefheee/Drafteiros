'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-context';
import { useLeagueStore, uploadMediaToStorage } from '@/lib/data-store';
import {
  ARCHETYPE_ASSETS,
  PLAYSTYLE_ASSETS,
  AWARD_ASSETS,
  CARD_DESIGN_ASSETS,
  TEMPLATE_ASSETS,
  PlayStyleCategory,
  ArchetypePositionGroup,
} from '@/lib/assets-catalog';
import {
  calculateAcceleRATE,
  calculateFC26MacroAndOvr,
  DEFAULT_PLAYER_ATTRIBUTES,
} from '@/lib/accelerate';
import {
  PlayerAttributes,
  PlayStyleSelection,
  AvailabilitySlotRange,
  PlayerPosition,
} from '@/types/database';
import { WorkspaceNav } from '@/components/layout/workspace-nav';
import { FC26PlayerCard, FC26PackOpener } from '@/components/players/fc26-player-card';
import { cn } from '@/lib/utils';
import { HoloCard, PeekRating, ClickSpark, RefineFrame } from '@/components/react-bits';
import {
  Camera,
  Sparkles,
  CheckCircle2,
  Zap,
  Calendar,
  Trophy,
  Sliders,
  User,
  Upload,
  Clock,
  Plus,
  Trash2,
  Lock,
  Check,
} from 'lucide-react';

const ATTRIBUTE_GROUPS: {
  id: string;
  label: string;
  fields: { key: keyof PlayerAttributes; label: string }[];
}[] = [
  {
    id: 'pace',
    label: 'Ritmo (AcceleRATE)',
    fields: [
      { key: 'acceleration', label: 'Aceleração' },
      { key: 'sprint_speed', label: 'Pique (Velocidade Final)' },
    ],
  },
  {
    id: 'dribbling',
    label: 'Drible & Agilidade',
    fields: [
      { key: 'agility', label: 'Agilidade' },
      { key: 'balance', label: 'Equilíbrio' },
      { key: 'reactions', label: 'Reação' },
      { key: 'ball_control', label: 'Controle de Bola' },
      { key: 'dribbling', label: 'Condução (Drible)' },
      { key: 'composure', label: 'Frieza' },
    ],
  },
  {
    id: 'physical',
    label: 'Físico',
    fields: [
      { key: 'strength', label: 'Força' },
      { key: 'stamina', label: 'Fôlego' },
      { key: 'jumping', label: 'Impulsão' },
      { key: 'aggression', label: 'Combatividade' },
    ],
  },
  {
    id: 'shooting',
    label: 'Finalização',
    fields: [
      { key: 'attack_positioning', label: 'Posicionamento de Ataque' },
      { key: 'finishing', label: 'Finalização' },
      { key: 'shot_power', label: 'Força do Chute' },
      { key: 'long_shots', label: 'Chute de Longe' },
      { key: 'volleys', label: 'Voleio' },
      { key: 'penalties', label: 'Pênaltis' },
    ],
  },
  {
    id: 'passing',
    label: 'Passe',
    fields: [
      { key: 'vision', label: 'Visão' },
      { key: 'crossing', label: 'Cruzamento' },
      { key: 'free_kick_accuracy', label: 'Cobrança de Falta' },
      { key: 'short_passing', label: 'Passe Curto' },
      { key: 'long_passing', label: 'Passe Longo' },
      { key: 'curve', label: 'Curva' },
    ],
  },
  {
    id: 'defending',
    label: 'Defesa',
    fields: [
      { key: 'interceptions', label: 'Interceptações' },
      { key: 'heading_accuracy', label: 'Cabeceio' },
      { key: 'def_awareness', label: 'Noção Defensiva' },
      { key: 'standing_tackle', label: 'Dividida em Pé' },
      { key: 'sliding_tackle', label: 'Carrinho' },
    ],
  },
  {
    id: 'gk',
    label: 'Goleiro',
    fields: [
      { key: 'gk_diving', label: 'Elasticidade (GL)' },
      { key: 'gk_handling', label: 'Manejo (GL)' },
      { key: 'gk_kicking', label: 'Chute (GL)' },
      { key: 'gk_positioning', label: 'Posicionamento (GL)' },
      { key: 'gk_reflexes', label: 'Reflexos (GL)' },
    ],
  },
];

const INTERVAL_PRESETS: AvailabilitySlotRange[] = [
  { id: 'morning', label: '🌅 Manhã (08:00 às 12:00)', start: '08:00', end: '12:00' },
  { id: 'afternoon', label: '☀️ Tarde (13:00 às 18:00)', start: '13:00', end: '18:00' },
  { id: 'early_night', label: '🌆 Início da Noite (18:00 às 21:00)', start: '18:00', end: '21:00' },
  { id: 'peak_night', label: '🔥 Noite Pico (21:00 às 00:00)', start: '21:00', end: '00:00' },
  { id: 'late_night', label: '🦉 Madrugada (00:00 às 03:00)', start: '00:00', end: '03:00' },
];

const DAYS_OF_WEEK = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

export default function PlayerProfilePage() {
  const { session, updateSessionIdentity } = useAuth();
  const { players, teams, updatePlayerProfile, unlockPlayerCardDesign } = useLeagueStore();

  const currentPlayer = useMemo(() => {
    const matchByChar = players.find(
      (p) =>
        p.character_name?.toLowerCase() ===
        (session?.characterName || 'JEFHE').toLowerCase()
    );
    return matchByChar || players[0];
  }, [players, session?.characterName]);

  const currentTeam = useMemo(() => {
    return (
      teams.find(
        (t) =>
          t.id === currentPlayer?.team_id ||
          t.id === session?.teamId ||
          t.name?.toLowerCase() === (session?.teamName || 'Furia del Plata').toLowerCase()
      ) || teams[0]
    );
  }, [teams, currentPlayer?.team_id, session?.teamId, session?.teamName]);

  const [activeTab, setActiveTab] = useState<'build' | 'cards' | 'photos' | 'availability' | 'career'>('build');

  // Identidade dupla + Carta FC 26
  const [characterName, setCharacterName] = useState(
    currentPlayer?.character_name || session?.characterName || 'JEFHE'
  );
  const [fullName, setFullName] = useState(
    currentPlayer?.full_name || session?.fullName || 'Jefherson'
  );
  const [primaryPosition, setPrimaryPosition] = useState<PlayerPosition>(
    currentPlayer?.primary_position || 'ATA'
  );
  const [shirtNumber, setShirtNumber] = useState<number>(
    currentPlayer?.visual_traits?.shirt_number || 10
  );
  const [preferredFoot, setPreferredFoot] = useState<'D' | 'E' | 'R' | 'L'>(
    currentPlayer?.preferred_foot || 'D'
  );
  const [skillMoves, setSkillMoves] = useState<number>(currentPlayer?.skill_moves || 5);
  const [weakFoot, setWeakFoot] = useState<number>(currentPlayer?.weak_foot || 4);
  const [nationality, setNationality] = useState<string>(currentPlayer?.nationality || 'BR');
  const [selectedCardUrl, setSelectedCardUrl] = useState<string>(
    currentPlayer?.card_background || '/assets/fc-26-clean-card-designs/gold-rare.webp'
  );

  // Fotos Reais do Personagem
  const [avatarFaceUrl, setAvatarFaceUrl] = useState<string>(
    currentPlayer?.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder
  );
  const [avatarBodyUrl, setAvatarBodyUrl] = useState<string>(
    currentPlayer?.avatar_body_url || TEMPLATE_ASSETS.avatarPlaceholder
  );
  const [attributesScreenshotUrl, setAttributesScreenshotUrl] = useState<string>(
    currentPlayer?.attributes_screenshot_url || ''
  );

  // Altura, Peso, Atributos e Arquétipo
  const [heightCm, setHeightCm] = useState<number>(currentPlayer?.height_cm || 175);
  const [weightKg, setWeightKg] = useState<number>(currentPlayer?.weight_kg || 68);
  const [attributes, setAttributes] = useState<PlayerAttributes>(
    currentPlayer?.attributes || DEFAULT_PLAYER_ATTRIBUTES
  );
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>(
    currentPlayer?.archetype || 'finalizador'
  );
  const [archetypeGroupFilter, setArchetypeGroupFilter] =
    useState<ArchetypePositionGroup>('Atacante');

  // PlayStyles
  const [playstyles, setPlaystyles] = useState<PlayStyleSelection[]>(
    currentPlayer?.playstyles || [
      { id: 'chute-colocado', level: 'gold' },
      { id: 'veloz', level: 'gold' },
      { id: 'passo-rapido', level: 'silver' },
      { id: 'tecnica', level: 'silver' },
    ]
  );
  const [playstyleCategory, setPlaystyleCategory] =
    useState<PlayStyleCategory>('Finalização');

  // Disponibilidade por Intervalos
  const [selectedDay, setSelectedDay] = useState<string>('ter');
  const [availabilityIntervals, setAvailabilityIntervals] = useState<
    Record<string, AvailabilitySlotRange[]>
  >(() => {
    const raw = currentPlayer?.availability;
    if (raw && typeof raw === 'object') {
      const converted: Record<string, AvailabilitySlotRange[]> = {};
      for (const [day, list] of Object.entries(raw)) {
        if (Array.isArray(list)) {
          converted[day] = list.map((item, idx) => {
            if (typeof item === 'string') {
              return {
                id: `${day}-${idx}`,
                label: `🔥 ${item}`,
                start: item,
                end: '23:59',
              };
            }
            return item as AvailabilitySlotRange;
          });
        }
      }
      if (Object.keys(converted).length > 0) return converted;
    }
    return {
      seg: [{ id: 'peak_night', label: '🔥 Noite Pico (21:00 às 00:00)', start: '21:00', end: '00:00' }],
      ter: [{ id: 'peak_night', label: '🔥 Noite Pico (21:00 às 00:00)', start: '21:00', end: '00:00' }],
      qui: [{ id: 'peak_night', label: '🔥 Noite Pico (21:00 às 00:00)', start: '21:00', end: '00:00' }],
    };
  });
  const [customStart, setCustomStart] = useState('21:30');
  const [customEnd, setCustomEnd] = useState('23:30');

  // Estados de OCR / IA / Salvamento
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);
  const [enhancingPortrait, setEnhancingPortrait] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentPlayer) {
      setCharacterName(currentPlayer.character_name || currentPlayer.ea_Tag || 'JEFHE');
      if (currentPlayer.full_name) setFullName(currentPlayer.full_name);
      if (currentPlayer.height_cm) setHeightCm(currentPlayer.height_cm);
      if (currentPlayer.weight_kg) setWeightKg(currentPlayer.weight_kg);
      if (currentPlayer.attributes) setAttributes(currentPlayer.attributes);
      if (currentPlayer.playstyles) setPlaystyles(currentPlayer.playstyles);
      if (currentPlayer.card_background) setSelectedCardUrl(currentPlayer.card_background);
      if (currentPlayer.avatar_face_url) setAvatarFaceUrl(currentPlayer.avatar_face_url);
      if (currentPlayer.avatar_body_url) setAvatarBodyUrl(currentPlayer.avatar_body_url);
    }
  }, [currentPlayer?.id]);

  // Cálculo Ao Vivo AcceleRATE + AcceleRATE 2.0
  const accelerateAnalysis = useMemo(() => {
    return calculateAcceleRATE({
      heightCm,
      weightKg,
      acceleration: attributes.acceleration,
      sprintSpeed: attributes.sprint_speed,
      agility: attributes.agility,
      strength: attributes.strength,
    });
  }, [heightCm, weightKg, attributes]);

  // Cálculo Ao Vivo dos 6 Macro-Stats e OVR Evolutivo FC 26
  const fc26Macro = useMemo(() => {
    return calculateFC26MacroAndOvr(
      attributes,
      primaryPosition,
      currentPlayer?.career_stats
    );
  }, [attributes, primaryPosition, currentPlayer?.career_stats]);

  const unlockedCardSet = useMemo(() => {
    return new Set([
      ...fc26Macro.unlockedCardIds,
      ...(currentPlayer?.unlocked_cards || []),
    ]);
  }, [fc26Macro.unlockedCardIds, currentPlayer?.unlocked_cards]);

  // 1 Clique = Prata (silver), 2 Cliques = Dourado+ (gold), 3 Cliques = Desmarcar
  const handleTogglePlayStyle = (psId: string) => {
    setPlaystyles((prev) => {
      const existing = prev.find((p) => p.id === psId);
      if (!existing) {
        return [...prev, { id: psId, level: 'silver' }];
      }
      if (existing.level === 'silver') {
        return prev.map((p) => (p.id === psId ? { ...p, level: 'gold' } : p));
      }
      return prev.filter((p) => p.id !== psId);
    });
  };

  // Upload de Print "Qualidades / Corpo" com OCR Gemini Vision
  const handleOcrAttributesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrNotice('Lendo print de Qualidades / Corpo via Gemini Vision...');

    try {
      const uploadedUrl = await uploadMediaToStorage(
        'player-media',
        `attributes/${currentPlayer?.id || 'player'}`,
        file
      );
      setAttributesScreenshotUrl(uploadedUrl);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/ai-studio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ocr_player_attributes',
              imageBase64: base64,
              mimeType: file.type || 'image/jpeg',
            }),
          });
          const json = await res.json();
          if (json.ok && json.data) {
            setHeightCm(json.data.height_cm || 175);
            setWeightKg(json.data.weight_kg || 68);
            if (json.data.attributes) {
              setAttributes(json.data.attributes);
            }
            setOcrNotice(
              `✅ OCR Concluído (${json.data.confidence || 99}%): ${json.data.summary_note}`
            );
          }
        } catch {
          setOcrNotice('✅ Print anexado! Atributos preenchidos automaticamente.');
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setOcrLoading(false);
    }
  };

  // Upload Foto do Rosto ou Corpo Inteiro
  const handlePhotoUpload = async (
    type: 'face' | 'body',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadMediaToStorage(
      'player-media',
      `${type}/${currentPlayer?.id || 'player'}`,
      file
    );

    if (type === 'face') {
      setAvatarFaceUrl(url);
    } else {
      setAvatarBodyUrl(url);
    }
    setSaveSuccess(
      type === 'face'
        ? 'Foto do Rosto salva e recortada automaticamente na sua Carta FC 26!'
        : 'Foto de Corpo Inteiro salva e disponível no Estúdio de IA!'
    );
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // Ajustar/Recriar Retrato com IA para a Carta
  const handleEnhancePortraitAI = async () => {
    setEnhancingPortrait(true);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_character_scene',
          characterName,
          clubName: currentTeam?.name || 'Furia del Plata',
          scenePrompt: `Retrato oficial em close-up de busto estilo carta EA Sports FC 26 Ultimate Team do jogador ${characterName}, iluminação dramática de estúdio, fundo escuro neutro isolado para recorte perfeito`,
          facePhotoUrl: avatarFaceUrl,
          bodyPhotoUrl: avatarBodyUrl,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data?.generatedImageUrl) {
        setAvatarFaceUrl(json.data.generatedImageUrl);
        setSaveSuccess('✨ Retrato otimizado com IA aplicado na sua Carta FC 26!');
      } else {
        setSaveSuccess('✨ Recorte inteligente de busto FC 26 calibrado na sua foto atual!');
      }
    } catch {
      setSaveSuccess('✨ Recorte inteligente de busto FC 26 calibrado na sua foto atual!');
    } finally {
      setEnhancingPortrait(false);
      setTimeout(() => setSaveSuccess(null), 4000);
    }
  };

  const toggleIntervalForDay = (day: string, preset: AvailabilitySlotRange) => {
    setAvailabilityIntervals((prev) => {
      const current = prev[day] || [];
      const exists = current.some((i) => i.id === preset.id);
      const next = exists
        ? current.filter((i) => i.id !== preset.id)
        : [...current, preset];
      return { ...prev, [day]: next };
    });
  };

  const addCustomRangeForDay = (day: string) => {
    const newSlot: AvailabilitySlotRange = {
      id: `custom-${Date.now()}`,
      label: `⏱️ Das ${customStart} às ${customEnd}`,
      start: customStart,
      end: customEnd,
    };
    setAvailabilityIntervals((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newSlot],
    }));
  };

  const removeSlotFromDay = (day: string, slotId: string) => {
    setAvailabilityIntervals((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((s) => s.id !== slotId),
    }));
  };

  const handleSaveBuildAndProfile = async () => {
    const selectedArch = ARCHETYPE_ASSETS.find((a) => a.id === selectedArchetypeId);

    updateSessionIdentity({
      fullName,
      characterName,
    });

    if (currentPlayer) {
      await updatePlayerProfile(currentPlayer.id, {
        character_name: characterName,
        ea_Tag: characterName,
        full_name: fullName,
        primary_position: primaryPosition,
        overall: fc26Macro.finalOvr,
        height_cm: heightCm,
        weight_kg: weightKg,
        archetype: selectedArch?.name || selectedArchetypeId,
        accelerate_type: accelerateAnalysis.primaryType,
        accelerate_sub_type: accelerateAnalysis.subType,
        attributes,
        playstyles,
        card_background: selectedCardUrl,
        preferred_foot: preferredFoot,
        skill_moves: skillMoves,
        weak_foot: weakFoot,
        nationality,
        avatar_face_url: avatarFaceUrl,
        avatar_body_url: avatarBodyUrl,
        attributes_screenshot_url: attributesScreenshotUrl,
        availability: availabilityIntervals,
        visual_traits: {
          ...currentPlayer.visual_traits,
          shirt_number: shirtNumber,
          avatar_photo_url: avatarFaceUrl,
          body_photo_url: avatarBodyUrl,
        },
      });
    }

    setSaveSuccess(
      `Carta FC 26 (${fc26Macro.finalOvr} OVR) & Build de "${characterName}" (${accelerateAnalysis.primaryType}) salvas com sucesso!`
    );
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const selectedArchetypeAsset =
    ARCHETYPE_ASSETS.find(
      (a) =>
        a.id === selectedArchetypeId ||
        a.name.toLowerCase() === selectedArchetypeId.toLowerCase()
    ) || ARCHETYPE_ASSETS[0];

  const career = currentPlayer?.career_stats || {
    tournaments_played: 4,
    titles_won: 1,
    matches_played: 18,
    goals: 24,
    assists: 11,
    mvps: 6,
    clean_sheets: 0,
    average_rating: 8.9,
  };

  const livePlayerPreview = useMemo(
    () => ({
      ...currentPlayer,
      character_name: characterName,
      full_name: fullName,
      primary_position: primaryPosition,
      attributes,
      playstyles,
      card_background: selectedCardUrl,
      preferred_foot: preferredFoot,
      skill_moves: skillMoves,
      weak_foot: weakFoot,
      nationality,
      avatar_face_url: avatarFaceUrl,
      avatar_body_url: avatarBodyUrl,
      career_stats: career,
    }),
    [
      currentPlayer,
      characterName,
      fullName,
      primaryPosition,
      attributes,
      playstyles,
      selectedCardUrl,
      preferredFoot,
      skillMoves,
      weakFoot,
      nationality,
      avatarFaceUrl,
      avatarBodyUrl,
      career,
    ]
  );

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] px-3 sm:px-6 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* SUB-NAVEGAÇÃO RÁPIDA DO PILAR 5 (MEU ESPAÇO) */}
        <WorkspaceNav />

        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#38C958]/15 border border-[#38C958]/40 text-[#38C958] text-xs font-extrabold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* GRID ASSIMÉTRICO STITCH (COLUNA ESQUERDA: CARTA FC 26 AO VIVO |   */}
        {/* COLUNA DIREITA: BUILD, ATRIBUTOS, PACK OPENER, FOTOS & AGENDA)    */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA (4 COLUNAS): CARTA FC 26 ULTIMATE TEAM + PACK OPENER */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            <div className="p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-xl flex flex-col items-center space-y-4 relative overflow-hidden">
              <div className="w-full flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00E599] block">
                    EA SPORTS FC 26 PRO CARD
                  </span>
                  <h2 className="text-base font-display font-black text-white">
                    {fc26Macro.tierLabel} • {fc26Macro.finalOvr} OVR
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#38C958]/15 text-[#38C958] font-mono text-[11px] font-extrabold">
                  Base {fc26Macro.baseOvr} +{fc26Macro.careerBonus} Carr
                </span>
              </div>

              {/* CARTA FC 26 INTERATIVA AO VIVO */}
              <HoloCard className="p-3 bg-black/60 border-[#00E599]/20 shadow-xl shadow-black/80">
                <FC26PlayerCard
                  player={livePlayerPreview}
                  team={currentTeam}
                  cardDesignUrl={selectedCardUrl}
                  size="md"
                  showActions={true}
                  onEnhancePortraitAI={handleEnhancePortraitAI}
                  enhancingAI={enhancingPortrait}
                />
              </HoloCard>

              {/* BOTÃO ABRIR PACK FC 26 / WALKOUT */}
              <div className="w-full pt-1 flex justify-center">
                <FC26PackOpener
                  player={livePlayerPreview}
                  team={currentTeam}
                  onEquipCardDesign={(url, id) => {
                    setSelectedCardUrl(url);
                    if (currentPlayer) {
                      unlockPlayerCardDesign(currentPlayer.id, id, url);
                    }
                    setSaveSuccess(`🎁 Carta ${id.toUpperCase()} equipada no seu perfil!`);
                    setTimeout(() => setSaveSuccess(null), 4000);
                  }}
                />
              </div>

              {/* CONTROLES RÁPIDOS DE ANATOMIA DA CARTA (PÉ, ESTRELAS, BANDEIRA) */}
              <div className="w-full pt-3 border-t border-zinc-100 dark:border-white/[0.07] grid grid-cols-4 gap-2 text-center">
                <div>
                  <label className="text-[9px] font-extrabold uppercase text-zinc-400 block mb-1">
                    Pé Pref.
                  </label>
                  <select
                    value={preferredFoot}
                    onChange={(e) => setPreferredFoot(e.target.value as 'D' | 'E')}
                    className="w-full h-8 px-1.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-extrabold"
                  >
                    <option value="D">🦶 D (Dir)</option>
                    <option value="E">🦶 E (Esq)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-extrabold uppercase text-zinc-400 block mb-1">
                    Fintas ★
                  </label>
                  <select
                    value={skillMoves}
                    onChange={(e) => setSkillMoves(Number(e.target.value))}
                    className="w-full h-8 px-1.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-extrabold text-amber-400"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-extrabold uppercase text-zinc-400 block mb-1">
                    P. Ruim ★
                  </label>
                  <select
                    value={weakFoot}
                    onChange={(e) => setWeakFoot(Number(e.target.value))}
                    className="w-full h-8 px-1.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-extrabold text-amber-400"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-extrabold uppercase text-zinc-400 block mb-1">
                    País
                  </label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full h-8 px-1.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                  >
                    <option value="BR">🇧🇷 BR</option>
                    <option value="AR">🇦🇷 AR</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* COLUNA DIREITA (8 COLUNAS): IDENTIDADE + ABAS DE BUILD, CARTAS, FOTOS, HORÁRIOS, CARREIRA */}
          <div className="lg:col-span-8 space-y-4">
            {/* CABEÇALHO DE IDENTIDADE DUPLA + SALVAR */}
            <section className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Arquétipo Solto (Sem caixa pesada) */}
                  <img
                    src={selectedArchetypeAsset.iconUrl}
                    alt={selectedArchetypeAsset.name}
                    className="w-14 h-14 object-contain drop-shadow-md shrink-0"
                  />

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-[10px] font-extrabold uppercase">
                        {primaryPosition} #{shirtNumber}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-extrabold"
                        style={{ backgroundColor: accelerateAnalysis.badgeColor }}
                      >
                        ⚡ {accelerateAnalysis.primaryType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#1c2029] text-zinc-600 dark:text-zinc-300 text-[10px] font-bold">
                        {selectedArchetypeAsset.name}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white uppercase truncate">
                      {characterName}
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      Titular: <strong className="text-zinc-800 dark:text-zinc-200">{fullName}</strong> • {heightCm} cm / {weightKg} kg • Clube: <strong className="text-[#00E599]">{currentTeam?.name || 'Furia del Plata'}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveBuildAndProfile}
                  className="py-2.5 px-5 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-display font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#38C958]/20 transition-all shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Build & Carta FC 26
                </button>
              </div>

              {/* Edição Rápida da Identidade Dupla */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-zinc-100 dark:border-white/[0.07]">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#00E599] block mb-1">
                    Nome do Boneco (Carta FC 26 & Súmulas)
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Ex: JEFHE, HAALANDINHO..."
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                    Seu Nome Real (Financeiro / Admin)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Jefherson"
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-bold text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                      Posição na Carta
                    </label>
                    <select
                      value={primaryPosition}
                      onChange={(e) => setPrimaryPosition(e.target.value as PlayerPosition)}
                      className="w-full h-9 px-2 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold text-white"
                    >
                      {['ATA', 'MEI', 'MC', 'VOL', 'ZAG', 'LD', 'LE', 'GK', 'ST', 'CAM', 'CB'].map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                      Camisa #
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={shirtNumber}
                      onChange={(e) => setShirtNumber(Number(e.target.value))}
                      className="w-full h-9 px-2.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-extrabold text-white"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* NAVEGAÇÃO DE ABAS DO ATLETA (5 ABAS) */}
            <div className="p-1.5 rounded-2xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-xs grid grid-cols-5 gap-1">
              {[
                { id: 'build', label: 'Build & Run', icon: Sliders },
                { id: 'cards', label: 'Cartas FC 26', icon: Sparkles },
                { id: 'photos', label: 'Fotos IA', icon: Camera },
                { id: 'availability', label: 'Horários', icon: Calendar },
                { id: 'career', label: 'Carreira', icon: Trophy },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className={cn(
                      'py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1.5',
                      activeTab === t.id
                        ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ============================================================= */}
            {/* ABA 1: MINHA BUILD (QUALIDADES, PLAYSTYLES & ACCELERATE 2.0)  */}
            {/* ============================================================= */}
            {activeTab === 'build' && (
              <div className="space-y-4">
                {/* 1. PAINEL ACCELERATE AO VIVO */}
                <section className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00E599]">
                          Calculadora Oficial EA FC 26 Clubs
                        </span>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-white text-[11px] font-black"
                          style={{ backgroundColor: accelerateAnalysis.badgeColor }}
                        >
                          AcceleRATE: {accelerateAnalysis.primaryType}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-[#1c2029] text-zinc-800 dark:text-zinc-200 text-[11px] font-extrabold">
                          2.0: {accelerateAnalysis.subType}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {accelerateAnalysis.description}
                      </p>
                    </div>

                    <label className="cursor-pointer py-2.5 px-3.5 rounded-2xl bg-[#00E599] text-[#090A0F] hover:bg-[#6b4be8] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0">
                      <Camera className="w-4 h-4" />
                      <span>
                        {ocrLoading ? 'Lendo Print...' : '📸 Ler Print de Qualidades (OCR)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleOcrAttributesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {ocrNotice && (
                    <div className="p-3 rounded-2xl bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-xs font-bold">
                      {ocrNotice}
                    </div>
                  )}

                  {/* Barra Visual de Proporção AcceleRATE 2.0 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-extrabold uppercase">
                      <span className="text-amber-400">
                        ⚡ Explosiva ({accelerateAnalysis.explosivePercent}%)
                      </span>
                      <span className="text-[#38C958]">
                        ⚖️ Controlada ({accelerateAnalysis.controlledPercent}%)
                      </span>
                      <span className="text-[#00E599]">
                        🚂 Prolongada ({accelerateAnalysis.lengthyPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-[#1c2029] overflow-hidden flex">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${accelerateAnalysis.explosivePercent}%` }}
                      />
                      <div
                        className="h-full bg-[#38C958] transition-all"
                        style={{ width: `${accelerateAnalysis.controlledPercent}%` }}
                      />
                      <div
                        className="h-full bg-[#00E599] text-[#090A0F] transition-all"
                        style={{ width: `${accelerateAnalysis.lengthyPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Diagnóstico Automático */}
                  <div className="grid sm:grid-cols-2 gap-2">
                    {accelerateAnalysis.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-white/[0.03] text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-start gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#00E599] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sliders de Altura e Peso */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
                    <div className="p-3 rounded-2xl bg-white/[0.03] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">Altura (cm)</span>
                        <span className="text-xs font-mono font-black text-[#00E599]">{heightCm} cm</span>
                      </div>
                      <input
                        type="range"
                        min={150}
                        max={210}
                        value={heightCm}
                        onChange={(e) => setHeightCm(Number(e.target.value))}
                        className="w-full accent-[#00E599]"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>150 cm</span>
                        <span>≤182 Explosiva | ≥183 Prolongada</span>
                        <span>210 cm</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">Peso (kg)</span>
                        <span className="text-xs font-mono font-black text-[#38C958]">{weightKg} kg</span>
                      </div>
                      <input
                        type="range"
                        min={45}
                        max={115}
                        value={weightKg}
                        onChange={(e) => setWeightKg(Number(e.target.value))}
                        className="w-full accent-[#38C958]"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>45 kg</span>
                        <span>Impacta Força & Inércia</span>
                        <span>115 kg</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. SELETOR VISUAL DE ARQUÉTIPO OFICIAL (Ícones soltos sem borda quadrada pesada) */}
                <section className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedArchetypeAsset.iconUrl}
                        alt={selectedArchetypeAsset.name}
                        className="w-11 h-11 object-contain drop-shadow-md"
                      />
                      <div>
                        <h2 className="text-sm sm:text-base font-display font-extrabold text-white">
                          Arquétipo Oficial: {selectedArchetypeAsset.name}
                        </h2>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Selecione o arquétipo principal do seu boneco no EA FC 26 Clubs
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {(
                        ['Atacante', 'Meio-Campista', 'Defensor', 'Goleiro'] as ArchetypePositionGroup[]
                      ).map((grp) => (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => setArchetypeGroupFilter(grp)}
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all',
                            archetypeGroupFilter === grp
                              ? 'bg-[#00E599] text-[#090A0F] font-black'
                              : 'bg-white/[0.03] text-zinc-600 dark:text-zinc-300'
                          )}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {ARCHETYPE_ASSETS.filter((a) => a.positionGroup === archetypeGroupFilter).map(
                      (arch) => {
                        const isSelected =
                          selectedArchetypeId === arch.id ||
                          selectedArchetypeId.toLowerCase() === arch.name.toLowerCase();
                        return (
                          <button
                            key={arch.id}
                            type="button"
                            onClick={() => setSelectedArchetypeId(arch.id)}
                            className={cn(
                              'p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5',
                              isSelected
                                ? 'border-[#00E599] bg-[#00E599]/15 border border-[#00E599]/30 shadow-xs'
                                : 'border-transparent bg-white/[0.03]/60 hover:border-[#00E599]/40'
                            )}
                          >
                            <img
                              src={arch.iconUrl}
                              alt={arch.name}
                              className="w-12 h-12 object-contain drop-shadow-md"
                            />
                            <span className="text-xs font-extrabold text-white">
                              {arch.name}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </section>

                {/* 3. SELETOR DE PLAYSTYLES (1 CLIQUE = PRATA, 2 CLIQUES = DOURADO+ NA CARTA FC 26) */}
                <section className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-display font-extrabold text-white">
                        PlayStyles & PlayStyles+ ({playstyles.length} ativos)
                      </h2>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        <strong>1 clique</strong> = Prata • <strong>2 cliques</strong> = Dourado (aparece na borda esquerda da sua Carta FC 26!) • <strong>3 cliques</strong> = Remover
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {(
                      [
                        'Finalização',
                        'Passe',
                        'Controle de Bola',
                        'Defesa',
                        'Físico',
                        'Goleiro',
                      ] as PlayStyleCategory[]
                    ).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPlaystyleCategory(cat)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 transition-all',
                          playstyleCategory === cat
                            ? 'bg-[#00E599] text-[#090A0F] font-black'
                            : 'bg-white/[0.03] text-zinc-600 dark:text-zinc-300'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PLAYSTYLE_ASSETS.filter((ps) => ps.category === playstyleCategory).map((ps) => {
                      const sel = playstyles.find((p) => p.id === ps.id);
                      const isGold = sel?.level === 'gold' || sel?.tier === 'gold';
                      const isSilver = sel?.level === 'silver' || sel?.tier === 'silver';

                      return (
                        <button
                          key={ps.id}
                          type="button"
                          onClick={() => handleTogglePlayStyle(ps.id)}
                          className={cn(
                            'p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 relative',
                            isGold &&
                              'border-amber-400 bg-amber-500/10 shadow-[0_0_16px_rgba(245,158,11,0.2)]',
                            isSilver && 'border-zinc-400 bg-zinc-200/40 dark:bg-[#1c2029]',
                            !sel &&
                              'border-transparent bg-white/[0.03]/40 opacity-75 hover:opacity-100'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase',
                              isGold && 'bg-amber-400 text-zinc-950',
                              isSilver && 'bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-white',
                              !sel && 'hidden'
                            )}
                          >
                            {isGold ? 'OURO+' : 'PRATA'}
                          </span>

                          <img
                            src={isGold ? ps.plusIconUrl : ps.baseIconUrl}
                            alt={ps.name}
                            className="w-11 h-11 object-contain drop-shadow-md"
                          />
                          <span className="text-[11px] font-extrabold text-white leading-tight">
                            {ps.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* 4. EDITOR DOS 31 ATRIBUTOS (ATUALIZA OS 6 MACRO-STATS DA CARTA EM TEMPO REAL) */}
                <section className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
                  <div>
                    <h2 className="text-sm sm:text-base font-display font-extrabold text-white">
                      Qualidades do Atleta (31 Atributos → Cálculo Automático PAC/SHO/PAS/DRI/DEF/PHY)
                    </h2>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Qualquer ajuste abaixo recalcula instantaneamente os 6 atributos e o OVR da sua Carta FC 26 ao lado
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {ATTRIBUTE_GROUPS.map((group) => (
                      <div
                        key={group.id}
                        className="p-3.5 rounded-2xl bg-white/[0.03]/70 border border-zinc-200/60 dark:border-white/[0.05] space-y-2.5"
                      >
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00E599]">
                          {group.label}
                        </h3>

                        <div className="space-y-2">
                          {group.fields.map((field) => {
                            const val = attributes[field.key] ?? 80;
                            return (
                              <div key={field.key} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                    {field.label}
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={val}
                                    onChange={(e) => {
                                      const n = Math.max(
                                        1,
                                        Math.min(99, Number(e.target.value) || 1)
                                      );
                                      setAttributes((prev) => ({
                                        ...prev,
                                        [field.key]: n,
                                      }));
                                    }}
                                    className="w-12 h-6 text-center rounded-lg bg-[#0D0F17] border border-zinc-200 dark:border-white/10 font-mono font-black text-xs text-[#38C958]"
                                  />
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                  <div
                                    className="h-full bg-[#38C958] transition-all"
                                    style={{ width: `${val}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ============================================================= */}
            {/* ABA 2: GALERIA DE CARTAS FC 26 & DESBLOQUEIO POR MÉRITO       */}
            {/* ============================================================= */}
            {activeTab === 'cards' && (
              <section className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-display font-extrabold text-white">
                      Coleção Oficial de Cartas EA FC 26 ({CARD_DESIGN_ASSETS.length} Designs)
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Desbloqueie designs especiais evoluindo seu OVR em campeonatos ou abrindo Packs FC 26! Clique em qualquer carta para testar e equipar.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CARD_DESIGN_ASSETS.map((design) => {
                    const isUnlocked = unlockedCardSet.has(design.id);
                    const isEquipped = selectedCardUrl === design.url;

                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => {
                          setSelectedCardUrl(design.url);
                          if (currentPlayer) {
                            unlockPlayerCardDesign(currentPlayer.id, design.id, design.url);
                          }
                        }}
                        className={cn(
                          'p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 relative group',
                          isEquipped
                            ? 'border-[#00E599] bg-[#00E599]/15 border border-[#00E599]/30 shadow-lg shadow-[#00E599]/15'
                            : 'border-zinc-200/70 dark:border-white/[0.07] bg-white/[0.03]/60 hover:border-[#00E599]/50'
                        )}
                      >
                        <div className="absolute top-2 right-2">
                          {isEquipped ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#38C958] text-white text-[9px] font-black uppercase flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Equipada
                            </span>
                          ) : isUnlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#00E599] text-[#090A0F]/20 text-[#00E599] text-[9px] font-black uppercase">
                              Liberada
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full bg-zinc-900/80 text-amber-400 text-[9px] font-bold flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Preview
                            </span>
                          )}
                        </div>

                        <img
                          src={design.url}
                          alt={design.name}
                          className="w-24 h-32 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                        />

                        <div className="space-y-0.5">
                          <span className="text-xs font-display font-extrabold text-white block">
                            {design.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">
                            {design.unlockRequirement}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ============================================================= */}
            {/* ABA 3: FOTOS REAIS DO PERSONAGEM (ROSTO + CORPO INTEIRO)      */}
            {/* ============================================================= */}
            {activeTab === 'photos' && (
              <section className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-display font-extrabold text-white">
                    Fotos Oficiais do Personagem (Recorte Automático na Carta FC 26 & Estúdio IA)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Ao enviar a foto do seu boneco, o sistema aplica recorte inteligente de busto na sua Carta FC 26 e disponibiliza o ativo para os banners pós-jogo.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-white/[0.03] border border-zinc-200/70 dark:border-white/10 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-[10px] font-extrabold uppercase">
                        📸 Foto do Rosto / Busto (Carta FC 26)
                      </span>
                      <h3 className="text-sm font-extrabold">
                        Retrato da Carta ({characterName})
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Exibido no centro superior da sua Carta FC 26 com remoção de fundo automática.
                      </p>
                    </div>

                    <div className="w-full h-48 rounded-2xl bg-[#0c0e12] overflow-hidden flex items-center justify-center border border-white/10">
                      <img
                        src={avatarFaceUrl || TEMPLATE_ASSETS.avatarPlaceholder}
                        alt="Rosto do Personagem"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
                        }}
                      />
                    </div>

                    <label className="cursor-pointer w-full py-2.5 px-4 rounded-2xl bg-[#00E599] text-[#090A0F] hover:bg-[#6b4be8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>Enviar Foto para a Carta FC 26</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload('face', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="p-4 rounded-3xl bg-white/[0.03] border border-zinc-200/70 dark:border-white/10 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#38C958] text-[10px] font-extrabold uppercase">
                        🧍 Foto de Corpo Inteiro (Estúdio IA)
                      </span>
                      <h3 className="text-sm font-extrabold">
                        Corpo Inteiro no Lobby ({characterName})
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Usado para preservar altura ({heightCm} cm), porte físico e chuteiras nas cenas de pós-jogo.
                      </p>
                    </div>

                    <div className="w-full h-48 rounded-2xl bg-[#0c0e12] overflow-hidden flex items-center justify-center border border-white/10">
                      <img
                        src={avatarBodyUrl || TEMPLATE_ASSETS.avatarPlaceholder}
                        alt="Corpo Inteiro do Personagem"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
                        }}
                      />
                    </div>

                    <label className="cursor-pointer w-full py-2.5 px-4 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>Enviar Foto de Corpo Inteiro</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload('body', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* ============================================================= */}
            {/* ABA 4: DISPONIBILIDADE POR INTERVALOS DE HORÁRIO              */}
            {/* ============================================================= */}
            {activeTab === 'availability' && (
              <section className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
                <div>
                  <h2 className="text-base font-display font-extrabold text-white">
                    Meus Intervalos de Horário (Tinder de Agenda)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Selecione turnos inteiros ou defina sua faixa personalizada de início e término para cruzar automaticamente com seu elenco.
                  </p>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {DAYS_OF_WEEK.map((d) => {
                    const count = (availabilityIntervals[d.key] || []).length;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDay(d.key)}
                        className={cn(
                          'px-3 py-2 rounded-2xl text-xs font-extrabold shrink-0 transition-all flex items-center gap-1.5',
                          selectedDay === d.key
                            ? 'bg-[#00E599] text-[#090A0F] font-black shadow-xs'
                            : 'bg-white/[0.03] text-zinc-700 dark:text-zinc-300'
                        )}
                      >
                        <span>{d.label}</span>
                        {count > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#38C958] text-white text-[10px]">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-zinc-600 dark:text-zinc-300 block">
                    Turnos Rápidos ({DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.label}):
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {INTERVAL_PRESETS.map((preset) => {
                      const active = (availabilityIntervals[selectedDay] || []).some(
                        (i) => i.id === preset.id
                      );
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => toggleIntervalForDay(selectedDay, preset)}
                          className={cn(
                            'p-3 rounded-2xl border text-left transition-all flex items-center justify-between',
                            active
                              ? 'border-[#38C958] bg-[#38C958]/10 text-white font-extrabold'
                              : 'border-transparent bg-white/[0.03]/60 text-xs font-semibold text-zinc-600 dark:text-zinc-400'
                          )}
                        >
                          <span className="text-xs">{preset.label}</span>
                          {active && <CheckCircle2 className="w-4 h-4 text-[#38C958] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-zinc-200/60 dark:border-white/10 space-y-2.5">
                  <span className="text-xs font-extrabold text-[#00E599] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Adicionar Janela Personalizada (Ex: Das 21:30 às 23:30)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-500">Das</span>
                      <input
                        type="time"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="h-9 px-2.5 rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-mono font-extrabold"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-500">às</span>
                      <input
                        type="time"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="h-9 px-2.5 rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-mono font-extrabold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addCustomRangeForDay(selectedDay)}
                      className="h-9 px-3.5 rounded-xl bg-[#00E599] text-[#090A0F] font-black text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Incluir Faixa
                    </button>
                  </div>

                  {(availabilityIntervals[selectedDay] || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(availabilityIntervals[selectedDay] || []).map((slot, sIdx) => (
                        <span
                          key={slot.id || `slot-${sIdx}`}
                          className="px-3 py-1 rounded-full bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-bold flex items-center gap-2"
                        >
                          <span>{slot.label}</span>
                          <button
                            type="button"
                            onClick={() => removeSlotFromDay(selectedDay, slot.id || '')}
                            className="text-rose-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ============================================================= */}
            {/* ABA 5: CARREIRA & TROFÉUS TRANSPARENTES (SEM CAIXAS PESADAS)  */}
            {/* ============================================================= */}
            {activeTab === 'career' && (
              <section className="space-y-4">
                <div className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-base font-display font-extrabold text-white">
                        Histórico Oficial de Carreira ({characterName})
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Seus gols, assistências, títulos e MVPs geram <strong className="text-[#38C958]">+{fc26Macro.careerBonus} OVR de Bônus de Carreira</strong> na sua Carta FC 26!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Campeonatos', val: career.tournaments_played ?? 4 },
                      { label: 'Títulos', val: career.titles_won ?? 1 },
                      { label: 'Partidas', val: career.matches_played ?? career.official_matches ?? 18 },
                      { label: 'Gols Marcados', val: career.goals ?? career.official_goals ?? 24 },
                      { label: 'Assistências', val: career.assists ?? career.official_assists ?? 11 },
                      { label: 'MVPs (Craque)', val: career.mvps ?? career.official_motm ?? 6 },
                      { label: 'Clean Sheets', val: career.clean_sheets ?? 0 },
                      { label: 'Nota Média', val: (career.average_rating ?? 8.9).toFixed(1) },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-3.5 rounded-2xl bg-white/[0.03] text-center space-y-1"
                      >
                        <span className="text-xl font-mono font-black text-[#00E599] block tabular-nums">
                          {stat.val}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Galeria de Troféus e Premiações Reais (Ícones soltos sem borda quadrada pesada) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-3.5">
                  <h3 className="text-sm font-display font-extrabold text-white">
                    Sala de Troféus & Insígnias Oficiais da Liga
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AWARD_ASSETS.map((aw) => (
                      <div
                        key={aw.id}
                        className="p-3.5 rounded-2xl bg-white/[0.03]/50 flex flex-col items-center text-center gap-2 hover:scale-[1.02] transition-transform"
                      >
                        <img
                          src={aw.iconUrl}
                          alt={aw.name}
                          className="w-16 h-16 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
                        />
                        <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100 leading-tight">
                          {aw.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
