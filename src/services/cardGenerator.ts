import { generateCardFn, type CardGenInput, type CardGenResult } from "@/lib/cardGenerator.functions";
import { interpolate } from "@/lib/text";
import type { Genero } from "@/lib/store";

export type { CardGenInput, CardGenResult };

const AI_TIMEOUT_MS = 6000;

function extractDuration(text: string): number | null {
  const min = text.match(/(\d+)\s*minutos?/i);
  if (min) return parseInt(min[1], 10) * 60;
  const sec = text.match(/(\d+)\s*segundos?/i);
  if (sec) return parseInt(sec[1], 10);
  return null;
}

function fallback(ctx: CardGenInput): CardGenResult {
  const text = interpolate(ctx.carta_base, {
    ativo: { nome: ctx.ativo, genero: ctx.genero_ativo as Genero },
    passivo: { nome: ctx.passivo, genero: ctx.genero_passivo as Genero },
  });
  const seconds = extractDuration(text);
  return {
    texto: text,
    tem_timer: seconds !== null,
    segundos: seconds,
    prop_usado: null,
  };
}

/** Remove caracteres invisíveis e normaliza quebras de linha. */
export function sanitizeCardText(input: string): string {
  return input
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Texto é utilizável se tiver pelo menos 10 letras reais. */
export function hasReadableText(input: string | undefined | null): boolean {
  if (!input) return false;
  return (sanitizeCardText(input).match(/\p{L}/gu) ?? []).length >= 10;
}

export async function generateCard(ctx: CardGenInput): Promise<CardGenResult> {
  try {
    const result = await Promise.race<CardGenResult>([
      generateCardFn({ data: ctx }),
      new Promise<CardGenResult>((_, reject) =>
        setTimeout(() => reject(new Error("ai-timeout")), AI_TIMEOUT_MS),
      ),
    ]);
    const texto = sanitizeCardText(result.texto ?? "");
    if (!hasReadableText(texto)) return fallback(ctx);
    return { ...result, texto };
  } catch (err) {
    console.warn("[cardGenerator] fallback:", err);
    return fallback(ctx);
  }
}
