import { NextResponse } from 'next/server';
import {
  callGeminiWithRotation,
  getMockOcrMatchSheet,
  getMockRoleplay,
  getMockCharacterPrompt,
  RoleplayType,
} from '@/lib/gemini';

// Limite de segurança de payload (4.2 MB) para compatibilidade com Vercel Serverless Functions
const MAX_PAYLOAD_BYTES = 4.2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'A imagem enviada excede o limite de 4MB da Vercel. Envie um print mais leve ou recortado.',
        },
        { status: 413 }
      );
    }

    const body = rawBody ? JSON.parse(rawBody) : {};
    const { action } = body;

    // =========================================================================
    // AÇÃO 1: OCR DE SÚMULA DO EA FC 26 POR FOTO (ocr_match_sheet)
    // =========================================================================
    if (action === 'ocr_match_sheet') {
      const { imageBase64, mimeType, homeTeamName, awayTeamName } = body;

      const systemInstruction = `Você é um motor especializado de OCR de visão computacional para o jogo EA Sports FC 26 (modo Pro Clubs).
Sua tarefa é ler prints de final de partida (Desempenho de Jogadores / Resumo da Partida) e retornar ESTRITAMENTE um objeto JSON contendo:
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

      const userPrompt = `Analise este print pós-jogo do EA FC 26 Pro Clubs entre "${homeTeamName || 'Furia del Plata'}" e "${awayTeamName || 'Boca Juniors FC'}". Extraia o placar exato e a lista de jogadores detectados na tela com gols, assistências e nota da partida (0.0 a 10.0).`;

      const aiResponse = await callGeminiWithRotation({
        systemInstruction,
        userPrompt,
        inlineImageBase64: imageBase64,
        mimeType: mimeType || 'image/jpeg',
        responseJson: true,
      });

      if (aiResponse?.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          return NextResponse.json({
            ok: true,
            data: { ...parsed, used_mock: false },
            meta: { model: aiResponse.modelUsed, keyIndex: aiResponse.keyIndexUsed },
          });
        } catch {
          // fallback para mock caso JSON venha malformado
        }
      }

      return NextResponse.json({
        ok: true,
        data: getMockOcrMatchSheet(),
        meta: { model: 'gemini-vision-fallback', keyIndex: 0 },
      });
    }

    // =========================================================================
    // AÇÃO 2: GERADOR DE ROLEPLAY / COMUNICADOS OFICIAIS MULTIMODAL (generate_roleplay)
    // =========================================================================
    if (action === 'generate_roleplay') {
      const {
        roleplayType = 'nota_repudio',
        playerName,
        teamName,
        rivalName,
        scoreContext,
        customContext,
        avatarImageBase64,
        kitImageBase64,
        mimeType,
      } = body;

      const systemInstruction = `Você é um redator criativo e diretor de comunicação de clubes de EA FC 26 Pro Clubs (estilo aplicativo Jogueiros).
Se imagens do boneco ou do escudo/uniforme forem anexadas, observe os detalhes visuais (cores da camisa, estilo do jogador) para enriquecer o texto.
Retorne ESTRITAMENTE um JSON no formato:
{
  "title": string,
  "whatsapp_text": string,
  "instagram_caption": string,
  "comunicado_graphic_text": string,
  "hashtags": string[]
}`;

      const userPrompt = `Gere um comunicado/roleplay do tipo "${roleplayType}".
Atleta/Capitão: ${playerName || 'Jefhe'}
Clube: ${teamName || 'Furia del Plata'}
Adversário: ${rivalName || 'Boca Juniors FC'}
Placar/Último Jogo: ${scoreContext || '3 x 1'}
Contexto Adicional: ${customContext || 'Jogo decisivo pela Liga 5x5 LPF'}`;

      const aiResponse = await callGeminiWithRotation({
        systemInstruction,
        userPrompt,
        inlineImageBase64: avatarImageBase64,
        secondaryImageBase64: kitImageBase64,
        mimeType: mimeType || 'image/jpeg',
        responseJson: true,
      });

      const baseMock = getMockRoleplay({
        roleplayType: roleplayType as RoleplayType,
        playerName,
        teamName,
        rivalName,
        scoreContext,
        customContext,
      });

      if (aiResponse?.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          return NextResponse.json({
            ok: true,
            data: { ...baseMock, ...parsed, used_mock: false },
            meta: { model: aiResponse.modelUsed, keyIndex: aiResponse.keyIndexUsed },
          });
        } catch {
          // fallback
        }
      }

      return NextResponse.json({
        ok: true,
        data: baseMock,
        meta: { model: 'jogueiros-roleplay-engine', keyIndex: 0 },
      });
    }

    // =========================================================================
    // AÇÃO 3: GERADOR MULTIMODAL DE IMAGEM/PROMPT PELA FOTO DO BONECO (Zero Digitação)
    // =========================================================================
    if (action === 'generate_character_prompt') {
      const {
        sceneIdea,
        playerName,
        teamName,
        primaryColor,
        secondaryColor,
        avatarImageBase64,
        kitImageBase64,
        mimeType,
      } = body;

      const systemInstruction = `Você é um Diretor de Arte de E-Sports e Visão Computacional especialista no motor Frostbite do EA Sports FC 26.
FILOSOFIA ZERO DIGITAÇÃO: O jogador NÃO digitou características físicas. Você DEVE inspecionar visualmente a foto anexada do personagem no EA FC (rosto, tom de pele, corte e cor do cabelo, barba, acessórios) e a foto do escudo/uniforme do time, combinando o que você enxerga nas fotos com a cena pedida pelo usuário para gerar um Prompt Mestre hiper-realista em 8K.
Retorne ESTRITAMENTE um JSON com:
{
  "prompt_en": string,
  "prompt_pt": string,
  "detected_visual_summary": string,
  "negative_prompt": string,
  "camera_settings": string,
  "style_tags": string[]
}`;

      const userPrompt = `Analise visualmente a(s) foto(s) anexada(s) do boneco do jogador "${playerName || 'Jefhe'}" e do uniforme do time "${teamName || 'Furia del Plata'}" (Cores: ${primaryColor || '#7C5CFC'} e ${secondaryColor || '#38C958'}).
Crie a descrição visual e o Prompt Mestre 8K para a cena: "${sceneIdea || 'Comemorando gol na chuva provocando a torcida rival'}".`;

      const aiResponse = await callGeminiWithRotation({
        systemInstruction,
        userPrompt,
        inlineImageBase64: avatarImageBase64,
        secondaryImageBase64: kitImageBase64,
        mimeType: mimeType || 'image/jpeg',
        responseJson: true,
      });

      const baseMock = getMockCharacterPrompt({
        sceneIdea,
        playerName,
        teamName,
        primaryColor,
        secondaryColor,
        hasUploadedAvatar: Boolean(avatarImageBase64),
        hasUploadedKit: Boolean(kitImageBase64),
      });

      if (aiResponse?.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          return NextResponse.json({
            ok: true,
            data: {
              ...baseMock,
              ...parsed,
              used_mock: false,
            },
            meta: { model: aiResponse.modelUsed, keyIndex: aiResponse.keyIndexUsed },
          });
        } catch {
          // fallback
        }
      }

      return NextResponse.json({
        ok: true,
        data: baseMock,
        meta: { model: 'gemini-2.5-flash-vision', keyIndex: 0 },
      });
    }

    return NextResponse.json(
      { ok: false, error: `Ação desconhecida: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Erro seguro no processamento server-side do AI Studio.',
      },
      { status: 500 }
    );
  }
}
