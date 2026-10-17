export type ArchetypePositionGroup =
  | 'Atacante'
  | 'Defensor'
  | 'Goleiro'
  | 'Meio-Campista';

export type PlayStyleCategory =
  | 'Finalização'
  | 'Passe'
  | 'Controle de Bola'
  | 'Defesa'
  | 'Físico'
  | 'Goleiro';

export interface ArchetypeAsset {
  id: string;
  name: string;
  category: ArchetypePositionGroup;
  positionGroup: ArchetypePositionGroup;
  icon: string;
  iconUrl: string;
}

export interface PlayStyleAsset {
  id: string;
  name: string;
  category: PlayStyleCategory;
  baseIcon: string;
  plusIcon: string;
  baseIconUrl: string;
  plusIconUrl: string;
}

export interface AwardAssetItem {
  id: string;
  name: string;
  iconUrl: string;
}

export interface EventAssetItem {
  id: string;
  name: string;
  iconUrl: string;
}

export interface TemplateAssetItem {
  id: string;
  name: string;
  imageUrl: string;
}

// 1. ARQUÉTIPOS REAIS DO EA FC 26 (public/assets/archetypes/)
const RAW_ARCHETYPES: {
  id: string;
  name: string;
  category: ArchetypePositionGroup;
  icon: string;
}[] = [
  {
    id: 'alvo',
    name: 'Alvo',
    category: 'Atacante',
    icon: '/assets/archetypes/Atacante/Alvo/Alvo.png',
  },
  {
    id: 'bruxo',
    name: 'Bruxo',
    category: 'Atacante',
    icon: '/assets/archetypes/Atacante/Bruxo/Bruxo.png',
  },
  {
    id: 'capitao',
    name: 'Capitão',
    category: 'Atacante',
    icon: '/assets/archetypes/Atacante/Capitã/Capitã.png',
  },
  {
    id: 'comandante',
    name: 'Comandante',
    category: 'Meio-Campista',
    icon: '/assets/archetypes/Meio-Campista/Comandante/Comandante.png',
  },
  {
    id: 'cerebro',
    name: 'Cérebro',
    category: 'Meio-Campista',
    icon: '/assets/archetypes/Meio-Campista/Cérebro/Cérebro.png',
  },
  {
    id: 'gatilho',
    name: 'Gatilho',
    category: 'Meio-Campista',
    icon: '/assets/archetypes/Meio-Campista/Gatilho/Gatilho.png',
  },
  {
    id: 'maestro',
    name: 'Maestro',
    category: 'Meio-Campista',
    icon: '/assets/archetypes/Meio-Campista/Maestro/Maestro.png',
  },
  {
    id: 'ambivalente',
    name: 'Ambivalente',
    category: 'Defensor',
    icon: '/assets/archetypes/Defensor/Ambivalente/Ambivalente.png',
  },
  {
    id: 'chefia',
    name: 'Chefia',
    category: 'Defensor',
    icon: '/assets/archetypes/Defensor/Chefia/Chefia.png',
  },
  {
    id: 'compasso',
    name: 'Compasso',
    category: 'Defensor',
    icon: '/assets/archetypes/Defensor/Compasso/Compasso.png',
  },
  {
    id: 'motorzinho',
    name: 'Motorzinho',
    category: 'Defensor',
    icon: '/assets/archetypes/Defensor/Motorzinho/Motorzinho.png',
  },
  {
    id: 'gl-linha',
    name: 'GL-Linha',
    category: 'Goleiro',
    icon: '/assets/archetypes/Goleiro/GL-Linha/GL-Linha.png',
  },
  {
    id: 'muralha',
    name: 'Muralha',
    category: 'Goleiro',
    icon: '/assets/archetypes/Goleiro/Muralha/Muralha.png',
  },
];

export const ARCHETYPE_ASSETS: ArchetypeAsset[] = RAW_ARCHETYPES.map((a) => ({
  ...a,
  positionGroup: a.category,
  iconUrl: a.icon,
}));

