'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  Sparkles,
  Gift,
  Wand2,
  Lock,
  Check,
  X,
  Footprints,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import {
  CARD_DESIGN_ASSETS,
  PLAYSTYLE_ASSETS,
  TEMPLATE_ASSETS,
  getCardDesignByUrlOrId,
  CardDesignAsset,
} from '@/lib/assets-catalog';
import { calculateFC26MacroAndOvr, FC26CardMacroStats } from '@/lib/accelerate';
import { PlayerProfile, Team } from '@/types/database';
import { cn } from '@/lib/utils';

export interface FC26PlayerCardProps {
  player: Partial<PlayerProfile>;
  team?: Partial<Team> | null;
  cardDesignUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  autoRemoveBg?: boolean;
  onSelectCardDesign?: (designUrl: string) => void;
  onEnhancePortraitAI?: () => void;
  enhancingAI?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * Remove fundos sólidos/escuros ou aplica recorte suave de busto estilo EA FC 26 via HTML5 Canvas
 */
function useProcessedCutoutPhoto(srcUrl: string, autoRemoveBg: boolean) {
  const [processedUrl, setProcessedUrl] = useState<string>(srcUrl);

  useEffect(() => {
    if (!srcUrl) {
      setProcessedUrl(TEMPLATE_ASSETS.avatarPlaceholder);
      return;
    }
    if (!autoRemoveBg) {
      setProcessedUrl(srcUrl);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        const w = 420;
        const h = 420;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setProcessedUrl(srcUrl);
          return;
        }

        // Desenha a imagem centralizada estilo busto
        const scale = Math.max(w / img.width, h / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = (w - nw) / 2;
        const ny = (h - nh) * 0.15;
        ctx.drawImage(img, nx, ny, nw, nh);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Amostra os 4 cantos superiores para detectar a cor dominante de fundo
        const samplePoints = [
          [4, 4],
          [w - 5, 4],
          [12, 12],
          [w - 13, 12],
        ];
        let bgR = 0,
          bgG = 0,
          bgB = 0;
        for (const [sx, sy] of samplePoints) {
          const idx = (sy * w + sx) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        }
        bgR /= samplePoints.length;
        bgG /= samplePoints.length;
        bgB /= samplePoints.length;

        const centerX = w * 0.5;
        const centerY = h * 0.52;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Distância cromática até o fundo amostrado
            const colorDiff = Math.sqrt(
              Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
            );

            // Distância normalizada do centro do busto/rosto
            const dx = (x - centerX) / (w * 0.46);
            const dy = (y - centerY) / (h * 0.48);
            const radialDist = Math.sqrt(dx * dx + dy * dy);

            // Remove pixels de borda que batem com a cor do fundo ou estão fora da silhueta
            if (radialDist > 0.72 && colorDiff < 44) {
              data[idx + 3] = 0;
            } else if (radialDist > 0.58 && colorDiff < 32) {
              data[idx + 3] = Math.round(data[idx + 3] * 0.25);
            }

            // Vignette suave nas laterais extremas e base do busto (corte da linha divisória)
            if (y > h * 0.86) {
              const fade = Math.max(0, 1 - (y - h * 0.86) / (h * 0.14));
              data[idx + 3] = Math.round(data[idx + 3] * fade);
            }
            if (radialDist > 0.96) {
              const edgeFade = Math.max(0, 1 - (radialDist - 0.96) / 0.12);
              data[idx + 3] = Math.round(data[idx + 3] * edgeFade);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedUrl(canvas.toDataURL('image/png'));
      } catch {
        // Caso CORS impeça getImageData, usa a URL original com máscara CSS
        setProcessedUrl(srcUrl);
      }
    };
    img.onerror = () => {
      if (!cancelled) setProcessedUrl(TEMPLATE_ASSETS.avatarPlaceholder);
    };
    img.src = srcUrl;

    return () => {
      cancelled = true;
    };
  }, [srcUrl, autoRemoveBg]);

  return processedUrl;
}

export function FC26PlayerCard({
  player,
  team,
  cardDesignUrl,
  size = 'md',
  autoRemoveBg = true,
  onEnhancePortraitAI,
  enhancingAI = false,
  showActions = false,
  className,
}: FC26PlayerCardProps) {
  const [removeBgActive, setRemoveBgActive] = useState(autoRemoveBg);
  const [downloading, setDownloading] = useState(false);

  const activeCardDesign = useMemo(() => {
    return getCardDesignByUrlOrId(cardDesignUrl || player.card_background || 'gold-rare');
  }, [cardDesignUrl, player.card_background]);

  const macro: FC26CardMacroStats = useMemo(() => {
    return calculateFC26MacroAndOvr(
      player.attributes || {},
      player.primary_position || 'MEI',
      player.career_stats
    );
  }, [player.attributes, player.primary_position, player.career_stats]);

  const rawPhoto =
    player.avatar_face_url ||
    player.avatar_body_url ||
    TEMPLATE_ASSETS.avatarPlaceholder;

  const cutoutPhoto = useProcessedCutoutPhoto(rawPhoto, removeBgActive);

  // Seleciona até 2 PlayStyles+ (Ouro) do jogador para exibir na borda esquerda
  const goldPlayStyles = useMemo(() => {
    const selected = player.playstyles || [];
    const plusList = selected
      .filter((ps) => ps.level === 'gold' || ps.tier === 'gold')
      .map((ps) => {
        const asset = PLAYSTYLE_ASSETS.find((a) => a.id === ps.id);
        return asset?.plusIconUrl || ps.plusIcon || ps.icon;
      })
      .filter((u): u is string => Boolean(u));

    if (plusList.length > 0) return plusList.slice(0, 2);
    // Fallback estético: exibe 2 PlayStyles+ padrão da posição caso ainda não tenha marcado
    return [
      '/assets/playstyles/ball-control/technical-plus.png',
      '/assets/playstyles/passing/incisive-pass-plus.png',
    ];
  }, [player.playstyles]);

  const isDarkText = activeCardDesign.textTheme === 'dark';
  const textColorClass = isDarkText ? 'text-[#2b2210]' : 'text-[#ffffff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]';
  const subTextColorClass = isDarkText ? 'text-[#423418]' : 'text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]';
  const dividerColorClass = isDarkText ? 'border-[#2b2210]/25' : 'border-white/30';

  const characterName = (player.character_name || player.ea_Tag || player.name || 'JEFHE').toUpperCase();
  const position = (player.primary_position || 'MEI').toUpperCase();
  const preferredFoot = player.preferred_foot || 'D';
  const skillMoves = player.skill_moves || 5;
  const weakFoot = player.weak_foot || 4;
  const nationality = player.nationality || 'BR';
  const flagEmoji = nationality === 'AR' ? '🇦🇷' : '🇧🇷';
  const crestUrl = team?.logo_url || TEMPLATE_ASSETS.crestPlaceholder;

  // Dimensões responsivas mantendo proporção oficial de carta FC 26
  const sizeClasses = {
    sm: 'w-[210px] h-[294px]',
    md: 'w-[280px] sm:w-[310px] h-[392px] sm:h-[434px]',
    lg: 'w-[310px] sm:w-[350px] h-[434px] sm:h-[490px]',
  }[size];

  // Exportação em PNG de alta resolução via Canvas (800x1120)
  const handleDownloadCardPng = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1120;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loadImg = (src: string): Promise<HTMLImageElement | null> =>
        new Promise((resolve) => {
          const i = new Image();
          i.crossOrigin = 'anonymous';
          i.onload = () => resolve(i);
          i.onerror = () => resolve(null);
          i.src = src;
        });

      const [bgImg, portraitImg, crestImg, ps1Img, ps2Img] = await Promise.all([
        loadImg(activeCardDesign.url),
        loadImg(cutoutPhoto),
        loadImg(crestUrl),
        goldPlayStyles[0] ? loadImg(goldPlayStyles[0]) : Promise.resolve(null),
        goldPlayStyles[1] ? loadImg(goldPlayStyles[1]) : Promise.resolve(null),
      ]);

      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, 800, 1120);
      }

      // Desenha o busto do jogador na metade superior (recortado na linha divisória y=615)
      if (portraitImg) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(140, 115, 580, 500);
        ctx.clip();
        ctx.drawImage(portraitImg, 210, 135, 450, 480);
        ctx.restore();
      }

      const mainColor = isDarkText ? '#2b2210' : '#ffffff';
      if (!isDarkText) {
        ctx.shadowColor = 'rgba(0,0,0,0.75)';
        ctx.shadowBlur = 6;
      }

      // OVR + Posição (Canto Superior Esquerdo)
      ctx.fillStyle = mainColor;
      ctx.textAlign = 'center';
      ctx.font = '900 108px "Plus Jakarta Sans", Inter, sans-serif';
      ctx.fillText(String(macro.finalOvr), 195, 255);

      ctx.font = '800 42px "Plus Jakarta Sans", Inter, sans-serif';
      ctx.fillText(position, 195, 308);

      // PlayStyles+ na borda esquerda
      if (ps1Img) ctx.drawImage(ps1Img, 58, 415, 86, 86);
      if (ps2Img) ctx.drawImage(ps2Img, 58, 505, 86, 86);

      // Pílulas na borda direita (Pé Preferido + 5 ★ 4)
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(18, 20, 26, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(615, 495, 115, 44, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 24px "JetBrains Mono", monospace';
      ctx.fillText(`🦶 ${preferredFoot}`, 672, 525);

      ctx.fillStyle = 'rgba(18, 20, 26, 0.9)';
      ctx.beginPath();
      ctx.roundRect(600, 548, 130, 44, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = '800 24px "JetBrains Mono", monospace';
      ctx.fillText(`${skillMoves} ★ ${weakFoot}`, 665, 578);
      ctx.restore();

      // Nome do Personagem centralizado abaixo da linha divisória
      ctx.fillStyle = mainColor;
      ctx.font = '900 54px "Plus Jakarta Sans", Inter, sans-serif';
      ctx.fillText(characterName.slice(0, 15), 400, 682);

      // Linha divisória sutil
      ctx.strokeStyle = isDarkText ? 'rgba(43,34,16,0.25)' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(145, 705);
      ctx.lineTo(655, 705);
      ctx.stroke();

      // 6 Macro-Atributos lado a lado (PAC, SHO, PAS, DRI, DEF, PHY)
      const statsList = [
        { label: 'PAC', val: macro.pac },
        { label: 'SHO', val: macro.sho },
        { label: 'PAS', val: macro.pas },
        { label: 'DRI', val: macro.dri },
        { label: 'DEF', val: macro.def },
        { label: 'PHY', val: macro.phy },
      ];
      const startX = 165;
      const stepX = 94;
      statsList.forEach((st, idx) => {
        const cx = startX + idx * stepX;
        ctx.font = '700 26px "Plus Jakarta Sans", Inter, sans-serif';
        ctx.fillText(st.label, cx, 750);
        ctx.font = '900 40px "JetBrains Mono", monospace';
        ctx.fillText(String(st.val), cx, 798);
      });

      // Rodapé Inferior (Bandeira + Liga + Escudo do Clube sem caixa)
      ctx.font = '700 38px Inter, sans-serif';
      ctx.fillText(flagEmoji, 315, 885);

      ctx.font = '900 26px "Plus Jakarta Sans", Inter, sans-serif';
      ctx.fillText('LPF', 400, 882);

      if (crestImg) {
        ctx.drawImage(crestImg, 455, 842, 58, 58);
      }

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `carta-fc26-${characterName.toLowerCase()}-${macro.finalOvr}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* CONTAINER DA CARTA FC 26 */}
      <div
        className={cn(
          'relative select-none transition-transform duration-300 hover:scale-[1.02] group',
          sizeClasses
        )}
      >
        {/* Fundo Oficial da Carta Limpa FC 26 */}
        <img
          src={activeCardDesign.url}
          alt={activeCardDesign.name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)]"
        />

        {/* 1. CANTO SUPERIOR ESQUERDO: OVR + POSIÇÃO */}
        <div
          className={cn(
            'absolute top-[14%] left-[16%] flex flex-col items-center leading-none z-20',
            textColorClass
          )}
        >
          <span
            className={cn(
              'font-display font-black tracking-tighter tabular-nums',
              size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
            )}
          >
            {macro.finalOvr}
          </span>
          <span
            className={cn(
              'font-display font-extrabold tracking-tight uppercase mt-0.5',
              size === 'sm' ? 'text-[10px]' : 'text-xs sm:text-sm'
            )}
          >
            {position}
          </span>
          {macro.careerBonus > 0 && size !== 'sm' && (
            <span className="mt-1 px-1.5 py-0.5 rounded-full bg-[#38C958] text-white font-mono text-[8px] font-black shadow-xs">
              +{macro.careerBonus} CARR
            </span>
          )}
        </div>

        {/* 2. CENTRO SUPERIOR: BUSTO DO PERSONAGEM RECORTADO NA LINHA DIVISÓRIA */}
        <div className="absolute top-[11%] left-[24%] right-[10%] bottom-[44.5%] overflow-hidden z-10 flex items-end justify-center pointer-events-none">
          <img
            src={cutoutPhoto}
            alt={characterName}
            className="w-[88%] h-[96%] object-cover object-top drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,1) 78%, rgba(0,0,0,0) 100%)',
            }}
            onError={(e) => {
              e.currentTarget.src = TEMPLATE_ASSETS.avatarPlaceholder;
            }}
          />
        </div>

        {/* 3. BORDA ESQUERDA (ALTURA DO OMBRO/DIVISÓRIA): LOSANGOS PLAYSTYLES+ (OURO) */}
        <div className="absolute left-[6%] top-[36%] flex flex-col gap-1 z-30">
          {goldPlayStyles.map((iconUrl, idx) => (
            <img
              key={idx}
              src={iconUrl}
              alt="PlayStyle+"
              className={cn(
                'object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]',
                size === 'sm' ? 'w-6 h-6' : 'w-8 h-8 sm:w-9 sm:h-9'
              )}
            />
          ))}
        </div>

        {/* 4. BORDA DIREITA (ACIMA DA LINHA DIVISÓRIA): PÉ PREFERIDO + 5 ★ 4 */}
        <div className="absolute right-[9%] bottom-[45.5%] flex flex-col items-end gap-1 z-30">
          <div className="px-2 py-0.5 rounded-md bg-zinc-950/90 border border-amber-400/70 text-white font-mono text-[9px] sm:text-[10px] font-extrabold flex items-center gap-1 shadow-md">
            <Footprints className="w-2.5 h-2.5 text-amber-400" />
            <span>{preferredFoot}</span>
          </div>
          <div className="px-2 py-0.5 rounded-md bg-zinc-950/90 border border-amber-400/70 text-amber-400 font-mono text-[9px] sm:text-[10px] font-extrabold flex items-center gap-0.5 shadow-md">
            <span>{skillMoves}</span>
            <span>★</span>
            <span>{weakFoot}</span>
          </div>
        </div>

        {/* 5. METADE INFERIOR (ABAIXO DA LINHA HORIZONTAL): NOME + 6 MACRO-STATS + RODAPÉ QUÍMICA */}
        <div className="absolute left-[13%] right-[13%] top-[55.5%] bottom-[13%] flex flex-col items-center justify-between z-20">
          {/* Nome do Personagem em Caixa Alta */}
          <div className={cn('w-full text-center border-b pb-0.5', dividerColorClass)}>
            <span
              className={cn(
                'font-display font-black uppercase tracking-tight block truncate px-1',
                textColorClass,
                size === 'sm' ? 'text-xs' : 'text-base sm:text-lg'
              )}
            >
              {characterName}
            </span>
          </div>

          {/* 6 Macro-Atributos Lado a Lado (PAC, SHO, PAS, DRI, DEF, PHY) */}
          <div className="w-full grid grid-cols-6 gap-0.5 px-1 text-center my-auto">
            {[
              { label: 'PAC', val: macro.pac },
              { label: 'SHO', val: macro.sho },
              { label: 'PAS', val: macro.pas },
              { label: 'DRI', val: macro.dri },
              { label: 'DEF', val: macro.def },
              { label: 'PHY', val: macro.phy },
            ].map((st) => (
              <div key={st.label} className="flex flex-col items-center leading-tight">
                <span
                  className={cn(
                    'font-display font-bold uppercase tracking-tighter',
                    subTextColorClass,
                    size === 'sm' ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'
                  )}
                >
                  {st.label}
                </span>
                <span
                  className={cn(
                    'font-mono font-black tabular-nums',
                    textColorClass,
                    size === 'sm' ? 'text-[10px]' : 'text-xs sm:text-sm'
                  )}
                >
                  {st.val}
                </span>
              </div>
            ))}
          </div>

          {/* Rodapé Inferior: Bandeira + Liga LPF + Escudo Limpo do Clube */}
          <div
            className={cn(
              'w-4/5 pt-1 border-t flex items-center justify-center gap-3',
              dividerColorClass
            )}
          >
            <span className={cn('leading-none', size === 'sm' ? 'text-xs' : 'text-base')}>
              {flagEmoji}
            </span>
            <span
              className={cn(
                'font-display font-black tracking-widest uppercase',
                subTextColorClass,
                size === 'sm' ? 'text-[8px]' : 'text-[10px]'
              )}
            >
              LPF
            </span>
            <img
              src={crestUrl}
              alt={team?.name || 'Clube'}
              className={cn(
                'object-contain drop-shadow-md',
                size === 'sm' ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'
              )}
              onError={(e) => {
                e.currentTarget.src = TEMPLATE_ASSETS.crestPlaceholder;
              }}
            />
          </div>
        </div>
      </div>

      {/* BARRA DE AÇÕES DA CARTA (Remoção de Fundo + Retrato IA + Download PNG) */}
      {showActions && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setRemoveBgActive((v) => !v)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border transition-all',
              removeBgActive
                ? 'bg-[#38C958]/15 border-[#38C958]/50 text-[#38C958]'
                : 'bg-zinc-900 border-white/10 text-zinc-400'
            )}
          >
            <Wand2 className="w-3.5 h-3.5" />
            {removeBgActive ? 'Recorte Busto Ativo' : 'Ativar Recorte Busto'}
          </button>

          {onEnhancePortraitAI && (
            <button
              type="button"
              onClick={onEnhancePortraitAI}
              disabled={enhancingAI}
              className="px-3 py-1.5 rounded-full bg-[#00E599]/15 hover:bg-[#00E599]/25 border border-[#00E599]/50 text-[#00E599] dark:text-violet-300 text-[11px] font-extrabold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {enhancingAI ? 'Recriando...' : '✨ Ajustar Retrato com IA'}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadCardPng}
            disabled={downloading}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00E599] to-[#059669] text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Exportando...' : 'Baixar Carta PNG'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Minigame Interativo: Abrir Pack FC 26 / Roleta de Cartas com Walkout Suspense
 */
export interface FC26PackOpenerProps {
  player: Partial<PlayerProfile>;
  team?: Partial<Team> | null;
  onEquipCardDesign: (designUrl: string, designId: string) => void;
}

export function FC26PackOpener({
  player,
  team,
  onEquipCardDesign,
}: FC26PackOpenerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [stage, setStage] = useState<'idle' | 'flag' | 'position' | 'ovr' | 'walkout'>('idle');
  const [pulledDesign, setPulledDesign] = useState<CardDesignAsset>(CARD_DESIGN_ASSETS[3]);

  const macro = useMemo(() => {
    return calculateFC26MacroAndOvr(
      player.attributes || {},
      player.primary_position || 'MEI',
      player.career_stats
    );
  }, [player.attributes, player.primary_position, player.career_stats]);

  const startPackOpening = () => {
    // Sorteia uma carta especial ou icônica
    const specialPool = CARD_DESIGN_ASSETS.filter((c) => c.id !== 'bronze-common');
    const chosen = specialPool[Math.floor(Math.random() * specialPool.length)] || CARD_DESIGN_ASSETS[3];
    setPulledDesign(chosen);
    setModalOpen(true);
    setStage('flag');

    setTimeout(() => setStage('position'), 900);
    setTimeout(() => setStage('ovr'), 1800);
    setTimeout(() => setStage('walkout'), 2800);
  };

  return (
    <>
      <button
        type="button"
        onClick={startPackOpening}
        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-zinc-950 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all"
      >
        <Gift className="w-4 h-4" />
        🎁 Abrir Pack FC 26 / Walkout
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#161920] to-[#0c0e12] border border-amber-500/40 p-6 text-center shadow-[0_0_80px_rgba(124,92,252,0.35)] overflow-hidden">
            {/* Feixes de luz de estádio no fundo */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b from-[#00E599]/30 via-amber-500/20 to-transparent blur-3xl pointer-events-none" />

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {stage === 'flag' && (
              <div className="py-20 space-y-4 animate-pulse">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
                  EA SPORTS FC 26 WALKOUT...
                </span>
                <div className="text-7xl">
                  {(player.nationality || 'BR') === 'AR' ? '🇦🇷' : '🇧🇷'}
                </div>
                <p className="text-lg font-display font-black text-white uppercase tracking-wider">
                  NACIONALIDADE REVELADA
                </p>
              </div>
            )}

            {stage === 'position' && (
              <div className="py-20 space-y-4 animate-pulse">
                <span className="text-xs font-mono uppercase tracking-widest text-[#00E599] block">
                  POSIÇÃO TÁTICA...
                </span>
                <div className="text-6xl font-display font-black text-white tracking-tighter">
                  {(player.primary_position || 'MEI').toUpperCase()}
                </div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                  {team?.name || 'Furia del Plata'}
                </p>
              </div>
            )}

            {stage === 'ovr' && (
              <div className="py-20 space-y-4 animate-bounce">
                <span className="text-xs font-mono uppercase tracking-widest text-[#38C958] block">
                  OVERALL DE CARREIRA...
                </span>
                <div className="text-7xl font-mono font-black text-amber-400">
                  {macro.finalOvr} OVR
                </div>
                <p className="text-sm font-extrabold text-white uppercase">
                  {pulledDesign.name}
                </p>
              </div>
            )}

            {stage === 'walkout' && (
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5" />
                  Walkout Desbloqueado • {pulledDesign.name}
                </div>

                <div className="flex justify-center py-2">
                  <FC26PlayerCard
                    player={player}
                    team={team}
                    cardDesignUrl={pulledDesign.url}
                    size="md"
                    showActions={true}
                  />
                </div>

                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {pulledDesign.unlockRequirement} • Raridade:{' '}
                  <strong className="text-white uppercase">{pulledDesign.rarity}</strong>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={startPackOpening}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-extrabold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Abrir Outro Pack
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onEquipCardDesign(pulledDesign.url, pulledDesign.id);
                      setModalOpen(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#38C958] hover:bg-[#2fb34d] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-[#38C958]/25"
                  >
                    <Check className="w-4 h-4" />
                    Equipar Carta no Meu Perfil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
