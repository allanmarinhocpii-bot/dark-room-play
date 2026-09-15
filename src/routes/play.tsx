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
import { TensionCard } from "@/components/TensionCard";
import { FinalCard } from "@/components/FinalCard";
import { SafeWordButton } from "@/components/SafeWordButton";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { ProgressionBar } from "@/components/ProgressionBar";
import { PointBurst } from "@/components/PointBurst";
import { RitualOverlay } from "@/components/RitualOverlay";
import { generateCard, sanitizeCardText, hasReadableText } from "@/services/cardGenerator";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Dark Room — Arena" },
      { name: "description", content: "Arena de desafios e progressão da sessão Dark Room." },
      { property: "og:title", content: "Dark Room — Arena" },
      { property: "og:description", content: "Arena de desafios e progressão da sessão Dark Room." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
    scoringMode,
    ritual,
    level,
    score,
    stats,
    pontos,
    awardPoints,
    awardToPlayer,
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
  const [showFinal, setShowFinal] = useState(false);
  const [finalRecusada, setFinalRecusada] = useState(false);

  const lastTextsRef = useRef<string[]>([]);
  const nextCardBufferRef = useRef<DrawResult | null>(null);
  const prefetchingRef = useRef(false);
  const currentTokenRef = useRef(0);
  const enhancedRef = useRef(new WeakSet<object>());
  const lastKindRef = useRef<DrawResult["kind"] | undefined>(undefined);
  const lastAtivoRef = useRef<"j1" | "j2" | undefined>(undefined);

  // Sorteia localmente — instantâneo, sem esperar IA
  const drawNextSync = (): DrawResult | null => {
    for (let tentativa = 0; tentativa < 6; tentativa++) {
      const state = useSessionStore.getState();
      const c = draw({
        jogador1,
        jogador2,
        controle,
        activeCategories: activeCats,
        mode,
        activeProps,
        level: state.level,
        roundsCompleted: state.stats.roundsCompleted,
        cardsDrawn: state.stats.cardsDrawn,
        recentTexts: state.stats.drawnHistory,
        lastKind: lastKindRef.current,
        lastAtivoIs: lastAtivoRef.current,
      });
      if (!c) return null;
      c.text = sanitizeCardText(c.text ?? "");
      // Descarta cartas sem texto legível e tenta de novo
      if (!hasReadableText(c.text)) {
        recordDraw(null, null, c.baseText);
        continue;
      }
      recordDraw(c.categories[0] ?? null, c.kind === "normal" ? c.level : null, c.baseText);
      lastKindRef.current = c.kind;
      lastAtivoRef.current = c.ativoIs;
      return c;
    }
    return null;
  };

  // Reescreve com IA em segundo plano e aplica se a carta ainda estiver na tela
  const enhance = async (c: DrawResult, token: number) => {
    if (c.kind !== "normal") return;
    if (enhancedRef.current.has(c)) return;
    enhancedRef.current.add(c);
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
    const novo = sanitizeCardText(result.texto ?? "");
    if (!hasReadableText(novo) || novo === c.text) return;
    result.texto = novo;
    lastTextsRef.current = [...lastTextsRef.current, result.texto].slice(-5);
    c.text = result.texto;
    if (result.segundos && result.segundos > 0) c.durationSeconds = result.segundos;
    if (result.prop_usado) c.propHint = undefined;
    // só atualiza a UI se essa carta ainda for a atual
    if (currentTokenRef.current === token) {
      setCard({ ...c });
    }
  };

  const bufferedLevelRef = useRef<IntensityRank | null>(null);

  const prefetchNext = () => {
    if (prefetchingRef.current || nextCardBufferRef.current) return;
    prefetchingRef.current = true;
    const next = drawNextSync();
    nextCardBufferRef.current = next;
    bufferedLevelRef.current = useSessionStore.getState().level;
    if (next) {
      void enhance(next, -1).finally(() => {
        prefetchingRef.current = false;
      });
    } else {
      prefetchingRef.current = false;
    }
  };

  const advanceTo = (c: DrawResult | null, anim: CardAnimation = "card-flip-in") => {
    const token = currentTokenRef.current + 1;
    currentTokenRef.current = token;
    setCard(c);
    setCardId((i) => i + 1);
    setCardAnim(anim);
    setLoadingNext(false);
    if (c) {
      // se veio direto do sorteio (sem IA ainda), melhora em background
      void enhance(c, token);
      prefetchNext();
    }
  };

  const loadNext = (anim: CardAnimation = "card-flip-in") => {
    // Descarta a carta pré-carregada se o nível mudou desde o prefetch
    if (
      nextCardBufferRef.current &&
      bufferedLevelRef.current !== useSessionStore.getState().level
    ) {
      nextCardBufferRef.current = null;
      bufferedLevelRef.current = null;
    }
    if (nextCardBufferRef.current) {
      const buffered = nextCardBufferRef.current;
      nextCardBufferRef.current = null;
      advanceTo(buffered, anim);
      return;
    }
    advanceTo(drawNextSync(), anim);
  };

  const trocarCarta = async (motivo: "concluido" | "pulou") => {
    setCardAnim(motivo === "concluido" ? "card-exit-up" : "card-exit-left");
    await new Promise((r) => setTimeout(r, 250));
    loadNext("card-flip-in");
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
    if (card.kind === "tension") pts = 8;
    else if (card.kind === "joker") pts = 10;
    else {
      if (card.durationSeconds) pts = 15;
      if (card.categories.length > 1) pts += 5;
      if (card.twisted) pts += 10;
    }
    if (card.twisted) recordTwist();
    awardToPlayer(card.kind === "joker" ? card.ativoIs : card.passivoIs, pts);
    // toda carta concluída conta rodada — inclusive pausa e coringa
    recordComplete(card.passivoIs, card.level);
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

  // Depois de algumas rodadas no Ápice, oferece a carta final
  useEffect(() => {
    if (finalRecusada || showFinal || levelUpTo || showRitual) return;
    if (level !== 5 || stats.apexStartRound === null) return;
    if (stats.roundsCompleted - stats.apexStartRound >= 6) setShowFinal(true);
  }, [level, stats.roundsCompleted, stats.apexStartRound, finalRecusada, showFinal, levelUpTo, showRitual]);

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
        <div className="mt-4 flex items-center justify-between font-display text-[10px] uppercase tracking-[0.2em]">
          {scoringMode === "competitivo" ? (
            <>
              <span className="text-muted-foreground">
                {jogador1.nome}{" "}
                <span className="text-foreground">{String(pontos.j1).padStart(2, "0")}</span>
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">
                {jogador2.nome}{" "}
                <span className="text-foreground">{String(pontos.j2).padStart(2, "0")}</span>
              </span>
            </>
          ) : (
            <span className="mx-auto text-muted-foreground">
              Dupla <span className="text-foreground">{String(score).padStart(3, "0")}</span>
            </span>
          )}
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

        {showFinal && (
          <FinalCard
            animation={cardAnim}
            onEncerrar={finishSession}
            onContinuar={() => {
              setShowFinal(false);
              setFinalRecusada(true);
            }}
          />
        )}

        {!showFinal && card?.kind === "joker" && (
          <JokerCard
            key={cardId}
            animation={cardAnim}
            ativoNome={card.ativo.nome}
            onSkip={handleSkip}
            onComplete={handleComplete}
          />
        )}
        {!showFinal && card?.kind === "tension" && (
          <TensionCard
            key={cardId}
            animation={cardAnim}
            text={card.text}
            ativoNome={card.ativo.nome}
            passivoNome={card.passivo.nome}
          />
        )}
        {!showFinal && card?.kind === "normal" && (
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
            twisted={card.twisted}
          />
        )}

        {!card && !loadingNext && !showFinal && initialized && !showRitual && !levelUpTo && (
          <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Sem cartas disponíveis
            </p>
            <p className="text-sm text-muted-foreground">
              Nenhuma categoria ativa tem desafio para este nível. Encerre a sessão ou volte pro
              setup e ative mais categorias.
            </p>
            <button
              onClick={() => void loadNext()}
              className="mt-2 rounded-md border border-border px-4 py-2 font-display text-[10px] uppercase tracking-[0.25em]"
            >
              Tentar de novo
            </button>
          </div>
        )}


        {card && !loadingNext && !showFinal && card.kind !== "joker" && (
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

        {card && !loadingNext && !showFinal && (
          <button
            onClick={() => void trocarCarta("pulou")}
            className="mt-4 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 hover:text-foreground"
          >
            Outra carta
          </button>
        )}
      </main>

      <SafeWordButton />

      <AnimatePresence>
        {levelUpTo && <LevelUpOverlay level={levelUpTo} onContinue={dismissLevelUp} />}
      </AnimatePresence>
    </div>
  );
}
