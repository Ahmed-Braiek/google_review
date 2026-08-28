"use client";
import { useCallback, useEffect, useRef } from "react";
import type { Campaign } from "@/types/models";
import { LotteryReels } from "@/components/game/LotteryReels";
import { ChevronDownIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/BackButton";
import { ScreenShell } from "@/components/ui/ScreenShell";

export function PlayLotteryScreen({ campaign, resultSymbolId, onBack, onComplete }: { campaign: Campaign; resultSymbolId: string; onBack: () => void; onComplete: () => void }) {
  const completeRef = useRef(false);

  useEffect(() => {
    const a = document.getElementById('open-audio') as HTMLAudioElement | null;
    if (a) {
      a.currentTime = 0;
      void a.play().catch(() => {});
    }
  }, []);

  const complete = useCallback(() => { if (!completeRef.current) { completeRef.current = true; try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!(window as any).__appAudioCtx) (window as any).__appAudioCtx = new AudioCtx();
        void (window as any).__appAudioCtx.resume().catch(() => {});
      }
    } catch {}
    const a = document.getElementById('close-audio') as HTMLAudioElement | null;
    if (a) {
      const proceed = () => { a.onended = null; onComplete(); };
      a.currentTime = 0;
      a.onended = proceed;
      void a.play().catch((err) => { console.warn('close audio play failed', err); proceed(); });
      return;
    }
    onComplete(); } }, [onComplete]);
  return <ScreenShell campaign={campaign} tone="dark" className="lottery-screen" labelledBy="lottery-title">
    <BackButton onClick={onBack} />
    <audio id="open-audio" src="/assets/ouverture.mp3" preload="auto" />
    <audio id="close-audio" src="/assets/fermeture.mp3" preload="auto" />
    <div className="lottery-screen__body"><h1 id="lottery-title">Match 3<br />to win</h1><LotteryReels symbols={campaign.lotterySymbols} resultSymbolId={resultSymbolId} onComplete={complete} /><p>Good luck!</p><ChevronDownIcon className="lottery-screen__down" /></div>
  </ScreenShell>;
}
