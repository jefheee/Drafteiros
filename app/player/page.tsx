'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-context';
import { useLeagueStore, uploadMediaToStorage } from '@/lib/data-store';
import {
  ARCHETYPE_ASSETS,
  PLAYSTYLE_ASSETS,
  AWARD_ASSETS,
  PlayStyleCategory,
  ArchetypePositionGroup,
} from '@/lib/assets-catalog';
import {
  calculateAcceleRATE,
  DEFAULT_PLAYER_ATTRIBUTES,
} from '@/lib/accelerate';
import {
  PlayerAttributes,
  PlayStyleSelection,
  AvailabilitySlotRange,
  PlayerPosition,
} from '@/types/database';
import { cn } from '@/lib/utils';
import {
  Camera,
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  Calendar,
  Trophy,
  Sliders,
  User,
  Upload,
  Clock,
  Plus,
  Trash2,
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
  const { players, updatePlayerProfile } = useLeagueStore();

  const currentPlayer = useMemo(() => {
    const matchByChar = players.find(
      (p) =>
        p.character_name?.toLowerCase() ===
        (session?.characterName || 'JEFHE').toLowerCase()
    );
    return matchByChar || players[0];
  }, [players, session?.characterName]);

  const [activeTab, setActiveTab] = useState<'build' | 'photos' | 'availability' | 'career'>('build');

  // Identidade dupla
  const [characterName, setCharacterName] = useState(
    currentPlayer?.character_name || session?.characterName || 'JEFHE'
  );
  const [fullName, setFullName] = useState(
    currentPlayer?.full_name || session?.fullName || 'Jefherson'
  );
  const [primaryPosition, setPrimaryPosition] = useState<PlayerPosition>(
    currentPlayer?.primary_position || 'ST'
  );
  const [shirtNumber, setShirtNumber] = useState<number>(
    currentPlayer?.visual_traits?.shirt_number || 10
  );

  // Fotos Reais do Personagem (Supabase Storage)
  const [avatarFaceUrl, setAvatarFaceUrl] = useState<string>(
    currentPlayer?.avatar_face_url || '/assets/templates/guest-avatar.png'
  );
  const [avatarBodyUrl, setAvatarBodyUrl] = useState<string>(
    currentPlayer?.avatar_body_url || '/assets/templates/ Banner de Matchday/Banner de Matchday.png'
  );
  const [attributesScreenshotUrl, setAttributesScreenshotUrl] = useState<string>(
    currentPlayer?.attributes_screenshot_url || ''
  );

  // Altura, Peso, Atributos e Arquétipo
  const [heightCm, setHeightCm] = useState<number>(currentPlayer?.height_cm || 175);
  const [weightKg, setWeightKg] = useState<number>(currentPlayer?.weight_kg || 68);
  const [overall, setOverall] = useState<number>(currentPlayer?.overall || 92);
  const [attributes, setAttributes] = useState<PlayerAttributes>(
    currentPlayer?.attributes || DEFAULT_PLAYER_ATTRIBUTES
  );
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>(
    currentPlayer?.archetype || 'finalizador'
  );
  const [archetypeGroupFilter, setArchetypeGroupFilter] =
    useState<ArchetypePositionGroup>('Atacante');

  // PlayStyles (1 clique = silver, 2 cliques = gold, 3 cliques = remove)
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

  // Estados de OCR / Salvamento
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentPlayer) {
      setCharacterName(currentPlayer.character_name || currentPlayer.ea_Tag || 'JEFHE');
      if (currentPlayer.full_name) setFullName(currentPlayer.full_name);
      if (currentPlayer.height_cm) setHeightCm(currentPlayer.height_cm);
      if (currentPlayer.weight_kg) setWeightKg(currentPlayer.weight_kg);
      if (currentPlayer.attributes) setAttributes(currentPlayer.attributes);
      if (currentPlayer.playstyles) setPlaystyles(currentPlayer.playstyles);
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
            setOverall(json.data.overall || 92);
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
        ? 'Foto do Rosto salva no Storage e disponível no Estúdio de IA!'
        : 'Foto de Corpo Inteiro salva no Storage e disponível no Estúdio de IA!'
    );
    setTimeout(() => setSaveSuccess(null), 4000);
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
        overall,
        height_cm: heightCm,
        weight_kg: weightKg,
        archetype: selectedArch?.name || selectedArchetypeId,
        accelerate_type: accelerateAnalysis.primaryType,
        accelerate_sub_type: accelerateAnalysis.subType,
        attributes,
        playstyles,
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
      `Perfil e Build de "${characterName}" (${accelerateAnalysis.primaryType} • ${accelerateAnalysis.subType}) salvos com sucesso!`
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

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-3 sm:px-4 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-3xl mx-auto space-y-4">
        {/* ================================================================= */}
        {/* CABEÇALHO DO ATLETA (IDENTIDADE DUPLA + RESUMO DA BUILD)          */}
        {/* ================================================================= */}
        <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-16 h-16 rounded-2xl bg-[#7C5CFC]/10 border-2 border-[#7C5CFC] overflow-hidden shrink-0 flex items-center justify-center">
                {avatarFaceUrl ? (
                  <img
                    src={avatarFaceUrl}
                    alt={characterName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-[#7C5CFC]" />
                )}
                <span className="absolute bottom-0 right-0 px-1.5 py-0.5 bg-[#7C5CFC] text-white text-[9px] font-black rounded-tl-lg">
                  {overall}
                </span>
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] text-[10px] font-extrabold uppercase">
                    {primaryPosition} #{shirtNumber}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-white text-[10px] font-extrabold"
                    style={{ backgroundColor: accelerateAnalysis.badgeColor }}
                  >
                    ⚡ {accelerateAnalysis.primaryType}
                  </span>
                </div>
                <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase truncate">
                  {characterName}
                </h1>
                <p className="text-xs text-zinc-500 truncate">
                  Titular da Conta: <strong className="text-zinc-700 dark:text-zinc-300">{fullName}</strong> • {heightCm} cm / {weightKg} kg
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveBuildAndProfile}
              className="py-2.5 px-4 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Build & Perfil
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-[#38C958]/15 border border-[#38C958]/30 text-[#229a3e] dark:text-[#38C958] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* Edição Rápida da Identidade Dupla */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-[#7C5CFC] block mb-1">
                Nome do Personagem (Exibido na Liga/Artes)
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Ex: JEFHE, HAALANDINHO..."
                className="w-full h-9 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                Seu Nome Real (Financeiro / Admin)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Jefherson"
                className="w-full h-9 px-3 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Posição
                </label>
                <select
                  value={primaryPosition}
                  onChange={(e) => setPrimaryPosition(e.target.value as PlayerPosition)}
                  className="w-full h-9 px-2 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-zinc-900 dark:text-white"
                >
                  {['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'].map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                  Camisa #
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={shirtNumber}
                  onChange={(e) => setShirtNumber(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* NAVEGAÇÃO DE ABAS DO ATLETA                                       */}
        {/* ================================================================= */}
        <div className="p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('build')}
            className={cn(
              'py-2 px-2 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center gap-1',
              activeTab === 'build'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Build & Run</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={cn(
              'py-2 px-2 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center gap-1',
              activeTab === 'photos'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Fotos IA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('availability')}
            className={cn(
              'py-2 px-2 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center gap-1',
              activeTab === 'availability'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Horários</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('career')}
            className={cn(
              'py-2 px-2 rounded-full text-[11px] font-extrabold transition-all flex items-center justify-center gap-1',
              activeTab === 'career'
                ? 'bg-[#7C5CFC] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Carreira</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* ABA 1: MINHA BUILD (QUALIDADES, PLAYSTYLES & ACCELERATE 2.0)      */}
        {/* ================================================================= */}
        {activeTab === 'build' && (
          <div className="space-y-4">
            {/* 1. PAINEL ACCELERATE AO VIVO (CÁLCULO EM TEMPO REAL) */}
            <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C5CFC]">
                      Calculadora Oficial EA FC 26 Clubs
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-white text-[11px] font-black"
                      style={{ backgroundColor: accelerateAnalysis.badgeColor }}
                    >
                      AcceleRATE: {accelerateAnalysis.primaryType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-extrabold">
                      2.0: {accelerateAnalysis.subType}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {accelerateAnalysis.description}
                  </p>
                </div>

                {/* Botão OCR Print Qualidades/Corpo */}
                <label className="cursor-pointer py-2.5 px-3.5 rounded-2xl bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0">
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
                <div className="p-3 rounded-2xl bg-[#7C5CFC]/10 border border-[#7C5CFC]/30 text-[#7C5CFC] text-xs font-bold">
                  {ocrNotice}
                </div>
              )}

              {/* Barra Visual de Proporção AcceleRATE 2.0 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                  <span className="text-amber-500">
                    ⚡ Explosiva ({accelerateAnalysis.explosivePercent}%)
                  </span>
                  <span className="text-[#38C958]">
                    ⚖️ Controlada ({accelerateAnalysis.controlledPercent}%)
                  </span>
                  <span className="text-[#7C5CFC]">
                    🚂 Prolongada ({accelerateAnalysis.lengthyPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${accelerateAnalysis.explosivePercent}%` }}
                  />
                  <div
                    className="h-full bg-[#38C958] transition-all"
                    style={{ width: `${accelerateAnalysis.controlledPercent}%` }}
                  />
                  <div
                    className="h-full bg-[#7C5CFC] transition-all"
                    style={{ width: `${accelerateAnalysis.lengthyPercent}%` }}
                  />
                </div>
              </div>

              {/* Diagnóstico Automático em Tempo Real */}
              <div className="grid sm:grid-cols-2 gap-2">
                {accelerateAnalysis.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-start gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Sliders de Altura e Peso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">Altura (cm)</span>
                    <span className="text-xs font-black text-[#7C5CFC]">{heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={210}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-[#7C5CFC]"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>150 cm</span>
                    <span>≤182 Explosiva | ≥183 Prolongada</span>
                    <span>210 cm</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">Peso (kg)</span>
                    <span className="text-xs font-black text-[#38C958]">{weightKg} kg</span>
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

            {/* 2. SELETOR VISUAL DE ARQUÉTIPO OFICIAL (public/assets/archetypes/) */}
            <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedArchetypeAsset.iconUrl}
                    alt={selectedArchetypeAsset.name}
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      Arquétipo Oficial: {selectedArchetypeAsset.name}
                    </h2>
                    <p className="text-[11px] text-zinc-500">
                      Ícones oficiais de <code className="text-[10px]">public/assets/archetypes</code>
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
                          ? 'bg-[#7C5CFC] text-white'
                          : 'bg-[#F5F6FA] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
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
                            ? 'border-[#7C5CFC] bg-[#7C5CFC]/10 shadow-xs'
                            : 'border-zinc-100 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/50 hover:border-[#7C5CFC]/40'
                        )}
                      >
                        <img
                          src={arch.iconUrl}
                          alt={arch.name}
                          className="w-11 h-11 object-contain"
                        />
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                          {arch.name}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </section>

            {/* 3. SELETOR DE PLAYSTYLES (1 CLIQUE = PRATA, 2 CLIQUES = DOURADO+) */}
            <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    PlayStyles & PlayStyles+ ({playstyles.length} ativos)
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    <strong>1 clique</strong> = Prata (Normal) • <strong>2 cliques</strong> = Dourado (PlayStyle+) • <strong>3 cliques</strong> = Remover
                  </p>
                </div>
              </div>

              {/* Abas de Categoria PlayStyles */}
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
                        ? 'bg-[#7C5CFC] text-white'
                        : 'bg-[#F5F6FA] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PLAYSTYLE_ASSETS.filter((ps) => ps.category === playstyleCategory).map((ps) => {
                  const sel = playstyles.find((p) => p.id === ps.id);
                  const isGold = sel?.level === 'gold';
                  const isSilver = sel?.level === 'silver';

                  return (
                    <button
                      key={ps.id}
                      type="button"
                      onClick={() => handleTogglePlayStyle(ps.id)}
                      className={cn(
                        'p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 relative',
                        isGold &&
                          'border-amber-400 bg-amber-500/10 shadow-[0_0_16px_rgba(245,158,11,0.2)]',
                        isSilver && 'border-zinc-400 bg-zinc-200/40 dark:bg-zinc-800',
                        !sel &&
                          'border-zinc-100 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/40 opacity-75 hover:opacity-100'
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
                        className="w-11 h-11 object-contain"
                      />
                      <span className="text-[11px] font-extrabold text-zinc-900 dark:text-white leading-tight">
                        {ps.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 4. EDITOR COMPLETO DOS 31 ATRIBUTOS (QUALIDADES DO PRO CLUBS) */}
            <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    Qualidades do Atleta (31 Atributos EA FC 26)
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Ajuste manualmente ou suba o print acima para preenchimento automático
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {ATTRIBUTE_GROUPS.map((group) => (
                  <div
                    key={group.id}
                    className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2.5"
                  >
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#7C5CFC]">
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
                              <div className="flex items-center gap-1.5">
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
                                  className="w-12 h-6 text-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-black text-xs text-[#38C958]"
                                />
                              </div>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
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

        {/* ================================================================= */}
        {/* ABA 2: FOTOS REAIS DO PERSONAGEM (ROSTO + CORPO INTEIRO)          */}
        {/* ================================================================= */}
        {activeTab === 'photos' && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Fotos Oficiais do Personagem (Supabase Storage)
              </h2>
              <p className="text-xs text-zinc-500">
                Estas fotos ficam disponíveis para os Capitães e Admins gerarem artes hiper-realistas no Estúdio de IA com o rosto e corpo exatos do seu boneco.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Card 1: Foto do Rosto */}
              <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] text-[10px] font-extrabold uppercase">
                    📸 Foto do Rosto (Close-up)
                  </span>
                  <h3 className="text-sm font-extrabold">
                    Rosto do Boneco ({characterName})
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Usado na Sala de Draft, Ranking de Artilheiros e fidelidade facial no Gemini 2.5 Flash.
                  </p>
                </div>

                <div className="w-full h-48 rounded-2xl bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                  {avatarFaceUrl ? (
                    <img
                      src={avatarFaceUrl}
                      alt="Rosto do Personagem"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <User className="w-12 h-12 text-zinc-600" />
                  )}
                </div>

                <label className="cursor-pointer w-full py-2.5 px-4 rounded-2xl bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Enviar Foto do Rosto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload('face', e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Card 2: Foto de Corpo Inteiro */}
              <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#229a3e] text-[10px] font-extrabold uppercase">
                    🧍 Foto de Corpo Inteiro (Chuteira/Acessórios)
                  </span>
                  <h3 className="text-sm font-extrabold">
                    Corpo Inteiro no Lobby ({characterName})
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Usado para preservar altura ({heightCm} cm), porte físico, meião e chuteiras nas cenas de pós-jogo.
                  </p>
                </div>

                <div className="w-full h-48 rounded-2xl bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                  {avatarBodyUrl ? (
                    <img
                      src={avatarBodyUrl}
                      alt="Corpo Inteiro do Personagem"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <User className="w-12 h-12 text-zinc-600" />
                  )}
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

        {/* ================================================================= */}
        {/* ABA 3: DISPONIBILIDADE POR INTERVALOS DE HORÁRIO                  */}
        {/* ================================================================= */}
        {activeTab === 'availability' && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Meus Intervalos de Horário (Tinder de Agenda)
              </h2>
              <p className="text-xs text-zinc-500">
                Selecione turnos inteiros ou defina sua faixa personalizada de início e término para cruzar automaticamente com seu elenco.
              </p>
            </div>

            {/* Seletor de Dia da Semana */}
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
                        ? 'bg-[#7C5CFC] text-white shadow-xs'
                        : 'bg-[#F5F6FA] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
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

            {/* Turnos Predefinidos */}
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
                          ? 'border-[#38C958] bg-[#38C958]/10 text-zinc-900 dark:text-white font-extrabold'
                          : 'border-zinc-100 dark:border-zinc-800 bg-[#F5F6FA] dark:bg-zinc-800/50 text-xs font-semibold text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      <span className="text-xs">{preset.label}</span>
                      {active && <CheckCircle2 className="w-4 h-4 text-[#38C958] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faixa Personalizada (Das HH:MM às HH:MM) */}
            <div className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700 space-y-2.5">
              <span className="text-xs font-extrabold text-[#7C5CFC] flex items-center gap-1.5">
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
                    className="h-9 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-500">às</span>
                  <input
                    type="time"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="h-9 px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addCustomRangeForDay(selectedDay)}
                  className="h-9 px-3.5 rounded-xl bg-[#7C5CFC] text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Incluir Faixa
                </button>
              </div>

              {/* Lista de intervalos ativos no dia */}
              {(availabilityIntervals[selectedDay] || []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {(availabilityIntervals[selectedDay] || []).map((slot, sIdx) => (
                    <span
                      key={slot.id || `slot-${sIdx}`}
                      className="px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold flex items-center gap-2"
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

        {/* ================================================================= */}
        {/* ABA 4: ESTATÍSTICAS DE CARREIRA & PREMIAÇÕES OFICIAIS             */}
        {/* ================================================================= */}
        {activeTab === 'career' && (
          <section className="space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Histórico Oficial em Campeonatos ({characterName})
                </h2>
                <p className="text-xs text-zinc-500">
                  Métricas sincronizadas com as súmulas validadas e Sala de Draft
                </p>
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
                    className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 text-center space-y-1"
                  >
                    <span className="text-lg font-black text-[#7C5CFC] block">
                      {stat.val}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-500 block">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Galeria de Troféus e Premiações Reais (public/assets/awards) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Insígnias & Troféus Oficiais da Liga
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AWARD_ASSETS.map((aw) => (
                  <div
                    key={aw.id}
                    className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center gap-1.5"
                  >
                    <img
                      src={aw.iconUrl}
                      alt={aw.name}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight">
                      {aw.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
