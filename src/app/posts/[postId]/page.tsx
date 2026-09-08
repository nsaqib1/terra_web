import { AppShell } from "@/components/layout/AppShell";
import { MessageCircle, ArrowUp, ArrowDown } from "lucide-react";

const comments = [
  {
    id: "1",
    author: {
      name: "Sarah Chen",
      username: "sarahc",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    time: "1 hour ago",
    votes: 126,
    replies: 18,
    isTopAnswer: true,
    content:
      "For a local-first assistant, I would separate the system into four main layers: the model runtime, an orchestration layer, persistent memory, and a tool interface.\n\nThe orchestration layer should remain independent from the model itself. That makes it much easier to switch between models as local inference improves.\n\nI'd also keep long-term memory outside the model context. Use retrieval to bring only the relevant information into each interaction.",
  },
  {
    id: "2",
    author: {
      name: "Daniel Reed",
      username: "dreed",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    time: "2 hours ago",
    votes: 84,
    replies: 12,
    isTopAnswer: false,
    content:
      "I've been running a local assistant for several months. The biggest mistake I made initially was trying to make the model responsible for everything.\n\nOnce I separated tools, memory, and reasoning into independent components, the system became considerably easier to debug.",
  },
  {
    id: "3",
    author: {
      name: "Maya Patel",
      username: "mpatel",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    time: "3 hours ago",
    votes: 61,
    replies: 7,
    isTopAnswer: false,
    content:
      "If you're exploring this architecture, I'd start by studying agent orchestration patterns before choosing a particular framework. The framework landscape is changing very quickly, while the underlying architectural principles are much more stable.",
  },
];

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main Post Section */}
          <main className="min-w-0 space-y-4">
            {/* Post Card */}
            <article className="rounded-2xl border bg-white p-5 transition-shadow">
              {/* Header: Community & Author Info */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                      alt="Alex Morgan"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                    />
                    <div
                      title="Artificial Intelligence"
                      className="
                        absolute -bottom-1 -right-1
                        flex h-5 w-5 items-center justify-center
                        rounded-md bg-brand-desert-light text-[9px] font-bold text-brand-brown-800
                        ring-2 ring-white
                      "
                    >
                      AI
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-brand-brown-950 hover:underline cursor-pointer">
                        Artificial Intelligence
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">2 hours ago</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Posted by</span>
                      <span className="font-medium text-brand-brown-700 hover:underline cursor-pointer">
                        @alexmorgan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {["agents", "opensource", "llm", "2026"].map((tag) => (
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

              {/* Main Body Content (No Title) */}
              <div className="mt-4 text-sm leading-relaxed text-brand-brown-900 space-y-3">
                <p>
                  What's the best architecture for a local AI assistant in 2026? I'm experimenting with a local-first assistant and would love to hear how others are approaching memory, tools, and model selection.
                </p>
                <p>
                  My main concerns are model selection, persistent memory, tool use, context management, and keeping as much of the system local as possible.
                </p>
                <p>
                  For people who have built something similar, what architecture has worked well for you?
                </p>
              </div>

              {/* Unified Voting & Comment Actions */}
              <div className="mt-5 flex items-center gap-3 border-t pt-3">
                {/* Vote Group matching Home Page design */}
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
                    184
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

                {/* Comment Counter */}
                <div
                  className="
                    flex items-center gap-1.5 rounded-xl bg-brand-sand/50 px-3 py-1.5
                    text-xs font-semibold text-brand-brown-700
                  "
                >
                  <MessageCircle size={16} />
                  <span>42 Comments</span>
                </div>
              </div>
            </article>

            {/* Comment Composer */}
            <div className="rounded-2xl border bg-white p-4">
              <textarea
                rows={3}
                placeholder="Write a comment..."
                className="
                  w-full resize-none rounded-xl border border-brand-sand bg-brand-sand/30 p-3
                  text-sm text-brand-brown-900 placeholder:text-muted-foreground
                  focus:border-brand-brown-700 focus:outline-none focus:ring-0
                "
              />
              <div className="mt-2 flex justify-end">
                <button className="rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                  Comment
                </button>
              </div>
            </div>

            {/* Comments Stream */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-brand-brown-950">
                  42 Comments
                </h2>

                <select className="rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-brown-700 focus:outline-none">
                  <option value="top">Top Comments</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} {...comment} />
                ))}
              </div>
            </section>
          </main>

          {/* Context / Community Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-desert-light text-xs font-bold text-brand-brown-800">
                  AI
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-brown-950">
                    Artificial Intelligence
                  </h3>
                  <p className="text-xs text-muted-foreground">2.4M Members</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-brand-brown-700">
                A community dedicated to artificial intelligence, machine learning, and agents in 2026.
              </p>
              <button className="mt-4 w-full rounded-xl bg-brand-sand py-2 text-xs font-bold text-brand-brown-950 hover:bg-brand-desert-light transition-colors">
                Join Community
              </button>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

{/* Comment Component matching overall design language */ }
function CommentCard({
  author,
  time,
  votes,
  replies,
  isTopAnswer,
  content,
}: {
  author: { name: string; username: string; avatar: string };
  time: string;
  votes: number;
  replies: number;
  isTopAnswer?: boolean;
  content: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <img
            src={author.avatar}
            alt={author.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-brown-950 hover:underline cursor-pointer">
                {author.name}
              </span>
              {isTopAnswer && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Top Comment
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              @{author.username} • {time}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-brand-brown-900">
        {content}
      </p>

      {/* Comment Actions */}
      <div className="mt-3 flex items-center gap-2 border-t pt-2.5">
        <div className="flex items-center rounded-lg bg-brand-sand/50 p-0.5">
          <button
            aria-label="Upvote comment"
            className="rounded p-1 text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors"
          >
            <ArrowUp size={14} />
          </button>
          <span className="px-1.5 text-[11px] font-bold text-brand-brown-900">
            {votes}
          </span>
          <button
            aria-label="Downvote comment"
            className="rounded p-1 text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors"
          >
            <ArrowDown size={14} />
          </button>
        </div>

        <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-brown-700 hover:bg-brand-sand/60 transition-colors">
          <MessageCircle size={14} />
          <span>{replies} Replies</span>
        </button>
      </div>
    </div>
  );
}