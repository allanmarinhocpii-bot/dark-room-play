import type { CardAnimation } from "./ChallengeCard";

export function JokerCard({ ativoNome, animation }: { ativoNome: string; animation?: CardAnimation }) {
  return (
    <div
      className={`relative w-full max-w-md rounded-2xl bg-white p-12 text-center text-black shadow-2xl ${animation ?? "card-flip-in"}`}
    >
      <p className="font-display text-[10px] uppercase tracking-[0.4em] text-black/50">Coringa</p>
      <p className="mt-8 font-display text-[32px] uppercase tracking-wider text-black">
        {ativoNome} decide.
      </p>
      <p className="mt-6 text-[14px] italic text-black/60">
        Sem carta. Sem regra. O que você quiser.
      </p>
    </div>
  );
}
