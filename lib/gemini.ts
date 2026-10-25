/**
 * Gerenciador Server-Side de IA Gemini Vision (Zero Digitação + Rotação de Chaves Round-Robin + Failover)
 * NUNCA expõe chaves no client-side. Lê exclusivamente variáveis de ambiente de servidor:
 * GEMINI_API_KEYS (separadas por vírgula) ou GEMINI_API_KEY.
 */

import { PlayerAttributes } from '@/types/database';
import { DEFAULT_PLAYER_ATTRIBUTES } from '@/lib/accelerate';

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
 * Executa chamada multimodal à REST API do Google Gemini (gemini-2.5-flash -> gemini-1.5-flash)
 * com rotação Round-Robin entre chaves e suporte a imagens Base64 inline.
 */
export async function callGeminiWithRotation(params: {
  systemInstruction: string;
  userPrompt: string;
  inlineImageBase64?: string;
  secondaryImageBase64?: string;
  mimeType?: string;
  responseJson?: boolean;
}): Promise<{ text: string; keyIndexUsed: number; modelUsed: string } | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    return null;
  }

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
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
            temperature: 0.7,
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

export function getMockOcrMatchSheet(): OcrMatchSheetResult {
  return {
    home_score: 2,
    away_score: 7,
    motm_name: 'HAALANDINHO',
    confidence: 99.4,
    summary_note:
      'Placar 2x7 (Furia del Plata vs La Catimba) e estatísticas por Nome do Personagem extraídos automaticamente por visão computacional.',
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
      'Atributos de Qualidades/Corpo (Altura 175cm, Peso 68kg, Aceleração 94, Agilidade 92, Força 74 -> AcceleRATE Explosiva) lidos da imagem via Gemini Vision.',
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
        whatsapp_text: `🚨 *NOTA DE REPÚDIO OFICIAL - ${team.toUpperCase()}* 🚨\n\nA diretoria do *${team}*, em conjunto com seu camisa 10 *${player}*, vem a público manifestar total indignação com os acontecimentos na partida contra o *${rival}* (${score})${extra}.\n\nMesmo com servidor oscilando, mostramos força dentro de campo. Exigimos providências imediatas da organização da Liga LPF 5x5!\n\n📌 *Diretoria Executiva — ${team}* 🛡️`,
        instagram_caption: `COMUNICADO IMPORTANTE! 🚨 A diretoria do ${team} não vai se calar diante do que aconteceu hoje em campo contra o ${rival}. Contra tudo e contra todos! ⚔️🔥`,
        comunicado_graphic_text: `A diretoria do ${team}, representada por ${player}, manifesta repúdio oficial aos fatos ocorridos no confronto diante do ${rival} (${score}). Seguimos firmes em busca do título da Liga 5x5 LPF!`,
        hashtags: ['#ProClubs26', '#ComunicadoImportante', '#EAFC26', '#LigaLPF5x5'],
        used_mock: true,
      };

    case 'provocacao_rival':
      return {
        title: `CLIMA DE CLÁSSICO — ${team} vs ${rival}`,
        whatsapp_text: `👀 *AVISO AO ${rival.toUpperCase()}!* 👀\n\nFalaram a semana inteira no grupo da Liga, mas hoje às 22h30 o papo é dentro das quatro linhas! O *${player}* já subiu a foto do boneco e o *${team}* vem completo${extra}.\n\nSeparem o print do lobby porque hoje tem baile! 🤫🔥`,
        instagram_caption: `Hoje o ${team} entra em campo pra mostrar quem manda na Liga 5x5! Prepara o colete, ${rival}! 🤫⚽🔥`,
        comunicado_graphic_text: `HOJE TEM CLÁSSICO! O ${team} convoca sua torcida para o duelo decisivo diante do ${rival}. Com ${player} confirmado, entramos em campo para buscar mais 3 pontos no G4!`,
        hashtags: ['#DiaDeJogo', '#Matchday', '#ProClubsBrasil', '#EAFC26'],
        used_mock: true,
      };

    case 'nota_oficial_clube':
      return {
        title: `COMUNICADO OFICIAL — ${team.toUpperCase()}`,
        whatsapp_text: `📋 *COMUNICADO OFICIAL — ${team.toUpperCase()}*\n\nInformamos à imprensa e aos torcedores que o elenco fechou a preparação para a sequência da Liga 5x5 LPF (${score})${extra}.\n\nSob comando de *${player}*, o clube reafirma o foco total na classificação para o G4 e na premiação máxima da temporada.\n\n🎙️ *Assessoria — ${team}*`,
        instagram_caption: `Comunicado Oficial: foco 100% na classificação para as semifinais! O ${team} segue firme no projeto. 🛡️⚡`,
        comunicado_graphic_text: `A presidência do ${team} informa que o elenco concluiu a preparação tática para a rodada decisiva da Liga 5x5 LPF. Sob liderança de ${player}, buscamos a liderança isolada da temporada.`,
        hashtags: ['#ComunicadoOficial', '#Drafteiros', '#Campeonato'],
        used_mock: true,
      };

    case 'anuncio_contratacao':
      return {
        title: `BEM-VINDO AO CLUBE — ${player.toUpperCase()}`,
        whatsapp_text: `🚨 *HERE WE GO! CONTRATAÇÃO OFICIAL!* 🚨\n\nAcabou a novela no Draft! *${player}* é o novo reforço oficial do *${team}* para a temporada oficial${extra}!\n\nO craque já teve o registro liberado na Liga e estreia hoje mesmo!\n\n✍️ *"Vim pra fazer história e buscar esse troféu!"* — ${player}`,
        instagram_caption: `CONTRATADO! ✍️🔥 ${player} chega para reforçar o elenco do ${team} na disputa pelo título! 🚀⚽`,
        comunicado_graphic_text: `CONTRATAÇÃO OFICIAL! O ${team} anuncia a chegada de ${player} para a disputa do campeonato oficial. Bem-vindo ao time!`,
        hashtags: ['#Contratado', '#DraftAoVivo', '#NovoReforco', '#Drafteiros'],
        used_mock: true,
      };

    case 'entrevista_pos_jogo':
    default:
      return {
        title: `FALA, CRAQUE! — ${player.toUpperCase()}`,
        whatsapp_text: `🎙️ *ZONA MISTA DRAFTEIROS — ENTREVISTA PÓS-JOGO*\n\n⚽ *Placar Final:* ${team} ${score} ${rival}\n⭐ *Craque em Destaque:* ${player}\n\n💬 *"Sabíamos que o jogo contra o ${rival} seria decidido nos detalhes${extra}. Nosso entrosamento encaixou e seguimos fortes na competição!"*`,
        instagram_caption: `Fala, Craque! 🎙️⭐ Palavras de quem deixou tudo em campo pelo ${team}! 🏆`,
        comunicado_graphic_text: `"Nossa equipe mostrou entrega do início ao fim diante do ${rival} (${score}). Seguimos focados no topo da competição!" — ${player}.`,
        hashtags: ['#ZonaMista', '#CraqueDoJogo', '#MOTM', '#Drafteiros'],
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
  const idea = params.sceneIdea || 'Comemorando gol na chuva apontando para o escudo do clube';

  const detected_visual_summary = params.hasUploadedAvatar
    ? 'Traços faciais, corte de cabelo, estrutura corporal e uniforme lidos automaticamente pela IA Vision a partir das fotos reais dos personagens e camisas selecionadas.'
    : 'Leitura visual baseada nas fotos reais de rosto/corpo do elenco e nas cores oficiais do uniforme do clube.';

  const prompt_en = `Hyper-realistic 8K sports broadcast photography of EA Sports FC 26 Pro Clubs athlete(s) "${player}" playing for "${team}". Visual appearance extracted directly from the player's uploaded EA FC face & full-body photos and club kit reference (primary hex ${primary}, secondary hex ${secondary}, zero commercial sponsors on the chest, clean official crest). Action & Scene: ${idea}. Environment: Packed South American stadium at night under heavy dramatic rain, volumetric floodlights, wet grass droplets in slow motion, Canon EOS R3 400mm f/2.8L telephoto lens, Frostbite Engine skin pores and wet jersey fabric realism.`;

  const prompt_pt = `Fotografia hiper-realista em 8K de transmissão esportiva do(s) personagem(ns) "${player}" atuando pelo "${team}" no EA Sports FC 26 Pro Clubs. Rosto, fisionomia de corpo inteiro e uniforme extraídos diretamente por Visão Computacional das fotos reais cadastradas no clube (cores ${primary} e ${secondary}, camisa limpa sem patrocinadores, apenas escudo oficial). Cena em campo: ${idea}. Ambiente: Estádio sul-americano lotado à noite sob chuva intensa, refletores volumétricos, lente teleobjetiva 400mm f/2.8, textura hiper-realista motor Frostbite.`;

  return {
    prompt_en,
    prompt_pt,
    detected_visual_summary,
    negative_prompt:
      'sponsors, commercial logos, bet logos, cartoon, anime, lowres, blurry face, deformed hands, extra fingers, watermark, text overlay',
    camera_settings: 'Canon EOS R3 • 400mm f/2.8L IS III • ISO 800 • 1/2000s • Broadcast HDR',
    style_tags: [
      'Gemini 2.5 Flash Multimodal',
      'Fidelidade Rosto + Corpo + Uniforme',
      'Zero Patrocinadores',
      'Hiper Realismo de Estádio 8K',
    ],
    generated_image_url: null,
    external_generators: [
      {
        name: 'Google ImageFX (Imagen 3)',
        url: 'https://aitestkitchen.withgoogle.com/tools/image-fx',
        badge: 'Ultra Realista',
      },
      {
        name: 'Bing Image Creator (DALL-E 3)',
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
