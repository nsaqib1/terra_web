"use client";

import {
  CheckCircle2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";

interface ProposalStepIdentityProps {
  name: string;
  onNameChange: (name: string) => void;
}

export function ProposalStepIdentity({
  name,
  onNameChange,
}: ProposalStepIdentityProps) {
  const [checked, setChecked] = useState(false);

  const hasName = name.trim().length >= 3;

  return (
    <div className="space-y-7">

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
          Step 1
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-brown-950">
          What should this community be called?
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-brand-brown-600">
          Choose a clear name that represents a lasting field of interest,
          subject, discipline, or shared pursuit.
        </p>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="community-name"
          className="text-sm font-semibold text-brand-brown-900"
        >
          Community name
        </label>

        <div className="relative mt-2">
          <input
            id="community-name"
            value={name}
            onChange={(event) => {
              onNameChange(event.target.value);
              setChecked(false);
            }}
            placeholder="e.g. Urban Gardening"
            className="
              h-12 w-full rounded-xl border
              bg-white px-4
              text-sm text-brand-brown-950
              outline-none
              placeholder:text-brand-brown-600/50
              focus:border-brand-desert-dark
              focus:ring-4
              focus:ring-brand-desert-light/50
            "
          />
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Use the subject itself rather than a temporary event or specific
          discussion.
        </p>
      </div>

      {/* Duplicate check */}
      <div className="rounded-2xl border bg-brand-cream p-4">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-sand">
            <Search
              size={17}
              className="text-brand-brown-700"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-brand-brown-950">
              Check whether this community already exists
            </h2>

            <p className="mt-1 text-xs leading-5 text-brand-brown-600">
              We try to maintain one canonical community for each enduring
              subject. Searching first helps prevent duplicates.
            </p>

            <button
              type="button"
              disabled={!hasName}
              onClick={() => setChecked(true)}
              className="
                mt-3 inline-flex items-center gap-2
                rounded-lg
                bg-brand-brown-950
                px-3 py-2
                text-xs font-semibold
                text-white
                transition-colors
                hover:bg-brand-brown-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Check for existing communities
            </button>
          </div>

        </div>

        {checked && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">

            <div className="flex items-start gap-2">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <div>
                <p className="text-xs font-bold text-emerald-900">
                  No obvious duplicate found
                </p>

                <p className="mt-1 text-[11px] leading-5 text-emerald-800">
                  Our review system did not find a canonical community
                  that clearly covers this subject. Final verification
                  happens during platform review.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Important rule */}
      <div className="flex gap-3 rounded-xl bg-brand-sand p-4">

        <ShieldAlert
          size={17}
          className="mt-0.5 shrink-0 text-brand-desert-dark"
        />

        <p className="text-xs leading-5 text-brand-brown-700">
          A proposal does not give you ownership of the community.
          If approved, you become its <strong>first citizen</strong>,
          while the community belongs to everyone who contributes to it.
        </p>

      </div>

    </div>
  );
}