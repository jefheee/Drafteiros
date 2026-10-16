/**
 * Gerenciador de IA Gemini com Rotação de Chaves (Round-Robin + Failover Automático)
 * Suporta múltiplas chaves em GEMINI_API_KEYS (separadas por vírgula) ou GEMINI_API_KEY.
 * Caso nenhuma chave esteja configurada, retorna mocks hiper-realistas do universo EA FC 26 Pro Clubs.
 */

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
  hashtags: string[];
  used_mock?: boolean;
}

export interface CharacterPromptResult {
  prompt_en: string;
  prompt_pt: string;
  negative_prompt: string;
  camera_settings: string;
  style_tags: string[];
  generated_image_url?: string | null;
  external_generators: { name: string; url: string; badge: string }[];
  used_mock?: boolean;
}

// Estado global de Round-Robin no processo Node
let currentKeyIndex = 0;

export function getGeminiApiKeys(): string[] {
  const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return rawKeys
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 10 && !k.includes('placeholder'));
}

/**
 * Executa uma chamada à REST API do Google Gemini com Round-Robin entre chaves
 * e fallback automático de modelo (gemini-2.5-flash -> gemini-1.5-flash)
 * em caso de erro 429 (Quota Exceeded) ou 503 (Service Unavailable).
 */
export async function callGeminiWithRotation(params: {
  systemInstruction: string;
  userPrompt: string;
  inlineImageBase64?: string;
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

        if (params.inlineImageBase64) {
          const cleanBase64 = params.inlineImageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
          parts.push({
            inline_data: {
              mime_type: params.mimeType || 'image/jpeg',
              data: cleanBase64,
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
          console.warn(`[Gemini Rotation] Chave #${keyIdx + 1} (${model}) retornou ${res.status}. Tentando failover...`);
          continue;
        }

        if (!res.ok) {
          console.warn(`[Gemini Rotation] Erro HTTP ${res.status} no modelo ${model}.`);
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
        console.warn(`[Gemini Rotation] Exceção na chave #${keyIdx + 1} (${model}):`, err);
      }
    }
  }

  return null;
}

/**
 * Mocks Hiper-Realistas do Universo EA FC 26 Pro Clubs para Desenvolvimento / Fallback
 */
export function getMockOcrMatchSheet(): OcrMatchSheetResult {
  return {
    home_score: 3,
    away_score: 1,
    motm_name: 'Buzz_ProClubs',
    confidence: 98.4,
    summary_note: 'Vitória dominante por 3x1 extraída via leitura óptica da tela de desempenho EA FC 26.',
    players: [
      { name: 'Buzz_ProClubs', team: 'home', goals: 2, assists: 1, rating: 9.6, is_motm: true },
      { name: 'Deivy_10', team: 'home', goals: 1, assists: 1, rating: 8.8, is_motm: false },
      { name: 'Andrei_VOL', team: 'home', goals: 0, assists: 1, rating: 8.4, is_motm: false },
      { name: 'Muralha_GK', team: 'home', goals: 0, assists: 0, rating: 8.1, is_motm: false },
      { name: 'Nacho_9', team: 'away', goals: 1, assists: 0, rating: 7.5, is_motm: false },
    ],
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
  const player = params.playerName || 'Buzz_ProClubs';
  const team = params.teamName || 'Racing Club Digital';
  const rival = params.rivalName || 'River Plate eSports';
  const score = params.scoreContext || '3 x 1';
  const extra = params.customContext ? ` (${params.customContext})` : '';

  switch (params.roleplayType) {
    case 'nota_repudio':
      return {
        title: `NOTA DE REPÚDIO OFICIAL — ${team.toUpperCase()}`,
        whatsapp_text: `🚨 *NOTA DE REPÚDIO OFICIAL - ${team.toUpperCase()}* 🚨\n\nA diretoria do *${team}*, em conjunto com seu capitão *${player}*, vem a público manifestar total indignação com os acontecimentos bizarros na partida contra o *${rival}* (${score})${extra}.\n\nAlém do servidor da EA rodando a 98ms com delay de 2 segundos no botão de passe, presenciamos lances que desafiam a física do EA FC 26! Exigimos abertura imediata de sindicância pelos ADMs da Liga!\n\n📌 *Assinado:* Diretoria Executiva ${team} 🛡️`,
        instagram_caption: `NOTA DE REPÚDIO! 🚨 A diretoria do ${team} não vai se calar diante do que aconteceu hoje em campo contra o ${rival}. Contra tudo, contra o handicap e contra todos! Seguimos gigantes! ⚔️🔥`,
        hashtags: ['#ProClubs26', '#NotaDeRepudio', '#EAFC26', '#LigaArgentina5x5', '#SemHandicap'],
        used_mock: true,
      };

    case 'provocacao_rival':
      return {
        title: `CLIMA QUENTE PRÉ-JOGO — ${team} vs ${rival}`,
        whatsapp_text: `👀 *AVISO AOS NAVEGANTES DO ${rival.toUpperCase()}!* 👀\n\nFalaram muito no grupo a semana inteira, mas hoje às 22h30 o papo é no gramado! O *${player}* já engraxou a chuteira e o *${team}* vem completo${extra}.\n\nJá separem o print do lobby porque esconder o time no vestiário não vai salvar vocês da roda de bobo! 🤫🔥\n\n📍 *Hoje tem aula de Pro Clubs!*`,
        instagram_caption: `Dia de clássico na Liga! Hoje o ${team} entra em campo pra mostrar quem manda no servidor. Prepara o colete, ${rival}! 🤫⚽🔥`,
        hashtags: ['#DiaDeJogo', '#Matchday', '#ProClubsBrasil', '#EAFC26', '#ClimaDeClassico'],
        used_mock: true,
      };

    case 'nota_oficial_clube':
      return {
        title: `COMUNICADO OFICIAL DE IMPRENSA — ${team.toUpperCase()}`,
        whatsapp_text: `📋 *COMUNICADO OFICIAL — ${team.toUpperCase()}*\n\nInformamos à imprensa e aos torcedores que o elenco fechou a preparação tática para a sequência da Liga (${score})${extra}.\n\nSob liderança de *${player}*, o clube reafirma o foco total na classificação para o G4 e na busca pelo título e pela premiação máxima da temporada.\n\n🎙️ *Assessoria de Comunicação — ${team}*`,
        instagram_caption: `Comunicado Oficial: foco 100% na classificação para os playoffs! O ${team} segue firme no projeto. 🛡️⚡`,
        hashtags: ['#ComunicadoOficial', '#ProClubs', '#EAFC26', '#FocoNoTitulo'],
        used_mock: true,
      };

    case 'anuncio_contratacao':
      return {
        title: `HERE WE GO! NOVO REFORÇO NO ${team.toUpperCase()}`,
        whatsapp_text: `🚨 *HERE WE GO! CONTRATAÇÃO OFICIAL!* 🚨\n\nAcabou a novela no Mercadão! *${player}* é o novo reforço oficial do *${team}* para a temporada do EA FC 26${extra}!\n\nMulticampeão, especialista na leitura de espaço e com 92 de precisão no passe, o craque já teve o BID liberado pelos ADMs e estreia hoje mesmo!\n\n✍️ *"Vim pra fazer história e buscar esse troféu!"* — ${player}`,
        instagram_caption: `BEM-VINDO AO GIGANTE! ✍️🔥 ${player} chega para reforçar o elenco do ${team} na disputa pelo título da Liga! Here we go! 🚀⚽`,
        hashtags: ['#HereWeGo', '#MercadaoProClubs', '#NovoReforco', '#EAFC26'],
        used_mock: true,
      };

    case 'entrevista_pos_jogo':
    default:
      return {
        title: `ZONA MISTA PÓS-JOGO — ${player.toUpperCase()}`,
        whatsapp_text: `🎙️ *ZONA MISTA EA FC 26 — ENTREVISTA PÓS-JOGO*\n\n⚽ *Placar Final:* ${team} ${score} ${rival}\n⭐ *Destaque na bancada:* ${player}\n\n💬 *"Sabíamos que o jogo contra o ${rival} seria decidido nos detalhes${extra}. Nossa linha de passe no 5x5 encaixou perfeito, respeitamos a tática do capitão e saímos com os 3 pontos. Quem trabalha e treina calado colhe resultado na tabela!"*\n\n🔥 *${team} segue subindo rumo ao topo!*`,
        instagram_caption: `Fala, Craque! 🎙️⭐ Vitória gigante no clássico (${score}) e palavras de quem decidiu dentro das quatro linhas. Seguimos, ${team}! ⚽🏆`,
        hashtags: ['#ZonaMista', '#CraqueDoJogo', '#MOTM', '#EAFC26', '#ProClubs'],
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
  kitDescription?: string;
  visualTraits?: {
    skin_tone?: string;
    hair_style?: string;
    hair_color?: string;
    facial_hair?: string;
    accessories?: string[];
    shirt_number?: number;
    celebration?: string;
  };
}): CharacterPromptResult {
  const player = params.playerName || 'Buzz';
  const team = params.teamName || 'Racing Club Digital';
  const kit = params.kitDescription || 'vertical light blue and white stripes esports jersey with Betsson chest sponsor';
  const primary = params.primaryColor || '#38bdf8';
  const traits = params.visualTraits || {};
  const skin = traits.skin_tone || 'medium olive skin tone';
  const hair = `${traits.hair_style || 'modern low fade with braided top'} (${traits.hair_color || 'platinum blonde'})`;
  const beard = traits.facial_hair || 'full trimmed goatee beard';
  const acc = traits.accessories?.length ? traits.accessories.join(', ') : 'white athletic headband and wristbands';
  const number = traits.shirt_number || 10;
  const celebration = traits.celebration || 'pointing to the club crest and cupping ear to the crowd';
  const idea = params.sceneIdea || 'Segurando o troféu sob chuva intensa no estádio lotado';

  const prompt_en = `Hyper-realistic 8K sports broadcast photography of an EA Sports FC 26 Pro Clubs e-sports athlete named "${player}" (#${number}) playing for "${team}". Physical traits: ${skin}, ${hair}, ${beard}, wearing ${acc}. Kit design: ${kit}, accents in hex ${primary}, jersey number ${number} clearly visible. Action & Scene: ${idea}, performing signature celebration (${celebration}). Environment: Packed South American night stadium under heavy dramatic rain, volumetric floodlights, wet grass particles flying in slow motion, confetti in club colors, shot on Canon EOS R3 with 400mm f/2.8 telephoto lens, shallow depth of field, Unreal Engine 5 Frostbite Frost-level skin pores and fabric sweat texture, UEFA Champions League & Copa Libertadores broadcast grading.`;

  const prompt_pt = `Fotografia hiper-realista de transmissão esportiva em 8K de um atleta de EA Sports FC 26 Pro Clubs chamado "${player}" (Camisa #${number}) atuando pelo "${team}". Características físicas do boneco: pele ${skin}, cabelo ${hair}, barba estilo ${beard}, usando ${acc}. Uniforme: ${kit} com detalhes em ${primary}. Cena e ação principal: ${idea}, executando a comemoração característica (${celebration}). Ambiente: Estádio sul-americano noturno lotado sob chuva dramática, refletores volumétricos, gotas de chuva e grama molhada em câmera lenta, lente teleobjetiva 400mm f/2.8, textura de suor no tecido e poros da pele estilo motor Frostbite EA FC 26.`;

  return {
    prompt_en,
    prompt_pt,
    negative_prompt: 'cartoon, anime, lowres, blurry face, deformed hands, extra fingers, watermark, text overlay, bad anatomy, plastic skin, PS2 graphics',
    camera_settings: 'Canon EOS R3 • 400mm f/2.8L IS III • ISO 800 • 1/2000s • Broadcast HDR',
    style_tags: ['EA FC 26 Frostbite', '8K Sports Broadcast', 'Night Stadium Rain', 'Pro Clubs Avatar', 'Telephoto f/2.8'],
    generated_image_url: null,
    external_generators: [
      { name: 'Bing Image Creator (DALL-E 3 Grátis)', url: 'https://www.bing.com/images/create', badge: 'Recomendado • Grátis' },
      { name: 'Google ImageFX (Imagen 3)', url: 'https://aitestkitchen.withgoogle.com/tools/image-fx', badge: 'Ultra Realista' },
      { name: 'Leonardo.ai', url: 'https://app.leonardo.ai/', badge: 'Iluminação Gamer' },
      { name: 'ChatGPT Plus / Midjourney', url: 'https://chatgpt.com/', badge: 'Fidelidade de Uniforme' },
    ],
    used_mock: true,
  };
}
