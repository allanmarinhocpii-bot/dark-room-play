import { generateCardFn, type CardGenInput, type CardGenResult } from "@/lib/cardGenerator.functions";
import { interpolate } from "@/lib/text";
import type { Genero } from "@/lib/store";

export type { CardGenInput, CardGenResult };

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

export async function generateCard(ctx: CardGenInput): Promise<CardGenResult> {
  try {
    const result = await generateCardFn({ data: ctx });
    return result;
  } catch (err) {
    console.warn("[cardGenerator] fallback:", err);
    return fallback(ctx);
  }
}
