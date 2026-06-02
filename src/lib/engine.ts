import {
  CHALLENGES,
  CATEGORY_META,
  type CategoryKey,
  type PropId,
  PROPS,
  type IntensityRank,
} from "@/data/challenges";

export interface Challenge {
  text: string;
  categories: CategoryKey[];
  durationSeconds?: number;
}

const recent: string[] = [];
const RECENT_MAX = 6;

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

function actionRequiresMissingProp(action: string, availableProps: Set<PropId>): boolean {
  for (const p of PROPS) {
    if (availableProps.has(p.id)) continue;
    for (const kw of p.keywords) {
      // require prop only for very specific items
      if (
        ["vela", "paddle", "pluma", "mordaca"].includes(p.id) &&
        action.toLowerCase().includes(kw.toLowerCase())
      ) {
        return true;
      }
    }
  }
  return false;
}

function drawFromCategory(
  cat: CategoryKey,
  availableProps: Set<PropId>,
): { text: string; key: string } | null {
  const data = CHALLENGES.categorias[cat];
  const pool = data.acoes.filter((a) => !actionRequiresMissingProp(a, availableProps));
  if (pool.length === 0) return null;
  let attempts = 0;
  let action = pick(pool);
  while (recent.includes(`${cat}:${action}`) && attempts < 5) {
    action = pick(pool);
    attempts++;
  }
  let text = action;
  if (cat === "impact_sensacoes" && data.locais && data.locais.length > 0) {
    text = `${action} ${pick(data.locais)}`;
  }
  return { text, key: `${cat}:${action}` };
}

export function drawChallenge(
  activeCategories: CategoryKey[],
  mode: "standard" | "combined",
  selectedProps: PropId[],
): Challenge | null {
  if (activeCategories.length === 0) return null;
  const props = new Set(selectedProps);

  if (mode === "combined" && activeCategories.length >= 2) {
    const a = pick(activeCategories);
    let b = pick(activeCategories);
    let safety = 0;
    while (b === a && safety < 10) {
      b = pick(activeCategories);
      safety++;
    }
    const d1 = drawFromCategory(a, props);
    const d2 = drawFromCategory(b, props);
    if (!d1 || !d2) return drawChallenge(activeCategories, "standard", selectedProps);
    const text = `${d1.text}\n\n+\n\n${d2.text}`;
    rememberKey(`${d1.key}|${d2.key}`);
    return {
      text,
      categories: [a, b],
      durationSeconds: extractDuration(text),
    };
  }

  const cat = pick(activeCategories);
  const drawn = drawFromCategory(cat, props);
  if (!drawn) {
    const others = activeCategories.filter((c) => c !== cat);
    if (others.length === 0) return null;
    return drawChallenge(others, "standard", selectedProps);
  }
  rememberKey(drawn.key);
  return {
    text: drawn.text,
    categories: [cat],
    durationSeconds: extractDuration(drawn.text),
  };
}

function rememberKey(k: string) {
  recent.push(k);
  while (recent.length > RECENT_MAX) recent.shift();
}
