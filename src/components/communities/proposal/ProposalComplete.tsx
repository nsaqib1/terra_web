"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";
import Link from "next/link";

interface ProposalCompleteProps {
  name: string;
}

export function ProposalComplete({
  name,
}: ProposalCompleteProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">

      <div
        className="
          mx-auto flex h-16 w-16
          items-center justify-center
          rounded-2xl
          bg-brand-desert-light
        "
      >
        <CheckCircle2
          size={30}
          className="text-brand-brown-800"
        />
      </div>

      <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-desert-dark">
        Proposal submitted
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-brown-950">
        {name || "Your community"} is on its way.
      </h1>

      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-brand-brown-600">
        Your proposal has been submitted for review. We'll check that
        the subject has a clear purpose, meets our community standards,
        and doesn't duplicate an existing canonical community.
      </p>

      <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-2">

        <StatusCard
          icon={<Clock3 size={17} />}
          title="Under review"
          description="The platform will review your proposal."
        />

        <StatusCard
          icon={<Users size={17} />}
          title="First citizen"
          description="If approved, you'll become its first citizen."
        />

      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">

        <Link
          href="/communities"
          className="
            inline-flex items-center gap-2
            rounded-xl
            bg-brand-brown-950
            px-4 py-2.5
            text-xs font-semibold
            text-white
            hover:bg-brand-brown-800
          "
        >
          Explore communities
          <ArrowRight size={14} />
        </Link>

        <Link
          href="/home"
          className="
            rounded-xl
            border
            bg-white
            px-4 py-2.5
            text-xs font-semibold
            text-brand-brown-800
            hover:bg-brand-sand
          "
        >
          Return home
        </Link>

      </div>

    </div>
  );
}

function StatusCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-sand text-brand-brown-700">
        {icon}
      </div>

      <h3 className="mt-3 text-xs font-bold text-brand-brown-950">
        {title}
      </h3>

      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}