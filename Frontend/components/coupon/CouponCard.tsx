import type { Coupon, Reward } from "@/types/models";
import { formatShortDate } from "@/lib/time";
import { RewardTicket } from "@/components/reward/RewardTicket";

export function CouponCard({ coupon, reward }: { coupon: Coupon; reward: Reward }) {
  return (
    <article className="coupon-card">
      <div className="coupon-card__label">MY REWARD</div>
      <RewardTicket reward={reward} compact />
      <div className="coupon-card__code-block"><span>CODE</span><strong>{coupon.code}</strong><small>Valid until {formatShortDate(coupon.validUntil)}</small></div>
    </article>
  );
}
