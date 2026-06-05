"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Mail,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  BUSINESS_TAGLINE,
  PRICING_TIERS,
  REVENUE_STREAMS,
  SUSTAINABILITY_POINTS,
  BUSINESS_FAQS,
  PILOT_METRICS,
} from "@/lib/data/business-model";

export function BusinessModelView() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Sustainable impact"
        title="Business Model"
        subtitle={BUSINESS_TAGLINE}
      />

      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
        {PILOT_METRICS.map((m) => (
          <div
            key={m.label}
            className="glass rounded-xl p-4 text-center border border-cyan-500/15"
          >
            <p className="text-lg sm:text-xl font-bold text-teal-300">{m.value}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-1">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-center mb-2">Pricing tiers</h2>
      <p className="text-sm text-slate-400 text-center mb-8 max-w-xl mx-auto">
        Three paths: free community for everyone, paid tools for schools, and
        partnerships for science and conservation.
      </p>

      <div className="grid gap-6 lg:grid-cols-3 mb-16">
        {PRICING_TIERS.map((tier) => (
          <article
            key={tier.id}
            className={`relative flex flex-col rounded-2xl p-6 border ${
              tier.highlighted
                ? "border-teal-400/50 bg-gradient-to-b from-teal-500/15 to-slate-900/50 shadow-lg shadow-teal-500/10"
                : "border-cyan-500/15 glass"
            }`}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
                Most popular
              </span>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
              {tier.audience}
            </p>
            <h3 className="text-xl font-bold mt-1">{tier.name}</h3>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{tier.price}</span>
              <span className="text-sm text-slate-400">{tier.priceDetail}</span>
            </p>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              {tier.description}
            </p>
            <ul className="mt-5 space-y-2 flex-1">
              {tier.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 ${
                tier.highlighted
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900"
                  : "border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              }`}
            >
              {tier.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-400" />
          Revenue streams
        </h2>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-2xl mx-auto">
          Diversified income keeps student access free while funding AI, hosting,
          and map infrastructure.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {REVENUE_STREAMS.map((stream) => (
            <article
              key={stream.title}
              className="glass rounded-xl p-5 border border-cyan-500/10"
            >
              <stream.icon className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-cyan-100">{stream.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {stream.description}
              </p>
              <p className="text-xs text-teal-400/90 mt-3 font-medium">
                {stream.shareLabel}
              </p>
            </article>
          ))}
        </div>
      </div>

      <article className="glass rounded-2xl p-8 mb-16 border border-violet-500/20">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          How we stay mission-aligned
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {SUSTAINABILITY_POINTS.map((point) => (
            <div key={point.title}>
              <h3 className="font-semibold text-violet-200">{point.title}</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </article>

      <div className="mb-16">
        <h2 className="text-xl font-bold mb-6">Questions judges ask</h2>
        <ul className="space-y-4">
          {BUSINESS_FAQS.map((faq) => (
            <li
              key={faq.question}
              className="glass rounded-xl p-5 border border-cyan-500/10"
            >
              <h3 className="font-medium text-cyan-200">{faq.question}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {faq.answer}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <article className="rounded-2xl bg-gradient-to-r from-cyan-600/30 via-teal-600/20 to-violet-600/30 border border-cyan-500/30 p-8 sm:p-10 text-center">
        <h2 className="text-2xl font-bold mb-3">Pilot a school chapter</h2>
        <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
          Teachers can subscribe at $49/month on the dashboard. Early schools can
          still reach out for founding-partner pricing during beta.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/teacher"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            <GraduationCap className="h-4 w-4" />
            School pilot — $49/mo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/community?partner=inquiry"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            <Mail className="h-4 w-4" />
            NGO / research inquiry
          </Link>
        </div>
      </article>
    </section>
  );
}
