import type { Campaign, RedemptionSession, Reward } from "@/types/models";
import { SessionCheckIcon } from "@/components/icons";
import { RewardTicket } from "@/components/reward/RewardTicket";
import { GoldDust } from "@/components/ui/GoldDust";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { formatShortDate, formatTime } from "@/lib/time";

export function RedeemedScreen({ campaign, reward, redemption }: { campaign: Campaign; reward: Reward; redemption: RedemptionSession }) {
  const usedAt = redemption.redeemedAt ?? new Date().toISOString();
  return <ScreenShell campaign={campaign} tone="light" className="redeemed-screen" labelledBy="redeemed-title"><GoldDust sparse /><div className="redeemed-screen__body" data-tutorial-target="redeemed"><StatusIcon kind="success" /><h1 id="redeemed-title">Redeemed!</h1><p>Your reward has been<br />successfully used.</p><RewardTicket reward={reward} compact light /><div className="redeemed-info"><SessionCheckIcon /><div><span>Redeemed on</span><strong>{formatShortDate(usedAt)} · {formatTime(usedAt)}</strong></div></div></div></ScreenShell>;
}
