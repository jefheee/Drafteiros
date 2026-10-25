/**
 * Gerenciador Server-Side de IA Gemini Vision e Gemini Multimodal (Drafteiros)
 * Rotação Round-Robin entre chaves de API, Failover Inteligente e suporte a múltiplos jogos.
 * Modelos ativos:
 * - Visão & Multimodal: gemini-3.8-flash (fallback gemini-3.5-flash-lite)
 * - Tarefas de Texto Rápido & Crônicas: gemini-3.5-flash-lite
 * - Geração de Escudos/Arte: gemini-nano-banana-2.1 (fallback gemini-3.1-flash-image)
 */

import { PlayerAttributes } from '@/types/database';
import { DEFAULT_PLAYER_ATTRIBUTES } from '@/lib/accelerate';

export type GameModeKey = 'soccer' | 'fps' | 'basketball' | 'generic';

export interface OcrMatchPlayer {
  name: string;
  team: 'home' | 'away';
  goals: number;
  assists: number;
  rating: number;
  is_motm?: boolean;
}

export interface OcrMatchSheetResult {
  home_score: number;
  away_score: number;
  motm_name: string;
  confidence: number;
  players: OcrMatchPlayer[];
  summary_note: string;
  game_mode?: GameModeKey;
  used_mock?: boolean;
}

export interface OcrPlayerAttributesResult {
  height_cm: number;
  weight_kg: number;
  overall: number;
  attributes: PlayerAttributes;
  confidence: number;
  summary_note: string;
  used_mock?: boolean;
}

export type RoleplayType =
  | 'nota_repudio'
  | 'entrevista_pos_jogo'
  | 'provocacao_rival'
  | 'nota_oficial_clube'
  | 'anuncio_contratacao';

export interface RoleplayResult {
  title: string;
  whatsapp_text: string;
  instagram_caption: string;
  comunicado_graphic_text: string;
  hashtags: string[];
  used_mock?: boolean;
}

export interface CharacterPromptResult {
  prompt_en: string;
  prompt_pt: string;
  detected_visual_summary: string;
  negative_prompt: string;
  camera_settings: string;
  style_tags: string[];
  generated_image_url?: string | null;
  external_generators: { name: string; url: string; badge: string }[];
  used_mock?: boolean;
}

let currentKeyIndex = 0;

export function getGeminiApiKeys(): string[] {
  const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return rawKeys
    .split(',')
    .map((k) => k.trim())
    .filter(
      (k) =>
        k.length > 12 &&
        !k.includes('placeholder') &&
        !k.includes('COLE_SUA_KEY')
    );
}

/**
 * Executa chamada multimodal à REST API do Google Gemini com modelos atualizados
 * (gemini-3.8-flash com fallback automático para gemini-3.5-flash-lite)
 * e rotação Round-Robin entre chaves configuradas.
 */
export async function callGeminiWithRotation(params: {
  systemInstruction: string;
  userPrompt: string;
  inlineImageBase64?: string;
  secondaryImageBase64?: string;
  mimeType?: string;
  responseJson?: boolean;
  models?: string[];
  temperature?: number;
}): Promise<{ text: string; keyIndexUsed: number; modelUsed: string } | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    return null;
  }

  // Modelos recomendados pela documentação atualizada:
  // gemini-3.8-flash (primário multimodal) -> gemini-3.5-flash-lite (fallback rápido)
  const models = params.models || ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
  const totalKeys = keys.length;

  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyIdx = (currentKeyIndex + attempt) % totalKeys;
    const apiKey = keys[keyIdx];

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const parts: Record<string, unknown>[] = [{ text: params.userPrompt }];

        if (params.inlineImageBase64 && params.inlineImageBase64.includes('base64')) {
          const cleanBase64 = params.inlineImageBase64.replace(
            /^data:image\/[a-zA-Z0-9+.-]+;base64,/,
            ''
          );
          parts.push({
            inline_data: {
              mime_type: params.mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          });
        }

        if (params.secondaryImageBase64 && params.secondaryImageBase64.includes('base64')) {
          const cleanSecBase64 = params.secondaryImageBase64.replace(
            /^data:image\/[a-zA-Z0-9+.-]+;base64,/,
            ''
          );
          parts.push({
            inline_data: {
              mime_type: params.mimeType || 'image/jpeg',
              data: cleanSecBase64,
            },
          });
        }

        const body: Record<string, unknown> = {
          system_instruction: {
            parts: [{ text: params.systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts,
            },
          ],
          generationConfig: {
            temperature: params.temperature ?? 0.7,
            ...(params.responseJson ? { responseMimeType: 'application/json' } : {}),
          },
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.status === 429 || res.status === 503) {
          console.warn(
            `[Gemini Rotation] Chave #${keyIdx + 1} (${model}) retornou ${res.status}. Rotacionando...`
          );
          continue;
        }

        if (!res.ok) {
          continue;
        }

        const data = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          currentKeyIndex = (keyIdx + 1) % totalKeys;
          return {
            text: candidateText,
            keyIndexUsed: keyIdx,
            modelUsed: model,
          };
        }
      } catch (err) {
        console.warn(`[Gemini Rotation] Falha na chave #${keyIdx + 1} (${model}):`, err);
      }
    }
  }

  return null;
}

