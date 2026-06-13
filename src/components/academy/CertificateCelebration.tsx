"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, X } from "lucide-react";
import { CertificateDocument } from "@/components/academy/CertificateDocument";
import { fireCertificateConfetti } from "@/lib/academy/confetti";

interface CertificateCelebrationProps {
  open: boolean;
  onClose: () => void;
  learnerName: string;
  issuedAt?: string;
  allowNameEdit?: boolean;
  onNameConfirm?: (name: string) => void;
}

export function CertificateCelebration({
  open,
  onClose,
  learnerName,
  issuedAt,
  allowNameEdit = false,
  onNameConfirm,
}: CertificateCelebrationProps) {
  const [displayName, setDisplayName] = useState(learnerName);

  useEffect(() => {
    setDisplayName(learnerName);
  }, [learnerName]);

  useEffect(() => {
    if (!open) return;
    fireCertificateConfetti();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handlePrint() {
    document.body.classList.add("printing-certificate");
    window.print();
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("printing-certificate"),
      { once: true }
    );
  }

  function handleClose() {
    if (allowNameEdit && displayName.trim() && onNameConfirm) {
      onNameConfirm(displayName.trim());
    }
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="certificate-modal fixed inset-0 z-[100] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Certificate earned"
        >
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={handleClose}
            aria-hidden
          />

          {/* Scrollable certificate area */}
          <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 pt-6 pb-28 sm:px-6 sm:pt-8">
            <div className="mx-auto w-full max-w-4xl">
              <p className="certificate-modal-chrome text-center text-base sm:text-xl font-semibold text-teal-200 mb-4 pr-10">
                Congratulations! You earned your certificate!
              </p>

              <CertificateDocument
                learnerName={displayName}
                issuedAt={issuedAt}
                editableName={allowNameEdit}
                onNameChange={setDisplayName}
              />

              <p className="certificate-modal-chrome text-center text-xs text-slate-500 mt-4">
                Use the buttons below to print or close.
              </p>
            </div>
          </div>

          {/* Sticky action bar — always visible */}
          <div className="certificate-modal-chrome relative z-20 shrink-0 border-t border-teal-500/20 bg-slate-950/95 px-4 py-4 backdrop-blur-md">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:opacity-90"
              >
                <Printer className="h-4 w-4" />
                Print certificate
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-6 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
