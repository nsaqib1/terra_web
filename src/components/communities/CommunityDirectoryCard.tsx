import {
  ArrowUpRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

interface CommunityDirectoryCardProps {
  name: string;
  description: string;
  citizens: string;
  category: string;
  established: string;
  initials: string;
}

export function CommunityDirectoryCard({
  name,
  description,
  citizens,
  category,
  established,
  initials,
}: CommunityDirectoryCardProps) {
  return (
    <Link
      href="#"
      className="
        group flex gap-4
        rounded-2xl border
        bg-white
        p-4
        transition-all
        hover:border-brand-desert
        hover:shadow-sm
      "
    >
      <div
        className="
          flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl
          bg-brand-sand
          text-xs font-bold
          text-brand-brown-800
          transition-colors
          group-hover:bg-brand-desert-light
        "
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-sm font-bold text-brand-brown-950">
            {name}
          </h3>

          <ShieldCheck
            size={13}
            className="shrink-0 text-brand-desert-dark"
          />
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-brand-brown-600">
          {description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {citizens}
          </span>

          <span>{category}</span>

          <span>Established {established}</span>
        </div>

      </div>

      <ArrowUpRight
        size={16}
        className="
          mt-1 shrink-0
          text-muted-foreground
          transition-all
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-brand-brown-950
        "
      />
    </Link>
  );
}