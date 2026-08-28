import type { Campaign, Reward } from "@/types/models";
import { RewardTicket } from "@/components/reward/RewardTicket";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/Buttons";
import { GoldDust } from "@/components/ui/GoldDust";
import { ScreenShell } from "@/components/ui/ScreenShell";

export function YouWonScreen({ campaign, reward, onBack, onClaim }: { campaign: Campaign; reward: Reward; onBack: () => void; onClaim: () => void }) {
  return <ScreenShell campaign={campaign} tone="dark" className="won-screen" labelledBy="won-title"><BackButton onClick={onBack} /><GoldDust /><div className="won-screen__body"><h1 id="won-title">Congratulations!<br />You won</h1><RewardTicket reward={reward} /></div><PrimaryButton variant="gold" onClick={onClaim} data-tutorial-target="claim">Claim my reward</PrimaryButton></ScreenShell>;
}
