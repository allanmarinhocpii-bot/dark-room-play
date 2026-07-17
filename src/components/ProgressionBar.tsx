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
    <div className="flex items-center gap-2">
      <span
        className="font-display text-[9px] uppercase tracking-[0.25em] shrink-0"
        style={{ color: current.accent }}
      >
        {current.name}
      </span>

      <div className="relative flex-1 overflow-hidden rounded-full h-px bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: current.accent,
            boxShadow: `0 0 6px ${current.accent}`,
          }}
        />
      </div>

      <span className="font-display text-[9px] uppercase tracking-[0.25em] text-muted-foreground shrink-0">
        {next?.name ?? "—"}
      </span>
    </div>
  );
}
