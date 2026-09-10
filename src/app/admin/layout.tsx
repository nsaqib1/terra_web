"use client";

import {
  ArrowLeft,
  Compass,
  FileCheck2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Tag,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Communities",
    href: "/admin/communities",
    icon: Compass,
  },
  {
    label: "Proposals",
    href: "/admin/proposals",
    icon: FileCheck2,
  },
  {
    label: "Tags",
    href: "/admin/tags",
    icon: Tag,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const currentRouteTitle = () => {
    if (pathname === "/admin") return "Overview";
    if (pathname.startsWith("/admin/communities")) return "Communities";
    if (pathname.startsWith("/admin/proposals")) return "Proposals";
    if (pathname.startsWith("/admin/tags")) return "Tags";
    return "Admin Console";
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-brand-cream text-brand-brown-950">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-brand-sand-dark bg-white">
          {/* Brand Header */}
          <div className="flex h-16 items-center gap-3 border-b border-brand-sand-dark px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-desert text-brand-brown-950 shadow-xs font-bold text-sm">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-brand-brown-950 block">
                Commons
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-desert-dark block">
                Admin Console
              </span>
            </div>
          </div>

          {/* Nav List */}
          <div className="flex-1 space-y-6 px-3 py-6">
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-brown-600/70 block mb-2">
                Management
              </span>

              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-10 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-brand-sand text-brand-brown-950 font-bold shadow-2xs"
                        : "text-brand-brown-700 hover:bg-brand-sand/60 hover:text-brand-brown-950"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={isActive ? "text-brand-desert-dark" : ""}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Nav / User */}
          <div className="border-t border-brand-sand-dark p-3 space-y-2">
            <Link
              href="/"
              className="flex h-10 items-center gap-3 rounded-xl px-3 text-xs font-semibold text-brand-brown-700 hover:bg-brand-sand/60 hover:text-brand-brown-950 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Commons</span>
            </Link>

            {user && (
              <div className="flex items-center justify-between rounded-xl bg-brand-sand/40 p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 border border-brand-sand-dark shrink-0">
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                    )}
                    <AvatarFallback className="bg-brand-desert text-[10px] font-bold text-brand-brown-950">
                      {getInitials(user.displayName || user.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-brand-brown-950 leading-tight">
                      {user.displayName}
                    </p>
                    <span className="inline-block rounded-xs bg-amber-100 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-800 leading-none mt-0.5">
                      Admin
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => logout()}
                  title="Log out"
                  className="rounded-lg p-1.5 text-brand-brown-600/70 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-brand-sand-dark bg-white/95 px-4 lg:px-8 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-lg p-2 text-brand-brown-700 hover:bg-brand-sand"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-brand-brown-600">
                <span className="hidden sm:inline">Admin</span>
                <span className="hidden sm:inline text-brand-sand-dark">/</span>
                <span className="font-bold text-brand-brown-950">
                  {currentRouteTitle()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
                >
                  <Home size={13} />
                  <span className="hidden sm:inline">Live Site</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-x-0 top-16 z-50 border-b border-brand-sand-dark bg-white p-4 shadow-xl animate-in slide-in-from-top-2">
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex h-10 items-center gap-3 rounded-xl px-3 text-xs font-semibold ${
                        isActive
                          ? "bg-brand-sand text-brand-brown-950 font-bold"
                          : "text-brand-brown-700 hover:bg-brand-sand/60"
                      }`}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="pt-3 border-t border-brand-sand/60">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 items-center gap-3 rounded-xl px-3 text-xs font-semibold text-brand-brown-700"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Commons</span>
                  </Link>
                </div>
              </nav>
            </div>
          )}

          {/* Main Page Body */}
          <main className="flex-1 p-4 lg:p-8 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
