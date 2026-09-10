import { AppShell } from "@/components/layout/AppShell";
import { Search, Plus, Users, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const communitys = [
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description:
      "The global hub for artificial intelligence, machine learning, intelligent systems, and the ideas shaping their future.",
    members: "2.4M",
    posts: "184K",
    initials: "AI",
    category: "Technology",
    tags: ["agents", "opensource", "llm"],
  },
  {
    name: "Photography",
    slug: "photography",
    description:
      "A shared home for photographers, visual storytellers, enthusiasts, and anyone interested in the art of photography.",
    members: "1.8M",
    posts: "126K",
    initials: "PH",
    category: "Art & Design",
    tags: ["street", "portraits", "film"],
  },
  {
    name: "Programming",
    slug: "programming",
    description:
      "A space for software development, programming concepts, engineering practices, and building things with code.",
    members: "1.4M",
    posts: "214K",
    initials: "PR",
    category: "Technology",
    tags: ["web", "backend", "opensource"],
  },
  {
    name: "Urban Gardening",
    slug: "urban-gardening",
    description:
      "Growing food, plants, and green spaces in cities and other limited-space environments.",
    members: "48K",
    posts: "12K",
    initials: "UG",
    category: "Lifestyle",
    tags: ["hydroponics", "balcony", "organic"],
  },
  {
    name: "Mechanical Keyboards",
    slug: "mechanical-keyboards",
    description:
      "The design, building, modification, history, and everyday use of mechanical keyboards.",
    members: "31K",
    posts: "8.4K",
    initials: "MK",
    category: "Technology",
    tags: ["switches", "customs", "keycaps"],
  },
  {
    name: "Home Cooking",
    slug: "home-cooking",
    description:
      "Recipes, techniques, ingredients, kitchen skills, and the everyday craft of cooking at home.",
    members: "22K",
    posts: "5.1K",
    initials: "HC",
    category: "Lifestyle",
    tags: ["baking", "mealprep", "techniques"],
  },
];

const categories = ["All", "Technology", "Art & Design", "Lifestyle", "Science", "Education"];

export default function PyramidsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] space-y-8">

        {/* Streamlined Header & Actions */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950">
              Communities
            </h1>
            <p className="mt-1 text-xs text-brand-brown-700">
              Explore topic hubs or propose a new space for your community.
            </p>
          </div>

          <button className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-brown-950 px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
            <Plus size={16} />
            <span>Propose a Community</span>
          </button>
        </div>

        {/* Focused Controls: Search & Category Filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search Communities by name, topic, or tag..."
              className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-brand-brown-950 placeholder-muted-foreground outline-none focus:border-brand-brown-700 transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${index === 0
                  ? "bg-brand-brown-950 text-white"
                  : "bg-white border text-brand-brown-800 hover:bg-brand-sand"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Community Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {communitys.map((community) => (
            <Link
              key={community.slug}
              href={`/p/${community.slug}`}
              className="group flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all hover:border-brand-brown-700/40 hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]"
            >
              <div>
                {/* Header: Initials, Name, Category & Arrow */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-desert-light text-base font-black text-brand-brown-900 group-hover:bg-brand-sand transition-colors">
                      {community.initials}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-brand-brown-950 group-hover:underline">
                        {community.name}
                      </h2>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {community.category}
                      </span>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-brown-950"
                  />
                </div>

                {/* Description */}
                <p className="mt-3 text-xs leading-relaxed text-brand-brown-800 line-clamp-2">
                  {community.description}
                </p>
              </div>

              {/* Card Footer: Metrics & Top Tags */}
              <div className="mt-5 border-t pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users size={12} className="text-brand-brown-700" />
                      <strong className="text-brand-brown-950">{community.members}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-brand-brown-700" />
                      <strong className="text-brand-brown-950">{community.posts}</strong>
                    </span>
                  </div>

                  {/* Top Tag Preview */}
                  <div className="flex gap-1">
                    {community.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-brand-sand/60 px-1.5 py-0.5 text-[10px] font-medium text-brand-brown-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </AppShell>
  );
}