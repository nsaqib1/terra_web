import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface DiscussionHeaderProps {
  community: string;
  communitySlug: string;
  title: string;
  author: string;
  time: string;
  tags: string[];
}

export function DiscussionHeader({
  community,
  communitySlug,
  title,
  author,
  time,
  tags,
}: DiscussionHeaderProps) {
  return (
    <header className="rounded-2xl border bg-white p-5 sm:p-7">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs">

        <Link
          href={`/community/${communitySlug}`}
          className="
            font-semibold
            text-brand-brown-700
            hover:text-brand-brown-950
          "
        >
          {community}
        </Link>

        <ChevronRight
          size={13}
          className="text-muted-foreground"
        />

        <span className="text-muted-foreground">
          Discussion
        </span>

      </div>

      {/* Title */}
      <h1
        className="
          mt-5
          max-w-4xl
          text-2xl
          font-bold
          leading-tight
          tracking-[-0.025em]
          text-brand-brown-950
          sm:text-3xl
        "
      >
        {title}
      </h1>

      {/* Author */}
      <div className="mt-5 flex items-center gap-3">

        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-full
            bg-brand-desert-light
            text-[10px]
            font-bold
            text-brand-brown-800
          "
        >
          {getInitials(author)}
        </div>

        <div>
          <div className="flex items-center gap-1.5">

            <span className="text-xs font-semibold text-brand-brown-900">
              {author}
            </span>

            <ShieldCheck
              size={13}
              className="text-brand-desert-dark"
            />

          </div>

          <p className="text-[11px] text-muted-foreground">
            {time}
          </p>
        </div>

      </div>

      {/* Tags */}
      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/communities?tag=${encodeURIComponent(tag)}`}
            className="
              rounded-full
              bg-brand-sand
              px-3 py-1.5
              text-[11px]
              font-semibold
              text-brand-brown-700
              transition-colors
              hover:bg-brand-desert-light
              hover:text-brand-brown-950
            "
          >
            #{tag}
          </Link>
        ))}
      </div>

    </header>
  );
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}