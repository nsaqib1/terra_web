"use client";

import {
  CalendarDays,
  Check,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface CommunityHeaderProps {
  name: string;
  description: string;
  citizens: string;
  discussions: string;
  established: string;
  joined?: boolean;
}

export function CommunityHeader({
  name,
  description,
  citizens,
  discussions,
  established,
  joined = false,
}: CommunityHeaderProps) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white">
      {/* Brand strip */}
      <div className="h-2 bg-brand-desert" />

      <div className="p-6 sm:p-8">

        {/* Identity */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex min-w-0 gap-4">

            {/* Community mark */}
            <div
              className="
                flex h-16 w-16 shrink-0 items-center justify-center
                rounded-2xl
                bg-brand-desert-light
                text-lg font-bold
                text-brand-brown-800
                sm:h-20 sm:w-20 sm:text-xl
              "
            >
              AI
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950 sm:text-3xl">
                  {name}
                </h1>

                <span
                  className="
                    inline-flex items-center gap-1
                    rounded-full
                    bg-brand-sand
                    px-2 py-1
                    text-[10px] font-bold
                    uppercase tracking-wide
                    text-brand-brown-700
                  "
                >
                  <ShieldCheck size={12} />
                  Canonical
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-brown-600">
                {description}
              </p>
            </div>
          </div>

          {/* Join */}
          <Button
            className="
              h-10 shrink-0 rounded-xl
              bg-brand-desert
              px-5
              font-semibold
              text-brand-brown-950
              shadow-none
              hover:bg-brand-desert-dark
            "
          >
            {joined ? (
              <>
                <Check size={16} />
                Citizen
              </>
            ) : (
              "Become a Citizen"
            )}
          </Button>

        </div>

        {/* Stats */}
        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-t pt-5">

          <Stat
            icon={<Users size={15} />}
            value={citizens}
            label="Citizens"
          />

          <Stat
            value={discussions}
            label="Discussions"
          />

          <Stat
            icon={<CalendarDays size={15} />}
            value={established}
            label="Established"
          />

        </div>

      </div>
    </section>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon?: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <span className="text-brand-brown-600">
          {icon}
        </span>
      )}

      <span className="text-sm font-bold text-brand-brown-950">
        {value}
      </span>

      <span className="text-xs text-muted-foreground">
        {label}
      </span>
    </div>
  );
}