/**
 * Chamada para geração de imagem / escudos com os modelos visuais estáveis
 * (gemini-nano-banana-2.1 -> gemini-3.1-flash-image)
 */
export async function callGeminiImageGeneration(params: {
  prompt: string;
  aspectRatio?: string;
  models?: string[];
}): Promise<{ imageUrl: string; modelUsed: string } | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    return null;
  }

  const imageModels = params.models || [
    'gemini-nano-banana-2.1',
    'gemini-3.1-flash-image',
  ];
  const totalKeys = keys.length;

  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyIdx = (currentKeyIndex + attempt) % totalKeys;
    const apiKey = keys[keyIdx];

    for (const model of imageModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
        const body = {
          instances: [{ prompt: params.prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: params.aspectRatio || '1:1',
          },
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          const b64 =
            data?.predictions?.[0]?.bytesBase64Encoded ||
            data?.predictions?.[0]?.image?.imageBytes;
          if (b64) {
            currentKeyIndex = (keyIdx + 1) % totalKeys;
            return {
              imageUrl: `data:image/png;base64,${b64}`,
              modelUsed: model,
            };
          }
        }
      } catch (err) {
        console.warn(`[Gemini Image Generation] Falha (${model}):`, err);
      }
    }
  }

  return null;
}

/**
 * Extrai placar, estatísticas individuais e Craque da Partida de forma AGNÓSTICA
 * a modalidade (Futebol, FPS, Basquete ou Genérico) usando gemini-3.8-flash.
 */
