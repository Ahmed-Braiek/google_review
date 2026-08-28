import type { FlowStep, PersistedFlowState } from "@/types/flow";
import type { PlayerDetails } from "@/types/models";

const PREFIX = "qr-review-reward:v4";

function hasWindow(): boolean { return typeof window !== "undefined"; }
function flowKey(slug: string): string { return `${PREFIX}:flow:${slug}`; }
function playerKey(slug: string): string { return `${PREFIX}:player:${slug}`; }
function tutorialKey(slug: string): string { return `${PREFIX}:tutorial:${slug}`; }
function anonymousEmailKey(slug: string): string { return `${PREFIX}:anon:${slug}`; }

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadFlowState(slug: string): PersistedFlowState {
  if (!hasWindow()) return { step: 1 };
  const raw = window.localStorage.getItem(flowKey(slug));
  if (!raw) return { step: 1 };
  try {
    const parsed = JSON.parse(raw) as PersistedFlowState;
    return parsed.step >= 1 && parsed.step <= 13 ? parsed : { step: 1 };
  } catch { return { step: 1 }; }
}

export function saveFlowState(slug: string, state: PersistedFlowState): void {
  if (hasWindow()) window.localStorage.setItem(flowKey(slug), JSON.stringify(state));
}

export function savePlayerDetails(slug: string, value: PlayerDetails): void {
  if (hasWindow()) window.sessionStorage.setItem(playerKey(slug), JSON.stringify(value));
}

export function loadPlayerDetails(slug: string): PlayerDetails | null {
  if (!hasWindow()) return null;
  const raw = window.sessionStorage.getItem(playerKey(slug));
  if (!raw) return null;
  try { return JSON.parse(raw) as PlayerDetails; }
  catch { return null; }
}

export function loadSeenTutorials(slug: string): FlowStep[] {
  if (!hasWindow()) return [];
  const raw = window.localStorage.getItem(tutorialKey(slug));
  if (!raw) return [];
  try { return JSON.parse(raw) as FlowStep[]; }
  catch { return []; }
}

export function markTutorialSeen(slug: string, step: FlowStep): void {
  if (!hasWindow()) return;
  const seen = new Set(loadSeenTutorials(slug));
  seen.add(step);
  window.localStorage.setItem(tutorialKey(slug), JSON.stringify([...seen]));
}

export function loadOrCreateAnonymousEmail(slug: string): string {
  if (!hasWindow()) return "player@anonymous.local";
  const key = anonymousEmailKey(slug);
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = `player-${randomId()}@anonymous.local`;
  window.localStorage.setItem(key, generated);
  return generated;
}
