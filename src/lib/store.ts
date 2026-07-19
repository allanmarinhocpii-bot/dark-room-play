import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CategoryKey, PropId, IntensityRank } from "@/data/challenges";
import { levelForScore } from "@/data/challenges";

export type GameMode = "standard" | "combined";
export type Genero = "M" | "F";
export type ControleMode = "aleatorio" | "j1" | "j2";
export type ScoringMode = "juntos" | "competitivo";

export interface Jogador {
  nome: string;
  genero: Genero;
  recompensa?: string; // modo competitivo
}

export interface SessionStats {
  startedAt: number | null;
  endedAt: number | null;
  roundsCompleted: number;
  skips: number;
  cardsDrawn: number;
  twists: number;
  categoryCounts: Partial<Record<CategoryKey, number>>;
  maxLevelPlayed: IntensityRank;
  passiveLoad: { j1: number; j2: number }; // soma de níveis recebidos como passivo
  endReason: "normal" | "safeword" | null;
}

const emptyStats: SessionStats = {
  startedAt: null,
  endedAt: null,
  roundsCompleted: 0,
  skips: 0,
  cardsDrawn: 0,
  twists: 0,
  categoryCounts: {},
  maxLevelPlayed: 1,
  passiveLoad: { j1: 0, j2: 0 },
  endReason: null,
};

interface SessionState {
  hasHydrated: boolean;
  // setup
  jogador1: Jogador;
  jogador2: Jogador;
  controle: ControleMode;
  safeWord: string;
  categories: Record<CategoryKey, boolean>;
  props: Record<PropId, boolean>;
  mode: GameMode;
  scoringMode: ScoringMode;
  ritual: boolean;
  // gameplay
  score: number;
  level: IntensityRank;
  rounds: number;
  stats: SessionStats;
  // setters
  setJogador1: (p: Partial<Jogador>) => void;
  setJogador2: (p: Partial<Jogador>) => void;
  setControle: (c: ControleMode) => void;
  setSafeWord: (w: string) => void;
  toggleCategory: (k: CategoryKey) => void;
  toggleProp: (k: PropId) => void;
  setMode: (m: GameMode) => void;
  setScoringMode: (m: ScoringMode) => void;
  setRitual: (v: boolean) => void;
  // engine
  awardPoints: (pts: number) => { leveledUp: boolean; newLevel: IntensityRank };
  recordDraw: (cat: CategoryKey | null, lvl: IntensityRank | null) => void;
  recordComplete: (passiveIs: "j1" | "j2", lvl: IntensityRank) => void;
  recordSkip: () => void;
  endSession: (reason: "normal" | "safeword") => void;
  resetGame: () => void;
  setHasHydrated: (v: boolean) => void;
}

const defaultCategories: Record<CategoryKey, boolean> = {
  posicoes: true,
  sensory_deprivation: true,
  disciplina_controle: true,
  bondage: false,
  fetiches_corporais: false,
  impact_sensacoes: false,
  jornada_longa: false,
};

const defaultProps: Record<PropId, boolean> = {
  venda: false,
  gelo: false,
  corda: false,
  vela: false,
  paddle: false,
  pluma: false,
  mordaca: false,
  gravata: false,
  almofada: false,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      jogador1: { nome: "", genero: "M" },
      jogador2: { nome: "", genero: "F" },
      controle: "aleatorio",
      safeWord: "",
      categories: defaultCategories,
      props: defaultProps,
      mode: "standard",
      scoringMode: "juntos",
      ritual: true,
      score: 0,
      level: 1,
      rounds: 0,
      stats: emptyStats,

      setJogador1: (p) => set((s) => ({ jogador1: { ...s.jogador1, ...p } })),
      setJogador2: (p) => set((s) => ({ jogador2: { ...s.jogador2, ...p } })),
      setControle: (c) => set({ controle: c }),
      setSafeWord: (w) => set({ safeWord: w }),
      toggleCategory: (k) =>
        set((s) => ({ categories: { ...s.categories, [k]: !s.categories[k] } })),
      toggleProp: (k) => set((s) => ({ props: { ...s.props, [k]: !s.props[k] } })),
      setMode: (m) => set({ mode: m }),
      setScoringMode: (m) => set({ scoringMode: m }),
      setRitual: (v) => set({ ritual: v }),

      awardPoints: (pts) => {
        const prev = get().level;
        const newScore = get().score + pts;
        const newLevel = levelForScore(newScore);
        set({ score: newScore, level: newLevel });
        return { leveledUp: newLevel > prev, newLevel };
      },

      recordDraw: (cat, lvl) =>
        set((s) => {
          const counts = { ...s.stats.categoryCounts };
          if (cat) counts[cat] = (counts[cat] ?? 0) + 1;
          return {
            stats: {
              ...s.stats,
              cardsDrawn: s.stats.cardsDrawn + 1,
              categoryCounts: counts,
              maxLevelPlayed: (lvl && lvl > s.stats.maxLevelPlayed
                ? lvl
                : s.stats.maxLevelPlayed) as IntensityRank,
            },
          };
        }),

      recordComplete: (passiveIs, lvl) =>
        set((s) => ({
          rounds: s.rounds + 1,
          stats: {
            ...s.stats,
            roundsCompleted: s.stats.roundsCompleted + 1,
            passiveLoad: {
              ...s.stats.passiveLoad,
              [passiveIs]: s.stats.passiveLoad[passiveIs] + lvl,
            },
          },
        })),

      recordSkip: () =>
        set((s) => ({ stats: { ...s.stats, skips: s.stats.skips + 1 } })),

      endSession: (reason) =>
        set((s) => ({
          stats: { ...s.stats, endedAt: Date.now(), endReason: reason },
        })),

      resetGame: () =>
        set({
          score: 0,
          level: 1,
          rounds: 0,
          stats: { ...emptyStats, startedAt: Date.now() },
        }),

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "darkroom-session",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : (undefined as never),
      ),
      partialize: (s) => ({
        jogador1: s.jogador1,
        jogador2: s.jogador2,
        controle: s.controle,
        safeWord: s.safeWord,
        categories: s.categories,
        props: s.props,
        mode: s.mode,
        scoringMode: s.scoringMode,
        ritual: s.ritual,
        score: s.score,
        level: s.level,
        rounds: s.rounds,
        stats: s.stats,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
