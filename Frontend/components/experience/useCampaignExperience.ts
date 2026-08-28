"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { defaultCampaign } from "@/lib/defaultCampaign";
import { loadFlowState, loadPlayerDetails, saveFlowState, savePlayerDetails } from "@/lib/storage";
import type { FlowStep, PendingLeadAction, PersistedFlowState } from "@/types/flow";
import type { Campaign, Coupon, DeliveryMethod, GameResult, PlayerDetails, RedemptionSession, Reward } from "@/types/models";

interface ExperienceState {
  campaign: Campaign | null;
  step: FlowStep;
  reward: Reward | null;
  coupon: Coupon | null;
  redemption: RedemptionSession | null;
  gameResult: GameResult | null;
  selectedDelivery: DeliveryMethod | null;
  playerDetails: PlayerDetails | null;
  loading: boolean;
  actionLabel: string | null;
  error: string | null;
  leadModalOpen: boolean;
  pendingLeadAction: PendingLeadAction | null;
}

const initialState: ExperienceState = {
  campaign: null,
  step: 1,
  reward: null,
  coupon: null,
  redemption: null,
  gameResult: null,
  selectedDelivery: null,
  playerDetails: null,
  loading: true,
  actionLabel: null,
  error: null,
  leadModalOpen: false,
  pendingLeadAction: null,
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function stepForRedemption(status: RedemptionSession["status"]): FlowStep {
  return status === "active" ? 11 : status === "redeemed" ? 12 : 13;
}

function localId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createLocalRedemption(coupon: Coupon, durationSeconds: number): RedemptionSession {
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + durationSeconds * 1000);
  return {
    id: localId("redemption"),
    couponId: coupon.id,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "active",
    serverNow: startedAt.toISOString(),
    remainingSeconds: durationSeconds,
    token: localId("token"),
    validationUrl: `${window.location.origin}/redeem/${coupon.code}`,
  };
}

function updateLocalRedemption(redemption: RedemptionSession): RedemptionSession {
  const remainingSeconds = Math.max(0, Math.ceil((new Date(redemption.expiresAt).getTime() - Date.now()) / 1000));
  return { ...redemption, remainingSeconds, status: remainingSeconds ? redemption.status : "expired" };
}

