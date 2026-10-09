"use client";

import {
  Bookmark,
  Check,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { tagsApi } from "@/lib/api/tags";
import type { Tag } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

const MAX_TAGS = 5;

interface TagPickerProps {
  communityId: string;
  selected: string[];
  onToggle: (tagId: string) => void;
  onCreated?: (tag: Tag) => void;
}

function normalizeTagName(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

function tagKey(value: string) {
  return normalizeTagName(value).toLocaleLowerCase();
}

export function TagPicker({
  communityId,
  selected,
  onToggle,
  onCreated,
}: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [knownTags, setKnownTags] = useState<Record<string, Tag>>({});
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTags([]);
    setKnownTags({});
    setQuery("");
    setError(null);
    setNotice(null);
    setIsOpen(false);
  }, [communityId]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        pickerRef.current &&
        event.target instanceof Node &&
        !pickerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!communityId) {
      setTags([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setError(null);

      tagsApi
        .list({ communityId, q: query.trim() || undefined, limit: 20 })
        .then((response) => {
          if (!cancelled) {
            const activeTags = response.data.filter((tag) => tag.status === "ACTIVE");
            setTags(activeTags);
            setKnownTags((current) => ({
              ...current,
              ...Object.fromEntries(activeTags.map((tag) => [tag.id, tag])),
            }));
          }
        })
        .catch(() => {
          if (!cancelled) setError("Couldn't load topics. Please try again.");
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, query.trim() ? 180 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [communityId, query]);

  const normalizedQuery = normalizeTagName(query);
  const duplicate = tags.find((tag) => tagKey(tag.name) === tagKey(normalizedQuery));
  const atLimit = selected.length >= MAX_TAGS;

  async function createTag() {
    const name = normalizeTagName(query);
    if (!communityId || !name || duplicate || atLimit || isCreating) return;

    setIsCreating(true);
    setError(null);
    setNotice(null);

    try {
      const tag = await tagsApi.createForCommunity({
        communityId,
        name,
      });
      setTags((current) => [
        tag,
        ...current.filter((item) => item.id !== tag.id),
      ]);
      setKnownTags((current) => ({ ...current, [tag.id]: tag }));
      onToggle(tag.id);
      onCreated?.(tag);
      setQuery("");
      setNotice(`Created topic “${tag.name}”.`);
      setIsOpen(false);
      inputRef.current?.blur();
    } catch (cause) {
      const message = extractErrorMessage(cause);
      // A concurrent user may have created the same tag after our search.
      if (/already exists|already been taken|duplicate/i.test(message)) {
        setNotice("A matching topic already exists. Choose it from the results.");
        try {
          const response = await tagsApi.list({
            communityId,
            q: name,
            limit: 20,
          });
          const activeTags = response.data.filter((tag) => tag.status === "ACTIVE");
          setTags(activeTags);
          setKnownTags((current) => ({
            ...current,
            ...Object.fromEntries(activeTags.map((tag) => [tag.id, tag])),
          }));
        } catch {
          // Keep the original message if refresh also fails.
        }
      } else {
        setError(message || "Couldn't create this topic. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (duplicate) {
        if (!atLimit && !selected.includes(duplicate.id)) onToggle(duplicate.id);
        setQuery("");
      } else {
        void createTag();
      }
    }
    if (event.key === "Escape") {
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <section aria-labelledby="post-topics-label">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bookmark size={15} className="text-brand-desert-dark" />
          <label
            id="post-topics-label"
            htmlFor="post-topic-search"
            className="text-sm font-semibold text-brand-brown-900"
          >
            Topics
          </label>
          <span className="text-[11px] text-muted-foreground">Optional</span>
        </div>
        <span className={`text-[11px] font-medium ${atLimit ? "text-brand-brown-900" : "text-muted-foreground"}`}>
          {selected.length}/{MAX_TAGS}
        </span>
      </div>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Add a few topics so people can discover your post. Search existing topics or create a new one.
      </p>

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((tagId) => {
            const tag = knownTags[tagId];
            return (
              <span
                key={tagId}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-desert/60 bg-brand-desert-light px-3 py-1.5 text-xs font-semibold text-brand-brown-950"
              >
                {tag?.name ?? "Selected topic"}
                <button
                  type="button"
                  onClick={() => onToggle(tagId)}
                  aria-label={`Remove ${tag?.name ?? "topic"}`}
                  className="rounded-full p-0.5 hover:bg-white/70"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div ref={pickerRef} className="relative mt-3">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          id="post-topic-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setNotice(null);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          disabled={!communityId || atLimit}
          placeholder={
            !communityId
              ? "Choose a community first"
              : atLimit
                ? "You’ve reached the 5-topic limit"
                : "Search or create a topic…"
          }
          maxLength={100}
          autoComplete="off"
          className="h-11 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-brand-brown-950 outline-none transition focus:border-brand-desert focus:ring-2 focus:ring-brand-desert/20 disabled:cursor-not-allowed disabled:bg-brand-cream/60"
        />
        {isLoading ? (
          <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear topic search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-brand-brown-950"
          >
            <X size={14} />
          </button>
        )}

      {!communityId && (
        <p className="mt-2 text-xs text-muted-foreground">Choose a community to see its topics.</p>
      )}

      {isOpen && communityId && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border bg-white shadow-[0_14px_36px_rgba(72,64,48,0.14)]">
          {error && (
            <p role="alert" className="px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          {!error && !isLoading && tags.length === 0 && !normalizedQuery && (
            <p className="px-3 py-3 text-xs text-muted-foreground">
              No topics yet. Be the first to create one.
            </p>
          )}

          {!isLoading && tags.map((tag) => {
            const active = selected.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                disabled={!active && atLimit}
                onClick={() => {
                  onToggle(tag.id);
                  if (!active) setQuery("");
                }}
                className="flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-brand-cream/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-sand text-brand-brown-700">
                  <Bookmark size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-brand-brown-950">{tag.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {tag.usageCount === 1 ? "Used in 1 post" : `Used in ${tag.usageCount} posts`}
                  </span>
                </span>
                {active ? (
                  <Check size={16} className="text-brand-desert-dark" />
                ) : (
                  <Plus size={15} className="text-muted-foreground" />
                )}
              </button>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Searching topics…
            </div>
          )}

          {!isLoading && normalizedQuery && !duplicate && !error && (
            <button
              type="button"
              onClick={() => void createTag()}
              disabled={isCreating || atLimit || normalizedQuery.length < 2}
              className="flex w-full items-center gap-3 border-t bg-brand-cream/40 px-3 py-3 text-left hover:bg-brand-desert-light/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-desert-light text-brand-brown-900">
                {isCreating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-brand-brown-950">
                  {isCreating ? "Creating topic…" : `Create “${normalizedQuery}”`}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Add this topic to the selected community
                </span>
              </span>
            </button>
          )}

          {!isLoading && duplicate && normalizedQuery && !selected.includes(duplicate.id) && (
            <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">
              A matching topic already exists. Select it above instead of creating a duplicate.
            </p>
          )}

          {atLimit && (
            <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">
              You can add up to {MAX_TAGS} topics. Remove one to choose another.
            </p>
          )}
        </div>
      )}
      </div>

      {error && !isOpen && (
        <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {notice && <p role="status" className="mt-2 text-xs text-brand-brown-700">{notice}</p>}
    </section>
  );
}
