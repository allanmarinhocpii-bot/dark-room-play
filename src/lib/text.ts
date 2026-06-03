// Motor de substituição de variáveis dinâmicas
import type { Genero } from "@/lib/store";

export interface InterpContext {
  ativo: { nome: string; genero: Genero };
  passivo: { nome: string; genero: Genero };
  local?: string;
}

function pronome(g: Genero, cap = false) {
  const p = g === "F" ? "ela" : "ele";
  return cap ? p[0].toUpperCase() + p.slice(1) : p;
}
function deleDela(g: Genero) {
  return g === "F" ? "dela" : "dele";
}

export function interpolate(text: string, ctx: InterpContext): string {
  return text
    .replaceAll("{ativo}", ctx.ativo.nome)
    .replaceAll("{passivo}", ctx.passivo.nome)
    .replaceAll("{pronome_cap}", pronome(ctx.passivo.genero, true))
    .replaceAll("{pronome}", pronome(ctx.passivo.genero))
    .replaceAll("{dele_dela_ativo}", deleDela(ctx.ativo.genero))
    .replaceAll("{dele_dela}", deleDela(ctx.passivo.genero))
    .replaceAll("{local}", ctx.local ?? "");
}
