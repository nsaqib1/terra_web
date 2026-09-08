import { AppShell } from "@/components/layout/AppShell";
import { MessageCircle, ArrowUp, ArrowDown } from "lucide-react";

const discussions = [
  {
    id: 1,
    community: "Artificial Intelligence",
    communityInitials: "AI",
    author: {
      name: "Alex Rivera",
      username: "arivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    time: "2h ago",
    description:
      "What's the best architecture for a local AI assistant in 2026? I'm experimenting with a local-first assistant and would love to hear how others are approaching memory, tools, and model selection.",
    tags: ["agents", "opensource", "llm", "2026"],
    votes: 184,
    comments: 42,
  },
  {
    id: 2,
    community: "Photography",
    communityInitials: "PH",
    author: {
      name: "Elena Rostova",
      username: "elena_r",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    time: "4h ago",
    description:
      "What makes a photograph feel timeless? I've been studying photographs from different decades and noticed some images still feel incredibly modern.",
    tags: ["photography", "composition", "discussion"],
    votes: 96,
    comments: 28,
  },
];

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[850px]">
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <article
              key={discussion.id}
              className="
                rounded-2xl border bg-white
                p-5
                transition-shadow
                hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]
              "
            >
              {/* Header: Community + Author Info & Tags */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Author Avatar with Community Badge */}
                  <div className="relative">
                    <img
                      src={discussion.author.avatar}
                      alt={discussion.author.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                    />
                    <div
                      title={discussion.community}
                      className="
                        absolute -bottom-1 -right-1
                        flex h-5 w-5 items-center justify-center
                        rounded-md bg-brand-desert-light text-[9px] font-bold text-brand-brown-800
                        ring-2 ring-white
                      "
                    >
                      {discussion.communityInitials}
                    </div>
                  </div>

                  {/* Metadata Stack */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-brand-brown-950 hover:underline cursor-pointer">
                        {discussion.community}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{discussion.time}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Posted by</span>
                      <span className="font-medium text-brand-brown-700 hover:underline cursor-pointer">
                        @{discussion.author.username}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {discussion.tags.map((tag) => (
                    <span
                      key={tag}
                      className="
                        rounded-md bg-brand-sand/60
                        px-2 py-0.5
                        text-xs font-medium text-brand-brown-700
                      "
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body Text */}
              <div className="mt-3">
                <p className="text-sm leading-relaxed text-brand-brown-900">
                  {discussion.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-3 border-t pt-3">
                <div className="flex items-center rounded-xl bg-brand-sand/50 p-1">
                  <button
                    aria-label="Upvote"
                    className="
                      flex items-center justify-center rounded-lg p-1.5
                      text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950
                      transition-colors
                    "
                  >
                    <ArrowUp size={16} />
                  </button>

                  <span className="px-2 text-xs font-bold text-brand-brown-900">
                    {discussion.votes}
                  </span>

                  <button
                    aria-label="Downvote"
                    className="
                      flex items-center justify-center rounded-lg p-1.5
                      text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950
                      transition-colors
                    "
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                <button
                  className="
                    flex items-center gap-1.5 rounded-xl bg-brand-sand/50 px-3 py-1.5
                    text-xs font-semibold text-brand-brown-700
                    hover:bg-brand-desert-light hover:text-brand-brown-950
                    transition-colors
                  "
                >
                  <MessageCircle size={16} />
                  <span>{discussion.comments}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}