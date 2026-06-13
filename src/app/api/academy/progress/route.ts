import { NextResponse } from "next/server";
import { getGuideModule } from "@/lib/academy/course";
import {
  fetchLearnerProgress,
  markVideoWatched,
  submitQuizResult,
} from "@/lib/academy/db";
import { scoreQuiz } from "@/lib/academy/types";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ progress: null, cloudEnabled: false });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const progress = await fetchLearnerProgress(userId);
    return NextResponse.json({ progress, cloudEnabled: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load progress";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      action: "watch" | "quiz";
      userId: string;
      displayName: string;
      email?: string | null;
      school?: string | null;
      moduleId: string;
      answers?: Record<number, number>;
    };

    const { action, userId, displayName, email, school, moduleId } = body;
    if (!userId || !displayName || !moduleId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const moduleDef = getGuideModule(moduleId);
    if (!moduleDef) {
      return NextResponse.json({ error: "Unknown module" }, { status: 404 });
    }

    if (action === "watch") {
      const moduleProgress = await markVideoWatched({
        userId,
        displayName,
        email,
        school,
        moduleId,
      });
      return NextResponse.json({ module: moduleProgress });
    }

    if (action === "quiz") {
      if (!body.answers || typeof body.answers !== "object") {
        return NextResponse.json({ error: "Missing quiz answers" }, { status: 400 });
      }

      const result = scoreQuiz(moduleDef.quiz, body.answers);
      const { module, certificateCode, certificateIssuedAt } =
        await submitQuizResult({
          userId,
          displayName,
          email,
          school,
          moduleId,
          score: result.score,
          passed: result.passed,
        });

      return NextResponse.json({
        module,
        result,
        certificateCode,
        certificateIssuedAt,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Progress update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
