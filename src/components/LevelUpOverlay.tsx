import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LEVELS, type IntensityRank } from "@/data/challenges";

export function LevelUpOverlay({
  level,
  onContinue,
}: {
  level: IntensityRank;
  onContinue: () => void;
}) {
  const meta = LEVELS[level - 1];
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black px-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <p className="font-display text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
          Ascensão
        </p>
        <motion.h2
          className="mt-6 font-display uppercase tracking-[0.15em]"
          style={{
            fontSize: "clamp(54px, 12vw, 80px)",
            color: meta.accent,
            textShadow: `0 0 40px ${meta.accent}`,
          }}
          animate={{
            textShadow: [
              `0 0 24px ${meta.accent}`,
              `0 0 56px ${meta.accent}`,
              `0 0 24px ${meta.accent}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {meta.name}
        </motion.h2>
        <p className="mt-6 max-w-xs mx-auto text-sm text-muted-foreground">{meta.subtitle}</p>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onContinue}
            className="mt-12 rounded-md border px-7 py-3 font-display text-[10px] uppercase tracking-[0.35em]"
            style={{ borderColor: meta.accent, color: meta.accent }}
          >
            Continuar
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
