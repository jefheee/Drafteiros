'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FALLBACK_MATCHES,
  FALLBACK_TEAMS,
  FALLBACK_PLAYERS,
} from '@/lib/mock-league-data';
import { RoleplayType, RoleplayResult, CharacterPromptResult } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Upload,
  Wand2,
  ExternalLink,
  Infinity as InfinityIcon,
  Smartphone,
  RectangleVertical,
  Square,
  Camera,
  ChevronRight,
} from 'lucide-react';

type BannerFormat = 'all' | '9:16' | '4:5' | '1:1';

type TemplateCategory =
  | 'ai_gen'
  | 'placar_atletico'
  | 'placar_jogueiros'
  | 'resultados_rodada'
  | 'proximo_jogo'
  | 'destaque_motm'
  | 'contratado'
  | 'escalacao'
  | 'comunicado';

interface BannerTemplateCard {
  id: TemplateCategory;
  title: string;
  subtitle: string;
  formatBadge: '9:16' | '4:5' | '1:1';
  accent: string;
  previewTag: string;
}

export default function CreativeStudioPage() {
  const [selectedFormat, setSelectedFormat] = useState<BannerFormat>('all');
  const [activeTemplate, setActiveTemplate] = useState<TemplateCategory>('placar_atletico');
  const [activeCanvasFormat, setActiveCanvasFormat] = useState<'9:16' | '4:5' | '1:1'>('4:5');

  // Fotos salvas via Zero Digitação (Avatar do Boneco, Escudo e Uniforme)
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80'
  );
  const [crestPhotoUrl, setCrestPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&q=80'
  );
  const [bgImageUrl, setBgImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&q=80'
  );

  // Dados editáveis do Banner Instantâneo
  const [selectedMatchId, setSelectedMatchId] = useState<string>(FALLBACK_MATCHES[1].id);
  const [leagueBadgeText, setLeagueBadgeText] = useState<string>('🇦🇷 LIGA ARGENTINA 5x5 • LPF');
  const [homeTeamName, setHomeTeamName] = useState<string>('FURIA DEL PLATA');
  const [awayTeamName, setAwayTeamName] = useState<string>('BOCA JUNIORS');
  const [homeColor, setHomeColor] = useState<string>('#7C5CFC');
  const [awayColor, setAwayColor] = useState<string>('#eab308');
  const [bannerHomeScore, setBannerHomeScore] = useState<number>(3);
  const [bannerAwayScore, setBannerAwayScore] = useState<number>(1);
  const [motmBannerName, setMotmBannerName] = useState<string>('JEFHE #10 (NOTA 9.6)');
  const [homeMarkersText, setHomeMarkersText] = useState<string>(
    '⚽ Jefhe (2x)\n⚽ Andrei_VOL\n👟 Andrei_VOL (2x)\n👟 Jefhe'
  );
  const [awayMarkersText, setAwayMarkersText] = useState<string>('⚽ Buzz_ProClubs\n👟 Deivy_10');
  const [sponsorsList, setSponsorsList] = useState<string>('BETSSON • RUSCHBET • MONSTER ENERGY');
  const [instagramHandle, setInstagramHandle] = useState<string>('@atleticodapalhoca');
  const [comunicadoTitle, setComunicadoTitle] = useState<string>('COMUNICADO IMPORTANTE');
  const [comunicadoBody, setComunicadoBody] = useState<string>(
    'A diretoria do Furia del Plata, em conjunto com seu camisa 10 Jefhe, manifesta repúdio oficial aos fatos ocorridos na última rodada diante do Boca Juniors FC (3x1). Seguimos firmes rumo ao título da Liga 5x5 LPF contra tudo e contra todos!'
  );
  const [comunicadoTheme, setComunicadoTheme] = useState<'yellow_green' | 'dark_purple'>('yellow_green');

  // Estados Geração de Imagens (IA Multimodal Zero Digitação)
  const [sceneIdea, setSceneIdea] = useState<string>(
    'Provocando na chuva com a mão no ouvido segurando a taça da Liga'
  );
  const [promptLoading, setPromptLoading] = useState<boolean>(false);
  const [promptResult, setPromptResult] = useState<CharacterPromptResult | null>(null);

  // Estados IA Roleplay / Notas Oficiais
  const [roleplayType, setRoleplayType] = useState<RoleplayType>('nota_repudio');
  const [rpLoading, setRpLoading] = useState<boolean>(false);
  const [rpResult, setRpResult] = useState<RoleplayResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingCanvas, setDownloadingCanvas] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('draftclub_player_avatar_photo');
      const savedCrest = localStorage.getItem('draftclub_team_crest');
      const savedKit = localStorage.getItem('draftclub_team_kit_photo');
      if (savedAvatar) setAvatarPhotoUrl(savedAvatar);
      if (savedCrest) setCrestPhotoUrl(savedCrest);
      if (savedKit) setBgImageUrl(savedKit);
    }
  }, []);

  const handleSelectTemplate = (tpl: TemplateCategory, defaultFmt: '9:16' | '4:5' | '1:1') => {
    setActiveTemplate(tpl);
    if (selectedFormat === 'all') {
      setActiveCanvasFormat(defaultFmt);
    } else {
      setActiveCanvasFormat(selectedFormat);
    }
    editorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectFormat = (fmt: BannerFormat) => {
    setSelectedFormat(fmt);
    if (fmt !== 'all') {
      setActiveCanvasFormat(fmt);
    }
  };

  const handleSelectMatchPreset = (matchId: string) => {
    setSelectedMatchId(matchId);
    const found = FALLBACK_MATCHES.find((m) => m.id === matchId);
    if (!found) return;
    setHomeTeamName((found.home_team?.name || 'FURIA DEL PLATA').toUpperCase());
    setAwayTeamName((found.away_team?.name || 'BOCA JUNIORS').toUpperCase());
    setHomeColor(found.home_team?.primary_color || '#7C5CFC');
    setAwayColor(found.away_team?.primary_color || '#eab308');
    setBannerHomeScore(found.home_score);
    setBannerAwayScore(found.away_score);
    if (found.proof_image_url) setBgImageUrl(found.proof_image_url);
  };

  const handleUploadCustomImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'bg' | 'avatar'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      if (target === 'avatar') {
        setAvatarPhotoUrl(b64);
        if (typeof window !== 'undefined') {
          localStorage.setItem('draftclub_player_avatar_photo', b64);
        }
      } else {
        setBgImageUrl(b64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiVisionPrompt = async () => {
    setPromptLoading(true);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_character_prompt',
          sceneIdea,
          playerName: 'Jefhe',
          teamName: homeTeamName,
          primaryColor: homeColor,
          secondaryColor: '#38C958',
          avatarImageBase64: avatarPhotoUrl.startsWith('data:image')
            ? avatarPhotoUrl
            : undefined,
          kitImageBase64: bgImageUrl.startsWith('data:image') ? bgImageUrl : undefined,
        }),
      });
      const json = await res.json();
      if (json?.data) {
        setPromptResult(json.data);
      }
    } catch {
      // fallback seguro
    } finally {
      setPromptLoading(false);
    }
  };

  const handleGenerateRoleplayAndComunicado = async () => {
    setRpLoading(true);
    try {
      const res = await fetch('/api/ai-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_roleplay',
          roleplayType,
          playerName: 'Jefhe',
          teamName: homeTeamName,
          rivalName: awayTeamName,
          scoreContext: `${bannerHomeScore} x ${bannerAwayScore}`,
          customContext: sceneIdea,
          avatarImageBase64: avatarPhotoUrl.startsWith('data:image')
            ? avatarPhotoUrl
            : undefined,
        }),
      });
      const json = await res.json();
      if (json?.data) {
        setRpResult(json.data);
        if (json.data.title) setComunicadoTitle(json.data.title);
        if (json.data.comunicado_graphic_text) {
          setComunicadoBody(json.data.comunicado_graphic_text);
        }
      }
    } catch {
      // fallback seguro
    } finally {
      setRpLoading(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Exporta o Banner selecionado em alta resolução via HTML5 Canvas (9:16, 4:5 ou 1:1)
  const handleDownloadBannerPng = async () => {
    setDownloadingCanvas(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = 1080;
      const height =
        activeCanvasFormat === '9:16'
          ? 1920
          : activeCanvasFormat === '1:1'
          ? 1080
          : 1350;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Fundo
      if (activeTemplate === 'comunicado') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        if (comunicadoTheme === 'yellow_green') {
          grad.addColorStop(0, '#18181B');
          grad.addColorStop(0.5, '#1E293B');
          grad.addColorStop(1, '#0F172A');
        } else {
          grad.addColorStop(0, '#2E1065');
          grad.addColorStop(1, '#09090B');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#09090B';
        ctx.fillRect(0, 0, width, height);
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src =
              activeTemplate === 'destaque_motm' || activeTemplate === 'contratado'
                ? avatarPhotoUrl
                : bgImageUrl;
          });
          if (img.width > 0) {
            ctx.drawImage(img, 0, 0, width, Math.floor(height * 0.72));
          }
        } catch {
          // fallback gradiente
        }
      }

      // 2. Vinheta escura inferior
      const gradOverlay = ctx.createLinearGradient(0, height * 0.25, 0, height);
      gradOverlay.addColorStop(0, 'rgba(9, 9, 11, 0.15)');
      gradOverlay.addColorStop(0.55, 'rgba(9, 9, 11, 0.88)');
      gradOverlay.addColorStop(1, 'rgba(9, 9, 11, 0.99)');
      ctx.fillStyle = gradOverlay;
      ctx.fillRect(0, 0, width, height);

      // 3. Topo: Pill da Liga + Instagram
      ctx.fillStyle = '#7C5CFC';
      ctx.fillRect(60, 55, 520, 56);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(leagueBadgeText, 85, 92);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#E4E4E7';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(instagramHandle, width - 60, 92);
      ctx.textAlign = 'left';

      // 4. Conteúdo Central conforme o Template
      const baseCenterY = Math.floor(height * 0.56);

      if (activeTemplate === 'comunicado') {
        // Banner de Comunicado Oficial / Nota de Repúdio
        ctx.fillStyle = comunicadoTheme === 'yellow_green' ? '#EAB308' : '#7C5CFC';
        ctx.fillRect(80, Math.floor(height * 0.24), width - 160, 90);
        ctx.fillStyle = '#09090B';
        ctx.font = '900 40px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(comunicadoTitle.toUpperCase(), width / 2, Math.floor(height * 0.24) + 58);

        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(80, Math.floor(height * 0.34), width - 160, Math.floor(height * 0.42));

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Inter, sans-serif';
        const words = comunicadoBody.split(' ');
        let line = '';
        let yPos = Math.floor(height * 0.42);
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          if (testLine.length > 42 && i > 0) {
            ctx.fillText(line.trim(), width / 2, yPos);
            line = words[i] + ' ';
            yPos += 50;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), width / 2, yPos);

        ctx.fillStyle = '#38C958';
        ctx.font = 'bold 26px Inter, sans-serif';
        ctx.fillText(`ASSINADO: DIRETORIA ${homeTeamName}`, width / 2, height - 220);
        ctx.textAlign = 'left';
      } else {
        // Placar / MOTM / Resultados / Próximo Jogo
        ctx.fillStyle = 'rgba(24, 24, 27, 0.96)';
        ctx.fillRect(60, baseCenterY, width - 120, 210);
        ctx.fillStyle = homeColor;
        ctx.fillRect(60, baseCenterY, 16, 210);
        ctx.fillStyle = awayColor;
        ctx.fillRect(width - 76, baseCenterY, 16, 210);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 36px Inter, sans-serif';
        ctx.fillText(homeTeamName.slice(0, 16), 105, baseCenterY + 95);

        ctx.textAlign = 'right';
        ctx.fillText(awayTeamName.slice(0, 16), width - 105, baseCenterY + 95);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#38C958';
        ctx.font = '900 82px Inter, sans-serif';
        const centerLabel =
          activeTemplate === 'proximo_jogo'
            ? 'VS'
            : `${bannerHomeScore}  -  ${bannerAwayScore}`;
        ctx.fillText(centerLabel, width / 2, baseCenterY + 120);

        ctx.fillStyle = '#A1A1AA';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText(`⭐ DESTAQUE: ${motmBannerName}`, width / 2, baseCenterY + 180);
        ctx.textAlign = 'left';

        // Gols e Assistências
        const markersY = baseCenterY + 255;
        ctx.fillStyle = '#E4E4E7';
        ctx.font = '600 24px Inter, sans-serif';
        homeMarkersText
          .split('\n')
          .slice(0, 4)
          .forEach((l, idx) => {
            ctx.fillText(l, 80, markersY + idx * 36);
          });

        ctx.textAlign = 'right';
        awayMarkersText
          .split('\n')
          .slice(0, 4)
          .forEach((l, idx) => {
            ctx.fillText(l, width - 80, markersY + idx * 36);
          });
        ctx.textAlign = 'left';
      }

      // 5. Barra Inferior de Patrocinadores (@atleticodapalhoca)
      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, height - 130, width, 130);
      ctx.fillStyle = '#7C5CFC';
      ctx.fillRect(0, height - 130, width, 6);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#A1A1AA';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('PATROCINADORES OFICIAIS', width / 2, height - 85);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px Inter, sans-serif';
      ctx.fillText(sponsorsList, width / 2, height - 40);
      ctx.textAlign = 'left';

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `banner-${activeTemplate}-${activeCanvasFormat.replace(':', 'x')}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloadingCanvas(false);
    }
  };

  // As 7 Categorias Horizontais de Banners (Exatamente como nas prints do Jogueiros)
  const carousels: {
    id: string;
    heading: string;
    subtitle: string;
    cards: BannerTemplateCard[];
  }[] = [
    {
      id: 'c1',
      heading: '✨ Geração de imagens (IA)',
      subtitle: 'Suba a foto do seu boneco + digite a cena para gerar arte 8K e Roleplay',
      cards: [
        {
          id: 'ai_gen',
          title: 'Boneco na Chuva 8K',
          subtitle: 'Gemini Vision lê sua foto',
          formatBadge: '4:5',
          accent: 'from-[#7C5CFC] to-[#4C1D95]',
          previewTag: 'IA VISION 8K',
        },
        {
          id: 'ai_gen',
          title: 'Entrevista Zona Mista',
          subtitle: 'Foto do Avatar + Microfones',
          formatBadge: '9:16',
          accent: 'from-indigo-600 to-slate-900',
          previewTag: 'STORY IA',
        },
        {
          id: 'ai_gen',
          title: 'Provocando o Rival',
          subtitle: 'Mão no ouvido + Estádio lotado',
          formatBadge: '1:1',
          accent: 'from-purple-600 to-zinc-900',
          previewTag: 'POST 1:1',
        },
      ],
    },
    {
      id: 'c2',
      heading: '⚽ Placar & Fim de Jogo',
      subtitle: 'Padrão oficial @atleticodapalhoca e FIM DE JOGO! Jogueiros',
      cards: [
        {
          id: 'placar_atletico',
          title: 'Padrão @atleticodapalhoca',
          subtitle: 'Foto grande + Placar + Patrocínios',
          formatBadge: '4:5',
          accent: 'from-[#7C5CFC] to-zinc-900',
          previewTag: '3 - 1 • OFICIAL',
        },
        {
          id: 'placar_jogueiros',
          title: 'FIM DE JOGO! (Jogueiros)',
          subtitle: 'Escudos + Gols + Assistências',
          formatBadge: '9:16',
          accent: 'from-[#38C958] to-emerald-950',
          previewTag: 'FIM DE JOGO',
        },
        {
          id: 'placar_atletico',
          title: 'Placar Feed Quadrado',
          subtitle: 'Resumo limpo para WhatsApp',
          formatBadge: '1:1',
          accent: 'from-sky-600 to-slate-950',
          previewTag: 'PLACAR 1:1',
        },
      ],
    },
    {
      id: 'c3',
      heading: '📊 Resultados da Rodada',
      subtitle: 'Todos os placares da rodada da Liga 5x5 LPF em uma única arte',
      cards: [
        {
          id: 'resultados_rodada',
          title: 'Giro da Rodada #4 LPF',
          subtitle: 'Todos os resultados 5x5',
          formatBadge: '4:5',
          accent: 'from-violet-600 to-slate-950',
          previewTag: 'RODADA #4',
        },
        {
          id: 'resultados_rodada',
          title: 'Resultados nos Stories',
          subtitle: 'Resumo vertical da noite',
          formatBadge: '9:16',
          accent: 'from-[#7C5CFC] to-indigo-950',
          previewTag: 'STORIES LPF',
        },
      ],
    },
    {
      id: 'c4',
      heading: '📅 Próximos Jogos',
      subtitle: 'Confrontos da rodada e card de Próximo Jogo (Time A vs Time B)',
      cards: [
        {
          id: 'proximo_jogo',
          title: 'Hoje tem Jogo! (Matchday)',
          subtitle: 'Furia del Plata vs Boca Juniors',
          formatBadge: '9:16',
          accent: 'from-amber-500 to-zinc-900',
          previewTag: 'HOJE 22:30H',
        },
        {
          id: 'proximo_jogo',
          title: 'Confronto da Rodada',
          subtitle: 'Card 4:5 para Feed e Grupos',
          formatBadge: '4:5',
          accent: 'from-[#7C5CFC] to-slate-900',
          previewTag: 'PRÓXIMO JOGO',
        },
      ],
    },
    {
      id: 'c5',
      heading: '🌟 Destaque da Partida & Gols',
      subtitle: 'Craque do Jogo (MOTM), Garçom da Rodada e Hat-Trick com foto do boneco',
      cards: [
        {
          id: 'destaque_motm',
          title: 'Craque da Partida (MOTM)',
          subtitle: 'Jefhe • Nota 9.6 • 2 Gols',
          formatBadge: '4:5',
          accent: 'from-amber-500 to-purple-950',
          previewTag: '⭐ MVP 9.6',
        },
        {
          id: 'destaque_motm',
          title: 'GOL GOL GOL! (Hat-Trick)',
          subtitle: 'Arte especial de artilheiro',
          formatBadge: '9:16',
          accent: 'from-[#38C958] to-zinc-950',
          previewTag: '⚽⚽⚽ HAT-TRICK',
        },
        {
          id: 'destaque_motm',
          title: 'Garçom da Noite',
          subtitle: 'Líder de assistências na rodada',
          formatBadge: '1:1',
          accent: 'from-cyan-500 to-slate-900',
          previewTag: '👟 GARÇOM',
        },
      ],
    },
    {
      id: 'c6',
      heading: '🤝 Contratação & Escalação',
      subtitle: 'Anúncio "CONTRATADO / Bem-vindo" e Relacionados 5x5 & 11v11',
      cards: [
        {
          id: 'contratado',
          title: 'CONTRATADO! Bem-vindo',
          subtitle: 'Novo reforço com foto do boneco',
          formatBadge: '4:5',
          accent: 'from-[#38C958] to-slate-950',
          previewTag: 'CONTRATADO ✍️',
        },
        {
          id: 'escalacao',
          title: 'RELACIONADOS 5x5 & 11v11',
          subtitle: 'Titulares + Reserva imediato',
          formatBadge: '9:16',
          accent: 'from-[#7C5CFC] to-zinc-950',
          previewTag: 'ESCALAÇÃO',
        },
      ],
    },
    {
      id: 'c7',
      heading: '📢 Comunicados Oficiais & Notas de Repúdio',
      subtitle: 'O texto gerado pela IA Roleplay entra diagramado dentro da imagem do Comunicado!',
      cards: [
        {
          id: 'comunicado',
          title: 'COMUNICADO IMPORTANTE',
          subtitle: 'Estilo Jogueiros Amarelo/Escuro',
          formatBadge: '4:5',
          accent: 'from-amber-500 to-zinc-950',
          previewTag: '🚨 COMUNICADO',
        },
        {
          id: 'comunicado',
          title: 'Nota de Repúdio Oficial',
          subtitle: 'Pronto para postar nos Stories',
          formatBadge: '9:16',
          accent: 'from-rose-600 to-zinc-950',
          previewTag: 'NOTA OFICIAL',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-zinc-950 text-[#18181B] dark:text-zinc-100 px-3.5 sm:px-6 py-5">
      <div className="max-w-4xl mx-auto space-y-6">
        <canvas ref={canvasRef} className="hidden" />

        {/* ================================================================= */}
        {/* 1. CABEÇALHO + SELETOR DE FORMATO (4 CARDS VERTICAIS IGUAL PRINT) */}
        {/* ================================================================= */}
        <section className="space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#18181B] dark:text-white">
              Construa seus Banners Personalizados
            </h1>
            <p className="text-xs text-[#71717A]">
              Escolha o formato e toque em qualquer modelo para gerar sua arte com 1 clique
            </p>
          </div>

          {/* 4 Cards Verticais de Formato */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              {
                key: 'all' as BannerFormat,
                label: 'Todos',
                sub: 'Vários formatos',
                icon: InfinityIcon,
              },
              {
                key: '9:16' as BannerFormat,
                label: 'Story',
                sub: '9:16',
                icon: Smartphone,
              },
              {
                key: '4:5' as BannerFormat,
                label: 'Retrato',
                sub: '4:5',
                icon: RectangleVertical,
              },
              {
                key: '1:1' as BannerFormat,
                label: 'Quadrado',
                sub: '1:1',
                icon: Square,
              },
            ].map((fmt) => {
              const Icon = fmt.icon;
              const active = selectedFormat === fmt.key;
              return (
                <button
                  key={fmt.key}
                  type="button"
                  onClick={() => handleSelectFormat(fmt.key)}
                  className={cn(
                    'p-3.5 rounded-3xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]',
                    active
                      ? 'bg-gradient-to-b from-[#7C5CFC] to-[#5B3FD9] text-white border-[#7C5CFC] shadow-md scale-[1.02]'
                      : 'bg-white dark:bg-zinc-900 text-[#18181B] dark:text-white border-zinc-100 dark:border-zinc-800 hover:border-[#7C5CFC]/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6',
                      active ? 'text-white' : 'text-[#7C5CFC]'
                    )}
                  />
                  <span className="text-xs font-extrabold leading-tight">
                    {fmt.label}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      active ? 'text-white/85' : 'text-[#71717A]'
                    )}
                  >
                    {fmt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. CARROSSÉIS HORIZONTAIS DAS 7 CATEGORIAS DE TEMPLATES */}
        {/* ================================================================= */}
        <section className="space-y-5">
          {carousels.map((row) => {
            const visibleCards = row.cards.filter(
              (c) => selectedFormat === 'all' || c.formatBadge === selectedFormat
            );
            if (visibleCards.length === 0) return null;

            return (
              <div key={row.id} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-[#18181B] dark:text-white">
                      {row.heading}
                    </h2>
                    <p className="text-[11px] text-[#71717A]">{row.subtitle}</p>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {visibleCards.map((card, i) => {
                    const isSelected = activeTemplate === card.id;
                    return (
                      <button
                        key={`${card.id}-${i}`}
                        type="button"
                        onClick={() => handleSelectTemplate(card.id, card.formatBadge)}
                        className={cn(
                          'min-w-[185px] sm:min-w-[210px] snap-start rounded-3xl p-4 text-left transition-all border relative overflow-hidden flex flex-col justify-between h-44 shrink-0',
                          `bg-gradient-to-br ${card.accent} text-white`,
                          isSelected
                            ? 'ring-4 ring-[#7C5CFC] border-white'
                            : 'border-white/15 opacity-95 hover:opacity-100'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[10px] font-extrabold">
                            {card.previewTag}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                            {card.formatBadge}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-black leading-tight">
                            {card.title}
                          </p>
                          <p className="text-[11px] text-white/80 line-clamp-1">
                            {card.subtitle}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#38C958] bg-white px-2.5 py-0.5 rounded-full mt-1">
                            Personalizar <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* ================================================================= */}
        {/* 3. EDITOR INSTANTÂNEO DO TEMPLATE SELECIONADO + PREVIEW REAL-TIME */}
        {/* ================================================================= */}
        <section
          ref={editorSectionRef}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7C5CFC] block">
                Editor Instantâneo • Zero Digitação
              </span>
              <h2 className="text-lg font-extrabold text-[#18181B] dark:text-white">
                {activeTemplate === 'ai_gen' && '✨ Geração de Imagem 8K pela Foto do Boneco'}
                {activeTemplate === 'placar_atletico' &&
                  '⚽ Banner Oficial de Placar (@atleticodapalhoca)'}
                {activeTemplate === 'placar_jogueiros' && '⚽ Banner FIM DE JOGO! (Estilo Jogueiros)'}
                {activeTemplate === 'resultados_rodada' && '📊 Giro de Resultados da Rodada LPF 5x5'}
                {activeTemplate === 'proximo_jogo' && '📅 Banner de Próximo Jogo / Matchday'}
                {activeTemplate === 'destaque_motm' && '🌟 Banner Craque da Partida (MOTM) & Gols'}
                {activeTemplate === 'contratado' && '🤝 Anúncio Oficial: CONTRATADO!'}
                {activeTemplate === 'escalacao' && '📋 Relacionados / Escalação 5x5 & 11v11'}
                {activeTemplate === 'comunicado' &&
                  '📢 Comunicado Importante / Nota de Repúdio com IA'}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F5F6FA] dark:bg-zinc-800 p-1 rounded-full">
              {(['9:16', '4:5', '1:1'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setActiveCanvasFormat(fmt)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-extrabold transition-all',
                    activeCanvasFormat === fmt
                      ? 'bg-[#7C5CFC] text-white'
                      : 'text-[#71717A]'
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* COLUNA ESQUERDA: CONTROLES SIMPLES (GUIADOS POR FOTO) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Upload Rápido de Fotos (Foto do Boneco + Foto da Partida/Uniforme) */}
              <div className="grid grid-cols-2 gap-3">
                <label className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center gap-3 cursor-pointer hover:border-[#7C5CFC]">
                  <img
                    src={avatarPhotoUrl}
                    alt="Boneco EA FC"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#7C5CFC] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold block truncate">
                      Foto do Boneco
                    </span>
                    <span className="text-[10px] text-[#7C5CFC] font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Trocar foto
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCustomImage(e, 'avatar')}
                    className="hidden"
                  />
                </label>

                <label className="p-3.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center gap-3 cursor-pointer hover:border-[#7C5CFC]">
                  <img
                    src={bgImageUrl}
                    alt="Fundo / Jogo"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-[#38C958] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold block truncate">
                      Foto da Partida
                    </span>
                    <span className="text-[10px] text-[#38C958] font-bold flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Enviar print
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCustomImage(e, 'bg')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Se for Geração de Imagem IA ou Comunicado, exibe os geradores multimodais */}
              {(activeTemplate === 'ai_gen' || activeTemplate === 'comunicado') && (
                <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800/80 border border-[#7C5CFC]/30 space-y-3">
                  <div>
                    <label className="block text-xs font-extrabold text-[#18181B] dark:text-white mb-1">
                      O que está acontecendo na cena ou no comunicado?
                    </label>
                    <input
                      type="text"
                      value={sceneIdea}
                      onChange={(e) => setSceneIdea(e.target.value)}
                      placeholder="Ex: Provocando na chuva / Nota de repúdio contra cera"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                    />
                  </div>

                  {activeTemplate === 'comunicado' ? (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            { id: 'nota_repudio', label: '🚨 Nota de Repúdio' },
                            { id: 'nota_oficial_clube', label: '📋 Comunicado Oficial' },
                            { id: 'entrevista_pos_jogo', label: '🎙️ Entrevista Pós-Jogo' },
                            { id: 'provocacao_rival', label: '🔥 Provocação Pré-Jogo' },
                          ] as { id: RoleplayType; label: string }[]
                        ).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setRoleplayType(t.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-[11px] font-extrabold border transition-all',
                              roleplayType === t.id
                                ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                                : 'bg-white dark:bg-zinc-900 text-[#71717A] border-zinc-200 dark:border-zinc-700'
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateRoleplayAndComunicado}
                        disabled={rpLoading}
                        className="w-full py-3 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Wand2 className="w-4 h-4" />
                        {rpLoading
                          ? 'Escrevendo e diagramando Comunicado...'
                          : 'Gerar Texto com IA e Inserir no Banner'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateAiVisionPrompt}
                      disabled={promptLoading}
                      className="w-full py-3 rounded-full bg-[#7C5CFC] hover:bg-[#6b4be8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      {promptLoading
                        ? 'Gemini Vision analisando foto do boneco...'
                        : 'Ler Foto do Boneco + Gerar Arte/Prompt 8K'}
                    </button>
                  )}
                </div>
              )}

              {/* Seleção Rápida de Jogo da Liga */}
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Puxar Dados de Jogo da Liga 5x5 LPF
                </label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => handleSelectMatchPreset(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-[#7C5CFC]"
                >
                  {FALLBACK_MATCHES.map((m) => (
                    <option key={m.id} value={m.id}>
                      Rodada #{m.round_number} • {m.home_team?.name} {m.home_score}x
                      {m.away_score} {m.away_team?.name}
                    </option>
                  ))}
                </select>
              </div>

              {activeTemplate === 'comunicado' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#71717A] mb-1">
                      Título do Comunicado
                    </label>
                    <input
                      type="text"
                      value={comunicadoTitle}
                      onChange={(e) => setComunicadoTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#71717A] mb-1">
                      Texto Diagramado na Imagem
                    </label>
                    <textarea
                      rows={4}
                      value={comunicadoBody}
                      onChange={(e) => setComunicadoBody(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#71717A] mb-1">
                        Mandante + Gols
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={homeTeamName}
                          onChange={(e) => setHomeTeamName(e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                        />
                        <input
                          type="number"
                          value={bannerHomeScore}
                          onChange={(e) => setBannerHomeScore(parseInt(e.target.value) || 0)}
                          className="w-14 text-center rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-black text-[#7C5CFC]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#71717A] mb-1">
                        Visitante + Gols
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={awayTeamName}
                          onChange={(e) => setAwayTeamName(e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                        />
                        <input
                          type="number"
                          value={bannerAwayScore}
                          onChange={(e) => setBannerAwayScore(parseInt(e.target.value) || 0)}
                          className="w-14 text-center rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-black text-[#7C5CFC]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#71717A] mb-1">
                      Patrocinadores Oficiais (Rodapé do Banner)
                    </label>
                    <input
                      type="text"
                      value={sponsorsList}
                      onChange={(e) => setSponsorsList(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F6FA] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-[#7C5CFC]"
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleDownloadBannerPng}
                disabled={downloadingCanvas}
                className="w-full py-3.5 px-6 rounded-full bg-[#38C958] hover:bg-[#2fb34d] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                {downloadingCanvas
                  ? 'Renderizando PNG em Alta Resolução...'
                  : `Baixar Banner (${activeCanvasFormat}) Pronto para Postar`}
              </button>

              {/* Resultado do Prompt 8K se o usuário acionou a IA Vision */}
              {promptResult && (
                <div className="p-4 rounded-3xl bg-[#F5F6FA] dark:bg-zinc-800 border border-[#7C5CFC]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#7C5CFC]">
                      ✨ Leitura Visual Gemini Vision Concluída
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(promptResult.prompt_en, 'prompt_en')}
                      className="px-3 py-1 rounded-full bg-[#7C5CFC] text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      {copiedKey === 'prompt_en' ? (
                        <>
                          <Check className="w-3 h-3" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar Prompt 8K
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#38C958] font-bold">
                    {promptResult.detected_visual_summary}
                  </p>
                  <p className="text-[11px] font-mono text-[#71717A] dark:text-zinc-300 line-clamp-3">
                    {promptResult.prompt_en}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {promptResult.external_generators.map((g) => (
                      <a
                        key={g.name}
                        href={g.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[10px] font-extrabold text-[#7C5CFC] flex items-center gap-1"
                      >
                        <span>{g.name}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COLUNA DIREITA: PREVIEW VISUAL EM TEMPO REAL */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div
                className={cn(
                  'w-full max-w-[390px] rounded-3xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl relative flex flex-col justify-between bg-zinc-950 text-white select-none',
                  activeCanvasFormat === '9:16'
                    ? 'aspect-[9/16]'
                    : activeCanvasFormat === '1:1'
                    ? 'aspect-square'
                    : 'aspect-[4/5]'
                )}
              >
                {/* Imagem de Fundo */}
                {activeTemplate !== 'comunicado' && (
                  <img
                    src={
                      activeTemplate === 'destaque_motm' || activeTemplate === 'contratado'
                        ? avatarPhotoUrl
                        : bgImageUrl
                    }
                    alt="Preview Banner"
                    className="absolute inset-0 w-full h-[72%] object-cover"
                  />
                )}

                <div
                  className={cn(
                    'absolute inset-0',
                    activeTemplate === 'comunicado'
                      ? comunicadoTheme === 'yellow_green'
                        ? 'bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950'
                        : 'bg-gradient-to-br from-[#2E1065] via-zinc-950 to-black'
                      : 'bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-transparent'
                  )}
                />

                {/* Topo do Banner */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#7C5CFC] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    {leagueBadgeText}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/15 text-[10px] font-mono text-zinc-200">
                    {instagramHandle}
                  </span>
                </div>

                {/* Centro / Base conforme o Template */}
                {activeTemplate === 'comunicado' ? (
                  <div className="relative z-10 px-5 my-auto space-y-3 text-center">
                    <div className="py-2 px-4 rounded-2xl bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-md">
                      🚨 {comunicadoTitle}
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs leading-relaxed text-zinc-100 font-medium">
                      {comunicadoBody}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#38C958] block">
                      DIRETORIA OFICIAL • {homeTeamName}
                    </span>
                  </div>
                ) : activeTemplate === 'resultados_rodada' ? (
                  <div className="relative z-10 px-4 my-auto space-y-2">
                    <div className="text-center pb-1">
                      <span className="px-3 py-1 rounded-full bg-[#38C958] text-white text-[10px] font-black uppercase">
                        RESULTADOS DA RODADA #4
                      </span>
                    </div>
                    {FALLBACK_MATCHES.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-2xl bg-zinc-900/95 border border-white/10 flex items-center justify-between text-xs font-extrabold"
                      >
                        <span className="truncate max-w-[110px]">
                          {m.home_team?.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#7C5CFC] text-white font-mono">
                          {m.home_score} x {m.away_score}
                        </span>
                        <span className="truncate max-w-[110px] text-right">
                          {m.away_team?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative z-10 px-4 pt-12 space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-zinc-900/95 border border-white/15 shadow-2xl relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: homeColor }}
                      />
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: awayColor }}
                      />

                      <div className="flex items-center justify-between gap-2 px-2">
                        <span className="text-xs font-black uppercase truncate max-w-[110px]">
                          {homeTeamName}
                        </span>
                        <div className="px-3 py-1 rounded-xl bg-zinc-950 border border-white/10 text-xl font-black font-mono text-[#38C958]">
                          {activeTemplate === 'proximo_jogo'
                            ? 'VS'
                            : `${bannerHomeScore} - ${bannerAwayScore}`}
                        </div>
                        <span className="text-xs font-black uppercase truncate max-w-[110px] text-right">
                          {awayTeamName}
                        </span>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-white/10 text-center">
                        <span className="text-[10px] font-extrabold text-amber-400 uppercase">
                          ⭐ DESTAQUE: {motmBannerName}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-1 text-[10px] text-zinc-200 font-medium">
                      <div className="space-y-0.5 whitespace-pre-line">
                        {homeMarkersText}
                      </div>
                      <div className="space-y-0.5 text-right whitespace-pre-line">
                        {awayMarkersText}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rodapé de Patrocinadores */}
                <div className="relative z-10 bg-zinc-950 border-t-2 border-[#7C5CFC] px-3 py-2.5 text-center">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 block">
                    Patrocinadores Oficiais
                  </span>
                  <span className="text-xs font-black tracking-wider text-white uppercase truncate block">
                    {sponsorsList}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
