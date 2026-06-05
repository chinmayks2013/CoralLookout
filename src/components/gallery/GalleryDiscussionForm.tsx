"use client";

import { useState, FormEvent, useRef } from "react";
import { ShieldCheck, ImagePlus, X } from "lucide-react";
import { compressImageForGallery } from "@/lib/gallery/image";

interface GalleryDiscussionFormProps {
  disabled?: boolean;
  onPublish: (
    title: string,
    body: string,
    options?: { imageDataUrl?: string; imageRightsConfirmed?: boolean }
  ) => Promise<boolean>;
}

export function GalleryDiscussionForm({
  disabled = false,
  onPublish,
}: GalleryDiscussionFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topicConfirmed, setTopicConfirmed] = useState(false);
  const [imageRightsConfirmed, setImageRightsConfirmed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const compressed = await compressImageForGallery(url);
      setImagePreview(compressed);
      setError(null);
    } catch {
      setError("Could not process that image.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function clearImage() {
    setImagePreview(null);
    setImageRightsConfirmed(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || body.trim().length < 20) {
      setError("Add a title and at least 20 characters in your post.");
      return;
    }
    if (!topicConfirmed) {
      setError("Confirm your topic is coral-related.");
      return;
    }
    if (imagePreview && !imageRightsConfirmed) {
      setError("Confirm you have rights to the attached image.");
      return;
    }

    setSubmitting(true);
    const ok = await onPublish(title, body, {
      imageDataUrl: imagePreview ?? undefined,
      imageRightsConfirmed: imagePreview ? imageRightsConfirmed : undefined,
    });
    setSubmitting(false);
    if (ok) {
      setTitle("");
      setBody("");
      setTopicConfirmed(false);
      setImageRightsConfirmed(false);
      clearImage();
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <input
        type="text"
        placeholder="Thread title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled || submitting}
        maxLength={120}
        className="w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm"
      />

      <textarea
        placeholder="Share your thoughts with the community…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={disabled || submitting}
        maxLength={4000}
        rows={5}
        className="w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm resize-y min-h-[100px]"
      />

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || submitting}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImage(file);
          }}
        />
        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-cyan-500/20 max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Attachment preview"
              className="w-full max-h-40 object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-slate-300 hover:text-white"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || submitting}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 text-sm text-cyan-300 border border-dashed border-cyan-500/30 rounded-lg px-3 py-2 hover:bg-cyan-500/10"
          >
            <ImagePlus className="h-4 w-4" />
            Attach image (optional)
          </button>
        )}
      </div>

      {imagePreview && (
        <label className="flex items-start gap-2 text-xs text-amber-100/90 cursor-pointer">
          <input
            type="checkbox"
            checked={imageRightsConfirmed}
            onChange={(e) => setImageRightsConfirmed(e.target.checked)}
            disabled={disabled || submitting}
            className="mt-0.5 accent-amber-500"
          />
          <span>
            I have the rights to share this attached image (my photo or permission
            from the copyright holder).
          </span>
        </label>
      )}

      <label className="flex items-start gap-2 text-xs text-violet-100/90 cursor-pointer rounded-lg border border-violet-500/25 bg-violet-500/10 p-3">
        <input
          type="checkbox"
          checked={topicConfirmed}
          onChange={(e) => setTopicConfirmed(e.target.checked)}
          disabled={disabled || submitting}
          className="mt-0.5 accent-violet-500"
        />
        <span>
          <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-violet-400" />
          I confirm this post is about corals, reef ecosystems, bleaching,
          restoration, marine biology, or related conservation — not unrelated
          topics.
        </span>
      </label>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={disabled || submitting || !topicConfirmed}
        className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2.5 text-sm font-semibold text-slate-900 disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Post to community (+5 corals)"}
      </button>
    </form>
  );
}
