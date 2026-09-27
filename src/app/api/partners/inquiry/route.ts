import { NextResponse } from "next/server";
import { insertPartnerLead } from "@/lib/partners/leads";
import { CALENDAR_BOOKING_URL, BOOK_PILOT_EMAIL } from "@/lib/data/cohorts";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

// No mailer is wired up here — we just store the lead and hand the client
// an auto-reply subject/body (for a confirmation UI) plus a mailto link so
// staff can respond manually until an email provider is configured.
export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      name: string;
      email: string;
      organization?: string;
      role?: string;
      interest?: string;
      message?: string;
      source?: string;
    };

    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json({ error: "Missing name or email" }, { status: 400 });
    }

    const lead = await insertPartnerLead(body);

    const subject = "Thanks for reaching out to Coral Lookout";
    const autoReplyBody = `Hi ${lead.name.split(" ")[0] || lead.name},

Thanks for your interest in Coral Lookout${lead.organization ? ` on behalf of ${lead.organization}` : ""}. Our team will follow up within 1-2 business days.

${CALENDAR_BOOKING_URL ? `Prefer to just grab time now? Book here: ${CALENDAR_BOOKING_URL}` : "We'll send a scheduling link shortly."}

— Coral Lookout team`;

    const staffMailto = `mailto:${BOOK_PILOT_EMAIL}?subject=${encodeURIComponent(
      `New partner inquiry — ${lead.name}`
    )}&body=${encodeURIComponent(
      `Name: ${lead.name}\nEmail: ${lead.email}\nOrganization: ${lead.organization ?? ""}\nRole: ${lead.role ?? ""}\nInterest: ${lead.interest ?? ""}\nMessage: ${lead.message ?? ""}`
    )}`;

    return NextResponse.json({
      ok: true,
      lead,
      autoReply: {
        subject,
        body: autoReplyBody,
        calendarUrl: CALENDAR_BOOKING_URL,
        staffMailto,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to submit inquiry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
