"use client";

import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CommunitiesHero() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-white">
      {/* Decorative desert shape */}
      <div
        className="
          pointer-events-none absolute
          -right-24 -top-32
          h-80 w-80
          rounded-full
          bg-brand-desert-light/50
          blur-2xl
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-32 -left-20
          h-64 w-64
          rounded-full
          bg-brand-sand
        "
      />

      <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">

        <div
          className="
            mx-auto flex h-12 w-12
            items-center justify-center
            rounded-2xl
            bg-brand-desert-light
            text-xl
          "
        >
          🐪
        </div>

        <h1
          className="
            mx-auto mt-5 max-w-3xl
            text-3xl font-bold
            tracking-[-0.035em]
            text-brand-brown-950
            sm:text-4xl
            lg:text-5xl
          "
        >
          Find the place where
          <span className="text-brand-desert-dark">
            {" "}your interests belong.
          </span>
        </h1>

        <p
          className="
            mx-auto mt-4 max-w-2xl
            text-sm leading-6
            text-brand-brown-600
            sm:text-base
          "
        >
          Every field of human interest deserves a permanent community.
          Discover the shared homes where people learn, contribute,
          collaborate, and build knowledge together.
        </p>

        {/* Search */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative">

            <Search
              size={19}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-brand-brown-600
              "
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search communities..."
              className="
                h-14 w-full
                rounded-2xl
                border
                bg-brand-cream
                pl-11 pr-4
                text-sm
                text-brand-brown-950
                outline-none
                placeholder:text-brand-brown-600/60
                focus:border-brand-desert-dark
                focus:ring-4
                focus:ring-brand-desert-light/50
              "
            />

          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">
            Try:
          </span>

          {["Artificial Intelligence", "Photography", "Gardening", "SSC Preparation"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="
                  rounded-full
                  bg-brand-sand
                  px-3 py-1.5
                  text-xs font-medium
                  text-brand-brown-700
                  transition-colors
                  hover:bg-brand-desert-light
                "
              >
                {item}
              </button>
            ),
          )}
        </div>

        <div className="mt-8">
          <Button
            variant="outline"
            className="
              rounded-xl
              border-brand-sand-dark
              bg-white
              font-semibold
              text-brand-brown-800
              hover:bg-brand-sand
            "
          >
            Can't find your interest?
            <ArrowRight size={15} />
          </Button>
        </div>

      </div>
    </section>
  );
}