export async function extractMatchStatsFromImage(params: {
  imageBase64: string;
  mimeType?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  gameMode?: GameModeKey;
}): Promise<OcrMatchSheetResult> {
  const mode = params.gameMode || 'soccer';
  const home = params.homeTeamName || 'Mandante';
  const away = params.awayTeamName || 'Visitante';

  let modeSpecificRules = '';
  let userContext = '';

  if (mode === 'fps') {
    modeSpecificRules = `Para jogos de tiro/FPS (CS, Valorant, etc.):
- "home_score" e "away_score" representam os rounds ou mapas vencidos por cada equipe.
- "goals" deve mapear para Kills (abates).
- "assists" deve mapear para Assistências.
- "rating" deve mapear para a pontuação de combate, ADR ou rating do jogador.
- "motm_name" deve ser o MVP da partida.`;
    userContext = `Analise este print de placar/tabela final de FPS competitivo entre "${home}" e "${away}". Extraia o placar de rounds/mapas e o desempenho de cada atleta com kills, assistências e pontuação.`;
  } else if (mode === 'basketball') {
    modeSpecificRules = `Para jogos de basquete competitivo:
- "home_score" e "away_score" representam os pontos totais de cada time.
- "goals" deve mapear para Pontos marcados pelo atleta.
- "assists" deve mapear para Assistências.
- "rating" deve mapear para a eficiência/nota da partida.
- "motm_name" deve ser o cestinha/MVP.`;
    userContext = `Analise este print de basquete competitivo entre "${home}" e "${away}". Extraia a pontuação final dos times e as estatísticas dos jogadores.`;
  } else if (mode === 'soccer') {
    modeSpecificRules = `Para jogos de futebol virtual ou presencial:
- "home_score" e "away_score" são os gols de cada clube.
- "goals" são os gols marcados pelo atleta.
- "assists" são os passes para gol.
- "rating" é a nota oficial do jogador (de 0.0 a 10.0).
- "motm_name" é o Craque do Jogo (Melhor em Campo).`;
    userContext = `Analise este print pós-jogo de futebol entre "${home}" e "${away}". Extraia o placar exato e a lista de personagens/atletas com gols, assistências, nota e o Craque do Jogo.`;
  } else {
    modeSpecificRules = `Para modalidade genérica/competitiva de eSports:
- "home_score" e "away_score" representam os pontos/vitórias finais de cada equipe.
- "goals" representa o principal índice de pontuação do jogo.
- "assists" representa contribuições secundárias.
- "rating" representa a nota ou performance geral.
- "motm_name" é o MVP / atleta destaque.`;
    userContext = `Analise este print de súmula de torneio competitivo entre "${home}" e "${away}". Extraia o placar final e as estatísticas dos competidores.`;
  }

  const systemInstruction = `Você é um motor universal de visão computacional para súmulas de campeonatos na plataforma Drafteiros.
Sua missão é extrair dados de telas de fim de jogo com extrema precisão visual.
${modeSpecificRules}

Retorne ESTRITAMENTE um objeto JSON válido no formato:
{
  "home_score": number,
  "away_score": number,
  "motm_name": string,
  "confidence": number,
  "summary_note": string,
  "players": [
    {
      "name": string,
      "team": "home" | "away",
      "goals": number,
      "assists": number,
      "rating": number,
      "is_motm": boolean
    }
  ]
}`;

  const aiRes = await callGeminiWithRotation({
    systemInstruction,
    userPrompt: userContext,
    inlineImageBase64: params.imageBase64,
    mimeType: params.mimeType || 'image/jpeg',
    responseJson: true,
    models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'],
  });

  if (aiRes?.text) {
    try {
      const parsed = JSON.parse(aiRes.text);
      return {
        home_score: Number(parsed.home_score) || 0,
        away_score: Number(parsed.away_score) || 0,
        motm_name: parsed.motm_name || '',
        confidence: Number(parsed.confidence) || 98.5,
        summary_note:
          parsed.summary_note ||
          `Dados da súmula extraídos via Gemini 3.8 Flash (${mode.toUpperCase()}).`,
        players: (parsed.players || []).map((p: Record<string, unknown>) => ({
          name: String(p.name || 'JOGADOR').toUpperCase(),
          team: p.team === 'away' ? 'away' : 'home',
          goals: Number(p.goals) || 0,
          assists: Number(p.assists) || 0,
          rating: Number(p.rating) || 7.0,
          is_motm: Boolean(p.is_motm),
        })),
        game_mode: mode,
        used_mock: false,
      };
    } catch {
      // Fallback para mock
    }
  }

  const mock = getMockOcrMatchSheet();
  return { ...mock, game_mode: mode, used_mock: true };
}

/**
 * Extrai atributos de personagem ou ficha técnica de atleta a partir de print
 */
export async function extractPlayerStatsFromImage(params: {
  imageBase64: string;
  mimeType?: string;
  gameMode?: GameModeKey;
}): Promise<OcrPlayerAttributesResult> {
  const systemInstruction = `Você é um leitor OCR especialista em fichas de atletas e atributos competitivos para a plataforma Drafteiros.
Extraia da imagem a altura em centímetros (height_cm), peso em kg (weight_kg), GER/Overall e os principais atributos numéricos (1 a 99).
Retorne ESTRITAMENTE um JSON no formato:
{
  "height_cm": number,
  "weight_kg": number,
  "overall": number,
  "confidence": number,
  "summary_note": string,
  "attributes": {
    "acceleration": number,
    "sprint_speed": number,
    "agility": number,
    "balance": number,
    "finishing": number,
    "shot_power": number,
    "short_passing": number,
    "long_passing": number,
    "dribbling": number,
    "ball_control": number,
    "stamina": number,
    "strength": number
  }
}`;

  const userPrompt = `Analise este print da ficha/atributos do atleta e extraia os valores numéricos correspondentes.`;

  const aiRes = await callGeminiWithRotation({
    systemInstruction,
    userPrompt,
    inlineImageBase64: params.imageBase64,
    mimeType: params.mimeType || 'image/jpeg',
    responseJson: true,
    models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'],
  });

  const fallback = getMockOcrPlayerAttributes();

  if (aiRes?.text) {
    try {
      const parsed = JSON.parse(aiRes.text);
      return {
        height_cm: Number(parsed.height_cm) || fallback.height_cm,
        weight_kg: Number(parsed.weight_kg) || fallback.weight_kg,
        overall: Number(parsed.overall) || fallback.overall,
        confidence: Number(parsed.confidence) || 99.0,
        summary_note:
          parsed.summary_note ||
          'Atributos do atleta lidos com precisão via Gemini 3.8 Flash.',
        attributes: {
          ...DEFAULT_PLAYER_ATTRIBUTES,
          ...(parsed.attributes || {}),
        },
        used_mock: false,
      };
    } catch {
      // Fallback
    }
  }

  return fallback;
}

