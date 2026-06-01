import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSessionStore } from "@/lib/store";
import { CATEGORY_META, CHALLENGES, PROPS, type CategoryKey, type PropId } from "@/data/challenges";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dark Room — Jogo para Casais" },
      { name: "description", content: "Jogo de cartas íntimo para casais adultos consentâneos." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const {
    safeWord,
    setSafeWord,
    categories,
    toggleCategory,
    props,
    toggleProp,
    mode,
    setMode,
    ageConsent,
    setAgeConsent,
    resetGame,
  } = useSessionStore();

  const [showConsent, setShowConsent] = useState(!ageConsent);

  const activeCount = (Object.keys(categories) as CategoryKey[]).filter((k) => categories[k]).length;
  const canStart = safeWord.trim().length >= 2 && activeCount >= 1;

  const start = () => {
    if (!canStart) return;
    resetGame();
    navigate({ to: "/play" });
  };

  if (showConsent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Aviso
          </p>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-wider text-foreground">
            Conteúdo Adulto
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Este aplicativo contém conteúdo explícito voltado para adultos consentâneos (+18) em
            contexto de práticas de BDSM, kink e dinâmicas de poder. Use sempre com consentimento
            mútuo, comunicação aberta e uma safe word definida.
          </p>
          <button
            onClick={() => {
              setAgeConsent(true);
              setShowConsent(false);
            }}
            className="mt-6 w-full rounded-md bg-foreground py-3 font-display text-xs uppercase tracking-[0.25em] text-background"
          >
            Tenho +18 e Concordo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-10 pb-32">
      <div className="mx-auto max-w-md">
        <header className="text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Couples · BDSM · Kink
          </p>
          <h1 className="mt-2 font-display text-5xl uppercase tracking-wider text-foreground">
            Dark Room
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-border" />
        </header>

        <section className="mt-10">
          <SectionTitle>01 · Safe Word</SectionTitle>
          <input
            value={safeWord}
            onChange={(e) => setSafeWord(e.target.value.toUpperCase().slice(0, 24))}
            placeholder="DIGITE A PALAVRA SEGURA"
            className="mt-3 w-full rounded-md border border-[color:var(--safe-word)]/40 bg-input px-4 py-4 text-center font-display text-lg uppercase tracking-[0.25em] text-foreground placeholder:text-muted-foreground/60 focus:border-[color:var(--safe-word)] focus:outline-none glow-safe"
            style={{ boxShadow: safeWord ? undefined : "none" }}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Acionável a qualquer momento durante o jogo. Encerra a sessão e abre o aftercare.
          </p>
        </section>

        <section className="mt-10">
          <SectionTitle>02 · Categorias Ativas</SectionTitle>
          <div className="mt-3 space-y-2">
            {(Object.keys(CHALLENGES.categorias) as CategoryKey[]).map((k) => {
              const active = categories[k];
              const color = CATEGORY_META[k].colorVar;
              return (
                <button
                  key={k}
                  onClick={() => toggleCategory(k)}
                  aria-pressed={active}
                  className="flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-left transition"
                  style={
                    active
                      ? ({
                          "--cat-color": color,
                          borderColor: `color-mix(in oklab, ${color} 60%, transparent)`,
                          boxShadow: `0 0 18px color-mix(in oklab, ${color} 25%, transparent)`,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <div>
                    <p
                      className="font-display text-xs uppercase tracking-[0.2em]"
                      style={{ color: active ? color : "var(--color-foreground)" }}
                    >
                      {CHALLENGES.categorias[k].nome}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Intensidade {CATEGORY_META[k].intensity.toLowerCase()}
                    </p>
                  </div>
                  <span
                    className="h-5 w-9 rounded-full border transition"
                    style={{
                      borderColor: active ? color : "var(--color-border)",
                      background: active
                        ? `color-mix(in oklab, ${color} 70%, transparent)`
                        : "transparent",
                    }}
                  >
                    <span
                      className="block h-full w-4 rounded-full bg-background transition-transform"
                      style={{ transform: active ? "translateX(18px)" : "translateX(1px)" }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <SectionTitle>03 · Props Disponíveis</SectionTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROPS.map((p) => {
              const active = props[p.id as PropId];
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProp(p.id as PropId)}
                  className={`rounded-full border px-3.5 py-2 font-display text-[11px] uppercase tracking-[0.18em] transition ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <SectionTitle>04 · Modo de Jogo</SectionTitle>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["standard", "combined"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md border px-3 py-4 text-left transition ${
                  mode === m
                    ? "border-foreground bg-foreground/5"
                    : "border-border text-muted-foreground"
                }`}
              >
                <p className="font-display text-xs uppercase tracking-[0.2em] text-foreground">
                  {m === "standard" ? "Padrão" : "Combinado"}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {m === "standard"
                    ? "Um desafio por rodada."
                    : "Funde duas categorias em uma carta."}
                </p>
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={start}
          disabled={!canStart}
          className="mt-12 w-full rounded-md bg-foreground py-4 font-display text-sm uppercase tracking-[0.3em] text-background disabled:cursor-not-allowed disabled:opacity-30"
        >
          Iniciar Sessão
        </button>
        {!canStart && (
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {safeWord.trim().length < 2
              ? "Defina uma safe word para começar."
              : "Ative ao menos uma categoria."}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
      {children}
    </h2>
  );
}
