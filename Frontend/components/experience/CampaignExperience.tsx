"use client";

import type { ReactNode } from "react";
import { defaultCampaign } from "@/lib/defaultCampaign";
import { useCampaignExperience } from "./useCampaignExperience";
import { TutorialCoach } from "./TutorialCoach";
import { PlayerDetailsModal } from "./PlayerDetailsModal";
import { CampaignError } from "@/components/ui/CampaignError";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ScanQrScreen } from "@/components/screens/ScanQrScreen";
import { LeaveReviewScreen } from "@/components/screens/LeaveReviewScreen";
import { ReviewCompletedScreen } from "@/components/screens/ReviewCompletedScreen";
import { YourTurnScreen } from "@/components/screens/YourTurnScreen";
import { PlayLotteryScreen } from "@/components/screens/PlayLotteryScreen";
import { YouWonScreen } from "@/components/screens/YouWonScreen";
import { ClaimRewardScreen } from "@/components/screens/ClaimRewardScreen";
import { GetRewardScreen } from "@/components/screens/GetRewardScreen";
import { YourCouponScreen } from "@/components/screens/YourCouponScreen";
import { RedeemCouponScreen } from "@/components/screens/RedeemCouponScreen";
import { RedemptionActiveScreen } from "@/components/screens/RedemptionActiveScreen";
import { RedeemedScreen } from "@/components/screens/RedeemedScreen";
import { ExpiredScreen } from "@/components/screens/ExpiredScreen";

export function CampaignExperience({ storeSlug, forceWelcome = false }: { storeSlug: string; forceWelcome?: boolean }) {
  const experience = useCampaignExperience(storeSlug, forceWelcome);

  if (experience.loading) {
    return <div className="experience-stage"><div className="device-frame"><div className="screen-transition"><LoadingScreen campaign={defaultCampaign} /></div></div></div>;
  }
  if (!experience.campaign) {
    return <div className="experience-stage"><div className="device-frame"><div className="screen-transition"><CampaignError campaign={defaultCampaign} message={experience.error || "This campaign is not available."} onRetry={experience.retry} /></div></div></div>;
  }

  const campaign = experience.campaign;
  const reward = experience.reward ?? campaign.rewards[0];
  const coupon = experience.coupon;
  const redemption = experience.redemption;
  let screen: ReactNode;

  switch (experience.step) {
    case 1:
      screen = <ScanQrScreen campaign={campaign} onBegin={experience.begin} />;
      break;
    case 2:
      screen = <LeaveReviewScreen campaign={campaign} onBack={() => experience.goTo(1)} onOpenReview={experience.openReview} onFinished={experience.finishReview} actionLabel={experience.actionLabel} error={experience.leadModalOpen ? null : experience.error} />;
      break;
    case 3:
      screen = <ReviewCompletedScreen campaign={campaign} onBack={() => experience.goTo(2)} onContinue={() => experience.goTo(4)} />;
      break;
    case 4:
      screen = <YourTurnScreen campaign={campaign} onBack={() => experience.goTo(3)} onPlay={experience.prepareGame} actionLabel={experience.actionLabel} error={experience.leadModalOpen ? null : experience.error} />;
      break;
    case 5:
      screen = <PlayLotteryScreen campaign={campaign} resultSymbolId={experience.gameResult?.resultSymbolId ?? reward.resultSymbolId} onBack={() => experience.goTo(4)} onComplete={experience.completeGameReveal} />;
      break;
    case 6:
      screen = <YouWonScreen campaign={campaign} reward={reward} onBack={() => experience.goTo(4)} onClaim={experience.claimReward} />;
      break;
    case 7:
      screen = <ClaimRewardScreen campaign={campaign} selected={experience.selectedDelivery} onSelect={experience.selectDelivery} onBack={() => experience.goTo(6)} onSend={experience.sendReward} actionLabel={experience.actionLabel} error={experience.error} />;
      break;
    case 8:
      screen = <GetRewardScreen campaign={campaign} method={experience.selectedDelivery} onBack={() => experience.goTo(7)} onView={() => experience.goTo(9)} />;
      break;
    case 9:
      screen = coupon ? <YourCouponScreen campaign={campaign} coupon={coupon} reward={reward} onBack={() => experience.goTo(8)} onRedeem={() => experience.goTo(10)} /> : <CampaignError campaign={campaign} message="Coupon data is missing. Please restart from the QR link." />;
      break;
    case 10:
      screen = <RedeemCouponScreen campaign={campaign} onBack={() => experience.goTo(9)} onStart={experience.startRedemption} actionLabel={experience.actionLabel} error={experience.error} />;
      break;
    case 11:
      screen = coupon && redemption ? <RedemptionActiveScreen campaign={campaign} coupon={coupon} redemption={redemption} onBack={() => experience.goTo(9)} onRefreshStatus={experience.refreshRedemptionStatus} error={experience.error} /> : <CampaignError campaign={campaign} message="The redemption session could not be restored." />;
      break;
    case 12:
      screen = redemption ? <RedeemedScreen campaign={campaign} reward={reward} redemption={redemption} /> : <CampaignError campaign={campaign} message="Redemption data is missing." />;
      break;
    case 13:
      screen = <ExpiredScreen campaign={campaign} onAcknowledge={experience.acknowledgeExpired} />;
      break;
    default:
      screen = <ScanQrScreen campaign={campaign} onBegin={experience.begin} />;
  }

  return (
    <div className="experience-stage">
      <div className="device-frame">
        <div className="screen-transition" key={experience.step}>{screen}</div>
        <TutorialCoach slug={storeSlug} step={experience.step} suspended={experience.leadModalOpen} />
        <PlayerDetailsModal open={experience.leadModalOpen} initialValue={experience.playerDetails} busyLabel={experience.actionLabel} error={experience.error} onClose={experience.closeLeadModal} onSubmit={experience.submitPlayerDetails} />
      </div>
    </div>
  );
}
