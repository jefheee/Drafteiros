import { NextResponse } from 'next/server';

export interface EmailNotificationPayload {
  eventType:
    | 'account_registered'
    | 'registration_approved'
    | 'match_scheduled'
    | 'sumula_pending'
    | 'draft_order_drawn'
    | 'custom_broadcast';
  recipients: string[];
  subject?: string;
  customMessage?: string;
  metadata?: Record<string, unknown>;
}

const DEFAULT_TEMPLATES: Record<
  EmailNotificationPayload['eventType'],
  { subject: string; preview: string }
> = {
  account_registered: {
    subject: '✅ Bem-vindo ao DraftClub Pro Clubs — Conta Multi-Perfil Ativada!',
    preview:
      'Sua conta única de Atleta / Capitão foi criada com sucesso. Configure sua Build e AcceleRATE 2.0!',
  },
  registration_approved: {
    subject: '🏆 Inscrição Integral Confirmada — Equipe Liberada no Campeonato!',
    preview:
      'O responsável da liga confirmou o recebimento integral da inscrição da sua equipe. Bom campeonato!',
  },
  match_scheduled: {
    subject: '📅 Match de Horário Confirmado — Partida Agendada!',
    preview:
      'Os dois capitães fecharam a janela de horário da rodada pelo Tinder de Horários.',
  },
  sumula_pending: {
    subject: '📸 Súmula Lançada por IA — Aguardando Dupla Validação',
    preview:
      'O print de desempenho pós-jogo foi processado pelo Gemini Vision. Acesse Jogos para aprovar.',
  },
  draft_order_drawn: {
    subject: '🎲 Sorteio Oficial da Ordem do Draft Concluído (Snake Draft)',
    preview:
      'A ordem de escolha dos capitães para os +40 atletas foi sorteada. Entre na Sala de Draft!',
  },
  custom_broadcast: {
    subject: '📢 Comunicado Oficial da Organização da Liga',
    preview: 'Mensagem oficial enviada pelo Administrador do Campeonato.',
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmailNotificationPayload;
    const eventType = body.eventType || 'custom_broadcast';
    const recipients = Array.isArray(body.recipients) && body.recipients.length > 0
      ? body.recipients
      : ['capitao@draftclub.pro', 'atleta@draftclub.pro', 'admin@draftclub.pro'];

    const template = DEFAULT_TEMPLATES[eventType] || DEFAULT_TEMPLATES.custom_broadcast;
    const finalSubject = body.subject || template.subject;
    const finalMessage = body.customMessage || template.preview;

    const resendApiKey = process.env.RESEND_API_KEY;
    let providerStatus = 'simulated-outbox-ok';

    if (resendApiKey && resendApiKey.length > 10) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'DraftClub Pro <notificacoes@draftclub.pro>',
            to: recipients,
            subject: finalSubject,
            html: `<div style="font-family:Inter,sans-serif;padding:24px;background:#F5F6FA;border-radius:16px;">
              <h2 style="color:#7C5CFC;margin:0 0 12px 0;">${finalSubject}</h2>
              <p style="color:#18181B;font-size:14px;line-height:1.6;">${finalMessage}</p>
              <hr style="border:none;border-top:1px solid #E4E4E7;margin:16px 0;" />
              <small style="color:#71717A;">DraftClub EA FC 26 Pro Clubs • 100% Premiação</small>
            </div>`,
          }),
        });
        if (res.ok) {
          providerStatus = 'resend-delivered';
        }
      } catch {
        providerStatus = 'simulated-outbox-fallback';
      }
    }

    return NextResponse.json({
      ok: true,
      dispatchedAt: new Date().toISOString(),
      providerStatus,
      eventType,
      subject: finalSubject,
      message: finalMessage,
      recipientsCount: recipients.length,
      recipients,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Falha ao disparar notificações por e-mail.' },
      { status: 500 }
    );
  }
}
