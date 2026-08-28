"use client";
import { useCallback } from "react";
import type { CSSProperties } from "react";
import type { Campaign, Coupon, RedemptionSession } from "@/types/models";
import { RedemptionQr } from "@/components/redemption/RedemptionQr";
import { ClockIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/BackButton";
import { InlineError } from "@/components/ui/InlineError";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useCountdown } from "@/components/experience/useCountdown";
import { formatTime } from "@/lib/time";

export function RedemptionActiveScreen({ campaign, coupon, redemption, onBack, onRefreshStatus, error }: {
  campaign: Campaign;
  coupon: Coupon;
  redemption: RedemptionSession;
  onBack: () => void;
  onRefreshStatus: () => void;
  error: string | null;
}) {
  const refresh = useCallback(onRefreshStatus, [onRefreshStatus]);
  const { label, remaining } = useCountdown(redemption.remainingSeconds, refresh);
  const total = Math.max(1, campaign.redemptionDurationSeconds * 1000);
  const progress = Math.max(0, Math.min(1, remaining / total));

  return <ScreenShell campaign={campaign} tone="dark" className="active-screen" labelledBy="active-title">
    <BackButton onClick={onBack} />
    <div className="active-screen__body">
      <span className="active-screen__eyebrow" id="active-title">REDEMPTION ACTIVE</span>
      <div className="active-screen__timer">
        <div className="active-screen__arc" style={{ "--progress": `${progress * 360}deg` } as CSSProperties} aria-hidden="true" />
        <strong className="active-screen__countdown" aria-live="polite">{label}</strong>
      </div>
      <p>Show this code to our staff</p>
      <RedemptionQr value={redemption.validationUrl} code={coupon.code} />
      <InlineError message={error} />
      <div className="session-active-card"><ClockIcon /><div><strong>Session active</strong><span>Expires in {label} · {formatTime(redemption.expiresAt)}</span></div></div>
    </div>
  </ScreenShell>;
}
