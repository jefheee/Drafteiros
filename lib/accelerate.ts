import {
  AccelerateSubType,
  AccelerateType,
  BracketType,
  PlayerAttributes,
} from '@/types/database';

export interface AcceleRATEResult {
  type: AccelerateType;
  primaryType: AccelerateType;
  subType: AccelerateSubType;
  badgeColor: string;
  lengthyRatio: number;
  controlledRatio: number;
  explosiveRatio: number;
  lengthyPercent: number;
  controlledPercent: number;
  explosivePercent: number;
  strengthMinusAgility: number;
  agilityMinusStrength: number;
  diagnostics: string[];
  tips: string[];
  summaryText: string;
  description: string;
}

export function calculateAcceleRATE(params: {
  heightCm: number;
  weightKg: number;
  strength: number;
  agility: number;
  acceleration: number;
  sprintSpeed?: number;
  gender?: 'M' | 'F';
}): AcceleRATEResult {
  const {
    heightCm = 185,
    strength = 80,
    agility = 80,
    acceleration = 85,
    gender = 'M',
  } = params;

  const strengthMinusAgility = strength - agility;
  const agilityMinusStrength = agility - strength;

  const isTallForLengthy =
    (gender === 'M' && heightCm >= 185) || (gender === 'F' && heightCm >= 164);
  const isShortForExplosive =
    (gender === 'M' && heightCm <= 182) || (gender === 'F' && heightCm <= 162);

  // 1. 3 Arquétipos Diretos do Modo Clubs
  let type: AccelerateType = 'Controlada';
  if (
    isTallForLengthy &&
    strength >= 65 &&
    acceleration >= 40 &&
    strengthMinusAgility >= 4
  ) {
    type = 'Prolongada';
  } else if (
    isShortForExplosive &&
    agility >= 65 &&
    acceleration >= 80 &&
    agilityMinusStrength >= 10
  ) {
    type = 'Explosiva';
  }

  // 2. Escala Completa de 7 Categorias (AcceleRATE 2.0)
  let subType: AccelerateSubType = 'Controlled (100% Controlada)';
  let lengthyRatio = 0;
  let controlledRatio = 100;
  let explosiveRatio = 0;

  const minHeight100Lengthy = gender === 'M' ? 185 : 164;
  const minHeightMostlyLengthy = gender === 'M' ? 185 : 164;
  const minHeightControlledLengthy = gender === 'M' ? 183 : 162;
  const maxHeightControlledExplosive = gender === 'M' ? 182 : 162;
  const maxHeightMostlyExplosive = gender === 'M' ? 180 : 160;

  if (
    heightCm >= minHeight100Lengthy &&
    strength >= 80 &&
    acceleration >= 40 &&
    strengthMinusAgility >= 14
  ) {
    subType = 'Lengthy (100% Prolongada)';
    lengthyRatio = 100;
    controlledRatio = 0;
    explosiveRatio = 0;
  } else if (
    heightCm >= minHeightMostlyLengthy &&
    strength >= 75 &&
    acceleration >= 40 &&
    strengthMinusAgility >= 8
  ) {
    subType = 'Mostly Lengthy (70% Prolongada / 30% Controlada)';
    lengthyRatio = 70;
    controlledRatio = 30;
    explosiveRatio = 0;
  } else if (
    heightCm >= minHeightControlledLengthy &&
    strength >= 65 &&
    acceleration >= 40 &&
    strengthMinusAgility >= 4
  ) {
    subType = 'Controlled Lengthy (50% Prolongada / 50% Controlada)';
    lengthyRatio = 50;
    controlledRatio = 50;
    explosiveRatio = 0;
  } else if (
    heightCm <= maxHeightMostlyExplosive &&
    acceleration >= 80 &&
    agility >= 80 &&
    agilityMinusStrength >= 15
  ) {
    subType = 'Explosive (100% Explosiva)';
    lengthyRatio = 0;
    controlledRatio = 0;
    explosiveRatio = 100;
  } else if (
    heightCm <= maxHeightMostlyExplosive &&
    acceleration >= 80 &&
    agility >= 75 &&
    agilityMinusStrength >= 10
  ) {
    subType = 'Mostly Explosive (70% Explosiva / 30% Controlada)';
    lengthyRatio = 0;
    controlledRatio = 30;
    explosiveRatio = 70;
  } else if (
    heightCm <= maxHeightControlledExplosive &&
    acceleration >= 70 &&
    agility >= 65 &&
    agilityMinusStrength >= 4
  ) {
    subType = 'Controlled Explosive (50% Explosiva / 50% Controlada)';
    lengthyRatio = 0;
    controlledRatio = 50;
    explosiveRatio = 50;
  }

  // 3. Diagnósticos Inteligentes Ao Vivo
  const diagnostics: string[] = [];

  if (type === 'Prolongada') {
    diagnostics.push(
      `✅ Corrida Prolongada ATIVA! Diferença Força - Agilidade = +${strengthMinusAgility} (mínimo exigido: +4).`
    );
    if (strengthMinusAgility < 14) {
      const need = 14 - strengthMinusAgility;
      diagnostics.push(
        `💡 Faltam +${need} na diferença (Força - Agilidade) para atingir 100% Lengthy pura.`
      );
    }
  } else if (type === 'Explosiva') {
    diagnostics.push(
      `⚡ Corrida Explosiva ATIVA! Diferença Agilidade - Força = +${agilityMinusStrength} (mínimo exigido: +10).`
    );
    if (agilityMinusStrength < 15) {
      const need = 15 - agilityMinusStrength;
      diagnostics.push(
        `💡 Faltam +${need} na diferença (Agilidade - Força) para atingir 100% Explosive pura.`
      );
    }
  } else {
    if (heightCm >= (gender === 'M' ? 185 : 164)) {
      const diffNeeded = Math.max(0, 4 - strengthMinusAgility);
      const strNeeded = Math.max(0, 65 - strength);
      if (diffNeeded > 0) {
        diagnostics.push(
          `🎯 Faltam +${diffNeeded} de Força (ou -${diffNeeded} de Agilidade) para ativar corrida PROLONGADA.`
        );
      }
      if (strNeeded > 0) {
        diagnostics.push(`🎯 Faltam +${strNeeded} de Força para atingir o mínimo de 65.`);
      }
    } else if (heightCm <= (gender === 'M' ? 182 : 162)) {
      const diffNeeded = Math.max(0, 10 - agilityMinusStrength);
      const accNeeded = Math.max(0, 80 - acceleration);
      if (diffNeeded > 0) {
        diagnostics.push(
          `🎯 Faltam +${diffNeeded} de Agilidade (ou -${diffNeeded} de Força) para ativar corrida EXPLOSIVA.`
        );
      }
      if (accNeeded > 0) {
        diagnostics.push(
          `🎯 Faltam +${accNeeded} de Aceleração para atingir o mínimo de 80 para Explosiva.`
        );
      }
    } else {
      const cmToLengthy = (gender === 'M' ? 185 : 164) - heightCm;
      const cmToExplosive = heightCm - (gender === 'M' ? 182 : 162);
      diagnostics.push(
        `📏 Altura neutra (${heightCm}cm): suba +${cmToLengthy}cm para buscar Prolongada ou reduza -${cmToExplosive}cm para buscar Explosiva.`
      );
    }
  }

  const summaryText =
    type === 'Prolongada'
      ? 'Arrancada gradual com velocidade máxima dominante em corridas longas.'
      : type === 'Explosiva'
      ? 'Arrancada inicial ultra rápida nos primeiros metros e mudanças bruscas de direção.'
      : 'Aceleração equilibrada e constante do início ao fim da corrida.';

  const badgeColor =
    type === 'Explosiva' ? '#F59E0B' : type === 'Prolongada' ? '#7C5CFC' : '#38C958';

  return {
    type,
    primaryType: type,
    subType,
    badgeColor,
    lengthyRatio,
    controlledRatio,
    explosiveRatio,
    lengthyPercent: lengthyRatio,
    controlledPercent: controlledRatio,
    explosivePercent: explosiveRatio,
    strengthMinusAgility,
    agilityMinusStrength,
    diagnostics,
    tips: diagnostics,
    summaryText,
    description: summaryText,
  };
}

