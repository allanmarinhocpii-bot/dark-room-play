import { useEffect, useRef, useState } from "react";

export function ArcTimer({
  seconds,
  resetKey,
  color,
}: {
  seconds: number;
  resetKey: string;
  color: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [pulse, setPulse] = useState(false);
  const startedRef = useRef<number | null>(null);

  useEffect(() => {
    setElapsed(0);
    setRunning(false);
    setPulse(false);
    startedRef.current = null;
  }, [resetKey, seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.1;
        if (next >= seconds) {
          setRunning(false);
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
          return seconds;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running, seconds]);

  const progress = Math.min(1, elapsed / seconds);
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - progress);
  const done = elapsed >= seconds;

  return (
    <button
      onClick={() => {
        if (done) {
          setElapsed(0);
          setRunning(true);
        } else {
          setRunning((r) => !r);
        }
      }}
      aria-label={running ? "Pausar timer" : "Iniciar timer"}
      className="relative flex h-20 w-20 items-center justify-center transition-transform active:scale-95"
      style={{ filter: pulse ? `drop-shadow(0 0 16px ${color})` : undefined }}
    >
      <svg width={70} height={70} className="-rotate-90">
        <circle cx={35} cy={35} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={2} fill="none" />
        <circle
          cx={35}
          cy={35}
          r={radius}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-display text-[9px] uppercase tracking-[0.2em]"
        style={{ color: running ? color : "var(--color-muted-foreground)" }}
      >
        {done ? "↻" : running ? "■" : "▶"}
      </span>
    </button>
  );
}