export function useCampaignExperience(storeSlug: string, forceWelcome = false) {
  const [state, setState] = useState<ExperienceState>(initialState);
  const [reloadKey, setReloadKey] = useState(0);

  const persist = useCallback((patch: Partial<PersistedFlowState>) => {
    const current = loadFlowState(storeSlug);
    saveFlowState(storeSlug, { ...current, ...patch });
  }, [storeSlug]);

  const transitionTo = useCallback((nextStep: FlowStep, patch: Partial<ExperienceState> = {}) => {
    const apply = () => setState((current) => ({ ...current, ...patch, step: nextStep, error: patch.error ?? null }));
    const direction = nextStep >= state.step ? "forward" : "back";
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const documentWithTransition = document as ViewTransitionDocument;
    if (!reduced && documentWithTransition.startViewTransition) {
      document.documentElement.dataset.transitionDirection = direction;
      const transition = documentWithTransition.startViewTransition(() => flushSync(apply));
      void transition.finished.finally(() => { delete document.documentElement.dataset.transitionDirection; });
    } else apply();
    persist({ step: nextStep });
  }, [persist, state.step]);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const campaign: Campaign = { ...defaultCampaign, id: storeSlug, business: { ...defaultCampaign.business, slug: storeSlug } };
        const saved: PersistedFlowState = forceWelcome ? { step: 1 } : loadFlowState(storeSlug);
        let redemption: RedemptionSession | null = null;
        let coupon = saved.coupon ?? null;
        let step = saved.step;

        if (saved.redemptionToken && coupon) {
          redemption = updateLocalRedemption({
            id: saved.redemption?.id || localId("redemption"),
            couponId: coupon.id,
            startedAt: saved.redemption?.startedAt || new Date().toISOString(),
            expiresAt: saved.redemption?.expiresAt || new Date().toISOString(),
            status: saved.redemption?.status || "active",
            remainingSeconds: saved.redemption?.remainingSeconds || 0,
            token: saved.redemptionToken,
            validationUrl: saved.redemptionValidationUrl || `${window.location.origin}/redeem/${coupon.code}`,
          });
          step = stepForRedemption(redemption.status);
          coupon = { ...coupon, status: redemption.status === "expired" ? "expired" : "active" };
          saveFlowState(storeSlug, { ...saved, redemption, coupon, step });
        } else if (step >= 11) {
          step = coupon ? 9 : 1;
        }

        if (!coupon && !saved.redemptionToken) step = 1;
        if (!cancelled) {
          setState({
            campaign,
            step,
            reward: saved.reward ?? null,
            coupon,
            redemption,
            gameResult: saved.gameResult ?? null,
            selectedDelivery: saved.selectedDelivery ?? null,
            playerDetails: loadPlayerDetails(storeSlug),
            loading: false,
            actionLabel: null,
            error: null,
            leadModalOpen: false,
            pendingLeadAction: null,
          });
        }
      } catch (error) {
        if (!cancelled) setState((current) => ({ ...current, loading: false, campaign: null, error: error instanceof Error ? error.message : "Unexpected error" }));
      }
    };
    void initialize();
    return () => { cancelled = true; };
  }, [forceWelcome, reloadKey, storeSlug]);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);
  const goTo = useCallback((step: FlowStep) => transitionTo(step), [transitionTo]);
  const begin = useCallback(() => transitionTo(2), [transitionTo]);

  const openLeadModal = useCallback((action: PendingLeadAction) => {
    setState((current) => ({ ...current, leadModalOpen: true, pendingLeadAction: action, error: null }));
  }, []);

  const openGoogleReview = useCallback(async (participationId?: number, preferredWindow?: Window | null): Promise<boolean> => {
    if (!state.campaign) return false;
    setState((current) => ({ ...current, actionLabel: "Opening Google...", error: null }));
    try {
      const url = state.campaign.googleReviewUrl;
      let navigated = false;
      if (preferredWindow) {
        try {
          preferredWindow.location.href = url;
          navigated = true;
        } catch {
          // Cross-origin popup references can throw; fallback to opening a new tab.
        }
      }
      if (!navigated) {
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        navigated = Boolean(opened);
      }
      setState((current) => ({
        ...current,
        actionLabel: null,
        error: navigated ? null : "Popup blocked. Please allow popups and try again.",
      }));
      return navigated;
    } catch {
      if (preferredWindow && !preferredWindow.closed) preferredWindow.close();
      setState((current) => ({ ...current, actionLabel: null, error: "Unable to open Google." }));
      return false;
    }
  }, [state.campaign]);

  const openReview = useCallback(() => {
    const popup = window.open("about:blank", "_blank", "noopener,noreferrer");
    if (popup) popup.opener = null;
    void (async () => {
      const opened = await openGoogleReview(state.gameResult?.participationId, popup);
      if (opened) transitionTo(4);
    })();
  }, [openGoogleReview, state.gameResult, transitionTo]);

  const finishReview = useCallback(() => {
    transitionTo(4);
  }, [transitionTo]);

  const submitPlayerDetails = useCallback(async (details: PlayerDetails) => {
    if (!state.pendingLeadAction || !state.gameResult) return;
    setState((current) => ({ ...current, playerDetails: details, actionLabel: "Saving your contact details...", error: null }));
    savePlayerDetails(storeSlug, details);
    transitionTo(7, { leadModalOpen: false, pendingLeadAction: null, actionLabel: null, error: null });
  }, [state.gameResult, state.pendingLeadAction, storeSlug, transitionTo]);

  const prepareGame = useCallback(() => {
    if (state.gameResult) {
      transitionTo(5);
      return;
    }

    if (!state.campaign) return;

    const campaign = state.campaign as Campaign;
    const reward = campaign.rewards[Math.floor(Math.random() * campaign.rewards.length)];
    const now = new Date();
    const coupon: Coupon = {
      id: localId("coupon"), backendCouponId: 0, campaignId: campaign.id,
      participationId: Date.now(), rewardId: reward.id, code: `PAUL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: "available", createdAt: now.toISOString(), validUntil: reward.validUntil || new Date(now.getTime() + 30 * 86400000).toISOString(),
    };
    const gameResult: GameResult = { participationId: coupon.participationId, rewardId: reward.id, resultSymbolId: reward.resultSymbolId };
    persist({ participationId: coupon.participationId, reward, coupon, gameResult, redemption: undefined, redemptionToken: undefined, redemptionValidationUrl: undefined });
    transitionTo(5, { reward, coupon, gameResult, redemption: null, actionLabel: null, error: null });
  }, [persist, state.campaign, state.gameResult, transitionTo]);

  const claimReward = useCallback(() => {
    openLeadModal("claim");
  }, [openLeadModal]);
  const completeGameReveal = useCallback(() => transitionTo(6), [transitionTo]);
  const selectDelivery = useCallback((method: DeliveryMethod) => {
    setState((current) => ({ ...current, selectedDelivery: method }));
    persist({ selectedDelivery: method });
  }, [persist]);
  const sendReward = useCallback(async () => {
    if (!state.selectedDelivery || !state.coupon) return;
    setState((current) => ({ ...current, actionLabel: "Sending your reward...", error: null }));
    transitionTo(8, { actionLabel: null, error: null });
  }, [state.coupon, state.selectedDelivery, transitionTo]);

  const applyServerRedemption = useCallback((redemption: RedemptionSession, coupon: Coupon) => {
    const nextCoupon: Coupon = {
      ...coupon,
      status: redemption.status === "redeemed" ? "redeemed" : redemption.status === "expired" ? "expired" : "active",
    };
    const step = stepForRedemption(redemption.status);
    persist({ redemption, redemptionToken: redemption.token, redemptionValidationUrl: redemption.validationUrl, coupon: nextCoupon, step, expiredAcknowledged: false });
    transitionTo(step, { redemption, coupon: nextCoupon, actionLabel: null });
  }, [persist, transitionTo]);

  const startRedemption = useCallback(async () => {
    if (!state.coupon) return;
    setState((current) => ({ ...current, actionLabel: "Activating your offer...", error: null }));
    applyServerRedemption(createLocalRedemption(state.coupon, state.campaign?.redemptionDurationSeconds || 300), state.coupon);
  }, [applyServerRedemption, state.campaign, state.coupon]);

  const refreshRedemptionStatus = useCallback(async () => {
    if (!state.redemption || !state.coupon) return;
    try {
      const redemption = updateLocalRedemption(state.redemption);
      if (redemption.status !== "active") applyServerRedemption(redemption, state.coupon);
      else {
        setState((current) => ({ ...current, redemption, error: null }));
        persist({ redemption });
      }
    } catch (error) {
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : "Unable to refresh reward status." }));
    }
  }, [applyServerRedemption, persist, state.coupon, state.redemption]);

  useEffect(() => {
    if (state.step !== 11 || !state.redemption?.token) return;
    const timer = window.setInterval(() => { void refreshRedemptionStatus(); }, 2000);
    return () => window.clearInterval(timer);
  }, [refreshRedemptionStatus, state.redemption?.token, state.step]);

  const acknowledgeExpired = useCallback(() => {
    persist({ expiredAcknowledged: true, step: 1 });
    window.location.assign(state.campaign?.business.homeUrl || "/");
  }, [persist, state.campaign]);

  return {
    ...state,
    retry,
    goTo,
    begin,
    openReview,
    finishReview,
    submitPlayerDetails,
    closeLeadModal: () => setState((current) => ({ ...current, leadModalOpen: false, pendingLeadAction: null, actionLabel: null, error: null })),
    prepareGame,
    claimReward,
    completeGameReveal,
    selectDelivery,
    sendReward,
    startRedemption,
    refreshRedemptionStatus,
    acknowledgeExpired,
  };
}
