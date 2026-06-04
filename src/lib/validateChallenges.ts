// Validador de schema para o banco de desafios.
// Executa antes de iniciar o jogo para garantir integridade do JSON.

import {
  CATEGORIAS,
  PROPS,
  TENSAO_PSICOLOGICA,
  VIRADA,
  LEVELS,
  type CategoryKey,
  type IntensityRank,
} from "@/data/challenges";

export interface ValidationIssue {
  level: "error" | "warn";
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

const REQUIRED_RANKS: IntensityRank[] = [1, 2, 3, 4, 5];
const KNOWN_VARS = new Set([
  "ativo",
  "passivo",
  "pronome",
  "pronome_cap",
  "dele_dela",
  "dele_dela_ativo",
  "local",
]);
const VAR_RE = /\{([a-z_]+)\}/gi;

function checkVars(text: string, path: string, allowLocal: boolean, out: ValidationIssue[]) {
  const matches = text.matchAll(VAR_RE);
  for (const m of matches) {
    const key = m[1];
    if (!KNOWN_VARS.has(key)) {
      out.push({ level: "error", path, message: `variável desconhecida {${key}}` });
    }
    if (key === "local" && !allowLocal) {
      out.push({ level: "error", path, message: `{local} usado sem array 'locais'` });
    }
  }
}

export function validateChallenges(): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Níveis
  if (!Array.isArray(LEVELS) || LEVELS.length !== 5) {
    errors.push({ level: "error", path: "LEVELS", message: "deve ter 5 níveis" });
  } else {
    LEVELS.forEach((lv, i) => {
      if (lv.rank !== i + 1)
        errors.push({ level: "error", path: `LEVELS[${i}]`, message: "rank fora de ordem" });
      if (typeof lv.threshold !== "number")
        errors.push({ level: "error", path: `LEVELS[${i}]`, message: "threshold inválido" });
      if (!lv.name || !lv.accent || !lv.subtitle)
        errors.push({ level: "error", path: `LEVELS[${i}]`, message: "campos faltando" });
    });
  }

  // Categorias
  const cats = Object.keys(CATEGORIAS) as CategoryKey[];
  if (cats.length === 0) {
    errors.push({ level: "error", path: "CATEGORIAS", message: "nenhuma categoria definida" });
  }

  for (const key of cats) {
    const cat = CATEGORIAS[key];
    const base = `CATEGORIAS.${key}`;
    if (!cat.nome) errors.push({ level: "error", path: `${base}.nome`, message: "ausente" });
    if (!cat.short) errors.push({ level: "error", path: `${base}.short`, message: "ausente" });
    if (!cat.colorVar) errors.push({ level: "error", path: `${base}.colorVar`, message: "ausente" });
    if (!cat.rankBase || cat.rankBase < 1 || cat.rankBase > 5)
      errors.push({ level: "error", path: `${base}.rankBase`, message: "fora de 1..5" });
    if (!cat.acoes || typeof cat.acoes !== "object") {
      errors.push({ level: "error", path: `${base}.acoes`, message: "ausente" });
      continue;
    }

    const allowLocal = Array.isArray(cat.locais) && cat.locais.length > 0;

    // Garante ≥1 ação em algum rank ≥ rankBase
    let totalActions = 0;
    for (const r of REQUIRED_RANKS) {
      const list = cat.acoes[r];
      if (list === undefined) continue;
      if (!Array.isArray(list)) {
        errors.push({ level: "error", path: `${base}.acoes.${r}`, message: "deve ser array" });
        continue;
      }
      if (r < cat.rankBase && list.length > 0) {
        warnings.push({
          level: "warn",
          path: `${base}.acoes.${r}`,
          message: `ações abaixo do rankBase (${cat.rankBase})`,
        });
      }
      list.forEach((t, i) => {
        if (typeof t !== "string" || t.trim().length === 0) {
          errors.push({ level: "error", path: `${base}.acoes.${r}[${i}]`, message: "texto vazio" });
          return;
        }
        checkVars(t, `${base}.acoes.${r}[${i}]`, allowLocal, errors);
      });
      totalActions += list.length;
    }

    if (totalActions === 0)
      errors.push({ level: "error", path: `${base}.acoes`, message: "nenhuma ação definida" });

    // Cada rank ≥ rankBase precisa ter ao menos 1 ação no caminho do jogador
    for (const r of REQUIRED_RANKS) {
      if (r < cat.rankBase) continue;
      const list = cat.acoes[r];
      if (!list || list.length === 0) {
        warnings.push({
          level: "warn",
          path: `${base}.acoes.${r}`,
          message: "rank sem ações — pode quebrar progressão",
        });
      }
    }
  }

  // Tensão psicológica
  if (!TENSAO_PSICOLOGICA?.acoes || TENSAO_PSICOLOGICA.acoes.length === 0) {
    errors.push({ level: "error", path: "TENSAO_PSICOLOGICA.acoes", message: "vazio" });
  } else {
    TENSAO_PSICOLOGICA.acoes.forEach((t, i) =>
      checkVars(t, `TENSAO_PSICOLOGICA.acoes[${i}]`, false, errors),
    );
  }

  // Virada
  if (!VIRADA?.texto) {
    errors.push({ level: "error", path: "VIRADA.texto", message: "ausente" });
  } else {
    checkVars(VIRADA.texto, "VIRADA.texto", false, errors);
  }

  // Props
  PROPS.forEach((p, i) => {
    if (!p.id || !p.label || !p.hint)
      errors.push({ level: "error", path: `PROPS[${i}]`, message: "campos faltando" });
    if (!Array.isArray(p.keywords) || p.keywords.length === 0)
      errors.push({ level: "error", path: `PROPS[${i}].keywords`, message: "vazio" });
    if (!Array.isArray(p.fitCats) || p.fitCats.length === 0)
      errors.push({ level: "error", path: `PROPS[${i}].fitCats`, message: "vazio" });
    p.fitCats?.forEach((c) => {
      if (!CATEGORIAS[c as CategoryKey])
        errors.push({
          level: "error",
          path: `PROPS[${i}].fitCats`,
          message: `categoria inexistente: ${c}`,
        });
    });
    if (p.hint) checkVars(p.hint, `PROPS[${i}].hint`, false, errors);
  });

  return { ok: errors.length === 0, errors, warnings };
}
