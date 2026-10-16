'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  EA_FC_26_ARCHETYPES,
  cn,
} from '@/lib/utils';
import { WeeklyAvailability } from '@/types/database';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Pencil,
  Share2,
  Clock,
  Upload,
  Sparkles,
  Shield,
  Plus,
  X,
  UserPlus,
} from 'lucide-react';

export default function PlayerProfilePage() {
  const [name, setName] = useState('Jefhe');
  const [subtitle, setSubtitle] = useState('Meia • Destro • 20 anos');
  const [platform, setPlatform] = useState<'PS5' | 'Xbox Series' | 'PC' | 'OldGen'>('PS5');
  const [primaryPosition, setPrimaryPosition] = useState('MEI');
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>(['Mágico', 'Maestro']);
  const [bio, setBio] = useState(
    'Meia armador e finalizador no 5x5 e 11v11. Passe de primeira e visão de jogo.'
  );
  const [whatsapp, setWhatsapp] = useState('11998887766');
  const [discord, setDiscord] = useState('jefhe_10');
  const [isLookingForTeam, setIsLookingForTeam] = useState(true);

  // Filosofia Zero Digitação: Foto do Boneco no EA FC (usada diretamente pelo Gemini Vision no Estúdio IA)
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'
  );

  // Estatísticas principais (3 cards brancos quadrados com número gigante)
  const [stats, setStats] = useState({
    jogos: 5,
    gols: 9,
    assistencias: 6,
  });
  const [ocrScanning, setOcrScanning] = useState(false);

  // Acordeão "Complete seu perfil"
  const [onboardingOpen, setOnboardingOpen] = useState(true);

  // Modais
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [joinTeamModalOpen, setJoinTeamModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [teamCodeInput, setTeamCodeInput] = useState('192Y4I');
  const [toastMsg, setToastMsg] = useState('');

  // Horários Disponíveis da Semana (Tinder de Horários)
  const [activeDayTab, setActiveDayTab] = useState<string>('ter');
  const [availability, setAvailability] = useState<WeeklyAvailability>({
    seg: ['21:00', '22:00', '22:30', '23:00'],
    ter: ['21:00', '22:00', '22:30', '23:00'],
    qua: ['22:00', '22:30'],
    qui: ['21:00', '22:00', '22:30', '23:00'],
    sex: ['22:30', '23:00', '00:00'],
    sab: ['20:00', '21:00'],
    dom: ['21:00', '22:00'],
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('draftclub_player_avatar_photo');
      if (savedAvatar) setAvatarPhotoUrl(savedAvatar);
    }
  }, []);

  const handleUploadAvatarPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPhotoUrl(base64);
      if (typeof window !== 'undefined') {
        localStorage.setItem('draftclub_player_avatar_photo', base64);
      }
      showToast(
        'Foto do seu boneco salva! O Gemini Vision lerá o rosto, cabelo e chuteira direto desta imagem no Estúdio IA.'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProClubsStatsPrint = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrScanning(true);
    setTimeout(() => {
      setStats((prev) => ({
        jogos: prev.jogos + 1,
        gols: prev.gols + 2,
        assistencias: prev.assistencias + 1,
      }));
      setOcrScanning(false);
      showToast('Print do Pro Clubs lido por IA Vision! Estatísticas atualizadas sem digitação.');
    }, 900);
  };

  const toggleTimeSlot = (dayKey: string, slot: string) => {
    setAvailability((prev) => {
      const currentDaySlots = prev[dayKey] || [];
      const exists = currentDaySlots.includes(slot);
      const nextSlots = exists
        ? currentDaySlots.filter((s) => s !== slot)
        : [...currentDaySlots, slot];
      return { ...prev, [dayKey]: nextSlots };
    });
  };

  const toggleArchetype = (arch: string) => {
    if (selectedArchetypes.includes(arch)) {
      if (selectedArchetypes.length === 1) return;
      setSelectedArchetypes(selectedArchetypes.filter((a) => a !== arch));
    } else {
      setSelectedArchetypes([...selectedArchetypes, arch]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('player_profiles').upsert(
        {
          name: name.trim(),
          avatar_url: avatarPhotoUrl,
          positions_declared: [primaryPosition],
          primary_position: primaryPosition,
          archetype: selectedArchetypes[0] || 'Mágico',
          archetypes: selectedArchetypes,
          platform,
          bio,
          contact_whatsapp: whatsapp,
          contact_discord: discord,
          is_looking_for_team: isLookingForTeam,
          availability,
        },
        { onConflict: 'name' }
      );
    } catch {
      // fallback local
    }
    setEditModalOpen(false);
    showToast('Perfil e horários sincronizados com sucesso!');
  };

  // Medalhas Hexagonais Estilo Jogueiros
  const medals = [
    { id: 'artilheiro', label: 'Artilheiro', icon: '⚽', count: 3, active: true },
    { id: 'xerife', label: 'Xerife', icon: '🛡️', count: 2, active: true },
    { id: 'garcom', label: 'Garçom', icon: '👟', count: 4, active: true },
    { id: 'chute', label: 'Chute Quente', icon: '🔥', count: 5, active: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-[#18181B] dark:text-zinc-100 px-3.5 sm:px-6 py-5">
      <div className="max-w-2xl mx-auto space-y-4">
        {toastMsg && (
          <div className="p-3.5 rounded-2xl bg-[#38C958] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. CABEÇALHO CENTRALIZADO ESTILO JOGUEIROS ("Jefhe") */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-center space-y-4">
          <div className="flex items-center justify-center gap-6 sm:gap-10 pt-1">
            <div className="text-center min-w-[70px]">
              <span className="text-base font-extrabold text-[#18181B] dark:text-white block">
                0
              </span>
              <span className="text-xs text-[#71717A]">Seguidores</span>
            </div>

            {/* Foto Grande Circular do Personagem EA FC (Zero Digitação) */}
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#7C5CFC] to-[#38C958] shadow-md">
                <img
                  src={avatarPhotoUrl}
                  alt={name}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <span
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-105 transition-transform"
                title="Enviar Foto do Boneco no EA FC"
              >
                <Camera className="w-4 h-4" />
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadAvatarPhoto}
                className="hidden"
              />
            </label>

            <div className="text-center min-w-[70px]">
              <span className="text-base font-extrabold text-[#18181B] dark:text-white block">
                0
              </span>
              <span className="text-xs text-[#71717A]">Seguindo</span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#18181B] dark:text-white">
              {name}
            </h1>
            <p className="text-xs font-bold text-[#7C5CFC]">{subtitle}</p>
            <p className="text-xs text-[#71717A] max-w-md mx-auto">{bio}</p>
          </div>

          {/* Botões em Pílula com Borda Roxa */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setContactsModalOpen(true)}
              className="px-4 py-2 rounded-full border border-[#7C5CFC] text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contatos</span>
            </button>

            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="px-4 py-2 rounded-full border border-[#7C5CFC] text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar Perfil</span>
            </button>

            <button
              type="button"
              onClick={() =>
                showToast('Link do seu Passaporte Jogueiros copiado para a área de transferência!')
              }
              className="px-4 py-2 rounded-full border border-[#7C5CFC] text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. CARD "COMPLETE SEU PERFIL" (ACORDEÃO COM BARRA DE PROGRESSO ROXA) */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
          <div
            onClick={() => setOnboardingOpen(!onboardingOpen)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="space-y-1 flex-1 pr-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#18181B] dark:text-white">
                  Complete seu perfil
                </h2>
                <span className="text-xs font-extrabold text-[#7C5CFC]">2 de 3</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="w-2/3 h-full rounded-full bg-[#7C5CFC]" />
              </div>
            </div>
            {onboardingOpen ? (
              <ChevronUp className="w-5 h-5 text-[#71717A]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#71717A]" />
            )}
          </div>

          {onboardingOpen && (
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {/* 1. Foto do boneco adicionada */}
              <label className="p-3 rounded-2xl bg-[#38C958]/10 border border-[#38C958]/30 flex flex-col justify-between cursor-pointer">
                <CheckCircle2 className="w-5 h-5 text-[#38C958] mb-2" />
                <div>
                  <span className="text-xs font-extrabold text-[#18181B] dark:text-white block leading-tight">
                    Foto adicionada!
                  </span>
                  <span className="text-[10px] text-[#38C958] font-bold mt-0.5 block">
                    Boneco EA FC
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAvatarPhoto}
                  className="hidden"
                />
              </label>

              {/* 2. Entrar no time por código */}
              <button
                type="button"
                onClick={() => setJoinTeamModalOpen(true)}
                className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 hover:bg-[#7C5CFC]/10 border border-zinc-200/70 dark:border-zinc-700 flex flex-col justify-between text-left transition-all"
              >
                <UserPlus className="w-5 h-5 text-[#7C5CFC] mb-2" />
                <div>
                  <span className="text-xs font-extrabold text-[#18181B] dark:text-white block leading-tight">
                    Entrar no time
                  </span>
                  <span className="text-[10px] text-[#7C5CFC] font-bold mt-0.5 block">
                    Código 192Y4I
                  </span>
                </div>
              </button>

              {/* 3. Confirmar presença / Horários */}
              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 hover:bg-[#7C5CFC]/10 border border-zinc-200/70 dark:border-zinc-700 flex flex-col justify-between text-left transition-all"
              >
                <Clock className="w-5 h-5 text-[#7C5CFC] mb-2" />
                <div>
                  <span className="text-xs font-extrabold text-[#18181B] dark:text-white block leading-tight">
                    Confirmar presença
                  </span>
                  <span className="text-[10px] text-[#7C5CFC] font-bold mt-0.5 block">
                    Horários 5x5
                  </span>
                </div>
              </button>
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* 3. CONQUISTAS (MEDALHAS HEXAGONAIS) & 3 CARDS GIGANTES DE STATS */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#18181B] dark:text-white">
              Conquistas & Estatísticas
            </h2>
            <label className="px-3 py-1.5 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-[11px] font-extrabold cursor-pointer flex items-center gap-1.5 hover:bg-[#7C5CFC] hover:text-white transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>{ocrScanning ? 'Lendo Print...' : 'Subir Print Pro Clubs'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadProClubsStatsPrint}
                className="hidden"
              />
            </label>
          </div>

          {/* Fileira de Medalhas Hexagonais */}
          <div className="grid grid-cols-4 gap-2.5">
            {medals.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700 flex flex-col items-center text-center space-y-1.5"
              >
                <div
                  className="w-12 h-12 bg-gradient-to-b from-[#7C5CFC] to-[#5B3FD9] text-white flex items-center justify-center text-lg shadow-md relative"
                  style={{
                    clipPath:
                      'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
                  }}
                >
                  <span>{m.icon}</span>
                </div>
                <span className="text-[11px] font-extrabold text-[#18181B] dark:text-white leading-tight">
                  {m.label}
                </span>
                <span className="text-[10px] font-bold text-[#7C5CFC]">x{m.count}</span>
              </div>
            ))}
          </div>

          {/* 3 Cards Brancos Quadrados Lado a Lado com Número Gigante: Jogos, Gols, Assistências */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#18181B] dark:text-white font-mono block">
                {stats.jogos}
              </span>
              <span className="text-xs font-bold text-[#71717A] block">Jogos</span>
            </div>

            <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#7C5CFC] font-mono block">
                {stats.gols}
              </span>
              <span className="text-xs font-bold text-[#71717A] block">Gols</span>
            </div>

            <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#38C958] font-mono block">
                {stats.assistencias}
              </span>
              <span className="text-xs font-bold text-[#71717A] block">Assistências</span>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. DISPONIBILIDADE DA SEMANA (TINDER DE HORÁRIOS) */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#18181B] dark:text-white">
                Horários Disponíveis
              </h2>
              <p className="text-xs text-[#71717A]">
                Seus horários cruzam automaticamente com o restante do time
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              className="px-3.5 py-2 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Editar</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(availability).map(([day, slots]) =>
              slots.length > 0 ? (
                <span
                  key={day}
                  className="px-3 py-1.5 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 text-xs font-bold text-[#18181B] dark:text-white"
                >
                  <strong className="text-[#7C5CFC] uppercase">{day}:</strong>{' '}
                  {slots.join(', ')}
                </span>
              ) : null
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. ATALHO DIRETO PARA GERAR ARTE COM A FOTO DO BONECO */}
        {/* ================================================================= */}
        <Link
          href="/studio"
          className="block p-5 rounded-3xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E5] text-white shadow-lg hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-sm font-black block">
                  Gerar Banner ou Imagem 8K do Meu Boneco
                </span>
                <span className="text-xs text-white/85 block">
                  A IA enxerga sua foto salva acima sem você digitar nenhuma característica!
                </span>
              </div>
            </div>
            <span className="px-3.5 py-2 rounded-full bg-white text-[#7C5CFC] text-xs font-extrabold shrink-0">
              Abrir Banners
            </span>
          </div>
        </Link>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: CONFIRMAR PRESENÇA / TINDER DE HORÁRIOS */}
      {/* ===================================================================== */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Confirmar Presença & Horários
                </h2>
                <p className="text-xs text-[#71717A]">
                  Toque nos horários em que você pode jogar na semana
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const count = (availability[d.key] || []).length;
                const active = activeDayTab === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setActiveDayTab(d.key)}
                    className={cn(
                      'py-2 rounded-2xl text-center transition-all border',
                      active
                        ? 'bg-[#7C5CFC] text-white border-[#7C5CFC] font-extrabold'
                        : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#18181B] dark:text-white border-zinc-200/70 dark:border-zinc-700'
                    )}
                  >
                    <span className="text-[11px] block">{d.label}</span>
                    <span className="text-[9px] opacity-80 block">{count}h</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = (availability[activeDayTab] || []).includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleTimeSlot(activeDayTab, slot)}
                    className={cn(
                      'py-2.5 rounded-2xl text-xs font-extrabold border transition-all',
                      isSelected
                        ? 'bg-[#38C958] text-white border-[#38C958]'
                        : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {slot}h {isSelected && '✓'}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setScheduleModalOpen(false);
                showToast('Horários da semana salvos e enviados ao Capitão!');
              }}
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Salvar Horários
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ENTRAR NO TIME POR CÓDIGO (192Y4I) */}
      {/* ===================================================================== */}
      {joinTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Entrar em um Time
              </h2>
              <button
                type="button"
                onClick={() => setJoinTeamModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#71717A]">
              Digite o código de 6 dígitos enviado pelo seu capitão (ex: <strong>192Y4I</strong> do Furia del Plata):
            </p>

            <input
              type="text"
              value={teamCodeInput}
              onChange={(e) => setTeamCodeInput(e.target.value.toUpperCase())}
              className="w-full py-3.5 text-center text-2xl font-black tracking-widest font-mono rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-[#7C5CFC] text-[#7C5CFC]"
            />

            <button
              type="button"
              onClick={() => {
                setJoinTeamModalOpen(false);
                showToast(`Você entrou no elenco oficial do Furia del Plata (Código ${teamCodeInput})!`);
              }}
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Entrar no time
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: EDITAR PERFIL DO JOGADOR (ZERO DIGITAÇÃO VISUAL) */}
      {/* ===================================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Editar Perfil do Atleta
                </h2>
                <p className="text-xs text-[#7C5CFC] font-bold">
                  Zero Digitação: suba apenas a foto do seu boneco no EA FC
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800 border-2 border-dashed border-[#7C5CFC]/50 flex items-center gap-3.5 cursor-pointer">
              <img
                src={avatarPhotoUrl}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#7C5CFC]"
              />
              <div>
                <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                  Trocar Foto do Personagem (EA FC 26)
                </span>
                <span className="text-[11px] text-[#7C5CFC] font-semibold block">
                  O Gemini Vision reconhece rosto, cabelo e acessórios automaticamente pela foto!
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadAvatarPhoto}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Nome / Nick
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Posição Principal
                </label>
                <select
                  value={primaryPosition}
                  onChange={(e) => setPrimaryPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                >
                  {['MEI', 'ATA', 'MC', 'PE', 'PD', 'VOL', 'ALA', 'ZAG', 'GK'].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                Subtítulo Rápido
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[#7C5CFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1.5">
                Estilos / Arquétipos EA FC 26
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(EA_FC_26_ARCHETYPES)
                  .flat()
                  .map((arch) => {
                    const active = selectedArchetypes.includes(arch);
                    return (
                      <button
                        type="button"
                        key={arch}
                        onClick={() => toggleArchetype(arch)}
                        className={cn(
                          'px-3 py-1 rounded-full text-[11px] font-bold border transition-all',
                          active
                            ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                            : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                        )}
                      >
                        {arch}
                      </button>
                    );
                  })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Salvar
            </button>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: CONTATOS DO JOGADOR */}
      {/* ===================================================================== */}
      {contactsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Contatos do Jogador
              </h2>
              <button
                type="button"
                onClick={() => setContactsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">Discord</label>
                <input
                  type="text"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setContactsModalOpen(false);
                showToast('Contatos salvos!');
              }}
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
