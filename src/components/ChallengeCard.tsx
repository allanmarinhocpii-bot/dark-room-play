import { motion } from "framer-motion";
import { CATEGORY_META, CHALLENGES, type CategoryKey } from "@/data/challenges";
import { CountdownTimer } from "./CountdownTimer";

export function ChallengeCard({
  text,
  categories,
  durationSeconds,
  cardKey,
}: {
  text: string;
  categories: CategoryKey[];
  durationSeconds?: number;
  cardKey: string;
}) {
  const primary = categories[0];
  const secondary = categories[1];
  const primaryColor = CATEGORY_META[primary].colorVar;
  const secondaryColor = secondary ? CATEGORY_META[secondary].colorVar : primaryColor;

  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glow-cat relative w-full max-w-md rounded-2xl border border-border bg-card p-8"
      style={
        {
          "--cat-color": primaryColor,
          backgroundImage: secondary
            ? `linear-gradient(135deg, color-mix(in oklab, ${primaryColor} 8%, transparent), color-mix(in oklab, ${secondaryColor} 8%, transparent))`
            : undefined,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <span
            key={c}
            className="rounded-full border px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.2em]"
            style={{
              borderColor: `color-mix(in oklab, ${CATEGORY_META[c].colorVar} 60%, transparent)`,
              color: CATEGORY_META[c].colorVar,
            }}
          >
            {CATEGORY_META[c].short}
          </span>
        ))}
        <span className="ml-auto font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {CATEGORY_META[primary].intensity}
        </span>
      </div>

      <p className="mt-2 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {CHALLENGES.categorias[primary].nome}
        {secondary ? ` × ${CHALLENGES.categorias[secondary].nome}` : ""}
      </p>

      <div className="mt-6 min-h-[180px]">
        <p className="whitespace-pre-line text-lg leading-relaxed text-foreground">{text}</p>
      </div>

      {durationSeconds ? (
        <div className="mt-6 border-t border-border pt-5">
          <CountdownTimer seconds={durationSeconds} resetKey={cardKey} />
        </div>
      ) : null}
    </motion.div>
  );
}
