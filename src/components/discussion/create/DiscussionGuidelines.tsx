import {
  CheckCircle2,
  Hash,
  Lightbulb,
  Search,
} from "lucide-react";

export function DiscussionGuidelines() {
  return (
    <aside className="space-y-4">

      {/* Tips */}
      <section className="rounded-2xl border bg-white p-5">

        <div className="flex items-center gap-2">
          <Lightbulb
            size={16}
            className="text-brand-desert-dark"
          />

          <h2 className="text-sm font-bold text-brand-brown-950">
            Start a useful discussion
          </h2>
        </div>

        <div className="mt-4 space-y-4">

          <Guideline
            icon={<Search size={14} />}
            title="Search first"
            description="Check whether your question has already been discussed."
          />

          <Guideline
            icon={<Hash size={14} />}
            title="Use meaningful contexts"
            description="Use hashtags to describe the relevant context."
          />

          <Guideline
            icon={<CheckCircle2 size={14} />}
            title="Add something useful"
            description="Questions with enough context usually lead to better contributions."
          />

        </div>

      </section>

      {/* Community principle */}
      <section
        className="
          rounded-2xl
          border border-brand-desert-light
          bg-brand-desert-light/30
          p-5
        "
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-desert">
          <span>🐪</span>
        </div>

        <h2 className="mt-3 text-sm font-bold text-brand-brown-950">
          Build the community's history
        </h2>

        <p className="mt-2 text-[11px] leading-5 text-brand-brown-700">
          Great discussions don't disappear into a feed. Useful
          contributions can eventually become part of the community's
          permanent knowledge.
        </p>
      </section>

    </aside>
  );
}

function Guideline({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">

      <div
        className="
          flex h-7 w-7 shrink-0
          items-center justify-center
          rounded-lg
          bg-brand-sand
          text-brand-brown-700
        "
      >
        {icon}
      </div>

      <div>
        <h3 className="text-xs font-bold text-brand-brown-900">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>

    </div>
  );
}