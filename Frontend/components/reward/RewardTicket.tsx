import type { Reward } from "@/types/models";

export function RewardTicket({ reward, compact = false, light = false }: { reward: Reward; compact?: boolean; light?: boolean }) {
  const percentage = reward.type === "percentage" && reward.value;
  return (
    <div className={`reward-ticket ${compact ? "reward-ticket--compact" : ""} ${light ? "reward-ticket--light" : ""} ${percentage ? "" : "reward-ticket--named"}`}>
      <i className="reward-ticket__notch reward-ticket__notch--left" />
      <i className="reward-ticket__notch reward-ticket__notch--right" />
      <div className="reward-ticket__ornament" aria-hidden="true"><span /><span /><span /></div>
      {percentage ? (
        <><strong className="reward-ticket__value">{reward.value}</strong><span className="reward-ticket__off">OFF</span></>
      ) : (
        <strong className="reward-ticket__name">{reward.title}</strong>
      )}
      <p>{reward.description}</p>
    </div>
  );
}
