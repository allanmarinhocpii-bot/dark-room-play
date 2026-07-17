import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSessionStore } from "@/lib/store";

export function SafeWordButton() {
  const navigate = useNavigate();
  const endSession = useSessionStore((s) => s.endSession);
  const [expanded, setExpanded] = useState(false);

  const trigger = () => {
    endSession("safeword");
    navigate({ to: "/aftercare" });
  };

  return (
    <button
      type="button"
      onClick={() => (expanded ? trigger() : setExpanded(true))}
      onBlur={() => setTimeout(() => setExpanded(false), 150)}
      aria-label={expanded ? "Confirmar Safe Word" : "Safe Word"}
      className="fixed top-4 right-4 z-50 flex items-center justify-center font-display transition-all duration-200"
      style={
        expanded
          ? {
              padding: "8px 16px",
              borderRadius: 9999,
              backgroundColor: "color-mix(in oklab, var(--safe-word) 40%, black)",
              color: "white",
              fontSize: 11,
              letterSpacing: "0.2em",
            }
          : {
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1px solid color-mix(in oklab, var(--safe-word) 40%, transparent)",
              color: "color-mix(in oklab, var(--safe-word) 50%, transparent)",
              background: "transparent",
              fontSize: 14,
            }
      }
    >
      {expanded ? "SAFE WORD" : "⬡"}
    </button>
  );
}
