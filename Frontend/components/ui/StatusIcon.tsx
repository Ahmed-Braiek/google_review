import { CheckIcon, XIcon } from "../icons";

export function StatusIcon({ kind }: { kind: "success" | "expired" }) {
  return (
    <div className={`status-icon status-icon--${kind}`}>
      {kind === "success" ? <CheckIcon /> : <XIcon />}
    </div>
  );
}
