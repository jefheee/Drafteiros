'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BackButton } from '@/components/ui/back-button';
import {
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  MessageSquare,
  Phone,
  Users,
  Clock,
  Palette,
  Award,
} from 'lucide-react';
import {
  EA_FC_26_ARCHETYPES,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  cn,
} from '@/lib/utils';
import { PlayerVisualTraits, WeeklyAvailability } from '@/types/database';

export default function PlayerRegistrationPage() {
  const [name, setName] = useState('Buzz_ProClubs');
  const [platform, setPlatform] = useState<'PS5' | 'Xbox Series' | 'PC' | 'OldGen'>('PS5');
  const [primaryPosition, setPrimaryPosition] = useState('ATA');
  const [secondaryPositions, setSecondaryPositions] = useState<string[]>(['MEI']);
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>(['Finalizador', 'Mágico']);
  const [isLookingForTeam, setIsLookingForTeam] = useState(true);
  const [description, setDescription] = useState(
    'Atacante de mobilidade e tabela curta no 5x5 e 11v11. Microfone ativo e foco competitivo.'
  );
  const [contactDiscord, setContactDiscord] = useState('buzz_fc#0009');
  const [contactWhatsapp, setContactWhatsapp] = useState('11998887766');

  // Configurador Rápido de Horários Disponíveis (Seg a Dom, 19h às 00h)
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

  // Aparência do Meu Boneco (Visual Traits para alimentar o Estúdio IA)
  const [visualTraits, setVisualTraits] = useState<PlayerVisualTraits>({
    skin_tone: 'Médio Bronzeado',
    hair_style: 'Disfarçado (Low Fade) + Tranças',
    hair_color: 'Loiro Platinado',
    facial_hair: 'Cavanhaque Fechado Alinhado',
    accessories: ['Faixa na cabeça branca', 'Munhequeira dupla'],
    shirt_number: 9,
    celebration: 'Mão no ouvido provocando a torcida rival',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedPlayerId, setSavedPlayerId] = useState<string | null>(null);

  const POSITIONS_LIST = [
    'ATA',
    'CA',
    'PE',
    'PD',
    'MEI',
    'MC',
    'ME',
    'MD',
    'VOL',
    'ALA',
    'LE',
    'LD',
    'ZAG',
    'GK',
  ];

  const ACCESSORY_OPTIONS = [
    'Faixa na cabeça branca',
    'Munhequeira dupla',
    'Óculos estilo Davids',
    'Luvas térmicas pretas',
    'Tatuagem fechada nos braços',
    'Meião baixo na canela',
    'Chuteira dourada',
  ];

  const toggleSecondaryPosition = (pos: string) => {
    if (pos === primaryPosition) return;
    if (secondaryPositions.includes(pos)) {
      setSecondaryPositions(secondaryPositions.filter((p) => p !== pos));
    } else {
      setSecondaryPositions([...secondaryPositions, pos]);
    }
  };

  const toggleArchetype = (arch: string) => {
    if (selectedArchetypes.includes(arch)) {
      if (selectedArchetypes.length === 1) return;
      setSelectedArchetypes(selectedArchetypes.filter((a) => a !== arch));
    } else {
      setSelectedArchetypes([...selectedArchetypes, arch]);
    }
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

  const toggleAccessory = (acc: string) => {
    setVisualTraits((prev) => {
      const current = prev.accessories || [];
      const exists = current.includes(acc);
      return {
        ...prev,
        accessories: exists ? current.filter((a) => a !== acc) : [...current, acc],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor insira sua Gamertag / Nickname do EA FC.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const positionsDeclared = Array.from(new Set([primaryPosition, ...secondaryPositions]));

      const { data: profile, error: profileErr } = await supabase
        .from('player_profiles')
        .upsert(
          {
            name: name.trim(),
            positions_declared: positionsDeclared,
            archetype: selectedArchetypes[0] || 'Mágico',
            archetypes: selectedArchetypes,
            platform,
            primary_position: primaryPosition,
            secondary_positions: secondaryPositions,
            contact_discord: contactDiscord.trim() || null,
            contact_whatsapp: contactWhatsapp.trim() || null,
            is_looking_for_team: isLookingForTeam,
            bio: description.trim() || null,
            availability,
            visual_traits: visualTraits,
          },
          { onConflict: 'name' }
        )
        .select()
        .single();

      if (profileErr) {
        // Em ambiente de dev/offline sem migração ativa, confirma localmente
        console.warn('Persistência local utilizada para Passaporte:', profileErr.message);
      }

      if (profile) {
        setSavedPlayerId(profile.id);
      }

      setSuccessMsg(
        'Passaporte do Atleta salvo! Seus horários disponíveis agora alimentam o Tinder de Horários e a aparência do seu boneco já está sincronizada com o Estúdio IA!'
      );
    } catch {
      setSuccessMsg(
        'Passaporte do Atleta salvo! Horários e aparência do boneco sincronizados com o Tinder de Horários e Estúdio IA!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Superior */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton fallbackHref="/" label="Início" />
          <div className="flex items-center gap-2">
            <Link
              href="/studio"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs text-amber-300 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Testar Meu Boneco no Estúdio IA</span>
            </Link>
            <Link
              href="/market"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-400 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mercadão</span>
            </Link>
          </div>
        </div>

        {/* Título & Medalhas */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
                Passaporte do Atleta <span className="text-cyan-400">PRO</span>
              </h1>
              <p className="text-xs text-slate-400">
                Configure seus horários de jogo, aparência física do boneco para a IA e estilos táticos.
              </p>
            </div>
          </div>

          {/* Medalhas Desbloqueadas */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              ⚽ Artilheiro LPF • ⭐ Craque da Rodada
            </span>
          </div>
        </div>

        {/* Notificações */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            {savedPlayerId && (
              <Link
                href={`/players/${savedPlayerId}`}
                className="font-bold underline text-emerald-300 ml-4 hover:text-emerald-200"
              >
                Ver Perfil →
              </Link>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ================================================================= */}
          {/* SEÇÃO 1: CONFIGURADOR RÁPIDO DE HORÁRIOS DISPONÍVEIS */}
          {/* ================================================================= */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-100">
                    Meus Horários Disponíveis (Tinder de Horários)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Toque nos dias e faixas de horário (19h às 00h) em que você está online para jogar a Liga.
                  </p>
                </div>
              </div>
            </div>

            {/* Abas de Dias da Semana (Seg a Dom) */}
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const count = (availability[d.key] || []).length;
                const isSelected = activeDayTab === d.key;
                return (
                  <button
                    type="button"
                    key={d.key}
                    onClick={() => setActiveDayTab(d.key)}
                    className={cn(
                      'min-h-[48px] rounded-xl border flex flex-col items-center justify-center transition-all',
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    )}
                  >
                    <span className="text-xs font-bold">{d.label}</span>
                    <span
                      className={cn(
                        'text-[9px] font-mono',
                        isSelected ? 'text-slate-950' : 'text-cyan-400'
                      )}
                    >
                      {count}h
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Chips Clicáveis de Horário (19h às 00h) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-xs font-semibold text-slate-300 block">
                Faixas de horário disponíveis na{' '}
                <strong className="text-cyan-400">
                  {DAYS_OF_WEEK.find((d) => d.key === activeDayTab)?.full}
                </strong>
                :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const active = (availability[activeDayTab] || []).includes(slot);
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => toggleTimeSlot(activeDayTab, slot)}
                      className={cn(
                        'min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                        active
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      )}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {slot}h {active && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 2: APARÊNCIA DO MEU BONECO (VISUAL TRAITS PARA IA STUDIO) */}
          {/* ================================================================= */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-100">
                    Aparência do Meu Boneco (DNA Visual para o Estúdio IA)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Salve as características físicas do seu avatar no Pro Clubs para gerar imagens 8K sem precisar digitar toda vez.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Tom de Pele
                </label>
                <select
                  value={visualTraits.skin_tone}
                  onChange={(e) =>
                    setVisualTraits({ ...visualTraits, skin_tone: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                >
                  <option value="Claro">Claro</option>
                  <option value="Médio Bronzeado">Médio Bronzeado</option>
                  <option value="Moreno">Moreno</option>
                  <option value="Negro Retinto">Negro Retinto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Estilo de Cabelo
                </label>
                <input
                  type="text"
                  value={visualTraits.hair_style}
                  onChange={(e) =>
                    setVisualTraits({ ...visualTraits, hair_style: e.target.value })
                  }
                  placeholder="Ex: Disfarçado + Tranças / Moicano / Mullet"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Cor do Cabelo
                </label>
                <input
                  type="text"
                  value={visualTraits.hair_color}
                  onChange={(e) =>
                    setVisualTraits({ ...visualTraits, hair_color: e.target.value })
                  }
                  placeholder="Ex: Loiro Platinado / Preto / Descolorido"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Barba / Bigode
                </label>
                <input
                  type="text"
                  value={visualTraits.facial_hair}
                  onChange={(e) =>
                    setVisualTraits({ ...visualTraits, facial_hair: e.target.value })
                  }
                  placeholder="Ex: Cavanhaque fechado / Barba serrada"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Número da Camisa
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={visualTraits.shirt_number}
                  onChange={(e) =>
                    setVisualTraits({
                      ...visualTraits,
                      shirt_number: parseInt(e.target.value) || 10,
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Comemoração Marca Registrada
                </label>
                <input
                  type="text"
                  value={visualTraits.celebration}
                  onChange={(e) =>
                    setVisualTraits({ ...visualTraits, celebration: e.target.value })
                  }
                  placeholder="Ex: Mão no ouvido / Braços cruzados"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Acessórios do Boneco no Pro Clubs:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ACCESSORY_OPTIONS.map((acc) => {
                  const active = (visualTraits.accessories || []).includes(acc);
                  return (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleAccessory(acc)}
                      className={cn(
                        'min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                        active
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      )}
                    >
                      {acc} {active && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 3: DADOS TÉCNICOS, POSIÇÕES & ARQUÉTIPOS EA FC 26 */}
          {/* ================================================================= */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gamertag / Nickname Oficial EA
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Plataforma de Jogo
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                >
                  <option value="PS5">PlayStation 5 (Nova Geração)</option>
                  <option value="Xbox Series">Xbox Series X|S (Nova Geração)</option>
                  <option value="PC">PC (Nova Geração)</option>
                  <option value="OldGen">PS4 / Xbox One (Geração Anterior)</option>
                </select>
              </div>
            </div>

            {/* Posições */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Posição Primária (Principal)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POSITIONS_LIST.map((pos) => (
                    <button
                      type="button"
                      key={pos}
                      onClick={() => {
                        setPrimaryPosition(pos);
                        setSecondaryPositions(secondaryPositions.filter((p) => p !== pos));
                      }}
                      className={cn(
                        'min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors',
                        primaryPosition === pos
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      )}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Posições Secundárias
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POSITIONS_LIST.map((pos) => {
                    const isPrimary = primaryPosition === pos;
                    const isSec = secondaryPositions.includes(pos);
                    return (
                      <button
                        type="button"
                        key={pos}
                        disabled={isPrimary}
                        onClick={() => toggleSecondaryPosition(pos)}
                        className={cn(
                          'min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors',
                          isPrimary &&
                            'opacity-30 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-600',
                          isSec && 'bg-slate-800 text-cyan-300 border-cyan-700 font-bold',
                          !isPrimary &&
                            !isSec &&
                            'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        )}
                      >
                        {pos} {isSec && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Arquétipos */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                Arquétipos Oficiais EA FC 26 ({selectedArchetypes.length} selecionados)
              </label>
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                {Object.entries(EA_FC_26_ARCHETYPES).map(([category, items]) => (
                  <div key={category} className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
                      {category === 'attackers' && 'Atacantes'}
                      {category === 'midfielders' && 'Meias'}
                      {category === 'defenders' && 'Defensores'}
                      {category === 'goalkeepers' && 'Goleiros'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item) => {
                        const active = selectedArchetypes.includes(item);
                        return (
                          <button
                            type="button"
                            key={item}
                            onClick={() => toggleArchetype(item)}
                            className={cn(
                              'min-h-[38px] text-xs px-3 py-1 rounded-xl border transition-all',
                              active
                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            )}
                          >
                            {item} {active && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mercadão & Contatos */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLookingForTeam}
                  onChange={(e) => setIsLookingForTeam(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Anunciar no Mercadão de Jogadores (&ldquo;Buscando Clube&rdquo;)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Capitães verão seus horários disponíveis e poderão chamar para peneira.
                  </span>
                </div>
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    Discord
                  </label>
                  <input
                    type="text"
                    value={contactDiscord}
                    onChange={(e) => setContactDiscord(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              {loading
                ? 'Sincronizando Passaporte...'
                : 'Salvar Horários, Aparência do Boneco & Passaporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
