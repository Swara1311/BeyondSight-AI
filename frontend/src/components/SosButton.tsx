import { useState, useRef, useCallback } from "react";

interface SosButtonProps {
  onTrigger: () => void;
  isTriggering: boolean;
}

const HOLD_DURATION_MS = 2000;

export default function SosButton({ onTrigger, isTriggering }: SosButtonProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearHold = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (isTriggering) return;

    startTimeRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        clearHold();
        onTrigger();
      }
    }, 50);
  }, [isTriggering, onTrigger, clearHold]);

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={clearHold}
      onMouseLeave={clearHold}
      onTouchStart={startHold}
      onTouchEnd={clearHold}
      disabled={isTriggering}
      aria-label="Press and hold for 2 seconds to activate emergency SOS"
      className="relative w-full max-w-xs mx-auto flex items-center justify-center min-h-[64px] rounded-2xl bg-[var(--color-sos)] text-white font-bold text-lg overflow-hidden focus-visible:outline focus-visible:outline-4 focus-visible:outline-white disabled:opacity-60"
    >
      <div
        className="absolute inset-0 bg-[var(--color-sos-dark)] transition-none"
        style={{ width: `${holdProgress * 100}%` }}
        aria-hidden="true"
      />
      <span className="relative z-10">
        {isTriggering ? "Activating SOS..." : "🚨 Hold for Emergency SOS"}
      </span>
    </button>
  );
}