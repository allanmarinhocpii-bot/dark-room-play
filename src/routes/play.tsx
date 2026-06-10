import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/lib/store";
import { draw, type DrawResult } from "@/lib/engine";
import {
  CATEGORIAS,
  INTENSITY_LABEL,
  PROPS,
  type CategoryKey,
  type PropId,
  type IntensityRank,
} from "@/data/challenges";
import { ChallengeCard, type ExitDirection } from "@/components/ChallengeCard";
import { JokerCard } from "@/components/JokerCard";
import { TwistCard } from "@/components/TwistCard";
import { TensionCard } from "@/components/TensionCard";
import { SafeWordButton } from "@/components/SafeWordButton";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { ProgressionBar } from "@/components/ProgressionBar";
import { PointBurst } from "@/components/PointBurst";
import { RitualOverlay } from "@/components/RitualOverlay";
import { generateCard } from "@/services/cardGenerator";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Dark Room — Arena" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const navigate = useNavigate();
  const {
    hasHydrated,
    jogador1,
    jogador2,
    controle,
    safeWord,
    categories,
    props,
    mode,
    ritual,
    level,
    score,
    stats,
    awardPoints,
    recordDraw,
    recordComplete,
    recordSkip,
    endSession,
  } = useSessionStore();

  const activeCats = useMemo(
    () => (Object.keys(categories) as CategoryKey[]).filter((k) => categories[k]),
    [categories],
  );
  const activeProps = useMemo(
    () => (Object.keys(props) as PropId[]).filter((k) => props[k]),
    [props],
  );
  const activePropLabels = useMemo<string[]>(
    () =>
      activeProps.flatMap((id) => {
        const label = PROPS.find((p) => p.id === id)?.label;
        return label ? [label] : [];
      }),
    [activeProps],
  );

  const [card, setCard] = useState<DrawResult | null>(null);
  const [cardId, setCardId] = useState(0);
  const [exitDir, setExitDir] = useState<ExitDirection>("none");
  const [levelUpTo, setLevelUpTo] = useState<IntensityRank | null>(null);
  const [burst, setBurst] = useState<number | null>(null);
  const [showRitual, setShowRitual] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const lastTextsRef = useRef<string[]>([]);

  const drawNext = async (): Promise<DrawResult | null> => {
    const c = draw({
      jogador1,
      jogador2,
      controle,
      activeCategories: activeCats,
      mode,
      activeProps,
      level: useSessionStore.getState().level,
      roundsCompleted: useSessionStore.getState().stats.roundsCompleted,
      cardsDrawn: useSessionStore.getState().stats.cardsDrawn,
    });
    if (!c) return null;
    recordDraw(c.categories[0] ?? null, c.kind === "normal" ? c.level : null);

    if (c.kind === "normal") {
      const catKey = c.categories[0];
      const categoriaNome = catKey ? CATEGORIAS[catKey].nome : "Livre";
      const result = await generateCard({
        carta_base: c.text,
        ativo: c.ativo.nome,
        passivo: c.passivo.nome,
        genero_ativo: c.ativo.genero,
        genero_passivo: c.passivo.genero,
        categoria: categoriaNome,
        nivel: INTENSITY_LABEL[c.level],
        props_ativos: activePropLabels,
        modo: mode === "combined" ? "combinado" : "padrao",
        rodada: useSessionStore.getState().stats.roundsCompleted + 1,
        ultimas_cartas: lastTextsRef.current.slice(-3),
      });
      c.text = result.texto;
      if (result.segundos && result.segundos > 0) {
        c.durationSeconds = result.segundos;
      }
      if (result.prop_usado) {
        c.propHint = undefined; // o prop já está embutido no texto
      }
      lastTextsRef.current = [...lastTextsRef.current, result.texto].slice(-5);
    }
    return c;
  };

  const advanceTo = (c: DrawResult | null) => {
    setCard(c);
    setCardId((i) => i + 1);
    setExitDir("none");
    setLoadingNext(false);
  };

  const loadNext = async () => {
    setLoadingNext(true);
    const next = await drawNext();
    advanceTo(next);
  };

  // Hydration + initial setup
  useEffect(() => {
    if (!hasHydrated || initialized) return;
    if (!safeWord || activeCats.length === 0 || !jogador1.nome || !jogador2.nome) {
      navigate({ to: "/" });
      return;
    }
    setShowRitual(ritual);
    setInitialized(true);
    if (!ritual) {
      void loadNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const handleSkip = () => {
    recordSkip();
    setExitDir("left");
    setCard(null);
    setTimeout(() => void loadNext(), 50);
  };

  const handleComplete = () => {
    if (!card) return;
    let pts = 10;
    if (card.kind === "twist") pts = 20;
    else if (card.kind === "tension") pts = 8;
    else {
      if (card.durationSeconds) pts = 15;
      if (card.categories.length > 1) pts += 5;
    }
    if (card.kind !== "joker" && card.kind !== "tension") {
      recordComplete(card.passivoIs, card.level);
    }
    setBurst(pts);
    setTimeout(() => setBurst(null), 1200);

    const { leveledUp, newLevel } = awardPoints(pts);
    setExitDir("up");
    if (leveledUp) {
      setTimeout(() => setLevelUpTo(newLevel), 250);
    } else {
      setCard(null);
      setTimeout(() => void loadNext(), 280);
    }
  };

  const dismissLevelUp = () => {
    setLevelUpTo(null);
    setCard(null);
    void loadNext();
  };

  const finishSession = () => {
    endSession("normal");
    navigate({ to: "/aftercare" });
  };

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Carregando…
        </p>
      </div>
    );
  }

  if (showRitual) {
    const ativoNome = controle === "j2" ? jogador2.nome : jogador1.nome;
    const passivoNome = controle === "j2" ? jogador1.nome : jogador2.nome;
    return (
      <RitualOverlay
        ativoNome={ativoNome}
        passivoNome={passivoNome}
        safeWord={safeWord}
        onReady={() => {
          setShowRitual(false);
          void loadNext();
        }}
      />
    );
  }

  const loadingColor =
    card?.kind === "normal" && card.categories[0]
      ? CATEGORIAS[card.categories[0]].colorVar
      : "var(--foreground)";

  return (
    <div className="relative min-h-screen bg-background px-5 pb-40 pt-6">
      <header className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <button
            onClick={finishSession}
            className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Encerrar
          </button>
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Rodada {String(stats.roundsCompleted + 1).padStart(2, "0")}
          </p>
        </div>
        <div className="relative mt-5">
          <ProgressionBar level={level} score={score} />
          <PointBurst value={burst} />
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-md flex-col items-center">
        {loadingNext && !card && (
          <div className="flex h-72 w-full max-w-md flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{
                    backgroundColor: loadingColor,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Sorteando
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {card?.kind === "joker" && (
            <JokerCard key={cardId} cardKey={String(cardId)} ativoNome={card.ativo.nome} />
          )}
          {card?.kind === "twist" && (
            <TwistCard
              key={cardId}
              cardKey={String(cardId)}
              text={card.text}
              ativoNome={card.ativo.nome}
              passivoNome={card.passivo.nome}
            />
          )}
          {card?.kind === "tension" && (
            <TensionCard
              key={cardId}
              cardKey={String(cardId)}
              text={card.text}
              ativoNome={card.ativo.nome}
              passivoNome={card.passivo.nome}
            />
          )}
          {card?.kind === "normal" && (
            <ChallengeCard
              key={cardId}
              cardKey={String(cardId)}
              text={card.text}
              categories={card.categories}
              durationSeconds={card.durationSeconds}
              level={card.level}
              ativoNome={card.ativo.nome}
              passivoNome={card.passivo.nome}
              propHint={card.propHint}
              exitDir={exitDir}
            />
          )}
        </AnimatePresence>

        {card && !loadingNext && (
          <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
            <button
              onClick={handleSkip}
              className={`rounded-md border py-4 font-display text-xs uppercase tracking-[0.25em] ${
                card.kind === "joker"
                  ? "border-black bg-white text-black"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Pular
            </button>
            <button
              onClick={handleComplete}
              className={`rounded-md py-4 font-display text-xs uppercase tracking-[0.25em] ${
                card.kind === "joker"
                  ? "bg-black text-white"
                  : "bg-foreground text-background"
              }`}
            >
              Concluído
            </button>
          </div>
        )}
      </main>

      <SafeWordButton />

      <AnimatePresence>
        {levelUpTo && <LevelUpOverlay level={levelUpTo} onContinue={dismissLevelUp} />}
      </AnimatePresence>
    </div>
  );
}
