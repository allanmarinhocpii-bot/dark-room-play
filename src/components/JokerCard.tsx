import type { CardAnimation } from "./ChallengeCard";

export function JokerCard({
  ativoNome,
  onSkip,
  onComplete,
  animation: _animation,
}: {
  ativoNome: string;
  onSkip: () => void;
  onComplete: () => void;
  animation?: CardAnimation;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white px-6"
      style={{ animation: "fadeIn 0.5s ease-out" }}
    >
      <p className="mb-8 font-display text-sm uppercase tracking-[0.4em] text-gray-400">
        Carta Especial
      </p>
      <h2 className="text-center font-display text-4xl uppercase tracking-wider text-black">
        {ativoNome} decide.
      </h2>
      <p className="mt-4 px-6 text-center text-sm italic text-gray-500">
        Sem carta. Sem regra. O que você quiser.
      </p>
      <div className="absolute bottom-12 left-6 right-6 flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 rounded-md border border-black py-4 font-display text-xs uppercase tracking-[0.2em] text-black"
        >
          Pular
        </button>
        <button
          onClick={onComplete}
          className="flex-1 rounded-md bg-black py-4 font-display text-xs uppercase tracking-[0.2em] text-white"
        >
          Concluído
        </button>
      </div>
    </div>
  );
}
