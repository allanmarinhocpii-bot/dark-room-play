import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSessionStore } from "@/lib/store";

export function SafeWordButton() {
  const navigate = useNavigate();
  const safeWord = useSessionStore((s) => s.safeWord);
  const endSession = useSessionStore((s) => s.endSession);
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const trigger = () => {
    endSession("safeword");
    navigate({ to: "/aftercare" });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (expanded) setConfirming(true);
          else setExpanded(true);
        }}
        onMouseLeave={() => setExpanded(false)}
        aria-label={`Safe word${safeWord ? `: ${safeWord}` : ""}`}
        className="fixed top-5 right-5 z-40 flex items-center justify-center rounded-full border transition-all active:scale-95"
        style={{
          width: expanded ? "auto" : 32,
          height: 32,
          paddingLeft: expanded ? 14 : 0,
          paddingRight: expanded ? 14 : 0,
          borderColor: expanded ? "var(--safe-word)" : "color-mix(in oklab, var(--safe-word) 50%, transparent)",
          color: "var(--safe-word)",
          background: expanded ? "color-mix(in oklab, var(--safe-word) 20%, transparent)" : "transparent",
          opacity: expanded ? 1 : 0.45,
        }}
      >
        {expanded ? (
          <span className="font-display text-[10px] uppercase tracking-[0.25em] whitespace-nowrap">
            Safe Word
          </span>
        ) : (
          <span className="text-base leading-none">⬡</span>
        )}
      </button>

      {confirming && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm px-6"
        >
          <div className="w-full max-w-sm rounded-lg border border-[color:var(--safe-word)]/60 bg-card p-6 glow-safe">
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
                onClick={() => {
                  setConfirming(false);
                  setExpanded(false);
                }}
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
