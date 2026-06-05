import { NextResponse } from "next/server";
import { fetchChapterById } from "@/lib/school/db";
import { getAppBaseUrl, getStripe, isStripeConfigured } from "@/lib/school/stripe";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_SCHOOL_PRICE_ID to .env.local.",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      chapterId: string;
      teacherUserId: string;
      teacherEmail: string;
    };

    if (!body.chapterId || !body.teacherUserId || !body.teacherEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const chapter = await fetchChapterById(body.chapterId);
    if (!chapter || chapter.teacherUserId !== body.teacherUserId) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const stripe = getStripe();
    const baseUrl = getAppBaseUrl();
    const priceId = process.env.STRIPE_SCHOOL_PRICE_ID!.trim();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: body.teacherEmail.trim(),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/teacher?checkout=success`,
      cancel_url: `${baseUrl}/teacher?checkout=canceled`,
      metadata: {
        chapterId: chapter.id,
        teacherUserId: body.teacherUserId,
      },
      subscription_data: {
        metadata: {
          chapterId: chapter.id,
          teacherUserId: body.teacherUserId,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
