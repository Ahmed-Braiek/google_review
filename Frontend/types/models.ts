export type CouponStatus = "available" | "active" | "redeemed" | "expired";
export type RedemptionStatus = "active" | "redeemed" | "expired";
export type DeliveryMethod = "email" | "whatsapp";

export interface ThemeConfig {
  navy: string;
  navyDeep: string;
  ivory: string;
  gold: string;
  goldSoft: string;
  ink: string;
  muted: string;
}

export interface Business {
  id: string;
  storeId: number;
  slug: string;
  name: string;
  subBrand: string;
  logoUrl: string;
  homeUrl: string;
  address?: string;
  phone?: string;
}

export interface LotterySymbol {
  id: string;
  label: string;
  kind: "gift" | "croissant" | "wheat" | "cup";
}

export interface CampaignCopy {
  welcomeTitle: string;
  welcomeBody: string;
  reviewTitle: string;
  reviewBody: string;
  gameTitle: string;
  gameDescription: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  gameId: number;
  name: string;
  gameType: "wheel" | "scratch" | "slot";
  googleReviewUrl: string;
  isActive: boolean;
  business: Business;
  theme: ThemeConfig;
  copy: CampaignCopy;
  rewards: Reward[];
  lotterySymbols: LotterySymbol[];
  redemptionDurationSeconds: number;
}

export interface Reward {
  id: string;
  backendPrizeId: number;
  campaignId: string;
  type: "percentage" | "fixed" | "gift";
  title: string;
  description: string;
  value?: string;
  resultSymbolId: string;
  validUntil?: string;
}

export interface Coupon {
  id: string;
  backendCouponId: number;
  campaignId: string;
  participationId: number;
  rewardId: string;
  code: string;
  status: CouponStatus;
  createdAt: string;
  validUntil: string;
}

export interface RedemptionSession {
  id: string;
  couponId: string;
  startedAt: string;
  expiresAt: string;
  status: RedemptionStatus;
  redeemedAt?: string;
  serverNow?: string;
  remainingSeconds: number;
  token: string;
  validationUrl: string;
}

export interface GameResult {
  participationId: number;
  rewardId: string;
  resultSymbolId: string;
}

export interface PlayerDetails {
  firstName: string;
  email: string;
  phone: string;
  marketingOptin: boolean;
}
