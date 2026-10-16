import { NextResponse } from 'next/server';
import {
  callGeminiWithRotation,
  getMockOcrMatchSheet,
  getMockRoleplay,
  getMockCharacterPrompt,
  RoleplayType,
} from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // =========================================================================
    // AÇÃO 1: OCR DE SÚMULA DO EA FC 26 (ocr_match_sheet)
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

      const userPrompt = `Analise este print pós-jogo do EA FC 26 Pro Clubs entre "${homeTeamName || 'Time Casa'}" e "${awayTeamName || 'Time Fora'}". Extraia o placar exato e a lista de jogadores detectados na tela com gols, assistências e nota da partida (0.0 a 10.0).`;

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
        meta: { model: 'proclubs-vision-fallback', keyIndex: 0 },
      });
    }

    // =========================================================================
    // AÇÃO 2: GERADOR DE ROLEPLAY / RESENHA DE PRO CLUBS (generate_roleplay)
    // =========================================================================
    if (action === 'generate_roleplay') {
      const {
        roleplayType = 'entrevista_pos_jogo',
        playerName,
        teamName,
        rivalName,
        scoreContext,
        customContext,
      } = body;

      const systemInstruction = `Você é um redator criativo e especialista na cultura de comunidades brasileiras e sul-americanas de EA FC 26 Pro Clubs.
Crie textos imersivos de Roleplay (resenha competitiva, entrevistas de zona mista, notas de repúdio bem-humoradas ou anúncios estilo Fabrizio Romano) prontos para colar no grupo de WhatsApp da Liga ou legendar no Instagram.
Retorne ESTRITAMENTE um JSON no formato:
{
  "title": string,
  "whatsapp_text": string,
  "instagram_caption": string,
  "hashtags": string[]
}`;

      const userPrompt = `Gere um texto do tipo "${roleplayType}".
Atleta/Capitão: ${playerName || 'Capitão'}
Clube: ${teamName || 'Meu Clube'}
Adversário: ${rivalName || 'Rival'}
Placar/Último Jogo: ${scoreContext || '3 x 1'}
Contexto Adicional: ${customContext || 'Jogo disputado na Liga 5x5'}`;

      const aiResponse = await callGeminiWithRotation({
        systemInstruction,
        userPrompt,
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
          // fallback
        }
      }

      const mock = getMockRoleplay({
        roleplayType: roleplayType as RoleplayType,
        playerName,
        teamName,
        rivalName,
        scoreContext,
        customContext,
      });

      return NextResponse.json({
        ok: true,
        data: mock,
        meta: { model: 'proclubs-roleplay-engine', keyIndex: 0 },
      });
    }

    // =========================================================================
    // AÇÃO 3: GERADOR DE PROMPT DE PERSONAGEM 8K (generate_character_prompt)
    // =========================================================================
    if (action === 'generate_character_prompt') {
      const {
        sceneIdea,
        playerName,
        teamName,
        primaryColor,
        secondaryColor,
        kitDescription,
        visualTraits,
      } = body;

      const systemInstruction = `Você é um Diretor de Arte de E-Sports e Engenheiro de Prompts especialista no motor Frostbite do EA Sports FC 26.
Sua tarefa é converter a ideia de cena do jogador + os atributos visuais do boneco dele (visual_traits) + a descrição do uniforme do clube (kit_description) em um Prompt Mestre hiper-realista (em Inglês e Português) no estilo fotografia de transmissão esportiva noturna em 8K.
Retorne ESTRITAMENTE um JSON com:
{
  "prompt_en": string,
  "prompt_pt": string,
  "negative_prompt": string,
  "camera_settings": string,
  "style_tags": string[]
}`;

      const userPrompt = `Crie o Prompt Mestre para a seguinte cena: "${sceneIdea || 'Comemorando título com o troféu na chuva'}".
Nome do Atleta: ${playerName || 'Buzz'}
Clube: ${teamName || 'Racing Club Digital'}
Cores do Clube: Primária ${primaryColor || '#38bdf8'}, Secundária ${secondaryColor || '#ffffff'}
Descrição do Uniforme: ${kitDescription || 'Listrado azul claro e branco estilo Racing com patrocínio Betsson'}
Características Visuais do Boneco: ${JSON.stringify(visualTraits || {})}`;

      const aiResponse = await callGeminiWithRotation({
        systemInstruction,
        userPrompt,
        responseJson: true,
      });

      const baseMock = getMockCharacterPrompt({
        sceneIdea,
        playerName,
        teamName,
        primaryColor,
        secondaryColor,
        kitDescription,
        visualTraits,
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
        meta: { model: 'frostbite-prompt-architect', keyIndex: 0 },
      });
    }

    return NextResponse.json(
      { ok: false, error: `Ação desconhecida: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Erro interno no AI Studio.' },
      { status: 500 }
    );
  }
}
