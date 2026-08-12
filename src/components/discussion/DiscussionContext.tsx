import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Users,
} from "lucide-react";

interface DiscussionContextProps {
  community: string;
  slug: string;
  citizens: string;
  knowledgeCount: string;
}

export function DiscussionContext({
  community,
  slug,
  citizens,
  knowledgeCount,
}: DiscussionContextProps) {
  return (
    <aside className="space-y-4">

      {/* Community */}
      <section className="rounded-2xl border bg-white p-5">

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-brand-desert-light
              text-xs font-bold
              text-brand-brown-800
            "
          >
            AI
          </div>

          <div>
            <div className="flex items-center gap-1.5">

              <h2 className="text-sm font-bold text-brand-brown-950">
                {community}
              </h2>

              <ShieldCheck
                size={13}
                className="text-brand-desert-dark"
              />

            </div>

            <p className="text-[10px] text-muted-foreground">
              Canonical community
            </p>
          </div>

        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">

          <Stat
            icon={<Users size={13} />}
            value={citizens}
            label="Citizens"
          />

          <Stat
            icon={<BookOpen size={13} />}
            value={knowledgeCount}
            label="Knowledge"
          />

        </div>

        <Link
          href={`/community/${slug}`}
          className="
            mt-4 flex items-center justify-center gap-1
            rounded-xl
            bg-brand-sand
            px-3 py-2.5
            text-xs font-semibold
            text-brand-brown-800
            hover:bg-brand-desert-light
          "
        >
          Visit community
          <ChevronRight size={14} />
        </Link>

      </section>

      {/* Knowledge opportunity */}
      <section
        className="
          rounded-2xl
          border border-brand-desert-light
          bg-brand-desert-light/30
          p-5
        "
      >

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-desert">
          <BookOpen
            size={15}
            className="text-brand-brown-950"
          />
        </div>

        <h2 className="mt-3 text-sm font-bold text-brand-brown-950">
          Could this become knowledge?
        </h2>

        <p className="mt-1.5 text-[11px] leading-5 text-brand-brown-700">
          Strong discussions can eventually contribute to the permanent
          knowledge of their community.
        </p>

      </section>

    </aside>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-brand-sand p-3">

      <div className="flex items-center gap-1.5 text-brand-brown-600">
        {icon}

        <span className="text-[10px]">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm font-bold text-brand-brown-950">
        {value}
      </p>

    </div>
  );
}