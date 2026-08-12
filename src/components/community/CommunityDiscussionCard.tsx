import {
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";

interface CommunityDiscussionCardProps {
  title: string;
  excerpt: string;
  author: string;
  time: string;
  tags: string[];
  helpful: number;
  comments: number;
  verified?: boolean;
}

export function CommunityDiscussionCard({
  title,
  excerpt,
  author,
  time,
  tags,
  helpful,
  comments,
  verified = false,
}: CommunityDiscussionCardProps) {
  return (
    <article
      className="
        rounded-2xl
        border
        bg-white
        p-5
        transition-shadow
        hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]
      "
    >
      {/* Author */}
      <div className="flex items-center">

        <div
          className="
            flex h-8 w-8 items-center justify-center
            rounded-full
            bg-brand-desert-light
            text-[10px] font-bold
            text-brand-brown-800
          "
        >
          NS
        </div>

        <div className="ml-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-brand-brown-900">
              {author}
            </span>

            {verified && (
              <span className="text-[10px] text-brand-desert-dark">
                ●
              </span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            {time}
          </p>
        </div>

        <button
          className="
            ml-auto rounded-lg p-1.5
            text-muted-foreground
            hover:bg-brand-sand
          "
        >
          <MoreHorizontal size={17} />
        </button>

      </div>

      {/* Discussion */}
      <div className="mt-4">
        <h3 className="text-[17px] font-bold leading-snug text-brand-brown-950">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-brand-brown-600">
          {excerpt}
        </p>
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            className="
              rounded-full
              bg-brand-sand
              px-2.5 py-1
              text-[11px] font-semibold
              text-brand-brown-700
              hover:bg-brand-desert-light
            "
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-1 border-t pt-4">

        <button
          className="
            rounded-lg px-3 py-1.5
            text-xs font-semibold
            text-brand-brown-700
            hover:bg-brand-sand
            hover:text-brand-brown-950
          "
        >
          ↑ {helpful} Helpful
        </button>

        <button
          className="
            flex items-center gap-1.5
            rounded-lg px-3 py-1.5
            text-xs font-semibold
            text-brand-brown-700
            hover:bg-brand-sand
            hover:text-brand-brown-950
          "
        >
          <MessageCircle size={15} />
          {comments}
        </button>

        <div className="ml-auto flex items-center gap-1">

          <button
            className="
              rounded-lg p-2
              text-muted-foreground
              hover:bg-brand-sand
              hover:text-brand-brown-950
            "
            aria-label="Save"
          >
            <Bookmark size={15} />
          </button>

          <button
            className="
              rounded-lg p-2
              text-muted-foreground
              hover:bg-brand-sand
              hover:text-brand-brown-950
            "
            aria-label="Share"
          >
            <Share2 size={15} />
          </button>

        </div>
      </div>
    </article>
  );
}