export const DEFAULT_PLAYER_ATTRIBUTES: PlayerAttributes = {
  acceleration: 90,
  sprint_speed: 92,
  attack_positioning: 88,
  finishing: 90,
  shot_power: 89,
  long_shots: 85,
  volleys: 82,
  penalties: 86,
  vision: 90,
  crossing: 84,
  free_kick: 83,
  free_kick_accuracy: 83,
  short_passing: 91,
  long_passing: 88,
  curve: 87,
  agility: 90,
  balance: 85,
  reactions: 90,
  ball_control: 91,
  dribbling: 90,
  composure: 89,
  interceptions: 68,
  heading_accuracy: 84,
  def_awareness: 65,
  standing_tackle: 70,
  sliding_tackle: 62,
  jumping: 88,
  stamina: 93,
  strength: 96,
  aggression: 82,
  skill_moves: 5,
  weak_foot: 5,
  gk_diving: 50,
  gk_handling: 50,
  gk_kicking: 50,
  gk_positioning: 50,
  gk_reflexes: 50,
};

export interface CalculatedBracketOption {
  id: BracketType;
  title: string;
  subtitle: string;
  recommendedFor: string;
  matchesPerTeamMin: number;
  matchesPerTeamMax: number;
  totalDatesEstimate: number;
  estimatedMatches: number;
  description: string;
  summary: string;
  config: Record<string, any>;
}