export function getArchetypeAsset(nameOrId?: string): ArchetypeAsset {
  if (!nameOrId) return ARCHETYPE_ASSETS[6];
  const lower = nameOrId.toLowerCase();
  return (
    ARCHETYPE_ASSETS.find(
      (a) =>
        a.id === lower ||
        a.name.toLowerCase() === lower ||
        (lower === 'mágico' && a.id === 'bruxo') ||
        (lower === 'finalizador' && a.id === 'alvo')
    ) || ARCHETYPE_ASSETS[6]
  );
}

// 2. PLAYSTYLES REAIS DO EA FC 26 (public/assets/playstyles/)
const RAW_PLAYSTYLES: {
  id: string;
  name: string;
  category: PlayStyleCategory;
  baseIcon: string;
  plusIcon: string;
}[] = [
  // Finalização
  {
    id: 'chute-colocado',
    name: 'Chute colocado',
    category: 'Finalização',
    baseIcon: '/assets/playstyles/Finalização/Chute colocado/Chute colocado-base.png',
    plusIcon: '/assets/playstyles/Finalização/Chute colocado/Chute colocado-plus.png',
  },
  {
    id: 'superchute',
    name: 'Superchute',
    category: 'Finalização',
    baseIcon: '/assets/playstyles/Finalização/Superchute/Superchute-base.png',
    plusIcon: '/assets/playstyles/Finalização/Superchute/Superchute-plus.png',
  },
  {
    id: 'chute-direto-rasteiro',
    name: 'Chute Direto Rasteiro',
    category: 'Finalização',
    baseIcon: '/assets/playstyles/Finalização/Chute Direto Rasteiro/Chute Direto Rasteiro-base.png',
    plusIcon: '/assets/playstyles/Finalização/Chute Direto Rasteiro/Chute Direto Rasteiro-plus.png',
  },
  {
    id: 'cavadinha',
    name: 'Cavadinha',
    category: 'Finalização',
    baseIcon: '/assets/playstyles/Finalização/Cavadinha/Cavadinha-base.png',
    plusIcon: '/assets/playstyles/Finalização/Cavadinha/Cavadinha-plus.png',
  },
  {
    id: 'cabeceio-preciso',
    name: 'Cabeceio Preciso',
    category: 'Finalização',
    baseIcon: '/assets/playstyles/Finalização/Cabeceio Preciso/Cabeceio Preciso-base.png',
    plusIcon: '/assets/playstyles/Finalização/Cabeceio Preciso/Cabeceio Preciso-plus.png',
  },
  {
    id: 'acrobata',
    name: 'Acrobata',
    category: 'Finalização',
    baseIcon: '/assets/playstyles/Finalização/Acrobata/Acrobata-base.png',
    plusIcon: '/assets/playstyles/Finalização/Acrobata/Acrobata-plus.png',
  },
  {
    id: 'bola-parada',
    name: 'Bola parada',
    category: 'Finalização',
    baseIcon: '/assets/playstyles/Finalização/Bola parada/Bola parada-base.png',
    plusIcon: '/assets/playstyles/Finalização/Bola parada/Bola parada-plus.png',
  },
  {
    id: 'vanguarda',
    name: 'Vanguarda',
    category: 'Finalização',
    baseIcon: '/assets/playstyles/Finalização/Vanguarda/Vanguarda-base.png',
    plusIcon: '/assets/playstyles/Finalização/Vanguarda/Vanguarda-plus.png',
  },
  // Passe
  {
    id: 'passe-direto',
    name: 'Passe direto',
    category: 'Passe',
    baseIcon: '/assets/playstyles/Passe/Passe direto/Passe direto-base.png',
    plusIcon: '/assets/playstyles/Passe/Passe direto/Passe direto-plus.png',
  },
  {
    id: 'passe-longo',
    name: 'Passe longo',
    category: 'Passe',
    baseIcon: '/assets/playstyles/Passe/Passe longo/Passe longo-base.png',
    plusIcon: '/assets/playstyles/Passe/Passe longo/Passe longo-plus.png',
  },
  {
    id: 'tiki-taka',
    name: 'Tiki-taka',
    category: 'Passe',
    baseIcon: '/assets/playstyles/Passe/Tiki-taka/Tiki-taka-base.png',
    plusIcon: '/assets/playstyles/Passe/Tiki-taka/Tiki-taka-plus.png',
  },
  {
    id: 'passe-guiado',
    name: 'Passe guiado',
    category: 'Passe',
    baseIcon: '/assets/playstyles/Passe/Passe guiado/Passe guiado-base.png',
    plusIcon: '/assets/playstyles/Passe/Passe guiado/Passe guiado-plus.png',
  },
  {
    id: 'passe-de-gps',
    name: 'Passe de GPS',
    category: 'Passe',
    baseIcon: '/assets/playstyles/Passe/Passe de GPS/Passe de GPS-base.png',
    plusIcon: '/assets/playstyles/Passe/Passe de GPS/Passe de GPS-plus.png',
  },
  {
    id: 'criativo',
    name: 'Criativo',
    category: 'Passe',
    baseIcon: '/assets/playstyles/Passe/Criativo/Criativo-base.png',
    plusIcon: '/assets/playstyles/Passe/Criativo/Criativo-plus.png',
  },
  // Controle de Bola
  {
    id: 'tecnica',
    name: 'Técnica',
    category: 'Controle de Bola',
    baseIcon: '/assets/playstyles/Controle de Bola/Técnica/Técnica-base.png',
    plusIcon: '/assets/playstyles/Controle de Bola/Técnica/Técnica-plus.png',
  },
  {
    id: 'veloz',
    name: 'Veloz',
    category: 'Controle de Bola',
    baseIcon: '/assets/playstyles/Controle de Bola/Veloz/Veloz-base.png',
    plusIcon: '/assets/playstyles/Controle de Bola/Veloz/Veloz-plus.png',
  },
  {
    id: 'dominio',
    name: 'Domínio',
    category: 'Controle de Bola',
    baseIcon: '/assets/playstyles/Controle de Bola/Domínio/Domínio-base.png',
    plusIcon: '/assets/playstyles/Controle de Bola/Domínio/Domínio-plus.png',
  },
  {
    id: 'malvadeza',
    name: 'Malvadeza',
    category: 'Controle de Bola',
    baseIcon: '/assets/playstyles/Controle de Bola/Malvadeza/Malvadeza-base.png',
    plusIcon: '/assets/playstyles/Controle de Bola/Malvadeza/Malvadeza-plus.png',
  },
  {
    id: 'cabeca-fria',
    name: 'Cabeça fria',
    category: 'Controle de Bola',
    baseIcon: '/assets/playstyles/Controle de Bola/Cabeça fria/Cabeça fria-base.png',
    plusIcon: '/assets/playstyles/Controle de Bola/Cabeça fria/Cabeça fria-plus.png',
  },
  // Defesa
  {
    id: 'antecipacao',
    name: 'Antecipação',
    category: 'Defesa',
    baseIcon: '/assets/playstyles/Defesa/Antecipação/Antecipação-base.png',
    plusIcon: '/assets/playstyles/Defesa/Antecipação/Antecipação-plus.png',
  },
  {
    id: 'interceptacao',
    name: 'Interceptação',
    category: 'Defesa',
    baseIcon: '/assets/playstyles/Defesa/Interceptação/Interceptação-base.png',
    plusIcon: '/assets/playstyles/Defesa/Interceptação/Interceptação-plus.png',
  },
  {
    id: 'cercar',
    name: 'Cercar',
    category: 'Defesa',
    baseIcon: '/assets/playstyles/Defesa/Cercar/Cercar-base.png',
    plusIcon: '/assets/playstyles/Defesa/Cercar/Cercar-plus.png',
  },
  {
    id: 'barreira',
    name: 'Barreira',
    category: 'Defesa',
    baseIcon: '/assets/playstyles/Defesa/Barreira/Barreira-base.png',
    plusIcon: '/assets/playstyles/Defesa/Barreira/Barreira-plus.png',
  },
  {
    id: 'carrinho-limpo',
    name: 'Carrinho limpo',
    category: 'Defesa',
    baseIcon: '/assets/playstyles/Defesa/Carrinho limpo/Carrinho limpo-base.png',
    plusIcon: '/assets/playstyles/Defesa/Carrinho limpo/Carrinho limpo-plus.png',
  },
  {
    id: 'forca-aerea',
    name: 'Força Aérea',
    category: 'Defesa',
    baseIcon: '/assets/playstyles/Defesa/Força Aérea/Força Aérea-base.png',
    plusIcon: '/assets/playstyles/Defesa/Força Aérea/Força Aérea-plus.png',
  },
  // Físico
  {
    id: 'pe-de-vento',
    name: 'Pé de vento',
    category: 'Físico',
    baseIcon: '/assets/playstyles/Físico/Pé de vento/Pé de vento-base.png',
    plusIcon: '/assets/playstyles/Físico/Pé de vento/Pé de vento-plus.png',
  },
  {
    id: 'incansavel',
    name: 'Incansável',
    category: 'Físico',
    baseIcon: '/assets/playstyles/Físico/Incansável/Incansável-base.png',
    plusIcon: '/assets/playstyles/Físico/Incansável/Incansável-plus.png',
  },
  {
    id: 'xerife',
    name: 'Xerife',
    category: 'Físico',
    baseIcon: '/assets/playstyles/Físico/Xerife/Xerife-base.png',
    plusIcon: '/assets/playstyles/Físico/Xerife/Xerife-plus.png',
  },
  {
    id: 'solidez',
    name: 'Solidez',
    category: 'Físico',
    baseIcon: '/assets/playstyles/Físico/Solidez/Solidez-base.png',
    plusIcon: '/assets/playstyles/Físico/Solidez/Solidez-plus.png',
  },
  {
    id: 'lateral-longo',
    name: 'Lateral longo',
    category: 'Físico',
    baseIcon: '/assets/playstyles/Físico/Lateral longo/Lateral longo-base.png',
    plusIcon: '/assets/playstyles/Físico/Lateral longo/Lateral longo-plus.png',
  },
  // Goleiro
  {
    id: 'espalma',
    name: 'Espalma',
    category: 'Goleiro',
    baseIcon: '/assets/playstyles/Goleiro/Espalma/Espalma-base.png',
    plusIcon: '/assets/playstyles/Goleiro/Espalma/Espalma-plus.png',
  },
  {
    id: 'braco-elastico',
    name: 'Braço elástico',
    category: 'Goleiro',
    baseIcon: '/assets/playstyles/Goleiro/Braço elástico/Braço elástico-base.png',
    plusIcon: '/assets/playstyles/Goleiro/Braço elástico/Braço elástico-plus.png',
  },
  {
    id: 'usa-os-pes',
    name: 'Usa os pés',
    category: 'Goleiro',
    baseIcon: '/assets/playstyles/Goleiro/Usa os pés/Usa os pés-base.png',
    plusIcon: '/assets/playstyles/Goleiro/Usa os pés/Usa os pés-plus.png',
  },
  {
    id: 'sai-que-e-sua',
    name: 'Sai que é sua',
    category: 'Goleiro',
    baseIcon: '/assets/playstyles/Goleiro/Sai que é sua/Sai que é sua-base.png',
    plusIcon: '/assets/playstyles/Goleiro/Sai que é sua/Sai que é sua-plus.png',
  },
  {
    id: 'saida-segura',
    name: 'Saída segura',
    category: 'Goleiro',
    baseIcon: '/assets/playstyles/Goleiro/Saída segura/Saída segura-base.png',
    plusIcon: '/assets/playstyles/Goleiro/Saída segura/Saída segura-plus.png',
  },
  {
    id: 'lancamento-longo',
    name: 'Lançamento longo',
    category: 'Goleiro',
    baseIcon: '/assets/playstyles/Goleiro/Lançamento longo/Lançamento longo-base.png',
    plusIcon: '/assets/playstyles/Goleiro/Lançamento longo/Lançamento longo-plus.png',
  },
];

