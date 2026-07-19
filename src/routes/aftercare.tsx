import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

  const itensSafe = [
    "Água primeiro.",
    "Cobertor se precisar.",
    "Fiquem juntos por pelo menos 10 minutos.",
    "Sem análise agora. Só presença.",
  ];
  const itensNormal = [
    "Água.",
    "Contato físico confortável.",
    "Falem o que foi bom.",
  ];
  const itens = isSafe ? itensSafe : itensNormal;

  return (
    <div
      className="min-h-screen px-8 py-16"
      style={{ background: "#F5F0EB", animation: "fadeIn 0.8s ease-out" }}
    >
      <div className="mx-auto max-w-md">
        <h2 className="text-2xl font-light text-gray-800">
          {isSafe ? "Pausa." : "Sessão encerrada."}
        </h2>
        <p className="mt-4 text-gray-600">
          {isSafe ? "Tudo bem. Vocês estão seguros." : "Cuidem um do outro agora."}
        </p>
        <div className="mt-8 space-y-4">
          {itens.map((item) => (
            <p key={item} className="flex gap-3 text-gray-700">
              <span className="text-gray-400">→</span>
              {item}
            </p>
          ))}
        </div>
        {isSafe && (
          <p className="mt-8 text-sm italic text-gray-500">
            Quando estiverem prontos, podem conversar sobre o que aconteceu.
          </p>
        )}
        <button
          onClick={() => navigate({ to: "/historia" })}
          className="mt-16 w-full rounded-md bg-gray-900 py-4 font-display text-xs uppercase tracking-[0.3em] text-white"
        >
          Estamos bem
        </button>
      </div>
    </div>
  );
}
