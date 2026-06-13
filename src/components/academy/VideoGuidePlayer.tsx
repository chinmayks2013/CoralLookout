"use client";

import type { GuideLesson } from "@/lib/academy/types";

interface VideoGuidePlayerProps {
  lesson: GuideLesson;
  onContinue: () => void | Promise<void>;
}

export function VideoGuidePlayer({ lesson, onContinue }: VideoGuidePlayerProps) {
  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900">
        <iframe
          title={lesson.title}
          src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{lesson.description}</p>
      <button
        type="button"
        onClick={() => void onContinue()}
        className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-semibold text-slate-900"
      >
        Continue to quiz
      </button>
    </div>
  );
}
