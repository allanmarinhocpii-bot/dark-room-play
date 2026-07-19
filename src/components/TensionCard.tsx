import type { CardAnimation } from "./ChallengeCard";

export function TensionCard({
  text,
  animation,
}: {
  text: string;
  ativoNome?: string;
  passivoNome?: string;
  animation?: CardAnimation;
}) {
  return (
    <div
      className={`relative w-full max-w-md rounded-xl border bg-card p-6 ${animation ?? "card-flip-in"}`}
      style={{ borderColor: "#2a2a2a" }}
    >
      <span className="mb-4 block font-display text-[9px] uppercase tracking-[0.3em] text-[#4B5563]">
        Pausa
      </span>
      <p className="text-[17px] font-light leading-[1.75] text-foreground">{text}</p>
    </div>
  );
}
