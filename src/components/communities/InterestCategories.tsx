import {
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  HeartPulse,
  Leaf,
  Palette,
  FlaskConical,
  Trophy,
  Globe2,
} from "lucide-react";

const categories = [
  {
    name: "Technology",
    count: "1,842",
    icon: Code2,
  },
  {
    name: "Science",
    count: "936",
    icon: FlaskConical,
  },
  {
    name: "Arts & Culture",
    count: "1,204",
    icon: Palette,
  },
  {
    name: "Education",
    count: "2,106",
    icon: GraduationCap,
  },
  {
    name: "Business",
    count: "1,438",
    icon: BriefcaseBusiness,
  },
  {
    name: "Health",
    count: "1,082",
    icon: HeartPulse,
  },
  {
    name: "Lifestyle",
    count: "1,762",
    icon: Leaf,
  },
  {
    name: "Sports",
    count: "824",
    icon: Trophy,
  },
  {
    name: "Society",
    count: "714",
    icon: Globe2,
  },
];

export function InterestCategories() {
  return (
    <section>
      <SectionHeading
        eyebrow="Explore"
        title="Explore by interest"
        description="Browse communities across the subjects people care about."
      />

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.name}
              className="
                group flex items-center gap-3
                rounded-xl border
                bg-white
                px-3 py-3.5
                text-left
                transition-all
                hover:-translate-y-0.5
                hover:border-brand-desert
                hover:shadow-sm
              "
            >
              <div
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-brand-sand
                  text-brand-brown-700
                  transition-colors
                  group-hover:bg-brand-desert-light
                "
              >
                <Icon size={17} strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-brand-brown-900">
                  {category.name}
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {category.count} communities
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-bold tracking-tight text-brand-brown-950">
        {title}
      </h2>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}