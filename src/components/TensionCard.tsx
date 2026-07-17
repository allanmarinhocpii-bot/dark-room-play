import type { CardAnimation } from "./ChallengeCard";

export function TensionCard({
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
      className={`relative w-full max-w-md rounded-2xl border border-border/70 bg-card/60 p-8 backdrop-blur ${animation ?? "card-flip-in"}`}
    >
      <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        Respiro · Tensão Psicológica
      </p>
      <p className="mt-2 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
        {ativoNome} · {passivoNome}
      </p>
      <p className="mt-6 text-[18px] leading-relaxed text-foreground/90">{text}</p>
    </div>
  );
}
