import { useEffect, useState } from "react";

export function CountdownTimer({ seconds, resetKey }: { seconds: number; resetKey: string }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [running, remaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="font-display text-3xl tabular-nums tracking-widest text-foreground">
        {mm}:{ss}
      </div>
      <button
        onClick={() => {
          if (remaining === 0) setRemaining(seconds);
          setRunning((r) => !r);
        }}
        className="rounded-md border border-border px-3 py-1.5 text-[10px] font-display uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        {running ? "Pausar" : remaining === 0 ? "Reiniciar" : "Iniciar"}
      </button>
    </div>
  );
}
