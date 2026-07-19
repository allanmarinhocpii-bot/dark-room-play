// Dark Room v2 — Banco de desafios com variáveis dinâmicas
// Variáveis: {ativo} {passivo} {pronome} {pronome_cap} {dele_dela} {dele_dela_ativo} {local}

export type CategoryKey =
  | "bondage"
  | "disciplina_controle"
  | "sensory_deprivation"
  | "impact_sensacoes"
  | "fetiches_corporais"
  | "posicoes"
  | "jornada_longa";

export type IntensityRank = 1 | 2 | 3 | 4 | 5;

export interface Categoria {
  nome: string;
  short: string;
  colorVar: string;
  rankBase: IntensityRank;
  acoes: Partial<Record<IntensityRank, string[]>>;
  locais?: string[];
}

export const INTENSITY_LABEL: Record<IntensityRank, string> = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
  4: "Intensa",
  5: "Máxima",
};

export const LEVELS: Array<{
  rank: IntensityRank;
  name: string;
  threshold: number;
  accent: string;
  subtitle: string;
}> = [
  { rank: 1, name: "Ignição", threshold: 0, accent: "#00FF9D", subtitle: "A primeira faísca." },
  { rank: 2, name: "Sedução", threshold: 20, accent: "#A78BFA", subtitle: "O desejo começa a tomar forma." },
  { rank: 3, name: "Tensão", threshold: 50, accent: "#F59E0B", subtitle: "A respiração muda. O corpo pede mais." },
  { rank: 4, name: "Entrega", threshold: 100, accent: "#EF4444", subtitle: "Não há volta. Só presença." },
  { rank: 5, name: "Ápice", threshold: 180, accent: "#FF00FF", subtitle: "Tudo está desbloqueado." },
];

export function levelForScore(score: number): IntensityRank {
  if (score >= 180) return 5;
  if (score >= 100) return 4;
  if (score >= 50) return 3;
  if (score >= 20) return 2;
  return 1;
}

