import { NextResponse } from "next/server";
import { fetchChapterById } from "@/lib/school/db";
import { getAppBaseUrl, getStripe, isStripeConfigured } from "@/lib/school/stripe";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      chapterId: string;
      teacherUserId: string;
    };

    if (!body.chapterId || !body.teacherUserId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const chapter = await fetchChapterById(body.chapterId);
    if (!chapter || chapter.teacherUserId !== body.teacherUserId) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    if (!chapter.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account yet. Subscribe first." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: chapter.stripeCustomerId,
      return_url: `${getAppBaseUrl()}/teacher`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Portal failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
