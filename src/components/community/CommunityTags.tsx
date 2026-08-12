import { Hash } from "lucide-react";

interface CommunityTagsProps {
  tags: string[];
}

export function CommunityTags({ tags }: CommunityTagsProps) {
  return (
    <section className="rounded-2xl border bg-white p-5">

      <div className="flex items-center gap-2">
        <Hash size={16} className="text-brand-desert-dark" />

        <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-brand-brown-700">
          Popular contexts
        </h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            className="
              rounded-full
              border
              bg-brand-sand
              px-3 py-1.5
              text-xs font-semibold
              text-brand-brown-700
              transition-colors
              hover:border-brand-desert
              hover:bg-brand-desert-light
              hover:text-brand-brown-950
            "
          >
            #{tag}
          </button>
        ))}
      </div>

    </section>
  );
}