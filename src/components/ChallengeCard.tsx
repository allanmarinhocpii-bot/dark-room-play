import { CATEGORIAS, INTENSITY_LABEL, type CategoryKey, type IntensityRank } from "@/data/challenges";
import { TimerArco } from "./TimerArco";

export type CardAnimation = "card-flip-in" | "card-enter-up" | "card-exit-up" | "card-exit-left" | null;

export function ChallengeCard({
  text,
  categories,
  durationSeconds,
  level,
  ativoNome,
  passivoNome,
  propHint,
  animation = "card-flip-in",
}: {
  text: string;
  categories: CategoryKey[];
  durationSeconds?: number;
  level: IntensityRank;
  ativoNome: string;
  passivoNome: string;
  propHint?: string;
  animation?: CardAnimation;
}) {
  const primary = categories[0];
  const secondary = categories[1];
  const primaryColor = primary ? CATEGORIAS[primary].colorVar : "var(--foreground)";
  const secondaryColor = secondary ? CATEGORIAS[secondary].colorVar : primaryColor;
  const primaryName = primary ? CATEGORIAS[primary].short : "Livre";

  return (
    <div
      className={`relative w-full max-w-md rounded-xl border bg-card p-6 ${animation ?? "card-flip-in"}`}
      style={{
        borderColor: primaryColor,
        boxShadow: `0 0 20px color-mix(in oklab, ${primaryColor} 13%, transparent)`,
        backgroundImage: secondary
          ? `linear-gradient(135deg, color-mix(in oklab, ${primaryColor} 7%, transparent), color-mix(in oklab, ${secondaryColor} 7%, transparent))`
          : undefined,
        perspective: 1000,
      }}
    >
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
            style={{ borderColor: primaryColor, color: primaryColor }}
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
          <span className="ml-auto font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {INTENSITY_LABEL[level]}
          </span>
        </div>
      </div>

      {/* ZONA 2 — Texto do desafio */}
      <div className="min-h-[120px]">
        <p className="whitespace-pre-line text-[17px] font-light leading-[1.75] text-foreground">
          {text}
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
