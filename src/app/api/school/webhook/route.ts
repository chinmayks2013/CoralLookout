import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fetchChapterById, updateChapterSubscription } from "@/lib/school/db";
import { getStripe, isStripeConfigured } from "@/lib/school/stripe";
import type { SubscriptionStatus } from "@/lib/school/types";

export const runtime = "nodejs";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    default:
      return "inactive";
  }
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  chapterIdFromMeta?: string
) {
  const chapterId =
    chapterIdFromMeta ||
    subscription.metadata.chapterId ||
    subscription.items.data[0]?.metadata?.chapterId;

  if (!chapterId) return;

  const periodEndUnix = (
    subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;
  const periodEnd = periodEndUnix
    ? new Date(periodEndUnix * 1000).toISOString()
    : null;

  await updateChapterSubscription({
    chapterId,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: mapStripeStatus(subscription.status),
    subscriptionCurrentPeriodEnd: periodEnd,
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET missing" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const chapterId = session.metadata?.chapterId;
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        if (chapterId) {
          const periodEndUnix = (
            subscription as Stripe.Subscription & { current_period_end?: number }
          ).current_period_end;
          const periodEnd = periodEndUnix
            ? new Date(periodEndUnix * 1000).toISOString()
            : null;

          await updateChapterSubscription({
            chapterId,
            stripeCustomerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer.id,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: mapStripeStatus(subscription.status),
            subscriptionCurrentPeriodEnd: periodEnd,
          });
        } else {
          await syncSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
