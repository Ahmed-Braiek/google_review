import type { Campaign } from "@/types/models";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { StarIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton, TextButton } from "@/components/ui/Buttons";
import { InlineError } from "@/components/ui/InlineError";
import { ScreenShell } from "@/components/ui/ScreenShell";

export function LeaveReviewScreen({ campaign, onBack, onOpenReview, onFinished, actionLabel, error }: { campaign: Campaign; onBack: () => void; onOpenReview: () => void; onFinished: () => void; actionLabel: string | null; error: string | null }) {
  return <ScreenShell campaign={campaign} tone="dark" className="review-screen" labelledBy="review-title">
    <BackButton onClick={onBack} />
    <BrandLogo business={campaign.business} compact />
    <div className="review-screen__content">
      <h1 id="review-title">{campaign.copy.reviewTitle}</h1><p>{campaign.copy.reviewBody}</p>
      <img className="google-logo" src="/assets/google-logo.png" alt="Google" />
      <div className="star-row" aria-label="Five stars">{Array.from({ length: 5 }, (_, index) => <StarIcon key={index} />)}</div>
      <span className="review-screen__caption">Leave a review on Google</span>
    </div>
    <div className="review-screen__actions">
      <InlineError message={error} />
      <PrimaryButton variant="outline" onClick={onOpenReview} busyLabel={actionLabel?.includes("Opening") || actionLabel?.includes("Preparing") ? actionLabel : null} data-tutorial-target="review">Write a review</PrimaryButton>
      <TextButton onClick={onFinished} disabled={Boolean(actionLabel)}>{actionLabel?.includes("Continuing") ? actionLabel : "I've finished"}</TextButton>
    </div>
  </ScreenShell>;
}
