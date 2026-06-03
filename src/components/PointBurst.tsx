import { AnimatePresence, motion } from "framer-motion";

export function PointBurst({ value }: { value: number | null }) {
  return (
    <AnimatePresence>
      {value !== null && (
        <motion.span
          key={value + "-" + Math.random()}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: -18 }}
          exit={{ opacity: 0, y: -28 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute -top-3 right-0 font-display text-xs"
          style={{ color: "#00FF9D", textShadow: "0 0 8px #00FF9D" }}
        >
          +{value}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
