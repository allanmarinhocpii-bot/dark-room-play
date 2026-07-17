export function PointBurst({ value }: { value: number | null }) {
  return value !== null ? (
    <span
      key={value}
      className="pointer-events-none absolute -top-3 right-0 animate-float-up font-display text-xs"
      style={{ color: "#00FF9D", textShadow: "0 0 8px #00FF9D" }}
    >
      +{value}
    </span>
  ) : null;
}
