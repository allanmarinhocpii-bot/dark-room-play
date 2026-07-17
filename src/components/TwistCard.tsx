import type { CardAnimation } from "./ChallengeCard";

export function TwistCard({
  text,
  ativoNome,
  passivoNome,
  animation,
}: {
  text: string;
  ativoNome: string;
  passivoNome: string;
  animation?: CardAnimation;
}) {
  return (
    <div
      className={`twist-pulse relative w-full max-w-md rounded-2xl border-2 bg-card p-8 ${animation ?? "card-flip-in"}`}
      style={{ borderColor: "#F97316" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-[10px] uppercase tracking-[0.3em]" style={{ color: "#F97316" }}>
          ↔ Virada
        </span>
        <span className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          +20 pts
        </span>
      </div>
      <p
        className="mt-4 font-display text-[10px] uppercase tracking-[0.3em]"
        style={{ color: "#F97316" }}
      >
        Agora {ativoNome} comanda · {passivoNome} recebe
      </p>
      <p className="mt-6 text-[18px] leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
