"use client";

import {
  Bookmark,
  Compass,
  FileText,
  Home,
  Library,
  Plus,
  Settings,
  Users,
} from "lucide-react";

import Link from "next/link";

const communities = [
  {
    name: "Artificial Intelligence",
    short: "AI",
  },
  {
    name: "Programming",
    short: "PR",
  },
  {
    name: "Photography",
    short: "PH",
  },
  {
    name: "Entrepreneurship",
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
    label: "Communities",
    icon: Compass,
    href: "/communities",
  },
  {
    label: "Knowledge",
    icon: Library,
    href: "/knowledge",
  },
  {
    label: "Bookmarks",
    icon: Bookmark,
    href: "/bookmarks",
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 lg:block">
      <div className="sticky top-20">

        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="
                  flex h-10 items-center gap-3 rounded-xl
                  px-3 text-sm font-medium
                  text-brand-brown-700
                  transition-colors
                  hover:bg-brand-sand
                  hover:text-brand-brown-950
                "
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="my-5 h-px bg-border" />

        {/* My communities */}
        <div>
          <div className="mb-2 flex items-center justify-between px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Your Communities
            </span>

            <button
              className="
                rounded-md p-1
                text-muted-foreground
                hover:bg-brand-sand
                hover:text-brand-brown-950
              "
              aria-label="Add community"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="space-y-1">
            {communities.map((community) => (
              <Link
                href="#"
                key={community.name}
                className="
                  flex items-center gap-3 rounded-xl px-3 py-2
                  transition-colors
                  hover:bg-brand-sand
                "
              >
                <div
                  className="
                    flex h-7 w-7 shrink-0 items-center justify-center
                    rounded-lg
                    bg-brand-desert-light
                    text-[10px] font-bold
                    text-brand-brown-800
                  "
                >
                  {community.short}
                </div>

                <span className="truncate text-sm text-brand-brown-700">
                  {community.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="my-5 h-px bg-border" />

        {/* Citizen */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Your Activity
          </div>

          <Link
            href="#"
            className="
              flex h-10 items-center gap-3 rounded-xl px-3
              text-sm font-medium text-brand-brown-700
              hover:bg-brand-sand
            "
          >
            <FileText size={18} strokeWidth={1.8} />
            My Contributions
          </Link>

          <Link
            href="#"
            className="
              flex h-10 items-center gap-3 rounded-xl px-3
              text-sm font-medium text-brand-brown-700
              hover:bg-brand-sand
            "
          >
            <Users size={18} strokeWidth={1.8} />
            My Citizenship
          </Link>

          <Link
            href="#"
            className="
              flex h-10 items-center gap-3 rounded-xl px-3
              text-sm font-medium text-brand-brown-700
              hover:bg-brand-sand
            "
          >
            <Settings size={18} strokeWidth={1.8} />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}