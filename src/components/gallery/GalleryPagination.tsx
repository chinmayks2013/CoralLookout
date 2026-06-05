"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function GalleryPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: GalleryPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-t border-cyan-500/15 bg-slate-950/40">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages} · {totalItems} posts
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 px-3 py-1.5 text-sm text-cyan-300 disabled:opacity-40 hover:bg-cyan-500/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 px-3 py-1.5 text-sm text-cyan-300 disabled:opacity-40 hover:bg-cyan-500/10"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
