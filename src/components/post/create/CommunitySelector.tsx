"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import { communitiesApi } from "@/lib/api/communities";
import type { JoinedCommunity } from "@/lib/api/types";

interface CommunitySelectorProps {
  /** Community id (UUID) — empty string means nothing selected. */
  value: string;
  onChange: (id: string) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function CommunitySelector({
  value,
  onChange,
}: CommunitySelectorProps) {
  const [open, setOpen] = useState(!value);
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState<JoinedCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    communitiesApi
      .listJoined()
      .then((data) => {
        if (!cancelled) setCommunities(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load communities.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && value) setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, value]);

  const selected = communities.find((community) => community.id === value);
  const filtered = communities.filter((community) =>
    community.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function chooseCommunity(id: string) {
    onChange(id);
    setSearch("");
    setOpen(false);
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            setSearch("");
            setOpen(true);
          }}
          className="mt-2 flex h-12 w-full items-center gap-3 rounded-xl border bg-white px-3 text-left hover:border-brand-desert disabled:cursor-not-allowed disabled:opacity-60"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {isLoading ? (
            <div className="flex flex-1 items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-brand-sand" />
              <div className="h-3 w-32 animate-pulse rounded bg-brand-sand" />
            </div>
          ) : selected ? (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-desert-light text-[10px] font-bold text-brand-brown-800">
                {initials(selected.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-brown-950">
                  {selected.name}
                </p>
              </div>
            </>
          ) : (
            <span className="flex-1 text-sm text-muted-foreground">
              Select a community
            </span>
          )}
          <ChevronDown size={17} className="shrink-0 text-muted-foreground" />
        </button>
        {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-brown-950/40 p-3 backdrop-blur-[2px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && value) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-picker-title"
            className="flex max-h-[min(86vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-brand-sand bg-white shadow-[0_24px_80px_rgba(43,34,24,0.24)] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
              <h2
                id="community-picker-title"
                className="text-lg font-bold tracking-tight text-brand-brown-950 sm:text-xl"
              >
                Select a community
              </h2>
              {value && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close community selector"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-brand-brown-700 transition hover:bg-brand-sand"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="px-5 pb-4 sm:px-7">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search communities"
                  aria-label="Search communities"
                  className="h-11 w-full rounded-xl border border-brand-sand bg-brand-cream/70 pl-10 pr-4 text-sm text-brand-brown-950 outline-none transition placeholder:text-muted-foreground focus:border-brand-desert focus:bg-white focus:ring-2 focus:ring-brand-desert/15"
                  autoFocus
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-xl bg-brand-cream"
                    />
                  ))}
                </div>
              ) : error ? (
                <p className="py-10 text-center text-sm text-red-600">{error}</p>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {filtered.map((community) => {
                    const active = community.id === value;
                    return (
                      <button
                        key={community.id}
                        type="button"
                        onClick={() => chooseCommunity(community.id)}
                        className={`group relative flex min-h-28 items-center gap-3 rounded-xl border p-3 text-left transition sm:min-h-32 sm:flex-col sm:items-start sm:justify-between sm:p-4 ${
                          active
                            ? "border-brand-desert bg-brand-desert-light/60 ring-1 ring-brand-desert/40"
                            : "border-brand-sand bg-white hover:border-brand-desert/70 hover:bg-brand-cream/70"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-desert-light text-xs font-bold text-brand-brown-800 sm:h-11 sm:w-11">
                          {initials(community.name)}
                        </div>
                        <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-5 text-brand-brown-950 sm:pr-5">
                          {community.name}
                        </span>
                        {active && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-brown-950 text-white sm:right-4 sm:top-4">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    {search.trim()
                      ? "No communities found."
                      : "You haven’t joined any communities yet."}
                  </p>
                  {!search.trim() && (
                    <Link
                      href="/communities"
                      className="mt-3 inline-flex text-sm font-semibold text-brand-brown-800 underline decoration-brand-desert underline-offset-4 hover:text-brand-brown-950"
                    >
                      Explore communities
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
