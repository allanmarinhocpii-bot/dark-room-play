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
  const { jogador1, jogador2, level, stats, scoringMode, resetGame } = useSessionStore();

  const lvlMeta = LEVELS[level - 1];
  const totalRodadas = stats.roundsCompleted + stats.skips;

  const categoriaEntries = (Object.entries(stats.categoryCounts) as Array<
    [CategoryKey, number]
  >).sort((a, b) => b[1] - a[1]);
  const totalCat = categoriaEntries.reduce((acc, [, v]) => acc + v, 0) || 1;
  const top3 = categoriaEntries.slice(0, 3).map(([k, n]) => ({
    nome: CATEGORIAS[k].nome,
    cor: CATEGORIAS[k].colorVar,
    percentual: Math.round((n / totalCat) * 100),
  }));

  const winner =
    scoringMode === "competitivo"
      ? stats.passiveLoad.j1 === stats.passiveLoad.j2
        ? null
        : stats.passiveLoad.j1 > stats.passiveLoad.j2
          ? jogador1
          : jogador2
      : null;

  const dataFmt = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const novaSessao = () => {
    resetGame();
    navigate({ to: "/play" });
  };
  const encerrar = () => {
    resetGame();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-md">
        <h2 className="font-display text-2xl uppercase tracking-wider text-foreground">
          Sessão encerrada
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">{dataFmt}</p>

        <div className="mt-10">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Nível alcançado
          </p>
          <p
            className="mt-2 font-display text-3xl uppercase tracking-wider"
            style={{ color: lvlMeta.accent, textShadow: `0 0 20px ${lvlMeta.accent}55` }}
          >
            {lvlMeta.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{lvlMeta.subtitle}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {(
            [
              ["Rodadas", totalRodadas],
              ["Concluídas", stats.roundsCompleted],
              ["Puladas", stats.skips],
              ["Viradas", stats.twists],
            ] as const
          ).map(([label, val]) => (
            <div key={label} className="rounded-md border border-border p-4">
              <p className="font-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 font-display text-2xl tabular-nums text-foreground">{val}</p>
            </div>
          ))}
        </div>

        {top3.length > 0 && (
          <div className="mt-8">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Mais jogadas
            </p>
            <div className="mt-3 space-y-3">
              {top3.map((cat, i) => (
                <div key={cat.nome} className="flex items-center gap-3">
                  <span className="w-4 font-display text-[9px] text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="relative h-px flex-1 bg-[#1a1a1a]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${cat.percentual}%`,
                        background: cat.cor,
                        height: 2,
                        top: -0.5,
                        boxShadow: `0 0 6px ${cat.cor}`,
                      }}
                    />
                  </div>
                  <span
                    className="font-display text-[10px] uppercase tracking-[0.15em]"
                    style={{ color: cat.cor }}
                  >
                    {cat.nome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {scoringMode === "competitivo" && (
          <div className="mt-8 rounded-md border border-border p-5">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Vencedor
            </p>
            {winner ? (
              <>
                <p className="mt-2 font-display text-xl text-foreground">{winner.nome}</p>
                <p className="mt-3 text-sm text-muted-foreground">Sua recompensa:</p>
                <p className="mt-1 italic text-foreground">
                  "{winner.recompensa || "(não definida)"}"
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Empate. Cuidem-se igualmente.
              </p>
            )}
          </div>
        )}

        <div className="mt-12 flex gap-3">
          <button
            onClick={novaSessao}
            className="flex-1 rounded-md bg-foreground py-4 font-display text-xs uppercase tracking-[0.3em] text-background"
          >
            Nova sessão
          </button>
          <button
            onClick={encerrar}
            className="flex-1 rounded-md border border-border py-4 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            Encerrar
          </button>
        </div>
      </div>
    </div>
  );
}
