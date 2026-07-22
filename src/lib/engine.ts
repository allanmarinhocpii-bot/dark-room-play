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
  baseText?: string; // texto bruto pré-interpolação (usado p/ dedupe)
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

/** Clamp e converte um número em IntensityRank válido (1..5). */
export function toIntensityRank(val: number): IntensityRank {
  const rounded = Math.round(val);
  const clamped = Math.min(5, Math.max(1, rounded));
  return clamped as IntensityRank;
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
  recentTexts?: string[]; // histórico de baseTexts recentes p/ evitar repetição
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
    if (!meta.fitCats.includes(cat)) continue;
    const lower = actionText.toLowerCase();
    if (meta.keywords.some((k) => lower.includes(k))) continue;
    return meta.hint;
  }
  return undefined;
}

function catHasActionAt(cat: CategoryKey, level: IntensityRank): boolean {
  const data = CATEGORIAS[cat];
  const ranks: IntensityRank[] = [1, 2, 3, 4, 5];
  for (const r of ranks) {
    if (r > level) continue;
    if (r < data.rankBase) continue;
    const list = data.acoes[r];
    if (list && list.length > 0) return true;
  }
  for (const r of ranks) {
    const list = data.acoes[r];
    if (list && list.length > 0) return true;
  }
  return false;
}

function drawNormal(input: DrawInput): DrawResult | null {
  const { ativo, passivo, ativoIs, passivoIs } = resolveRoles(input);
  const usable = input.activeCategories.filter((c) => catHasActionAt(c, input.level));
  if (usable.length === 0) return null;

  const recent = new Set(input.recentTexts ?? []);

  const pickFromCat = (cat: CategoryKey) => {
    const data = CATEGORIAS[cat];
    const ranks: IntensityRank[] = [1, 2, 3, 4, 5];
    const available: Array<{ text: string; lvl: IntensityRank }> = [];
    for (const r of ranks) {
      if (r > input.level) continue;
      if (r < data.rankBase) continue;
      const list = data.acoes[r];
      if (!list) continue;
      list.forEach((t) => available.push({ text: t, lvl: r }));
    }
    if (available.length === 0) {
      for (const r of ranks) {
        const list = data.acoes[r];
        if (!list) continue;
        list.forEach((t) => available.push({ text: t, lvl: r }));
      }
    }
    if (available.length === 0) return null;
    // Filtra recentes (se sobrar algo)
    const filtered = available.filter((a) => !recent.has(a.text));
    const pool = filtered.length > 0 ? filtered : available;
    const chosen = pick(pool);
    const baseText = chosen.text;
    let text = baseText;
    if (data.locais && data.locais.length > 0) {
      const local = pick(data.locais);
      text = text.replaceAll("{local}", local);
    }
    return { text, baseText, lvl: chosen.lvl, cat };
  };

  if (input.mode === "combined" && usable.length >= 2) {
    const a = pick(usable);
    let b = pick(usable);
    let safety = 0;
    while (b === a && safety++ < 10) b = pick(usable);
    const d1 = pickFromCat(a);
    const d2 = pickFromCat(b);
    if (!d1 || !d2) {
      const cat = pick(usable);
      const drawn = pickFromCat(cat);
      if (!drawn) return null;
      const ctx = { ativo, passivo };
      const text = interpolate(drawn.text, ctx);
      const hint = buildPropHint(cat, drawn.text, input.activeProps);
      return {
        kind: "normal",
        text,
        baseText: drawn.baseText,
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
    const ctx = { ativo, passivo };
    const t1 = interpolate(d1.text, ctx);
    const t2 = interpolate(d2.text, ctx);
    const text = `${t1}\n\n+\n\n${t2}`;
    const hint =
      buildPropHint(a, d1.text, input.activeProps) ??
      buildPropHint(b, d2.text, input.activeProps);
    const lvl = toIntensityRank(Math.max(d1.lvl, d2.lvl));
    return {
      kind: "normal",
      text,
      baseText: `${d1.baseText}||${d2.baseText}`,
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

  const cat = pick(usable);
  const drawn = pickFromCat(cat);
  if (!drawn) return null;
  const ctx = { ativo, passivo };
  const text = interpolate(drawn.text, ctx);
  const hint = buildPropHint(cat, drawn.text, input.activeProps);
  return {
    kind: "normal",
    text,
    baseText: drawn.baseText,
    ativo,
    passivo,
    ativoIs,
    passivoIs,
    categories: [cat],
    level: toIntensityRank(drawn.lvl),
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

export function decideKind(input: DrawInput): DrawKind {
  if (input.forcedTwist) return "twist";
  const turn = input.cardsDrawn + 1;
  if (turn % 15 === 0) return "joker";
  if (turn % 5 === 0) return "twist";
  if (turn % 4 === 0) return "tension";
  return "normal";
}

export function draw(input: DrawInput): DrawResult | null {
  const kind = decideKind(input);
  if (kind === "twist") return drawTwist(input);
  if (kind === "tension") return drawTension(input);
  if (kind === "joker") return drawJoker(input);
  return drawNormal(input);
}
