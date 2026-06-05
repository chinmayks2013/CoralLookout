"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Gem, Heart, X } from "lucide-react";

const PRESET_AMOUNTS = [1, 5, 10, 50, 100] as const;

export function parseDonationAmount(
  raw: string,
  maxCorals: number
): { ok: true; amount: number } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter an amount" };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: "Must be a whole number (no decimals)" };
  }
  const amount = Number.parseInt(trimmed, 10);
  if (amount < 1) {
    return { ok: false, error: "Must be at least 1 coral" };
  }
  if (amount > maxCorals) {
    return {
      ok: false,
      error: `You only have ${maxCorals} coral${maxCorals === 1 ? "" : "s"}`,
    };
  }
  return { ok: true, amount };
}

interface DonateModalProps {
  open: boolean;
  locationName: string;
  maxCorals: number;
  disabled?: boolean;
  onClose: () => void;
  onDonate: (amount: number) => Promise<boolean>;
}

export function DonateModal({
  open,
  locationName,
  maxCorals,
  disabled = false,
  onClose,
  onDonate,
}: DonateModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const availablePresets = useMemo(
    () => PRESET_AMOUNTS.filter((n) => n <= maxCorals),
    [maxCorals]
  );

  const effectiveAmount = useMemo(() => {
    if (customAmount.trim()) {
      const parsed = parseDonationAmount(customAmount, maxCorals);
      return parsed.ok ? parsed.amount : null;
    }
    return selectedPreset;
  }, [customAmount, selectedPreset, maxCorals]);

  useEffect(() => {
    if (!open) return;
    setSelectedPreset(availablePresets[0] ?? null);
    setCustomAmount("");
    setError(null);
    setSubmitting(false);
  }, [open, availablePresets]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPreset(null);
    setError(null);
    if (!value.trim()) return;
    const parsed = parseDonationAmount(value, maxCorals);
    if (!parsed.ok) setError(parsed.error);
  };

  const handlePreset = (amount: number) => {
    setCustomAmount("");
    setSelectedPreset(amount);
    setError(null);
  };

  const handleSubmit = async () => {
    if (disabled || submitting || maxCorals < 1) return;

    let amount: number;
    if (customAmount.trim()) {
      const parsed = parseDonationAmount(customAmount, maxCorals);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      amount = parsed.amount;
    } else if (selectedPreset !== null) {
      amount = selectedPreset;
    } else {
      setError("Choose an amount or enter your own");
      return;
    }

    setSubmitting(true);
    setError(null);
    const ok = await onDonate(amount);
    setSubmitting(false);
    if (ok) onClose();
    else setError("Donation failed. Try again.");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <article className="glass rounded-2xl max-w-md w-full max-h-[min(90dvh,640px)] overflow-y-auto p-5 sm:p-6 shadow-xl">
        <header className="flex justify-between items-start gap-3 mb-4">
          <div>
            <h2 id="donate-modal-title" className="text-lg font-bold">
              Donate corals
            </h2>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{locationName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <p className="flex items-center gap-2 text-sm text-teal-300 mb-5">
          <Gem className="h-4 w-4" />
          You have <span className="font-semibold">{maxCorals}</span> coral
          {maxCorals === 1 ? "" : "s"}
        </p>

        {maxCorals < 1 ? (
          <p className="text-sm text-slate-400">
            Earn corals by posting and commenting before you can donate.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-300 mb-3">Choose an amount</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {PRESET_AMOUNTS.map((n) => {
                const affordable = n <= maxCorals;
                const active =
                  affordable &&
                  selectedPreset === n &&
                  !customAmount.trim();
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={!affordable || disabled || submitting}
                    onClick={() => handlePreset(n)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-teal-500 text-slate-900"
                        : affordable
                          ? "border border-teal-500/40 text-teal-300 hover:bg-teal-500/10"
                          : "border border-slate-600 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    {n} coral{n === 1 ? "" : "s"}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-slate-400 mb-2">Or input your own amount</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={`1–${maxCorals}`}
              disabled={disabled || submitting}
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2.5 text-sm mb-1"
            />
            <p className="text-xs text-slate-500 mb-4">
              Whole numbers only, up to your balance ({maxCorals}).
            </p>

            {error && (
              <p className="text-sm text-red-400 mb-3" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={
                disabled ||
                submitting ||
                maxCorals < 1 ||
                effectiveAmount === null
              }
              onClick={() => void handleSubmit()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="h-4 w-4" />
              {submitting
                ? "Donating…"
                : effectiveAmount !== null
                  ? `Donate ${effectiveAmount} coral${effectiveAmount === 1 ? "" : "s"}`
                  : "Donate"}
            </button>
          </>
        )}
      </article>
    </div>,
    document.body
  );
}
