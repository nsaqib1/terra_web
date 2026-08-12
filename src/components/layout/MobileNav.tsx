"use client";

import {
  Compass,
  Home,
  Library,
  User,
} from "lucide-react";

import Link from "next/link";

const items = [
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
    label: "Profile",
    icon: User,
    href: "/profile",
  },
];

export function MobileNav() {
  return (
    <nav
      className="
        fixed bottom-0 inset-x-0 z-50
        border-t bg-white/95 backdrop-blur
        lg:hidden
      "
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="
                flex min-w-[64px] flex-col items-center gap-1
                text-muted-foreground
                transition-colors
                hover:text-brand-brown-950
              "
            >
              <Icon size={20} strokeWidth={1.8} />

              <span className="text-[10px] font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}