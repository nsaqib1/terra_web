"use client";

import {
  ChevronDown,
  LogOut,
  Search,
  Shield,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function TopBar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-4 px-4 lg:px-6">
        {/* Logo */}
        <div className="w-auto shrink-0 lg:w-[220px]">
          <div className="hidden sm:block">
            <Logo />
          </div>

          <div className="sm:hidden">
            <Logo compact />
          </div>
        </div>

        {/* Search */}
        <div className="hidden max-w-2xl flex-1 md:block">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown-600"
            />

            <input
              type="search"
              placeholder="Search communities, discussions & knowledge..."
              className="
                h-10
                w-full
                rounded-xl
                border
                bg-brand-cream
                pl-10
                pr-4
                text-sm
                text-brand-brown-950
                outline-none
                placeholder:text-brand-brown-600/70
                focus:border-brand-desert-dark
                focus:ring-2
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
                <Button
                  variant="ghost"
                  className="
                    h-9
                    rounded-xl
                    px-3.5
                    text-xs
                    font-bold
                    text-brand-brown-800
                    hover:bg-brand-sand
                  "
                >
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  className="
                    h-9
                    rounded-xl
                    bg-brand-brown-950
                    px-3.5
                    text-xs
                    font-bold
                    text-white
                    shadow-sm
                    hover:bg-brand-brown-900
                  "
                >
                  Sign up
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="
                      ml-1 flex items-center gap-2
                      rounded-xl p-1
                      text-left
                      transition-colors
                      hover:bg-brand-sand/60
                    "
                  >
                    <Avatar className="h-9 w-9 border border-brand-sand-dark">
                      {user.avatarUrl && (
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={user.displayName}
                        />
                      )}
                      <AvatarFallback className="bg-brand-desert text-xs font-bold text-brand-brown-950">
                        {getInitials(user.displayName || user.username)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="hidden text-left lg:block">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold leading-none text-brand-brown-950">
                          {user.displayName}
                        </p>
                        {user.role === "ADMIN" && (
                          <span className="rounded-xs bg-amber-100 px-1 py-0.2 text-[8px] font-bold uppercase text-amber-800 leading-none">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {user.points.toLocaleString()} points
                      </p>
                    </div>

                    <ChevronDown
                      size={16}
                      className="hidden text-muted-foreground lg:block"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div
                      className="
                        absolute right-0 top-12
                        w-48
                        rounded-xl
                        border border-brand-sand-dark
                        bg-white
                        p-1.5
                        shadow-lg
                        animate-in fade-in slide-in-from-top-2
                        z-50
                      "
                    >
                      <div className="border-b border-brand-sand/60 px-3 py-2 lg:hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-brand-brown-950">
                            {user.displayName}
                          </p>
                          {user.role === "ADMIN" && (
                            <span className="rounded-xs bg-amber-100 px-1 py-0.2 text-[8px] font-bold uppercase text-amber-800 leading-none">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="
                            flex items-center gap-2
                            rounded-lg px-3 py-2
                            text-xs font-bold
                            text-amber-900 bg-amber-50/70
                            hover:bg-amber-100/70
                            mb-1
                          "
                        >
                          <Shield size={15} className="text-amber-700" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="
                          flex items-center gap-2
                          rounded-lg px-3 py-2
                          text-xs font-semibold
                          text-brand-brown-800
                          hover:bg-brand-sand
                        "
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
                        className="
                          flex w-full items-center gap-2
                          rounded-lg px-3 py-2
                          text-xs font-semibold
                          text-red-700
                          hover:bg-red-50
                        "
                      >
                        <LogOut size={15} />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-9 w-9 animate-pulse rounded-full bg-brand-sand" />
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}