export function calculateBracketOptions(teamsCount: number): CalculatedBracketOption[] {
  const n = Math.max(4, teamsCount || 8);
  const playoffSpots = n >= 12 ? 8 : 4;
  const groupsCount = n >= 12 ? 4 : 2;
  const teamsPerGroup = Math.ceil(n / groupsCount);

  return [
    {
      id: 'league_playoffs',
      title: `Opção 1: Liga Pontos Corridos + Fase Final (G${playoffSpots})`,
      subtitle: `Turno Único (${n - 1} rodadas) + Mata-Mata`,
      recommendedFor: `Ideal p/ ${n} Equipes`,
      matchesPerTeamMin: n - 1,
      matchesPerTeamMax: n - 1 + (playoffSpots === 8 ? 3 : 2),
      totalDatesEstimate: n - 1 + 2,
      estimatedMatches: Math.round((n * (n - 1)) / 2) + playoffSpots,
      description: `Todos os ${n} times se enfrentam em pontos corridos. Os ${playoffSpots} melhores (G${playoffSpots}) avançam para as Semifinais e Final.`,
      summary: `Todos os ${n} times se enfrentam em pontos corridos. Os ${playoffSpots} melhores (G${playoffSpots}) avançam às Semifinais e Final.`,
      config: { teams_count: n, playoff_spots: playoffSpots, legs: 1 },
    },
    {
      id: 'groups_knockout',
      title: `Opção 2: Fase de Grupos (${groupsCount} Grupos de ${teamsPerGroup}) + Mata-Mata`,
      subtitle: `Estilo Copa Libertadores / Champions League`,
      recommendedFor: 'Equilíbrio & Copa',
      matchesPerTeamMin: Math.max(2, teamsPerGroup - 1),
      matchesPerTeamMax: Math.max(2, teamsPerGroup - 1) + 3,
      totalDatesEstimate: teamsPerGroup + 2,
      estimatedMatches:
        groupsCount * Math.round((teamsPerGroup * (teamsPerGroup - 1)) / 2) + 7,
      description: `Divide as ${n} equipes em ${groupsCount} grupos equilibrados de ${teamsPerGroup} clubes. Os 2 melhores de cada grupo avançam ao chaveamento eliminatório.`,
      summary: `Divide as ${n} equipes em ${groupsCount} grupos equilibrados de ${teamsPerGroup} clubes + Playoffs.`,
      config: { teams_count: n, groups_count: groupsCount, teams_per_group: teamsPerGroup },
    },
    {
      id: 'double_elimination',
      title: `Opção 3: Dupla Eliminação (Upper & Lower) ou Mata-Mata`,
      subtitle: `Chave dos Vencedores + Repescagem`,
      recommendedFor: 'Torneio Rápido',
      matchesPerTeamMin: 2,
      matchesPerTeamMax: Math.ceil(Math.log2(n)) + 2,
      totalDatesEstimate: Math.ceil(Math.log2(n)) + 2,
      estimatedMatches: n * 2 - 1,
      description: `Nenhuma equipe é eliminada na primeira derrota. Ideal para copas rápidas de fim de semana com ${n} equipes.`,
      summary: `Chave principal + Repescagem para ${n} equipes sem eliminação precoce.`,
      config: { teams_count: n, double_elimination: true },
    },
  ];
}

