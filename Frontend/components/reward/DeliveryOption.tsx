import type { DeliveryMethod } from "@/types/models";
import { MailIcon, WhatsAppIcon } from "@/components/icons";

export function DeliveryOption({ method, selected, onSelect }: { method: DeliveryMethod; selected: boolean; onSelect: (method: DeliveryMethod) => void }) {
  const email = method === "email";
  return (
    <button type="button" className={`delivery-option ${selected ? "delivery-option--selected" : ""}`} onClick={() => onSelect(method)} aria-pressed={selected} data-tutorial-target="delivery-option">
      <span className="delivery-option__icon">{email ? <MailIcon /> : <WhatsAppIcon />}</span>
      <span className="delivery-option__copy"><strong>{email ? "Email" : "WhatsApp"}</strong><small>{email ? "Receive by email" : "Receive on WhatsApp"}</small></span>
      <span className="delivery-option__radio" aria-hidden="true" />
    </button>
  );
}
