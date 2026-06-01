export type CategoryKey =
  | "bondage"
  | "disciplina_controle"
  | "sensory_deprivation"
  | "impact_sensacoes"
  | "fetiches_corporais"
  | "posicoes"
  | "jornada_longa";

export interface Categoria {
  nome: string;
  acoes: string[];
  locais?: string[];
}

export const CATEGORY_META: Record<
  CategoryKey,
  { short: string; colorVar: string; intensity: "Baixa" | "Média" | "Alta" }
> = {
  bondage: { short: "B", colorVar: "var(--cat-bondage)", intensity: "Média" },
  disciplina_controle: { short: "D", colorVar: "var(--cat-disciplina)", intensity: "Média" },
  sensory_deprivation: { short: "Sensory", colorVar: "var(--cat-sensory)", intensity: "Baixa" },
  impact_sensacoes: { short: "S/M", colorVar: "var(--cat-impact)", intensity: "Alta" },
  fetiches_corporais: { short: "K", colorVar: "var(--cat-fetiches)", intensity: "Alta" },
  posicoes: { short: "Pos.", colorVar: "var(--cat-posicoes)", intensity: "Baixa" },
  jornada_longa: { short: "Endurance", colorVar: "var(--cat-endurance)", intensity: "Alta" },
};

export const CHALLENGES: { categorias: Record<CategoryKey, Categoria> } = {
  categorias: {
    bondage: {
      nome: "B - Amarras & Contenção",
      acoes: [
        "Pulsos do Sub presos na cabeceira da cama",
        "Tornozelos do Sub amarrados juntos e fixados nas laterais",
        "Pulsos e tornozelos do Sub amarrados juntos por trás",
        "Braços do Sub imobilizados rente ao tronco com faixa",
        "Dom prende os pulsos do Sub atrás das costas com tecido",
        "Sub amarrado de forma firme na cadeira ou poltrona",
        "Dom usa o peso do próprio corpo para travar o Sub na cama",
        "Dom prende os pulsos do Sub acima da cabeça com uma mão só",
        "Dedos do Sub entrelaçados e presos atrás da cabeça",
        "Mãos do Sub presas firmemente nos próprios tornozelos",
        "Sub imobilizado de bruços com travesseiro travando o quadril",
        "Pulsos do Sub presos cruzados na frente do peito",
        "Sub com os braços estendidos e amarrados separados",
        "Dom usa gravata ou lenço para prender as mãos do Sub nas coxas",
        "Sub totalmente imobilizado por um lençol esticado sobre o corpo",
        "Pulsos do Sub presos um em cada tornozelo (posição encolhida)",
        "Dom usa as próprias pernas para travar o quadril e pernas do Sub",
        "Mãos do Sub presas atrás da cintura com cinto ou fivela",
        "Sub com os polegares amarrados juntos atrás das costas",
        "Dom imobiliza uma das pernas do Sub erguida, amarrando-a na cabeceira",
      ],
    },
    disciplina_controle: {
      nome: "D - Disciplina & Dinâmicas de Poder",
      acoes: [
        "Sub proibido de emitir qualquer som ou gemido por 3 minutos",
        "Sub deve pedir permissão em voz alta para qualquer reação",
        "Dom dita o ritmo por comandos curtos: Pare, Continue, Lento, Rápido",
        "Sub proibido de tocar no próprio corpo até o fim da rodada",
        "Sub deve manter os olhos fixos nos olhos do Dom sem desviar",
        "Sub proibido de olhar para o Dom (olhos fixos no teto)",
        "Dom estabelece 2 regras estritas que valem para a sessão inteira",
        "Controle de clímax: Dom dita o momento exato do ápice ou nega o orgasmo",
        "Sub deve manter uma postura específica e o timer zera se ele se mover",
        "Dom interrompe o espaço de toque se o Sub acelerar o movimento sozinho",
        "Sub deve contar em voz alta cada estímulo recebido do Dom",
        "Dom deixa o Sub em espera prolongada antes de iniciar o toque",
        "Sub deve manter as mãos onde o Dom mandar, sem sair da posição",
        "Dom confisca o direito de resposta do Sub: apenas obediência física",
        "Sub deve respirar no ritmo que o Dom ditar e demonstrar por voz",
        "Se o Sub quebrar uma regra, Dom reinicia o cronômetro do desafio",
        "Sub deve manter os dentes cerrados, proibido de morder o próprio lábio",
        "Dom ordena 3 mudanças rápidas de postura apenas por estalar de dedos",
        "Sub deve fechar os punhos com força e só abrir sob ordem expressa",
        "Sub deve congelar o movimento exatamente na metade do encaixe atual",
      ],
    },
    sensory_deprivation: {
      nome: "Sensory - Privação & Estímulos Sensoriais",
      acoes: [
        "Sub totalmente vendado durante as próximas ações",
        "Sub com fones de ouvido isolando completamente o som ambiente",
        "Quarto colocado em escuridão absoluta por uma rodada",
        "Sub vendado deve se guiar apenas pelo som da respiração do Dom",
        "Dom faz aproximações silenciosas para tocar o Sub de surpresa",
        "Sub vendado e proibido de tatear o espaço ao redor",
        "Sub deve adivinhar em voz alta com qual parte do corpo foi tocado",
        "Dom vira o Sub de costas para ocultar a aproximação do toque",
        "Dom usa uma mordaça leve ou fita para conter os sons do Sub",
        "Sub vendado deve focar 100% no som da voz de comando do Dom",
        "Dom passa uma pluma ou pincel macio pelas zonas mais sensíveis",
        "Dom alterna o uso de texturas: roçar áspero seguido de toque sedoso",
        "Sub deve descrever às cegas qual sensação está sentindo na pele",
        "Dom sopra ar frio na pele do Sub à distância, sem tocá-lo",
        "Sub com os olhos vendados e nariz obstruído levemente para focar no tato",
        "Dom usa o próprio cabelo para fazer carícias leves no rosto e peito do Sub",
      ],
    },
    impact_sensacoes: {
      nome: "S/M - Impacto & Temperatura",
      acoes: [
        "Sequência de 5 palmadas firmes e ritmadas",
        "Leves mordidas de intensidade calibrada",
        "Pequenos beliscões e unhadas suaves",
        "Deslizar cubo de gelo seguido de sopro quente",
        "Passar colher ou objeto de metal frio",
        "Dom aplica carícias que evoluem para tapinhas a cada 30 segundos",
        "Estímulo contínuo e intenso na mesma zona por 2 minutos sem parar",
        "Palmadas alternadas com massagem forte no local do impacto",
        "Dom usa as unhas para desenhos firmes",
        "Pequenos tapinhas para dar sensibilidade",
        "Dom pinga cera de vela de massagem (baixa temperatura)",
        "Estímulo em acúmulo: Dom varia toques leves e firmes sem aviso",
        "Dom usa um acessório leve para 3 batidas firmes",
        "Dom pressiona com os dedos por 1 minuto",
        "Dom morde suavemente o lábio inferior do Sub até ele pedir trégua",
        "Sequência rápida de 10 tapinhas leves",
        "Dom usa cubos de gelo escondidos na própria boca durante o beijo",
        "Pressionar as palmas das mãos aquecidas com força",
        "Dom arranha suavemente com as pontas dos dedos",
        "Uso de contraste térmico: as duas mãos do Dom (uma fria e uma quente) agem juntas",
      ],
      locais: [
        "nas nádegas",
        "na parte interna das coxas",
        "no pescoço e nuca",
        "no abdômen e costelas",
        "na linha da coluna (costas)",
        "nos mamilos",
        "no quadril e virilha",
        "atrás dos joelhos e panturrilhas",
      ],
    },
    fetiches_corporais: {
      nome: "K - Fetiches & Adoração Corporal",
      acoes: [
        "Sub deve usar a língua para explorar e adorar a região anal do Dom (asslicking)",
        "Sub deve lamber e beijar o corpo do Dom de baixo para cima, focando nas zonas íntimas",
        "Dom e Sub vão para o chuveiro e o Dom urina nas pernas ou corpo do Sub sob a água (shower play)",
        "Sub deve lamber o suor ou fluidos sexuais diretamente da pele do Dom",
        "Sub deve usar a língua para massagear e limpar os pés ou dedos do Dom",
        "Sub posicionado de bruços enquanto o Dom senta levemente sobre seu rosto",
        "Sub deve saborear e engolir todos os fluidos gerados pelo Dom",
        "Sub deve massagear a região íntima do Dom usando apenas a boca e a língua por 3 minutos",
        "Sub deve urinar apenas quando o Dom ordenar, segurando até o limite",
        "Dom espalha fluidos no peito ou abdômen do Sub e ordena que ele espalhe com as mãos",
        "Sub deve manter a boca colada à pele do Dom, respirando o calor dele por 2 minutos",
        "Dom usa seus pés nus para estimular a região íntima do Sub enquanto ele assiste",
        "Sub deve beijar as mãos do Dom e pedir por seus fluidos em sinal de entrega",
        "Dom dita o controle de idas ao banheiro do Sub durante todo o jogo",
        "Sub deve lamber a virilha do Dom de forma lenta, seguindo o ritmo da respiração",
        "Sub deve usar os lábios para contornar a linha interna da coxa do Dom sem usar as mãos",
        "Dom e Sub no banho: Dom comanda o Sub a se lavar por inteiro usando apenas a boca",
        "Sub deve cheirar e beijar as axilas e o pescoço do Dom, demonstrando adoração",
        "Dom usa fluidos corporais para lubrificar os mamilos do Sub de forma lenta",
        "Sub deve lamber a sola do pé do Dom do calcanhar até os dedos, pausadamente",
      ],
    },
    posicoes: {
      nome: "Ângulos & Encaixes",
      acoes: [
        "Missionário clássico com as pernas do Sub elevadas nos ombros do Dom",
        "Missionário com o quadril do Sub altamente elevado por almofadas",
        "Vaqueira inversa (Sub de costas, quadril dominado pelo ritmo do Dom)",
        "Doggy style tradicional com o peito e rosto colados no colchão",
        "Sentados frente a frente, com o Sub no colo do Dom no controle do equilíbrio",
        "De bruços com travesseiro alto sob o quadril (ângulo de fricção)",
        "Corpos de lado e cruzados em formato de tesoura (X)",
        "Sub na borda da cama com os joelhos puxados ao próprio peito",
        "Sub ajoelhado no chão, com o peito e braços apoiados na cama",
        "Sub de quatro, apoiado inteiramente nos cotovelos e cabeça baixa",
        "De pé, com o Sub totalmente apoiado e travado contra a parede",
        "Sub deitado de costas na cama, segurando os próprios pés com as mãos",
        "Vaqueira clássica, mas o Dom segura os pulsos do Sub acima da cabeça",
        "Doggy style modificado onde o Dom puxa o quadril do Sub para trás com força",
        "Sub deitado de lado na cama com uma das pernas totalmente erguida",
        "Posição de lótus na cama: os dois sentados e abraçados, contato corporal máximo",
        "Sub de joelhos na cama com o tronco ereto, enquanto o Dom domina pela frente",
        "Missionário invertido: Dom apoia todo o peso do peito contra o peito do Sub",
        "Sub na borda do colchão com os pés apoiados no chão, Dom de pé comandando",
        "Doggy style com o Sub mantendo as duas mãos presas atrás do próprio pescoço",
      ],
    },
    jornada_longa: {
      nome: "Endurance - Resistência & Longa Duração",
      acoes: [
        "Sub deve fazer massagem contínua no Dom por 10 minutos sem parar",
        "Dom leva o Sub à beira do ápice (edging) 3 a 5 vezes seguidas",
        "Sub fica 5 minutos vendado no canto do quarto aguardando ordens em silêncio",
        "Sessão estendida de 20 minutos focada exclusivamente no prazer do Dom",
        "Sub totalmente imobilizado na cama enquanto o Dom se autoestimula à sua frente",
        "Dom reveza 3 estímulos de impacto e controle seguidos, sem descanso para o Sub",
        "Sub deve manter-se ajoelhado ereto aos pés da cama em silêncio por 5 minutos",
        "Jogo de resistência: Dom mantém estímulo repetitivo e o Sub deve aguentar sem se mover",
        "Sessão de carícias ininterruptas de 15 minutos onde o Sub está proibido de retribuir",
        "Edging psicológico: Dom dita fantasias por 10 minutos sem permitir nenhum toque físico",
      ],
    },
  },
};

export const PROPS = [
  { id: "venda", label: "Venda", keywords: ["vendado", "vendada", "venda"] },
  { id: "gelo", label: "Gelos", keywords: ["gelo", "cubo de gelo", "cubos de gelo"] },
  { id: "corda", label: "Cordas / Faixas", keywords: ["amarrad", "faixa", "corda", "lençol"] },
  { id: "vela", label: "Vela de Massagem", keywords: ["vela", "cera"] },
  { id: "paddle", label: "Paddle / Palmatória", keywords: ["paddle", "palmatória", "acessório"] },
  { id: "pluma", label: "Pluma / Pincel", keywords: ["pluma", "pincel"] },
  { id: "mordaca", label: "Mordaça", keywords: ["mordaça", "fita"] },
  { id: "gravata", label: "Gravata / Lenço", keywords: ["gravata", "lenço", "tecido"] },
  { id: "almofada", label: "Almofadas", keywords: ["almofada", "travesseiro"] },
] as const;

export type PropId = (typeof PROPS)[number]["id"];