export interface FC26CardComputedStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  baseOvr: number;
  careerBonus: number;
  finalOvr: number;
  tierLabel: 'S+' | 'S' | 'A' | 'B';
  unlockedCardIds: string[];
}

export type FC26CardMacroStats = FC26CardComputedStats;

export interface FC26MacroParams {
  attributes?: Partial<PlayerAttributes>;
  primaryPosition?: string;
  position?: string;
  careerStats?: {
    matches?: number;
    goals?: number;
    assists?: number;
    mvps?: number;
    titles?: number;
    cleanSheets?: number;
    official_matches?: number;
    official_goals?: number;
    official_assists?: number;
    official_motm?: number;
    titles_won?: number;
    matches_played?: number;
    clean_sheets?: number;
  };
  extraUnlockedCards?: string[];
}

export function calculateFC26MacroAndOvr(
  paramsOrAttributes?: FC26MacroParams | Partial<PlayerAttributes>,
  positionArg?: string,
  careerStatsArg?: FC26MacroParams['careerStats']
): FC26CardComputedStats {
  const isParamsObject =
    paramsOrAttributes &&
    ('attributes' in paramsOrAttributes ||
      'primaryPosition' in paramsOrAttributes ||
      'position' in paramsOrAttributes ||
      'careerStats' in paramsOrAttributes);

  const params: FC26MacroParams = isParamsObject
    ? (paramsOrAttributes as FC26MacroParams)
    : {
        attributes: (paramsOrAttributes as Partial<PlayerAttributes>) || {},
        primaryPosition: positionArg,
        careerStats: careerStatsArg,
      };

  const attr = { ...DEFAULT_PLAYER_ATTRIBUTES, ...(params.attributes || {}) };
  const career = params.careerStats || {};
  const goals = career.goals ?? career.official_goals ?? 0;
  const assists = career.assists ?? career.official_assists ?? 0;
  const mvps = career.mvps ?? career.official_motm ?? 0;
  const titles = career.titles ?? career.titles_won ?? 0;
  const matches = career.matches ?? career.official_matches ?? career.matches_played ?? 0;
  const cleanSheets = career.cleanSheets ?? career.clean_sheets ?? 0;

  // Bônus de carreira nos campeonatos (+1 a +6 de bônus evolutivo)
  const careerBonus = Math.min(
    7,
    Math.floor(goals / 5) +
      Math.floor(assists / 5) +
      Math.floor(mvps / 2) +
      titles * 1 +
      Math.floor(cleanSheets / 4)
  );

  const clamp99 = (v: number) => Math.max(40, Math.min(99, Math.round(v)));

  const rawPac = attr.acceleration * 0.45 + attr.sprint_speed * 0.55;
  const rawSho =
    attr.finishing * 0.45 +
    attr.shot_power * 0.2 +
    attr.long_shots * 0.15 +
    attr.attack_positioning * 0.1 +
    attr.volleys * 0.05 +
    attr.penalties * 0.05;
  const rawPas =
    attr.short_passing * 0.35 +
    attr.vision * 0.25 +
    attr.crossing * 0.15 +
    attr.long_passing * 0.15 +
    attr.curve * 0.1;
  const rawDri =
    attr.dribbling * 0.45 +
    attr.ball_control * 0.3 +
    attr.agility * 0.1 +
    attr.balance * 0.05 +
    attr.reactions * 0.05 +
    attr.composure * 0.05;
  const rawDef =
    attr.standing_tackle * 0.35 +
    attr.def_awareness * 0.3 +
    attr.interceptions * 0.2 +
    attr.heading_accuracy * 0.1 +
    attr.sliding_tackle * 0.05;
  const rawPhy =
    attr.strength * 0.5 +
    attr.stamina * 0.25 +
    attr.aggression * 0.15 +
    attr.jumping * 0.1;

  const macroBonus = Math.min(4, Math.floor(careerBonus / 2));

  const pac = clamp99(rawPac + macroBonus);
  const sho = clamp99(rawSho + (goals >= 5 ? macroBonus + 1 : macroBonus));
  const pas = clamp99(rawPas + (assists >= 5 ? macroBonus + 1 : macroBonus));
  const dri = clamp99(rawDri + macroBonus);
  const def = clamp99(rawDef + (cleanSheets >= 2 ? macroBonus + 2 : macroBonus));
  const phy = clamp99(rawPhy + macroBonus);

  const pos = (params.primaryPosition || params.position || 'MEI').toUpperCase();
  let weightedBase = 85;
  if (['ST', 'LW', 'RW', 'ATA'].includes(pos)) {
    weightedBase = rawPac * 0.22 + rawSho * 0.36 + rawDri * 0.25 + rawPas * 0.1 + rawPhy * 0.07;
  } else if (['CAM', 'CM', 'MEI', 'MC'].includes(pos)) {
    weightedBase = rawPas * 0.34 + rawDri * 0.3 + rawSho * 0.16 + rawPac * 0.12 + rawPhy * 0.08;
  } else if (['CDM', 'VOL'].includes(pos)) {
    weightedBase = rawDef * 0.32 + rawPas * 0.26 + rawPhy * 0.22 + rawDri * 0.12 + rawPac * 0.08;
  } else if (['CB', 'LB', 'RB', 'ZAG', 'LD', 'LE'].includes(pos)) {
    weightedBase = rawDef * 0.42 + rawPhy * 0.28 + rawPac * 0.18 + rawPas * 0.12;
  } else if (pos === 'GK') {
    const gkAvg =
      ((attr.gk_diving || 86) +
        (attr.gk_reflexes || 88) +
        (attr.gk_positioning || 86) +
        (attr.gk_handling || 85)) /
      4;
    weightedBase = gkAvg;
  } else {
    weightedBase = (rawPac + rawSho + rawPas + rawDri + rawPhy) / 5;
  }

  const baseOvr = clamp99(weightedBase);
  const finalOvr = clamp99(baseOvr + careerBonus);

  const tierLabel: 'S+' | 'S' | 'A' | 'B' =
    finalOvr >= 92 ? 'S+' : finalOvr >= 89 ? 'S' : finalOvr >= 85 ? 'A' : 'B';

  const unlocked = new Set<string>(['gold-rare', 'silver-rare', 'bronze-rare', 'fc-pro']);
  if (mvps >= 1 || finalOvr >= 84) unlocked.add('team-of-the-week');
  if (matches >= 5 || finalOvr >= 85) unlocked.add('future-stars');
  if ((attr.skill_moves || 4) >= 5 || assists >= 5 || finalOvr >= 86) unlocked.add('joga-bonito');
  if (finalOvr >= 86 || matches >= 8) unlocked.add('ucl-primetime');
  if (goals >= 8 || finalOvr >= 88) unlocked.add('knockout-royalty');
  if (finalOvr >= 88) unlocked.add('thunderstruck');
  if (mvps >= 3 || finalOvr >= 89) {
    unlocked.add('potm-premier-league');
    unlocked.add('fantasy-fc-hero');
  }
  if (goals + assists >= 12 || finalOvr >= 90) unlocked.add('prime-heroes');
  if (titles >= 1 || finalOvr >= 90) {
    unlocked.add('fut-birthday-hero');
    unlocked.add('icon');
  }
  if (goals >= 10 || assists >= 10 || finalOvr >= 91) {
    unlocked.add('tots-champions');
  }
  if (goals >= 10 || finalOvr >= 92) {
    unlocked.add('toty');
  }
  if (titles >= 1 && (goals >= 10 || mvps >= 3 || finalOvr >= 93)) {
    unlocked.add('toty-icon');
  }

  (params.extraUnlockedCards || []).forEach((id) => unlocked.add(id));

  return {
    pac,
    sho,
    pas,
    dri,
    def,
    phy,
    baseOvr,
    careerBonus,
    finalOvr,
    tierLabel,
    unlockedCardIds: Array.from(unlocked),
  };
}

