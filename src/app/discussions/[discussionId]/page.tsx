import { AppShell } from "@/components/layout/AppShell";

import { DiscussionActions } from "@/components/discussion/DiscussionActions";
import { DiscussionContext } from "@/components/discussion/DiscussionContext";
import { DiscussionContent } from "@/components/discussion/DiscussionContent";
import { DiscussionHeader } from "@/components/discussion/DiscussionHeader";
import { ContributionCard } from "@/components/discussion/ContributionCard";
import { ContributionComposer } from "@/components/discussion/ContributionComposer";

const contributions = [
  {
    author: "Sarah Chen",
    time: "1 hour ago",
    type: "answer" as const,
    bestAnswer: true,
    helpful: 126,
    replies: 18,
    content:
      "For a local-first assistant, I would separate the system into four main layers: the model runtime, an orchestration layer, persistent memory, and a tool interface.\n\nThe orchestration layer should remain independent from the model itself. That makes it much easier to switch between models as local inference improves.\n\nI'd also keep long-term memory outside the model context. Use retrieval to bring only the relevant information into each interaction.",
  },
  {
    author: "Daniel Reed",
    time: "2 hours ago",
    type: "experience" as const,
    helpful: 84,
    replies: 12,
    content:
      "I've been running a local assistant for several months. The biggest mistake I made initially was trying to make the model responsible for everything.\n\nOnce I separated tools, memory, and reasoning into independent components, the system became considerably easier to debug.",
  },
  {
    author: "Maya Patel",
    time: "3 hours ago",
    type: "resource" as const,
    helpful: 61,
    replies: 7,
    content:
      "If you're exploring this architecture, I'd start by studying agent orchestration patterns before choosing a particular framework. The framework landscape is changing very quickly, while the underlying architectural principles are much more stable.",
  },
];

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const { discussionId } = await params;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">

        {/* Header */}
        <DiscussionHeader
          community="Artificial Intelligence"
          communitySlug="artificial-intelligence"
          title="What's the best architecture for a local AI assistant in 2026?"
          author="Alex Morgan"
          time="2 hours ago"
          tags={[
            "agents",
            "opensource",
            "llm",
            "2026",
          ]}
        />

        {/* Main */}
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

          {/* Main content */}
          <main className="min-w-0 space-y-4">

            {/* Discussion */}
            <DiscussionContent>
              <p>
                I'm experimenting with a local-first AI assistant and
                trying to figure out what a good architecture should look
                like in 2026.
              </p>

              <p className="mt-5">
                My main concerns are model selection, persistent memory,
                tool use, context management, and keeping as much of the
                system local as possible.
              </p>

              <p className="mt-5">
                For people who have built something similar, what
                architecture has worked well for you?
              </p>

              <div className="mt-7">
                <DiscussionActions
                  helpful={184}
                  comments={42}
                />
              </div>
            </DiscussionContent>

            {/* Composer */}
            <ContributionComposer />

            {/* Contributions */}
            <section>

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h2 className="text-base font-bold text-brand-brown-950">
                    42 Contributions
                  </h2>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Answers, experiences, resources, and perspectives from
                    citizens.
                  </p>
                </div>

                <button
                  className="
                    rounded-lg
                    border
                    bg-white
                    px-3 py-2
                    text-xs font-semibold
                    text-brand-brown-700
                    hover:bg-brand-sand
                  "
                >
                  Most Helpful
                </button>

              </div>

              <div className="space-y-4">
                {contributions.map((contribution) => (
                  <ContributionCard
                    key={contribution.author}
                    {...contribution}
                  />
                ))}
              </div>

            </section>

          </main>

          {/* Context */}
          <DiscussionContext
            community="Artificial Intelligence"
            slug="artificial-intelligence"
            citizens="2.4M"
            knowledgeCount="12.8K"
          />

        </div>

      </div>
    </AppShell>
  );
}