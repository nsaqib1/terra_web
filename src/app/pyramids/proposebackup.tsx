import {
  ArrowRight,
  Sparkles,
  Search,
  Plus,
  Users,
  FileText,
  Compass,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

// --- Mock Data ---

const featuredPyramids = [
  {
    name: "Artificial Intelligence",
    description:
      "The global hub for artificial intelligence, machine learning, intelligent systems, and the ideas shaping their future.",
    members: "2.4M",
    posts: "184K",
    initials: "AI",
    tags: ["llm", "agents", "machinelearning"],
  },
  {
    name: "Photography",
    description:
      "A shared home for photographers, visual storytellers, enthusiasts, and anyone interested in the art of photography.",
    members: "1.8M",
    posts: "126K",
    initials: "PH",
    tags: ["street", "portraits", "film"],
  },
  {
    name: "Programming",
    description:
      "A community for software development, programming concepts, engineering practices, and building things with code.",
    members: "1.4M",
    posts: "214K",
    initials: "PR",
    tags: ["web", "backend", "opensource"],
  },
];

const recentlyRecognized = [
  {
    name: "Urban Gardening",
    description:
      "Growing food, plants, and green spaces in cities and other limited-space environments.",
    members: "48K",
    category: "Lifestyle",
    established: "Aug 2026",
    initials: "UG",
  },
  {
    name: "Mechanical Keyboards",
    description:
      "The design, building, modification, history, and everyday use of mechanical keyboards.",
    members: "31K",
    category: "Technology",
    established: "Aug 2026",
    initials: "MK",
  },
  {
    name: "SSC Preparation",
    description:
      "A shared home for students preparing for SSC examinations, study strategies, resources, and academic support.",
    members: "27K",
    category: "Education",
    established: "Aug 2026",
    initials: "SS",
  },
  {
    name: "Home Cooking",
    description:
      "Recipes, techniques, ingredients, kitchen skills, and the everyday craft of cooking at home.",
    members: "22K",
    category: "Lifestyle",
    established: "Jul 2026",
    initials: "HC",
  },
];

const categories = [
  "All Pyramids",
  "Technology",
  "Lifestyle",
  "Education",
  "Creative",
  "Science",
  "Business",
];

// --- Sub-components (or put in @/components/pyramids/...) ---

function PyramidsHero() {
  return (
    <div className="rounded-2xl border bg-white p-6 sm:p-8">
      <div className="max-w-2xl">
        <span className="rounded-full bg-brand-sand px-3 py-1 text-[11px] font-bold text-brand-brown-900">
          Pyramids Directory
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-brand-brown-950 sm:text-3xl">
          A permanent home for every subject.
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Discover established Pyramids around meaningful topics, connect with
          other members, and contribute your knowledge to lasting hubs.
        </p>

        {/* Search Bar */}
        <div className="mt-5 flex items-center gap-2 rounded-xl border bg-brand-sand/30 p-1.5 focus-within:border-brand-brown-700">
          <Search size={16} className="ml-2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Pyramids by subject or interest..."
            className="w-full bg-transparent text-xs text-brand-brown-950 outline-none placeholder:text-muted-foreground"
          />
          <button className="rounded-lg bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

function InterestCategories() {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b pb-4">
      <Compass size={16} className="mr-1 text-brand-brown-700" />
      {categories.map((cat, index) => (
        <button
          key={cat}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${index === 0
            ? "bg-brand-brown-950 text-white"
            : "bg-white border text-brand-brown-800 hover:bg-brand-sand/50"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function FeaturedPyramidCard({
  name,
  description,
  members,
  posts,
  initials,
  tags,
}: (typeof featuredPyramids)[0]) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-sand text-base font-bold text-brand-brown-950">
            {initials}
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-brown-950 hover:underline cursor-pointer">
              {name}
            </h3>
            <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={12} /> {members} Members
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText size={12} /> {posts} Posts
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-brand-brown-800 line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-brand-sand/50 px-2 py-0.5 text-[10px] font-medium text-brand-brown-700"
            >
              #{tag}
            </span>
          ))}
        </div>
        <button className="text-xs font-bold text-brand-brown-950 hover:underline">
          Visit →
        </button>
      </div>
    </div>
  );
}

function PyramidDirectoryCard({
  name,
  description,
  members,
  category,
  established,
  initials,
}: (typeof recentlyRecognized)[0]) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-white p-4 transition-colors hover:border-brand-brown-700">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-sand/70 text-sm font-bold text-brand-brown-950">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-brand-brown-950">{name}</h4>
            <span className="rounded-md bg-brand-sand px-1.5 py-0.5 text-[9px] font-bold text-brand-brown-800">
              {category}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>
      </div>

      <div className="ml-4 shrink-0 text-right">
        <span className="text-xs font-bold text-brand-brown-950">{members}</span>
        <p className="text-[10px] text-muted-foreground">Est. {established}</p>
      </div>
    </div>
  );
}

function PyramidProposalCard() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-brand-sand/40 p-6">
      <div>
        <h3 className="text-base font-bold text-brand-brown-950">
          Don't see a Pyramid for your subject?
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-xl">
          Propose a new permanent Pyramid. If approved, you will help lay the groundwork for a new topic hub.
        </p>
      </div>
      <button className="flex items-center gap-1.5 shrink-0 rounded-xl bg-brand-brown-950 px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
        <Plus size={14} />
        <span>Propose a Pyramid</span>
      </button>
    </div>
  );
}

// --- Main Page Export ---

export default function PyramidsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] space-y-8">
        {/* Hero */}
        <PyramidsHero />

        {/* Categories */}
        <InterestCategories />

        {/* Featured Pyramids */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand-desert-dark" />
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
                  Popular Hubs
                </p>
              </div>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-brand-brown-950">
                Active Pyramids on the platform
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Some of the largest and most active homes on the platform.
              </p>
            </div>

            <button className="hidden items-center gap-1 text-xs font-semibold text-brand-brown-700 hover:text-brand-brown-950 sm:flex">
              View all
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredPyramids.map((pyramid) => (
              <FeaturedPyramidCard key={pyramid.name} {...pyramid} />
            ))}
          </div>
        </section>

        {/* Proposal Banner */}
        <PyramidProposalCard />

        {/* Recently Established Pyramids */}
        <section>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
              New Homes
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-brand-brown-950">
              Recently recognized Pyramids
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              New permanent homes recently opened to everyone.
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {recentlyRecognized.map((pyramid) => (
              <PyramidDirectoryCard key={pyramid.name} {...pyramid} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}