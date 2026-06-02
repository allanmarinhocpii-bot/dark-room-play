import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSessionStore } from "@/lib/store";
import { drawChallenge, type Challenge } from "@/lib/engine";
import { LEVELS, type CategoryKey, type PropId, type IntensityRank } from "@/data/challenges";
import { ChallengeCard } from "@/components/ChallengeCard";
import { SafeWordButton } from "@/components/SafeWordButton";

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
    safeWord,
    categories,
    props,
    mode,
    rounds,
    score,
    level,
    incrementRound,
    awardPoints,
  } = useSessionStore();

  const activeCats = useMemo(
    () => (Object.keys(categories) as CategoryKey[]).filter((k) => categories[k]),
    [categories],
  );
  const activeProps = useMemo(
    () => (Object.keys(props) as PropId[]).filter((k) => props[k]),
    [props],
  );

  const [card, setCard] = useState<Challenge | null>(null);
  const [cardId, setCardId] = useState(0);
  const [levelUpTo, setLevelUpTo] = useState<IntensityRank | null>(null);

  // Wait for persisted state to hydrate before deciding to redirect
  useEffect(() => {
    if (!hasHydrated) return;
    if (!safeWord || activeCats.length === 0) {
      navigate({ to: "/" });
      return;
    }
    if (!card) {
      const c = drawChallenge(activeCats, mode, activeProps, level);
      if (c) setCard(c);
    }
  }, [hasHydrated, safeWord, activeCats, mode, activeProps, level, card, navigate]);

  const nextCard = (lvl: IntensityRank) => {
    const c = drawChallenge(activeCats, mode, activeProps, lvl);
    if (c) {
      setCard(c);
      setCardId((i) => i + 1);
    }
  };

  const handleSkip = () => nextCard(level);

  const handleComplete = () => {
    incrementRound();
    const base = card?.durationSeconds ? 15 : 10;
    const bonus = card && card.categories.length > 1 ? 5 : 0;
    const { leveledUp, newLevel } = awardPoints(base + bonus);
    if (leveledUp) {
      setLevelUpTo(newLevel);
      // Hold the cinematic overlay; new card draws on dismiss.
    } else {
      nextCard(level);
    }
  };

  const dismissLevelUp = () => {
    const target = levelUpTo ?? level;
    setLevelUpTo(null);
    nextCard(target);
  };

  const currentLevelMeta = LEVELS[level - 1];
  const nextLevelMeta = LEVELS[level] ?? null;
  const progress = nextLevelMeta
    ? Math.min(
        100,
        ((score - currentLevelMeta.threshold) /
          (nextLevelMeta.threshold - currentLevelMeta.threshold)) *
          100,
      )
    : 100;

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Carregando…
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background px-5 pb-40 pt-8">
      <header className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/" })}
            className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            ← Setup
          </button>
          <div className="text-right">
            <p className="font-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              Rodada
            </p>
            <p className="font-display text-base tabular-nums tracking-widest text-foreground">
              {String(rounds + 1).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* Ascensão / Level Progress */}
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                Nível {level} · Ascensão
              </p>
              <p
                className="font-display text-lg uppercase tracking-[0.2em]"
                style={{ color: currentLevelMeta.accent }}
              >
                {currentLevelMeta.name}
              </p>
            </div>
            {nextLevelMeta && (
              <p className="font-display text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                Próximo: {nextLevelMeta.name}
              </p>
            )}
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-border/40">
            <motion.div
              className="h-full"
              style={{
                background: `linear-gradient(90deg, ${currentLevelMeta.accent}, ${
                  nextLevelMeta?.accent ?? currentLevelMeta.accent
                })`,
                boxShadow: `0 0 14px ${currentLevelMeta.accent}`,
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 flex max-w-md flex-col items-center">
        <AnimatePresence mode="wait">
          {card && (
            <ChallengeCard
              key={cardId}
              cardKey={String(cardId)}
              text={card.text}
              categories={card.categories}
              durationSeconds={card.durationSeconds}
            />
          )}
        </AnimatePresence>

        <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
          <button
            onClick={handleSkip}
            className="rounded-md border border-border bg-card py-4 font-display text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Pular / Trocar
          </button>
          <button
            onClick={handleComplete}
            className="rounded-md bg-foreground py-4 font-display text-xs uppercase tracking-[0.25em] text-background"
          >
            Concluído
          </button>
        </div>

        <p className="mt-6 text-center font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Safe Word: <span className="text-[color:var(--safe-word)]">{safeWord || "—"}</span>
        </p>
      </main>

      <SafeWordButton />

      {/* Cinematic level-up overlay */}
      <AnimatePresence>
        {levelUpTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/95 backdrop-blur-sm px-6"
            onClick={dismissLevelUp}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <p className="font-display text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
                Ascensão
              </p>
              <p
                className="mt-4 font-display text-5xl uppercase tracking-[0.2em]"
                style={{
                  color: LEVELS[levelUpTo - 1].accent,
                  textShadow: `0 0 32px ${LEVELS[levelUpTo - 1].accent}`,
                }}
              >
                {LEVELS[levelUpTo - 1].name}
              </p>
              <p className="mt-4 font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                Nível {levelUpTo} desbloqueado
              </p>
              <button
                className="mt-10 rounded-md border border-foreground/40 px-6 py-3 font-display text-[10px] uppercase tracking-[0.3em] text-foreground"
                onClick={dismissLevelUp}
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
