"use client";

import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";

import { tagsApi } from "@/lib/api/tags";
import { Tag } from "@/lib/api/types";

interface TagPickerProps {
  /** Community id (UUID). Pass empty string when no community is selected. */
  communityId: string;
  /** Selected tag ids (UUIDs). */
  selected: string[];
  onToggle: (tagId: string) => void;
}

export function TagPicker({
  communityId,
  selected,
  onToggle,
}: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      setTags([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    tagsApi
      .list({ communityId, limit: 50 })
      .then((res) => {
        if (!cancelled) {
          setTags(res.data.filter((t) => t.status === "ACTIVE"));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load tags.");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [communityId]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Bookmark
          size={14}
          className="text-brand-desert-dark"
        />
        <label className="text-sm font-semibold text-brand-brown-900">
          Tags
        </label>
        <span className="text-[10px] font-medium text-muted-foreground">
          Optional
        </span>
      </div>

      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
        Choose from this community&apos;s vocabulary so others can find
        your post. Tags are not free-form hashtags.
      </p>

      {selected.length > 0 && (
        <p className="mt-2 text-[10px] font-medium text-brand-brown-700">
          {selected.length} selected
        </p>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 animate-pulse rounded-full bg-brand-sand"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 text-[11px] text-red-500">{error}</p>
      )}

      {/* Empty state — community selected but has no tags */}
      {!isLoading && !error && communityId && tags.length === 0 && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          This community has no tags yet.
        </p>
      )}

      {/* No community selected */}
      {!communityId && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Select a community first to see available tags.
        </p>
      )}

      {/* Tag pills */}
      {!isLoading && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = selected.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggle(tag.id)}
                aria-pressed={active}
                className={`
                  rounded-full
                  border
                  px-3 py-1.5
                  text-xs font-semibold
                  transition-colors
                  ${active
                    ? "border-brand-desert bg-brand-desert-light text-brand-brown-900"
                    : "border-transparent bg-brand-sand/70 text-brand-brown-700 hover:border-brand-desert hover:bg-brand-sand"
                  }
                `}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
