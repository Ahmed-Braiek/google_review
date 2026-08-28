import type { Campaign } from "@/types/models";
import { XIcon } from "@/components/icons";
import { ScreenShell } from "./ScreenShell";
import { PrimaryButton } from "./Buttons";

export function CampaignError({ campaign, message, onRetry }: { campaign: Campaign; message: string; onRetry?: () => void }) {
  return (
    <ScreenShell campaign={campaign} tone="light" className="campaign-error">
      <XIcon className="campaign-error__icon" />
      <h1>Campaign unavailable</h1>
      <p>{message}</p>
      {onRetry ? <PrimaryButton onClick={onRetry}>Try again</PrimaryButton> : null}
    </ScreenShell>
  );
}
