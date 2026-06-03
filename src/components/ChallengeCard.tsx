import { motion } from "framer-motion";
import { CATEGORIAS, INTENSITY_LABEL, type CategoryKey, type IntensityRank } from "@/data/challenges";
import { ArcTimer } from "./ArcTimer";

export type ExitDirection = "up" | "left" | "none";

export function ChallengeCard({
  text,
  categories,
  durationSeconds,
  cardKey,
  level,
  ativoNome,
  passivoNome,
  propHint,
  exitDir = "none",
}: {
  text: string;
  categories: CategoryKey[];
  durationSeconds?: number;
  cardKey: string;
  level: IntensityRank;
  ativoNome: string;
  passivoNome: string;
  propHint?: string;
  exitDir?: ExitDirection;
}) {
  const primary = categories[0];
  const secondary = categories[1];
  const primaryColor = primary ? CATEGORIAS[primary].colorVar : "var(--foreground)";
  const secondaryColor = secondary ? CATEGORIAS[secondary].colorVar : primaryColor;

  const exit =
    exitDir === "up"
      ? { y: -120, opacity: 0, scale: 0.95 }
      : exitDir === "left"
      ? { x: -160, opacity: 0, rotate: -4 }
      : { opacity: 0, scale: 0.95 };

  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, rotateY: -90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={exit}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={
        {
          "--cat-color": primaryColor,
          backgroundImage: secondary
            ? `linear-gradient(135deg, color-mix(in oklab, ${primaryColor} 7%, transparent), color-mix(in oklab, ${secondaryColor} 7%, transparent))`
            : undefined,
          perspective: 1000,
        } as React.CSSProperties
      }
      className="glow-cat relative w-full max-w-md rounded-2xl border border-border bg-card p-7"
    >
      <p
        className="font-display text-[10px] uppercase tracking-[0.3em]"
        style={{ color: primaryColor }}
      >
        {ativoNome} comanda · {passivoNome} recebe
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <span
            key={c}
            className="rounded-full border px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.2em]"
            style={{
              borderColor: `color-mix(in oklab, ${CATEGORIAS[c].colorVar} 60%, transparent)`,
              color: CATEGORIAS[c].colorVar,
            }}
          >
            {CATEGORIAS[c].short}
          </span>
        ))}
        <span className="ml-auto font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {INTENSITY_LABEL[level]}
        </span>
      </div>

      <div className="mt-7 min-h-[180px]">
        <p className="whitespace-pre-line text-[19px] leading-[1.55] text-foreground">{text}</p>
        {propHint && (
          <>
            <div className="mt-5 h-px w-12 bg-border" />
            <p className="mt-4 text-[14px] italic leading-relaxed text-muted-foreground/80">
              {propHint}
            </p>
          </>
        )}
      </div>

      {durationSeconds ? (
        <div className="mt-7 flex justify-center border-t border-border pt-6">
          <ArcTimer seconds={durationSeconds} resetKey={cardKey} color={primaryColor} />
        </div>
      ) : null}
    </motion.div>
  );
}
