import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSessionStore } from "@/lib/store";
import { CATEGORIAS, PROPS, type CategoryKey, type PropId } from "@/data/challenges";
import { validateChallenges, type ValidationResult } from "@/lib/validateChallenges";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dark Room — Jogo para Casais" },
      { name: "description", content: "Jogo de cartas íntimo para casais." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const s = useSessionStore();
  const {
    jogador1,
    jogador2,
    controle,
    safeWord,
    categories,
    props,
    mode,
    scoringMode,
    ritual,
    setJogador1,
    setJogador2,
    setControle,
    setSafeWord,
    toggleCategory,
    toggleProp,
    setMode,
    setScoringMode,
    setRitual,
    resetGame,
  } = s;

  const activeCount = (Object.keys(categories) as CategoryKey[]).filter((k) => categories[k]).length;
  const [schema, setSchema] = useState<ValidationResult | null>(null);
  const [tentouIniciar, setTentouIniciar] = useState(false);

  useEffect(() => {
    const r = validateChallenges();
    setSchema(r);
    if (!r.ok) console.error("[Dark Room] Schema inválido:", r.errors);
    if (r.warnings.length > 0) console.warn("[Dark Room] Schema warnings:", r.warnings);
  }, []);

  const getMensagemBloqueio = () => {
    if (!jogador1.nome.trim() && !jogador2.nome.trim()) return "Preencha os nomes dos dois jogadores.";
    if (!jogador1.nome.trim()) return "Preencha o nome do Jogador 1.";
    if (!jogador2.nome.trim()) return "Preencha o nome do Jogador 2.";
    if (safeWord.trim().length < 2) return "Defina a safe word antes de começar.";
    if (activeCount < 1) return "Ative ao menos uma categoria.";
    if (schema && !schema.ok) return "Banco de desafios inválido.";
    return "";
  };

  const mensagemBloqueio = getMensagemBloqueio();
  const podeIniciar = !mensagemBloqueio;

  const handleStart = () => {
    if (mensagemBloqueio) {
      setTentouIniciar(true);
      return;
    }
    setTentouIniciar(false);
    resetGame();
    navigate({ to: "/play" });
  };

  return (
    <div className="min-h-screen bg-background px-5 py-10 pb-32">
      <div className="mx-auto max-w-md">
        {schema && !schema.ok && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
            <p className="font-display uppercase tracking-[0.2em]">
              Schema com {schema.errors.length} erro(s)
            </p>
            <ul className="mt-2 space-y-1">
              {schema.errors.slice(0, 5).map((e, i) => (
                <li key={i} className="font-mono opacity-80">
                  · {e.path}: {e.message}
                </li>
              ))}
              {schema.errors.length > 5 && (
                <li className="opacity-70">… +{schema.errors.length - 5} (ver console)</li>
              )}
            </ul>
          </div>
        )}
        <header className="text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Couples · Kink · Power
          </p>
          <h1 className="mt-2 font-display text-5xl uppercase tracking-wider text-foreground">
            Dark Room
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-border" />
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Cinco níveis. Uma ascensão. As cartas se desbloqueiam conforme vocês avançam.
          </p>
        </header>

        {/* 00 · JOGADORES */}
        <Section title="00 · Jogadores">
          <PlayerInput
            label="Jogador 1"
            value={jogador1}
            onChange={(p) => setJogador1(p)}
          />
          <div className="mt-3">
            <PlayerInput
              label="Jogador 2"
              value={jogador2}
              onChange={(p) => setJogador2(p)}
            />
          </div>
          <p className="mt-5 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Quem comanda
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {([
              { v: "aleatorio", l: "Aleatório" },
              { v: "j1", l: jogador1.nome || "Jog. 1" },
              { v: "j2", l: jogador2.nome || "Jog. 2" },
            ] as const).map((o) => (
              <button
                key={o.v}
                onClick={() => setControle(o.v)}
                className={`rounded-md border px-2 py-3 font-display text-[10px] uppercase tracking-[0.18em] transition ${
                  controle === o.v
                    ? "border-foreground bg-foreground/5 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Section>

        {/* 01 · SAFE WORD */}
        <Section title="01 · Safe Word">
          <input
            value={safeWord}
            onChange={(e) => setSafeWord(e.target.value.toUpperCase().slice(0, 24))}
            placeholder="DIGITE A PALAVRA SEGURA"
            className="w-full rounded-md border border-[color:var(--safe-word)]/40 bg-input px-4 py-4 text-center font-display text-lg uppercase tracking-[0.25em] text-foreground placeholder:text-muted-foreground/60 focus:border-[color:var(--safe-word)] focus:outline-none"
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Acionável a qualquer momento. Encerra a sessão e abre o aftercare.
          </p>
        </Section>

        {/* 02 · CATEGORIAS */}
        <Section title="02 · Categorias">
          <div className="space-y-2">
            {(Object.keys(CATEGORIAS) as CategoryKey[]).map((k) => {
              const active = categories[k];
              const color = CATEGORIAS[k].colorVar;
              return (
                <button
                  key={k}
                  onClick={() => toggleCategory(k)}
                  aria-pressed={active}
                  className="flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-left transition"
                  style={
                    active
                      ? ({
                          borderColor: `color-mix(in oklab, ${color} 60%, transparent)`,
                          boxShadow: `0 0 14px color-mix(in oklab, ${color} 30%, transparent)`,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <div>
                    <p
                      className="font-display text-xs uppercase tracking-[0.2em]"
                      style={{ color: active ? color : "var(--color-foreground)" }}
                    >
                      {CATEGORIAS[k].nome}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Desbloqueia a partir do nível {CATEGORIAS[k].rankBase}
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
        </Section>

        {/* 03 · PROPS */}
        <Section title="03 · Props">
          <div className="flex flex-wrap gap-2">
            {PROPS.map((p) => {
              const active = props[p.id as PropId];
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProp(p.id as PropId)}
                  className={`rounded-full border px-3.5 py-2 font-display text-[11px] uppercase tracking-[0.18em] transition-all duration-150 active:scale-105 ${
                    active
                      ? "border-white bg-white/10 text-white shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                      : "border-[#333] text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && <span className="mr-1.5 text-[9px]">✓</span>}
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Props adicionam camadas extras quando a carta sorteada for compatível.
          </p>
        </Section>

        {/* 04 · MODO */}
        <Section title="04 · Modo de Jogo">
          <div className="grid grid-cols-2 gap-2">
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
                  {m === "standard" ? "Um desafio por rodada." : "Funde duas categorias."}
                </p>
              </button>
            ))}
          </div>
        </Section>

        {/* 05 · PONTUAÇÃO */}
        <Section title="05 · Pontuação">
          <div className="grid grid-cols-2 gap-2">
            {(["juntos", "competitivo"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setScoringMode(m)}
                className={`rounded-md border px-3 py-4 text-left transition ${
                  scoringMode === m
                    ? "border-foreground bg-foreground/5"
                    : "border-border text-muted-foreground"
                }`}
              >
                <p className="font-display text-xs uppercase tracking-[0.2em] text-foreground">
                  {m === "juntos" ? "Juntos" : "Competitivo"}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {m === "juntos" ? "Cooperativo. Ascensão compartilhada." : "Quem recebeu mais intensidade vence."}
                </p>
              </button>
            ))}
          </div>
          {scoringMode === "competitivo" && (
            <div className="mt-4 space-y-3 rounded-md border border-border bg-card/60 p-3">
              <RewardInput
                label={`Recompensa secreta de ${jogador1.nome || "Jogador 1"}`}
                value={jogador1.recompensa ?? ""}
                onChange={(v) => setJogador1({ recompensa: v })}
              />
              <RewardInput
                label={`Recompensa secreta de ${jogador2.nome || "Jogador 2"}`}
                value={jogador2.recompensa ?? ""}
                onChange={(v) => setJogador2({ recompensa: v })}
              />
              <p className="text-[10px] text-muted-foreground">
                Revelada apenas para o vencedor ao final da sessão.
              </p>
            </div>
          )}
        </Section>

        {/* 06 · RITUAL */}
        <Section title="06 · Ritual de Abertura">
          <button
            onClick={() => setRitual(!ritual)}
            className="flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-left"
          >
            <div>
              <p className="font-display text-xs uppercase tracking-[0.2em] text-foreground">
                {ritual ? "Ativado" : "Desativado"}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Tela inicial de respiração antes da primeira carta.
              </p>
            </div>
            <span
              className="relative h-5 w-9 rounded-full border transition"
              style={{
                borderColor: ritual ? "var(--foreground)" : "var(--color-border)",
                background: ritual ? "var(--foreground)" : "transparent",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 block h-4 w-4 rounded-full bg-background transition-transform"
                style={{ transform: ritual ? "translateX(16px)" : "translateX(0px)" }}
              />
            </span>
          </button>
        </Section>

        <button
          onClick={handleStart}
          className={`mt-12 w-full rounded-md py-4 font-display text-sm uppercase tracking-[0.3em] text-background transition-opacity ${
            podeIniciar ? "bg-foreground" : "bg-foreground/50"
          }`}
        >
          Iniciar Sessão
        </button>
        {tentouIniciar && mensagemBloqueio && (
          <p className="mt-3 text-center text-[11px] text-red-400">
            {mensagemBloqueio}
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PlayerInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { nome: string; genero: "M" | "F" };
  onChange: (p: { nome?: string; genero?: "M" | "F" }) => void;
}) {
  return (
    <div>
      <p className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={value.nome}
          onChange={(e) => onChange({ nome: e.target.value.slice(0, 20) })}
          placeholder="Nome"
          className="flex-1 rounded-md border border-border bg-input px-4 py-3 font-display text-sm tracking-wide text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
        />
        <div className="flex overflow-hidden rounded-md border border-border">
          {(["M", "F"] as const).map((g) => (
            <button
              key={g}
              onClick={() => onChange({ genero: g })}
              className={`px-3 font-display text-xs ${
                value.genero === g
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RewardInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="font-display text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Recompensa secreta"
        className="mt-1.5 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
      />
    </div>
  );
}
