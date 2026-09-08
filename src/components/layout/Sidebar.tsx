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

const joinedCommunities = [
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    short: "AI",
  },
  {
    name: "Programming",
    slug: "programming",
    short: "PR",
  },
  {
    name: "Photography",
    slug: "photography",
    short: "PH",
  },
  {
    name: "Entrepreneurship",
    slug: "entrepreneurship",
    short: "EN",
  },
];

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[230px] shrink-0 lg:block">
      <div className="sticky top-20 space-y-6">
        {/* Main Feeds */}
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

        {/* Joined Communities */}
        <div>
          <div className="mb-2 flex items-center justify-between px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Your Communities
            </span>

            <Link
              href="/communities/create"
              className="
                rounded-md p-1
                text-muted-foreground transition-colors
                hover:bg-brand-sand hover:text-brand-brown-950
              "
              title="Create a community"
              aria-label="Create community"
            >
              <Plus size={15} />
            </Link>
          </div>

          <div className="space-y-1">
            {joinedCommunities.map((community) => {
              const href = `/c/${community.slug}`;
              const isActive = pathname === href;

              return (
                <Link
                  key={community.slug}
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
                    {community.short}
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

        {/* User Account & Activity */}
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