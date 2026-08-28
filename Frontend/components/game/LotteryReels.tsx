"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ComponentType, SVGProps } from "react";
import type { LotterySymbol } from "@/types/models";
import { CroissantSymbol, CupSymbol, GiftSymbol, WheatSymbol } from "@/components/icons";

interface Props {
  symbols: LotterySymbol[];
  resultSymbolId: string;
  onComplete: () => void;
}

type SymbolIcon = ComponentType<SVGProps<SVGSVGElement>>;
const iconMap: Record<LotterySymbol["kind"], SymbolIcon> = {
  gift: GiftSymbol,
  croissant: CroissantSymbol,
  wheat: WheatSymbol,
  cup: CupSymbol,
};

const reelOrders = [
  ["croissant", "wheat", "cup", "gift", "wheat", "croissant", "cup", "gift", "wheat", "cup", "croissant"],
  ["cup", "gift", "croissant", "wheat", "cup", "wheat", "gift", "croissant", "cup", "wheat", "gift"],
  ["wheat", "cup", "gift", "croissant", "gift", "cup", "wheat", "croissant", "cup", "gift", "wheat"],
] as const;

// The user should feel a proper draw, not a quick flash. The backend result is
// known before this component mounts, but the visual reveal should feel slower and more authentic.
const START_DELAY_MS = 60;
const REDUCED_MOTION_MS = 5_000;
const reelTimings = [
  { durationMs: 3_600, delayMs: 0 },
  { durationMs: 4_300, delayMs: 240 },
  { durationMs: 5_000, delayMs: 420 },
] as const;
const SPIN_MS = Math.max(...reelTimings.map((timing) => timing.durationMs + timing.delayMs)) + 120;

export function LotteryReels({ symbols, resultSymbolId, onComplete }: Props) {
  const [spinning, setSpinning] = useState(false);
  const symbolById = useMemo(() => new Map(symbols.map((symbol) => [symbol.id, symbol])), [symbols]);
  const sequences = useMemo(() => reelOrders.map((order) => {
    const base = order.map((id) => symbolById.get(id)).filter((symbol): symbol is LotterySymbol => Boolean(symbol));
    const result = symbolById.get(resultSymbolId) ?? symbols[0];
    return [...base, result];
  }), [resultSymbolId, symbolById, symbols]);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const startTimer = window.setTimeout(() => setSpinning(true), START_DELAY_MS);
    const completeTimer = window.setTimeout(onComplete, START_DELAY_MS + (reducedMotion ? REDUCED_MOTION_MS : SPIN_MS));
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`lottery-reels ${spinning ? "lottery-reels--spinning" : ""}`}
      aria-label="Three animated lottery reels"
      aria-live="polite"
      data-tutorial-target="reels"
    >
      {sequences.map((sequence, reelIndex) => {
        const timing = reelTimings[reelIndex] ?? reelTimings[reelTimings.length - 1];
        const targetIndex = sequence.length - 1;
        const style = {
          "--reel-duration": `${timing.durationMs}ms`,
          "--reel-offset": `${targetIndex * -104}px`,
          "--reel-delay": `${timing.delayMs}ms`,
        } as CSSProperties;
        return (
          <div className="lottery-reel" key={`reel-${reelIndex}`}>
            <div className={`lottery-reel__track ${spinning ? "lottery-reel__track--spinning" : ""}`} style={style}>
              {sequence.map((symbol, index) => {
                const Icon = iconMap[symbol.kind];
                return (
                  <div className="lottery-reel__item" key={`${reelIndex}-${symbol.id}-${index}`} aria-hidden={index !== targetIndex}>
                    <Icon />
                    <span className="sr-only">{symbol.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
