"use client";

import { Award } from "lucide-react";

interface CertificateCardProps {
  learnerName: string;
  onViewFull?: () => void;
}

export function CertificateCard({ learnerName, onViewFull }: CertificateCardProps) {
  return (
    <article className="glass rounded-2xl p-6 sm:p-8 text-center">
      <Award className="mx-auto h-10 w-10 text-teal-400 mb-3" />
      <h3 className="text-xl font-bold text-teal-200 mb-1">
        Certificate earned!
      </h3>
      <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
        Congratulations, {learnerName}. You completed the Save Our Coral Reefs
        guide and earned your official certificate.
      </p>
      {onViewFull && (
        <button
          type="button"
          onClick={onViewFull}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-teal-400 px-8 py-3 text-sm font-semibold text-slate-900 hover:opacity-90"
        >
          View &amp; print certificate
        </button>
      )}
    </article>
  );
}
