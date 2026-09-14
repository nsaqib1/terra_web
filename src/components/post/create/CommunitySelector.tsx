"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { communitiesApi } from "@/lib/api/communities";
import { JoinedCommunity } from "@/lib/api/types";

interface CommunitySelectorProps {
  /** Community id (UUID) — empty string means nothing selected. */
  value: string;
  onChange: (id: string) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function CommunitySelector({
  value,
  onChange,
}: CommunitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState<JoinedCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    communitiesApi.listJoined().then((data) => {
      if (!cancelled) {
        setCommunities(data);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setError("Could not load communities.");
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const selected = communities.find((c) => c.id === value);

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-brand-brown-900">
        Community
      </label>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Only communities you&apos;ve joined appear here.
      </p>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => setOpen((current) => !current)}
        className="
          mt-2 flex h-12 w-full items-center gap-3
          rounded-xl border
          bg-white px-3
          text-left
          hover:border-brand-desert
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        {isLoading ? (
          <div className="flex flex-1 items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-brand-sand" />
            <div className="h-3 w-32 animate-pulse rounded bg-brand-sand" />
          </div>
        ) : selected ? (
          <>
            <div
              className="
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-lg
                bg-brand-desert-light
                text-[10px] font-bold
                text-brand-brown-800
              "
            >
              {initials(selected.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-brown-950">
                {selected.name}
              </p>

              <p className="text-[10px] capitalize text-muted-foreground">
                {selected.role.toLowerCase()}
              </p>
            </div>
          </>
        ) : (
          <span className="flex-1 text-sm text-muted-foreground">
            Choose a community
          </span>
        )}

        <ChevronDown
          size={17}
          className="shrink-0 text-muted-foreground"
        />
      </button>

      {error && (
        <p className="mt-1.5 text-[11px] text-red-500">{error}</p>
      )}

      {open && (
        <div
          className="
            absolute z-30 mt-2 w-full
            overflow-hidden
            rounded-2xl border
            bg-white
            shadow-[0_15px_40px_rgba(72,64,48,0.12)]
          "
        >
          <div className="border-b p-3">
            <div className="relative">
              <Search
                size={15}
                className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search communities..."
                className="
                  h-9 w-full rounded-lg
                  bg-brand-cream
                  pl-9 pr-3
                  text-xs
                  outline-none
                  placeholder:text-muted-foreground
                "
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.map((community) => {
              const active = community.id === value;

              return (
                <button
                  key={community.id}
                  type="button"
                  onClick={() => {
                    onChange(community.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="
                    flex w-full items-center gap-3
                    rounded-xl p-2.5
                    text-left
                    hover:bg-brand-sand
                  "
                >
                  <div
                    className="
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-lg
                      bg-brand-desert-light
                      text-[10px] font-bold
                      text-brand-brown-800
                    "
                  >
                    {initials(community.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-brand-brown-950">
                      {community.name}
                    </p>

                    <p className="text-[10px] capitalize text-muted-foreground">
                      {community.role.toLowerCase()}
                    </p>
                  </div>

                  {active && (
                    <Check
                      size={15}
                      className="text-brand-desert-dark"
                    />
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && !isLoading && (
              <p className="p-4 text-center text-xs text-muted-foreground">
                {search
                  ? "No communities match your search."
                  : "You haven't joined any communities yet."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
