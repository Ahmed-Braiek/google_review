import type { Campaign } from "@/types/models";
import { ClockIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton, TextButton } from "@/components/ui/Buttons";
import { InlineError } from "@/components/ui/InlineError";
import { ScreenShell } from "@/components/ui/ScreenShell";

export function RedeemCouponScreen({ campaign, onBack, onStart, actionLabel, error }: { campaign: Campaign; onBack: () => void; onStart: () => void; actionLabel: string | null; error: string | null }) {
  return <ScreenShell campaign={campaign} tone="light" className="redeem-confirm-screen" labelledBy="redeem-title"><BackButton onClick={onBack} /><div className="redeem-confirm-card"><h1 id="redeem-title">Ready to redeem?</h1><p>Redeeming will activate a<br />5-minute timer.</p><p>Make sure you&apos;re ready<br />to show this to our staff.</p><div className="five-minute-clock"><ClockIcon /><span>05:00</span></div></div><div className="redeem-confirm-screen__actions"><InlineError message={error} /><PrimaryButton onClick={onStart} busyLabel={actionLabel} data-tutorial-target="start-redeem">Start redeeming</PrimaryButton><TextButton onClick={onBack} disabled={Boolean(actionLabel)}>Not now</TextButton></div></ScreenShell>;
}
