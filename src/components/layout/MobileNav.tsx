"use client";

import {
  Compass,
  Home,
  LogOut,
  Plus,
  X,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { communitiesApi } from "@/lib/api/communities";
import { JoinedCommunity } from "@/lib/api/types";
import { Logo } from "../brand/Logo";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { key: "common.home", icon: Home, href: "/" },
  { key: "common.exploreCommunities", icon: Compass, href: "/communities" },
  { key: "common.tools", icon: Wrench, href: "/tools" },
] as const;

function communityInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { t } = useLanguage();
  const [communities, setCommunities] = useState<JoinedCommunity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || authLoading || !isAuthenticated) return;

    let cancelled = false;
    setLoading(true);

    communitiesApi
      .listJoined()
      .then((joined) => {
        if (!cancelled) setCommunities(joined);
      })
      .catch(() => {
        if (!cancelled) setCommunities([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, authLoading, isAuthenticated]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] sm:hidden" role="dialog" aria-modal="true" aria-label={t("common.navigationMenu")}>
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown-950/35 backdrop-blur-[2px]"
        aria-label={t("common.closeNavigation")}
      />

      <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col border-r border-brand-sand-dark bg-brand-cream shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b bg-white/90 px-4">
          <div className="flex items-center gap-2.5">
            <Logo />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-brown-700 transition-colors hover:bg-brand-sand"
            aria-label={t("common.closeNavigation")}
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm
                    transition-colors
                    ${active
                      ? "bg-brand-sand font-semibold text-brand-brown-950"
                      : "font-medium text-brand-brown-700 hover:bg-brand-sand/70 hover:text-brand-brown-950"
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="my-5 h-px bg-border/60" />

          <div>
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {t("common.myCommunities")}
              </span>

              <Link
                href="/communities/propose"
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-brand-sand hover:text-brand-brown-950"
                aria-label={t("common.proposeCommunity")}
              >
                <Plus size={15} />
              </Link>
            </div>

            {loading && (
              <div className="space-y-1">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-brand-sand" />
                    <div className="h-3 w-28 animate-pulse rounded bg-brand-sand" />
                  </div>
                ))}
              </div>
            )}

            {!loading && communities.length === 0 && (
              <div className="rounded-xl border border-dashed border-brand-sand-dark bg-white/50 px-3 py-3">
                <p className="text-xs leading-5 text-brand-brown-600">
                  {t("common.notJoinedYet")}
                </p>
                <Link
                  href="/communities"
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-brown-900"
                >
                  {t("common.exploreCommunities")}
                  <Compass size={13} />
                </Link>
              </div>
            )}

            {!loading && communities.length > 0 && (
              <div className="space-y-1">
                {communities.map((community) => {
                  const href = `/community/${community.slug}`;
                  const active = pathname === href;

                  return (
                    <Link
                      key={community.id}
                      href={href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors
                        ${active ? "bg-brand-sand font-semibold" : "hover:bg-brand-sand/70"}
                      `}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-desert-light text-[10px] font-bold text-brand-brown-800">
                        {communityInitials(community.name)}
                      </div>
                      <span className="truncate text-sm text-brand-brown-800">
                        {community.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-white/70 p-3">
          <button
            type="button"
            onClick={async () => {
              onClose();
              await logout();
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <LogOut size={16} />
            {t("common.logout")}
          </button>
        </div>
      </aside>
    </div>
  );
}
