import type { Campaign } from "@/types/models";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ScreenShell } from "./ScreenShell";

export function LoadingScreen({ campaign }: { campaign: Campaign }) {
  return (
    <ScreenShell campaign={campaign} tone="dark" className="loading-screen">
      <BrandLogo business={campaign.business} />
      <div className="luxury-loader" aria-label="Loading"><span /><span /><span /></div>
      <p>Preparing your experience...</p>
    </ScreenShell>
  );
}
