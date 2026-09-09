"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";

interface Community {
  slug: string;
  name: string;
  initials: string;
  citizens: string;
}

interface CommunitySelectorProps {
  value: string;
  onChange: (slug: string) => void;
}

const communities: Community[] = [
  {
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    initials: "AI",
    citizens: "2.4M",
  },
  {
    slug: "photography",
    name: "Photography",
    initials: "PH",
    citizens: "1.8M",
  },
  {
    slug: "programming",
    name: "Programming",
    initials: "PR",
    citizens: "1.4M",
  },
  {
    slug: "gardening",
    name: "Gardening",
    initials: "GA",
    citizens: "680K",
  },
];

export function CommunitySelector({
  value,
  onChange,
}: CommunitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = communities.find(
    (community) => community.slug === value,
  );

  const filtered = communities.filter((community) =>
    community.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-brand-brown-900">
        Community
      </label>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Every post lives in one community.
      </p>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="
          mt-2 flex h-12 w-full items-center gap-3
          rounded-xl border
          bg-white px-3
          text-left
          hover:border-brand-desert
        "
      >
        {selected ? (
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
              {selected.initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-brown-950">
                {selected.name}
              </p>

              <p className="text-[10px] text-muted-foreground">
                {selected.citizens} citizens
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
              const active = community.slug === value;

              return (
                <button
                  key={community.slug}
                  type="button"
                  onClick={() => {
                    onChange(community.slug);
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
                    {community.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-brand-brown-950">
                      {community.name}
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      {community.citizens} citizens
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

            {filtered.length === 0 && (
              <p className="p-4 text-center text-xs text-muted-foreground">
                No communities found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
