import type { Campaign, DeliveryMethod } from "@/types/models";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/Buttons";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusIcon } from "@/components/ui/StatusIcon";

export function GetRewardScreen({ campaign, method, onBack, onView }: { campaign: Campaign; method: DeliveryMethod | null; onBack: () => void; onView: () => void }) {
  const channel = method === "email" ? "email" : method === "whatsapp" ? "WhatsApp" : "email or WhatsApp";
  return <ScreenShell campaign={campaign} tone="light" className="centered-screen" labelledBy="reward-way-title"><BackButton onClick={onBack} /><div className="centered-screen__body"><StatusIcon kind="success" /><h1 id="reward-way-title">Your reward<br />is on its way!</h1><p>Check your {channel}.</p><span className="short-divider" /></div><PrimaryButton onClick={onView} data-tutorial-target="view-coupon">View my coupon</PrimaryButton></ScreenShell>;
}
