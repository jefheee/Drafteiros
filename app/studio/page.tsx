'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLeagueStore, uploadMediaToStorage } from '@/lib/data-store';
import { TEMPLATE_ASSETS, CARD_DESIGN_ASSETS } from '@/lib/assets-catalog';
import { RoleplayType, RoleplayResult, CharacterPromptResult } from '@/lib/gemini';
import { FC26PlayerCard, FC26PackOpener } from '@/components/players/fc26-player-card';
import { cn } from '@/lib/utils';
import { GlideSelect, HoloCard, LatticeLoader, ClickSpark, RefineFrame } from '@/components/react-bits';
import {
  Sparkles,
  Download,
  Upload,
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

export default function MediaStudioPage() {
  const { teams, players, matches, tournament, unlockPlayerCardDesign } = useLeagueStore();

  const [activeTab, setActiveTab] = useState<
    'post_match_canvas' | 'ai_generator' | 'fc26_packs' | 'roleplay'
  >('post_match_canvas');

  // =========================================================================
  // ESTADO ABA 1: CANVAS 4:5 PÓS-JOGO (ESTÁDIO NOTURNO / FOTO DA PARTIDA)
  // PROIBIDO USAR CARTAS FC 26 COMO FUNDO DE BANNER!
  // =========================================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches[0]?.id || 'match-furia-catimba'
  );

  const [homeTeamId, setHomeTeamId] = useState<string>(teams[0]?.id || 'b3333333-3333-3333-3333-333333333333');
  const [awayTeamId, setAwayTeamId] = useState<string>(teams[1]?.id || 'b1111111-1111-1111-1111-111111111111');
  const [homeScore, setHomeScore] = useState<number>(2);
  const [awayScore, setAwayScore] = useState<number>(7);
  const [leagueBadgeLabel, setLeagueBadgeLabel] = useState<string>('LPF • EA FC 26');

  const [homeScorersText, setHomeScorersText] = useState<string>('JEFHE 1\nMIGUEL 1');
  const [awayScorersText, setAwayScorersText] = useState<string>(
    'HAALANDINHO 5\nJOAO VINY 1\nTETEU 1'
  );

  const [backgroundUrl, setBackgroundUrl] = useState<string>(
    TEMPLATE_ASSETS.postGameBackgrounds[0].url
  );
  const [featuredPlayerId, setFeaturedPlayerId] = useState<string>(players[0]?.id || '');
  const [showFeaturedPlayerOverlay, setShowFeaturedPlayerOverlay] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState(false);

  const homeTeam = useMemo(
    () => teams.find((t) => t.id === homeTeamId) || teams[0],
    [teams, homeTeamId]
  );
  const awayTeam = useMemo(
    () => teams.find((t) => t.id === awayTeamId) || teams[1] || teams[0],
    [teams, awayTeamId]
  );
  const featuredPlayer = useMemo(
    () => players.find((p) => p.id === featuredPlayerId) || players[0],
    [players, featuredPlayerId]
  );

  // Sincroniza quando escolhe uma partida real da lista
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

  // Renderização Canvas 1080x1350 (4:5 Full-Bleed Estádio Noturno + Luzes + Placar Limpo)
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
      const W = 1080;
      const H = 1350;
      canvas!.width = W;
      canvas!.height = H;

      // 1. Base Atmosférica de Estádio Noturno (Obsidian Pitch)
      const baseGrad = ctx!.createLinearGradient(0, 0, 0, H);
      baseGrad.addColorStop(0, '#0a0f1d');
      baseGrad.addColorStop(0.55, '#111b2e');
      baseGrad.addColorStop(1, '#06080c');
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

      // Feixes atmosféricos de refletores de estádio no topo
      const leftSpotlight = ctx!.createRadialGradient(180, 90, 10, 180, 90, 520);
      leftSpotlight.addColorStop(0, 'rgba(124, 92, 252, 0.28)');
      leftSpotlight.addColorStop(1, 'rgba(124, 92, 252, 0)');
      ctx!.fillStyle = leftSpotlight;
      ctx!.fillRect(0, 0, W, H);

      const rightSpotlight = ctx!.createRadialGradient(W - 180, 90, 10, W - 180, 90, 520);
      rightSpotlight.addColorStop(0, 'rgba(56, 201, 88, 0.22)');
      rightSpotlight.addColorStop(1, 'rgba(56, 201, 88, 0)');
      ctx!.fillStyle = rightSpotlight;
      ctx!.fillRect(0, 0, W, H);

      // Opcional: Sobrepor foto de destaque do Craque da Partida no centro superior
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

      // Vinheta sutil no topo
      const topVignette = ctx!.createLinearGradient(0, 0, 0, 220);
      topVignette.addColorStop(0, 'rgba(6,8,12,0.55)');
      topVignette.addColorStop(1, 'rgba(6,8,12,0)');
      ctx!.fillStyle = topVignette;
      ctx!.fillRect(0, 0, W, 220);

      // 2. Degradê Inferior Escuro (38% inferiores da arte: 830px -> 1350px)
      const bottomGradStart = Math.floor(H * 0.54);
      const bottomGrad = ctx!.createLinearGradient(0, bottomGradStart, 0, H);
      bottomGrad.addColorStop(0, 'rgba(8, 10, 15, 0)');
      bottomGrad.addColorStop(0.38, 'rgba(8, 10, 15, 0.90)');
      bottomGrad.addColorStop(0.72, 'rgba(6, 8, 12, 0.97)');
      bottomGrad.addColorStop(1, '#06080C');
      ctx!.fillStyle = bottomGrad;
      ctx!.fillRect(0, bottomGradStart, W, H - bottomGradStart);

      // Carrega escudos dos times
      const [homeLogoImg, awayLogoImg] = await Promise.all([
        loadImage(homeTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder),
        loadImage(awayTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder),
      ]);
      if (isCancelled) return;

      // 3. BLOCO DE PLACAR HORIZONTAL (Y = 890)
      const blockY = 890;
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
        ctx!.fillStyle = '#0D1017';
        ctx!.fill();
        ctx!.clip();

        ctx!.fillStyle = primaryColor || '#38BDF8';
        ctx!.beginPath();
        ctx!.moveTo(x + boxSize * 0.42, y - 20);
        ctx!.lineTo(x + boxSize + 20, y - 20);
        ctx!.lineTo(x + boxSize * 0.58, y + boxSize + 20);
        ctx!.lineTo(x - 10, y + boxSize + 20);
        ctx!.closePath();
        ctx!.fill();

        ctx!.fillStyle = secondaryColor || '#FFFFFF';
        ctx!.globalAlpha = 0.28;
        ctx!.beginPath();
        ctx!.moveTo(x + boxSize * 0.25, y - 20);
        ctx!.lineTo(x + boxSize * 0.36, y - 20);
        ctx!.lineTo(x - 4, y + boxSize + 20);
        ctx!.lineTo(x - 18, y + boxSize + 20);
        ctx!.closePath();
        ctx!.fill();
        ctx!.globalAlpha = 1;

        const innerRadial = ctx!.createRadialGradient(
          x + boxSize / 2,
          y + boxSize / 2,
          20,
          x + boxSize / 2,
          y + boxSize / 2,
          boxSize * 0.65
        );
        innerRadial.addColorStop(0, 'rgba(13,16,23,0.15)');
        innerRadial.addColorStop(1, 'rgba(6,8,12,0.68)');
        ctx!.fillStyle = innerRadial;
        ctx!.fillRect(x, y, boxSize, boxSize);

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
        homeTeam?.primary_color || '#38BDF8',
        homeTeam?.secondary_color || '#FFFFFF',
        homeTeam?.name || 'Furia del Plata',
        homeLogoImg
      );

      drawTeamCrestSquare(
        rightBoxX,
        blockY,
        awayTeam?.primary_color || '#F59E0B',
        awayTeam?.secondary_color || '#111827',
        awayTeam?.name || 'La Catimba',
        awayLogoImg
      );

      const centerX = W / 2;

      // Pílula Selo da Liga
      ctx!.save();
      const badgeW = 240;
      const badgeH = 38;
      drawRoundRect(ctx!, centerX - badgeW / 2, blockY - 8, badgeW, badgeH, 19);
      ctx!.fillStyle = 'rgba(124, 92, 252, 0.22)';
      ctx!.fill();
      ctx!.strokeStyle = 'rgba(124, 92, 252, 0.5)';
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      ctx!.fillStyle = '#FFFFFF';
      ctx!.font = '800 18px "Plus Jakarta Sans", Inter, sans-serif';
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(leagueBadgeLabel.toUpperCase(), centerX, blockY + 11);
      ctx!.restore();

      // Placar Gigante em Tipografia Condensada Branca ("2 - 7")
      ctx!.save();
      ctx!.fillStyle = '#FFFFFF';
      ctx!.shadowColor = 'rgba(0,0,0,0.65)';
      ctx!.shadowBlur = 24;
      ctx!.font = '900 124px "Plus Jakarta Sans", Impact, sans-serif';
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(`${homeScore}  -  ${awayScore}`, centerX, blockY + 98);
      ctx!.restore();

      // Nomes dos dois clubes logo abaixo do placar
      ctx!.save();
      ctx!.fillStyle = '#FFFFFF';
      ctx!.font = '800 22px "Plus Jakarta Sans", Inter, sans-serif';
      ctx!.textAlign = 'center';
      const matchupLabel = `${(homeTeam?.name || 'FURIA DEL PLATA').toUpperCase()}   •   ${(
        awayTeam?.name || 'LA CATIMBA'
      ).toUpperCase()}`;
      ctx!.fillText(matchupLabel, centerX, blockY + 172);
      ctx!.restore();

      // Linha divisória fina elegante
      ctx!.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(86, blockY + 205);
      ctx!.lineTo(W - 86, blockY + 205);
      ctx!.stroke();

      // 4. RODAPÉ DE ARTILHEIROS DA PARTIDA (DUAS COLUNAS USANDO CHARACTER_NAME)
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
        ctx!.fillText(`${item.characterName}  ${item.goals} ⚽`, centerX - 36, yPos);
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
        ctx!.fillText(`⚽ ${item.goals}  ${item.characterName}`, centerX + 36, yPos);
      });
      ctx!.restore();
    }

    renderBanner();

    return () => {
      isCancelled = true;
    };
  }, [
    activeTab,
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
      link.download = `pos-jogo-${(homeTeam?.name || 'home')
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

  // =========================================================================
  // ESTADO ABA 2: SELETOR REAL DE PERSONAGENS & UNIFORMES (GERADOR IA)
  // =========================================================================
  const [aiHomeTeamId, setAiHomeTeamId] = useState<string>(teams[0]?.id || 'b3333333-3333-3333-3333-333333333333');
  const [aiAwayTeamId, setAiAwayTeamId] = useState<string>(teams[1]?.id || 'b1111111-1111-1111-1111-111111111111');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(() =>
    players.slice(0, 3).map((p) => p.id)
  );
  const [sceneIdea, setSceneIdea] = useState<string>(
    'JEFHE e MIGUEL comemorando gol na chuva abraçados, enquanto HAALANDINHO do La Catimba observa ao fundo no estádio lotado'
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPromptResult, setAiPromptResult] = useState<CharacterPromptResult | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const aiHomeTeam = useMemo(
    () => teams.find((t) => t.id === aiHomeTeamId) || teams[0],
    [teams, aiHomeTeamId]
  );
  const aiAwayTeam = useMemo(
    () => teams.find((t) => t.id === aiAwayTeamId) || teams[1] || teams[0],
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
          playerName: charNames || 'JEFHE, MIGUEL',
          teamName: `${aiHomeTeam?.name || 'Furia del Plata'} vs ${
            aiAwayTeam?.name || 'La Catimba'
          }`,
          primaryColor: aiHomeTeam?.primary_color || '#38BDF8',
          secondaryColor: aiHomeTeam?.secondary_color || '#FFFFFF',
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
      league: tournament.name,
      home_team: {
        name: aiHomeTeam?.name,
        primary_color: aiHomeTeam?.primary_color,
        secondary_color: aiHomeTeam?.secondary_color,
        crest_url: aiHomeTeam?.logo_url,
        kit_home_url: aiHomeTeam?.kit_home_url,
        kit_description: aiHomeTeam?.kit_description,
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
        shirt_number: p.visual_traits?.shirt_number || 10,
        height_cm: p.height_cm,
        weight_kg: p.weight_kg,
        avatar_face_url: p.avatar_face_url,
        avatar_body_url: p.avatar_body_url,
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

  // =========================================================================
  // ESTADO ABA 3: ESTÚDIO DE CARTAS FC 26 & PACK OPENER
  // =========================================================================
  const [packStudioPlayerId, setPackStudioPlayerId] = useState<string>(players[0]?.id || '');
  const [packStudioCardUrl, setPackStudioCardUrl] = useState<string>(
    '/assets/fc-26-clean-card-designs/toty.webp'
  );
  const packStudioPlayer = useMemo(
    () => players.find((p) => p.id === packStudioPlayerId) || players[0],
    [players, packStudioPlayerId]
  );
  const packStudioTeam = useMemo(
    () => teams.find((t) => t.id === packStudioPlayer?.team_id) || teams[0],
    [teams, packStudioPlayer?.team_id]
  );

  // =========================================================================
  // ESTADO ABA 4: ZONA MISTA & COMUNICADOS (ROLEPLAY)
  // =========================================================================
  const [roleplayType, setRoleplayType] = useState<RoleplayType>('entrevista_pos_jogo');
  const [rpPlayerName, setRpPlayerName] = useState('HAALANDINHO');
  const [rpContext, setRpContext] = useState(
    '5 gols marcados na vitória por 7 a 2 do La Catimba sobre o Furia del Plata'
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
          teamName: homeTeam?.name || 'Furia del Plata',
          rivalName: awayTeam?.name || 'La Catimba',
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
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] px-3 sm:px-6 py-4 pb-28 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-5">
        {/* CABEÇALHO DO ESTÚDIO (STITCH REDESIGN) */}
        <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 text-[#00E599] text-[10px] font-extrabold uppercase tracking-wider">
              Pilar 4 • Estúdio 4:5 & Packs FC 26
            </span>
            <h1 className="text-xl sm:text-2xl font-display font-black text-white">
              Estúdio Criativo Pós-Jogo, Cenas IA & Walkout FC 26
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Banners 4:5 (1080x1350) com cenários de estádio noturno, subida de fotos da partida e Gerador Oficial de Cartas EA FC 26.
            </p>
          </div>
        </section>

        {/* ABAS DO ESTÚDIO (4 MODOS) */}
        <div className="p-1.5 rounded-2xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('post_match_canvas')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'post_match_canvas'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">Banner Pós-Jogo 4:5</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_generator')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'ai_generator'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">Cena IA (Bonecos)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fc26_packs')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'fc26_packs'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Gift className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">Cartas FC 26 & Packs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roleplay')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'roleplay'
                ? 'bg-gradient-to-r from-[#00E599] to-[#059669] text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Zona Mista</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* ABA 1: CANVAS 4:5 PÓS-JOGO (LAYOUT STITCH 2 COLUNAS DESKTOP)      */}
        {/* ================================================================= */}
        {activeTab === 'post_match_canvas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUNA ESQUERDA (7 COLUNAS): CONTROLES DO PLACAR & FUNDO DE ESTÁDIO */}
            <div className="lg:col-span-7 p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-5">
              {/* Botão Principal de Upload de Foto da Partida / Imagem Gerada pela IA */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00E599]/15 via-emerald-950/20 to-black/30 border border-[#00E599]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38C958] block">
                    Fundo Personalizado 1080x1350
                  </span>
                  <h2 className="text-sm font-display font-black text-white">
                    Print da Comemoração ou Imagem Gerada pela IA
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Suba a foto da partida para preencher 100% do fundo 4:5 com o placar oficial sobreposto.
                  </p>
                </div>

                <label className="cursor-pointer py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#059669] text-white font-display font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00E599]/20 shrink-0 hover:opacity-95 transition-all">
                  <Camera className="w-4 h-4" />
                  <span>📸 Subir Foto da Partida / Imagem IA</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-[#00E599] block">
                  Puxar Dados de Partida da Rodada
                </label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => handleSelectMatch(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.home_team?.name || 'Mandante'} {m.home_score} - {m.away_score}{' '}
                      {m.away_team?.name || 'Visitante'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção Mandante x Visitante e Placar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                    Time Mandante
                  </label>
                  <select
                    value={homeTeamId}
                    onChange={(e) => setHomeTeamId(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-bold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                    Time Visitante
                  </label>
                  <select
                    value={awayTeamId}
                    onChange={(e) => setAwayTeamId(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-bold"
                  >
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
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                    Gols Mandante
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={homeScore}
                    onChange={(e) => setHomeScore(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-sm font-mono font-black text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                    Gols Visitante
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={awayScore}
                    onChange={(e) => setAwayScore(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-sm font-mono font-black text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                    Selo da Liga
                  </label>
                  <input
                    type="text"
                    value={leagueBadgeLabel}
                    onChange={(e) => setLeagueBadgeLabel(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                  />
                </div>
              </div>

              {/* Artilheiros das Duas Equipes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#00E599] block mb-1">
                    Gols Mandante (Nome + Qtd)
                  </label>
                  <textarea
                    rows={3}
                    value={homeScorersText}
                    onChange={(e) => setHomeScorersText(e.target.value)}
                    placeholder={'JEFHE 1\nMIGUEL 1'}
                    className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-extrabold uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#38C958] block mb-1">
                    Gols Visitante (Nome + Qtd)
                  </label>
                  <textarea
                    rows={3}
                    value={awayScorersText}
                    onChange={(e) => setAwayScorersText(e.target.value)}
                    placeholder={'HAALANDINHO 5\nJOAO VINY 1\nTETEU 1'}
                    className="w-full p-2.5 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-mono font-extrabold uppercase"
                  />
                </div>
              </div>

              {/* Presets de Cenários de Estádio Noturno (Sem Cartas FC 26!) */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-white/[0.07]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-extrabold text-white">
                    Cenários de Estádio Noturno / Gramado Iluminado
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#00E599] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFeaturedPlayerOverlay}
                      onChange={(e) => setShowFeaturedPlayerOverlay(e.target.checked)}
                      className="rounded accent-[#00E599]"
                    />
                    Sobrepor Craque da Partida no Centro
                  </label>
                </div>

                {showFeaturedPlayerOverlay && (
                  <div className="pb-1">
                    <select
                      value={featuredPlayerId}
                      onChange={(e) => setFeaturedPlayerId(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          Craque em Destaque: {p.character_name} ({p.primary_position})
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
                          ? 'border-[#00E599] bg-[#00E599]/15 border border-[#00E599]/30 shadow-sm'
                          : 'border-zinc-200 dark:border-white/10 bg-white/[0.03]/60'
                      )}
                    >
                      <img
                        src={tpl.url}
                        alt={tpl.name}
                        className="w-full h-16 object-cover rounded-xl mb-1"
                      />
                      <span className="text-[10px] font-extrabold block truncate">
                        {tpl.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA (5 COLUNAS): PREVIEW AO VIVO 4:5 + DOWNLOAD */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-xl space-y-4 lg:sticky lg:top-20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00E599] block">
                    Renderização em Tempo Real
                  </span>
                  <span className="text-sm font-display font-black text-white">
                    Preview Oficial 4:5 (1080x1350)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#38C958]/15 text-[#38C958] text-[10px] font-extrabold">
                  Estádio Full-Bleed
                </span>
              </div>

              <div className="w-full aspect-4/5 rounded-2xl overflow-hidden bg-[#0c0e12] border border-white/10 shadow-2xl">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain block"
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadBannerPng}
                disabled={isExporting}
                className="w-full py-3.5 rounded-2xl bg-[#38C958] hover:bg-[#2fb34d] text-white font-display font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#38C958]/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting
                    ? 'Exportando PNG 1080x1350...'
                    : 'Baixar Arte Pós-Jogo 4:5 (1080x1350 PNG)'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 2: SELETOR REAL DE PERSONAGENS & UNIFORMES (GERADOR IA)       */}
        {/* ================================================================= */}
        {activeTab === 'ai_generator' && (
          <div className="space-y-4">
            <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00E599] block">
                  Fidelidade Total • Gemini 2.5 Flash Multimodal
                </span>
                <h2 className="text-base font-display font-extrabold text-white">
                  Seletor Real de Personagens (Rosto + Corpo) & Uniformes dos Clubes
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Selecione os clubes e marque quais personagens do elenco vão aparecer na arte. A IA recebe as fotos reais de rosto, corpo inteiro e camisas salvas no banco.
                </p>
              </div>

              {/* PASSO 1: Selecionar Times */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-zinc-200/70 dark:border-white/10 space-y-2.5">
                  <label className="text-[10px] font-extrabold uppercase text-[#00E599] block">
                    Passo 1A • Clube Principal da Cena
                  </label>
                  <select
                    value={aiHomeTeamId}
                    onChange={(e) => setAiHomeTeamId(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2.5 pt-1">
                    <img
                      src={aiHomeTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder}
                      alt={aiHomeTeam?.name}
                      className="w-10 h-10 object-contain drop-shadow-md shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold block truncate">
                        Uniforme: {aiHomeTeam?.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block line-clamp-1">
                        {aiHomeTeam?.kit_description || 'Camisa oficial limpa sem patrocinadores'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-zinc-200/70 dark:border-white/10 space-y-2.5">
                  <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block">
                    Passo 1B • Clube Adversário (Opcional)
                  </label>
                  <select
                    value={aiAwayTeamId}
                    onChange={(e) => setAiAwayTeamId(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2.5 pt-1">
                    <img
                      src={aiAwayTeam?.logo_url || TEMPLATE_ASSETS.crestPlaceholder}
                      alt={aiAwayTeam?.name}
                      className="w-10 h-10 object-contain drop-shadow-md shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold block truncate">
                        Uniforme: {aiAwayTeam?.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block line-clamp-1">
                        {aiAwayTeam?.kit_description || 'Camisa oficial limpa sem patrocinadores'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PASSO 2: Multi-Seleção dos Personagens do Elenco */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">
                    Passo 2 • Selecionar Personagens da Cena ({selectedCharacterIds.length} marcados)
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Toque nos atletas para incluir Rosto + Corpo Inteiro
                  </span>
                </div>

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
                            ? 'border-[#00E599] bg-[#00E599]/15 border border-[#00E599]/30 shadow-xs'
                            : 'border-transparent bg-white/[0.03]/60'
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#0c0e12] overflow-hidden shrink-0 border border-white/10">
                          <img
                            src={
                              player.avatar_face_url ||
                              TEMPLATE_ASSETS.avatarPlaceholder
                            }
                            alt={player.character_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-white truncate uppercase">
                              {player.character_name}
                            </span>
                            {isChecked && (
                              <Check className="w-3.5 h-3.5 text-[#00E599] shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                            {player.primary_position} • {pTeam?.name}
                          </span>
                          <span className="text-[9px] text-[#38C958] font-bold block">
                            📸 Rosto + 🧍 Corpo OK
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASSO 3: Descrever a Ação da Cena */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-white block">
                  Passo 3 • Descreva a Ação da Cena Pós-Jogo
                </label>
                <textarea
                  rows={2}
                  value={sceneIdea}
                  onChange={(e) => setSceneIdea(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-semibold"
                />
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleGenerateMultimodalScene}
                  disabled={aiLoading}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#059669] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {aiLoading
                      ? 'Processando Rosto + Corpo + Uniforme no Gemini 2.5...'
                      : 'Gerar Cena Hiper-Realista 8K (Gemini Multimodal)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReferenceKit}
                  className="py-3 px-4 rounded-2xl bg-white/[0.03] hover:bg-zinc-200/70 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-white/10"
                >
                  <PackageCheck className="w-4 h-4 text-[#38C958]" />
                  <span>📦 Baixar Kit de Referência</span>
                </button>
              </div>

              {aiPromptResult && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#00E599]/30 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#00E599]">
                      Prompt Mestre 8K Gerado com as Fotos do Elenco
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(aiPromptResult.prompt_en);
                        setCopiedPrompt(true);
                        setTimeout(() => setCopiedPrompt(false), 3000);
                      }}
                      className="px-3 py-1 rounded-full bg-[#00E599] text-[#090A0F] font-black text-[11px] font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedPrompt ? 'Copiado!' : 'Copiar Prompt 8K'}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-mono bg-[#0D0F17] p-3 rounded-xl border border-zinc-200 dark:border-white/10">
                    {aiPromptResult.prompt_en}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {aiPromptResult.external_generators.map((gen) => (
                      <a
                        key={gen.name}
                        href={gen.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#0D0F17] border border-zinc-200 dark:border-white/10 text-xs font-bold flex items-center gap-1.5 hover:border-[#00E599]"
                      >
                        <span>{gen.name}</span>
                        <span className="text-[10px] text-[#38C958] font-extrabold">
                          ({gen.badge})
                        </span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 3: ESTÚDIO DE CARTAS FC 26 & PACK OPENER                      */}
        {/* ================================================================= */}
        {activeTab === 'fc26_packs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-xl flex flex-col items-center space-y-4">
              <div className="w-full">
                <label className="text-[10px] font-extrabold uppercase text-[#00E599] block mb-1">
                  Selecionar Atleta da Liga para Gerar Carta FC 26
                </label>
                <select
                  value={packStudioPlayerId}
                  onChange={(e) => setPackStudioPlayerId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.character_name} ({p.primary_position} • OVR {p.overall})
                    </option>
                  ))}
                </select>
              </div>

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
                  if (packStudioPlayer) {
                    unlockPlayerCardDesign(packStudioPlayer.id, id, url);
                  }
                }}
              />
            </div>

            <div className="lg:col-span-7 p-5 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                  Catálogo Oficial EA FC 26 Ultimate Team
                </span>
                <h2 className="text-base font-display font-black text-white">
                  Escolha o Design da Carta ({CARD_DESIGN_ASSETS.length} Modelos Oficiais)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  As cartas abaixo são exclusivas para o gerador de cartas de atletas e nunca aparecem como fundo de placar pós-jogo.
                </p>
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
                        ? 'border-[#00E599] bg-[#00E599]/15 border border-[#00E599]/30 shadow-md'
                        : 'border-zinc-200/70 dark:border-white/[0.07] bg-white/[0.03]/60 hover:border-[#00E599]/40'
                    )}
                  >
                    <img
                      src={design.url}
                      alt={design.name}
                      className="w-20 h-28 object-contain drop-shadow-md"
                    />
                    <span className="text-xs font-extrabold text-white truncate w-full">
                      {design.name}
                    </span>
                    <span className="text-[9px] text-zinc-400 uppercase font-bold">
                      {design.rarity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ABA 4: ZONA MISTA & COMUNICADOS OFICIAIS                          */}
        {/* ================================================================= */}
        {activeTab === 'roleplay' && (
          <section className="p-4 sm:p-6 rounded-3xl bg-[#0D0F17] border border-zinc-200/80 dark:border-white/[0.07] shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-display font-extrabold text-white">
                Zona Mista & Comunicados da Diretoria
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Gere entrevistas pós-jogo, notas oficiais e provocações para o grupo da Liga com o Nome do Personagem.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Tipo de Publicação
                </label>
                <select
                  value={roleplayType}
                  onChange={(e) => setRoleplayType(e.target.value as RoleplayType)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold"
                >
                  <option value="entrevista_pos_jogo">🎙️ Entrevista Pós-Jogo (Craque)</option>
                  <option value="nota_oficial_clube">📋 Comunicado Oficial do Clube</option>
                  <option value="provocacao_rival">🔥 Clima de Clássico / Provocação</option>
                  <option value="anuncio_contratacao">✍️ Anúncio de Contratação (Draft)</option>
                  <option value="nota_repudio">🚨 Nota de Repúdio</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Personagem em Destaque
                </label>
                <input
                  type="text"
                  value={rpPlayerName}
                  onChange={(e) => setRpPlayerName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-extrabold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                Contexto da Partida
              </label>
              <input
                type="text"
                value={rpContext}
                onChange={(e) => setRpContext(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs font-semibold"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateRoleplay}
              disabled={rpLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#059669] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{rpLoading ? 'Redigindo...' : 'Gerar Texto para WhatsApp & Instagram'}</span>
            </button>

            {rpResult && (
              <div className="p-4 rounded-2xl bg-white/[0.03] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#00E599]">{rpResult.title}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(rpResult.whatsapp_text)}
                    className="px-3 py-1 rounded-full bg-[#38C958] text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copiar WhatsApp
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-zinc-700 dark:text-zinc-200 font-sans bg-[#0D0F17] p-3 rounded-xl border border-zinc-200 dark:border-white/10">
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
