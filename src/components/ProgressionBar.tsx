import { motion } from "framer-motion";
import { LEVELS, type IntensityRank } from "@/data/challenges";

export function ProgressionBar({ level, score }: { level: IntensityRank; score: number }) {
  const current = LEVELS[level - 1];
  const next = LEVELS[level] ?? null;
  const progress = next
    ? Math.min(
        100,
        ((score - current.threshold) / (next.threshold - current.threshold)) * 100,
      )
    : 100;

  return (
    <div>
      <div className="flex items-end justify-between">
        <p
          className="font-display text-[11px] uppercase tracking-[0.3em]"
          style={{ color: current.accent }}
        >
          {current.name}
        </p>
        {next && (
          <p className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            {next.name}
          </p>
        )}
      </div>
      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-border/30">
        <motion.div
          className="h-full"
          style={{
            background: next
              ? `linear-gradient(90deg, ${current.accent}, ${next.accent})`
              : current.accent,
            boxShadow: `0 0 12px ${current.accent}`,
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
