// Motor de sorteio Dark Room v2
import {
  CATEGORIAS,
  PROPS,
  TENSAO_PSICOLOGICA,
  VIRADA,
  type CategoryKey,
  type IntensityRank,
  type PropId,
} from "@/data/challenges";
import { interpolate } from "@/lib/text";
import type { ControleMode, Genero } from "@/lib/store";

export type DrawKind = "normal" | "tension" | "joker" | "twist";

export interface PlayerLite {
  nome: string;
  genero: Genero;
}

export interface DrawResult {
  kind: DrawKind;
  text: string;
  ativo: PlayerLite;
  passivo: PlayerLite;
  ativoIs: "j1" | "j2";
  passivoIs: "j1" | "j2";
  categories: CategoryKey[]; // vazio para joker/tension/twist
  level: IntensityRank;
  durationSeconds?: number;
  propHint?: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractDuration(text: string): number | undefined {
  const min = text.match(/(\d+)\s*minutos?/i);
  if (min) return parseInt(min[1], 10) * 60;
  const sec = text.match(/(\d+)\s*segundos?/i);
  if (sec) return parseInt(sec[1], 10);
  return undefined;
}

interface DrawInput {
  jogador1: PlayerLite;
  jogador2: PlayerLite;
  controle: ControleMode;
  activeCategories: CategoryKey[];
  mode: "standard" | "combined";
  activeProps: PropId[];
  level: IntensityRank;
  roundsCompleted: number;
  cardsDrawn: number;
  forcedTwist?: boolean;
}

function resolveRoles(
  input: DrawInput,
  swap = false,
): { ativo: PlayerLite; passivo: PlayerLite; ativoIs: "j1" | "j2"; passivoIs: "j1" | "j2" } {
  let activeIs: "j1" | "j2";
  if (input.controle === "j1") activeIs = "j1";
  else if (input.controle === "j2") activeIs = "j2";
  else activeIs = Math.random() < 0.5 ? "j1" : "j2";
  if (swap) activeIs = activeIs === "j1" ? "j2" : "j1";
  const ativo = activeIs === "j1" ? input.jogador1 : input.jogador2;
  const passivo = activeIs === "j1" ? input.jogador2 : input.jogador1;
  const passivoIs: "j1" | "j2" = activeIs === "j1" ? "j2" : "j1";
  return { ativo, passivo, ativoIs: activeIs, passivoIs };
}

function buildPropHint(
  cat: CategoryKey,
  actionText: string,
  activeProps: PropId[],
): string | undefined {
  for (const propId of activeProps) {
    const meta = PROPS.find((p) => p.id === propId);
    if (!meta) continue;
    // só adiciona se a categoria é compatível e o texto NÃO menciona já
    if (!meta.fitCats.includes(cat)) continue;
    const lower = actionText.toLowerCase();
    if (meta.keywords.some((k) => lower.includes(k))) continue; // já mencionado
    return meta.hint;
  }
  return undefined;
}

function drawNormal(input: DrawInput): DrawResult | null {
  const { ativo, passivo, ativoIs, passivoIs } = resolveRoles(input);
  const allowedCats = input.activeCategories.filter((c) => CATEGORIAS[c].rankBase <= input.level);
  const pool = allowedCats.length > 0 ? allowedCats : input.activeCategories;
  if (pool.length === 0) return null;

  const pickFromCat = (cat: CategoryKey) => {
    const data = CATEGORIAS[cat];
    // Coleta ações nos níveis ≤ level e ≥ rankBase
    const ranks: IntensityRank[] = [1, 2, 3, 4, 5];
    const available: Array<{ text: string; lvl: IntensityRank }> = [];
    for (const r of ranks) {
      if (r > input.level) continue;
      const list = data.acoes[r];
      if (!list) continue;
      list.forEach((t) => available.push({ text: t, lvl: r }));
    }
    if (available.length === 0) return null;
    const chosen = pick(available);
    let text = chosen.text;
    if (data.locais && data.locais.length > 0) {
      const local = pick(data.locais);
      text = text.replaceAll("{local}", local);
    }
    return { text, lvl: chosen.lvl, cat };
  };

  if (input.mode === "combined" && pool.length >= 2) {
    const a = pick(pool);
    let b = pick(pool);
    let safety = 0;
    while (b === a && safety++ < 10) b = pick(pool);
    const d1 = pickFromCat(a);
    const d2 = pickFromCat(b);
    if (!d1 || !d2) return drawNormal({ ...input, mode: "standard" });
    const ctx = { ativo, passivo };
    const t1 = interpolate(d1.text, ctx);
    const t2 = interpolate(d2.text, ctx);
    const text = `${t1}\n\n+\n\n${t2}`;
    const hint =
      buildPropHint(a, d1.text, input.activeProps) ??
      buildPropHint(b, d2.text, input.activeProps);
    const lvl = (Math.max(d1.lvl, d2.lvl) as IntensityRank);
    return {
      kind: "normal",
      text,
      ativo,
      passivo,
      ativoIs,
      passivoIs,
      categories: [a, b],
      level: lvl,
      durationSeconds: extractDuration(text),
      propHint: hint ? interpolate(hint, ctx) : undefined,
    };
  }

  const cat = pick(pool);
  const drawn = pickFromCat(cat);
  if (!drawn) return null;
  const ctx = { ativo, passivo };
  const text = interpolate(drawn.text, ctx);
  const hint = buildPropHint(cat, drawn.text, input.activeProps);
  return {
    kind: "normal",
    text,
    ativo,
    passivo,
    ativoIs,
    passivoIs,
    categories: [cat],
    level: drawn.lvl,
    durationSeconds: extractDuration(text),
    propHint: hint ? interpolate(hint, ctx) : undefined,
  };
}

function drawTension(input: DrawInput): DrawResult {
  const { ativo, passivo, ativoIs, passivoIs } = resolveRoles(input);
  const txt = pick(TENSAO_PSICOLOGICA.acoes);
  return {
    kind: "tension",
    text: interpolate(txt, { ativo, passivo }),
    ativo,
    passivo,
    ativoIs,
    passivoIs,
    categories: [],
    level: input.level,
  };
}

function drawJoker(input: DrawInput): DrawResult {
  const { ativo, passivo, ativoIs, passivoIs } = resolveRoles(input);
  return {
    kind: "joker",
    text: `${ativo.nome} decide.`,
    ativo,
    passivo,
    ativoIs,
    passivoIs,
    categories: [],
    level: input.level,
  };
}

function drawTwist(input: DrawInput): DrawResult {
  // Inverte papéis nessa rodada
  const { ativo, passivo, ativoIs, passivoIs } = resolveRoles(input, true);
  return {
    kind: "twist",
    text: interpolate(VIRADA.texto, { ativo, passivo }),
    ativo,
    passivo,
    ativoIs,
    passivoIs,
    categories: [],
    level: input.level,
  };
}

// Decide deterministicamente o próximo tipo de carta
export function decideKind(input: DrawInput): DrawKind {
  if (input.forcedTwist) return "twist";
  // Virada: a cada 5 rodadas completas (e ainda não servida)
  if (input.roundsCompleted > 0 && input.roundsCompleted % 5 === 0) return "twist";
  // Tensão psicológica: a cada 4 rodadas
  if (input.roundsCompleted > 0 && input.roundsCompleted % 4 === 0) return "tension";
  // Coringa: ~1 a cada 15 cartas (probabilístico)
  if (Math.random() < 1 / 15) return "joker";
  return "normal";
}

export function draw(input: DrawInput): DrawResult | null {
  const kind = decideKind(input);
  if (kind === "twist") return drawTwist(input);
  if (kind === "tension") return drawTension(input);
  if (kind === "joker") return drawJoker(input);
  return drawNormal(input);
}
