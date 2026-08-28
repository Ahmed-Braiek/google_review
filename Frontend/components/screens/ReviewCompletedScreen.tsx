import type { Campaign } from "@/types/models";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/Buttons";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusIcon } from "@/components/ui/StatusIcon";

export function ReviewCompletedScreen({ campaign, onBack, onContinue }: { campaign: Campaign; onBack: () => void; onContinue: () => void }) {
  return <ScreenShell campaign={campaign} tone="light" className="centered-screen" labelledBy="review-thanks-title">
    <BackButton onClick={onBack} />
    <div className="centered-screen__body"><StatusIcon kind="success" /><h1 id="review-thanks-title">Thank you!</h1><p>Your review helps<br />us do better every day.</p><span className="short-divider" /></div>
    <PrimaryButton onClick={onContinue} data-tutorial-target="continue">Continue</PrimaryButton>
  </ScreenShell>;
}