export const PLAYSTYLE_ASSETS: PlayStyleAsset[] = RAW_PLAYSTYLES.map((p) => ({
  ...p,
  baseIconUrl: p.baseIcon,
  plusIconUrl: p.plusIcon,
}));

// 3. EVENTOS, TROFÉUS E TEMPLATES OFICIAIS (Híbridos Array + Propriedades Nomeadas)
export const EVENT_ASSETS = Object.assign(
  [
    { id: 'goal', name: 'Gol Marcado', iconUrl: '/assets/events/goal.png' },
    { id: 'assist', name: 'Assistência', iconUrl: '/assets/events/assist.png' },
    { id: 'motm', name: 'MVP da Partida', iconUrl: '/assets/events/motm.png' },
    { id: 'cleanSheet', name: 'Clean Sheet', iconUrl: '/assets/events/clean-sheet.png' },
    { id: 'yellowCard', name: 'Cartão Amarelo', iconUrl: '/assets/events/yellow-card.png' },
    { id: 'redCard', name: 'Cartão Vermelho', iconUrl: '/assets/events/red-card.png' },
  ] as EventAssetItem[],
  {
    goal: '/assets/events/goal.png',
    assist: '/assets/events/assist.png',
    motm: '/assets/events/motm.png',
    cleanSheet: '/assets/events/clean-sheet.png',
    yellowCard: '/assets/events/yellow-card.png',
    redCard: '/assets/events/red-card.png',
  }
);

