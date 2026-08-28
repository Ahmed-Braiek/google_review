import type { Campaign } from "@/types/models";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PrimaryButton } from "@/components/ui/Buttons";
import { ScreenShell } from "@/components/ui/ScreenShell";

export function ScanQrScreen({ campaign, onBegin }: { campaign: Campaign; onBegin: () => void }) {
  const unlockAudio = () => {
    const video = document.getElementById('welcome-video') as HTMLVideoElement | null;
    if (!video) return;
    video.muted = false;
    if (video.paused) {
      void video.play().catch(() => {});
    }
  };

  return <ScreenShell campaign={campaign} tone="dark" className="scan-screen" labelledBy="scan-title">
    <BrandLogo business={campaign.business} compact />
    <div className="scan-screen__copy"><span className="scan-screen__eyebrow">A MOMENT FROM US</span><h1 id="scan-title">{campaign.copy.welcomeTitle}</h1><p>{campaign.copy.welcomeBody}</p></div>
    <div className="scan-screen__photo" aria-hidden="true">
      <video id="welcome-video" autoPlay loop playsInline preload="auto" poster="/assets/pastry-photo-reference.png" muted={false} onCanPlay={() => {
        const video = document.getElementById('welcome-video') as HTMLVideoElement | null;
        if (video && video.paused) {
          void video.play().catch(() => {});
        }
      }}>
        <source src="/assets/welcome-video.mp4" type="video/mp4" />
      </video>
    </div>
    <PrimaryButton variant="gold" onClick={() => {
      unlockAudio();
      onBegin();
    }} data-tutorial-target="begin">Let&apos;s begin</PrimaryButton>
  </ScreenShell>;
}
