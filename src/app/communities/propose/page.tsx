"use client";

import { useState, useId, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Users,
  AlertCircle,
  Sparkles,
  Hash,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { communitiesApi } from "@/lib/api/communities";
import { extractErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/context/AuthContext";
import type { CommunityProposal } from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function CharCount({
  current,
  min,
  max,
}: {
  current: number;
  min: number;
  max: number;
}) {
  const ok = current >= min;
  return (
    <span
      className={`text-[10px] font-medium tabular-nums transition-colors ${
        current === 0
          ? "text-muted-foreground"
          : ok
            ? "text-emerald-600"
            : "text-amber-600"
      }`}
    >
      {current}/{max}
      {current > 0 && current < min && (
        <span className="ml-1 opacity-75">({min - current} more needed)</span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Success screen
// ---------------------------------------------------------------------------

function SuccessScreen({ proposal }: { proposal: CommunityProposal }) {
  return (
    <div className="mx-auto max-w-xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-desert-light to-brand-desert shadow-sm">
        <CheckCircle2 size={36} className="text-brand-brown-800" />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-desert-dark">
        Proposal submitted
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-brown-950">
        {proposal.proposedName} is on its way.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-brand-brown-600">
        Your proposal has been submitted for platform review. We will verify it
        meets our standards and does not duplicate an existing community.
      </p>

      <div className="mx-auto mt-8 grid max-w-sm gap-3 text-left sm:grid-cols-2">
        {[
          {
            icon: <Clock3 size={16} />,
            title: "Under review",
            body: "The platform team will evaluate your proposal.",
          },
          {
            icon: <Users size={16} />,
            title: "First citizen",
            body: "If approved, you become its founding citizen.",
          },
        ].map(({ icon, title, body }) => (
          <div key={title} className="rounded-2xl border bg-white p-4 shadow-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-sand text-brand-brown-700">
              {icon}
            </div>
            <h3 className="mt-3 text-xs font-bold text-brand-brown-950">{title}</h3>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href="/communities"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-brown-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-brown-800 transition-colors"
        >
          Explore communities
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/"
          className="rounded-xl border bg-white px-5 py-2.5 text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand transition-colors"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ProposeCommunityPage() {
  const { isAuthenticated } = useAuth();

  const nameId = useId();
  const slugId = useId();
  const descId = useId();
  const reasonId = useId();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<CommunityProposal | null>(null);

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!slugEdited) {
        setSlug(toSlug(value));
      }
    },
    [slugEdited],
  );

  const handleSlugChange = useCallback((value: string) => {
    setSlugEdited(true);
    setSlug(toSlug(value));
  }, []);

  const nameOk = name.trim().length >= 3;
  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2;
  const descOk = description.trim().length >= 20;
  const reasonOk = reason.trim().length >= 20;
  const canSubmit = nameOk && slugOk && descOk && reasonOk && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await communitiesApi.createProposal({
        name: name.trim(),
        slug,
        description: description.trim(),
        reason: reason.trim(),
      });
      setSubmitted(result);
    } catch (err) {
      setError(extractErrorMessage(err) || "Failed to submit proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[900px] py-12">
          <SuccessScreen proposal={submitted} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[720px]">

        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand-brown-950 transition-colors"
        >
          <ArrowLeft size={14} />
          Communities
        </Link>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-desert/40 bg-brand-desert-light/60 px-3 py-1 text-[11px] font-semibold text-brand-brown-700">
            <Sparkles size={12} className="text-brand-desert-dark" />
            Community Proposal
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-brand-brown-950 sm:text-3xl">
            Propose a new community
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-brand-brown-600">
            Help create a permanent home for a subject that deserves its own
            dedicated space on the platform.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="text-xs font-bold text-amber-900">Sign in required</p>
              <p className="mt-0.5 text-[11px] text-amber-800">
                You must be logged in to submit a community proposal.{" "}
                <Link href="/login" className="font-semibold underline underline-offset-2">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="rounded-2xl border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <label htmlFor={nameId} className="text-sm font-bold text-brand-brown-950">
                  Community name
                </label>
                <CharCount current={name.length} min={3} max={100} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Clear, enduring subject — not a temporary event.
              </p>
              <input
                id={nameId}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Urban Gardening"
                maxLength={100}
                required
                className="mt-3 h-11 w-full rounded-xl border bg-brand-cream/60 px-3.5 text-sm text-brand-brown-950 outline-none placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:bg-white focus:ring-2 focus:ring-brand-desert-light/60 transition-all"
              />
            </div>

            {/* Slug */}
            <div className="rounded-2xl border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <label htmlFor={slugId} className="text-sm font-bold text-brand-brown-950">
                  URL slug
                </label>
                {slugEdited && (
                  <span className="text-[10px] text-brand-brown-600">edited manually</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Auto-generated. Lowercase, numbers, hyphens only.
              </p>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Hash size={12} className="text-muted-foreground" />
                </span>
                <input
                  id={slugId}
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="urban-gardening"
                  maxLength={80}
                  required
                  className="h-11 w-full rounded-xl border bg-brand-cream/60 pl-8 pr-3.5 font-mono text-sm text-brand-brown-950 outline-none placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:bg-white focus:ring-2 focus:ring-brand-desert-light/60 transition-all"
                />
              </div>
              {slug && !slugOk && (
                <p className="mt-1.5 text-[11px] text-rose-600">
                  Must be at least 2 characters: lowercase, numbers, hyphens.
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <label htmlFor={descId} className="text-sm font-bold text-brand-brown-950">
                Short description
              </label>
              <CharCount current={description.length} min={20} max={180} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Shown beneath the community name. What is this community about?
            </p>
            <input
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A community for people who grow food and plants in cities."
              maxLength={180}
              required
              className="mt-3 h-11 w-full rounded-xl border bg-brand-cream/60 px-3.5 text-sm text-brand-brown-950 outline-none placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:bg-white focus:ring-2 focus:ring-brand-desert-light/60 transition-all"
            />
          </div>

          {/* Reason */}
          <div className="rounded-2xl border bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <label htmlFor={reasonId} className="text-sm font-bold text-brand-brown-950">
                Why does this community need to exist?
              </label>
              <CharCount current={reason.length} min={20} max={2000} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Explain the subject, who would benefit, what belongs here, and why it
              deserves its own canonical community.
            </p>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="This community is for people interested in growing food and plants in urban environments — balconies, rooftops, indoor spaces, and shared city plots. It focuses on practical knowledge, community experiences, and sustainable urban food systems..."
              rows={7}
              maxLength={2000}
              required
              className="mt-3 w-full resize-none rounded-xl border bg-brand-cream/60 p-3.5 text-sm leading-6 text-brand-brown-950 outline-none placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:bg-white focus:ring-2 focus:ring-brand-desert-light/60 transition-all"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "What subject does it represent?",
                "Who would participate?",
                "What contributions belong here?",
              ].map((hint) => (
                <span
                  key={hint}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-sand-dark bg-brand-cream px-2.5 py-0.5 text-[10px] text-brand-brown-600"
                >
                  <span className="text-brand-desert-dark">•</span>
                  {hint}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 animate-in fade-in">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
              <p className="text-xs text-rose-800">{error}</p>
            </div>
          )}

          {/* Footer bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-white px-5 py-4 shadow-xs">
            <p className="max-w-xs text-[11px] leading-5 text-muted-foreground">
              Proposing a community does not give you administrative control.
              Approved communities belong to their citizens.
            </p>

            <button
              type="submit"
              disabled={!canSubmit || !isAuthenticated}
              id="submit-proposal-btn"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-brown-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-brown-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-desert disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit Proposal
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}
