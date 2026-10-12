"use client";

import {
  LayoutList,
  LogOut,
  Menu,
  PenLine,
  Search,
  Shield,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname === "/communities") return "Communities";
  if (pathname === "/tools" || pathname.startsWith("/tools/")) return "Tools";
  if (pathname === "/games" || pathname.startsWith("/games/")) return "Games";
  if (pathname === "/communities/propose") return "Propose Community";
  if (pathname === "/posts/create") return "Create Post";
  if (pathname === "/posts/manage") return "My Posts";
  if (pathname.startsWith("/posts/") && pathname.endsWith("/edit")) return "Edit Post";
  if (pathname === "/profile") return "Profile";
  if (pathname === "/notifications") return "Notifications";
  if (pathname.startsWith("/profile/")) return "Profile";
  if (pathname.startsWith("/community/")) return "Community";
  if (pathname.startsWith("/admin")) return "Admin";
  return "Terramids";
}

export function TopBar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-full max-w-[1600px] items-center gap-3 px-4 lg:gap-4 lg:px-6">
          {/* Mobile menu + compact brand */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="
              flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
              text-brand-brown-800 transition-colors hover:bg-brand-sand
              sm:hidden
            "
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={21} strokeWidth={2} />
          </button>

          <div className="w-auto shrink-0 lg:w-59.5">
            <div className="hidden sm:block">
              <Logo />
            </div>
            <div className="sm:hidden">
              <Logo compact />
            </div>
          </div>

          {/* Mobile current-page title */}
          <div className="min-w-0 flex-1 sm:hidden">
            <p className="truncate text-sm font-bold text-brand-brown-950">
              {getPageTitle(pathname)}
            </p>
          </div>

          {/* Desktop search */}
          <div className="hidden max-w-2xl flex-1 md:block xl:ml-[clamp(0px,calc((100vw-1346px)/2),127px)] 2xl:ml-0">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown-600"
              />
              <input
                type="search"
                placeholder="Search communities, discussions & knowledge..."
                className="
                  h-10 w-full rounded-xl border bg-brand-cream pl-10 pr-4
                  text-sm text-brand-brown-950 outline-none
                  placeholder:text-brand-brown-600/70
                  focus:border-brand-desert-dark focus:ring-2
                  focus:ring-brand-desert-light
                "
              />
            </div>
          </div>

          {/* Right */}
          <div className="ml-auto flex items-center gap-2">
            {!isLoading && !isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="h-9 rounded-xl px-3.5 text-xs font-bold text-brand-brown-800 hover:bg-brand-sand">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="h-9 rounded-xl bg-brand-brown-950 px-3.5 text-xs font-bold text-white shadow-sm hover:bg-brand-brown-900">
                    Sign up
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {user ? (
                  <>
                    <Link
                      href="/posts/create"
                      className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand-brown-950 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-brown-900"
                    >
                      <PenLine size={15} />
                      <span className="hidden sm:inline">Create Post</span>
                      <span className="sr-only sm:hidden">Create Post</span>
                    </Link>
                    <NotificationBell />
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full transition-shadow hover:ring-2 hover:ring-brand-desert-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-desert-dark"
                        aria-label={`Open profile menu for ${user.displayName}`}
                        aria-expanded={showDropdown}
                        aria-haspopup="true"
                      >
                        <Avatar className="h-9 w-9 border border-brand-sand-dark">
                          {user.avatarUrl && (
                            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                          )}
                          <AvatarFallback className="bg-brand-desert text-xs font-bold text-brand-brown-950">
                            {getInitials(user.displayName || user.username)}
                          </AvatarFallback>
                        </Avatar>
                      </button>

                      {showDropdown && (
                        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-brand-sand-dark/80 bg-white p-1.5 shadow-xl shadow-brand-brown-950/10 animate-in fade-in slide-in-from-top-2">
                          <div className="border-b border-brand-sand/70 bg-brand-cream/60 px-3.5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 shrink-0 border border-brand-sand-dark">
                                {user.avatarUrl && (
                                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                                )}
                                <AvatarFallback className="bg-brand-desert text-xs font-bold text-brand-brown-950">
                                  {getInitials(user.displayName || user.username)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <p className="truncate text-sm font-bold text-brand-brown-950">
                                    {user.displayName}
                                  </p>
                                  {user.role === "ADMIN" && (
                                    <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-amber-800">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-desert-light px-2.5 py-1 text-[11px] font-semibold text-brand-brown-900">
                              <Sparkles size={13} />
                              {user.points.toLocaleString()} points
                            </div>
                          </div>

                          {user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setShowDropdown(false)}
                              className="mb-1 mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-50"
                            >
                              <Shield size={15} className="text-amber-700" />
                              Admin Console
                            </Link>
                          )}

                          <Link
                            href="/posts/manage"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-brand-brown-800 transition-colors hover:bg-brand-sand"
                          >
                            <LayoutList size={15} />
                            Manage Posts
                          </Link>

                          <Link
                            href="/profile"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-brand-brown-800 transition-colors hover:bg-brand-sand"
                          >
                            <UserIcon size={15} />
                            Profile
                          </Link>

                          <button
                            type="button"
                            onClick={async () => {
                              setShowDropdown(false);
                              await logout();
                            }}
                            className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-brand-sand/70 px-3 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                          >
                            <LogOut size={15} />
                            Log out
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-9 w-9 animate-pulse rounded-full bg-brand-sand" />
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
