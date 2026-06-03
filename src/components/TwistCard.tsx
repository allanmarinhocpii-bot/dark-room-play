import { motion } from "framer-motion";

export function TwistCard({
  text,
  ativoNome,
  passivoNome,
  cardKey,
}: {
  text: string;
  ativoNome: string;
  passivoNome: string;
  cardKey: string;
}) {
  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.4 }}
      className="twist-pulse relative w-full max-w-md rounded-2xl border-2 bg-card p-8"
      style={{ borderColor: "#F97316" }}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-[10px] uppercase tracking-[0.3em]" style={{ color: "#F97316" }}>
          ↔ Virada
        </span>
        <span className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          +20 pts
        </span>
      </div>
      <p
        className="mt-4 font-display text-[10px] uppercase tracking-[0.3em]"
        style={{ color: "#F97316" }}
      >
        Agora {ativoNome} comanda · {passivoNome} recebe
      </p>
      <p className="mt-6 text-[18px] leading-relaxed text-foreground">{text}</p>
    </motion.div>
  );
}
