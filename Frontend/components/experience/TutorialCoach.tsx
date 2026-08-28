"use client";

import { useEffect, useMemo, useState } from "react";
import type { FlowStep } from "@/types/flow";
import { loadSeenTutorials, markTutorialSeen } from "@/lib/storage";

const tips: Record<FlowStep, { title: string; body: string; target: string; placement: "top" | "bottom" }> = {
  1: { title: "Welcome", body: "Tap Let’s begin to start.", target: "begin", placement: "top" },
  2: { title: "Your choice", body: "Write a review, or continue without one. Either way, you can play.", target: "review", placement: "top" },
  3: { title: "Ready to play?", body: "Tap Continue when you are ready for the game.", target: "continue", placement: "top" },
  4: { title: "Start the game", body: "Tap Play now to spin the reels and reveal your prize.", target: "play", placement: "top" },
  5: { title: "Watch the reels", body: "The reels are spinning. Your prize will appear when they stop.", target: "reels", placement: "bottom" },
  6: { title: "You won!", body: "Tap Claim my reward, then add your contact details.", target: "claim", placement: "top" },
  7: { title: "Choose how to receive it", body: "Pick Email or WhatsApp, then tap Send my reward.", target: "delivery-option", placement: "top" },
  8: { title: "View your coupon", body: "Tap here to open your reward coupon and see when it expires.", target: "view-coupon", placement: "top" },
  9: { title: "Use it in store", body: "Keep this coupon until you are with a staff member, then tap Redeem coupon.", target: "redeem", placement: "top" },
  10: { title: "Ready to redeem?", body: "Ask a staff member to join you, then tap Start redeeming. You will have five minutes.", target: "start-redeem", placement: "top" },
  11: { title: "Show your reward", body: "Show this QR code and coupon code to a staff member to complete your visit.", target: "qr", placement: "bottom" },
  12: { title: "All done", body: "Your coupon has been used. Thank you for visiting us!", target: "redeemed", placement: "bottom" },
  13: { title: "This coupon expired", body: "The five-minute redemption window has ended. Please ask the team for help.", target: "expired", placement: "top" },
};

export function TutorialCoach({ slug, step, suspended = false }: { slug: string; step: FlowStep; suspended?: boolean }) {
  const [open, setOpen] = useState(false);
  const tip = useMemo(() => tips[step], [step]);

  useEffect(() => {
    const seen = loadSeenTutorials(slug);
    setOpen(!seen.includes(step));
  }, [slug, step]);

  useEffect(() => {
    const selector = `[data-tutorial-target="${tip.target}"]`;
    const target = open && !suspended ? document.querySelector<HTMLElement>(selector) : null;
    target?.classList.add("tutorial-target-active");
    return () => target?.classList.remove("tutorial-target-active");
  }, [open, suspended, tip.target]);

  const close = () => { markTutorialSeen(slug, step); setOpen(false); };

  return (
    <>
      <button type="button" className="tutorial-help" onClick={() => setOpen(true)} aria-label="Show tutorial">?</button>
      {open && !suspended ? (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label={`Tutorial step ${step}`}>
          <div className={`tutorial-card tutorial-card--${tip.placement}`}>
            <span className="tutorial-card__step">STEP {String(step).padStart(2, "0")} / 13</span>
            <strong>{tip.title}</strong>
            <p>{tip.body}</p>
            <span className="tutorial-card__pointer" aria-hidden="true">↓</span>
            <button type="button" onClick={close}>Got it</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
