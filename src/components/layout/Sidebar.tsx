"use client";

import {
  Compass,
  FileText,
  Flame,
  Home,
  Plus,
  Settings,
  User,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { communitiesApi } from "@/lib/api/communities";
import { JoinedCommunity } from "@/lib/api/types";

const mainNavigation = [
  {
    label: "Home",
    icon: Home,
    href: "/home",
  },
  {
    label: "Popular",
    icon: Flame,
    href: "/popular",
  },
  {
    label: "Explore Communities",
    icon: Compass,
    href: "/communities",
  },
];

const accountNavigation = [
  {
    label: "My Posts",
    icon: FileText,
    href: "/profile/posts",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

function communityInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [communities, setCommunities] = useState<JoinedCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setCommunities([]);
      setHasError(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadJoinedCommunities() {
      setIsLoading(true);
      setHasError(false);

      try {
        const joined = await communitiesApi.listJoined();
        if (!cancelled) {
          setCommunities(joined);
        }
      } catch {
        if (!cancelled) {
          setCommunities([]);
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadJoinedCommunities();

    const handleMembershipChanged = () => {
      void loadJoinedCommunities();
    };

    window.addEventListener("community-membership-changed", handleMembershipChanged);

    return () => {
      cancelled = true;
      window.removeEventListener("community-membership-changed", handleMembershipChanged);
    };
  }, [authLoading, isAuthenticated]);

  return (
    <aside className="hidden w-[230px] shrink-0 lg:block">
      <div className="sticky top-20 space-y-6">
        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium
                  transition-colors
                  ${isActive
                    ? "bg-brand-sand font-semibold text-brand-brown-950"
                    : "text-brand-brown-700 hover:bg-brand-sand/60 hover:text-brand-brown-950"
                  }
                `}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="h-px bg-border/60" />

        <div>
          <div className="mb-2 flex items-center justify-between px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              My Communities
            </span>

            <Link
              href="/communities/propose"
              className="
                rounded-md p-1
                text-muted-foreground transition-colors
                hover:bg-brand-sand hover:text-brand-brown-950
              "
              title="Propose a community"
              aria-label="Propose a community"
            >
              <Plus size={15} />
            </Link>
          </div>

          <div className="max-h-64 space-y-1 overflow-y-auto">
            {(authLoading || isLoading) && (
              <>
                <CommunityRowSkeleton />
                <CommunityRowSkeleton />
                <CommunityRowSkeleton />
              </>
            )}

            {!authLoading && !isLoading && !isAuthenticated && (
              <p className="px-3 py-2 text-[11px] leading-5 text-muted-foreground">
                <Link
                  href="/login"
                  className="font-semibold text-brand-brown-800 hover:underline"
                >
                  Sign in
                </Link>
                {" "}to see communities you have joined.
              </p>
            )}

            {!authLoading && !isLoading && isAuthenticated && hasError && (
              <p className="px-3 py-2 text-[11px] leading-5 text-muted-foreground">
                Couldn&apos;t load your communities.
              </p>
            )}

            {!authLoading && !isLoading && isAuthenticated && !hasError && communities.length === 0 && (
              <p className="px-3 py-2 text-[11px] leading-5 text-muted-foreground">
                You haven&apos;t joined a community yet.{" "}
                <Link
                  href="/communities"
                  className="font-semibold text-brand-brown-800 hover:underline"
                >
                  Explore
                </Link>
              </p>
            )}

            {!authLoading && !isLoading && communities.map((community) => {
              const href = `/community/${community.slug}`;
              const isActive = pathname === href;

              return (
                <Link
                  key={community.id}
                  href={href}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-2 transition-colors
                    ${isActive
                      ? "bg-brand-sand font-semibold text-brand-brown-950"
                      : "hover:bg-brand-sand/60"
                    }
                  `}
                >
                  <div
                    className="
                      flex h-7 w-7 shrink-0 items-center justify-center
                      rounded-lg bg-brand-desert-light
                      text-[10px] font-bold text-brand-brown-800
                    "
                  >
                    {communityInitials(community.name)}
                  </div>

                  <span className="truncate text-sm text-brand-brown-800">
                    {community.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border/60" />

        <div className="space-y-1">
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Account
          </div>

          {accountNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-brand-sand font-semibold text-brand-brown-950"
                    : "text-brand-brown-700 hover:bg-brand-sand/60 hover:text-brand-brown-950"
                  }
                `}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function CommunityRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2">
      <div className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-brand-sand" />
      <div className="h-3 w-28 animate-pulse rounded bg-brand-sand" />
    </div>
  );
}
