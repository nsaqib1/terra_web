import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Users,
} from "lucide-react";

const communities = [
  {
    name: "Artificial Intelligence",
    citizens: "2.4M",
    initials: "AI",
  },
  {
    name: "Photography",
    citizens: "1.8M",
    initials: "PH",
  },
  {
    name: "Gardening",
    citizens: "680K",
    initials: "GA",
  },
];

const discussions = [
  {
    title: "The future of AI agents",
    contributions: "1.2K",
    community: "Artificial Intelligence",
  },
  {
    title: "What makes a photograph timeless?",
    contributions: "842",
    community: "Photography",
  },
  {
    title: "What gardening skill took you years to learn?",
    contributions: "618",
    community: "Gardening",
  },
];

const knowledge = [
  {
    title: "Understanding RAG",
    community: "Artificial Intelligence",
    updated: "2h ago",
  },
  {
    title: "The fundamentals of composition",
    community: "Photography",
    updated: "5h ago",
  },
];

export function RightSidebar() {
  return (
    <aside className="hidden w-[280px] shrink-0 xl:block">
      <div className="sticky top-20 space-y-6">

        {/* Discover Communities */}
        <section>
          <SectionHeader
            icon={<Users size={16} />}
            title="Discover Communities"
            href="/communities"
          />

          <div className="mt-3 space-y-2">
            {communities.map((community) => (
              <Link
                key={community.name}
                href="#"
                className="
                  group flex items-center gap-3
                  rounded-xl p-2.5
                  transition-colors
                  hover:bg-brand-sand
                "
              >
                <div
                  className="
                    flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-xl
                    bg-brand-desert-light
                    text-[10px] font-bold
                    text-brand-brown-800
                  "
                >
                  {community.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-brown-900">
                    {community.name}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {community.citizens} citizens
                  </p>
                </div>

                <ChevronRight
                  size={15}
                  className="
                    text-muted-foreground
                    opacity-0
                    transition-all
                    group-hover:translate-x-0.5
                    group-hover:opacity-100
                  "
                />
              </Link>
            ))}
          </div>

          <Link
            href="/communities"
            className="
              mt-2 flex items-center justify-center gap-1
              rounded-lg py-2
              text-xs font-semibold
              text-brand-brown-700
              hover:bg-brand-sand
            "
          >
            Explore all communities
            <ArrowUpRight size={13} />
          </Link>
        </section>

        {/* Trending Discussions */}
        <section>
          <SectionHeader
            icon={<TrendingUp size={16} />}
            title="Trending Discussions"
          />

          <div className="mt-3 space-y-1">
            {discussions.map((discussion, index) => (
              <Link
                key={discussion.title}
                href="#"
                className="
                  group block rounded-xl p-3
                  transition-colors
                  hover:bg-brand-sand
                "
              >
                <div className="flex gap-3">
                  <span
                    className="
                      pt-0.5 text-xs font-bold
                      text-brand-desert-dark
                    "
                  >
                    0{index + 1}
                  </span>

                  <div className="min-w-0">
                    <p
                      className="
                        text-sm font-semibold leading-5
                        text-brand-brown-900
                        group-hover:text-brand-brown-950
                      "
                    >
                      {discussion.title}
                    </p>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {discussion.contributions} contributions
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Community Knowledge */}
        <section>
          <SectionHeader
            icon={<BookOpen size={16} />}
            title="Community Knowledge"
            href="/knowledge"
          />

          <div className="mt-3 space-y-2">
            {knowledge.map((item) => (
              <Link
                key={item.title}
                href="#"
                className="
                  block rounded-xl border bg-white p-3
                  transition-all
                  hover:border-brand-desert
                  hover:shadow-sm
                "
              >
                <p className="text-sm font-semibold text-brand-brown-900">
                  {item.title}
                </p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-muted-foreground">
                    {item.community}
                  </span>

                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {item.updated}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/knowledge"
            className="
              mt-2 flex items-center justify-center gap-1
              rounded-lg py-2
              text-xs font-semibold
              text-brand-brown-700
              hover:bg-brand-sand
            "
          >
            Browse knowledge
            <ArrowUpRight size={13} />
          </Link>
        </section>

        {/* Philosophy card */}
        <section
          className="
            overflow-hidden rounded-2xl
            border border-brand-desert-light
            bg-brand-desert-light/40
            p-4
          "
        >
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-desert">
            <span className="text-sm">🐪</span>
          </div>

          <h3 className="text-sm font-bold text-brand-brown-950">
            Every interest deserves a home.
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-brand-brown-700">
            Communities are shared institutions built by the people who
            contribute to them.
          </p>

          <Link
            href="/about"
            className="
              mt-3 inline-flex items-center gap-1
              text-xs font-bold
              text-brand-brown-900
              hover:underline
            "
          >
            Learn about our vision
            <ArrowUpRight size={12} />
          </Link>
        </section>

      </div>
    </aside>
  );
}

function SectionHeader({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-2">
      <span className="text-brand-brown-700">{icon}</span>

      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-brown-700">
        {title}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group flex items-center justify-between"
      >
        {content}

        <ArrowUpRight
          size={13}
          className="
            text-muted-foreground
            transition-transform
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
          "
        />
      </Link>
    );
  }

  return content;
}