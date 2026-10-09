"use client";

import { Check, ChevronDown, Compass, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { communitiesApi } from "@/lib/api/communities";
import type { JoinedCommunity } from "@/lib/api/types";

interface CommunitySelectorProps {
  /** Community id (UUID) — empty string means nothing selected. */
  value: string;
  onChange: (id: string) => void;
}

/**
 * Curated warm, earthen palettes for community avatars.
 */
const AVATAR_PALETTES = [
  { bg: "bg-amber-100 text-amber-900 border-amber-200/90" },
  { bg: "bg-orange-100 text-orange-950 border-orange-200/90" },
  { bg: "bg-emerald-100 text-emerald-950 border-emerald-200/90" },
  { bg: "bg-stone-200 text-stone-900 border-stone-300/90" },
  { bg: "bg-yellow-100 text-yellow-950 border-yellow-200/90" },
  { bg: "bg-rose-100 text-rose-950 border-rose-200/90" },
];

function getPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function CommunitySelector({
  value,
  onChange,
}: CommunitySelectorProps) {
  const [mounted, setMounted] = useState(false);
  // Show modal immediately if no community is selected yet
  const [isRendered, setIsRendered] = useState(!value);
  const [isVisible, setIsVisible] = useState(false);

  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState<JoinedCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Can the user close/cancel the modal? Only if a community is already selected.
  const canClose = Boolean(value);

  // Client-only portal mount guard + smooth initial entrance if mandatory
  useEffect(() => {
    setMounted(true);
    if (!value) {
      setIsRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    }
  }, [value]);

  // Fetch joined communities once
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

  // Open modal with smooth entrance
  function openModal() {
    setSearch("");
    setIsRendered(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
  }

  // Close modal with smooth exit transition
  function closeModal() {
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
    }, 200);
  }

  // Focus search input smoothly without jumping
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Lock background body scroll and prevent page shift
  useEffect(() => {
    if (!isRendered) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isRendered]);

  // Handle Escape key (only if already selected)
  useEffect(() => {
    if (!isRendered || !canClose) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, canClose]);

  const selected = communities.find((community) => community.id === value);
  const filtered = communities.filter((community) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      community.name.toLowerCase().includes(q) ||
      community.slug.toLowerCase().includes(q)
    );
  });

  function chooseCommunity(id: string) {
    onChange(id);
    closeModal();
  }

  return (
    <>
      {/* Trigger Button in the Form */}
      <div className="relative">
        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-brown-700">
          Community
        </label>
        <button
          type="button"
          disabled={isLoading}
          onClick={openModal}
          className={`
            mt-1.5 flex h-14 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left transition-all
            ${
              selected
                ? "border-brand-sand hover:border-brand-desert hover:shadow-xs"
                : "border-brand-sand-dark/80 hover:border-brand-desert hover:bg-brand-warm-white"
            }
            focus:border-brand-desert focus:outline-none focus:ring-2 focus:ring-brand-desert/25
            disabled:cursor-not-allowed disabled:opacity-60
          `}
          aria-haspopup="dialog"
          aria-expanded={isRendered}
        >
          {isLoading ? (
            <div className="flex flex-1 items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-brand-sand" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 animate-pulse rounded bg-brand-sand" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-brand-sand/70" />
              </div>
            </div>
          ) : selected ? (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold shadow-xs ${
                  getPalette(selected.name).bg
                }`}
              >
                {initials(selected.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-brown-950">
                  {selected.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  c/{selected.slug}
                </p>
              </div>
              <span className="rounded-lg bg-brand-sand/80 px-2.5 py-1 text-xs font-medium text-brand-brown-800 transition group-hover:bg-brand-sand">
                Change
              </span>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-dashed border-brand-sand-dark bg-brand-sand/50 text-brand-brown-600">
                <Compass size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-brand-brown-800">
                  Select a community
                </p>
                <p className="text-xs text-muted-foreground">
                  Required to publish your post
                </p>
              </div>
            </div>
          )}
          <ChevronDown
            size={18}
            className="ml-2 shrink-0 text-muted-foreground transition-transform duration-200"
          />
        </button>

        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>

      {/* Animated Modal Dialog Portal */}
      {mounted &&
        isRendered &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-3 sm:p-5 md:p-6"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100dvh",
            }}
          >
            {/* Full-bleed Backdrop */}
            <div
              className={`fixed inset-0 -inset-y-12 bg-brand-brown-950/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{
                position: "fixed",
                top: "-40px",
                bottom: "-40px",
                left: 0,
                right: 0,
              }}
              onClick={() => {
                if (canClose) closeModal();
              }}
              aria-hidden="true"
            />

            {/* Streamlined Modal Dialog Card */}
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={`
                relative z-10 flex max-h-[min(88dvh,700px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-sand bg-white shadow-[0_24px_80px_rgba(43,34,24,0.28)] transition-all duration-200 ease-out sm:rounded-3xl
                ${
                  isVisible
                    ? "scale-100 opacity-100 translate-y-0"
                    : "scale-[0.96] opacity-0 translate-y-3"
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Clean Header */}
              <div className="flex items-start justify-between border-b border-brand-sand/60 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2
                      id={titleId}
                      className="text-lg font-bold tracking-tight text-brand-brown-950 sm:text-xl"
                    >
                      Select a community
                    </h2>
                    {communities.length > 0 && (
                      <span className="rounded-full bg-brand-sand px-2.5 py-0.5 text-xs font-semibold text-brand-brown-700">
                        {communities.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {canClose
                      ? "Switch the community for your post"
                      : "Choose where to publish your post to get started"}
                  </p>
                </div>

                {/* Close Button (only available if user already has a community selected) */}
                {canClose && (
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close modal"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-brand-brown-700 transition hover:bg-brand-sand active:scale-95"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="px-5 pt-4 pb-2 sm:px-7">
                <div className="relative">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by community name or handle..."
                    aria-label="Search communities"
                    className="h-11 w-full rounded-xl border border-brand-sand bg-brand-cream/80 pl-10 pr-10 text-sm text-brand-brown-950 outline-none transition placeholder:text-muted-foreground focus:border-brand-desert focus:bg-white focus:ring-2 focus:ring-brand-desert/20"
                  />
                  {search.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        searchInputRef.current?.focus({ preventScroll: true });
                      }}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-brand-sand hover:text-brand-brown-950"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Streamlined Communities Grid */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3 sm:px-7 sm:py-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex h-20 items-center gap-3 rounded-2xl border border-brand-sand bg-brand-cream/60 p-3.5"
                      >
                        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-brand-sand" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-3/4 animate-pulse rounded bg-brand-sand" />
                          <div className="h-2.5 w-1/2 animate-pulse rounded bg-brand-sand/70" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoading(true);
                        setError(null);
                        communitiesApi
                          .listJoined()
                          .then((data) => setCommunities(data))
                          .catch(() => setError("Could not load communities."))
                          .finally(() => setIsLoading(false));
                      }}
                      className="mt-3 rounded-lg border border-brand-sand bg-white px-3 py-1.5 text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
                    >
                      Try again
                    </button>
                  </div>
                ) : filtered.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                    {filtered.map((community) => {
                      const active = community.id === value;
                      const palette = getPalette(community.name);

                      return (
                        <button
                          key={community.id}
                          type="button"
                          onClick={() => chooseCommunity(community.id)}
                          className={`
                            group relative flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-150
                            ${
                              active
                                ? "border-brand-desert bg-brand-desert/10 shadow-xs ring-1 ring-brand-desert/60"
                                : "border-brand-sand bg-white hover:-translate-y-0.5 hover:border-brand-desert/80 hover:bg-brand-warm-white hover:shadow-xs active:translate-y-0"
                            }
                          `}
                        >
                          {/* Distinctive Avatar */}
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xs font-bold shadow-xs ${palette.bg}`}
                          >
                            {initials(community.name)}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1 pr-6">
                            <p className="truncate text-sm font-semibold text-brand-brown-950 group-hover:text-brand-brown-900">
                              {community.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              c/{community.slug}
                            </p>
                          </div>

                          {/* Active Checkmark */}
                          {active && (
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-brown-950 text-white shadow-xs">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sand/70 text-brand-brown-700">
                      <Compass size={24} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-brand-brown-950">
                      {search.trim()
                        ? `No matches for "${search.trim()}"`
                        : "You haven’t joined any communities yet"}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      {search.trim()
                        ? "Check your spelling or try searching for another community name."
                        : "You must join a community before you can publish a post."}
                    </p>
                    {search.trim() ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          searchInputRef.current?.focus({ preventScroll: true });
                        }}
                        className="mt-4 rounded-xl border border-brand-sand bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
                      >
                        Clear search filter
                      </button>
                    ) : (
                      <Link
                        href="/communities"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-brown-800"
                      >
                        Join communities
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Streamlined Footer (shown only when changing an already selected community) */}
              {canClose && (
                <div className="flex items-center justify-end border-t border-brand-sand/70 bg-brand-cream/60 px-5 py-3 sm:px-7">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-brand-sand bg-white px-4 py-1.5 text-xs font-semibold text-brand-brown-800 transition hover:bg-brand-sand active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}