// Banco principal — desafios com variáveis dinâmicas
export const CATEGORIAS: Record<CategoryKey, Categoria> = {
  posicoes: {
    nome: "Ângulos & Encaixes",
    short: "Pos.",
    colorVar: "var(--cat-posicoes)",
    rankBase: 1,
    acoes: {
      1: [
        "{ativo} guia {passivo} para um beijo lento de pé, mãos no rosto.",
        "{ativo} senta e puxa {passivo} para sentar de costas no seu colo.",
        "Deitados de lado, {ativo} abraça {passivo} por trás por 2 minutos.",
        "{ativo} pede para {passivo} se deitar de bruços e massageia as costas {dele_dela}.",
      ],
      2: [
        "{ativo} posiciona {passivo} em missionário e segura os pulsos {dele_dela} acima da cabeça.",
        "{passivo} senta no colo de {ativo} de frente, mantendo contato visual constante.",
        "{passivo} fica de quatro e {ativo} dita o ritmo pela cintura.",
        "{ativo} coloca {passivo} na borda da cama, joelhos no peito.",
      ],
      3: [
        "Vaqueira invertida: {passivo} no controle, {ativo} dita o ritmo pelas mãos.",
        "{passivo} de bruços, almofada alta sob o quadril, {ativo} comanda por cima.",
        "{ativo} prende {passivo} contra a parede de pé, uma perna erguida.",
      ],
      4: [
        "Doggy modificado: {ativo} puxa o quadril de {passivo} com força e dita pausas.",
        "{passivo} de joelhos na cama, tronco ereto, {ativo} domina pela frente sem permitir sair da posição.",
      ],
      5: [
        "{passivo} mantém as mãos atrás do pescoço enquanto {ativo} comanda em doggy — proibido sair da posição até o fim da rodada.",
      ],
    },
  },
  sensory_deprivation: {
    nome: "Sensorial",
    short: "Sens.",
    colorVar: "var(--cat-sensory)",
    rankBase: 1,
    acoes: {
      1: [
        "{ativo} fecha os olhos de {passivo} com a mão e beija lentamente o pescoço {dele_dela}.",
        "{ativo} passa as pontas dos dedos no rosto de {passivo} por 1 minuto sem dizer nada.",
        "{passivo} fecha os olhos e tenta adivinhar onde {ativo} vai tocar a seguir.",
      ],
      2: [
        "{passivo} vendado. {ativo} se aproxima em silêncio e toca por 2 minutos.",
        "{ativo} sopra ar frio na pele de {passivo} sem encostar.",
        "{ativo} alterna texturas (tecido áspero, pele, sopro) no corpo de {passivo}.",
      ],
      3: [
        "{passivo} vendado e proibido de falar. {ativo} comanda toda a próxima rodada.",
        "{ativo} usa o próprio cabelo para fazer carícias no peito e abdômen de {passivo} às cegas.",
      ],
      4: [
        "{passivo} vendado e com mordaça leve. {ativo} dita a respiração por 3 minutos.",
        "Quarto em escuridão absoluta. {ativo} guia {passivo} apenas pela voz.",
      ],
      5: [
        "{passivo} vendado, sem som (fones), sem fala. {ativo} é o único canal sensorial pelos próximos 5 minutos.",
      ],
    },
  },
  disciplina_controle: {
    nome: "Disciplina & Controle",
    short: "Disc.",
    colorVar: "var(--cat-disciplina)",
    rankBase: 2,
    acoes: {
      2: [
        "{passivo} proibido de emitir qualquer som por 2 minutos enquanto {ativo} toca.",
        "{ativo} dita o ritmo por comandos curtos: pare, continue, lento, rápido.",
        "{passivo} mantém olhos fixos nos olhos de {ativo} — proibido desviar.",
      ],
      3: [
        "{passivo} pede permissão em voz alta para qualquer reação.",
        "{passivo} mantém uma postura fixa. Se mover, {ativo} reinicia o cronômetro.",
        "{passivo} conta em voz alta cada estímulo recebido.",
      ],
      4: [
        "{ativo} leva {passivo} à beira do ápice e nega o orgasmo. Repete 3 vezes.",
        "{passivo} mantém as mãos exatamente onde {ativo} mandar — sem sair da posição por nenhum motivo.",
        "{ativo} dita a respiração de {passivo} no próprio ritmo por 3 minutos.",
      ],
      5: [
        "Controle total de clímax: {ativo} decide exatamente o segundo do ápice de {passivo} — ou nega completamente.",
        "{passivo} executa qualquer ordem de {ativo} sem direito a resposta verbal por 5 minutos.",
      ],
    },
  },
  bondage: {
    nome: "Amarras & Contenção",
    short: "Bond.",
    colorVar: "var(--cat-bondage)",
    rankBase: 2,
    acoes: {
      2: [
        "{ativo} prende os pulsos de {passivo} com as próprias mãos acima da cabeça.",
        "{ativo} amarra os pulsos de {passivo} na frente do peito com um lenço.",
      ],
      3: [
        "{ativo} prende os pulsos de {passivo} na cabeceira da cama.",
        "{ativo} amarra os tornozelos de {passivo} juntos e dita o ritmo.",
        "{ativo} usa o peso do próprio corpo para travar {passivo} na cama.",
      ],
      4: [
        "Pulsos e tornozelos de {passivo} amarrados por trás. {ativo} comanda totalmente.",
        "{passivo} totalmente imobilizado por um lençol esticado sobre o corpo.",
        "{ativo} prende uma das pernas de {passivo} erguida na cabeceira.",
      ],
      5: [
        "{passivo} amarrado, vendado e em silêncio por 5 minutos. {ativo} faz o que quiser.",
      ],
    },
  },
  fetiches_corporais: {
    nome: "Fetiches & Entrega",
    short: "Fet.",
    colorVar: "var(--cat-fetiches)",
    rankBase: 3,
    acoes: {
      3: [
        "{passivo} lambe o pescoço e clavícula de {ativo} pedindo permissão a cada beijo.",
        "{passivo} beija e adora as mãos de {ativo} por 2 minutos.",
        "{ativo} ordena que {passivo} cheire e beije as axilas e o pescoço {dele_dela_ativo}.",
      ],
      4: [
        "{passivo} usa só a boca para massagear a região íntima de {ativo} por 3 minutos.",
        "{ativo} usa os pés nus para estimular {passivo} enquanto {pronome} assiste, sem tocar.",
        "{passivo} lambe a virilha de {ativo} em ritmo lento, seguindo a respiração {dele_dela_ativo}.",
      ],
      5: [
        "{passivo} adora a região anal de {ativo} com a língua sob comando total (asslicking).",
        "No chuveiro: {ativo} controla os fluidos sobre {passivo} (shower play, conforme acordado).",
        "{passivo} engole e saboreia todos os fluidos que {ativo} produzir.",
      ],
    },
  },
  impact_sensacoes: {
    nome: "Impacto & Temperatura",
    short: "S/M",
    colorVar: "var(--cat-impact)",
    rankBase: 3,
    acoes: {
      3: [
        "Sequência de 5 palmadas ritmadas {local}.",
        "{ativo} desliza um cubo de gelo {local} seguido de sopro quente.",
        "{ativo} arranha suavemente com as pontas dos dedos {local}.",
      ],
      4: [
        "{ativo} alterna palmadas firmes com massagem forte no local do impacto, {local}.",
        "Mordidas calibradas {local} por 1 minuto.",
        "{ativo} usa um acessório leve para 3 batidas firmes {local}.",
      ],
      5: [
        "Contraste térmico: as duas mãos de {ativo} (uma fria, uma quente) agem juntas {local} por 2 minutos.",
        "Estímulo contínuo e intenso na mesma zona {local} por 2 minutos sem parar.",
      ],
    },
    locais: [
      "nas nádegas",
      "na parte interna das coxas",
      "no pescoço e nuca",
      "no abdômen",
      "ao longo da coluna",
      "nos mamilos",
      "no quadril",
    ],
  },
  jornada_longa: {
    nome: "Endurance",
    short: "End.",
    colorVar: "var(--cat-endurance)",
    rankBase: 4,
    acoes: {
      4: [
        "{passivo} massageia {ativo} por 10 minutos sem parar e sem retribuição.",
        "{ativo} mantém estímulo repetitivo por 5 minutos — {passivo} deve aguentar sem se mover.",
        "{passivo} permanece ajoelhado em silêncio aos pés da cama por 5 minutos aguardando ordens.",
      ],
      5: [
        "Edging: {ativo} leva {passivo} à beira do ápice 5 vezes seguidas, sem permitir.",
        "Sessão de 15 minutos focada exclusivamente no prazer de {ativo}. {passivo} proibido de receber.",
        "Edging psicológico: {ativo} dita fantasias por 10 minutos sem permitir nenhum toque físico.",
      ],
    },
  },
};

