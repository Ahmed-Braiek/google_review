import { ChevronLeftIcon } from "../icons";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = "Go back" }: BackButtonProps) {
  return (
    <button className="back-button" type="button" onClick={onClick} aria-label={label}>
      <ChevronLeftIcon />
    </button>
  );
}
