import { CommunityAbout } from "@/components/community/CommunityAbout";
import { CommunityDiscussionCard } from "@/components/community/CommunityDiscussionCard";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { CommunityTags } from "@/components/community/CommunityTags";

const discussions = [
  {
    title: "What's the best architecture for a local AI assistant in 2026?",
    excerpt:
      "I'm experimenting with a local-first assistant and would love to hear how others are approaching memory, tools, model selection, and privacy.",
    author: "Alex Morgan",
    time: "2 hours ago",
    tags: ["agents", "opensource", "llm", "2026"],
    helpful: 184,
    comments: 42,
    verified: true,
  },
  {
    title: "Which open-source models are actually worth running locally?",
    excerpt:
      "There are more models appearing every week. What have people actually tested and found useful for everyday development?",
    author: "Sarah Chen",
    time: "4 hours ago",
    tags: ["opensource", "localai", "models"],
    helpful: 126,
    comments: 38,
  },
  {
    title: "How should we evaluate AI agents?",
    excerpt:
      "Benchmarks seem to tell only part of the story. I'm interested in practical evaluation methods for agents operating in real environments.",
    author: "Daniel Reed",
    time: "7 hours ago",
    tags: ["agents", "evaluation", "research"],
    helpful: 312,
    comments: 73,
  },
];

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-[1180px]">

      {/* Community identity */}
      <CommunityHeader
        name="Artificial Intelligence"
        description="The global community for artificial intelligence, machine learning, intelligent systems, and the ideas shaping their future."
        citizens="2.4M"
        discussions="184K"
        established="2026"
      />

      {/* Contexts */}
      <div className="mt-4">
        <CommunityTags
          tags={[
            "llm",
            "agents",
            "machinelearning",
            "robotics",
            "opensource",
            "2026",
          ]}
        />
      </div>

      {/* Tabs */}
      <div className="mt-4 rounded-2xl border bg-white">
        <CommunityTabs />

        <div className="p-4 sm:p-5">

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

            {/* Feed */}
            <div className="space-y-4">

              {/* Feed header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-base font-bold text-brand-brown-950">
                    Community discussions
                  </h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Conversations from the citizens of this community.
                  </p>
                </div>

                <button
                  className="
                    rounded-lg
                    bg-brand-sand
                    px-3 py-2
                    text-xs font-semibold
                    text-brand-brown-800
                    hover:bg-brand-desert-light
                  "
                >
                  Latest
                </button>
              </div>

              {discussions.map((discussion) => (
                <CommunityDiscussionCard
                  key={discussion.title}
                  {...discussion}
                />
              ))}

            </div>

            {/* Community context */}
            <CommunityAbout />

          </div>

        </div>
      </div>

    </div>
  );
}