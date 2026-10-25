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
    subject: '✅ Bem-vindo ao Drafteiros — Conta Multi-Perfil Ativada!',
    preview:
      'Sua conta de Atleta / Capitão foi criada com sucesso. Configure sua Carta Pro e participe do campeonato!',
  },
  registration_approved: {
    subject: '🏆 Inscrição Confirmada — Equipe Liberada no Campeonato!',
    preview:
      'A coordenação da liga confirmou a inscrição da sua equipe. Bom campeonato!',
  },
  match_scheduled: {
    subject: '📅 Horário Confirmado — Partida Agendada!',
    preview:
      'Os dois capitães fecharam a janela de horário da rodada na agenda do Drafteiros.',
  },
  sumula_pending: {
    subject: '📸 Súmula Lançada por IA — Aguardando Dupla Validação',
    preview:
      'O print de desempenho pós-jogo foi processado por inteligência artificial. Acesse Partidas para aprovar.',
  },
  draft_order_drawn: {
    subject: '🎲 Sorteio Oficial da Ordem do Draft Concluído',
    preview:
      'A ordem de escolha das equipes foi sorteada. Acesse a Sala de Draft!',
  },
  custom_broadcast: {
    subject: '📢 Comunicado Oficial da Organização',
    preview: 'Mensagem oficial enviada pela coordenação do campeonato.',
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmailNotificationPayload;
    const eventType = body.eventType || 'custom_broadcast';
    const recipients = Array.isArray(body.recipients) && body.recipients.length > 0
      ? body.recipients
      : ['contato@drafteiros.com'];

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
            from: 'Drafteiros <notificacoes@drafteiros.com>',
            to: recipients,
            subject: finalSubject,
            html: `<div style="font-family:Inter,sans-serif;padding:24px;background:#0D0D0F;color:#F4F4F5;border-radius:16px;">
              <h2 style="color:#FFFFFF;margin:0 0 12px 0;">${finalSubject}</h2>
              <p style="color:#A1A1AA;font-size:14px;line-height:1.6;">${finalMessage}</p>
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:16px 0;" />
              <small style="color:#71717A;">Drafteiros • Plataforma Oficial de Campeonatos e Draft</small>
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