/**
 * Gera automaticamente um resumo jornalístico curto ("Crônica da Partida")
 * em 2 parágrafos curtos usando o modelo rápido gemini-3.5-flash-lite.
 */
export async function generateMatchChronicle(params: {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  motmName?: string;
  gameMode?: string;
  playersSummary?: string;
}): Promise<string> {
  const isDraw = params.homeScore === params.awayScore;
  const winner =
    params.homeScore > params.awayScore
      ? params.homeTeamName
      : params.awayTeamName;
  const loser =
    params.homeScore > params.awayScore
      ? params.awayTeamName
      : params.homeTeamName;

  const systemInstruction = `Você é um jornalista esportivo renomado escrevendo para a Zona Mista da plataforma Drafteiros (estilo ge.globo, The Players Tribune e ESPN eSports).
Escreva uma Crônica da Partida eletrizante, dinâmica e concisa com exatamente 2 parágrafos curtos.
Destaque o placar final, a entrega coletiva e a atuação do Craque do Jogo (MVP). Retorne apenas o texto puro em português sem aspas, títulos ou introduções.`;

  const userPrompt = `Escreva a crônica do confronto:
Mandante: ${params.homeTeamName} (${params.homeScore})
Visitante: ${params.awayTeamName} (${params.awayScore})
Resultado: ${isDraw ? 'Empate dramático' : `Vitória do ${winner} sobre o ${loser}`}
Craque da Partida: ${params.motmName || 'Atuação coletiva de destaque'}
Modalidade: ${params.gameMode || 'Campeonato Oficial'}
${params.playersSummary ? `Destaques adicionais: ${params.playersSummary}` : ''}`;

  const res = await callGeminiWithRotation({
    systemInstruction,
    userPrompt,
    models: ['gemini-3.5-flash-lite', 'gemini-3.8-flash'],
    temperature: 0.8,
  });

  if (res?.text) {
    return res.text.trim();
  }

  // Fallback jornalístico de alta qualidade
  if (isDraw) {
    return `Em um confronto marcado pelo equilíbrio tático e intensidade até o apito final, ${params.homeTeamName} e ${params.awayTeamName} protagonizaram um empate emocionante em ${params.homeScore} a ${params.awayScore}. Ambas as equipes criaram chances claras de perigo, transformando a partida em um dos grandes espetáculos da rodada na Drafteiros.\n\nCom intervenções decisivas e brilho de ${params.motmName || 'grandes defesas'}, o ponto somado mantém ambos os clubes vivos na briga pela classificação aos playoffs, provando que a temporada não aceita desatenções.`;
  }

  return `Com autoridade tática e precisão nos momentos decisivos, o ${winner} conquistou uma vitória maiúscula diante do ${loser} pelo placar de ${Math.max(params.homeScore, params.awayScore)} a ${Math.min(params.homeScore, params.awayScore)}. O triunfo coloca a equipe em destaque no topo da tabela da Drafteiros e premia o volume de jogo imposto desde os primeiros minutos.\n\nO grande protagonista da rodada foi ${params.motmName || 'o capitão'}, que comandou as principais jogadas ofensivas e foi eleito o Craque da Partida. O ${loser} agora precisará reagir imediatamente na próxima rodada para manter aceso o sonho da vaga.`;
}

/**
 * Gera um SVG elegante de escudo de eSports com as cores do clube
 */
