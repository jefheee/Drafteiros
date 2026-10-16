'use client';

import React, { useState, useRef } from 'react';
import {
  FALLBACK_MATCHES,
  FALLBACK_TEAMS,
  FALLBACK_PLAYERS,
} from '@/lib/mock-league-data';
import { RoleplayType, RoleplayResult, CharacterPromptResult } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Image as ImageIcon,
  MessageSquareQuote,
  Camera,
  Download,
  Copy,
  Check,
  Upload,
  Trophy,
  Shield,
  ExternalLink,
  Wand2,
} from 'lucide-react';

export default function CreativeStudioPage() {
  const [activeTab, setActiveTab] = useState<'banner' | 'roleplay' | 'character'>('banner');

  // =========================================================================
  // ESTADOS ABA 1: GERADOR DE BANNERS 4:5 (@atleticodapalhoca)
  // =========================================================================
  const [selectedMatchId, setSelectedMatchId] = useState<string>(FALLBACK_MATCHES[1].id);
  const [leagueBadgeText, setLeagueBadgeText] = useState<string>('🇦🇷 LIGA ARGENTINA 5x5 • OFICIAL');
  const [homeTeamName, setHomeTeamName] = useState<string>('RACING CLUB');
  const [awayTeamName, setAwayTeamName] = useState<string>('BOCA JUNIORS');
  const [homeColor, setHomeColor] = useState<string>('#38bdf8');
  const [awayColor, setAwayColor] = useState<string>('#eab308');
  const [bannerHomeScore, setBannerHomeScore] = useState<number>(3);
  const [bannerAwayScore, setBannerAwayScore] = useState<number>(1);
  const [motmBannerName, setMotmBannerName] = useState<string>('ANDREI_VOL (9.5)');
  const [bgImageUrl, setBgImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&q=80'
  );
  const [homeMarkersText, setHomeMarkersText] = useState<string>(
    '⚽ Andrei_VOL (2x)\n⚽ Enzo_Maestro\n👟 Enzo_Maestro (2x)\n👟 Andrei_VOL'
  );
  const [awayMarkersText, setAwayMarkersText] = useState<string>('⚽ Buzz_ProClubs\n👟 Deivy_10');
  const [sponsorsList, setSponsorsList] = useState<string>('BETSSON • REDBULL GAMING • MONSTER ENERGY');
  const [instagramHandle, setInstagramHandle] = useState<string>('@atleticodapalhoca');
  const [downloadingCanvas, setDownloadingCanvas] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // =========================================================================
  // ESTADOS ABA 2: IA ROLEPLAY (RESENHA & NOTAS OFICIAIS)
  // =========================================================================
  const [roleplayType, setRoleplayType] = useState<RoleplayType>('nota_repudio');
  const [rpPlayerName, setRpPlayerName] = useState<string>('Buzz_ProClubs');
  const [rpTeamName, setRpTeamName] = useState<string>('Racing Club Digital');
  const [rpRivalName, setRpRivalName] = useState<string>('River Plate eSports');
  const [rpScoreContext, setRpScoreContext] = useState<string>('3 x 1');
  const [rpCustomContext, setRpCustomContext] = useState<string>(
    'Goleiro deles fez cera e reclamaram de lag depois de tomar 3 gols em 10 minutos'
  );
  const [rpLoading, setRpLoading] = useState<boolean>(false);
  const [rpResult, setRpResult] = useState<RoleplayResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // =========================================================================
  // ESTADOS ABA 3: PROMPT BUILDER INTELIGENTE DE PERSONAGEM 8K
  // =========================================================================
  const [selectedProfileId, setSelectedProfileId] = useState<string>(FALLBACK_PLAYERS[0].id);
  const [selectedClubId, setSelectedClubId] = useState<string>(FALLBACK_TEAMS[2].id);
  const [sceneIdea, setSceneIdea] = useState<string>(
    'Meu personagem segurando o troféu da Liga Argentina na chuva provocando a torcida rival'
  );
  const [promptLoading, setPromptLoading] = useState<boolean>(false);
  const [promptResult, setPromptResult] = useState<CharacterPromptResult | null>(null);

  const selectedPlayer =
    FALLBACK_PLAYERS.find((p) => p.id === selectedProfileId) || FALLBACK_PLAYERS[0];
  const selectedClub =
    FALLBACK_TEAMS.find((t) => t.id === selectedClubId) || FALLBACK_TEAMS[2];

  // Carrega dados de uma partida concluída no Gerador de Banner
  const handleSelectMatchPreset = (matchId: string) => {
    setSelectedMatchId(matchId);
    const found = FALLBACK_MATCHES.find((m) => m.id === matchId);
    if (!found) return;
    setHomeTeamName((found.home_team?.name || 'TIME CASA').toUpperCase());
    setAwayTeamName((found.away_team?.name || 'TIME FORA').toUpperCase());
    setHomeColor(found.home_team?.primary_color || '#38bdf8');
    setAwayColor(found.away_team?.primary_color || '#eab308');
    setBannerHomeScore(found.home_score);
    setBannerAwayScore(found.away_score);
    if (found.proof_image_url) setBgImageUrl(found.proof_image_url);
    if (found.home_team?.sponsors?.length) {
      setSponsorsList(
        found.home_team.sponsors.map((s) => s.name.toUpperCase()).join(' • ')
      );
    }
  };

  const handleUploadBgPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBgImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Renderiza o banner em um Canvas 1080x1350 (proporção 4:5 Instagram) e baixa PNG
  const handleDownloadBannerPng = async () => {
    setDownloadingCanvas(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fundo escuro base
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 1080, 1350);

      // Tenta desenhar imagem de fundo
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = bgImageUrl;
        });
        if (img.width > 0) {
          ctx.drawImage(img, 0, 0, 1080, 920);
        }
      } catch {
        // segue com gradiente
      }

      // Gradiente escuro inferior estilo @atleticodapalhoca
      const grad = ctx.createLinearGradient(0, 320, 0, 1180);
      grad.addColorStop(0, 'rgba(2, 6, 23, 0.15)');
      grad.addColorStop(0.45, 'rgba(2, 6, 23, 0.88)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.99)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1350);

      // Selo da Liga no Topo
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(240, 48, 600, 62, 31);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(leagueBadgeText, 540, 88);

      // Escudo Casa + Placar Central + Escudo Fora
      // Escudo Casa
      ctx.fillStyle = homeColor;
      ctx.beginPath();
      ctx.arc(220, 690, 74, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#020617';
      ctx.font = '900 38px sans-serif';
      ctx.fillText(homeTeamName.substring(0, 3), 220, 704);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(homeTeamName, 220, 805);

      // Placar Central
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(390, 620, 300, 130, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 84px monospace';
      ctx.fillText(`${bannerHomeScore} - ${bannerAwayScore}`, 540, 712);

      // Escudo Fora
      ctx.fillStyle = awayColor;
      ctx.beginPath();
      ctx.arc(860, 690, 74, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#020617';
      ctx.font = '900 38px sans-serif';
      ctx.fillText(awayTeamName.substring(0, 3), 860, 704);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(awayTeamName, 860, 805);

      // Marcadores e Garçons Casa & Fora
      ctx.font = '600 24px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      const homeLines = homeMarkersText.split('\n').filter(Boolean);
      homeLines.slice(0, 5).forEach((line, idx) => {
        ctx.fillText(line, 240, 865 + idx * 38);
      });

      const awayLines = awayMarkersText.split('\n').filter(Boolean);
      awayLines.slice(0, 5).forEach((line, idx) => {
        ctx.fillText(line, 840, 865 + idx * 38);
      });

      // Badge Craque do Jogo (MOTM)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(300, 1085, 480, 56, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 23px sans-serif';
      ctx.fillText(`⭐ CRAQUE DO JOGO: ${motmBannerName}`, 540, 1122);

      // Barra de Patrocinadores com Destaque Real e Legível
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 1185, 1080, 165);
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 1185);
      ctx.lineTo(1080, 1185);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`PATROCINADORES OFICIAIS • ${instagramHandle.toUpperCase()}`, 540, 1230);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 34px sans-serif';
      ctx.fillText(sponsorsList, 540, 1290);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `placar-${homeTeamName.toLowerCase().replace(/\s+/g, '-')}-vs-${awayTeamName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloadingCanvas(false);
    }
  };

  // =========================================================================
  // HANDLERS ABA 2 & 3: CHAMADAS PARA /api/ai-studio
  // =========================================================================
  const handleGenerateRoleplay = async (e: React.FormEvent) => {
    e.preventDefault();
    setRpLoading(true);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_roleplay',
          roleplayType,
          playerName: rpPlayerName,
          teamName: rpTeamName,
          rivalName: rpRivalName,
          scoreContext: rpScoreContext,
          customContext: rpCustomContext,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setRpResult(json.data);
      }
    } finally {
      setRpLoading(false);
    }
  };

  const handleGenerateCharacterPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromptLoading(true);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_character_prompt',
          sceneIdea,
          playerName: selectedPlayer.name,
          teamName: selectedClub.name,
          primaryColor: selectedClub.primary_color,
          secondaryColor: selectedClub.secondary_color,
          kitDescription: selectedClub.kit_description,
          visualTraits: selectedPlayer.visual_traits,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setPromptResult(json.data);
      }
    } finally {
      setPromptLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header do Estúdio Criativo */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Estúdio Criativo Híbrido • Canvas + Gemini AI
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              Estúdio Pro Clubs & Roleplay IA
            </h1>
            <p className="text-xs text-slate-400">
              Gere artes de placar padrão Instagram 4:5 com patrocinadores legíveis, notas de repúdio e prompts 8K do seu boneco.
            </p>
          </div>
        </div>

        {/* 3 Abas Principais */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setActiveTab('banner')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'banner'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Arte de Placar (4:5)</span>
          </button>

          <button
            onClick={() => setActiveTab('roleplay')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'roleplay'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <MessageSquareQuote className="w-4 h-4 shrink-0" />
            <span className="truncate">2. IA Roleplay & Resenha</span>
          </button>

          <button
            onClick={() => setActiveTab('character')}
            className={cn(
              'min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2',
              activeTab === 'character'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Cenas do Boneco (8K)</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* ABA 1: GERADOR DE ARTES DE PLACAR E CRAQUE (@atleticodapalhoca) */}
        {/* =================================================================== */}
        {activeTab === 'banner' && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Controles do Gerador (6 Colunas) */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">
                    Configurar Banner de Fim de Jogo (Formato 4:5)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Padrão visual <code className="text-cyan-400">@atleticodapalhoca</code> com destaque real para patrocinadores.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Importar Dados de Partida Concluída:
                </label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => handleSelectMatchPreset(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-bold"
                >
                  {FALLBACK_MATCHES.map((m) => (
                    <option key={m.id} value={m.id}>
                      Rodada #{m.round_number}: {m.home_team?.name} ({m.home_score}x
                      {m.away_score}) {m.away_team?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload de Foto de Fundo (Bonecos Comemorando) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Foto de Fundo (Bonecos comemorando no EA FC 26):
                </label>
                <div className="flex gap-2">
                  <label className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-cyan-400 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    Enviar Print / Foto do Jogo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBgPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Times e Placar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Time Mandante
                  </label>
                  <input
                    type="text"
                    value={homeTeamName}
                    onChange={(e) => setHomeTeamName(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Time Visitante
                  </label>
                  <input
                    type="text"
                    value={awayTeamName}
                    onChange={(e) => setAwayTeamName(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Gols Casa
                  </label>
                  <input
                    type="number"
                    value={bannerHomeScore}
                    onChange={(e) => setBannerHomeScore(parseInt(e.target.value) || 0)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center text-sm font-black text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Gols Fora
                  </label>
                  <input
                    type="number"
                    value={bannerAwayScore}
                    onChange={(e) => setBannerAwayScore(parseInt(e.target.value) || 0)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center text-sm font-black text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Craque (MOTM)
                  </label>
                  <input
                    type="text"
                    value={motmBannerName}
                    onChange={(e) => setMotmBannerName(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300"
                  />
                </div>
              </div>

              {/* Marcadores e Assistências */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Marcadores Casa (⚽ Gols / 👟 Assists)
                  </label>
                  <textarea
                    rows={3}
                    value={homeMarkersText}
                    onChange={(e) => setHomeMarkersText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Marcadores Fora (⚽ Gols / 👟 Assists)
                  </label>
                  <textarea
                    rows={3}
                    value={awayMarkersText}
                    onChange={(e) => setAwayMarkersText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Barra de Patrocinadores Destacada */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Patrocinadores em Destaque
                  </label>
                  <input
                    type="text"
                    value={sponsorsList}
                    onChange={(e) => setSponsorsList(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    @ do Clube no Instagram
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadBannerPng}
                disabled={downloadingCanvas}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                {downloadingCanvas
                  ? 'Renderizando Poster 1080x1350...'
                  : '📥 Baixar Arte em Alta Resolução (PNG 4:5 Instagram)'}
              </button>

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Preview Interativo em Tempo Real Formato 4:5 (6 Colunas) */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="w-full max-w-[440px] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl relative bg-slate-950 flex flex-col justify-between select-none">
                {/* Foto de Fundo dos Bonecos Comemorando */}
                <img
                  src={bgImageUrl}
                  alt="Fundo da Partida EA FC 26"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Overlay Escuro Inferior Padrão @atleticodapalhoca */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/20" />

                {/* Selo da Liga no Topo */}
                <div className="relative z-10 pt-4 px-4 flex justify-center">
                  <div className="px-4 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/60 shadow-md">
                    <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-cyan-400 uppercase">
                      {leagueBadgeText}
                    </span>
                  </div>
                </div>

                {/* Bloco Inferior: Escudos + Placar Grande + Artilheiros + Barra de Patrocinadores */}
                <div className="relative z-10 mt-auto space-y-3 pt-10">
                  {/* Escudo Casa | Placar Central | Escudo Fora */}
                  <div className="px-5 flex items-center justify-between gap-2">
                    {/* Escudo Casa */}
                    <div className="flex flex-col items-center w-28 text-center">
                      <div
                        className="w-14 h-14 rounded-2xl border-2 border-white/30 flex items-center justify-center shadow-lg font-black text-slate-950 text-base"
                        style={{ backgroundColor: homeColor }}
                      >
                        {homeTeamName.substring(0, 3)}
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-tight mt-1.5 leading-tight">
                        {homeTeamName}
                      </span>
                    </div>

                    {/* Placar Grande Central */}
                    <div className="px-5 py-2.5 rounded-2xl bg-slate-950/95 border-2 border-amber-500/80 shadow-xl text-center">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 block">
                        FIM DE JOGO
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                        {bannerHomeScore} <span className="text-amber-400">-</span> {bannerAwayScore}
                      </div>
                    </div>

                    {/* Escudo Fora */}
                    <div className="flex flex-col items-center w-28 text-center">
                      <div
                        className="w-14 h-14 rounded-2xl border-2 border-white/30 flex items-center justify-center shadow-lg font-black text-slate-950 text-base"
                        style={{ backgroundColor: awayColor }}
                      >
                        {awayTeamName.substring(0, 3)}
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-tight mt-1.5 leading-tight">
                        {awayTeamName}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Marcadores (⚽ Gol / 👟 Assistência) */}
                  <div className="px-5 grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900/75 border border-slate-800/90 space-y-1">
                      {homeMarkersText
                        .split('\n')
                        .filter(Boolean)
                        .map((line, i) => (
                          <div
                            key={i}
                            className="text-[11px] font-semibold text-slate-200 truncate"
                          >
                            {line}
                          </div>
                        ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/75 border border-slate-800/90 space-y-1 text-right">
                      {awayMarkersText
                        .split('\n')
                        .filter(Boolean)
                        .map((line, i) => (
                          <div
                            key={i}
                            className="text-[11px] font-semibold text-slate-200 truncate"
                          >
                            {line}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Craque da Partida */}
                  <div className="px-5">
                    <div className="py-1.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-center">
                      <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wide">
                        ⭐ Craque da Partida (MOTM): {motmBannerName}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Patrocinadores com Destaque Real e Legível */}
                  <div className="bg-slate-950 border-t-2 border-cyan-500/50 px-4 py-3 text-center space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-slate-400">
                      <span>PATROCINADORES OFICIAIS</span>
                      <span className="text-amber-400 font-bold">{instagramHandle}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-black tracking-wider text-cyan-400 uppercase truncate">
                      {sponsorsList}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: IA ROLEPLAY (RESENHA, ENTREVISTAS E NOTAS DE REPÚDIO) */}
        {/* =================================================================== */}
        {activeTab === 'roleplay' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <form
                onSubmit={handleGenerateRoleplay}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
              >
                <h2 className="text-base font-bold text-slate-100">
                  Gerador de Resenha, Entrevistas & Notas Oficiais
                </h2>

                {/* Seletores Rápidos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'nota_repudio', label: '🚨 Nota de Repúdio (Arbitragem/Bug/Rival)' },
                    { id: 'entrevista_pos_jogo', label: '🎙️ Entrevista Pós-Jogo (Zona Mista)' },
                    { id: 'provocacao_rival', label: '🤫 Provocação Pré-Jogo' },
                    { id: 'anuncio_contratacao', label: '✍️ Anúncio de Contratação (Here We Go)' },
                    { id: 'nota_oficial_clube', label: '📋 Nota Oficial da Diretoria' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setRoleplayType(item.id as RoleplayType)}
                      className={cn(
                        'min-h-[44px] p-2.5 rounded-xl border text-left text-xs font-bold transition-all',
                        roleplayType === item.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Atleta / Capitão
                    </label>
                    <input
                      type="text"
                      value={rpPlayerName}
                      onChange={(e) => setRpPlayerName(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Seu Clube
                    </label>
                    <input
                      type="text"
                      value={rpTeamName}
                      onChange={(e) => setRpTeamName(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Time Adversário
                    </label>
                    <input
                      type="text"
                      value={rpRivalName}
                      onChange={(e) => setRpRivalName(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Placar da Última Partida
                    </label>
                    <input
                      type="text"
                      value={rpScoreContext}
                      onChange={(e) => setRpScoreContext(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Contexto Rápido (1 linha sobre o que rolou):
                  </label>
                  <input
                    type="text"
                    value={rpCustomContext}
                    onChange={(e) => setRpCustomContext(e.target.value)}
                    placeholder="Ex: Fizemos 3 gols de tiki-taka e o goleiro deles quitou..."
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={rpLoading}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  {rpLoading ? 'Gerando Resenha com IA...' : '✨ Gerar Texto para WhatsApp & Instagram'}
                </button>
              </form>
            </div>

            {/* Resultado Roleplay Pronto para Copiar */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">
                    Texto Formatado Pronto para o Grupo da Liga
                  </h3>
                  {rpResult && (
                    <button
                      onClick={() => copyToClipboard(rpResult.whatsapp_text, 'wa')}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5"
                    >
                      {copiedKey === 'wa' ? (
                        <>
                          <Check className="w-4 h-4" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copiar p/ WhatsApp
                        </>
                      )}
                    </button>
                  )}
                </div>

                {rpResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 whitespace-pre-wrap text-xs text-slate-200 leading-relaxed font-sans">
                      {rpResult.whatsapp_text}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase">
                          Legenda para Instagram:
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${rpResult.instagram_caption}\n\n${rpResult.hashtags.join(' ')}`,
                              'ig'
                            )
                          }
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedKey === 'ig' ? 'Legenda Copiada!' : 'Copiar Legenda'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300">{rpResult.instagram_caption}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rpResult.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                    Escolha o tipo de resenha ao lado e clique em &ldquo;Gerar Texto&rdquo; para criar sua Nota de Repúdio, Entrevista ou Provocação!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: CRIADOR DE CENAS DE PERSONAGEM (PROMPT BUILDER 8K) */}
        {/* =================================================================== */}
        {activeTab === 'character' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <form
                onSubmit={handleGenerateCharacterPrompt}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
              >
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-100">
                    Criador de Cenas do Boneco (Prompt Builder 8K)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Injeta automaticamente as características físicas cadastradas no seu Passaporte + Uniforme do Clube.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Atleta (Visual Traits do Passaporte):
                    </label>
                    <select
                      value={selectedProfileId}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-400"
                    >
                      {FALLBACK_PLAYERS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (#{p.visual_traits?.shirt_number || 10})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Uniforme do Clube (Kit Description):
                    </label>
                    <select
                      value={selectedClubId}
                      onChange={(e) => setSelectedClubId(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400"
                    >
                      {FALLBACK_TEAMS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resumo das Características Físicas Injetadas */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                    🧬 DNA Visual Detectado Automaticamente:
                  </span>
                  <p className="text-slate-300">
                    <strong>Boneco:</strong> Pele {selectedPlayer.visual_traits?.skin_tone || 'Média'},{' '}
                    {selectedPlayer.visual_traits?.hair_style || 'Fade'} (
                    {selectedPlayer.visual_traits?.hair_color || 'Platinado'}),{' '}
                    {selectedPlayer.visual_traits?.facial_hair || 'Barba alinhada'}, Camisa #
                    {selectedPlayer.visual_traits?.shirt_number || 10}.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Uniforme:</strong> {selectedClub.kit_description}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Qual cena você quer gerar?
                  </label>
                  <textarea
                    rows={3}
                    value={sceneIdea}
                    onChange={(e) => setSceneIdea(e.target.value)}
                    placeholder="Ex: Meu personagem segurando o troféu na chuva provocando o rival..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={promptLoading}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {promptLoading
                    ? 'Construindo Prompt Mestre 8K...'
                    : '✨ Gerar Prompt Mestre Fotográfico (EN & PT)'}
                </button>
              </form>
            </div>

            {/* Card do Prompt Mestre Estruturado + Atalhos Diretos */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100">
                  Prompt Mestre 8K (Estilo Transmissão EA FC 26)
                </h3>

                {promptResult ? (
                  <div className="space-y-4">
                    {/* Inglês */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-cyan-400 uppercase">
                          🇺🇸 Master Prompt (Inglês - Máxima Precisão):
                        </span>
                        <button
                          onClick={() => copyToClipboard(promptResult.prompt_en, 'p_en')}
                          className="min-h-[36px] px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedKey === 'p_en' ? 'Copiado!' : 'Copiar 1-Clique'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 font-mono leading-relaxed">
                        {promptResult.prompt_en}
                      </p>
                    </div>

                    {/* Português */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase">
                          🇧🇷 Prompt Mestre (Português):
                        </span>
                        <button
                          onClick={() => copyToClipboard(promptResult.prompt_pt, 'p_pt')}
                          className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedKey === 'p_pt' ? 'Copiado!' : 'Copiar PT'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        {promptResult.prompt_pt}
                      </p>
                    </div>

                    {/* Atalhos para Geradores Gratuitos */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-xs font-bold text-slate-300 block">
                        Abrir Gerador de Imagem Gratuito e Colar Prompt:
                      </span>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {promptResult.external_generators.map((gen) => (
                          <a
                            key={gen.name}
                            href={gen.url}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[44px] p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <span className="font-bold text-slate-100 block">{gen.name}</span>
                              <span className="text-[10px] text-cyan-400">{gen.badge}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                    Clique em &ldquo;Gerar Prompt Mestre Fotográfico&rdquo; para combinar o DNA visual do seu boneco com o uniforme oficial do seu time!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
