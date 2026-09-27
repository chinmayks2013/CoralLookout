"use client";

import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Mail,
  Quote,
  Rocket,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BOOK_PILOT_MAILTO } from "@/lib/data/cohorts";
import {
  COURTNEY_TESTIMONIAL,
  DEMO_PATH,
  SCHOOLS_FAQS,
  SCHOOLS_TAGLINE,
  SCHOOL_BENEFITS,
} from "@/lib/data/schools";

export function SchoolsLandingView() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="For schools"
        title="For Schools"
        subtitle={SCHOOLS_TAGLINE}
      />

      <div className="flex flex-wrap justify-center gap-3 mb-14">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900"
        >
          <GraduationCap className="h-4 w-4" />
          Start teacher dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/pilot"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
        >
          Student quick start
        </Link>
        <a
          href={BOOK_PILOT_MAILTO}
          className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 px-6 py-2.5 text-sm font-medium text-teal-200 hover:bg-teal-500/10"
        >
          <Mail className="h-4 w-4" />
          Book a pilot
        </a>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-2">
          What your school gets
        </h2>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-2xl mx-auto">
          Everything students get for free, plus the admin layer teachers and
          administrators actually need to run a program.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCHOOL_BENEFITS.map((benefit) => (
            <article
              key={benefit.title}
              className="glass rounded-xl p-5 border border-cyan-500/15"
            >
              <benefit.icon className="h-7 w-7 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-cyan-100">{benefit.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          <Rocket className="h-5 w-5 text-teal-400" />
          See it in three steps
        </h2>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-2xl mx-auto">
          No sales call required — try the real product path a student and
          teacher would follow.
        </p>
        <ol className="grid gap-4 sm:grid-cols-3">
          {DEMO_PATH.map((step, i) => (
            <li
              key={step.id}
              className="glass rounded-2xl p-5 border border-cyan-500/15 flex flex-col"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-sm font-bold text-slate-900 mb-3">
                {i + 1}
              </span>
              <h3 className="font-semibold text-white mb-1.5">
                {step.label.replace(/^\d+\.\s*/, "")}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1">
                {step.description}
              </p>
              <Link
                href={step.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200 mt-auto"
              >
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-2">
          From an educator
        </h2>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-2xl mx-auto">
          We are collecting pilot feedback as classroom programs wrap up.
        </p>
        <article className="relative glass rounded-2xl p-6 sm:p-8 border border-dashed border-cyan-500/30 max-w-2xl mx-auto">
          <span className="absolute -top-3 left-6 rounded-full bg-amber-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 border border-amber-500/30">
            Placeholder — pending approval
          </span>
          <Quote className="h-6 w-6 text-cyan-400/60 mb-3" />
          <p className="text-slate-300 italic leading-relaxed mb-4">
            &ldquo;{COURTNEY_TESTIMONIAL.quote}&rdquo;
          </p>
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-300">
              {COURTNEY_TESTIMONIAL.name}
            </span>{" "}
            — {COURTNEY_TESTIMONIAL.role}, {COURTNEY_TESTIMONIAL.school}
          </p>
        </article>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold mb-6">
          Frequently asked questions
        </h2>
        <ul className="space-y-4">
          {SCHOOLS_FAQS.map((faq) => (
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
        <h2 className="text-2xl font-bold mb-3">Ready to bring reefs to class?</h2>
        <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
          Start free in demo mode, have students try the quick start, or book
          a pilot and we&apos;ll help you set up founding pricing.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/teacher"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            <GraduationCap className="h-4 w-4" />
            Start teacher dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pilot"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            Student quick start
          </Link>
          <Link
            href="/business"
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 px-6 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/10"
          >
            Pricing & business model
          </Link>
        </div>
      </article>
    </section>
  );
}
