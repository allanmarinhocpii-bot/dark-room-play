import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CategoryKey, PropId, IntensityRank } from "@/data/challenges";
import { levelForScore } from "@/data/challenges";

export type GameMode = "standard" | "combined";

interface SessionState {
  hasHydrated: boolean;
  safeWord: string;
  categories: Record<CategoryKey, boolean>;
  props: Record<PropId, boolean>;
  mode: GameMode;
  rounds: number;
  score: number;
  level: IntensityRank;
  setSafeWord: (w: string) => void;
  toggleCategory: (k: CategoryKey) => void;
  toggleProp: (k: PropId) => void;
  setMode: (m: GameMode) => void;
  awardPoints: (pts: number) => { leveledUp: boolean; newLevel: IntensityRank };
  incrementRound: () => void;
  resetGame: () => void;
  setHasHydrated: (v: boolean) => void;
}

const defaultCategories: Record<CategoryKey, boolean> = {
  bondage: true,
  disciplina_controle: true,
  sensory_deprivation: true,
  impact_sensacoes: true,
  fetiches_corporais: false,
  posicoes: true,
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
      safeWord: "",
      categories: defaultCategories,
      props: defaultProps,
      mode: "standard",
      rounds: 0,
      score: 0,
      level: 1,
      setSafeWord: (w) => set({ safeWord: w }),
      toggleCategory: (k) =>
        set((s) => ({ categories: { ...s.categories, [k]: !s.categories[k] } })),
      toggleProp: (k) => set((s) => ({ props: { ...s.props, [k]: !s.props[k] } })),
      setMode: (m) => set({ mode: m }),
      awardPoints: (pts) => {
        const prevLevel = get().level;
        const newScore = get().score + pts;
        const newLevel = levelForScore(newScore);
        set({ score: newScore, level: newLevel });
        return { leveledUp: newLevel > prevLevel, newLevel };
      },
      incrementRound: () => set((s) => ({ rounds: s.rounds + 1 })),
      resetGame: () => set({ rounds: 0, score: 0, level: 1 }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "darkroom-session",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : (undefined as never),
      ),
      partialize: (s) => ({
        safeWord: s.safeWord,
        categories: s.categories,
        props: s.props,
        mode: s.mode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
