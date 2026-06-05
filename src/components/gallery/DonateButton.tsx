"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { DonateModal } from "./DonateModal";

interface DonateButtonProps {
  postId: string;
  authorId: string;
  locationName: string;
  maxCorals: number;
  disabled?: boolean;
  label?: string;
  className?: string;
  onDonate: (
    postId: string,
    amount: number,
    authorId: string
  ) => Promise<boolean>;
}

export function DonateButton({
  postId,
  authorId,
  locationName,
  maxCorals,
  disabled = false,
  label = "Donate",
  className = "",
  onDonate,
}: DonateButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-1 rounded-lg border border-teal-500/40 px-3 py-2 text-sm text-teal-300 hover:bg-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        <Heart className="h-4 w-4" />
        {label}
      </button>
      <DonateModal
        open={open}
        locationName={locationName}
        maxCorals={maxCorals}
        disabled={disabled}
        onClose={() => setOpen(false)}
        onDonate={(amount) => onDonate(postId, amount, authorId)}
      />
    </>
  );
}