export const AWARD_ASSETS = Object.assign(
  [
    {
      id: 'firstPlace',
      name: 'Troféu de Ouro (Campeão)',
      iconUrl: '/assets/awards/1st-place.png',
    },
    {
      id: 'secondPlace',
      name: 'Troféu de Prata (Vice)',
      iconUrl: '/assets/awards/2nd-place.png',
    },
    {
      id: 'thirdPlace',
      name: 'Troféu de Bronze (3º Lugar)',
      iconUrl: '/assets/awards/3rd-place.png',
    },
    {
      id: 'goldenBoot',
      name: 'Chuteira de Ouro (Artilheiro)',
      iconUrl: '/assets/awards/golden-boot.png',
    },
    {
      id: 'playmakerTrophy',
      name: 'Troféu Melhor Assistente (Garçom)',
      iconUrl: '/assets/awards/playmaker-trophy.png',
    },
  ] as AwardAssetItem[],
  {
    firstPlace: '/assets/awards/1st-place.png',
    secondPlace: '/assets/awards/2nd-place.png',
    thirdPlace: '/assets/awards/3rd-place.png',
    goldenBoot: '/assets/awards/golden-boot.png',
    playmakerTrophy: '/assets/awards/playmaker-trophy.png',
  }
);

export const PLATFORM_ASSETS = {
  PS5: '/assets/platforms/playstation.png',
  'Xbox Series': '/assets/platforms/xbox.png',
  PC: '/assets/platforms/pc.png',
  OldGen: '/assets/platforms/playstation.png',
};

