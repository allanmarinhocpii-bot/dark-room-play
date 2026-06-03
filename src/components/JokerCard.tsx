import { motion } from "framer-motion";

export function JokerCard({ ativoNome, cardKey }: { ativoNome: string; cardKey: string }) {
  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-md rounded-2xl bg-white p-12 text-center text-black shadow-2xl"
    >
      <p className="font-display text-[10px] uppercase tracking-[0.4em] text-black/50">Coringa</p>
      <p className="mt-8 font-display text-[32px] uppercase tracking-wider text-black">
        {ativoNome} decide.
      </p>
      <p className="mt-6 text-[14px] italic text-black/60">
        Sem carta. Sem regra. O que você quiser.
      </p>
    </motion.div>
  );
}
