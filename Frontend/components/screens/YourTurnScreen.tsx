"use client";

import type { Campaign } from "@/types/models";
import { BackButton } from "@/components/ui/BackButton";
import { PrimaryButton } from "@/components/ui/Buttons";
import { GoldDust } from "@/components/ui/GoldDust";
import { InlineError } from "@/components/ui/InlineError";
import { ScreenShell } from "@/components/ui/ScreenShell";

export function YourTurnScreen({ campaign, onBack, onPlay, actionLabel, error }: { campaign: Campaign; onBack: () => void; onPlay: () => void; actionLabel: string | null; error: string | null }) {
  return <ScreenShell campaign={campaign} tone="dark" className="turn-screen" labelledBy="turn-title">
    <BackButton onClick={onBack} />
    <div className="turn-screen__body"><h1 id="turn-title">{campaign.copy.gameTitle}</h1><p>{campaign.copy.gameDescription}</p><div className="good-luck-card"><GoldDust /><span>GOOD<br />LUCK</span></div></div>
    <div><InlineError message={error} /><PrimaryButton variant="gold" onClick={onPlay} busyLabel={actionLabel} data-tutorial-target="play">Play now</PrimaryButton></div>
  </ScreenShell>;
}
