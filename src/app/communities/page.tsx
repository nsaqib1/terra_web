import { ArrowRight, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

import { CommunitiesHero } from "@/components/communities/CommunitiesHero";
import { CommunityProposalCard } from "@/components/communities/CommunityProposalCard";
import { CommunityDirectoryCard } from "@/components/communities/CommunityDirectoryCard";
import { FeaturedCommunity } from "@/components/communities/FeaturedCommunity";
import { InterestCategories } from "@/components/communities/InterestCategories";

const featuredCommunities = [
  {
    name: "Artificial Intelligence",
    description:
      "The global community for artificial intelligence, machine learning, intelligent systems, and the ideas shaping their future.",
    citizens: "2.4M",
    discussions: "184K",
    initials: "AI",
    tags: ["llm", "agents", "machinelearning"],
  },
  {
    name: "Photography",
    description:
      "A shared home for photographers, visual storytellers, enthusiasts, and anyone interested in the art of photography.",
    citizens: "1.8M",
    discussions: "126K",
    initials: "PH",
    tags: ["street", "portraits", "film"],
  },
  {
    name: "Programming",
    description:
      "A community for software development, programming concepts, engineering practices, and building things with code.",
    citizens: "1.4M",
    discussions: "214K",
    initials: "PR",
    tags: ["web", "backend", "opensource"],
  },
];

const recentlyRecognized = [
  {
    name: "Urban Gardening",
    description:
      "Growing food, plants, and green spaces in cities and other limited-space environments.",
    citizens: "48K",
    category: "Lifestyle",
    established: "Aug 2026",
    initials: "UG",
  },
  {
    name: "Mechanical Keyboards",
    description:
      "The design, building, modification, history, and everyday use of mechanical keyboards.",
    citizens: "31K",
    category: "Technology",
    established: "Aug 2026",
    initials: "MK",
  },
  {
    name: "SSC Preparation",
    description:
      "A shared home for students preparing for SSC examinations, study strategies, resources, and academic support.",
    citizens: "27K",
    category: "Education",
    established: "Aug 2026",
    initials: "SS",
  },
  {
    name: "Home Cooking",
    description:
      "Recipes, techniques, ingredients, kitchen skills, and the everyday craft of cooking at home.",
    citizens: "22K",
    category: "Lifestyle",
    established: "Jul 2026",
    initials: "HC",
  },
];

export default function CommunitiesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] space-y-10">

        {/* Hero */}
        <CommunitiesHero />

        {/* Categories */}
        <InterestCategories />

        {/* Featured */}
        <section>
          <div className="flex items-end justify-between gap-4">

            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={16}
                  className="text-brand-desert-dark"
                />

                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
                  Popular
                </p>
              </div>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-brand-brown-950">
                Communities people are building in
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Some of the largest and most active homes on the platform.
              </p>
            </div>

            <button
              className="
                hidden items-center gap-1
                text-xs font-semibold
                text-brand-brown-700
                hover:text-brand-brown-950
                sm:flex
              "
            >
              View all
              <ArrowRight size={13} />
            </button>

          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredCommunities.map((community) => (
              <FeaturedCommunity
                key={community.name}
                {...community}
              />
            ))}
          </div>
        </section>

        {/* Proposal */}
        <CommunityProposalCard />

        {/* Recently recognized */}
        <section>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
              New institutions
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-brand-brown-950">
              Recently recognized communities
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              New canonical homes recently opened to everyone.
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {recentlyRecognized.map((community) => (
              <CommunityDirectoryCard
                key={community.name}
                {...community}
              />
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  );
}