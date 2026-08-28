import type { CSSProperties, ReactNode } from "react";
import type { Campaign } from "@/types/models";

interface ScreenShellProps {
  campaign: Campaign;
  tone: "dark" | "light";
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

export function ScreenShell({ campaign, tone, children, className = "", labelledBy }: ScreenShellProps) {
  const style = {
    "--navy": campaign.theme.navy,
    "--navy-deep": campaign.theme.navyDeep,
    "--ivory": campaign.theme.ivory,
    "--gold": campaign.theme.gold,
    "--gold-soft": campaign.theme.goldSoft,
    "--ink": campaign.theme.ink,
    "--muted": campaign.theme.muted,
  } as CSSProperties;

  return (
    <main className={`screen-shell screen-shell--${tone} ${className}`} style={style} aria-labelledby={labelledBy}>
      <div className="screen-shell__inner">{children}</div>
    </main>
  );
}