export interface CardDesignAsset {
  id: string;
  name: string;
  category: 'Padrão' | 'Especial' | 'TOTY & TOTS' | 'Herói & Ídolo';
  url: string;
  textTheme: 'dark' | 'light'; // 'dark' (#2b2210) para cartas claras como Gold Rare/Icon; 'light' (#ffffff) para cartas escuras como TOTY/Promo
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockRequirement: string;
  minOvr?: number;
}

export const TEMPLATE_ASSETS = Object.assign(
  [
    {
      id: 'noite-de-copa',
      name: 'Noite de Copa (Refletores)',
      imageUrl:
        'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&q=85',
    },
    {
      id: 'estadio-pos',
      name: 'Estádio Pós-Jogo (Gramado)',
      imageUrl:
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=85',
    },
    {
      id: 'arena-esports',
      name: 'Arena E-Sports (Holofotes)',
      imageUrl:
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=85',
    },
    {
      id: 'caldeirao-sulamericano',
      name: 'Caldeirão Sul-Americano',
      imageUrl:
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=85',
    },
  ] as TemplateAssetItem[],
  {
    captainBand: '/assets/tactics/captain-band.png',
    defaultCrest: '/assets/templates/crest-placeholder.png',
    crestPlaceholder: '/assets/templates/crest-placeholder.png',
    guestAvatar: '/assets/templates/avatar-placeholder.jpg',
    avatarPlaceholder: '/assets/templates/avatar-placeholder.jpg',
    postGameBackgrounds: [
      {
        id: 'noite-de-copa',
        name: 'Noite de Copa (Refletores)',
        url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&q=85',
        imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&q=85',
      },
      {
        id: 'estadio-pos',
        name: 'Estádio Pós-Jogo (Gramado)',
        url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=85',
        imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=85',
      },
      {
        id: 'arena-esports',
        name: 'Arena E-Sports (Holofotes)',
        url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=85',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=85',
      },
      {
        id: 'caldeirao-sulamericano',
        name: 'Caldeirão Sul-Americano',
        url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=85',
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=85',
      },
    ],
  }
);

