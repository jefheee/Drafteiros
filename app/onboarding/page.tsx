'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-context';
import { useLeagueStore, uploadMediaToStorage } from '@/lib/data-store';
import { Stepper } from '@/components/react-bits/stepper';
import { PlayerPosition } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  User,
  Shield,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Copy,
  Users,
  Sparkles,
  Loader2,
} from 'lucide-react';

const POSITIONS: { id: PlayerPosition; label: string }[] = [
  { id: 'ATA', label: 'ATA (Atacante)' },
  { id: 'MEI', label: 'MEI (Meia Ofensivo)' },
  { id: 'MC', label: 'MC (Meio-Campo)' },
  { id: 'VOL', label: 'VOL (Volante)' },
  { id: 'ZAG', label: 'ZAG (Zagueiro)' },
  { id: 'LD', label: 'LD (Lateral Direito)' },
  { id: 'LE', label: 'LE (Lateral Esquerdo)' },
  { id: 'GK', label: 'GK (Goleiro)' },
];

const PLATFORMS = [
  { id: 'PS5', label: 'PlayStation 5' },
  { id: 'XBOX', label: 'Xbox Series X|S' },
  { id: 'PC', label: 'PC (EA App / Steam)' },
] as const;

const GAME_MODALITIES = [
  { id: 'futebol', label: 'Futebol Virtual (EA FC / eFootball)' },
  { id: 'fps', label: 'FPS / Tiro (CS2, Valorant, R6)' },
  { id: 'moba', label: 'MOBA (LoL, Dota 2, Wild Rift)' },
  { id: 'basquete', label: 'Basquete (NBA 2K)' },
  { id: 'presencial', label: 'Presencial / Fut7 / Society' },
  { id: 'outro', label: 'Outro eSport' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { session, loading: authLoading, refreshSession } = useAuth();
  const { refreshFromSupabase } = useLeagueStore();

  const [step, setStep] = useState<number>(0);
  const [profileType, setProfileType] = useState<'player' | 'captain'>('player');

  // Dados do Jogador / Atleta
  const [gameModality, setGameModality] = useState<string>('futebol');
  const [fullName, setFullName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [eaTag, setEaTag] = useState('');
  const [platform, setPlatform] = useState<'PS5' | 'XBOX' | 'PC'>('PS5');
  const [primaryPosition, setPrimaryPosition] = useState<PlayerPosition>('ATA');
  const [secondaryPosition, setSecondaryPosition] = useState<PlayerPosition>('MEI');
  const [heightCm, setHeightCm] = useState<number>(178);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [preferredFoot, setPreferredFoot] = useState<'D' | 'E'>('D');
  const [archetype, setArchetype] = useState<string>('Finalizador');
  const [avatarFaceUrl, setAvatarFaceUrl] = useState<string>('');

  // Dados do Clube (Caso Dono de Time / Capitão)
  const [clubName, setClubName] = useState('');
  const [clubShortName, setClubShortName] = useState('');
  const [clubLogoUrl, setClubLogoUrl] = useState('');
  const [clubPrimaryColor, setClubPrimaryColor] = useState('#FFFFFF');
  const [generatedInviteCode, setGeneratedInviteCode] = useState('');

  // Vínculo com Time (Caso Jogador)
  const [joinMode, setJoinMode] = useState<'invite_code' | 'free_agent'>('free_agent');
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/login');
      return;
    }
    if (session) {
      if (!fullName && session.fullName) setFullName(session.fullName);
      if (!characterName && session.characterName) {
        setCharacterName(session.characterName);
      }
    }
  }, [session, authLoading, router, fullName, characterName]);

  const handleGenerateCode = (name: string, short: string) => {
    const prefix = (short || name || 'CLB')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
    const num = Math.floor(10 + Math.random() * 89);
    return `${prefix}${num}`;
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadMediaToStorage(
        'player-media',
        `onboarding/${session?.userId || 'player'}`,
        file
      );
      setAvatarFaceUrl(url);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadClubLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadMediaToStorage(
        'team-media',
        `onboarding/${session?.userId || 'team'}`,
        file
      );
      setClubLogoUrl(url);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!characterName.trim()) {
        setErrorMsg('Informe o nome do seu atleta ou personagem.');
        return;
      }
      if (!eaTag.trim()) {
        setEaTag(characterName.trim());
      }
    }
    if (step === 2 && profileType === 'captain') {
      if (!clubName.trim()) {
        setErrorMsg('Informe o nome oficial do seu clube.');
        return;
      }
      if (!generatedInviteCode) {
        setGeneratedInviteCode(handleGenerateCode(clubName, clubShortName));
      }
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleFinishOnboarding = async () => {
    if (!session) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      let targetTeamId: string | null = null;
      const cleanCharName = (characterName.trim() || session.fullName || 'ATLETA').toUpperCase();
      const cleanFullName = fullName.trim() || session.fullName || cleanCharName;
      const cleanEaTag = eaTag.trim() || cleanCharName;

      // 1. Se for Capitão, cria o clube na tabela teams
      if (profileType === 'captain') {
        const finalShort =
          (clubShortName.trim() || clubName.trim().substring(0, 3)).toUpperCase();
        const finalInviteCode =
          generatedInviteCode || handleGenerateCode(clubName, finalShort);

        // Garante que o profile exista antes da FK captain_id
        await supabase.from('profiles').upsert(
          {
            id: session.userId,
            email: session.email,
            full_name: cleanFullName,
            character_name: cleanCharName,
            roles: ['captain', 'player'],
            active_role_view: 'captain',
            onboarding_completed: true,
            avatar_url: avatarFaceUrl || null,
          },
          { onConflict: 'id' }
        );

        const { data: createdTeam, error: teamError } = await supabase
          .from('teams')
          .insert({
            name: clubName.trim(),
            short_name: finalShort,
            captain_id: session.userId,
            logo_url: clubLogoUrl || null,
            primary_color: clubPrimaryColor || '#FFFFFF',
            secondary_color: '#141414',
            invite_code: finalInviteCode,
            is_approved: false,
          })
          .select('*')
          .single();

        if (teamError) {
          setErrorMsg(`Não foi possível criar o clube: ${teamError.message}`);
          setSubmitting(false);
          return;
        }
        if (createdTeam) {
          targetTeamId = createdTeam.id;
        }
      } else {
        // 2. Se for Jogador e escolheu entrar com código de convite
        if (joinMode === 'invite_code') {
          if (!inviteCodeInput.trim()) {
            setErrorMsg(
              'Digite o código de convite do seu time ou escolha entrar como Agente Livre.'
            );
            setSubmitting(false);
            return;
          }
          const { data: foundTeam } = await supabase
            .from('teams')
            .select('id, name')
            .ilike('invite_code', inviteCodeInput.trim())
            .maybeSingle();

          if (!foundTeam) {
            setErrorMsg(
              'Código de time não encontrado. Confira com seu capitão ou continue como Agente Livre.'
            );
            setSubmitting(false);
            return;
          }
          targetTeamId = foundTeam.id;
        }

        await supabase.from('profiles').upsert(
          {
            id: session.userId,
            email: session.email,
            full_name: cleanFullName,
            character_name: cleanCharName,
            roles: ['player'],
            active_role_view: 'player',
            onboarding_completed: true,
            avatar_url: avatarFaceUrl || null,
          },
          { onConflict: 'id' }
        );
      }

      // 3. Cria ou atualiza a ficha do atleta em player_profiles
      const { data: existingPlayer } = await supabase
        .from('player_profiles')
        .select('id')
        .eq('user_id', session.userId)
        .maybeSingle();

      const playerPayload = {
        user_id: session.userId,
        name: cleanCharName,
        character_name: cleanCharName,
        ea_tag: cleanEaTag,
        full_name: cleanFullName,
        team_id: targetTeamId,
        is_free_agent: !targetTeamId,
        is_looking_for_team: !targetTeamId,
        platform,
        primary_position: primaryPosition,
        secondary_positions: [secondaryPosition],
        positions_declared: [primaryPosition, secondaryPosition],
        height_cm: heightCm,
        weight_kg: weightKg,
        preferred_foot: preferredFoot,
        archetype,
        archetypes: [archetype],
        overall: 82,
        avatar_face_url: avatarFaceUrl || null,
        avatar_url: avatarFaceUrl || null,
        career_stats: {
          tournaments_played: 0,
          titles_won: 0,
          matches_played: 0,
          goals: 0,
          assists: 0,
          mvps: 0,
          clean_sheets: 0,
          average_rating: 0,
        },
      };

      let savedPlayerId = existingPlayer?.id;

      if (existingPlayer?.id) {
        await supabase
          .from('player_profiles')
          .update(playerPayload)
          .eq('id', existingPlayer.id);
      } else {
        const { data: insertedPlayer, error: playerErr } = await supabase
          .from('player_profiles')
          .insert(playerPayload)
          .select('id')
          .single();

        if (playerErr) {
          setErrorMsg(`Erro ao salvar personagem: ${playerErr.message}`);
          setSubmitting(false);
          return;
        }
        savedPlayerId = insertedPlayer?.id;
      }

      // 4. Se entrou como Free Agent, registra também em free_agents
      if (!targetTeamId && savedPlayerId) {
        await supabase.from('free_agents').insert({
          player_id: savedPlayerId,
          platform,
          primary_position: primaryPosition,
          secondary_positions: [secondaryPosition],
          description: `Atleta ${cleanCharName} (${primaryPosition}) disponível no mercado.`,
          is_active: true,
        });
      }

      await Promise.all([refreshSession(), refreshFromSupabase()]);

      router.push(profileType === 'captain' ? '/captain' : '/player');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Erro ao concluir cadastro.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stepsMeta = [
    { id: 'role', title: 'Perfil', description: 'Atleta ou Gestor' },
    { id: 'character', title: 'Quem sou', description: 'Atleta & Modalidade' },
    {
      id: 'details',
      title: profileType === 'captain' ? 'Meu Clube' : 'Estilo',
      description: profileType === 'captain' ? 'Escudo & Sigla' : 'Foto & Arquétipo',
    },
    { id: 'team', title: 'Time', description: 'Vínculo ou Livre' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0D0D0F] text-[#F4F4F5] flex flex-col justify-between px-4 py-6">
      <div className="max-w-xl w-full mx-auto space-y-6 my-auto">
        {/* Topo com Logo e Stepper (React Bits) */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src="/branding/logo-transparent.png"
                alt="Drafteiros"
                width={28}
                height={28}
                className="rounded-lg object-contain"
                priority
              />
              <span className="font-display font-bold text-sm text-white">
                Configuração de Perfil
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Etapa {step + 1} de 4
            </span>
          </div>

          <Stepper
            steps={stepsMeta}
            currentStep={step}
            onStepClick={(idx) => {
              if (idx < step) setStep(idx);
            }}
          />
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl bg-[#1A1A1E] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* ETAPA 1: QUAL É O SEU PERFIL? */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                  Qual é o seu perfil?
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Escolha como você vai usar o Drafteiros. Você poderá alternar ou adicionar outro perfil depois nas configurações.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setProfileType('player')}
                  className={cn(
                    'p-5 rounded-3xl border text-left transition-all flex flex-col justify-between space-y-5',
                    profileType === 'player'
                      ? 'bg-[#141417] border-white shadow-lg'
                      : 'bg-[#141417]/40 border-white/[0.08] hover:border-white/25'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center border',
                        profileType === 'player'
                          ? 'bg-white text-black border-white'
                          : 'bg-[#141417] text-white border-white/[0.08]'
                      )}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    {profileType === 'player' && (
                      <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-display font-bold text-white">
                      Jogador / Atleta
                    </h2>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Crie seu atleta, tenha seu Card Pro oficial e dispute torneios ou entre na Sala de Draft.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileType('captain')}
                  className={cn(
                    'p-5 rounded-3xl border text-left transition-all flex flex-col justify-between space-y-5',
                    profileType === 'captain'
                      ? 'bg-[#141417] border-white shadow-lg'
                      : 'bg-[#141417]/40 border-white/[0.08] hover:border-white/25'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center border',
                        profileType === 'captain'
                          ? 'bg-white text-black border-white'
                          : 'bg-[#141417] text-white border-white/[0.08]'
                      )}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    {profileType === 'captain' && (
                      <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-display font-bold text-white">
                      Dono de Time / Capitão
                    </h2>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Cadastre seu clube, suba o escudo, convide seus jogadores por código e envie súmulas.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: QUEM SOU (DADOS DO ATLETA E MODALIDADE) */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                  Quem sou na competição
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Informe os dados do seu atleta para gerar seu Card Pro oficial.
                </p>
              </div>

              {/* Jogo / Modalidade */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  Jogo / Modalidade
                </label>
                <select
                  value={gameModality}
                  onChange={(e) => setGameModality(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#141417] border border-white/[0.08] text-sm font-semibold text-white focus:outline-none"
                >
                  {GAME_MODALITIES.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Nome / Apelido no Card *
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value.toUpperCase())}
                    placeholder="Ex: JEFHE"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#141417] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm font-semibold text-white uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Nick / ID no Jogo *
                  </label>
                  <input
                    type="text"
                    value={eaTag}
                    onChange={(e) => setEaTag(e.target.value)}
                    placeholder="Ex: Jefhe_Pro"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#141417] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              {/* Plataforma */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  Plataforma
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map((plat) => (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setPlatform(plat.id)}
                      className={cn(
                        'py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all',
                        platform === plat.id
                          ? 'bg-white text-black border-white'
                          : 'bg-[#141414] text-[#A1A1AA] border-white/[0.08] hover:text-white'
                      )}
                    >
                      {plat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posições */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Posição Principal
                  </label>
                  <select
                    value={primaryPosition}
                    onChange={(e) => setPrimaryPosition(e.target.value as PlayerPosition)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] text-sm font-semibold text-white"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Posição Secundária
                  </label>
                  <select
                    value={secondaryPosition}
                    onChange={(e) => setSecondaryPosition(e.target.value as PlayerPosition)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] text-sm font-semibold text-white"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Altura, Peso e Perna Boa */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    min={150}
                    max={215}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-2xl bg-[#141414] border border-white/[0.08] text-sm font-mono font-semibold text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={120}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-2xl bg-[#141414] border border-white/[0.08] text-sm font-mono font-semibold text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Perna Boa
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 h-11 p-1 rounded-2xl bg-[#141414] border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setPreferredFoot('D')}
                      className={cn(
                        'rounded-xl text-xs font-semibold transition-all',
                        preferredFoot === 'D'
                          ? 'bg-white text-black'
                          : 'text-[#A1A1AA] hover:text-white'
                      )}
                    >
                      Dir. (D)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredFoot('E')}
                      className={cn(
                        'rounded-xl text-xs font-semibold transition-all',
                        preferredFoot === 'E'
                          ? 'bg-white text-black'
                          : 'text-[#A1A1AA] hover:text-white'
                      )}
                    >
                      Esq. (E)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: DADOS DO CLUBE (SE CAPITÃO) OU FOTO & ESTILO (SE JOGADOR) */}
          {step === 2 && (
            <div className="space-y-5">
              {profileType === 'captain' ? (
                <>
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                      Cadastre o seu Clube
                    </h1>
                    <p className="text-xs sm:text-sm text-[#A1A1AA]">
                      Defina o nome, sigla e escudo oficial do seu time para a tabela e banners pós-jogo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300 block">
                        Nome Oficial do Time *
                      </label>
                      <input
                        type="text"
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                        placeholder="Ex: Real Palhoça FC"
                        className="w-full h-11 px-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm font-semibold text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300 block">
                        Sigla (3 letras)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={clubShortName}
                        onChange={(e) => setClubShortName(e.target.value.toUpperCase())}
                        placeholder="Ex: RPF"
                        className="w-full h-11 px-3.5 rounded-2xl bg-[#141414] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm font-mono font-bold text-white uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                    <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-black border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                        {clubLogoUrl ? (
                          <img
                            src={clubLogoUrl}
                            alt="Escudo"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Shield className="w-6 h-6 text-[#A1A1AA]" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <span className="text-xs font-semibold text-white block">
                          Escudo do Time (Opcional)
                        </span>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? 'Enviando...' : 'Subir Escudo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadClubLogo}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] space-y-2">
                      <label className="text-xs font-semibold text-white block">
                        Cor Principal do Uniforme
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={clubPrimaryColor}
                          onChange={(e) => setClubPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-[#A1A1AA]">
                          {clubPrimaryColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                      Estilo de Jogo & Foto
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Escolha seu arquétipo principal e adicione uma foto opcional para sua Carta Pro.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-300 block">
                      Arquétipo em Campo
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'Finalizador',
                        'Maestro',
                        'Velocista',
                        'Xerife',
                        'Motorzinho',
                        'Paredão',
                      ].map((arch) => (
                        <button
                          key={arch}
                          type="button"
                          onClick={() => setArchetype(arch)}
                          className={cn(
                            'py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all',
                            archetype === arch
                              ? 'bg-white text-black border-white'
                              : 'bg-[#141414] text-[#A1A1AA] border-white/[0.08] hover:text-white'
                          )}
                        >
                          {arch}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-black border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                      {avatarFaceUrl ? (
                        <img
                          src={avatarFaceUrl}
                          alt="Foto"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-[#A1A1AA]" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-white block">
                        Foto do Atleta ou Perfil (Opcional)
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Você poderá atualizar ou ajustar os atributos na aba do seu Card Pro.
                      </p>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Enviando...' : 'Escolher Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAvatar}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ETAPA 4: VÍNCULO COM TIME */}
          {step === 3 && (
            <div className="space-y-6">
              {profileType === 'captain' ? (
                <>
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center mx-auto text-[#10B981] mb-2">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                      Tudo pronto para criar o {clubName || 'seu clube'}!
                    </h1>
                    <p className="text-xs sm:text-sm text-[#A1A1AA]">
                      Compartilhe o código de convite abaixo com os jogadores do seu elenco para eles entrarem direto no time.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] text-[#A1A1AA] block">
                        Código de Convite do Elenco
                      </span>
                      <span className="text-xl font-mono font-bold tracking-wider text-white">
                        {generatedInviteCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedInviteCode);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2500);
                      }}
                      className="h-10 px-4 rounded-xl bg-white text-black text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-zinc-200 transition-colors"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Código</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                      Juntar-se a um time
                    </h1>
                    <p className="text-xs sm:text-sm text-[#A1A1AA]">
                      Você tem o código de convite de um clube ou prefere entrar como Agente Livre para o Draft?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setJoinMode('free_agent')}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all space-y-2',
                        joinMode === 'free_agent'
                          ? 'bg-[#141414] border-white'
                          : 'bg-[#0A0A0A] border-white/[0.08] hover:border-white/20'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Users className="w-5 h-5 text-white" />
                        {joinMode === 'free_agent' && (
                          <Check className="w-4 h-4 text-[#10B981]" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">
                          Entrar sem time (Free Agent)
                        </span>
                        <span className="text-xs text-[#A1A1AA]">
                          Ficar visível na Busca e disponível para a Sala de Draft.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJoinMode('invite_code')}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all space-y-2',
                        joinMode === 'invite_code'
                          ? 'bg-[#141414] border-white'
                          : 'bg-[#0A0A0A] border-white/[0.08] hover:border-white/20'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Shield className="w-5 h-5 text-white" />
                        {joinMode === 'invite_code' && (
                          <Check className="w-4 h-4 text-[#10B981]" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">
                          Informar código do time
                        </span>
                        <span className="text-xs text-[#A1A1AA]">
                          Entrar direto no elenco enviado pelo meu capitão.
                        </span>
                      </div>
                    </button>
                  </div>

                  {joinMode === 'invite_code' && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-medium text-zinc-300 block">
                        Código de Convite do Clube
                      </label>
                      <input
                        type="text"
                        value={inviteCodeInput}
                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                        placeholder="Ex: REAL42"
                        className="w-full h-11 px-4 rounded-2xl bg-[#141414] border border-white/[0.08] focus:border-white/30 focus:outline-none text-sm font-mono font-bold text-white uppercase"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Botões de Navegação do Onboarding */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setStep((prev) => prev - 1);
                }}
                className="h-11 px-5 rounded-2xl bg-[#141414] hover:bg-zinc-800 border border-white/[0.08] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="h-11 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-md"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinishOnboarding}
                className="h-11 px-6 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-60 text-black text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-md"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span>Concluir e Abrir Minha Conta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
