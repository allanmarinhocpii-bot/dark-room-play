import { CATEGORIAS, INTENSITY_LABEL, type CategoryKey, type IntensityRank } from "@/data/challenges";
import { TimerArco } from "./TimerArco";
import { sanitizeCardText, hasReadableText } from "@/services/cardGenerator";

export type CardAnimation = "card-flip-in" | "card-enter-up" | "card-exit-up" | "card-exit-left" | null;

const TWIST_COLOR = "#F97316";

export function ChallengeCard({
  text,
  categories,
  durationSeconds,
  level,
  ativoNome,
  passivoNome,
  propHint,
  twisted = false,
  animation = "card-flip-in",
}: {
  text: string;
  categories: CategoryKey[];
  durationSeconds?: number;
  level: IntensityRank;
  ativoNome: string;
  passivoNome: string;
  propHint?: string;
  twisted?: boolean;
  animation?: CardAnimation;
}) {
  const texto = sanitizeCardText(text ?? "");
  const legivel = hasReadableText(texto);
  const primary = categories[0];
  const secondary = categories[1];
  const catColor = primary ? CATEGORIAS[primary].colorVar : "var(--foreground)";
  const primaryColor = twisted ? TWIST_COLOR : catColor;
  const secondaryColor = secondary ? CATEGORIAS[secondary].colorVar : catColor;
  const primaryName = primary ? CATEGORIAS[primary].short : "Livre";

  return (
    <div
      className={`relative w-full max-w-md rounded-xl border bg-card p-6 ${animation ?? "card-flip-in"}`}
      style={{
        borderColor: primaryColor,
        boxShadow: twisted
          ? `0 0 28px color-mix(in oklab, ${TWIST_COLOR} 28%, transparent)`
          : `0 0 20px color-mix(in oklab, ${primaryColor} 13%, transparent)`,
        backgroundImage: secondary
          ? `linear-gradient(135deg, color-mix(in oklab, ${catColor} 7%, transparent), color-mix(in oklab, ${secondaryColor} 7%, transparent))`
          : undefined,
        perspective: 1000,
        animationName: undefined,
      }}
    >
      {twisted && (
        <p
          className="mb-3 animate-pulse font-display text-[9px] uppercase tracking-[0.35em]"
          style={{ color: TWIST_COLOR }}
        >
          ↔ Virada · papéis invertidos
        </p>
      )}

      {/* ZONA 1 — Header */}
      <div className="mb-5">
        <p
          className="mb-2 font-display text-[9px] uppercase tracking-[0.3em]"
          style={{ color: primaryColor }}
        >
          {ativoNome} comanda · {passivoNome} recebe
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border px-2.5 py-0.5 font-display text-[10px] uppercase tracking-[0.15em]"
            style={{ borderColor: catColor, color: catColor }}
          >
            {primaryName}
          </span>
          {secondary && (
            <span
              className="rounded-full border px-2.5 py-0.5 font-display text-[10px] uppercase tracking-[0.15em]"
              style={{ borderColor: secondaryColor, color: secondaryColor }}
            >
              {CATEGORIAS[secondary].short}
            </span>
          )}
          <span
            className="ml-auto flex items-center gap-1"
            title={INTENSITY_LABEL[level]}
            aria-label={`Intensidade ${INTENSITY_LABEL[level]}`}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: n <= level ? catColor : "transparent",
                  border: n <= level ? "none" : "1px solid color-mix(in oklab, var(--foreground) 25%, transparent)",
                  boxShadow: n <= level ? `0 0 5px ${catColor}` : undefined,
                }}
              />
            ))}
          </span>
        </div>
      </div>

      {/* ZONA 2 — Texto do desafio */}
      <div className="min-h-[120px]">
        <p className="whitespace-pre-line text-[17px] font-light leading-[1.75] text-foreground">
          {legivel ? texto : "Carta indisponível. Toque em Pular para sortear outra."}
        </p>

        {propHint && (
          <p className="mt-4 border-t border-border/20 pt-4 text-sm italic text-muted-foreground/65">
            {propHint}
          </p>
        )}
      </div>

      {/* ZONA 3 — Timer */}
      {durationSeconds ? (
        <TimerArco segundos={durationSeconds} cor={primaryColor} />
      ) : null}
    </div>
  );
}