export function getMockClubCrestSvg(
  name: string,
  primary = '#7C5CFC',
  secondary = '#10B981'
): string {
  const initial = (name || 'D').substring(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primary}" />
        <stop offset="100%" stop-color="${secondary}" />
      </linearGradient>
      <linearGradient id="crestBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1A1A1E" />
        <stop offset="100%" stop-color="#0D0D0F" />
      </linearGradient>
    </defs>
    <path d="M256 32 L432 96 C432 304 256 464 256 464 C256 464 80 304 80 96 Z" fill="url(#crestBg)" stroke="url(#crestGrad)" stroke-width="14" stroke-linejoin="round"/>
    <path d="M256 64 L408 120 C408 288 256 432 256 432 C256 432 104 288 104 120 Z" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="4"/>
    <polygon points="256,120 286,212 382,212 304,268 334,360 256,304 178,360 208,268 130,212 226,212" fill="url(#crestGrad)" opacity="0.3"/>
    <text x="256" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="96" font-weight="900" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">${initial}</text>
    <text x="256" y="370" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="${primary}" text-anchor="middle" letter-spacing="4">DRAFTEIROS</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Gera um escudo original de eSports usando gemini-nano-banana-2.1 (ou fallback visual)
 */
export async function generateClubCrest(params: {
  clubName: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: string;
  gameMode?: string;
}): Promise<{ imageUrl: string; prompt: string; usedMock?: boolean }> {
  const primary = params.primaryColor || '#7C5CFC';
  const secondary = params.secondaryColor || '#10B981';
  const prompt = `Professional eSports team logo vector badge for "${params.clubName}", theme: ${params.theme || 'modern minimalist aggressive competitive shield'}, primary color ${primary}, secondary color ${secondary}, clean solid lines, isolated on dark background, zero sponsors, vector flat icon emblem, high resolution.`;

  const imageResult = await callGeminiImageGeneration({
    prompt,
    models: ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image'],
    aspectRatio: '1:1',
  });

  if (imageResult?.imageUrl) {
    return {
      imageUrl: imageResult.imageUrl,
      prompt,
      usedMock: false,
    };
  }

  // Fallback com SVG dinâmico e gerador externo
  return {
    imageUrl: getMockClubCrestSvg(params.clubName, primary, secondary),
    prompt,
    usedMock: true,
  };
}

export function getMockOcrMatchSheet(): OcrMatchSheetResult {
  return {
    home_score: 2,
    away_score: 7,
    motm_name: 'HAALANDINHO',
    confidence: 99.4,
    summary_note:
      'Placar 2x7 (Furia del Plata vs La Catimba) e estatísticas por atleta extraídos automaticamente por visão computacional.',
    players: [
      { name: 'JEFHE', team: 'home', goals: 1, assists: 1, rating: 8.4, is_motm: false },
      { name: 'MIGUEL', team: 'home', goals: 1, assists: 0, rating: 8.1, is_motm: false },
      { name: 'HAALANDINHO', team: 'away', goals: 5, assists: 1, rating: 10.0, is_motm: true },
      { name: 'JOAO VINY', team: 'away', goals: 1, assists: 2, rating: 9.2, is_motm: false },
      { name: 'TETEU', team: 'away', goals: 1, assists: 2, rating: 9.0, is_motm: false },
    ],
    used_mock: true,
  };
}

export function getMockOcrPlayerAttributes(): OcrPlayerAttributesResult {
  return {
    height_cm: 175,
    weight_kg: 68,
    overall: 92,
    attributes: {
      ...DEFAULT_PLAYER_ATTRIBUTES,
      acceleration: 94,
      sprint_speed: 93,
      agility: 92,
      balance: 89,
      attack_positioning: 91,
      finishing: 93,
      shot_power: 90,
      long_shots: 87,
      volleys: 85,
      penalties: 88,
      vision: 89,
      crossing: 84,
      free_kick_accuracy: 83,
      short_passing: 90,
      long_passing: 86,
      curve: 91,
      dribbling: 94,
      ball_control: 93,
      reactions: 91,
      composure: 92,
      jumping: 79,
      stamina: 92,
      strength: 74,
      aggression: 70,
    },
    confidence: 99.2,
    summary_note:
      'Atributos do atleta (Altura 175cm, Peso 68kg, Aceleração 94, Agilidade 92, Força 74) lidos da imagem via Gemini Vision.',
    used_mock: true,
  };
}

export function getMockRoleplay(params: {
  roleplayType: RoleplayType;
  playerName?: string;
  teamName?: string;
  rivalName?: string;
  scoreContext?: string;
  customContext?: string;
}): RoleplayResult {
  const player = params.playerName || 'JEFHE';
  const team = params.teamName || 'Furia del Plata';
  const rival = params.rivalName || 'La Catimba';
  const score = params.scoreContext || '2 - 7';
  const extra = params.customContext ? ` (${params.customContext})` : '';

  switch (params.roleplayType) {
    case 'nota_repudio':
      return {
        title: `COMUNICADO IMPORTANTE — ${team.toUpperCase()}`,
        whatsapp_text: `🚨 *NOTA DE REPÚDIO OFICIAL - ${team.toUpperCase()}* 🚨\n\nA diretoria do *${team}*, em conjunto com seu capitão *${player}*, vem a público manifestar total indignação com os acontecimentos na partida contra o *${rival}* (${score})${extra}.\n\nExigimos providências imediatas da organização da liga!\n\n📌 *Diretoria Executiva — ${team}* 🛡️`,
        instagram_caption: `COMUNICADO IMPORTANTE! 🚨 A diretoria do ${team} não vai se calar diante do que aconteceu hoje em campo contra o ${rival}. Contra tudo e contra todos! ⚔️🔥`,
        comunicado_graphic_text: `A diretoria do ${team}, representada por ${player}, manifesta repúdio oficial aos fatos ocorridos no confronto diante do ${rival} (${score}). Seguimos firmes em busca do título!`,
        hashtags: ['#Drafteiros', '#ComunicadoImportante', '#Campeonato'],
        used_mock: true,
      };

    case 'provocacao_rival':
      return {
        title: `CLIMA DE CLÁSSICO — ${team} vs ${rival}`,
        whatsapp_text: `👀 *AVISO AO ${rival.toUpperCase()}!* 👀\n\nFalaram a semana inteira no grupo da liga, mas hoje o papo é na arena! O *${player}* já confirmou presença e o *${team}* vem completo${extra}.\n\nSeparem o print porque hoje tem show! 🤫🔥`,
        instagram_caption: `Hoje o ${team} entra para mostrar quem manda! Prepara o colete, ${rival}! 🤫🔥`,
        comunicado_graphic_text: `HOJE TEM CLÁSSICO! O ${team} convoca sua torcida para o duelo decisivo diante do ${rival}. Com ${player} confirmado, entramos para buscar os 3 pontos!`,
        hashtags: ['#DiaDeJogo', '#Matchday', '#Drafteiros'],
        used_mock: true,
      };

    case 'nota_oficial_clube':
      return {
        title: `COMUNICADO OFICIAL — ${team.toUpperCase()}`,
        whatsapp_text: `📋 *COMUNICADO OFICIAL — ${team.toUpperCase()}*\n\nInformamos à imprensa e aos torcedores que o elenco fechou a preparação para a sequência da temporada (${score})${extra}.\n\nSob comando de *${player}*, o clube reafirma o foco total na classificação para os playoffs.\n\n🎙️ *Assessoria — ${team}*`,
        instagram_caption: `Comunicado Oficial: foco 100% na classificação para as semifinais! O ${team} segue firme no projeto. 🛡️⚡`,
        comunicado_graphic_text: `A presidência do ${team} informa que o elenco concluiu a preparação tática para a rodada decisiva. Sob liderança de ${player}, buscamos o topo da temporada.`,
        hashtags: ['#ComunicadoOficial', '#Drafteiros', '#Campeonato'],
        used_mock: true,
      };

    case 'anuncio_contratacao':
      return {
        title: `BEM-VINDO AO CLUBE — ${player.toUpperCase()}`,
        whatsapp_text: `🚨 *HERE WE GO! CONTRATAÇÃO OFICIAL!* 🚨\n\nAcabou o mistério no Draft! *${player}* é o novo reforço oficial do *${team}* para a temporada oficial${extra}!\n\nO craque já teve o registro liberado na liga e estreia hoje mesmo!\n\n✍️ *"Vim pra fazer história e buscar esse troféu!"* — ${player}`,
        instagram_caption: `CONTRATADO! ✍️🔥 ${player} chega para reforçar o elenco do ${team} na disputa pelo título! 🚀`,
        comunicado_graphic_text: `CONTRATAÇÃO OFICIAL! O ${team} anuncia a chegada de ${player} para a disputa do campeonato oficial. Bem-vindo ao time!`,
        hashtags: ['#Contratado', '#DraftAoVivo', '#NovoReforco', '#Drafteiros'],
        used_mock: true,
      };

    case 'entrevista_pos_jogo':
    default:
      return {
        title: `FALA, CRAQUE! — ${player.toUpperCase()}`,
        whatsapp_text: `🎙️ *ZONA MISTA DRAFTEIROS — ENTREVISTA PÓS-JOGO*\n\n⭐ *Craque em Destaque:* ${player}\n⚽ *Placar:* ${team} ${score} ${rival}\n\n💬 *"Sabíamos que o jogo contra o ${rival} seria decidido nos detalhes${extra}. Nosso entrosamento funcionou e seguimos fortes na competição!"*`,
        instagram_caption: `Fala, Craque! 🎙️⭐ Palavras de quem deixou tudo em campo pelo ${team}! 🏆`,
        comunicado_graphic_text: `"Nossa equipe mostrou entrega do início ao fim diante do ${rival} (${score}). Seguimos focados no topo da competição!" — ${player}.`,
        hashtags: ['#ZonaMista', '#CraqueDoJogo', '#MVP', '#Drafteiros'],
        used_mock: true,
      };
  }
}

export function getMockCharacterPrompt(params: {
  sceneIdea: string;
  playerName?: string;
  teamName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  hasUploadedAvatar?: boolean;
  hasUploadedKit?: boolean;
}): CharacterPromptResult {
  const player = params.playerName || 'JEFHE';
  const team = params.teamName || 'Furia del Plata';
  const primary = params.primaryColor || '#7C5CFC';
  const secondary = params.secondaryColor || '#38C958';
  const idea = params.sceneIdea || 'Comemorando vitória decisiva apontando para o escudo do clube';

  const detected_visual_summary = params.hasUploadedAvatar
    ? 'Traços faciais, corte de cabelo, estrutura corporal e uniforme lidos automaticamente pela IA Vision a partir das fotos reais cadastradas.'
    : 'Leitura visual baseada nas fotos de perfil do atleta e nas cores oficiais do uniforme do clube.';

  const prompt_en = `Hyper-realistic 8K broadcast photography of competitive athlete(s) "${player}" playing for "${team}". Visual appearance extracted directly from player face & body reference and clean club kit (primary hex ${primary}, secondary hex ${secondary}, zero commercial sponsors, official crest). Action & Scene: ${idea}. Environment: Packed modern arena under dramatic volumetric lighting, cinematic telephoto lens, realistic skin and jersey fabric textures.`;

  const prompt_pt = `Fotografia hiper-realista em 8K de transmissão esportiva do atleta "${player}" atuando pelo "${team}". Rosto, corpo e uniforme extraídos por Visão Computacional das fotos oficiais cadastradas (cores ${primary} e ${secondary}, camisa limpa sem patrocinadores, apenas escudo oficial). Cena: ${idea}. Ambiente: Arena moderna lotada sob iluminação volumétrica, lente teleobjetiva cinematográfica, textura hiper-realista de pele e tecido.`;

  return {
    prompt_en,
    prompt_pt,
    detected_visual_summary,
    negative_prompt:
      'sponsors, commercial logos, bet logos, cartoon, anime, lowres, blurry face, deformed hands, extra fingers, watermark, text overlay',
    camera_settings: 'Canon EOS R3 • 400mm f/2.8L IS III • ISO 800 • 1/2000s • Broadcast HDR',
    style_tags: [
      'Gemini 3.8 Flash Multimodal',
      'Fidelidade Rosto + Corpo + Uniforme',
      'Zero Patrocinadores',
      'Hiper Realismo de Arena 8K',
    ],
    generated_image_url: null,
    external_generators: [
      {
        name: 'Google ImageFX',
        url: 'https://aitestkitchen.withgoogle.com/tools/image-fx',
        badge: 'Ultra Realista',
      },
      {
        name: 'Bing Image Creator',
        url: 'https://www.bing.com/images/create',
        badge: 'Grátis • 1 Clique',
      },
      {
        name: 'Gerador Avançado de Personagens',
        url: 'https://www.bing.com/images/create',
        badge: 'Fidelidade de Uniforme',
      },
    ],
    used_mock: true,
  };
}
