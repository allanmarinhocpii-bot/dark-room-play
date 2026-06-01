import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CategoryKey, PropId } from "@/data/challenges";

export type GameMode = "standard" | "combined";

interface SessionState {
  safeWord: string;
  categories: Record<CategoryKey, boolean>;
  props: Record<PropId, boolean>;
  mode: GameMode;
  rounds: number;
  ageConsent: boolean;
  setSafeWord: (w: string) => void;
  toggleCategory: (k: CategoryKey) => void;
  toggleProp: (k: PropId) => void;
  setMode: (m: GameMode) => void;
  incrementRound: () => void;
  resetGame: () => void;
  setAgeConsent: (v: boolean) => void;
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
    (set) => ({
      safeWord: "",
      categories: defaultCategories,
      props: defaultProps,
      mode: "standard",
      rounds: 0,
      ageConsent: false,
      setSafeWord: (w) => set({ safeWord: w }),
      toggleCategory: (k) =>
        set((s) => ({ categories: { ...s.categories, [k]: !s.categories[k] } })),
      toggleProp: (k) => set((s) => ({ props: { ...s.props, [k]: !s.props[k] } })),
      setMode: (m) => set({ mode: m }),
      incrementRound: () => set((s) => ({ rounds: s.rounds + 1 })),
      resetGame: () => set({ rounds: 0 }),
      setAgeConsent: (v) => set({ ageConsent: v }),
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
        ageConsent: s.ageConsent,
      }),
    },
  ),
);