// Categoria oculta — Tensão Psicológica (não aparece no setup)
export const TENSAO_PSICOLOGICA = {
  nome: "Tensão Psicológica",
  acoes: [
    "Fica parado. {ativo} decide quando começa. Pode demorar.",
    "Olha nos olhos de {passivo} e não faz nada. Só espera.",
    "Chega perto de {passivo} sem tocar. Fica assim por um minuto.",
    "Descreve em detalhes o que vai acontecer. Depois espera três minutos para começar.",
    "Circula em volta de {passivo} sem tocar. Sabe que você vai. Não sabe quando.",
    "Fica de pé na frente de {passivo} sentado. Não fala, não toca. Só ocupa o espaço.",
    "Conta até dez em voz alta, devagar. {passivo} não sabe o que acontece no dez.",
    "Sussurra o que vai fazer no ouvido de {passivo}. Depois não faz. Ainda.",
    "Segura o rosto de {passivo} com as duas mãos e olha fundo. Não fala. Espera.",
    "Você sabe o que {passivo} quer. Faz tudo menos isso. Por enquanto.",
  ],
};

// Carta de Virada — força inversão de papéis
export const VIRADA = {
  texto: "Os papéis invertem por essa rodada.",
};

// Mapeamento de props → texto adicional injetado quando ativo + compatível
export const PROPS = [
  {
    id: "venda",
    label: "Venda",
    hint: "Antes de começar, {ativo} venda {passivo}.",
    keywords: ["vendad", "vend"],
    fitCats: ["sensory_deprivation", "disciplina_controle", "impact_sensacoes", "fetiches_corporais"] as CategoryKey[],
  },
  {
    id: "gelo",
    label: "Gelo",
    hint: "Use gelo no processo.",
    keywords: ["gelo", "frio", "térmico"],
    fitCats: ["impact_sensacoes", "sensory_deprivation"] as CategoryKey[],
  },
  {
    id: "corda",
    label: "Cordas / Faixas",
    hint: "Amarre os pulsos de {passivo} antes.",
    keywords: ["amarr", "prend", "corda", "faixa"],
    fitCats: ["bondage", "disciplina_controle"] as CategoryKey[],
  },
  {
    id: "vela",
    label: "Vela de Massagem",
    hint: "Pingue cera no momento que achar certo.",
    keywords: ["cera", "vela"],
    fitCats: ["impact_sensacoes"] as CategoryKey[],
  },
  {
    id: "paddle",
    label: "Paddle / Palmatória",
    hint: "Use o paddle quando indicado.",
    keywords: ["palmada", "batida", "acessório", "paddle"],
    fitCats: ["impact_sensacoes", "disciplina_controle"] as CategoryKey[],
  },
  {
    id: "pluma",
    label: "Pluma / Pincel",
    hint: "Use a pluma no percurso.",
    keywords: ["pluma", "pincel", "carícia"],
    fitCats: ["sensory_deprivation"] as CategoryKey[],
  },
  {
    id: "mordaca",
    label: "Mordaça",
    hint: "Coloque a mordaça antes de começar.",
    keywords: ["silêncio", "som", "fala", "mordaça"],
    fitCats: ["disciplina_controle", "sensory_deprivation"] as CategoryKey[],
  },
  {
    id: "gravata",
    label: "Gravata / Lenço",
    hint: "Use a gravata/lenço para prender.",
    keywords: ["lenço", "tecido", "gravata", "pulsos"],
    fitCats: ["bondage"] as CategoryKey[],
  },
  {
    id: "almofada",
    label: "Almofadas",
    hint: "Posicione uma almofada sob o quadril de {passivo}.",
    keywords: ["almofada", "travesseiro", "quadril"],
    fitCats: ["posicoes"] as CategoryKey[],
  },
] as const;

export type PropId = (typeof PROPS)[number]["id"];
