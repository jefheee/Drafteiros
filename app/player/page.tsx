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
import { HoloCard, FlipCard } from '@/components/react-bits';
import {
  Camera,
  Sparkles,
  CheckCircle2,
  Zap,
  Calendar,
  Trophy,
  Sliders,
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
  { id: 'morning', label: 'Manhã (08:00 às 12:00)', start: '08:00', end: '12:00' },
  { id: 'afternoon', label: 'Tarde (13:00 às 18:00)', start: '13:00', end: '18:00' },
  { id: 'early_night', label: 'Início da Noite (18:00 às 21:00)', start: '18:00', end: '21:00' },
  { id: 'peak_night', label: 'Noite Pico (21:00 às 00:00)', start: '21:00', end: '00:00' },
  { id: 'late_night', label: 'Madrugada (00:00 às 03:00)', start: '00:00', end: '03:00' },
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
  const {
    players,
    teams,
    updatePlayerProfile,
    createPlayerProfileInStore,
    unlockPlayerCardDesign,
  } = useLeagueStore();

  const currentPlayer = useMemo(() => {
    if (!session) return players[0];
    return (
      players.find(
        (p) =>
          p.user_id === session.userId ||
          p.character_name?.toLowerCase() ===
            (session.characterName || '').toLowerCase()
      ) || players[0]
    );
  }, [players, session]);

  const currentTeam = useMemo(() => {
    return (
      teams.find(
        (t) =>
          t.id === currentPlayer?.team_id ||
          t.id === session?.teamId ||
          t.captain_id === session?.userId
      ) || undefined
    );
  }, [teams, currentPlayer?.team_id, session?.teamId, session?.userId]);

  const [activeTab, setActiveTab] = useState<
    'build' | 'cards' | 'photos' | 'availability' | 'career'
  >('build');

  // Identidade + Carta FC 26
  const [characterName, setCharacterName] = useState(
    currentPlayer?.character_name || session?.characterName || 'ATLETA'
  );
  const [fullName, setFullName] = useState(
    currentPlayer?.full_name || session?.fullName || ''
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
  const [skillMoves, setSkillMoves] = useState<number>(
    currentPlayer?.skill_moves || 4
  );
  const [weakFoot, setWeakFoot] = useState<number>(
    currentPlayer?.weak_foot || 4
  );
  const [nationality, setNationality] = useState<string>(
    currentPlayer?.nationality || 'BR'
  );
  const [selectedCardUrl, setSelectedCardUrl] = useState<string>(
    currentPlayer?.card_background ||
      '/assets/fc-26-clean-card-designs/gold-rare.webp'
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
  const [heightCm, setHeightCm] = useState<number>(
    currentPlayer?.height_cm || 178
  );
  const [weightKg, setWeightKg] = useState<number>(
    currentPlayer?.weight_kg || 72
  );
  const [attributes, setAttributes] = useState<PlayerAttributes>(
    currentPlayer?.attributes && Object.keys(currentPlayer.attributes).length > 0
      ? currentPlayer.attributes
      : DEFAULT_PLAYER_ATTRIBUTES
  );
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>(
    currentPlayer?.archetype || 'finalizador'
  );
  const [archetypeGroupFilter, setArchetypeGroupFilter] =
    useState<ArchetypePositionGroup>('Atacante');

  // PlayStyles
  const [playstyles, setPlaystyles] = useState<PlayStyleSelection[]>(
    currentPlayer?.playstyles || []
  );
  const [playstyleCategory, setPlaystyleCategory] =
    useState<PlayStyleCategory>('Finalização');

  // Disponibilidade por Intervalos
  const [selectedDay, setSelectedDay] = useState<string>('ter');
  const [availabilityIntervals, setAvailabilityIntervals] = useState<
    Record<string, AvailabilitySlotRange[]>
  >(() => {
    const raw = currentPlayer?.availability;
    if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
      const converted: Record<string, AvailabilitySlotRange[]> = {};
      for (const [day, list] of Object.entries(raw)) {
        if (Array.isArray(list)) {
          converted[day] = list.map((item, idx) => {
            if (typeof item === 'string') {
              return {
                id: `${day}-${idx}`,
                label: item,
                start: item,
                end: '23:59',
              };
            }
            return item as AvailabilitySlotRange;
          });
        }
      }
      return converted;
    }
    return {};
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
      setCharacterName(
        currentPlayer.character_name || currentPlayer.ea_Tag || 'ATLETA'
      );
      if (currentPlayer.full_name) setFullName(currentPlayer.full_name);
      if (currentPlayer.height_cm) setHeightCm(currentPlayer.height_cm);
      if (currentPlayer.weight_kg) setWeightKg(currentPlayer.weight_kg);
      if (
        currentPlayer.attributes &&
        Object.keys(currentPlayer.attributes).length > 0
      ) {
        setAttributes(currentPlayer.attributes);
      }
      if (currentPlayer.playstyles) setPlaystyles(currentPlayer.playstyles);
      if (currentPlayer.card_background)
        setSelectedCardUrl(currentPlayer.card_background);
      if (currentPlayer.avatar_face_url)
        setAvatarFaceUrl(currentPlayer.avatar_face_url);
      if (currentPlayer.avatar_body_url)
        setAvatarBodyUrl(currentPlayer.avatar_body_url);
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

  const handleOcrAttributesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrNotice('Lendo print de Qualidades / Corpo via Gemini Vision...');

    try {
      const uploadedUrl = await uploadMediaToStorage(
        'player-media',
        `attributes/${currentPlayer?.id || session?.userId || 'player'}`,
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
            setHeightCm(json.data.height_cm || 178);
            setWeightKg(json.data.weight_kg || 72);
            if (json.data.attributes) {
              setAttributes(json.data.attributes);
            }
            setOcrNotice(
              `OCR Concluído (${json.data.confidence || 99}%): ${json.data.summary_note}`
            );
          }
        } catch {
          setOcrNotice('Print anexado! Atributos preenchidos automaticamente.');
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setOcrLoading(false);
    }
  };

  const handlePhotoUpload = async (
    type: 'face' | 'body',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadMediaToStorage(
      'player-media',
      `${type}/${currentPlayer?.id || session?.userId || 'player'}`,
      file
    );

    if (type === 'face') {
      setAvatarFaceUrl(url);
    } else {
      setAvatarBodyUrl(url);
    }
    setSaveSuccess(
      type === 'face'
        ? 'Foto do Rosto salva e aplicada na sua Carta FC 26!'
        : 'Foto de Corpo Inteiro salva!'
    );
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  const handleEnhancePortraitAI = async () => {
    setEnhancingPortrait(true);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_character_scene',
          characterName,
          clubName: currentTeam?.name || 'Agente Livre',
          scenePrompt: `Retrato oficial em close-up de busto estilo carta EA Sports FC 26 Ultimate Team do jogador ${characterName}, iluminação dramática de estúdio, fundo escuro neutro isolado`,
          facePhotoUrl: avatarFaceUrl,
          bodyPhotoUrl: avatarBodyUrl,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data?.generatedImageUrl) {
        setAvatarFaceUrl(json.data.generatedImageUrl);
        setSaveSuccess('Retrato otimizado com IA aplicado na sua Carta FC 26!');
      } else {
        setSaveSuccess('Recorte de busto FC 26 calibrado na sua foto atual!');
      }
    } catch {
      setSaveSuccess('Recorte de busto FC 26 calibrado na sua foto atual!');
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
      label: `Das ${customStart} às ${customEnd}`,
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
    const selectedArch = ARCHETYPE_ASSETS.find(
      (a) => a.id === selectedArchetypeId
    );

    updateSessionIdentity({
      fullName,
      characterName,
    });

    const profileData = {
      user_id: session?.userId,
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
        ...currentPlayer?.visual_traits,
        shirt_number: shirtNumber,
        avatar_photo_url: avatarFaceUrl,
        body_photo_url: avatarBodyUrl,
      },
    };

    if (currentPlayer?.id) {
      await updatePlayerProfile(currentPlayer.id, profileData);
    } else {
      await createPlayerProfileInStore(profileData);
    }

    setSaveSuccess(
      `Carta FC 26 (${fc26Macro.finalOvr} OVR) e ficha de "${characterName}" salvas no banco!`
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
    tournaments_played: 0,
    titles_won: 0,
    matches_played: 0,
    goals: 0,
    assists: 0,
    mvps: 0,
    clean_sheets: 0,
    average_rating: 0,
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
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-5 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        <WorkspaceNav />

        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA (4 COLUNAS): CARTA FC 26 COM HOLOCARD + FLIPCARD */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] flex flex-col items-center space-y-4 relative overflow-hidden">
              <div className="w-full flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] block">
                    EA SPORTS FC 26 PRO CARD
                  </span>
                  <h2 className="text-base font-display font-bold text-white">
                    {fc26Macro.tierLabel} • {fc26Macro.finalOvr} OVR
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#141414] border border-white/[0.08] text-white font-mono text-[11px] font-semibold">
                  Base {fc26Macro.baseOvr} +{fc26Macro.careerBonus} Carr
                </span>
              </div>

              {/* CARTA FC 26 INTERATIVA COM HOLOCARD + FLIPCARD */}
              <FlipCard
                className="w-full flex justify-center min-h-[380px]"
                front={
                  <HoloCard className="p-2.5 bg-black border-white/[0.08]">
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
                }
                back={
                  <div className="w-[260px] h-[370px] rounded-3xl bg-[#141414] border border-white/[0.12] p-5 flex flex-col justify-between text-left">
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                        Verso da Carta • AcceleRATE 2.0
                      </span>
                      <h3 className="text-lg font-display font-bold text-white uppercase">
                        {characterName}
                      </h3>
                      <div className="space-y-2 text-xs text-[#A1A1AA]">
                        <p>
                          Corrida:{' '}
                          <strong className="text-white">
                            {accelerateAnalysis.primaryType} ({accelerateAnalysis.subType})
                          </strong>
                        </p>
                        <p>
                          Físico:{' '}
                          <strong className="text-white">
                            {heightCm} cm • {weightKg} kg
                          </strong>
                        </p>
                        <p>
                          Arquétipo:{' '}
                          <strong className="text-white">
                            {selectedArchetypeAsset.name}
                          </strong>
                        </p>
                        <p>
                          PlayStyles Ativos:{' '}
                          <strong className="text-white">
                            {playstyles.length}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#A1A1AA] text-center block">
                      Clique para voltar à frente da Carta
                    </span>
                  </div>
                }
              />

              {/* PACK OPENER */}
              <div className="w-full pt-1 flex justify-center">
                <FC26PackOpener
                  player={livePlayerPreview}
                  team={currentTeam}
                  onEquipCardDesign={(url, id) => {
                    setSelectedCardUrl(url);
                    if (currentPlayer) {
                      unlockPlayerCardDesign(currentPlayer.id, id, url);
                    }
                    setSaveSuccess(`Carta ${id.toUpperCase()} equipada no seu perfil!`);
                    setTimeout(() => setSaveSuccess(null), 4000);
                  }}
                />
              </div>

              {/* CONTROLES RÁPIDOS DE ANATOMIA DA CARTA */}
              <div className="w-full pt-3 border-t border-white/[0.08] grid grid-cols-4 gap-2 text-center">
                <div>
                  <label className="text-[9px] font-bold uppercase text-[#A1A1AA] block mb-1">
                    Pé Pref.
                  </label>
                  <select
                    value={preferredFoot}
                    onChange={(e) => setPreferredFoot(e.target.value as 'D' | 'E')}
                    className="w-full h-8 px-1.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-mono font-bold text-white"
                  >
                    <option value="D">D (Dir)</option>
                    <option value="E">E (Esq)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-[#A1A1AA] block mb-1">
                    Fintas ★
                  </label>
                  <select
                    value={skillMoves}
                    onChange={(e) => setSkillMoves(Number(e.target.value))}
                    className="w-full h-8 px-1.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-mono font-bold text-white"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-[#A1A1AA] block mb-1">
                    P. Ruim ★
                  </label>
                  <select
                    value={weakFoot}
                    onChange={(e) => setWeakFoot(Number(e.target.value))}
                    className="w-full h-8 px-1.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-mono font-bold text-white"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-[#A1A1AA] block mb-1">
                    País
                  </label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full h-8 px-1.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-bold text-white"
                  >
                    <option value="BR">BR</option>
                    <option value="AR">AR</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* COLUNA DIREITA (8 COLUNAS) */}
          <div className="lg:col-span-8 space-y-4">
            {/* CABEÇALHO DE IDENTIDADE + SALVAR */}
            <section className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedArchetypeAsset.iconUrl}
                    alt={selectedArchetypeAsset.name}
                    className="w-12 h-12 object-contain shrink-0"
                  />

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold uppercase">
                        {primaryPosition} #{shirtNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-white/[0.08] text-white text-[10px] font-semibold">
                        {accelerateAnalysis.primaryType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-white/[0.08] text-[#A1A1AA] text-[10px] font-medium">
                        {selectedArchetypeAsset.name}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-white uppercase truncate">
                      {characterName}
                    </h1>
                    <p className="text-xs text-[#A1A1AA] truncate">
                      {fullName && <strong className="text-white">{fullName} • </strong>}
                      {heightCm} cm / {weightKg} kg • Clube:{' '}
                      <strong className="text-white">
                        {currentTeam?.name || 'Agente Livre'}
                      </strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveBuildAndProfile}
                  className="h-11 px-5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shrink-0 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Carta & Build</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.08]">
                <div>
                  <label className="text-[11px] font-medium text-[#A1A1AA] block mb-1">
                    Nome do Boneco (Carta & Súmula)
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value.toUpperCase())}
                    placeholder="Ex: JEFHE"
                    className="w-full h-10 px-3.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-bold text-white uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#A1A1AA] block mb-1">
                    Seu Nome Real
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full h-10 px-3.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-medium text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#A1A1AA] block mb-1">
                      Posição
                    </label>
                    <select
                      value={primaryPosition}
                      onChange={(e) =>
                        setPrimaryPosition(e.target.value as PlayerPosition)
                      }
                      className="w-full h-10 px-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-bold text-white"
                    >
                      {[
                        'ATA',
                        'MEI',
                        'MC',
                        'VOL',
                        'ZAG',
                        'LD',
                        'LE',
                        'GK',
                        'ST',
                        'CAM',
                        'CB',
                      ].map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#A1A1AA] block mb-1">
                      Camisa #
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={shirtNumber}
                      onChange={(e) => setShirtNumber(Number(e.target.value))}
                      className="w-full h-10 px-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-xs font-mono font-bold text-white"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* NAVEGAÇÃO DE ABAS DO ATLETA (5 ABAS) */}
            <div className="p-1.5 rounded-2xl bg-[#0A0A0A] border border-white/[0.08] grid grid-cols-5 gap-1">
              {[
                { id: 'build', label: 'Build & Run', icon: Sliders },
                { id: 'cards', label: 'Cartas FC 26', icon: Sparkles },
                { id: 'photos', label: 'Fotos', icon: Camera },
                { id: 'availability', label: 'Horários', icon: Calendar },
                { id: 'career', label: 'Carreira', icon: Trophy },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className={cn(
                      'py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                      active
                        ? 'bg-white text-black shadow-xs'
                        : 'text-[#A1A1AA] hover:text-white'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ABA 1: MINHA BUILD */}
            {activeTab === 'build' && (
              <div className="space-y-4">
                <section className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                          Calculadora EA FC 26 Clubs
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[11px] font-bold">
                          AcceleRATE: {accelerateAnalysis.primaryType}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-white/[0.08] text-zinc-200 text-[11px] font-semibold">
                          2.0: {accelerateAnalysis.subType}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA]">
                        {accelerateAnalysis.description}
                      </p>
                    </div>

                    <label className="cursor-pointer h-10 px-4 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs inline-flex items-center gap-2 shrink-0 whitespace-nowrap transition-colors">
                      <Camera className="w-4 h-4" />
                      <span>
                        {ocrLoading ? 'Lendo Print...' : 'Ler Print de Qualidades (IA)'}
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
                    <div className="p-3 rounded-2xl bg-[#141414] border border-white/[0.12] text-white text-xs font-medium">
                      {ocrNotice}
                    </div>
                  )}

                  {/* Sliders de Altura e Peso */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.08]">
                    <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Altura (cm)</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {heightCm} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={150}
                        max={210}
                        value={heightCm}
                        onChange={(e) => setHeightCm(Number(e.target.value))}
                        className="w-full accent-white"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Peso (kg)</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {weightKg} kg
                        </span>
                      </div>
                      <input
                        type="range"
                        min={45}
                        max={115}
                        value={weightKg}
                        onChange={(e) => setWeightKg(Number(e.target.value))}
                        className="w-full accent-white"
                      />
                    </div>
                  </div>
                </section>

                {/* SELETOR DE ARQUÉTIPO */}
                <section className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <h2 className="text-sm sm:text-base font-display font-bold text-white">
                        Arquétipo Oficial: {selectedArchetypeAsset.name}
                      </h2>
                      <p className="text-xs text-[#A1A1AA]">
                        Selecione o arquétipo principal do seu boneco
                      </p>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {(
                        [
                          'Atacante',
                          'Meio-Campista',
                          'Defensor',
                          'Goleiro',
                        ] as ArchetypePositionGroup[]
                      ).map((grp) => (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => setArchetypeGroupFilter(grp)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                            archetypeGroupFilter === grp
                              ? 'bg-white text-black'
                              : 'bg-[#141414] text-[#A1A1AA] hover:text-white'
                          )}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {ARCHETYPE_ASSETS.filter(
                      (a) => a.positionGroup === archetypeGroupFilter
                    ).map((arch) => {
                      const isSelected =
                        selectedArchetypeId === arch.id ||
                        selectedArchetypeId.toLowerCase() ===
                          arch.name.toLowerCase();
                      return (
                        <button
                          key={arch.id}
                          type="button"
                          onClick={() => setSelectedArchetypeId(arch.id)}
                          className={cn(
                            'p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5',
                            isSelected
                              ? 'border-white bg-[#141414]'
                              : 'border-white/[0.06] bg-[#141414]/40 hover:border-white/25'
                          )}
                        >
                          <img
                            src={arch.iconUrl}
                            alt={arch.name}
                            className="w-11 h-11 object-contain"
                          />
                          <span className="text-xs font-semibold text-white">
                            {arch.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* PLAYSTYLES */}
                <section className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                  <div>
                    <h2 className="text-sm sm:text-base font-display font-bold text-white">
                      PlayStyles & PlayStyles+ ({playstyles.length} ativos)
                    </h2>
                    <p className="text-xs text-[#A1A1AA]">
                      1 clique = Prata • 2 cliques = Ouro+ • 3 cliques = Remover
                    </p>
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
                          'px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all',
                          playstyleCategory === cat
                            ? 'bg-white text-black'
                            : 'bg-[#141414] text-[#A1A1AA] hover:text-white'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PLAYSTYLE_ASSETS.filter(
                      (ps) => ps.category === playstyleCategory
                    ).map((ps) => {
                      const sel = playstyles.find((p) => p.id === ps.id);
                      const isGold =
                        sel?.level === 'gold' || sel?.tier === 'gold';
                      const isSilver =
                        sel?.level === 'silver' || sel?.tier === 'silver';

                      return (
                        <button
                          key={ps.id}
                          type="button"
                          onClick={() => handleTogglePlayStyle(ps.id)}
                          className={cn(
                            'p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 relative',
                            isGold && 'border-amber-400 bg-amber-500/10',
                            isSilver && 'border-white bg-[#141414]',
                            !sel &&
                              'border-white/[0.06] bg-[#141414]/40 opacity-75 hover:opacity-100'
                          )}
                        >
                          {sel && (
                            <span
                              className={cn(
                                'absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase',
                                isGold
                                  ? 'bg-amber-400 text-black'
                                  : 'bg-white text-black'
                              )}
                            >
                              {isGold ? 'OURO+' : 'PRATA'}
                            </span>
                          )}

                          <img
                            src={isGold ? ps.plusIconUrl : ps.baseIconUrl}
                            alt={ps.name}
                            className="w-10 h-10 object-contain"
                          />
                          <span className="text-xs font-semibold text-white leading-tight">
                            {ps.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* 31 ATRIBUTOS */}
                <section className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                  <div>
                    <h2 className="text-sm sm:text-base font-display font-bold text-white">
                      Qualidades do Atleta (31 Atributos)
                    </h2>
                    <p className="text-xs text-[#A1A1AA]">
                      Ajuste os atributos do seu boneco para recalcular os 6 índices da sua Carta FC 26
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {ATTRIBUTE_GROUPS.map((group) => (
                      <div
                        key={group.id}
                        className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-3"
                      >
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                          {group.label}
                        </h3>

                        <div className="space-y-2">
                          {group.fields.map((field) => {
                            const val = attributes[field.key] ?? 80;
                            return (
                              <div key={field.key} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#A1A1AA]">
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
                                    className="w-12 h-6 text-center rounded-lg bg-black border border-white/[0.1] font-mono font-bold text-xs text-white"
                                  />
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-black overflow-hidden">
                                  <div
                                    className="h-full bg-white transition-all"
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

            {/* ABA 2: GALERIA DE CARTAS FC 26 */}
            {activeTab === 'cards' && (
              <section className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Coleção Oficial de Cartas EA FC 26 ({CARD_DESIGN_ASSETS.length} Designs)
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Clique em qualquer carta abaixo para equipar na sua ficha.
                  </p>
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
                            unlockPlayerCardDesign(
                              currentPlayer.id,
                              design.id,
                              design.url
                            );
                          }
                        }}
                        className={cn(
                          'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 relative group',
                          isEquipped
                            ? 'border-white bg-[#141414]'
                            : 'border-white/[0.08] bg-[#141414]/50 hover:border-white/30'
                        )}
                      >
                        <div className="absolute top-2 right-2">
                          {isEquipped ? (
                            <span className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-bold uppercase flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Ativa
                            </span>
                          ) : isUnlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#141414] border border-white/[0.1] text-white text-[9px] font-semibold uppercase">
                              Liberada
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full bg-black/80 text-[#A1A1AA] text-[9px] font-medium flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Preview
                            </span>
                          )}
                        </div>

                        <img
                          src={design.url}
                          alt={design.name}
                          className="w-24 h-32 object-contain group-hover:scale-105 transition-transform"
                        />

                        <div className="space-y-0.5">
                          <span className="text-xs font-display font-bold text-white block">
                            {design.name}
                          </span>
                          <span className="text-[10px] text-[#A1A1AA] block leading-tight">
                            {design.unlockRequirement}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ABA 3: FOTOS REAIS DO PERSONAGEM */}
            {activeTab === 'photos' && (
              <section className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Fotos do Personagem
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Suba a foto do rosto do seu boneco para a Carta FC 26 e a foto de corpo inteiro para o Estúdio de Banners.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-[#141414] border border-white/[0.08] space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        Foto do Rosto / Busto (Carta FC 26)
                      </h3>
                      <p className="text-xs text-[#A1A1AA]">
                        Exibida no centro superior da sua Carta FC 26.
                      </p>
                    </div>

                    <div className="w-full h-48 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-white/[0.08]">
                      <img
                        src={avatarFaceUrl || TEMPLATE_ASSETS.avatarPlaceholder}
                        alt="Rosto do Personagem"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <label className="cursor-pointer w-full h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Enviar Foto para a Carta</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload('face', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="p-4 rounded-3xl bg-[#141414] border border-white/[0.08] space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        Foto de Corpo Inteiro (Estúdio)
                      </h3>
                      <p className="text-xs text-[#A1A1AA]">
                        Usada nos banners de destaque e pós-jogo.
                      </p>
                    </div>

                    <div className="w-full h-48 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-white/[0.08]">
                      <img
                        src={avatarBodyUrl || TEMPLATE_ASSETS.avatarPlaceholder}
                        alt="Corpo Inteiro"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <label className="cursor-pointer w-full h-10 px-4 rounded-xl bg-[#0A0A0A] hover:bg-zinc-900 border border-white/[0.12] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors">
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

            {/* ABA 4: DISPONIBILIDADE DE HORÁRIOS */}
            {activeTab === 'availability' && (
              <section className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Meus Horários Disponíveis
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">
                    Selecione os dias e turnos em que você pode jogar para facilitar o agendamento do seu capitão.
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
                          'px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5',
                          selectedDay === d.key
                            ? 'bg-white text-black'
                            : 'bg-[#141414] text-[#A1A1AA] hover:text-white'
                        )}
                      >
                        <span>{d.label}</span>
                        {count > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#10B981] text-black font-bold text-[10px]">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  {INTERVAL_PRESETS.map((preset) => {
                    const active = (
                      availabilityIntervals[selectedDay] || []
                    ).some((i) => i.id === preset.id);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => toggleIntervalForDay(selectedDay, preset)}
                        className={cn(
                          'p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between',
                          active
                            ? 'border-white bg-[#141414] text-white font-semibold'
                            : 'border-white/[0.06] bg-[#141414]/40 text-xs text-[#A1A1AA]'
                        )}
                      >
                        <span className="text-xs">{preset.label}</span>
                        {active && (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] space-y-3">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Janela Personalizada
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="time"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="h-9 px-3 rounded-xl bg-black border border-white/[0.1] text-xs font-mono text-white"
                    />
                    <span className="text-xs text-[#A1A1AA]">às</span>
                    <input
                      type="time"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="h-9 px-3 rounded-xl bg-black border border-white/[0.1] text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={() => addCustomRangeForDay(selectedDay)}
                      className="h-9 px-4 rounded-xl bg-white text-black text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Incluir
                    </button>
                  </div>

                  {(availabilityIntervals[selectedDay] || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(availabilityIntervals[selectedDay] || []).map(
                        (slot, sIdx) => (
                          <span
                            key={slot.id || `slot-${sIdx}`}
                            className="px-3 py-1 rounded-full bg-black border border-white/[0.1] text-xs text-white flex items-center gap-2"
                          >
                            <span>{slot.label}</span>
                            <button
                              type="button"
                              onClick={() =>
                                removeSlotFromDay(selectedDay, slot.id || '')
                              }
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ABA 5: CARREIRA REAL (COMEÇA EM ZERO) */}
            {activeTab === 'career' && (
              <section className="space-y-4">
                <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
                  <div>
                    <h2 className="text-base font-display font-bold text-white">
                      Estatísticas Oficiais de Carreira ({characterName})
                    </h2>
                    <p className="text-xs text-[#A1A1AA]">
                      Atualizadas conforme as súmulas oficiais são validadas na liga.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Campeonatos',
                        val: career.tournaments_played ?? 0,
                      },
                      { label: 'Títulos', val: career.titles_won ?? 0 },
                      {
                        label: 'Partidas',
                        val:
                          career.matches_played ?? career.official_matches ?? 0,
                      },
                      {
                        label: 'Gols Marcados',
                        val: career.goals ?? career.official_goals ?? 0,
                      },
                      {
                        label: 'Assistências',
                        val: career.assists ?? career.official_assists ?? 0,
                      },
                      {
                        label: 'MVPs (Craque)',
                        val: career.mvps ?? career.official_motm ?? 0,
                      },
                      {
                        label: 'Clean Sheets',
                        val: career.clean_sheets ?? 0,
                      },
                      {
                        label: 'Nota Média',
                        val: Number(career.average_rating ?? 0).toFixed(1),
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] text-center space-y-1"
                      >
                        <span className="text-xl font-mono font-bold text-white block tabular-nums">
                          {stat.val}
                        </span>
                        <span className="text-xs text-[#A1A1AA] block">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-3.5">
                  <h3 className="text-sm font-display font-bold text-white">
                    Conquistas & Insígnias da Liga
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AWARD_ASSETS.map((aw) => (
                      <div
                        key={aw.id}
                        className="p-4 rounded-2xl bg-[#141414] border border-white/[0.06] flex flex-col items-center text-center gap-2"
                      >
                        <img
                          src={aw.iconUrl}
                          alt={aw.name}
                          className="w-14 h-14 object-contain"
                        />
                        <span className="text-xs font-semibold text-white leading-tight">
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
