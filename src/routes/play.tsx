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
import { ChallengeCard, type CardAnimation } from "@/components/ChallengeCard";
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
    recordTwist,
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
  const [cardAnim, setCardAnim] = useState<CardAnimation>("card-flip-in");
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

  const advanceTo = (c: DrawResult | null, anim: CardAnimation = "card-flip-in") => {
    setCard(c);
    setCardId((i) => i + 1);
    setCardAnim(anim);
    setLoadingNext(false);
  };

  const loadNext = async (anim: CardAnimation = "card-flip-in") => {
    setLoadingNext(true);
    const next = await drawNext();
    advanceTo(next, anim);
  };

  const trocarCarta = async (motivo: "concluido" | "pulou") => {
    setCardAnim(motivo === "concluido" ? "card-exit-up" : "card-exit-left");
    await new Promise((r) => setTimeout(r, 250));
    setCard(null);
    setLoadingNext(true);
    const next = await drawNext();
    advanceTo(next, "card-flip-in");
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
    void trocarCarta("pulou");
  };

  const handleComplete = async () => {
    if (!card) return;
    let pts = 10;
    if (card.kind === "twist") pts = 20;
    else if (card.kind === "tension") pts = 8;
    else {
      if (card.durationSeconds) pts = 15;
      if (card.categories.length > 1) pts += 5;
    }
    if (card.kind === "twist") recordTwist();
    if (card.kind !== "joker" && card.kind !== "tension") {
      recordComplete(card.passivoIs, card.level);
    }
    setBurst(pts);
    setTimeout(() => setBurst(null), 1200);

    const { leveledUp, newLevel } = awardPoints(pts);
    if (leveledUp) {
      setCardAnim("card-exit-up");
      await new Promise((r) => setTimeout(r, 250));
      setCard(null);
      setLevelUpTo(newLevel);
    } else {
      void trocarCarta("concluido");
    }
  };

  const dismissLevelUp = () => {
    setLevelUpTo(null);
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

        {card?.kind === "joker" && (
          <JokerCard
            key={cardId}
            animation={cardAnim}
            ativoNome={card.ativo.nome}
            onSkip={handleSkip}
            onComplete={handleComplete}
          />
        )}
        {card?.kind === "twist" && (
          <TwistCard
            key={cardId}
            animation={cardAnim}
            text={card.text}
            ativoNome={card.ativo.nome}
            passivoNome={card.passivo.nome}
          />
        )}
        {card?.kind === "tension" && (
          <TensionCard
            key={cardId}
            animation={cardAnim}
            text={card.text}
            ativoNome={card.ativo.nome}
            passivoNome={card.passivo.nome}
          />
        )}
        {card?.kind === "normal" && (
          <ChallengeCard
            key={cardId}
            animation={cardAnim}
            text={card.text}
            categories={card.categories}
            durationSeconds={card.durationSeconds}
            level={card.level}
            ativoNome={card.ativo.nome}
            passivoNome={card.passivo.nome}
            propHint={card.propHint}
          />
        )}

        {card && !loadingNext && card.kind !== "joker" && (
          <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
            <button
              onClick={handleSkip}
              className="rounded-md border border-border bg-card py-4 font-display text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
            >
              Pular
            </button>
            <button
              onClick={handleComplete}
              className="rounded-md bg-foreground py-4 font-display text-xs uppercase tracking-[0.25em] text-background"
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
