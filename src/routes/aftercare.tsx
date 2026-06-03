import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useSessionStore } from "@/lib/store";

export const Route = createFileRoute("/aftercare")({
  head: () => ({
    meta: [
      { title: "Dark Room — Aftercare" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AftercarePage,
});

function AftercarePage() {
  const navigate = useNavigate();
  const reason = useSessionStore((s) => s.stats.endReason);
  const isSafe = reason === "safeword";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen px-6 py-20"
      style={{ background: "#F5F0EB", color: "#1a1a1a" }}
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {isSafe ? (
          <>
            <h1 className="text-3xl font-medium" style={{ color: "#1a1a1a" }}>Pausa.</h1>
            <p className="mt-4 text-base" style={{ color: "#444" }}>
              Tudo bem. Vocês estão seguros.
            </p>
            <ul className="mt-10 space-y-4 text-left text-base" style={{ color: "#333" }}>
              <li>→ Água primeiro.</li>
              <li>→ Cobertor se precisar.</li>
              <li>→ Fiquem juntos por pelo menos 10 minutos.</li>
              <li>→ Sem análise agora. Só presença.</li>
            </ul>
            <p className="mt-8 text-sm" style={{ color: "#555" }}>
              Quando estiverem prontos, podem conversar sobre o que aconteceu.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-medium" style={{ color: "#1a1a1a" }}>
              Sessão encerrada.
            </h1>
            <p className="mt-4 text-base" style={{ color: "#444" }}>
              Cuidem um do outro agora.
            </p>
            <ul className="mt-10 space-y-4 text-left text-base" style={{ color: "#333" }}>
              <li>→ Água.</li>
              <li>→ Contato físico confortável.</li>
              <li>→ Falem o que foi bom.</li>
            </ul>
          </>
        )}

        <button
          onClick={() => navigate({ to: "/historia" })}
          className="mt-14 w-full rounded-md py-4 font-display text-xs uppercase tracking-[0.3em]"
          style={{ background: "#1a1a1a", color: "#fff" }}
        >
          Estamos bem
        </button>
      </div>
    </motion.div>
  );
}
