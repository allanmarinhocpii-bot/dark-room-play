import { CARTA_FINAL } from "@/data/challenges";
import type { CardAnimation } from "./ChallengeCard";

export function FinalCard({
  animation = "card-flip-in",
  onEncerrar,
  onContinuar,
}: {
  animation?: CardAnimation;
  onEncerrar: () => void;
  onContinuar: () => void;
}) {
  return (
    <div
      className={`w-full max-w-md rounded-xl border bg-card p-8 text-center ${animation ?? "card-flip-in"}`}
      style={{
        borderColor: "#FF00FF",
        boxShadow: "0 0 30px color-mix(in oklab, #FF00FF 22%, transparent)",
      }}
    >
      <p
        className="font-display text-[10px] uppercase tracking-[0.4em]"
        style={{ color: "#FF00FF" }}
      >
        {CARTA_FINAL.titulo}
      </p>
      <p className="mt-6 text-[17px] font-light leading-[1.8] text-foreground">
        {CARTA_FINAL.texto}
      </p>

      <div className="mt-10 flex flex-col gap-3">
        <button
          onClick={onEncerrar}
          className="rounded-md bg-foreground py-4 font-display text-xs uppercase tracking-[0.3em] text-background"
        >
          Encerrar juntos
        </button>
        <button
          onClick={onContinuar}
          className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          Continuar jogando
        </button>
      </div>
    </div>
  );
}
