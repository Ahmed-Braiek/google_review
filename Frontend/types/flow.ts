import type { Coupon, DeliveryMethod, GameResult, RedemptionSession, Reward } from "./models";

export type FlowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface PersistedFlowState {
  step: FlowStep;
  participationId?: number;
  gameResult?: GameResult;
  reward?: Reward;
  coupon?: Coupon;
  redemption?: RedemptionSession;
  redemptionToken?: string;
  redemptionValidationUrl?: string;
  selectedDelivery?: DeliveryMethod;
  reviewOpened?: boolean;
  expiredAcknowledged?: boolean;
}

export type PendingLeadAction = "claim";
