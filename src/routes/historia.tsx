import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSessionStore } from "@/lib/store";
import { CATEGORIAS, LEVELS, type CategoryKey } from "@/data/challenges";

export const Route = createFileRoute("/historia")({
  head: () => ({
    meta: [
      { title: "Dark Room — Histórico" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: HistoriaPage,
});

function HistoriaPage() {
  const navigate = useNavigate();
  const {
    jogador1,
    jogador2,
    level,
    stats,
    scoringMode,
    resetGame,
  } = useSessionStore();

  const lvlMeta = LEVELS[level - 1];
  const totalMin =
    stats.startedAt && stats.endedAt
      ? Math.max(1, Math.round((stats.endedAt - stats.startedAt) / 60000))
      : 0;
  const top3 = (Object.entries(stats.categoryCounts) as Array<[CategoryKey, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const winner =
    scoringMode === "competitivo"
      ? stats.passiveLoad.j1 === stats.passiveLoad.j2
        ? null
        : stats.passiveLoad.j1 > stats.passiveLoad.j2
        ? jogador1
        : jogador2
      : null;

  const novaSessao = () => {
    resetGame();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background px-6 py-14">
      <div className="mx-auto max-w-md">
        <p className="text-center font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Histórico da Sessão
        </p>
        <h1
          className="mt-4 text-center font-display text-4xl uppercase tracking-[0.18em]"
          style={{ color: lvlMeta.accent, textShadow: `0 0 20px ${lvlMeta.accent}` }}
        >
          {lvlMeta.name}
        </h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">{lvlMeta.subtitle}</p>

        <div className="mt-10 grid grid-cols-2 gap-3">
          <Stat label="Rodadas" value={stats.roundsCompleted} />
          <Stat label="Tempo" value={`${totalMin} min`} />
          <Stat label="Cartas puladas" value={stats.skips} />
          <Stat label="Carta mais intensa" value={`Nível ${stats.maxLevelPlayed}`} />
        </div>

        {top3.length > 0 && (
          <div className="mt-8">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Categorias mais jogadas
            </p>
            <div className="mt-3 space-y-2">
              {top3.map(([k, n]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
                >
                  <span
                    className="font-display text-xs uppercase tracking-[0.2em]"
                    style={{ color: CATEGORIAS[k].colorVar }}
                  >
                    {CATEGORIAS[k].nome}
                  </span>
                  <span className="font-display text-xs tabular-nums text-muted-foreground">
                    {n}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {scoringMode === "competitivo" && (
          <div className="mt-8 rounded-md border border-border bg-card p-4">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Modo competitivo
            </p>
            {winner ? (
              <>
                <p className="mt-2 font-display text-lg uppercase tracking-wider text-foreground">
                  Vencedor: {winner.nome}
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Recompensa revelada
                </p>
                <p className="mt-2 text-base text-foreground">
                  {winner.recompensa || "(não definida)"}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Empate. Cuidem-se igualmente.</p>
            )}
          </div>
        )}

        <button
          onClick={novaSessao}
          className="mt-12 w-full rounded-md bg-foreground py-4 font-display text-xs uppercase tracking-[0.3em] text-background"
        >
          Nova sessão
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="font-display text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl tabular-nums tracking-wide text-foreground">
        {value}
      </p>
    </div>
  );
}
