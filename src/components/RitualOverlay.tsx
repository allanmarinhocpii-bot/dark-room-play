import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function RitualOverlay({
  ativoNome,
  passivoNome,
  safeWord,
  onReady,
}: {
  ativoNome: string;
  passivoNome: string;
  safeWord: string;
  onReady: () => void;
}) {
  const [seconds, setSeconds] = useState(30);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-30 flex items-center justify-center bg-black px-8"
    >
      <div className="max-w-md text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
          Ritual de Abertura
        </p>
        <h2 className="mt-6 font-display text-3xl uppercase tracking-[0.15em] text-foreground">
          Antes de começar.
        </h2>
        <div className="mt-10 space-y-5 text-left text-base leading-relaxed text-foreground/85">
          <p>Olhem um para o outro.</p>
          <p>
            <span className="text-foreground">{ativoNome || "Quem comanda"}</span> fala a safe word{" "}
            <span className="text-[color:var(--safe-word)] font-display tracking-widest">
              {safeWord || "—"}
            </span>{" "}
            em voz alta para {passivoNome || "quem recebe"}.
          </p>
          <p>Respirem juntos por 30 segundos.</p>
          <p>Quando estiverem prontos — comecem.</p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              if (seconds === 0) setSeconds(30);
              setRunning((r) => !r);
            }}
            className="rounded-full border border-border px-4 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            {running ? "Pausar" : seconds === 0 ? "Reiniciar" : "Iniciar 30s"}
          </button>
          <span className="font-display text-2xl tabular-nums text-foreground">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
        </div>

        <button
          onClick={onReady}
          className="mt-12 w-full rounded-md bg-foreground py-4 font-display text-sm uppercase tracking-[0.3em] text-background"
        >
          Estamos prontos
        </button>
      </div>
    </motion.div>
  );
}
