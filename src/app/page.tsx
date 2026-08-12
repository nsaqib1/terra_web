import { AppShell } from "@/components/layout/AppShell";
import { MessageCircle, Users } from "lucide-react";

const discussions = [
  {
    community: "Artificial Intelligence",
    initials: "AI",
    time: "2h ago",
    title: "What's the best architecture for a local AI assistant in 2026?",
    description:
      "I'm experimenting with a local-first assistant and would love to hear how others are approaching memory, tools, and model selection.",
    tags: ["agents", "opensource", "llm", "2026"],
    helpful: 184,
    comments: 42,
  },
  {
    community: "Photography",
    initials: "PH",
    time: "4h ago",
    title: "What makes a photograph feel timeless?",
    description:
      "I've been studying photographs from different decades and noticed some images still feel incredibly modern.",
    tags: ["photography", "composition", "discussion"],
    helpful: 96,
    comments: 28,
  },
  {
    community: "Programming",
    initials: "PR",
    time: "6h ago",
    title: "What programming concepts took you years to truly understand?",
    description:
      "Not syntax or frameworks. I'm interested in the fundamental concepts that eventually changed the way you think about software.",
    tags: ["programming", "learning", "developers"],
    helpful: 312,
    comments: 73,
  },
];

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[850px]">

        {/* Welcome */}
        <section className="mb-7">
          <p className="text-sm font-medium text-brand-brown-600">
            Your communities have 24 new discussions
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-brand-brown-950">
            Good morning, Najmus
          </h1>
        </section>

        {/* Feed filters */}
        <div className="mb-5 flex items-center gap-1 border-b">
          {["For You", "Latest", "Rising", "Knowledge"].map(
            (item, index) => (
              <button
                key={item}
                className={`
                  relative px-4 py-3 text-sm font-semibold
                  ${index === 0
                    ? "text-brand-brown-950"
                    : "text-muted-foreground hover:text-brand-brown-950"
                  }
                `}
              >
                {item}

                {index === 0 && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-desert-dark" />
                )}
              </button>
            ),
          )}
        </div>

        {/* Discussions */}
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <article
              key={discussion.title}
              className="
                rounded-2xl border bg-white
                p-5
                transition-shadow
                hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]
              "
            >
              {/* Community */}
              <div className="flex items-center gap-3">

                <div
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-xl bg-brand-desert-light
                    text-xs font-bold text-brand-brown-800
                  "
                >
                  {discussion.initials}
                </div>

                <div>
                  <p className="text-sm font-semibold text-brand-brown-900">
                    {discussion.community}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {discussion.time}
                  </p>
                </div>

              </div>

              {/* Content */}
              <div className="mt-4">
                <h2 className="text-[17px] font-bold leading-snug text-brand-brown-950">
                  {discussion.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-brand-brown-600">
                  {discussion.description}
                </p>
              </div>

              {/* Hashtags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {discussion.tags.map((tag) => (
                  <button
                    key={tag}
                    className="
                      rounded-full bg-brand-sand
                      px-2.5 py-1
                      text-xs font-medium
                      text-brand-brown-700
                      transition-colors
                      hover:bg-brand-desert-light
                    "
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-2 border-t pt-4">
                <button
                  className="
      rounded-lg px-3 py-1.5
      text-xs font-semibold
      text-brand-brown-700
      transition-colors
      hover:bg-brand-sand
      hover:text-brand-brown-950
    "
                >
                  ↑ {discussion.helpful} Helpful
                </button>

                <button
                  className="
      flex items-center gap-1.5
      rounded-lg px-3 py-1.5
      text-xs font-semibold
      text-brand-brown-700
      hover:bg-brand-sand
      hover:text-brand-brown-950
    "
                >
                  <MessageCircle size={15} />
                  {discussion.comments}
                </button>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    className="
        rounded-lg px-3 py-1.5
        text-xs font-medium
        text-muted-foreground
        hover:bg-brand-sand
        hover:text-brand-brown-950
      "
                  >
                    Save
                  </button>

                  <button
                    className="
        rounded-lg px-3 py-1.5
        text-xs font-medium
        text-muted-foreground
        hover:bg-brand-sand
        hover:text-brand-brown-950
      "
                  >
                    Share
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}