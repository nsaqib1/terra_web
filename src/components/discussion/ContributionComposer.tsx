"use client";

import {
  Image,
  Link2,
  Send,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ContributionComposer() {
  const [value, setValue] = useState("");

  return (
    <section className="rounded-2xl border bg-white p-5">

      <div className="flex items-center gap-3">

        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-full
            bg-brand-desert-light
            text-[10px]
            font-bold
            text-brand-brown-800
          "
        >
          NS
        </div>

        <div>
          <p className="text-xs font-bold text-brand-brown-950">
            Add a contribution
          </p>

          <p className="text-[10px] text-muted-foreground">
            Share an answer, experience, resource, or useful perspective.
          </p>
        </div>

      </div>

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="What would you like to contribute?"
        rows={5}
        className="
          mt-4
          w-full resize-none
          rounded-xl
          border
          bg-brand-cream
          p-4
          text-sm
          leading-6
          text-brand-brown-950
          outline-none
          placeholder:text-brand-brown-600/50
          focus:border-brand-desert-dark
          focus:ring-4
          focus:ring-brand-desert-light/40
        "
      />

      <div className="mt-3 flex items-center">

        <div className="flex items-center gap-1">

          <button
            className="
              rounded-lg p-2
              text-muted-foreground
              hover:bg-brand-sand
              hover:text-brand-brown-950
            "
            aria-label="Add image"
          >
            <Image size={17} />
          </button>

          <button
            className="
              rounded-lg p-2
              text-muted-foreground
              hover:bg-brand-sand
              hover:text-brand-brown-950
            "
            aria-label="Add link"
          >
            <Link2 size={17} />
          </button>

        </div>

        <Button
          disabled={!value.trim()}
          className="
            ml-auto
            gap-2
            rounded-xl
            bg-brand-desert
            font-semibold
            text-brand-brown-950
            shadow-none
            hover:bg-brand-desert-dark
          "
        >
          Contribute
          <Send size={14} />
        </Button>

      </div>

    </section>
  );
}