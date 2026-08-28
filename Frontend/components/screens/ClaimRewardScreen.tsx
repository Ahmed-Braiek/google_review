import type { Campaign, DeliveryMethod } from "@/types/models";
import { DeliveryOption } from "@/components/reward/DeliveryOption";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/Buttons";
import { InlineError } from "@/components/ui/InlineError";
import { ScreenShell } from "@/components/ui/ScreenShell";

export function ClaimRewardScreen({ campaign, selected, onSelect, onBack, onSend, actionLabel, error }: { campaign: Campaign; selected: DeliveryMethod | null; onSelect: (method: DeliveryMethod) => void; onBack: () => void; onSend: () => void; actionLabel: string | null; error: string | null }) {
  return <ScreenShell campaign={campaign} tone="light" className="claim-screen" labelledBy="claim-title"><BackButton onClick={onBack} /><div className="claim-screen__body"><h1 id="claim-title">Where should we<br />send your reward?</h1><p>Choose your preferred<br />delivery method</p><div className="delivery-list"><DeliveryOption method="email" selected={selected === "email"} onSelect={onSelect} /><DeliveryOption method="whatsapp" selected={selected === "whatsapp"} onSelect={onSelect} /></div></div><div><InlineError message={error} /><PrimaryButton onClick={onSend} disabled={!selected} busyLabel={actionLabel}>Send my reward</PrimaryButton></div></ScreenShell>;
}
