import type { Campaign } from "@/types/models";

export const DEFAULT_THEME = {
  navy: "#071b2a",
  navyDeep: "#03131f",
  ivory: "#f4eee3",
  gold: "#c78d45",
  goldSoft: "#e0b66f",
  ink: "#141a1e",
  muted: "#6f6a62",
} as const;

export const defaultCampaign: Campaign = {
  id: "paul-sousse-khezama",
  businessId: "store-1",
  gameId: 1,
  name: "QR Review Reward",
  gameType: "slot",
  googleReviewUrl: "https://www.google.com/maps",
  isActive: true,
  business: {
    id: "store-1",
    storeId: 1,
    slug: "paul-sousse-khezama",
    name: "PAUL",
    subBrand: "SOUSSE KHZEMA · TUNISIA",
    logoUrl: "",
    homeUrl: "/",
  },
  theme: { ...DEFAULT_THEME },
  copy: {
    welcomeTitle: "A little joy\nfor your next visit",
    welcomeBody: "Enjoy a treat from us.\nDiscover your reward below.",
    reviewTitle: "Tell us what\nyou think",
    reviewBody: "Your honest review\nmeans a lot to us.",
    gameTitle: "Try your luck",
    gameDescription: "Match 3 identical symbols\nto win your reward",
  },
  lotterySymbols: [
    { id: "gift", label: "Gift", kind: "gift" },
    { id: "croissant", label: "Croissant", kind: "croissant" },
    { id: "wheat", label: "Wheat", kind: "wheat" },
    { id: "cup", label: "Coffee cup", kind: "cup" },
  ],
  rewards: [{
    id: "prize-1",
    backendPrizeId: 1,
    campaignId: "paul-sousse-khezama",
    type: "percentage",
    title: "15% OFF",
    description: "ON YOUR NEXT PURCHASE",
    value: "15%",
    resultSymbolId: "gift",
    validUntil: "2027-09-30T23:59:59.000Z",
  }],
  redemptionDurationSeconds: 300,
};
