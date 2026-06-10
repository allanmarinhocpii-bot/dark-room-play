import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `Você é o motor de desafios do Dark Room, um jogo íntimo para casais adultos consentidos.
Recebe uma carta base com variáveis e reescreve com os dados reais fornecidos.

REGRAS:
- Tom imperativo e direto — como se o jogo estivesse falando com o casal
- Nunca use "Dom" ou "Sub" — use sempre os nomes reais
- Se houver props disponíveis E fizerem sentido natural, integre UM no texto
- Não suavize a intensidade, não adicione explicações
- Não repita nenhuma das últimas cartas fornecidas
- Mantenha entre 1 e 3 frases
- Retorne APENAS o JSON sem markdown

Formato: {"texto": "...", "tem_timer": boolean, "segundos": number | null, "prop_usado": string | null}`;

const InputSchema = z.object({
  carta_base: z.string().min(1).max(2000),
  ativo: z.string().min(1).max(40),
  passivo: z.string().min(1).max(40),
  genero_ativo: z.enum(["M", "F"]),
  genero_passivo: z.enum(["M", "F"]),
  categoria: z.string().max(80),
  nivel: z.string().max(40),
  props_ativos: z.array(z.string().max(40)).max(20),
  modo: z.enum(["padrao", "combinado"]),
  rodada: z.number().int().min(0).max(9999),
  ultimas_cartas: z.array(z.string().max(2000)).max(10),
});

const ResultSchema = z.object({
  texto: z.string(),
  tem_timer: z.boolean(),
  segundos: z.number().nullable(),
  prop_usado: z.string().nullable(),
});

export type CardGenInput = z.infer<typeof InputSchema>;
export type CardGenResult = z.infer<typeof ResultSchema>;

export const generateCardFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<CardGenResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const userMessage = `Carta base: "${data.carta_base}"
Ativo (comanda): ${data.ativo} (${data.genero_ativo === "M" ? "homem" : "mulher"})
Passivo (recebe): ${data.passivo} (${data.genero_passivo === "M" ? "homem" : "mulher"})
Categoria: ${data.categoria}
Nível: ${data.nivel}
Props disponíveis: ${data.props_ativos.join(", ") || "nenhum"}
Modo: ${data.modo}
Rodada: ${data.rodada}
Últimas cartas (não repetir): ${data.ultimas_cartas.join(" | ") || "nenhuma"}

Reescreve a carta com os dados reais. Responda apenas com o JSON.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI gateway ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return ResultSchema.parse(parsed);
  });
