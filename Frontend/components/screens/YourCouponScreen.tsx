import type { Campaign, Coupon, Reward } from "@/types/models";
import { CouponCard } from "@/components/coupon/CouponCard";
import { ClockIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/Buttons";
import { ScreenShell } from "@/components/ui/ScreenShell";

export function YourCouponScreen({ campaign, coupon, reward, onBack, onRedeem }: { campaign: Campaign; coupon: Coupon; reward: Reward; onBack: () => void; onRedeem: () => void }) {
  return <ScreenShell campaign={campaign} tone="dark" className="coupon-screen" labelledBy="coupon-heading"><BackButton onClick={onBack} /><h1 id="coupon-heading" className="sr-only">Your coupon</h1><div className="coupon-screen__body"><CouponCard coupon={coupon} reward={reward} /><div className="timer-note"><ClockIcon /><p>The 5-minute timer<br />starts only when you<br />redeem the coupon.</p></div></div><PrimaryButton variant="gold" onClick={onRedeem} data-tutorial-target="redeem">Redeem coupon</PrimaryButton></ScreenShell>;
}
