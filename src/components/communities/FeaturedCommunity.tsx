import { ArrowUpRight, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

interface FeaturedCommunityProps {
  name: string;
  description: string;
  citizens: string;
  discussions: string;
  initials: string;
  tags: string[];
}

export function FeaturedCommunity({
  name,
  description,
  citizens,
  discussions,
  initials,
  tags,
}: FeaturedCommunityProps) {
  return (
    <Link
      href="#"
      className="
        group relative block overflow-hidden
        rounded-2xl border
        bg-white
        p-5
        transition-all
        hover:-translate-y-0.5
        hover:border-brand-desert
        hover:shadow-[0_10px_30px_rgba(72,64,48,0.08)]
      "
    >
      {/* Small accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-desert" />

      <div className="flex items-start justify-between gap-3">

        <div
          className="
            flex h-12 w-12
            items-center justify-center
            rounded-xl
            bg-brand-desert-light
            text-sm font-bold
            text-brand-brown-800
          "
        >
          {initials}
        </div>

        <ArrowUpRight
          size={17}
          className="
            text-muted-foreground
            transition-transform
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
          "
        />

      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <h3 className="text-base font-bold text-brand-brown-950">
          {name}
        </h3>

        <ShieldCheck
          size={14}
          className="text-brand-desert-dark"
        />
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-brand-brown-600">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users size={13} />
          {citizens} citizens
        </span>

        <span>
          {discussions} discussions
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="
              rounded-full
              bg-brand-sand
              px-2 py-1
              text-[10px] font-medium
              text-brand-brown-700
            "
          >
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}