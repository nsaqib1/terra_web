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
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCreatePostCommunity } from "@/context/CreatePostCommunityContext";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";
import { CommunitySelector } from "@/components/post/create/CommunitySelector";

function getPageTitle(pathname: string, t: (key: import("@/i18n").TranslationKey) => string): string {
  if (pathname === "/") return t("common.home");
  if (pathname === "/communities") return t("common.communities");
  if (pathname === "/tools" || pathname.startsWith("/tools/")) return t("common.tools");
  if (pathname === "/games" || pathname.startsWith("/games/")) return t("common.games");
  if (pathname === "/communities/propose") return t("pages.proposeCommunity");
  if (pathname === "/posts/create") return t("common.createPost");
  if (pathname === "/posts/manage") return t("pages.myPosts");
  if (pathname.startsWith("/posts/") && pathname.endsWith("/edit")) return t("pages.editPost");
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return t("common.profile");
  if (pathname === "/notifications") return t("common.notifications");
  if (pathname.startsWith("/community/")) return t("pages.community");
  if (pathname.startsWith("/admin")) return t("pages.admin");
  return "Terramids";
}


function LanguageToggle({
  language,
  onChange,
  saving,
  fullWidth = false,
}: {
  language: "EN" | "BN";
  onChange: (language: "EN" | "BN") => Promise<void>;
  saving: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center rounded-lg border border-brand-sand-dark bg-brand-cream p-0.5 ${fullWidth ? "w-full" : "shrink-0"}`}
      aria-label="Choose language"
      aria-busy={saving}
    >
      <button
        type="button"
        onClick={() => void onChange("EN")}
        aria-pressed={language === "EN"}
        className={`flex-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${language === "EN" ? "bg-brand-brown-950 text-white shadow-sm" : "text-brand-brown-700 hover:bg-brand-sand"}`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => void onChange("BN")}
        aria-pressed={language === "BN"}
        className={`flex-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${language === "BN" ? "bg-brand-brown-950 text-white shadow-sm" : "text-brand-brown-700 hover:bg-brand-sand"}`}
      >
        বাংলা
      </button>
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { language, setLanguage, t, isLanguageSaving } = useLanguage();
  const { setCommunityId } = useCreatePostCommunity();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCommunityPicker, setShowCommunityPicker] = useState(false);

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
            aria-label={t("common.openNavigation")}
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
              {getPageTitle(pathname, t)}
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
                placeholder={t("common.search")}
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
                <LanguageToggle language={language} onChange={setLanguage} saving={isLanguageSaving} />
                <Link href="/login">
                  <Button variant="ghost" className="h-9 rounded-xl px-3.5 text-xs font-bold text-brand-brown-800 hover:bg-brand-sand">
                    {t("common.login")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="h-9 rounded-xl bg-brand-brown-950 px-3.5 text-xs font-bold text-white shadow-sm hover:bg-brand-brown-900">
                    {t("common.signup")}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {user ? (
                  <>
                    {pathname !== "/posts/create" && (
                      <button
                        type="button"
                        onClick={() => setShowCommunityPicker(true)}
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand-brown-950 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-brown-900"
                      >
                        <PenLine size={15} />
                        <span className="hidden sm:inline">{t("common.createPost")}</span>
                        <span className="sr-only sm:hidden">{t("common.createPost")}</span>
                      </button>
                    )}
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
                              {user.points.toLocaleString(language === "BN" ? "bn-BD" : "en-US")} {t("common.points")}
                            </div>
                          </div>

                          {user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setShowDropdown(false)}
                              className="mb-1 mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-50"
                            >
                              <Shield size={15} className="text-amber-700" />
                              {t("common.adminConsole")}
                            </Link>
                          )}

                          <div className="px-2.5 py-2">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-brown-600">{t("common.language")}</p>
                            <LanguageToggle language={language} onChange={setLanguage} saving={isLanguageSaving} fullWidth />
                          </div>

                          <Link
                            href="/posts/manage"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-brand-brown-800 transition-colors hover:bg-brand-sand"
                          >
                            <LayoutList size={15} />
                            {t("common.managePosts")}
                          </Link>

                          <Link
                            href="/profile"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-brand-brown-800 transition-colors hover:bg-brand-sand"
                          >
                            <UserIcon size={15} />
                            {t("common.profile")}
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
                            {t("common.logout")}
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

      {showCommunityPicker && (
        <div className="hidden">
          <CommunitySelector
            value=""
            onChange={(communityId) => {
              setCommunityId(communityId);
              setShowCommunityPicker(false);
              router.push("/posts/create");
            }}
            onClose={() => setShowCommunityPicker(false)}
            allowCloseWithoutSelection
          />
        </div>
      )}

      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
