"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatCountdown } from "@/lib/time";

/** Display-only countdown. The backend remains authoritative for redemption state. */
export function useCountdown(initialRemainingSeconds: number, onElapsed: () => void) {
  const [remaining, setRemaining] = useState(() => Math.max(0, initialRemainingSeconds * 1000));
  const startedAtRef = useRef<number>(0);
  const initialMsRef = useRef<number>(0);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    startedAtRef.current = performance.now();
    initialMsRef.current = Math.max(0, initialRemainingSeconds * 1000);
    setRemaining(initialMsRef.current);

    const update = () => {
      const elapsed = performance.now() - startedAtRef.current;
      const next = Math.max(0, initialMsRef.current - elapsed);
      setRemaining(next);
      if (next <= 0 && !firedRef.current) {
        firedRef.current = true;
        onElapsed();
      }
    };
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [initialRemainingSeconds, onElapsed]);

  return useMemo(() => ({ remaining, label: formatCountdown(remaining) }), [remaining]);
}
