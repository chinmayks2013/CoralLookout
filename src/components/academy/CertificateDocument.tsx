"use client";

import { Printer, X } from "lucide-react";
import { Great_Vibes, Playfair_Display } from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export interface CertificateDocumentProps {
  learnerName: string;
  issuedAt?: string;
  onNameChange?: (name: string) => void;
  editableName?: boolean;
}

export function CertificateDocument({
  learnerName,
  issuedAt,
  onNameChange,
  editableName = false,
}: CertificateDocumentProps) {
  const dateStr = issuedAt
    ? new Date(issuedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const displayName = learnerName.trim() || "Your Name";

  return (
    <article
      id="certificate-print-root"
      className="certificate-sheet relative mx-auto overflow-hidden rounded-lg shadow-2xl shadow-black/40 [container-type:inline-size]"
      style={{
        aspectRatio: "11 / 8.5",
        height: "min(42dvh, 520px)",
        width: "min(100%, calc(min(42dvh, 520px) * 11 / 8.5))",
      }}
    >
      <img
        src="/certificates/certificate-template.png"
        alt=""
        className="certificate-bg absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />

      {/* Recipient name — on the gold line */}
      <div
        className="certificate-name-slot absolute left-1/2 -translate-x-1/2 flex items-end justify-center"
        style={{ top: "37%", width: "58%", height: "7%" }}
      >
        {editableName && onNameChange ? (
          <input
            type="text"
            value={learnerName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your name"
            className={`certificate-recipient-name ${greatVibes.className} w-full bg-transparent text-center text-[#1a365d] focus:outline-none placeholder:text-[#1a365d]/40`}
            aria-label="Certificate recipient name"
          />
        ) : (
          <p
            className={`certificate-recipient-name ${greatVibes.className} w-full text-center text-[#1a365d] truncate px-2`}
          >
            {displayName}
          </p>
        )}
      </div>

      {/* Issue date — replaces template placeholder date */}
      <p
        className={`certificate-issue-date ${playfair.className} absolute text-center font-semibold text-[#1a365d] leading-tight`}
        style={{
          bottom: "13.5%",
          right: "12%",
          width: "20%",
        }}
      >
        {dateStr}
      </p>
    </article>
  );
}

export function CertificateActions({
  onPrint,
  className = "",
}: {
  onPrint: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-3 justify-center print:hidden ${className}`}>
      <button
        type="button"
        onClick={onPrint}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:opacity-90"
      >
        <Printer className="h-4 w-4" />
        Print certificate
      </button>
    </div>
  );
}

export function CertificateCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute -top-2 -right-2 z-20 rounded-full bg-slate-900/90 p-2 text-slate-300 hover:text-white hover:bg-slate-800 print:hidden sm:top-0 sm:right-0"
      aria-label="Close certificate"
    >
      <X className="h-5 w-5" />
    </button>
  );
}
