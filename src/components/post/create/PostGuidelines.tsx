import {
  Bookmark,
  CheckCircle2,
  Lightbulb,
  Search,
} from "lucide-react";

export function PostGuidelines() {
  return (
    <aside className="space-y-4">
      <section className="-mx-4 rounded-none border-y bg-white p-5 sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center gap-2">
          <Lightbulb
            size={16}
            className="text-brand-desert-dark"
          />

          <h2 className="text-sm font-bold text-brand-brown-950">
            Write a useful post
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <Guideline
            icon={<Search size={14} />}
            title="Search first"
            description="See whether this community already has a post on the same question."
          />

          <Guideline
            icon={<Bookmark size={14} />}
            title="Mark the context"
            description="Choose a few relevant topics. If the right one does not exist, create it for this community."
          />

          <Guideline
            icon={<CheckCircle2 size={14} />}
            title="Say enough"
            description="Skip the title. Put the whole thought in the post so others can respond."
          />
        </div>
      </section>

      <section
        className="
          -mx-4 rounded-none
          border-y border-brand-desert-light
          bg-brand-desert-light/30
          p-5
          sm:mx-0 sm:rounded-2xl sm:border
        "
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-desert">
          <span>🐪</span>
        </div>

        <h2 className="mt-3 text-sm font-bold text-brand-brown-950">
          Build the community&apos;s history
        </h2>

        <p className="mt-2 text-[11px] leading-5 text-brand-brown-700">
          Useful posts stay with the community. They become part of a
          permanent home for this subject — not a post that vanishes in a
          personal feed.
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
