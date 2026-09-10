"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Users, FileText, ArrowUpRight, Compass, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { communitiesApi } from "@/lib/api/communities";
import { CommunityDetail } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

function getCommunityInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatCount(count?: number | null): string {
  if (count === undefined || count === null) return "0";
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<CommunityDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCommunities = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await communitiesApi.listAll();
      setCommunities(data || []);
    } catch (err: any) {
      setErrorMessage(
        extractErrorMessage(err) || "Failed to load communities."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] space-y-8">
        {/* Streamlined Header & Actions (Propose community is static for now) */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950">
              Communities
            </h1>
            <p className="mt-1 text-xs text-brand-brown-700">
              Explore topic hubs or propose a new space for your community.
            </p>
          </div>

          <button className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-brown-950 px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
            <Plus size={16} />
            <span>Propose a Community</span>
          </button>
        </div>

        {/* Focused Controls: Search Bar (Static for now) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search Communities by name, topic, or tag..."
              className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-brand-brown-950 placeholder-muted-foreground outline-none focus:border-brand-brown-700 transition-colors"
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dynamic Community Grid */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-44 rounded-2xl border bg-white p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-brand-sand/60 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 rounded bg-brand-sand/60" />
                    <div className="h-3 w-full rounded bg-brand-sand/40" />
                    <div className="h-3 w-2/3 rounded bg-brand-sand/30" />
                  </div>
                </div>
                <div className="border-t pt-3 flex gap-3">
                  <div className="h-3 w-16 rounded bg-brand-sand/40" />
                  <div className="h-3 w-16 rounded bg-brand-sand/40" />
                </div>
              </div>
            ))}
          </div>
        ) : communities.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => {
              const initials = getCommunityInitials(community.name);
              const membersFormatted = formatCount(community._count?.memberships);
              const postsFormatted = formatCount(community._count?.posts);

              return (
                <Link
                  key={community.id || community.slug}
                  href={`/community/${community.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all hover:border-brand-brown-700/40 hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]"
                >
                  <div>
                    {/* Header: Initials, Name & Arrow */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-desert-light text-base font-black text-brand-brown-900 group-hover:bg-brand-sand transition-colors">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-bold text-sm text-brand-brown-950 group-hover:underline truncate">
                            {community.name}
                          </h2>
                        </div>
                      </div>

                      <ArrowUpRight
                        size={16}
                        className="text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-brown-950"
                      />
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs leading-relaxed text-brand-brown-800 line-clamp-2">
                      {community.description || "No description provided."}
                    </p>
                  </div>

                  {/* Card Footer: Metrics */}
                  <div className="mt-5 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-brand-brown-700" />
                          <strong className="text-brand-brown-950">
                            {membersFormatted}
                          </strong>
                          <span>Members</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileText size={12} className="text-brand-brown-700" />
                          <strong className="text-brand-brown-950">
                            {postsFormatted}
                          </strong>
                          <span>Posts</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-desert-light text-brand-brown-800">
              <Compass size={24} />
            </div>
            <h3 className="mt-3 text-base font-bold text-brand-brown-950">
              No communities found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              There are no active communities available at the moment.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}