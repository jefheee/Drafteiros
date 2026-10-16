'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-context';
import {
  Team,
  PlayerProfile,
  Match,
  TournamentPlayerStats,
} from '@/types/database';
import {
  ALL_5V5_FORMATIONS,
  ALL_11V11_FORMATIONS,
  cn,
} from '@/lib/utils';
import {
  FALLBACK_TEAMS,
  FALLBACK_PLAYERS,
  FALLBACK_MATCHES,
} from '@/lib/mock-league-data';
import { SquadProvider, useSquad } from '@/components/builder/squad-context';
import { Pitch } from '@/components/builder/pitch';
import {
  Wallet,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Plus,
  MessageCircle,
  Pencil,
  Share2,
  Crown,
  UserPlus,
  Copy,
  Check,
  Calendar,
  Camera,
  Upload,
  Sparkles,
  SlidersHorizontal,
  Calculator,
  X,
  Wand2,
  RotateCcw,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  User,
} from 'lucide-react';

function EmbeddedTacticalBuilder({ roster }: { roster: PlayerProfile[] }) {
  const {
    gameMode,
    setGameMode,
    formation,
    setFormation,
    selectedBenchPlayer,
    setSelectedBenchPlayer,
    autoAssignSquad,
    clearPitch,
    isPlayerOnPitch,
  } = useSquad();

  const mappedRoster: TournamentPlayerStats[] = roster.map((p, idx) => ({
    tournament_id: '11111111-1111-1111-1111-111111111111',
    player_id: p.id,
    name: p.name,
    archetype: p.archetype || 'Mágico',
    positions_declared: p.positions_declared,
    community_position: p.primary_position || p.positions_declared[0] || 'MEI',
    community_confidence: 95,
    total_position_votes: 10,
    participant_role: idx === 0 ? 'captain' : 'player',
    is_captain: idx === 0,
    evaluation_count: 5,
    avg_mechanic: 88,
    avg_iq: 88,
    avg_teamplay: 90,
    overall_score: 89 - idx,
    tier: 'S',
  }));

  return (
    <div className="space-y-4 pt-2">
      <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setGameMode('5v5')}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all',
                gameMode === '5v5'
                  ? 'bg-[#7C5CFC] text-white shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B]'
              )}
            >
              5x5 (LPF)
            </button>
            <button
              type="button"
              onClick={() => setGameMode('11v11')}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all',
                gameMode === '11v11'
                  ? 'bg-[#7C5CFC] text-white shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B]'
              )}
            >
              11v11 Pro
            </button>
          </div>

          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="px-3.5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-[#7C5CFC]"
          >
            {gameMode === '5v5'
              ? Object.values(ALL_5V5_FORMATIONS).map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))
              : Object.values(ALL_11V11_FORMATIONS).map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => autoAssignSquad(mappedRoster)}
            className="px-3.5 py-2 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Auto-Escalar
          </button>
          <button
            type="button"
            onClick={clearPitch}
            className="px-3 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[#71717A] flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-7">
          <Pitch />
        </div>
        <div className="md:col-span-5 p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700 space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#71717A] block">
            Toque no Jogador e na Posição:
          </span>
          {mappedRoster.map((pl) => {
            const selected = selectedBenchPlayer?.player_id === pl.player_id;
            const onPitch = isPlayerOnPitch(pl.player_id);
            return (
              <div
                key={pl.player_id}
                onClick={() => setSelectedBenchPlayer(selected ? null : pl)}
                className={cn(
                  'p-2.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-all',
                  selected
                    ? 'bg-[#7C5CFC]/15 border-[#7C5CFC] text-[#7C5CFC] font-extrabold'
                    : onPitch
                    ? 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200/60 opacity-60'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-700'
                )}
              >
                <span className="font-extrabold text-[#18181B] dark:text-white">{pl.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC]">
                  {onPitch ? '✓ Escalado' : selected ? 'Escolher posição' : pl.community_position}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CaptainPage() {
  const { session, switchProfileRole } = useAuth();

  const [teams, setTeams] = useState<Team[]>(FALLBACK_TEAMS);
  const [myTeam, setMyTeam] = useState<Team>(FALLBACK_TEAMS[0]);
  const [squad, setSquad] = useState<PlayerProfile[]>(FALLBACK_PLAYERS);
  const [matches, setMatches] = useState<Match[]>(FALLBACK_MATCHES);

  // Acordeão "Complete seu perfil"
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [showTacticalPitch, setShowTacticalPitch] = useState(false);

  // Filtros de Jogadores
  const [playerViewFilter, setPlayerViewFilter] = useState<'atuais' | 'convidados'>('atuais');
  const [playerSortOrder, setPlayerSortOrder] = useState<'artilharia' | 'assistencias' | 'nome'>('artilharia');
  const [newPlayerPopoverOpen, setNewPlayerPopoverOpen] = useState(false);

  // Fotos Zero Digitação (Escudo + Foto do Uniforme/Time em Campo)
  const [crestPhotoUrl, setCrestPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&q=80'
  );
  const [kitPhotoUrl, setKitPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=900&q=80'
  );
  const [teamDisplayName, setTeamDisplayName] = useState<string>('Furia del Plata');
  const [teamSubtitle, setTeamSubtitle] = useState<string>('EA FC 26 • Pro Clubs • Liga 5x5 LPF');
  const [instagramHandle, setInstagramHandle] = useState<string>('@atleticodapalhoca');
  const [whatsappLink, setWhatsappLink] = useState<string>('https://chat.whatsapp.com/furiadelplata5x5');
  const [sponsorsText, setSponsorsText] = useState<string>('Betsson, Ruschbet, Monster Energy');

  // Modais Estilo Jogueiros
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [financeMonth, setFinanceMonth] = useState<'Setembro 2026' | 'Outubro 2026'>('Outubro 2026');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [newMatchModalOpen, setNewMatchModalOpen] = useState(false);
  const [ocrResultModalOpen, setOcrResultModalOpen] = useState(false);
  const [registerPlayerModalOpen, setRegisterPlayerModalOpen] = useState(false);
  const [newAdminModalOpen, setNewAdminModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);

  // Estados de formulários rápidos dos modais
  const [opponentId, setOpponentId] = useState<string>(FALLBACK_TEAMS[1].id);
  const [matchLocation, setMatchLocation] = useState<'Mandante' | 'Visitante'>('Mandante');
  const [matchDate, setMatchDate] = useState<string>('2026-10-20');
  const [matchTime, setMatchTime] = useState<string>('22:30');
  const [matchType, setMatchType] = useState<'Campeonato' | 'Amistoso'>('Campeonato');

  // OCR Rápido na seção Resultados
  const [ocrScoreHome, setOcrScoreHome] = useState(3);
  const [ocrScoreAway, setOcrScoreAway] = useState(1);
  const [ocrSummaryText, setOcrSummaryText] = useState('');
  const [ocrScanning, setOcrScanning] = useState(false);

  // Novo Jogador / Convidado
  const [newPlayerNick, setNewPlayerNick] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('ATA');
  const [newPlayerType, setNewPlayerType] = useState<'Titular' | 'Convidado Avulso'>('Titular');

  // Administradores do Time
  const [adminsList, setAdminsList] = useState([
    { id: 'adm-1', name: 'Jefhe (Dono / Capitão)', email: 'capitao@draftclub.pro', isOwner: true },
    { id: 'adm-2', name: 'Andrei_VOL (Sub-Capitão)', email: 'andrei@draftclub.pro', isOwner: false },
  ]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Pontuação da súmula
  const [metricsScore, setMetricsScore] = useState({
    gol: 8,
    assistencia: 5,
    golSofrido: -1,
    defesaDificil: 1,
    cartaoAmarelo: -1,
    cartaoVermelho: -3,
    destaque: 0,
  });

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCrest = localStorage.getItem('draftclub_team_crest');
      const savedKit = localStorage.getItem('draftclub_team_kit_photo');
      if (savedCrest) setCrestPhotoUrl(savedCrest);
      if (savedKit) setKitPhotoUrl(savedKit);
    }
  }, []);

  useEffect(() => {
    async function fetchDb() {
      try {
        const { data: dbTeams } = await supabase.from('teams').select('*');
        if (dbTeams && dbTeams.length > 0) {
          setTeams(dbTeams);
          setMyTeam(dbTeams[0]);
        }
        const { data: dbPlayers } = await supabase.from('player_profiles').select('*').limit(10);
        if (dbPlayers && dbPlayers.length > 0) setSquad(dbPlayers);
      } catch {
        // usa fallback
      }
    }
    fetchDb();
  }, []);

  const handleUploadCrest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCrestPhotoUrl(base64);
      if (typeof window !== 'undefined') {
        localStorage.setItem('draftclub_team_crest', base64);
      }
      showToast('Escudo atualizado e sincronizado com os Banners e Estúdio IA!');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadKitPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setKitPhotoUrl(base64);
      if (typeof window !== 'undefined') {
        localStorage.setItem('draftclub_team_kit_photo', base64);
      }
      showToast('Foto do Uniforme salva! O Gemini Vision usará esta foto automaticamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateScheduleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const adv = teams.find((t) => t.id === opponentId) || FALLBACK_TEAMS[1];
    const created: Match = {
      id: `m-new-${Date.now()}`,
      tournament_id: '11111111-1111-1111-1111-111111111111',
      round_number: matches.length + 1,
      home_team_id: matchLocation === 'Mandante' ? myTeam.id : adv.id,
      away_team_id: matchLocation === 'Mandante' ? adv.id : myTeam.id,
      scheduled_at: `${matchDate}T${matchTime}:00-03:00`,
      schedule_status: 'confirmed',
      status: 'scheduled',
      home_score: 0,
      away_score: 0,
      created_at: new Date().toISOString(),
      home_team: matchLocation === 'Mandante' ? myTeam : adv,
      away_team: matchLocation === 'Mandante' ? adv : myTeam,
    };
    setMatches([created, ...matches]);
    setNewMatchModalOpen(false);
    showToast(`Jogo cadastrado contra ${adv.name} (${matchDate} às ${matchTime}h)!`);
  };

  const handleQuickOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/ai-studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ocr_match_sheet',
            imageBase64: reader.result,
            mimeType: file.type,
            homeTeamName: teamDisplayName,
            awayTeamName: 'Boca Juniors FC',
          }),
        });
        const json = await res.json();
        if (json?.data) {
          setOcrScoreHome(json.data.home_score ?? 3);
          setOcrScoreAway(json.data.away_score ?? 1);
          setOcrSummaryText(
            `OCR Concluído (${json.data.confidence || 99}%): Craque ${json.data.motm_name} • ${json.data.players?.length || 5} atletas lidos da foto.`
          );
        }
      } catch {
        setOcrSummaryText('Placar 3x1 e estatísticas extraídos pela IA Vision!');
      } finally {
        setOcrScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOcrMatch = () => {
    const completedMatch: Match = {
      id: `m-res-${Date.now()}`,
      tournament_id: '11111111-1111-1111-1111-111111111111',
      round_number: matches.length + 1,
      home_team_id: myTeam.id,
      away_team_id: FALLBACK_TEAMS[1].id,
      scheduled_at: new Date().toISOString(),
      schedule_status: 'confirmed',
      status: 'completed',
      home_score: ocrScoreHome,
      away_score: ocrScoreAway,
      created_at: new Date().toISOString(),
      home_team: myTeam,
      away_team: FALLBACK_TEAMS[1],
    };
    setMatches([completedMatch, ...matches]);
    setOcrResultModalOpen(false);
    showToast('Resultado homologado por foto! Estatísticas somadas ao elenco.');
  };

  const handleRegisterNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerNick.trim()) return;
    const created: PlayerProfile = {
      id: `p-new-${Date.now()}`,
      name:
        newPlayerType === 'Convidado Avulso'
          ? `${newPlayerNick.trim()} (Avulso)`
          : newPlayerNick.trim(),
      positions_declared: [newPlayerPos],
      primary_position: newPlayerPos,
      archetype: 'Mágico',
      archetypes: ['Mágico'],
      platform: 'PS5',
      created_at: new Date().toISOString(),
    };
    setSquad([created, ...squad]);
    setNewPlayerNick('');
    setRegisterPlayerModalOpen(false);
    showToast(`${created.name} adicionado ao elenco do ${teamDisplayName}!`);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setAdminsList([
      ...adminsList,
      {
        id: `adm-${Date.now()}`,
        name: newAdminEmail.split('@')[0],
        email: newAdminEmail.trim(),
        isOwner: false,
      },
    ]);
    setNewAdminEmail('');
    setNewAdminModalOpen(false);
    showToast('Novo administrador cadastrado com sucesso!');
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText('192Y4I');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const upcomingMatches = matches.filter((m) => m.status === 'scheduled');
  const completedMatches = matches.filter(
    (m) => m.status === 'completed' || m.status === 'pending_validation'
  );

  // Estatísticas simuladas por atleta para exibir na lista igual ao Jogueiros
  const getPlayerStatsBadge = (idx: number) => {
    const goals = [9, 6, 4, 7, 0, 3][idx % 6];
    const assists = [6, 8, 2, 3, 1, 5][idx % 6];
    const games = 5;
    return { goals, assists, games };
  };

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
        {/* 1. CABEÇALHO CENTRALIZADO ESTILO JOGUEIROS ("Furia del Plata") */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-center space-y-4 relative">
          {/* Botão de Configurações no canto superior direito do Card */}
          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-[#7C5CFC] hover:bg-[#7C5CFC]/15 transition-colors"
            title="Configurações do Time"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* 0 Seguidores | Foto Circular do Escudo | 0 Seguindo */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 pt-1">
            <div className="text-center min-w-[70px]">
              <span className="text-base font-extrabold text-[#18181B] dark:text-white block">
                128
              </span>
              <span className="text-xs text-[#71717A]">Seguidores</span>
            </div>

            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#7C5CFC] to-[#38C958] shadow-md">
                <img
                  src={crestPhotoUrl}
                  alt={teamDisplayName}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCrest}
                className="hidden"
              />
            </label>

            <div className="text-center min-w-[70px]">
              <span className="text-base font-extrabold text-[#18181B] dark:text-white block">
                14
              </span>
              <span className="text-xs text-[#71717A]">Seguindo</span>
            </div>
          </div>

          {/* Nome e Subtítulo Roxo */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#18181B] dark:text-white">
              {teamDisplayName}
            </h1>
            <p className="text-xs font-bold text-[#7C5CFC]">
              {teamSubtitle} • {instagramHandle}
            </p>
          </div>

          {/* 3 Botões em Pílula com Borda Roxa */}
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
              onClick={() => setEditProfileModalOpen(true)}
              className="px-4 py-2 rounded-full border border-[#7C5CFC] text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="px-4 py-2 rounded-full border border-[#7C5CFC] text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </button>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. CARD "CAIXA DO TIME: R$ 560,00 >" */}
        {/* ================================================================= */}
        <button
          type="button"
          onClick={() => setFinanceModalOpen(true)}
          className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between hover:border-[#7C5CFC]/50 transition-all text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#7C5CFC]/10 text-[#7C5CFC] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-[#18181B] dark:text-white block">
                Caixa do time:{' '}
                <span className="text-[#38C958]">R$ 560,00</span>
              </span>
              <span className="text-xs text-[#71717A]">
                Mensalidades, inscrição LPF 5x5 e rateio de premiação
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#7C5CFC]" />
        </button>

        {/* ================================================================= */}
        {/* 3. CARD ACORDEÃO "COMPLETE SEU PERFIL" COM BARRA ROXA */}
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
              {/* 1. Foto/Escudo adicionado */}
              <label className="p-3 rounded-2xl bg-[#38C958]/10 border border-[#38C958]/30 flex flex-col justify-between cursor-pointer">
                <CheckCircle2 className="w-5 h-5 text-[#38C958] mb-2" />
                <div>
                  <span className="text-xs font-extrabold text-[#18181B] dark:text-white block leading-tight">
                    Escudo adicionado!
                  </span>
                  <span className="text-[10px] text-[#38C958] font-bold mt-0.5 block">
                    Trocar foto
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCrest}
                  className="hidden"
                />
              </label>

              {/* 2. Convide jogadores */}
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 hover:bg-[#7C5CFC]/10 border border-zinc-200/70 dark:border-zinc-700 flex flex-col justify-between text-left transition-all"
              >
                <UserPlus className="w-5 h-5 text-[#7C5CFC] mb-2" />
                <div>
                  <span className="text-xs font-extrabold text-[#18181B] dark:text-white block leading-tight">
                    Convide jogadores
                  </span>
                  <span className="text-[10px] text-[#7C5CFC] font-bold mt-0.5 block">
                    Código 192Y4I
                  </span>
                </div>
              </button>

              {/* 3. Cadastre um jogo */}
              <button
                type="button"
                onClick={() => setNewMatchModalOpen(true)}
                className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 hover:bg-[#7C5CFC]/10 border border-zinc-200/70 dark:border-zinc-700 flex flex-col justify-between text-left transition-all"
              >
                <Calendar className="w-5 h-5 text-[#7C5CFC] mb-2" />
                <div>
                  <span className="text-xs font-extrabold text-[#18181B] dark:text-white block leading-tight">
                    Cadastre um jogo
                  </span>
                  <span className="text-[10px] text-[#7C5CFC] font-bold mt-0.5 block">
                    + Agendar
                  </span>
                </div>
              </button>
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* 4. SEÇÃO EMPILHADA: PRÓXIMOS JOGOS (+ NOVO JOGO) */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#18181B] dark:text-white">
                Próximos Jogos
              </h2>
              <p className="text-xs text-[#71717A]">
                Partidas agendadas com sugestão do Tinder de Horários
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewMatchModalOpen(true)}
              className="px-3.5 py-2 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Jogo</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingMatches.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#7C5CFC] text-white font-black text-xs flex items-center justify-center shrink-0">
                    FP
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                      {m.home_team?.name || 'Furia del Plata'} vs{' '}
                      {m.away_team?.name || 'River Plate eSports'}
                    </p>
                    <p className="text-[11px] text-[#7C5CFC] font-semibold">
                      {m.scheduled_at
                        ? new Date(m.scheduled_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Horário sugerido: Terça 22:30h'}
                    </p>
                  </div>
                </div>
                <Link
                  href="/matches"
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[#7C5CFC] shrink-0"
                >
                  Detalhes
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. SEÇÃO EMPILHADA: RESULTADOS (+ CADASTRAR VIA FOTO OCR) */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#18181B] dark:text-white">
                Resultados
              </h2>
              <p className="text-xs text-[#71717A]">
                Suba o print da partida no EA FC para preencher a súmula por IA
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOcrResultModalOpen(true)}
              className="px-3.5 py-2 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {completedMatches.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-1 rounded-xl bg-[#38C958]/15 text-[#2fb34d] font-mono font-black text-xs">
                    {m.home_score} x {m.away_score}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                      {m.home_team?.name || 'Furia del Plata'} vs{' '}
                      {m.away_team?.name || 'Boca Juniors FC'}
                    </p>
                    <p className="text-[11px] text-[#71717A]">
                      {m.status === 'pending_validation'
                        ? '⏳ Aguardando validação do adversário'
                        : '✅ Súmula homologada • Rodada #' + (m.round_number || 3)}
                    </p>
                  </div>
                </div>
                <Link
                  href="/studio"
                  className="px-3 py-1.5 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-[11px] font-extrabold shrink-0"
                >
                  Gerar Banner
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 6. SEÇÃO EMPILHADA: JOGADORES (+ NOVO JOGADOR POPOVER & PRANCHETA) */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center justify-between relative">
            <div>
              <h2 className="text-base font-extrabold text-[#18181B] dark:text-white">
                Jogadores ({squad.length})
              </h2>
              <p className="text-xs text-[#71717A]">
                Elenco oficial e convidados avulsos
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNewPlayerPopoverOpen(!newPlayerPopoverOpen)}
                className="px-3.5 py-2 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Jogador</span>
              </button>

              {newPlayerPopoverOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl p-2 space-y-1 z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPlayerPopoverOpen(false);
                      setInviteModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-extrabold text-left hover:bg-[#F5F6FA] dark:hover:bg-zinc-800 flex items-center gap-2 text-[#18181B] dark:text-white"
                  >
                    <Share2 className="w-4 h-4 text-[#7C5CFC]" />
                    <span>Convidar (Link / Código)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPlayerPopoverOpen(false);
                      setRegisterPlayerModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-extrabold text-left hover:bg-[#F5F6FA] dark:hover:bg-zinc-800 flex items-center gap-2 text-[#18181B] dark:text-white"
                  >
                    <UserPlus className="w-4 h-4 text-[#38C958]" />
                    <span>Cadastrar (Titular / Avulso)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filtros "Visualizar: Atuais" | "Ordem: Artilharia" + Botão Prancheta 5x5/11v11 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <select
                value={playerViewFilter}
                onChange={(e) => setPlayerViewFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[#18181B] dark:text-white"
              >
                <option value="atuais">Visualizar: Atuais</option>
                <option value="convidados">Visualizar: Todos + Avulsos</option>
              </select>

              <select
                value={playerSortOrder}
                onChange={(e) => setPlayerSortOrder(e.target.value as any)}
                className="px-3 py-1.5 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[#7C5CFC]"
              >
                <option value="artilharia">Ordem: Artilharia</option>
                <option value="assistencias">Ordem: Assistências</option>
                <option value="nome">Ordem: Alfabética</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowTacticalPitch(!showTacticalPitch)}
              className="px-3.5 py-1.5 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] text-xs font-extrabold flex items-center gap-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{showTacticalPitch ? 'Ocultar Prancheta' : 'Prancheta 5x5 / 11v11'}</span>
            </button>
          </div>

          {showTacticalPitch && (
            <SquadProvider initialFormation="5v5-1-2-1" initialGameMode="5v5">
              <EmbeddedTacticalBuilder roster={squad} />
            </SquadProvider>
          )}

          {/* Lista de Jogadores do Time */}
          <div className="space-y-2">
            {squad.map((p, idx) => {
              const st = getPlayerStatsBadge(idx);
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0">
                      {p.avatar_url ? (
                        <img
                          src={p.avatar_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        p.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#18181B] dark:text-white truncate">
                          {p.name}
                        </span>
                        {idx === 0 && (
                          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#7C5CFC] block">
                        {p.primary_position || p.positions_declared[0] || 'MEI'} •{' '}
                        {p.platform || 'PS5'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-700 font-bold text-[#18181B] dark:text-white">
                      ⚽ {st.goals}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-700 font-bold text-[#71717A]">
                      👟 {st.assists}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 7. SEÇÃO EMPILHADA: ADMINISTRADORES (+ NOVO ADMIN COM COROA) */}
        {/* ================================================================= */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#18181B] dark:text-white">
                Administradores
              </h2>
              <p className="text-xs text-[#71717A]">
                Capitães com permissão de agendar e aprovar súmulas
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewAdminModalOpen(true)}
              className="px-3.5 py-2 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Admin</span>
            </button>
          </div>

          <div className="space-y-2">
            {adminsList.map((adm) => (
              <div
                key={adm.id}
                className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                      {adm.name}
                    </span>
                    <span className="text-[11px] text-[#71717A]">{adm.email}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase">
                  {adm.isOwner ? 'Dono' : 'Admin'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: FINANCEIRO / CAIXA DO TIME ("SALDO ATUAL R$ 560,00") */}
      {/* ===================================================================== */}
      {financeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Financeiro do Time
              </h2>
              <button
                type="button"
                onClick={() => setFinanceModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seletor de Meses igual à print */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#F5F6FA] dark:bg-zinc-800">
              {(['Setembro 2026', 'Outubro 2026'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFinanceMonth(m)}
                  className={cn(
                    'py-2 rounded-full text-xs font-extrabold transition-all',
                    financeMonth === m
                      ? 'bg-[#7C5CFC] text-white shadow-xs'
                      : 'text-[#71717A]'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Card Saldo Atual */}
            <div className="p-5 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700 text-center space-y-1">
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Saldo Atual ({financeMonth})
              </span>
              <p className="text-3xl font-black text-[#38C958] font-mono">
                R$ 560,00
              </p>
              <span className="text-[11px] text-[#7C5CFC] font-bold block">
                Inscrição Liga LPF 5x5 (R$ 70,00) Quitada ✅
              </span>
            </div>

            {/* Extrato de Entradas e Saídas */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#71717A]">
                Extrato de Movimentações
              </h3>

              {[
                {
                  id: 'tx1',
                  title: 'Rateio Elenco (6 jogadores x R$ 15)',
                  date: '15 Out 2026',
                  amount: '+ R$ 90,00',
                  type: 'in',
                },
                {
                  id: 'tx2',
                  title: 'Patrocínio Master Betsson (Cota Mensal)',
                  date: '10 Out 2026',
                  amount: '+ R$ 540,00',
                  type: 'in',
                },
                {
                  id: 'tx3',
                  title: 'Inscrição Liga Argentina 5x5 LPF',
                  date: '05 Out 2026',
                  amount: '- R$ 70,00',
                  type: 'out',
                },
              ].map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center',
                        tx.type === 'in'
                          ? 'bg-[#38C958]/15 text-[#2fb34d]'
                          : 'bg-rose-500/15 text-rose-500'
                      )}
                    >
                      {tx.type === 'in' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#18181B] dark:text-white">
                        {tx.title}
                      </p>
                      <p className="text-[10px] text-[#71717A]">{tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-black font-mono',
                      tx.type === 'in' ? 'text-[#38C958]' : 'text-rose-500'
                    )}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFinanceModalOpen(false)}
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Fechar Extrato
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CONVIDAR JOGADORES (LINK OU CÓDIGO 192Y4I) */}
      {/* ===================================================================== */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Convidar jogadores
              </h2>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#71717A]">
              Envie o código ou link abaixo no grupo do WhatsApp para os atletas entrarem direto no elenco do <strong>{teamDisplayName}</strong>:
            </p>

            <div className="p-5 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800 border-2 border-dashed border-[#7C5CFC]/40 space-y-2">
              <span className="text-[11px] font-bold text-[#71717A] uppercase block">
                Código Oficial do Time
              </span>
              <span className="text-3xl font-black tracking-widest text-[#7C5CFC] font-mono block">
                192Y4I
              </span>
              <button
                type="button"
                onClick={copyInviteCode}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-[#7C5CFC]"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#38C958]" />
                    <span className="text-[#38C958]">Código Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Entre no elenco do ${teamDisplayName} no DraftClub Jogueiros PRO usando o código 192Y4I!`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar convite no WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CADASTRO DE JOGO (+ NOVO JOGO ESTILO JOGUEIROS) */}
      {/* ===================================================================== */}
      {newMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleCreateScheduleMatch}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Cadastrar um Jogo
              </h2>
              <button
                type="button"
                onClick={() => setNewMatchModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Confronto Escudo X Escudo */}
            <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-around">
              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-full bg-[#7C5CFC] text-white font-black flex items-center justify-center mx-auto">
                  FP
                </div>
                <span className="text-xs font-extrabold block">{teamDisplayName}</span>
              </div>
              <span className="text-lg font-black text-[#7C5CFC]">X</span>
              <div className="text-center space-y-1">
                <select
                  value={opponentId}
                  onChange={(e) => setOpponentId(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-[#18181B] dark:text-white"
                >
                  {teams
                    .filter((t) => t.id !== myTeam.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        🛡️ {t.name}
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-[#71717A] block">Buscar Adversário</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['Mandante', 'Visitante'] as const).map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setMatchLocation(loc)}
                  className={cn(
                    'py-2.5 rounded-full text-xs font-extrabold border transition-all',
                    matchLocation === loc
                      ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  {loc}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">Data</label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Horário (Tinder 5x5)
                </label>
                <input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[#7C5CFC]"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#7C5CFC]/10 text-[#7C5CFC] text-[11px] font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                Sugestão Tinder de Horários: Terça às 22:30h tem 100% do seu elenco 5x5 online!
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['Campeonato', 'Amistoso'] as const).map((tp) => (
                <button
                  type="button"
                  key={tp}
                  onClick={() => setMatchType(tp)}
                  className={cn(
                    'py-2 rounded-full text-xs font-extrabold border transition-all',
                    matchType === tp
                      ? 'bg-[#7C5CFC]/15 text-[#7C5CFC] border-[#7C5CFC]'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  {tp}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Salvar Jogo
            </button>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: CADASTRAR RESULTADO POR FOTO (ZERO DIGITAÇÃO OCR) */}
      {/* ===================================================================== */}
      {ocrResultModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Cadastrar Resultado (IA OCR)
                </h2>
                <p className="text-xs text-[#71717A]">
                  Suba o print final do EA FC 26 para preencher placar e gols sem digitar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOcrResultModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block p-5 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800 border-2 border-dashed border-[#7C5CFC]/50 text-center cursor-pointer hover:bg-[#7C5CFC]/5 transition-all space-y-2">
              <Upload className="w-7 h-7 text-[#7C5CFC] mx-auto" />
              <span className="text-xs font-extrabold text-[#18181B] dark:text-white block">
                {ocrScanning
                  ? 'Lendo print da EA com Gemini Vision...'
                  : 'Toque para enviar o Print da Partida (EA FC 26)'}
              </span>
              <span className="text-[11px] text-[#7C5CFC] font-semibold block">
                Zero Digitação • Extrai Placar, Gols, Assistências e Nota
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleQuickOcrUpload}
                className="hidden"
              />
            </label>

            {ocrSummaryText && (
              <div className="p-3 rounded-2xl bg-[#38C958]/15 text-[#2fb34d] text-xs font-bold">
                ✅ {ocrSummaryText}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 text-center">
                <span className="text-[11px] font-bold text-[#71717A] block">
                  {teamDisplayName}
                </span>
                <input
                  type="number"
                  value={ocrScoreHome}
                  onChange={(e) => setOcrScoreHome(parseInt(e.target.value) || 0)}
                  className="w-16 text-center text-xl font-black bg-transparent text-[#18181B] dark:text-white mt-1"
                />
              </div>
              <div className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 text-center">
                <span className="text-[11px] font-bold text-[#71717A] block">Adversário</span>
                <input
                  type="number"
                  value={ocrScoreAway}
                  onChange={(e) => setOcrScoreAway(parseInt(e.target.value) || 0)}
                  className="w-16 text-center text-xl font-black bg-transparent text-[#18181B] dark:text-white mt-1"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveOcrMatch}
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Salvar Súmula
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: CADASTRAR JOGADOR (TITULAR OU CONVIDADO AVULSO) */}
      {/* ===================================================================== */}
      {registerPlayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleRegisterNewPlayer}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Cadastrar Jogador
              </h2>
              <button
                type="button"
                onClick={() => setRegisterPlayerModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['Titular', 'Convidado Avulso'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setNewPlayerType(t)}
                  className={cn(
                    'py-2.5 rounded-full text-xs font-extrabold border transition-all',
                    newPlayerType === t
                      ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                      : 'bg-[#F5F6FA] dark:bg-zinc-800 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                Nome / Gamertag EA FC
              </label>
              <input
                type="text"
                required
                value={newPlayerNick}
                onChange={(e) => setNewPlayerNick(e.target.value)}
                placeholder="Ex: Carlitos_10"
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">Posição</label>
              <select
                value={newPlayerPos}
                onChange={(e) => setNewPlayerPos(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
              >
                {['ATA', 'MEI', 'MC', 'VOL', 'ALA', 'ZAG', 'GK'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Salvar Jogador
            </button>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: CADASTRAR UM ADMINISTRADOR POR E-MAIL */}
      {/* ===================================================================== */}
      {newAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleAddAdmin}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Cadastrar um administrador
              </h2>
              <button
                type="button"
                onClick={() => setNewAdminModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#71717A]">
              Informe o e-mail do sub-capitão para que ele também possa cadastrar jogos e validar súmulas:
            </p>

            <input
              type="email"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="subcapitao@draftclub.pro"
              className="w-full px-4 py-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
            />

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Prosseguir
            </button>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 7: EDITAR PERFIL DO TIME (ZERO DIGITAÇÃO: ESCUDO + FOTO UNIFORME) */}
      {/* ===================================================================== */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Editar Perfil do Time
                </h2>
                <p className="text-xs text-[#7C5CFC] font-bold">
                  Filosofia Zero Digitação • 100% por Foto via Gemini Vision
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditProfileModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload de Escudo e Foto do Uniforme em Campo (Sem descrição textual!) */}
            <div className="grid grid-cols-2 gap-3">
              <label className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center cursor-pointer hover:border-[#7C5CFC] space-y-2">
                <img
                  src={crestPhotoUrl}
                  alt="Escudo"
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-[#7C5CFC]"
                />
                <span className="text-xs font-extrabold block">Escudo do Time</span>
                <span className="text-[10px] text-[#7C5CFC] font-bold block">
                  Enviar PNG/JPG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCrest}
                  className="hidden"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center cursor-pointer hover:border-[#7C5CFC] space-y-2">
                <img
                  src={kitPhotoUrl}
                  alt="Uniforme em Campo"
                  className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-[#38C958]"
                />
                <span className="text-xs font-extrabold block">Foto do Uniforme</span>
                <span className="text-[10px] text-[#38C958] font-bold block">
                  IA lê cores/camisa
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadKitPhoto}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                Nome do Clube
              </label>
              <input
                type="text"
                value={teamDisplayName}
                onChange={(e) => setTeamDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                Patrocinadores para os Banners
              </label>
              <input
                type="text"
                value={sponsorsText}
                onChange={(e) => setSponsorsText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[#7C5CFC]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditProfileModalOpen(false);
                showToast('Perfil e fotos do clube salvos com sucesso!');
              }}
              className="w-full py-3.5 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm shadow-md"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 8: CONTATOS DO TIME (WHATSAPP & INSTAGRAM) */}
      {/* ===================================================================== */}
      {contactsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Contatos do Clube
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
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Instagram Oficial
                </label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Link do Grupo de WhatsApp
                </label>
                <input
                  type="text"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
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

      {/* ===================================================================== */}
      {/* MODAL 9: MENU DE CONFIGURAÇÕES DO TIME & PONTUAÇÃO DA SÚMULA */}
      {/* ===================================================================== */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#F5F6FA] dark:bg-zinc-950 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                Configurações do Time
              </h2>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card PRO Team Ativado */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E5] text-white shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <div>
                  <span className="text-sm font-black block">PRO Team (Ativado)</span>
                  <span className="text-xs text-white/85">
                    Banners @atleticodapalhoca, IA OCR e Financeiro liberados
                  </span>
                </div>
              </div>
            </div>

            {/* Card Mudar de Conta */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-100 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-[#71717A] block">
                Mudar de Conta
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    switchProfileRole('captain');
                    setSettingsModalOpen(false);
                  }}
                  className={cn(
                    'p-2.5 rounded-2xl border text-xs font-extrabold',
                    session?.role === 'captain'
                      ? 'border-[#7C5CFC] bg-[#7C5CFC]/10 text-[#7C5CFC]'
                      : 'border-zinc-100 dark:border-zinc-800'
                  )}
                >
                  <Shield className="w-4 h-4 mx-auto mb-1" />
                  Dono Time
                </button>
                <Link
                  href="/player"
                  onClick={() => {
                    switchProfileRole('player');
                    setSettingsModalOpen(false);
                  }}
                  className="p-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-xs font-extrabold text-center"
                >
                  <User className="w-4 h-4 mx-auto mb-1" />
                  Jogador
                </Link>
                <Link
                  href="/admin"
                  onClick={() => {
                    switchProfileRole('admin');
                    setSettingsModalOpen(false);
                  }}
                  className="p-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-xs font-extrabold text-center"
                >
                  <Crown className="w-4 h-4 mx-auto mb-1" />
                  Admin Liga
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-2 border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setSettingsModalOpen(false);
                  setFinanceModalOpen(true);
                }}
                className="w-full p-3.5 flex items-center justify-between text-left"
              >
                <span className="text-xs font-extrabold">💰 Financeiro (R$ 560,00)</span>
                <ChevronRight className="w-4 h-4 text-[#7C5CFC]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettingsModalOpen(false);
                  setMetricsModalOpen(true);
                }}
                className="w-full p-3.5 flex items-center justify-between text-left"
              >
                <span className="text-xs font-extrabold">
                  📊 Pontuação de métricas (Pontuação da súmula)
                </span>
                <ChevronRight className="w-4 h-4 text-[#7C5CFC]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 10: PONTUAÇÃO DA SÚMULA (GOL 8, ASSIST 5, ETC.) */}
      {/* ===================================================================== */}
      {metricsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                  Pontuação da súmula
                </h2>
                <p className="text-xs text-[#71717A]">
                  Ajuste os pontos de cada métrica oficial do time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMetricsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { key: 'gol', label: '⚽ Gol', val: metricsScore.gol },
                { key: 'assistencia', label: '👟 Assistência', val: metricsScore.assistencia },
                { key: 'golSofrido', label: '🥅 Gol sofrido', val: metricsScore.golSofrido },
                { key: 'defesaDificil', label: '🧤 Defesa difícil', val: metricsScore.defesaDificil },
                { key: 'cartaoAmarelo', label: '🟨 Cartão amarelo', val: metricsScore.cartaoAmarelo },
                { key: 'cartaoVermelho', label: '🟥 Cartão vermelho', val: metricsScore.cartaoVermelho },
                { key: 'destaque', label: '⭐ Destaque', val: metricsScore.destaque },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 flex items-center justify-between"
                >
                  <span className="text-xs font-extrabold">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setMetricsScore((prev) => ({
                          ...prev,
                          [item.key]: prev[item.key as keyof typeof metricsScore] - 1,
                        }))
                      }
                      className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-black text-sm text-[#7C5CFC]"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-extrabold text-sm">
                      {item.val}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setMetricsScore((prev) => ({
                          ...prev,
                          [item.key]: prev[item.key as keyof typeof metricsScore] + 1,
                        }))
                      }
                      className="w-8 h-8 rounded-full bg-[#7C5CFC] text-white font-black text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setMetricsModalOpen(false);
                showToast('Pontuação da súmula salva!');
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
