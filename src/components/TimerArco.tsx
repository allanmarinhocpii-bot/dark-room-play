import { useEffect, useRef, useState } from "react";

interface TimerArcoProps {
  segundos: number;
  cor: string;
  resetKey?: string;
  onComplete?: () => void;
}

export function TimerArco({ segundos, cor, resetKey, onComplete }: TimerArcoProps) {
  const [restante, setRestante] = useState(segundos);
  const [rodando, setRodando] = useState(false);
  const [completo, setCompleto] = useState(false);
  const completedRef = useRef(false);

  const raio = 28;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia * (1 - restante / segundos);

  useEffect(() => {
    setRestante(segundos);
    setRodando(false);
    setCompleto(false);
    completedRef.current = false;
  }, [resetKey, segundos]);

  useEffect(() => {
    if (!rodando) return;
    const interval = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRodando(false);
          setCompleto(true);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rodando, onComplete]);

  const handleClick = () => {
    if (completo) {
      setRestante(segundos);
      setCompleto(false);
      completedRef.current = false;
      setRodando(true);
      return;
    }
    setRodando((r) => !r);
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        aria-label={rodando ? "Pausar" : completo ? "Reiniciar" : "Iniciar"}
        className="relative transition-transform active:scale-95"
      >
        <svg width="72" height="72" className={completo ? "animate-pulse" : ""}>
          <circle cx="36" cy="36" r={raio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="36"
            cy="36"
            r={raio}
            fill="none"
            stroke={cor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
            style={{
              transition: "stroke-dashoffset 0.9s linear",
              filter: `drop-shadow(0 0 4px ${cor})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {completo ? (
            <span className="font-display text-base" style={{ color: cor }}>
              ✓
            </span>
          ) : rodando ? (
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: cor }} />
          ) : (
            <div
              className="ml-0.5 h-0 w-0"
              style={{
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: `10px solid ${cor}`,
              }}
            />
          )}
        </div>
      </button>
      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {completo ? "Concluído" : rodando ? `${restante}s` : "Toque para iniciar"}
      </p>
    </div>
  );
}
