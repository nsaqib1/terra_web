import { AppShell } from "@/components/layout/AppShell";
import {
  MessageCircle,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Users,
  ShieldAlert,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";

// Mock Community Data
const communityData = {
  name: "Artificial Intelligence",
  slug: "artificial-intelligence",
  initials: "AI",
  memberCount: "2.4M",
  postCount: "184K",
  established: "2026",
  about:
    "The global hub for artificial intelligence, machine learning, intelligent systems, and the ideas shaping their future. Moderated by members to maintain high-signal discussions.",
  tags: [
    { name: "agents", count: "42.1K" },
    { name: "opensource", count: "38.5K" },
    { name: "llm", count: "29.4K" },
    { name: "machinelearning", count: "18.2K" },
    { name: "robotics", count: "12.8K" },
    { name: "2026", count: "9.6K" },
  ],
};

const posts = [
  {
    id: "1",
    author: {
      name: "Alex Morgan",
      username: "alexmorgan",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
    time: "2 hours ago",
    description:
      "What's the best architecture for a local AI assistant in 2026? I'm experimenting with a local-first assistant and would love to hear how others are approaching memory, tools, model selection, and privacy.",
    tags: ["agents", "opensource", "llm", "2026"],
    votes: 184,
    comments: 42,
  },
  {
    id: "2",
    author: {
      name: "Sarah Chen",
      username: "sarahc",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    time: "4 hours ago",
    description:
      "Which open-source models are actually worth running locally? There are more models appearing every week. What have people actually tested and found useful for everyday development?",
    tags: ["opensource", "llm"],
    votes: 126,
    comments: 38,
  },
  {
    id: "3",
    author: {
      name: "Daniel Reed",
      username: "dreed",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    time: "7 hours ago",
    description:
      "How should we evaluate AI agents? Benchmarks seem to tell only part of the story. I'm interested in practical evaluation methods for agents operating in real environments.",
    tags: ["agents", "machinelearning"],
    votes: 312,
    comments: 73,
  },
];

export default async function PyramidPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        {/* Community Header Banner */}
        <div className="overflow-hidden rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Avatar & Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-desert-light text-xl font-black text-brand-brown-900 shadow-inner">
                {communityData.initials}
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950">
                  {communityData.name}
                </h1>

                {/* Quick Stats */}
                <div className="mt-2 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-brand-brown-700" />
                    <span className="font-semibold text-brand-brown-950">
                      {communityData.memberCount}
                    </span>
                    <span>Members</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <FileText size={14} className="text-brand-brown-700" />
                    <span className="font-semibold text-brand-brown-950">
                      {communityData.postCount}
                    </span>
                    <span>Posts</span>
                  </div>

                </div>
              </div>
            </div>

            {/* Right: Primary Action */}
            <div className="flex items-center gap-2 sm:self-center">
              <button className="flex items-center gap-2 rounded-xl bg-brand-brown-950 px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                <UserPlus size={15} />
                <span>Become a Member</span>
              </button>
            </div>
          </div>

          {/* Tag Vocabulary Navigation Bar */}
          <div className="mt-6 border-t pt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Layers size={14} className="text-brand-brown-700" />
              <span>Postmarks</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {communityData.tags.map((tag) => (
                <button
                  key={tag.name}
                  className="
                    group flex items-center gap-2 rounded-xl border bg-brand-sand/40
                    px-3 py-1.5 text-xs font-semibold text-brand-brown-800
                    transition-colors hover:border-brand-brown-700 hover:bg-brand-sand
                  "
                >
                  <span>{tag.name}</span>
                  <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] text-muted-foreground group-hover:text-brand-brown-950">
                    {tag.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed + Community Context Sidebar */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main Feed */}
          <main className="space-y-4">
            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border bg-white p-5 transition-shadow hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]"
                >
                  {/* Header: Author & Metadata */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-brown-950 hover:underline cursor-pointer">
                          {post.author.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          @{post.author.username} • {post.time}
                        </span>
                      </div>
                    </div>

                    {/* Post Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-brand-sand/60 px-2 py-0.5 text-xs font-medium text-brand-brown-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="mt-3">
                    <p className="text-sm leading-relaxed text-brand-brown-900">
                      {post.description}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 flex items-center gap-3 border-t pt-3">
                    {/* Voting */}
                    <div className="flex items-center rounded-xl bg-brand-sand/50 p-1">
                      <button
                        aria-label="Upvote"
                        className="flex items-center justify-center rounded-lg p-1.5 text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <span className="px-2 text-xs font-bold text-brand-brown-900">
                        {post.votes}
                      </span>

                      <button
                        aria-label="Downvote"
                        className="flex items-center justify-center rounded-lg p-1.5 text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>

                    {/* Comment Count */}
                    <button className="flex items-center gap-1.5 rounded-xl bg-brand-sand/50 px-3 py-1.5 text-xs font-semibold text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors">
                      <MessageCircle size={16} />
                      <span>{post.comments} Comments</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </main>

          {/* Right Sidebar: About Community */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-brand-brown-950">
                <Sparkles size={14} className="text-brand-desert-dark" />
                <span>About Community</span>
              </div>

              {/* Centralized Description */}
              <p className="mt-3 text-xs leading-relaxed text-brand-brown-700">
                {communityData.about}
              </p>

              <div className="mt-4 space-y-2 border-t pt-3 text-xs text-brand-brown-900">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established</span>
                  <span className="font-semibold">{communityData.established}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access</span>
                  <span className="font-semibold">Public</span>
                </div>
              </div>
            </div>

            {/* Rules Block */}
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-brand-brown-950">
                <ShieldAlert size={14} className="text-brand-brown-700" />
                <span>Community Rules</span>
              </div>

              <ol className="mt-3 space-y-2 text-xs text-brand-brown-800 list-decimal list-inside">
                <li>Be constructive and respectful.</li>
                <li>No low-effort self-promotion.</li>
                <li>Tag posts with appropriate Community tags.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}