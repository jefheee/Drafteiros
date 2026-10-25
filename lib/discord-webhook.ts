/**
 * Integração com Webhook do Discord para Comunidades e Ligas Competitivas
 * Dispara automaticamente Embeds limpos para o Discord quando:
 * 1. Uma súmula é validada pelos capitães (com placar, MVP e crônica jornalística).
 * 2. Um jogador é convocado na sala de Draft ao vivo.
 * 3. O administrador testa a conexão no painel /admin.
 */

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
  image?: {
    url: string;
  };
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

const BRAND_LOGO_URL = 'https://drafteiros.vercel.app/drafteiros/icon-512x512.jpg';

/**
 * Envia um payload qualquer para a URL do Webhook do Discord
 */
export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: payload.username || 'Drafteiros Bot',
        avatar_url: payload.avatar_url || BRAND_LOGO_URL,
        ...payload,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('[Discord Webhook] Falha ao enviar notificação:', err);
    return false;
  }
}

/**
 * Dispara notificação quando uma partida tem sua súmula oficial aprovada
 */
export async function sendMatchValidatedEmbed(
  webhookUrl: string,
  params: {
    homeTeamName: string;
    awayTeamName: string;
    homeScore: number;
    awayScore: number;
    homeLogo?: string | null;
    awayLogo?: string | null;
    motmName?: string;
    chronicle?: string;
    tournamentName?: string;
    roundNumber?: number;
    proofImageUrl?: string | null;
  }
): Promise<boolean> {
  const isDraw = params.homeScore === params.awayScore;
  const winner =
    params.homeScore > params.awayScore
      ? params.homeTeamName
      : params.awayTeamName;

  const statusText = isDraw
    ? 'Empate eletrizante no apito final!'
    : `Vitória do **${winner}** confirmada!`;

  const fields: DiscordEmbedField[] = [
    {
      name: '⚔️ Confronto',
      value: `**${params.homeTeamName}** \`${params.homeScore}\`  vs  \`${params.awayScore}\` **${params.awayTeamName}**`,
      inline: false,
    },
  ];

  if (params.motmName) {
    fields.push({
      name: '⭐ Craque da Partida (MVP)',
      value: `**${params.motmName}**`,
      inline: true,
    });
  }

  if (params.roundNumber) {
    fields.push({
      name: '🗓️ Rodada',
      value: `Rodada ${params.roundNumber}`,
      inline: true,
    });
  }

  if (params.tournamentName) {
    fields.push({
      name: '🏆 Campeonato',
      value: params.tournamentName,
      inline: true,
    });
  }

  if (params.chronicle) {
    fields.push({
      name: '📰 Crônica da Partida',
      value: params.chronicle.length > 1000 ? `${params.chronicle.substring(0, 997)}...` : params.chronicle,
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    title: `🏆 Súmula Validada • ${params.homeTeamName} vs ${params.awayTeamName}`,
    description: statusText,
    color: 0x10b981, // Emerald Green
    fields,
    footer: {
      text: 'Drafteiros • Gestão Competitiva e Estatísticas em Tempo Real',
      icon_url: BRAND_LOGO_URL,
    },
    timestamp: new Date().toISOString(),
  };

  if (params.proofImageUrl && params.proofImageUrl.startsWith('http')) {
    embed.image = { url: params.proofImageUrl };
  }

  return sendDiscordWebhook(webhookUrl, {
    username: 'Drafteiros • Súmula Oficial',
    embeds: [embed],
  });
}

/**
 * Dispara notificação quando um atleta é convocado no Draft
 */
export async function sendDraftPickEmbed(
  webhookUrl: string,
  params: {
    teamName: string;
    playerName: string;
    position?: string;
    overall?: number;
    round?: number;
    pickNumber?: number;
    tournamentName?: string;
    teamLogo?: string | null;
    avatarUrl?: string | null;
  }
): Promise<boolean> {
  const fields: DiscordEmbedField[] = [
    {
      name: '🛡️ Clube Convocador',
      value: `**${params.teamName}**`,
      inline: true,
    },
    {
      name: '👤 Atleta Selecionado',
      value: `**${params.playerName}** ${params.overall ? `(GER ${params.overall})` : ''}`,
      inline: true,
    },
  ];

  if (params.position) {
    fields.push({
      name: '📍 Posição',
      value: params.position,
      inline: true,
    });
  }

  if (params.pickNumber) {
    fields.push({
      name: '🎯 Pick #',
      value: `Escolha #${params.pickNumber}${params.round ? ` (Round ${params.round})` : ''}`,
      inline: true,
    });
  }

  const embed: DiscordEmbed = {
    title: '📢 DRAFT AO VIVO: Convocação Confirmada!',
    description: `O **${params.teamName}** convocou oficialmente **${params.playerName}** para a temporada!`,
    color: 0x7c5cfc, // Purple / Brand
    fields,
    footer: {
      text: `Drafteiros • ${params.tournamentName || 'Draft Oficial'}`,
      icon_url: BRAND_LOGO_URL,
    },
    timestamp: new Date().toISOString(),
  };

  if (params.avatarUrl && params.avatarUrl.startsWith('http')) {
    embed.thumbnail = { url: params.avatarUrl };
  }

  return sendDiscordWebhook(webhookUrl, {
    username: 'Drafteiros • Draft Room',
    embeds: [embed],
  });
}

/**
 * Envia mensagem de teste de conectividade no painel de administração
 */
export async function sendTestDiscordWebhook(
  webhookUrl: string,
  tournamentName = 'Temporada Oficial'
): Promise<boolean> {
  const embed: DiscordEmbed = {
    title: '🟢 Webhook Conectado com Sucesso!',
    description: `A integração do Discord para a liga **${tournamentName}** está ativa e pronta para enviar atualizações de partidas, súmulas aprovadas por IA e picks do Draft.`,
    color: 0x10b981,
    fields: [
      {
        name: 'Plataforma',
        value: 'Drafteiros (Web + PWA)',
        inline: true,
      },
      {
        name: 'Eventos Ativos',
        value: '✅ Súmula Validada\n✅ Picks do Draft\n✅ Crônicas de Jogos',
        inline: true,
      },
    ],
    footer: {
      text: 'Drafteiros • Sistema de Notificações em Tempo Real',
      icon_url: BRAND_LOGO_URL,
    },
    timestamp: new Date().toISOString(),
  };

  return sendDiscordWebhook(webhookUrl, {
    username: 'Drafteiros Bot',
    embeds: [embed],
  });
}
