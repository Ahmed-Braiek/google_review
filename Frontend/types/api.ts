export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface HealthResponse {
  success: boolean;
  message: string;
  database?: string;
  database_time?: string;
}

export interface BackendStore {
  id: number;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  google_review_url?: string | null;
}

export interface BackendPrizeSummary {
  id: number;
  name: string;
  description?: string | null;
}

export interface PublicStoreData {
  store: BackendStore;
  game: {
    id: number;
    name: string;
    type: "wheel" | "scratch" | "slot";
    title?: string | null;
    description?: string | null;
    prizes: BackendPrizeSummary[];
  };
}

export interface PlayPayload {
  first_name: string;
  email?: string;
  phone?: string;
  marketing_optin: boolean;
}

export interface ParticipantContactPayload {
  first_name: string;
  email: string;
  phone: string;
  marketing_optin: boolean;
}

export interface PlayData {
  participation_id: number;
  customer: { id: number; first_name: string };
  store: { id: number; name: string };
  game: { id: number; name: string; type: "wheel" | "scratch" | "slot" };
  prize: { id: number; name: string; description?: string | null };
  coupon: {
    id: number;
    code: string;
    status: "active" | "used" | "expired";
    expires_at: string;
  };
  google_review_url: string;
}

export interface RewardDeliveryData {
  id: number;
  status: "pending" | "sending" | "sent" | "failed";
  method: "email" | "whatsapp";
  destination: string;
  provider?: string | null;
  provider_message_id?: string | null;
  sent_at?: string | null;
}

export interface PublicRedemptionData {
  id: number;
  status: "active" | "redeemed" | "expired";
  started_at: string;
  expires_at: string;
  server_now?: string;
  remaining_seconds: number;
  redeemed_at?: string | null;
  token?: string;
  validation_url?: string;
  coupon: {
    id: number;
    code: string;
    status: "active" | "used" | "expired";
    expires_at: string;
  };
}

export interface ReviewClickData {
  review_click_id: number | null;
  google_review_url: string;
}

export interface ParticipantContactData {
  participation_id: number;
  customer: {
    id: number;
    first_name: string;
    email: string;
    phone: string;
    marketing_optin: boolean;
  };
}

export interface BackendUser {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
  role: "owner" | "manager" | "cashier" | "super_admin";
  status?: string;
}

export interface LoginData {
  token: string;
  user: BackendUser;
}

/** The route is used to verify that the JWT is still accepted by the backend. */
export type AuthMeData = unknown;

export interface CouponLookupData {
  id: number;
  code: string;
  status: "active" | "used" | "expired";
  store_id: number;
  prize_name?: string;
  store_name?: string;
  customer_name?: string;
  validity?: "valid" | "expired" | "used" | string;
  expires_at?: string;
  used_at?: string;
}

export interface CouponValidationData {
  coupon_id: number;
  code: string;
  prize: { id: number; name: string; description?: string | null };
  store: { id: number; name: string };
  status: "used";
  used_at: string;
}

export interface ApiFailurePayload {
  success?: false;
  message?: string;
  next_play_available_in?: string;
  next_play_at?: string;
  used_at?: string;
  total_probability?: number;
}
