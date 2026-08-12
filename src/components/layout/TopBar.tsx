"use client";

import {
  Bell,
  ChevronDown,
  Search,
  User,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function TopBar() {
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
        <div className="ml-auto flex items-center gap-1">

          <Button
            variant="ghost"
            size="icon"
            className="text-brand-brown-700 hover:bg-brand-sand"
          >
            <Bell size={19} />
          </Button>

          <div className="ml-1 hidden items-center gap-2 sm:flex">
            <Avatar className="h-9 w-9 border border-brand-sand-dark">
              <AvatarFallback className="bg-brand-desert text-brand-brown-950">
                NS
              </AvatarFallback>
            </Avatar>

            <div className="hidden lg:block">
              <p className="text-sm font-semibold leading-none">
                Najmus
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                12,482 reputation
              </p>
            </div>

            <ChevronDown size={16} className="text-muted-foreground" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
          >
            <User size={19} />
          </Button>

        </div>
      </div>
    </header>
  );
}