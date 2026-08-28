import type { Campaign } from "@/types/models";
import { PrimaryButton } from "@/components/ui/Buttons";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusIcon } from "@/components/ui/StatusIcon";

export function ExpiredScreen({ campaign, onAcknowledge }: { campaign: Campaign; onAcknowledge: () => void }) {
  return <ScreenShell campaign={campaign} tone="light" className="centered-screen expired-screen" labelledBy="expired-title"><div className="centered-screen__body"><StatusIcon kind="expired" /><h1 id="expired-title">Time&apos;s up!</h1><p>The 5-minute window<br />has expired.</p><p>This coupon can no longer<br />be used.</p><span className="short-divider" /></div><PrimaryButton onClick={onAcknowledge} data-tutorial-target="expired">Got it</PrimaryButton></ScreenShell>;
}