// 4. DESIGNS DE CARTAS FC 26 (public/assets/fc-26-clean-card-designs/)
export const CARD_DESIGN_ASSETS: CardDesignAsset[] = [
  {
    id: 'gold-rare',
    name: 'Ouro Raro (Padrão Van Dijk)',
    category: 'Padrão',
    url: '/assets/fc-26-clean-card-designs/default/gold-rare.webp',
    textTheme: 'dark',
    rarity: 'common',
    unlockRequirement: 'Liberada para todos os atletas (OVR 75+)',
    minOvr: 75,
  },
  {
    id: 'silver-rare',
    name: 'Prata Raro',
    category: 'Padrão',
    url: '/assets/fc-26-clean-card-designs/default/silver-rare.webp',
    textTheme: 'dark',
    rarity: 'common',
    unlockRequirement: 'Liberada para todos os atletas',
    minOvr: 65,
  },
  {
    id: 'bronze-rare',
    name: 'Bronze Raro',
    category: 'Padrão',
    url: '/assets/fc-26-clean-card-designs/default/bronze-rare.webp',
    textTheme: 'dark',
    rarity: 'common',
    unlockRequirement: 'Liberada para todos os atletas',
    minOvr: 60,
  },
  {
    id: 'team-of-the-week',
    name: 'Seleção da Semana (TOTW)',
    category: 'Especial',
    url: '/assets/fc-26-clean-card-designs/other/team-of-the-week.webp',
    textTheme: 'light',
    rarity: 'rare',
    unlockRequirement: 'Ser eleito Craque da Partida (MOTM) 1 vez',
    minOvr: 82,
  },
  {
    id: 'future-stars',
    name: 'Future Stars',
    category: 'Especial',
    url: '/assets/fc-26-clean-card-designs/other/future-stars.webp',
    textTheme: 'light',
    rarity: 'rare',
    unlockRequirement: 'Disputar 5 partidas oficiais na liga',
    minOvr: 84,
  },
  {
    id: 'joga-bonito',
    name: 'Joga Bonito',
    category: 'Especial',
    url: '/assets/fc-26-clean-card-designs/other/joga-bonito.webp',
    textTheme: 'light',
    rarity: 'rare',
    unlockRequirement: '5★ de Finta ou 5 assistências na carreira',
    minOvr: 85,
  },
  {
    id: 'ucl-primetime',
    name: 'UCL Primetime',
    category: 'Especial',
    url: '/assets/fc-26-clean-card-designs/other/ucl-primetime.webp',
    textTheme: 'light',
    rarity: 'epic',
    unlockRequirement: 'Classificar para os Playoffs Ouro (G4)',
    minOvr: 86,
  },
  {
    id: 'knockout-royalty',
    name: 'Knockout Royalty',
    category: 'Especial',
    url: '/assets/fc-26-clean-card-designs/other/knockout-royalty.webp',
    textTheme: 'light',
    rarity: 'epic',
    unlockRequirement: 'Marcar em fase eliminatória ou 8+ gols',
    minOvr: 87,
  },
  {
    id: 'thunderstruck',
    name: 'Thunderstruck',
    category: 'Especial',
    url: '/assets/fc-26-clean-card-designs/other/thunderstruck.webp',
    textTheme: 'light',
    rarity: 'epic',
    unlockRequirement: 'Alcançar OVR 88+ ou abrir em Pack Promo',
    minOvr: 88,
  },
  {
    id: 'fc-pro',
    name: 'FC Pro Live',
    category: 'Especial',
    url: '/assets/fc-26-clean-card-designs/other/fc-pro.webp',
    textTheme: 'light',
    rarity: 'epic',
    unlockRequirement: 'Atleta verificado com Build completa',
    minOvr: 86,
  },
  {
    id: 'potm-premier-league',
    name: 'Player of the Month (POTM)',
    category: 'Especial',
    url: '/assets/fc-26-clean-card-designs/potm/potm-premier-league.webp',
    textTheme: 'light',
    rarity: 'epic',
    unlockRequirement: 'Conquistar 3 prêmios de MVP (Craque)',
    minOvr: 88,
  },
  {
    id: 'fantasy-fc-hero',
    name: 'Fantasy FC Hero',
    category: 'Herói & Ídolo',
    url: '/assets/fc-26-clean-card-designs/heroes/fantasy-fc-hero.webp',
    textTheme: 'light',
    rarity: 'legendary',
    unlockRequirement: 'Ser MVP 3 vezes ou abrir no Pack Herói',
    minOvr: 89,
  },
  {
    id: 'prime-heroes',
    name: 'Prime Hero',
    category: 'Herói & Ídolo',
    url: '/assets/fc-26-clean-card-designs/heroes/prime-heroes.webp',
    textTheme: 'light',
    rarity: 'legendary',
    unlockRequirement: '15+ participações em gols na liga',
    minOvr: 90,
  },
  {
    id: 'fut-birthday-hero',
    name: 'FUT Birthday Hero',
    category: 'Herói & Ídolo',
    url: '/assets/fc-26-clean-card-designs/heroes/fut-birthday-hero.webp',
    textTheme: 'light',
    rarity: 'legendary',
    unlockRequirement: 'Desbloqueio via Pack Especial ou 1 Título',
    minOvr: 90,
  },
  {
    id: 'icon',
    name: 'Ídolo Oficial (Icon)',
    category: 'Herói & Ídolo',
    url: '/assets/fc-26-clean-card-designs/icons/icon.webp',
    textTheme: 'dark',
    rarity: 'legendary',
    unlockRequirement: 'Campeão Oficial da Liga ou Lenda do Clube',
    minOvr: 91,
  },
  {
    id: 'toty-icon',
    name: 'TOTY Icon',
    category: 'Herói & Ídolo',
    url: '/assets/fc-26-clean-card-designs/icons/toty-icon.webp',
    textTheme: 'dark',
    rarity: 'legendary',
    unlockRequirement: 'Campeão + Artilheiro/Garçom ou Pack Ídolo',
    minOvr: 93,
  },
  {
    id: 'tots-champions',
    name: 'TOTS Champions',
    category: 'TOTY & TOTS',
    url: '/assets/fc-26-clean-card-designs/tots/tots-champions.webp',
    textTheme: 'light',
    rarity: 'legendary',
    unlockRequirement: '10+ gols ou assistências em campeonatos',
    minOvr: 91,
  },
  {
    id: 'toty',
    name: 'Team of the Year (TOTY)',
    category: 'TOTY & TOTS',
    url: '/assets/fc-26-clean-card-designs/toty/toty.webp',
    textTheme: 'light',
    rarity: 'legendary',
    unlockRequirement: 'Marcar 10+ gols ou alcançar OVR 92+',
    minOvr: 92,
  },
];

export function getCardDesignByUrlOrId(urlOrId?: string): CardDesignAsset {
  if (!urlOrId) return CARD_DESIGN_ASSETS[0];
  return (
    CARD_DESIGN_ASSETS.find(
      (c) => c.id === urlOrId || c.url === urlOrId || urlOrId.includes(c.id)
    ) || CARD_DESIGN_ASSETS[0]
  );
}

