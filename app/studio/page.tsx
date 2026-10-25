'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLeagueStore, uploadMediaToStorage } from '@/lib/data-store';
import { TEMPLATE_ASSETS, CARD_DESIGN_ASSETS } from '@/lib/assets-catalog';
import { RoleplayType, RoleplayResult, CharacterPromptResult } from '@/lib/gemini';
import { FC26PlayerCard, FC26PackOpener } from '@/components/players/fc26-player-card';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Download,
  Copy,
  Image as ImageIcon,
  MessageSquare,
  ExternalLink,
  Check,
  PackageCheck,
  Gift,
  Camera,
} from 'lucide-react';

interface ScorerLine {
  characterName: string;
  goals: number;
}

type BannerAspectRatio = '4:5' | '9:16' | '1:1';

const BANNER_FORMATS: {
  id: BannerAspectRatio;
  label: string;
  sublabel: string;
  width: number;
  height: number;
}[] = [
  { id: '4:5', label: 'Retrato 4:5', sublabel: '1080×1350', width: 1080, height: 1350 },
  { id: '9:16', label: 'Story 9:16', sublabel: '1080×1920', width: 1080, height: 1920 },
  { id: '1:1', label: 'Quadrado 1:1', sublabel: '1080×1080', width: 1080, height: 1080 },
];

