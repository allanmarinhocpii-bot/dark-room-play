import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/lib/store";
import { drawChallenge, type Challenge } from "@/lib/engine";
import type { CategoryKey, PropId } from "@/data/challenges";
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
  const { safeWord, categories, props, mode, rounds, incrementRound } = useSessionStore();

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

  useEffect(() => {
    if (!safeWord || activeCats.length === 0) {
      navigate({ to: "/" });
      return;
    }
    if (!card) {
      const c = drawChallenge(activeCats, mode, activeProps);
      if (c) setCard(c);
    }
  }, [safeWord, activeCats, mode, activeProps, card, navigate]);

  const reroll = (advance: boolean) => {
    if (advance) incrementRound();
    const c = drawChallenge(activeCats, mode, activeProps);
    if (c) {
      setCard(c);
      setCardId((i) => i + 1);
    }
  };

  return (
    <div className="relative min-h-screen bg-background px-5 pb-40 pt-8">
      <header className="mx-auto flex max-w-md items-center justify-between">
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
          <p className="font-display text-xl tabular-nums tracking-widest text-foreground">
            {String(rounds + 1).padStart(2, "0")}
          </p>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-md flex-col items-center">
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
            onClick={() => reroll(false)}
            className="rounded-md border border-border bg-card py-4 font-display text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Pular / Trocar
          </button>
          <button
            onClick={() => reroll(true)}
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
    </div>
  );
}
