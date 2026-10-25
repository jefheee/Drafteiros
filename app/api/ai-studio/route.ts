import { NextResponse } from 'next/server';
import {
  callGeminiWithRotation,
  extractMatchStatsFromImage,
  extractPlayerStatsFromImage,
  generateMatchChronicle,
  generateClubCrest,
  getMockRoleplay,
  getMockCharacterPrompt,
  RoleplayType,
  GameModeKey,
} from '@/lib/gemini';

const MAX_PAYLOAD_BYTES = 4.5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'A imagem enviada excede o limite de 4.5MB da Vercel. Envie uma imagem compactada ou em WebP.',
        },
        { status: 413 }
      );
    }

    const body = rawBody ? JSON.parse(rawBody) : {};
    const { action } = body;

    // =========================================================================
    // AÇÃO 1: OCR DE SÚMULA MULTIMODAL E MULTI-MODALIDADE (ocr_match_sheet)
    // Suporta Futebol, FPS, Basquete ou Genérico com Gemini 3.8 Flash
    // =========================================================================
    if (action === 'ocr_match_sheet') {
      const {
        imageBase64,
        mimeType,
        homeTeamName,
        awayTeamName,
        gameMode = 'soccer',
      } = body;

      const result = await extractMatchStatsFromImage({
        imageBase64,
        mimeType: mimeType || 'image/jpeg',
        homeTeamName,
        awayTeamName,
        gameMode: gameMode as GameModeKey,
      });

      return NextResponse.json({
        ok: true,
        data: result,
        meta: {
          model: result.used_mock ? 'mock-ocr-fallback' : 'gemini-3.8-flash',
          gameMode,
        },
      });
    }

    // =========================================================================
    // AÇÃO 1B: OCR DE ATRIBUTOS/FICHA DE ATLETA (ocr_player_attributes)
    // =========================================================================
    if (action === 'ocr_player_attributes') {
      const { imageBase64, mimeType, gameMode = 'soccer' } = body;

      const result = await extractPlayerStatsFromImage({
        imageBase64,
        mimeType: mimeType || 'image/jpeg',
        gameMode: gameMode as GameModeKey,
      });

      return NextResponse.json({
        ok: true,
        data: result,
        meta: {
          model: result.used_mock
            ? 'mock-attributes-fallback'
            : 'gemini-3.8-flash',
          gameMode,
        },
      });
    }

    // =========================================================================
    // AÇÃO 2: CRÔNICA JORNALÍSTICA DA PARTIDA (generate_match_chronicle)
    // Utiliza gemini-3.5-flash-lite para gerar resumos instantâneos para a Zona Mista
    // =========================================================================
    if (action === 'generate_match_chronicle') {
      const {
        homeTeamName = 'Mandante',
        awayTeamName = 'Visitante',
        homeScore = 0,
        awayScore = 0,
        motmName,
        gameMode = 'Torneio Competitivo',
        playersSummary,
      } = body;

      const chronicle = await generateMatchChronicle({
        homeTeamName,
        awayTeamName,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        motmName,
        gameMode,
        playersSummary,
      });

      return NextResponse.json({
        ok: true,
        data: { chronicle },
        meta: { model: 'gemini-3.5-flash-lite' },
      });
    }

    // =========================================================================
    // AÇÃO 3: GERADOR DE ESCUDOS DE ESPORTS (club-crest / generate_club_crest)
    // Utiliza gemini-nano-banana-2.1 (fallback gemini-3.1-flash-image / SVG)
    // =========================================================================
    if (action === 'club-crest' || action === 'generate_club_crest') {
      const {
        clubName = 'Novo Clube',
        primaryColor = '#7C5CFC',
        secondaryColor = '#10B981',
        theme = 'shield minimalist competitive eSports',
        gameMode,
      } = body;

      const crestResult = await generateClubCrest({
        clubName,
        primaryColor,
        secondaryColor,
        theme,
        gameMode,
      });

      return NextResponse.json({
        ok: true,
        data: crestResult,
        meta: {
          model: crestResult.usedMock
            ? 'drafteiros-svg-engine'
            : 'gemini-nano-banana-2.1',
        },
      });
    }

    // =========================================================================
    // AÇÃO 4: GERADOR DE ROLEPLAY / COMUNICADOS OFICIAIS (generate_roleplay)
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

      const systemInstruction = `Você é um redator criativo e diretor de comunicação de clubes e organizações competitivas na plataforma Drafteiros.
Retorne ESTRITAMENTE um JSON no formato:
{
  "title": string,
  "whatsapp_text": string,
  "instagram_caption": string,
  "comunicado_graphic_text": string,
  "hashtags": string[]
}`;

      const userPrompt = `Gere um comunicado/roleplay do tipo "${roleplayType}".
Atleta/Capitão: ${playerName || 'JEFHE'}
Clube: ${teamName || 'Furia del Plata'}
Adversário: ${rivalName || 'La Catimba'}
Placar/Último Jogo: ${scoreContext || '2 - 7'}
Contexto Adicional: ${customContext || 'Jogo decisivo pela temporada oficial'}`;

      const aiResponse = await callGeminiWithRotation({
        systemInstruction,
        userPrompt,
        inlineImageBase64: avatarImageBase64,
        secondaryImageBase64: kitImageBase64,
        mimeType: mimeType || 'image/jpeg',
        responseJson: true,
        models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'],
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
        meta: { model: 'drafteiros-roleplay-engine', keyIndex: 0 },
      });
    }

    // =========================================================================
    // AÇÃO 5: GERADOR MULTIMODAL DE CENAS DE ESPORTS (generate_character_prompt)
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

      const systemInstruction = `Você é um Diretor de Arte de E-Sports e Visão Computacional.
Inspecione as referências visuais do atleta e as cores oficiais do uniforme sem patrocinadores para criar um Prompt Mestre 8K hiper-realista.
Retorne ESTRITAMENTE um JSON com:
{
  "prompt_en": string,
  "prompt_pt": string,
  "detected_visual_summary": string,
  "negative_prompt": string,
  "camera_settings": string,
  "style_tags": string[]
}`;

      const userPrompt = `Analise visualmente a foto do atleta "${playerName || 'JEFHE'}" e as cores do time "${teamName || 'Furia del Plata'}" (Primária: ${primaryColor || '#7C5CFC'} e Secundária: ${secondaryColor || '#38C958'}).
Crie a descrição visual e o Prompt Mestre 8K para a cena: "${sceneIdea || 'Comemorando vitória decisiva apontando para o escudo do clube'}".`;

      const aiResponse = await callGeminiWithRotation({
        systemInstruction,
        userPrompt,
        inlineImageBase64: avatarImageBase64,
        secondaryImageBase64: kitImageBase64,
        mimeType: mimeType || 'image/jpeg',
        responseJson: true,
        models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'],
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
        meta: { model: 'gemini-3.8-flash-vision', keyIndex: 0 },
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
        error: error?.message || 'Erro no processamento server-side do AI Studio.',
      },
      { status: 500 }
    );
  }
}