export default function MediaStudioPage() {
  const { teams, players, matches, tournament, unlockPlayerCardDesign } = useLeagueStore();

  const [activeTab, setActiveTab] = useState<
    'post_match_canvas' | 'ai_generator' | 'fc26_packs' | 'roleplay'
  >('post_match_canvas');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bannerFormat, setBannerFormat] = useState<BannerAspectRatio>('4:5');

  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [homeTeamId, setHomeTeamId] = useState<string>(teams[0]?.id || '');
  const [awayTeamId, setAwayTeamId] = useState<string>(teams[1]?.id || '');
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [leagueBadgeLabel, setLeagueBadgeLabel] = useState<string>('DRAFTCLUB • EA FC 26');

  const [homeScorersText, setHomeScorersText] = useState<string>('');
  const [awayScorersText, setAwayScorersText] = useState<string>('');

  const [backgroundUrl, setBackgroundUrl] = useState<string>(
    TEMPLATE_ASSETS.postGameBackgrounds[0].url
  );
  const [featuredPlayerId, setFeaturedPlayerId] = useState<string>(players[0]?.id || '');
  const [showFeaturedPlayerOverlay, setShowFeaturedPlayerOverlay] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!homeTeamId && teams[0]?.id) setHomeTeamId(teams[0].id);
    if (!awayTeamId && teams[1]?.id) setAwayTeamId(teams[1].id);
    if (!featuredPlayerId && players[0]?.id) setFeaturedPlayerId(players[0].id);
  }, [teams, players, homeTeamId, awayTeamId, featuredPlayerId]);

  const homeTeam = useMemo(
    () => teams.find((t) => t.id === homeTeamId) || teams[0] || null,
    [teams, homeTeamId]
  );
  const awayTeam = useMemo(
    () => teams.find((t) => t.id === awayTeamId) || teams[1] || teams[0] || null,
    [teams, awayTeamId]
  );
  const featuredPlayer = useMemo(
    () => players.find((p) => p.id === featuredPlayerId) || players[0] || null,
    [players, featuredPlayerId]
  );

  const currentFormatConfig = useMemo(
    () => BANNER_FORMATS.find((f) => f.id === bannerFormat) || BANNER_FORMATS[0],
    [bannerFormat]
  );

  const handleSelectMatch = (mId: string) => {
    setSelectedMatchId(mId);
    const m = matches.find((item) => item.id === mId);
    if (!m) return;
    setHomeTeamId(m.home_team_id);
    setAwayTeamId(m.away_team_id);
    setHomeScore(m.home_score);
    setAwayScore(m.away_score);

    const ocrPlayers = m.ocr_extracted_data?.players || [];
    if (ocrPlayers.length > 0) {
      const hLines = ocrPlayers
        .filter((p) => p.team === 'home' && p.goals > 0)
        .map((p) => `${p.name.toUpperCase()} ${p.goals}`)
        .join('\n');
      const aLines = ocrPlayers
        .filter((p) => p.team === 'away' && p.goals > 0)
        .map((p) => `${p.name.toUpperCase()} ${p.goals}`)
        .join('\n');
      if (hLines) setHomeScorersText(hLines);
      if (aLines) setAwayScorersText(aLines);
    }
  };

  const parseScorerLines = (raw: string): ScorerLine[] => {
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(.*?)\s+(\d+)$/);
        if (match) {
          return {
            characterName: match[1].trim().toUpperCase(),
            goals: Number(match[2]) || 1,
          };
        }
        return { characterName: line.toUpperCase(), goals: 1 };
      });
  };

  // Renderização Canvas Dinâmica (4:5, 9:16 ou 1:1)
  useEffect(() => {
    if (activeTab !== 'post_match_canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isCancelled = false;

    const loadImage = (src: string): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    const drawRoundRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    async function renderBanner() {
      const W = currentFormatConfig.width;
      const H = currentFormatConfig.height;
      canvas!.width = W;
      canvas!.height = H;

      // 1. Base Atmosférica Monochrome Dark
      const baseGrad = ctx!.createLinearGradient(0, 0, 0, H);
      baseGrad.addColorStop(0, '#09090b');
      baseGrad.addColorStop(0.55, '#141414');
      baseGrad.addColorStop(1, '#000000');
      ctx!.fillStyle = baseGrad;
      ctx!.fillRect(0, 0, W, H);

      const bgImg = await loadImage(backgroundUrl);
      if (isCancelled) return;

      if (bgImg) {
        const imgRatio = bgImg.width / bgImg.height;
        const canvasRatio = W / H;
        let drawW = W;
        let drawH = H;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          drawH = H;
          drawW = H * imgRatio;
          offsetX = (W - drawW) / 2;
        } else {
          drawW = W;
          drawH = W / imgRatio;
          offsetY = (H - drawH) / 2;
        }
        ctx!.drawImage(bgImg, offsetX, offsetY, drawW, drawH);
      }

      if (showFeaturedPlayerOverlay && featuredPlayer) {
        const charImg = await loadImage(
          featuredPlayer.avatar_body_url ||
            featuredPlayer.avatar_face_url ||
            TEMPLATE_ASSETS.avatarPlaceholder
        );
        if (!isCancelled && charImg) {
          ctx!.save();
          ctx!.drawImage(charImg, W / 2 - 270, 90, 540, 740);
          ctx!.restore();
        }
      }

      const topVignette = ctx!.createLinearGradient(0, 0, 0, 220);
      topVignette.addColorStop(0, 'rgba(0,0,0,0.65)');
      topVignette.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = topVignette;
      ctx!.fillRect(0, 0, W, 220);

      const bottomGradStart = Math.floor(H * 0.5);
      const bottomGrad = ctx!.createLinearGradient(0, bottomGradStart, 0, H);
      bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      bottomGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.90)');
      bottomGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.97)');
      bottomGrad.addColorStop(1, '#000000');
      ctx!.fillStyle = bottomGrad;
      ctx!.fillRect(0, bottomGradStart, W, H - bottomGradStart);

      const [homeLogoImg, awayLogoImg] = await Promise.all([
        loadImage(homeTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder),
        loadImage(awayTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder),
      ]);
      if (isCancelled) return;

      const blockY = H - 460;
      const boxSize = 176;
      const leftBoxX = 86;
      const rightBoxX = W - 86 - boxSize;

      const drawTeamCrestSquare = (
        x: number,
        y: number,
        primaryColor: string,
        secondaryColor: string,
        teamName: string,
        logoImg: HTMLImageElement | null
      ) => {
        ctx!.save();
        drawRoundRect(ctx!, x, y, boxSize, boxSize, 32);
        ctx!.fillStyle = '#0A0A0A';
        ctx!.fill();
        ctx!.clip();

        ctx!.fillStyle = primaryColor || '#FFFFFF';
        ctx!.beginPath();
        ctx!.moveTo(x + boxSize * 0.42, y - 20);
        ctx!.lineTo(x + boxSize + 20, y - 20);
        ctx!.lineTo(x + boxSize * 0.58, y + boxSize + 20);
        ctx!.lineTo(x - 10, y + boxSize + 20);
        ctx!.closePath();
        ctx!.fill();

        ctx!.fillStyle = secondaryColor || '#A1A1AA';
        ctx!.globalAlpha = 0.28;
        ctx!.beginPath();
        ctx!.moveTo(x + boxSize * 0.25, y - 20);
        ctx!.lineTo(x + boxSize * 0.36, y - 20);
        ctx!.lineTo(x - 4, y + boxSize + 20);
        ctx!.lineTo(x - 18, y + boxSize + 20);
        ctx!.closePath();
        ctx!.fill();
        ctx!.globalAlpha = 1;

        if (logoImg) {
          const pad = 22;
          ctx!.drawImage(logoImg, x + pad, y + pad, boxSize - pad * 2, boxSize - pad * 2);
        } else {
          ctx!.fillStyle = '#FFFFFF';
          ctx!.font = '900 54px "Plus Jakarta Sans", Inter, sans-serif';
          ctx!.textAlign = 'center';
          ctx!.textBaseline = 'middle';
          ctx!.fillText(
            (teamName || 'FC').substring(0, 2).toUpperCase(),
            x + boxSize / 2,
            y + boxSize / 2
          );
        }

        ctx!.restore();

        ctx!.save();
        drawRoundRect(ctx!, x, y, boxSize, boxSize, 32);
        ctx!.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx!.lineWidth = 3;
        ctx!.stroke();
        ctx!.restore();
      };

      drawTeamCrestSquare(
        leftBoxX,
        blockY,
        homeTeam?.primary_color || '#FFFFFF',
        homeTeam?.secondary_color || '#141414',
        homeTeam?.name || 'Mandante',
        homeLogoImg
      );

      drawTeamCrestSquare(
        rightBoxX,
        blockY,
        awayTeam?.primary_color || '#A1A1AA',
        awayTeam?.secondary_color || '#141414',
        awayTeam?.name || 'Visitante',
        awayLogoImg
      );

      const centerX = W / 2;

      ctx!.save();
      const badgeW = 260;
      const badgeH = 38;
      drawRoundRect(ctx!, centerX - badgeW / 2, blockY - 8, badgeW, badgeH, 19);
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx!.fill();
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      ctx!.fillStyle = '#FFFFFF';
      ctx!.font = '800 18px "Plus Jakarta Sans", Inter, sans-serif';
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(leagueBadgeLabel.toUpperCase(), centerX, blockY + 11);
      ctx!.restore();

      ctx!.save();
      ctx!.fillStyle = '#FFFFFF';
      ctx!.shadowColor = 'rgba(0,0,0,0.65)';
      ctx!.shadowBlur = 24;
      ctx!.font = '900 124px "Plus Jakarta Sans", Impact, sans-serif';
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(`${homeScore}  -  ${awayScore}`, centerX, blockY + 98);
      ctx!.restore();

      ctx!.save();
      ctx!.fillStyle = '#FFFFFF';
      ctx!.font = '800 22px "Plus Jakarta Sans", Inter, sans-serif';
      ctx!.textAlign = 'center';
      const matchupLabel = `${(homeTeam?.name || 'MANDANTE').toUpperCase()}   •   ${(
        awayTeam?.name || 'VISITANTE'
      ).toUpperCase()}`;
      ctx!.fillText(matchupLabel, centerX, blockY + 172);
      ctx!.restore();

      ctx!.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(86, blockY + 205);
      ctx!.lineTo(W - 86, blockY + 205);
      ctx!.stroke();

      const homeScorers = parseScorerLines(homeScorersText);
      const awayScorers = parseScorerLines(awayScorersText);

      const scorersStartY = blockY + 248;
      const lineSpacing = 44;

      ctx!.save();
      ctx!.textAlign = 'right';
      ctx!.font = '800 26px "Plus Jakarta Sans", Inter, sans-serif';
      homeScorers.slice(0, 5).forEach((item, index) => {
        const yPos = scorersStartY + index * lineSpacing;
        ctx!.fillStyle = '#F4F4F5';
        ctx!.fillText(`${item.characterName}  ${item.goals}`, centerX - 36, yPos);
      });
      ctx!.restore();

      ctx!.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(centerX, scorersStartY - 24);
      ctx!.lineTo(
        centerX,
        scorersStartY + Math.max(homeScorers.length, awayScorers.length, 1) * lineSpacing - 18
      );
      ctx!.stroke();

      ctx!.save();
      ctx!.textAlign = 'left';
      ctx!.font = '800 26px "Plus Jakarta Sans", Inter, sans-serif';
      awayScorers.slice(0, 5).forEach((item, index) => {
        const yPos = scorersStartY + index * lineSpacing;
        ctx!.fillStyle = '#F4F4F5';
        ctx!.fillText(`${item.goals}  ${item.characterName}`, centerX + 36, yPos);
      });
      ctx!.restore();
    }

    renderBanner();

    return () => {
      isCancelled = true;
    };
  }, [
    activeTab,
    currentFormatConfig,
    backgroundUrl,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    leagueBadgeLabel,
    homeScorersText,
    awayScorersText,
    showFeaturedPlayerOverlay,
    featuredPlayer,
  ]);

  const handleBackgroundFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadMediaToStorage('match-proofs', 'banners-bg', file);
    setBackgroundUrl(url);
  };

  const handleDownloadBannerPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `banner-${bannerFormat.replace(':', 'x')}-${(homeTeam?.name || 'home')
        .toLowerCase()
        .replace(/\s+/g, '-')}-x-${(awayTeam?.name || 'away')
        .toLowerCase()
        .replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  // ABA 2: GERADOR IA DE CENAS
  const [aiHomeTeamId, setAiHomeTeamId] = useState<string>(teams[0]?.id || '');
  const [aiAwayTeamId, setAiAwayTeamId] = useState<string>(teams[1]?.id || '');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [sceneIdea, setSceneIdea] = useState<string>(
    'Jogadores comemorando gol decisivo sob refletores de estádio noturno no EA FC 26'
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPromptResult, setAiPromptResult] = useState<CharacterPromptResult | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const aiHomeTeam = useMemo(
    () => teams.find((t) => t.id === aiHomeTeamId) || teams[0] || null,
    [teams, aiHomeTeamId]
  );
  const aiAwayTeam = useMemo(
    () => teams.find((t) => t.id === aiAwayTeamId) || teams[1] || teams[0] || null,
    [teams, aiAwayTeamId]
  );

  const sceneAvailablePlayers = useMemo(() => {
    const filtered = players.filter(
      (p) => p.team_id === aiHomeTeamId || p.team_id === aiAwayTeamId
    );
    return filtered.length > 0 ? filtered : players.slice(0, 12);
  }, [players, aiHomeTeamId, aiAwayTeamId]);

  const selectedScenePlayers = useMemo(() => {
    return players.filter((p) => selectedCharacterIds.includes(p.id));
  }, [players, selectedCharacterIds]);

  const toggleCharacterInScene = (playerId: string) => {
    setSelectedCharacterIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleGenerateMultimodalScene = async () => {
    setAiLoading(true);
    try {
      const charNames = selectedScenePlayers
        .map((p) => `${p.character_name} (#${p.visual_traits?.shirt_number || 10})`)
        .join(', ');

      const primaryFaceUrl = selectedScenePlayers[0]?.avatar_face_url || '';
      const primaryKitUrl = aiHomeTeam?.kit_home_url || aiHomeTeam?.logo_url || '';

      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_character_prompt',
          sceneIdea,
          playerName: charNames || 'Atletas do Clube',
          teamName: `${aiHomeTeam?.name || 'Mandante'} vs ${
            aiAwayTeam?.name || 'Visitante'
          }`,
          primaryColor: aiHomeTeam?.primary_color || '#FFFFFF',
          secondaryColor: aiHomeTeam?.secondary_color || '#0A0A0A',
          avatarImageBase64: primaryFaceUrl.startsWith('data:image')
            ? primaryFaceUrl
            : undefined,
          kitImageBase64: primaryKitUrl.startsWith('data:image')
            ? primaryKitUrl
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setAiPromptResult(json.data);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownloadReferenceKit = () => {
    const kitManifest = {
      generated_at: new Date().toISOString(),
      league: tournament?.name,
      home_team: {
        name: aiHomeTeam?.name,
        primary_color: aiHomeTeam?.primary_color,
        secondary_color: aiHomeTeam?.secondary_color,
        crest_url: aiHomeTeam?.logo_url,
        kit_home_url: aiHomeTeam?.kit_home_url,
      },
      away_team: {
        name: aiAwayTeam?.name,
        primary_color: aiAwayTeam?.primary_color,
        secondary_color: aiAwayTeam?.secondary_color,
        crest_url: aiAwayTeam?.logo_url,
        kit_home_url: aiAwayTeam?.kit_home_url,
      },
      selected_characters: selectedScenePlayers.map((p) => ({
        character_name: p.character_name,
        full_name: p.full_name,
        position: p.primary_position,
        avatar_face_url: p.avatar_face_url,
      })),
      scene_action: sceneIdea,
      master_prompt_en: aiPromptResult?.prompt_en || '',
      master_prompt_pt: aiPromptResult?.prompt_pt || '',
    };

    const blob = new Blob([JSON.stringify(kitManifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kit-referencia-ia-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ABA 3: CARTAS FC 26
  const [packStudioPlayerId, setPackStudioPlayerId] = useState<string>(players[0]?.id || '');
  const [packStudioCardUrl, setPackStudioCardUrl] = useState<string>(
    '/assets/fc-26-clean-card-designs/toty.webp'
  );
  const packStudioPlayer = useMemo(
    () => players.find((p) => p.id === packStudioPlayerId) || players[0] || null,
    [players, packStudioPlayerId]
  );
  const packStudioTeam = useMemo(
    () => teams.find((t) => t.id === packStudioPlayer?.team_id) || teams[0],
    [teams, packStudioPlayer?.team_id]
  );

  // ABA 4: ZONA MISTA
  const [roleplayType, setRoleplayType] = useState<RoleplayType>('entrevista_pos_jogo');
  const [rpPlayerName, setRpPlayerName] = useState(players[0]?.character_name || 'CRAQUE');
  const [rpContext, setRpContext] = useState(
    'Partida disputada na rodada oficial do campeonato'
  );
  const [rpResult, setRpResult] = useState<RoleplayResult | null>(null);
  const [rpLoading, setRpLoading] = useState(false);

  const handleGenerateRoleplay = async () => {
    setRpLoading(true);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_roleplay',
          roleplayType,
          playerName: rpPlayerName,
          teamName: homeTeam?.name || 'Mandante',
          rivalName: awayTeam?.name || 'Visitante',
          scoreContext: `${homeScore} - ${awayScore}`,
          customContext: rpContext,
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

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* CABEÇALHO DO ESTÚDIO */}
        <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
              Estúdio Criativo • Formatos Oficiais & Cartas FC 26
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-black text-white">
              Banners Pós-Jogo (4:5, 9:16, 1:1), Cenas IA & Cartas FC 26
            </h1>
            <p className="text-xs text-zinc-400">
              Exporte artes em Retrato 4:5, Story 9:16 ou Quadrado 1:1 prontas para Instagram e WhatsApp.
            </p>
          </div>
        </section>

        {/* ABAS DO ESTÚDIO */}
        <div className="p-1.5 rounded-2xl bg-[#0A0A0A] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            { id: 'post_match_canvas', label: 'Banners Pós-Jogo', icon: ImageIcon },
            { id: 'ai_generator', label: 'Cena IA (Bonecos)', icon: Sparkles },
            { id: 'fc26_packs', label: 'Cartas FC 26 & Packs', icon: Gift },
            { id: 'roleplay', label: 'Zona Mista', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
                  active
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ABA 1: CANVAS PÓS-JOGO COM SELETOR DE FORMATOS */}
        {activeTab === 'post_match_canvas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-5">
              {/* PÍLULAS DE FORMATO */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Formato do Banner (Proporção)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {BANNER_FORMATS.map((fmt) => {
                    const active = bannerFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setBannerFormat(fmt.id)}
                        className={cn(
                          'p-3 rounded-2xl border text-left transition-all',
                          active
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-[#141414] text-zinc-300 border-white/10 hover:border-white/30'
                        )}
                      >
                        <span className="text-xs font-bold block">{fmt.label}</span>
                        <span
                          className={cn(
                            'text-[10px] font-mono block',
                            active ? 'text-zinc-700' : 'text-zinc-500'
                          )}
                        >
                          {fmt.sublabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Fundo Personalizado ({currentFormatConfig.sublabel})
                  </span>
                  <h2 className="text-sm font-display font-bold text-white">
                    Print da Comemoração ou Foto da Partida
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Suba a foto do jogo para preencher o fundo com o placar sobreposto.
                  </p>
                </div>

                <label className="cursor-pointer py-2.5 px-4 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all">
                  <Camera className="w-4 h-4" />
                  <span>Subir Foto de Fundo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {matches.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-zinc-400 block">
                    Puxar Dados de Partida da Rodada
                  </label>
                  <select
                    value={selectedMatchId}
                    onChange={(e) => handleSelectMatch(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-white"
                  >
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.home_team?.name || 'Mandante'} {m.home_score} - {m.away_score}{' '}
                        {m.away_team?.name || 'Visitante'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Time Mandante
                  </label>
                  <select
                    value={homeTeamId}
                    onChange={(e) => setHomeTeamId(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-white"
                  >
                    {teams.length === 0 && <option value="">Mandante</option>}
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Time Visitante
                  </label>
                  <select
                    value={awayTeamId}
                    onChange={(e) => setAwayTeamId(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-white"
                  >
                    {teams.length === 0 && <option value="">Visitante</option>}
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Gols Mandante
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={homeScore}
                    onChange={(e) => setHomeScore(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#141414] border border-white/10 text-sm font-mono font-black text-center text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Gols Visitante
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={awayScore}
                    onChange={(e) => setAwayScore(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#141414] border border-white/10 text-sm font-mono font-black text-center text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Selo da Liga
                  </label>
                  <input
                    type="text"
                    value={leagueBadgeLabel}
                    onChange={(e) => setLeagueBadgeLabel(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Gols Mandante (Nome + Qtd)
                  </label>
                  <textarea
                    rows={3}
                    value={homeScorersText}
                    onChange={(e) => setHomeScorersText(e.target.value)}
                    placeholder={'ATLETA 1'}
                    className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-mono font-bold uppercase text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Gols Visitante (Nome + Qtd)
                  </label>
                  <textarea
                    rows={3}
                    value={awayScorersText}
                    onChange={(e) => setAwayScorersText(e.target.value)}
                    placeholder={'ATLETA 1'}
                    className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-mono font-bold uppercase text-white"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-white">
                    Cenários de Estádio Noturno
                  </span>
                  {players.length > 0 && (
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFeaturedPlayerOverlay}
                        onChange={(e) => setShowFeaturedPlayerOverlay(e.target.checked)}
                        className="rounded accent-white"
                      />
                      Sobrepor Craque da Partida
                    </label>
                  )}
                </div>

                {showFeaturedPlayerOverlay && players.length > 0 && (
                  <div className="pb-1">
                    <select
                      value={featuredPlayerId}
                      onChange={(e) => setFeaturedPlayerId(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-white"
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          Craque: {p.character_name} ({p.primary_position})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {TEMPLATE_ASSETS.postGameBackgrounds.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setBackgroundUrl(tpl.url)}
                      className={cn(
                        'p-1.5 rounded-2xl border text-center transition-all overflow-hidden',
                        backgroundUrl === tpl.url
                          ? 'border-white bg-[#141414]'
                          : 'border-white/10 bg-black'
                      )}
                    >
                      <img
                        src={tpl.url}
                        alt={tpl.name}
                        className="w-full h-16 object-cover rounded-xl mb-1"
                      />
                      <span className="text-[10px] font-bold block truncate text-zinc-300">
                        {tpl.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: PREVIEW AO VIVO + DOWNLOAD */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4 lg:sticky lg:top-20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Renderização em Tempo Real
                  </span>
                  <span className="text-sm font-display font-black text-white">
                    Preview {currentFormatConfig.label} ({currentFormatConfig.sublabel})
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[10px] font-bold">
                  {bannerFormat}
                </span>
              </div>

              <div
                className={cn(
                  'w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl mx-auto',
                  bannerFormat === '4:5' && 'aspect-4/5',
                  bannerFormat === '9:16' && 'aspect-9/16 max-w-[320px]',
                  bannerFormat === '1:1' && 'aspect-square'
                )}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block"
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadBannerPng}
                disabled={isExporting}
                className="w-full py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting
                    ? `Exportando PNG ${currentFormatConfig.sublabel}...`
                    : `Baixar Arte (${currentFormatConfig.label} PNG)`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: SELETOR REAL DE PERSONAGENS & UNIFORMES (GERADOR IA) */}
        {activeTab === 'ai_generator' && (
          <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Gemini 2.5 Multimodal
              </span>
              <h2 className="text-base font-display font-black text-white">
                Gerador de Cenas com Personagens & Uniformes dos Clubes
              </h2>
              <p className="text-xs text-zinc-400">
                Selecione os clubes e marque os atletas do elenco para gerar o prompt multimodal hiper-realista.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 block">
                  Clube Principal da Cena
                </label>
                <select
                  value={aiHomeTeamId}
                  onChange={(e) => setAiHomeTeamId(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl bg-black border border-white/10 text-xs font-bold text-white"
                >
                  {teams.length === 0 && <option value="">Nenhum clube cadastrado</option>}
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400 block">
                  Clube Adversário (Opcional)
                </label>
                <select
                  value={aiAwayTeamId}
                  onChange={(e) => setAiAwayTeamId(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl bg-black border border-white/10 text-xs font-bold text-white"
                >
                  {teams.length === 0 && <option value="">Nenhum clube cadastrado</option>}
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {sceneAvailablePlayers.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">
                  Selecionar Personagens da Cena ({selectedCharacterIds.length} marcados)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {sceneAvailablePlayers.map((player) => {
                    const isChecked = selectedCharacterIds.includes(player.id);
                    const pTeam = teams.find((t) => t.id === player.team_id);
                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => toggleCharacterInScene(player.id)}
                        className={cn(
                          'p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5',
                          isChecked
                            ? 'border-white bg-[#141414]'
                            : 'border-white/[0.06] bg-black'
                        )}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#141414] overflow-hidden shrink-0 border border-white/10">
                          <img
                            src={player.avatar_face_url || TEMPLATE_ASSETS.avatarPlaceholder}
                            alt={player.character_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate uppercase">
                              {player.character_name}
                            </span>
                            {isChecked && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                          </div>
                          <span className="text-[10px] text-zinc-400 block truncate">
                            {player.primary_position} • {pTeam?.name || 'Free Agent'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Descreva a Ação da Cena Pós-Jogo
              </label>
              <textarea
                rows={2}
                value={sceneIdea}
                onChange={(e) => setSceneIdea(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#141414] border border-white/10 text-xs font-medium text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleGenerateMultimodalScene}
                disabled={aiLoading}
                className="flex-1 py-3 px-4 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {aiLoading
                    ? 'Processando cena no Gemini...'
                    : 'Gerar Cena 8K (Gemini Multimodal)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReferenceKit}
                className="py-3 px-4 rounded-full bg-[#141414] hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Baixar Kit de Referência</span>
              </button>
            </div>

            {aiPromptResult && (
              <div className="p-4 rounded-2xl bg-[#141414] border border-white/15 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">
                    Prompt Mestre 8K Gerado
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiPromptResult.prompt_en);
                      setCopiedPrompt(true);
                      setTimeout(() => setCopiedPrompt(false), 3000);
                    }}
                    className="px-3 py-1 rounded-full bg-white text-black font-bold text-[11px] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedPrompt ? 'Copiado!' : 'Copiar Prompt'}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-300 font-mono bg-black p-3 rounded-xl border border-white/10">
                  {aiPromptResult.prompt_en}
                </p>

                <div className="flex flex-wrap gap-2">
                  {aiPromptResult.external_generators.map((gen) => (
                    <a
                      key={gen.name}
                      href={gen.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-black border border-white/10 text-xs font-bold flex items-center gap-1.5 hover:border-white/30"
                    >
                      <span>{gen.name}</span>
                      <span className="text-[10px] text-zinc-400">({gen.badge})</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ABA 3: ESTÚDIO DE CARTAS FC 26 & PACK OPENER */}
        {activeTab === 'fc26_packs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] flex flex-col items-center space-y-4">
              {players.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm font-bold text-white">
                    Nenhum atleta cadastrado ainda
                  </p>
                  <p className="text-xs text-zinc-400">
                    Crie sua conta e cadastre seu personagem para personalizar sua Carta FC 26.
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-full">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Selecionar Atleta da Liga
                    </label>
                    <select
                      value={packStudioPlayerId}
                      onChange={(e) => setPackStudioPlayerId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-white"
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.character_name} ({p.primary_position} • OVR {p.overall})
                        </option>
                      ))}
                    </select>
                  </div>

                  {packStudioPlayer && (
                    <>
                      <FC26PlayerCard
                        player={packStudioPlayer}
                        team={packStudioTeam}
                        cardDesignUrl={packStudioCardUrl}
                        size="lg"
                        showActions={true}
                      />

                      <FC26PackOpener
                        player={packStudioPlayer}
                        team={packStudioTeam}
                        onEquipCardDesign={(url, id) => {
                          setPackStudioCardUrl(url);
                          unlockPlayerCardDesign(packStudioPlayer.id, id, url);
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </div>

            <div className="lg:col-span-7 p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Catálogo Oficial EA FC 26 Ultimate Team
                </span>
                <h2 className="text-base font-display font-black text-white">
                  Escolha o Design da Carta ({CARD_DESIGN_ASSETS.length} Modelos Oficiais)
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CARD_DESIGN_ASSETS.map((design) => (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => setPackStudioCardUrl(design.url)}
                    className={cn(
                      'p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5',
                      packStudioCardUrl === design.url
                        ? 'border-white bg-[#141414]'
                        : 'border-white/[0.06] bg-black hover:border-white/25'
                    )}
                  >
                    <img
                      src={design.url}
                      alt={design.name}
                      className="w-20 h-28 object-contain drop-shadow-md"
                    />
                    <span className="text-xs font-bold text-white truncate w-full">
                      {design.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">
                      {design.rarity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: ZONA MISTA & COMUNICADOS */}
        {activeTab === 'roleplay' && (
          <section className="p-5 sm:p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.08] space-y-4">
            <div>
              <h2 className="text-base font-display font-black text-white">
                Zona Mista & Comunicados da Diretoria
              </h2>
              <p className="text-xs text-zinc-400">
                Gere entrevistas pós-jogo, notas oficiais e provocações para o grupo da Liga.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                  Tipo de Publicação
                </label>
                <select
                  value={roleplayType}
                  onChange={(e) => setRoleplayType(e.target.value as RoleplayType)}
                  className="w-full h-10 px-3 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-white"
                >
                  <option value="entrevista_pos_jogo">Entrevista Pós-Jogo (Craque)</option>
                  <option value="nota_oficial_clube">Comunicado Oficial do Clube</option>
                  <option value="provocacao_rival">Clima de Clássico / Provocação</option>
                  <option value="anuncio_contratacao">Anúncio de Contratação (Draft)</option>
                  <option value="nota_repudio">Nota de Repúdio</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                  Personagem em Destaque
                </label>
                <input
                  type="text"
                  value={rpPlayerName}
                  onChange={(e) => setRpPlayerName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold uppercase text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Contexto da Partida
              </label>
              <input
                type="text"
                value={rpContext}
                onChange={(e) => setRpContext(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#141414] border border-white/10 text-xs font-medium text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateRoleplay}
              disabled={rpLoading}
              className="w-full py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{rpLoading ? 'Redigindo...' : 'Gerar Texto para WhatsApp & Instagram'}</span>
            </button>

            {rpResult && (
              <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rpResult.title}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(rpResult.whatsapp_text)}
                    className="px-3 py-1 rounded-full bg-white text-black text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copiar WhatsApp
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-zinc-200 font-sans bg-black p-3 rounded-xl border border-white/10">
                  {rpResult.whatsapp_text}
                </pre>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
