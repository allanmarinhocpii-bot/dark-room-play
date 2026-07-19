import type { CardAnimation } from "./ChallengeCard";

export function TwistCard({
  ativoNome,
  passivoNome,
  animation,
}: {
  text?: string;
  ativoNome: string;
  passivoNome: string;
  animation?: CardAnimation;
}) {
  return (
    <div
      className={`relative w-full max-w-md rounded-xl border-2 bg-card p-6 ${animation ?? "card-flip-in"}`}
      style={{
        borderColor: "#F97316",
        animation: "borderPulse 1s ease-in-out infinite",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#F97316]">↔</span>
        <span className="font-display text-[10px] uppercase tracking-[0.3em] text-[#F97316]">
          Virada
        </span>
        <span className="ml-auto font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          +20 pts
        </span>
      </div>
      <p className="text-lg font-light leading-relaxed text-foreground">
        Os papéis invertem por essa rodada.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {passivoNome} comanda · {ativoNome} recebe
      </p>
    </div>
  );
}
