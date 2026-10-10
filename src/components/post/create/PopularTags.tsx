"use client";

import { Check, RefreshCw, Tags } from "lucide-react";
import { useEffect, useState } from "react";

import { tagsApi } from "@/lib/api/tags";
import type { Tag } from "@/lib/api/types";

const MAX_TAGS = 5;
const POPULAR_TAG_LIMIT = 8;

interface PopularTagsProps {
  communityId: string;
  selected: string[];
  onToggle: (tagId: string) => void;
}

export function PopularTags({ communityId, selected, onToggle }: PopularTagsProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setTags([]);
      if (!communityId) {
        setIsLoading(false);
        setHasError(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const response = await tagsApi.list({ communityId, limit: POPULAR_TAG_LIMIT });
        if (!cancelled) {
          setTags(response.data.filter((tag) => tag.status === "ACTIVE"));
        }
      } catch {
        if (!cancelled) setHasError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [communityId, retryCount]);

  const atLimit = selected.length >= MAX_TAGS;

  return (
    <aside className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Tags size={15} className="text-brand-desert-dark" />
          <h2 className="text-sm font-bold text-brand-brown-950">Popular tags</h2>
        </div>
        {communityId && hasError && (
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            title="Retry loading popular tags"
            aria-label="Retry loading popular tags"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-brown-600 transition-colors hover:bg-brand-sand hover:text-brand-brown-950"
          >
            <RefreshCw size={13} />
          </button>
        )}
      </div>

      <div className="mt-3">
        {!communityId ? (
          <p className="py-2 text-xs leading-5 text-muted-foreground">
            Select a community to see its popular tags.
          </p>
        ) : isLoading ? (
          <div className="space-y-2.5 py-1" aria-label="Loading popular tags">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="h-8 animate-pulse rounded-lg bg-brand-sand/70" />
            ))}
          </div>
        ) : hasError ? (
          <p role="alert" className="py-2 text-xs leading-5 text-red-600">
            Couldn’t load popular tags. Try again.
          </p>
        ) : tags.length === 0 ? (
          <p className="py-2 text-xs leading-5 text-muted-foreground">
            No tags yet. Create one while writing your post.
          </p>
        ) : (
          <div className="space-y-1">
            {tags.map((tag) => {
              const active = selected.includes(tag.id);
              const disabled = !active && atLimit;

              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={active}
                  disabled={disabled}
                  onClick={() => onToggle(tag.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                    active
                      ? "bg-brand-desert-light text-brand-brown-950"
                      : "text-brand-brown-800 hover:bg-brand-cream"
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white/80" : "bg-brand-sand/70"}`}>
                    {active ? <Check size={13} /> : <span className="text-xs font-semibold">#</span>}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold">{tag.name}</span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {tag.usageCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {communityId && !isLoading && !hasError && tags.length > 0 && (
        <p className="mt-3 border-t pt-3 text-[11px] leading-4 text-muted-foreground">
          {atLimit
            ? "Remove a selected tag to add another."
            : "Choose tags to add them to your post."}
        </p>
      )}
    </aside>
  );
}
