import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSessionStore } from "@/lib/store";

export function SafeWordButton() {
  const navigate = useNavigate();
  const safeWord = useSessionStore((s) => s.safeWord);
  const resetGame = useSessionStore((s) => s.resetGame);
  const [confirming, setConfirming] = useState(false);

  const trigger = () => {
    resetGame();
    navigate({ to: "/aftercare" });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Acionar safe word${safeWord ? `: ${safeWord}` : ""}`}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-black px-5 py-3 text-xs font-display font-bold uppercase tracking-[0.2em] text-[color:var(--safe-word)] glow-safe animate-pulse-safe transition active:scale-95"
      >
        Safe Word
      </button>

      {confirming && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm px-6"
        >
          <div className="w-full max-w-sm rounded-lg border border-[color:var(--safe-word)]/50 bg-card p-6 glow-safe">
            <p className="font-display text-xs uppercase tracking-[0.25em] text-[color:var(--safe-word)]">
              Confirmar Safe Word
            </p>
            {safeWord && (
              <p className="mt-3 font-display text-2xl uppercase tracking-widest text-foreground">
                {safeWord}
              </p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Encerrar a sessão agora e ir para o aftercare?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-md border border-border bg-transparent py-3 text-xs font-display uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Voltar
              </button>
              <button
                onClick={trigger}
                className="flex-1 rounded-md bg-[color:var(--safe-word)] py-3 text-xs font-display font-bold uppercase tracking-widest text-black"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
