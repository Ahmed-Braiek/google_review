"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { PlayerDetails } from "@/types/models";
import { InlineError } from "@/components/ui/InlineError";
import { PrimaryButton, TextButton } from "@/components/ui/Buttons";

const emptyDetails: PlayerDetails = { firstName: "Player", email: "", phone: "", marketingOptin: false };

export function PlayerDetailsModal({ open, initialValue, busyLabel, error, onClose, onSubmit }: {
  open: boolean;
  initialValue: PlayerDetails | null;
  busyLabel: string | null;
  error: string | null;
  onClose: () => void;
  onSubmit: (details: PlayerDetails) => void;
}) {
  const [form, setForm] = useState<PlayerDetails>(initialValue ?? emptyDetails);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initialValue ?? emptyDetails);
      setLocalError(null);
    }
  }, [initialValue, open]);

  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = {
      ...form,
      firstName: form.firstName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };
    if (!normalized.email || !normalized.phone) {
      setLocalError("Both email and phone number are required.");
      return;
    }
    setLocalError(null);
    onSubmit(normalized);
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="lead-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
        <span className="lead-modal__eyebrow">ONE QUICK STEP</span>
        <h2 id="lead-modal-title">Before we send your reward</h2>
        <p className="lead-modal__intro">You won. Add your email and phone number so we can deliver your reward.</p>

        <label><span>Email</span><input autoFocus type="email" value={form.email} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: event.target.value })} autoComplete="email" placeholder="you@example.com" /></label>
        <label><span>Phone / WhatsApp</span><input type="tel" value={form.phone} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: event.target.value })} autoComplete="tel" placeholder="+216..." /></label>
        <label className="lead-modal__check"><input type="checkbox" checked={form.marketingOptin} onChange={(event: ChangeEvent<HTMLInputElement>) => setForm({ ...form, marketingOptin: event.target.checked })} /><span>I agree to receive news and offers.</span></label>

        <div className="lead-modal__flow" aria-label="How the flow works"><span>1. You won</span><span>2. Add contacts</span><span>3. Receive reward</span></div>
        <InlineError message={localError || error} />
        <PrimaryButton type="submit" busyLabel={busyLabel}>Continue</PrimaryButton>
        <TextButton type="button" onClick={onClose} disabled={Boolean(busyLabel)}>Cancel</TextButton>
      </form>
    </div>
  );
}
