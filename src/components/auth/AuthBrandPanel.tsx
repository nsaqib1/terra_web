"use client";

import { CheckCircle2, Globe2, Layers, ShieldCheck, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const FEATURED_TOPICS = [
  "Architecture",
  "AI Ethics",
  "Generative Tech",
  "Climate Tech",
  "Philosophy",
  "Indie Hacking",
  "Solarpunk",
  "Design Systems",
];

export function AuthBrandPanel() {
  const [activeTopic, setActiveTopic] = useState("AI Ethics");

  return (
    <section
      className="
        relative hidden
        w-[48%] min-h-screen
        overflow-hidden
        bg-brand-brown-950
        lg:flex lg:flex-col lg:justify-between
        p-10 xl:p-14
      "
    >
      {/* Background Radial Glows & Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Subtle SVG Grid Background */}
        <div
          className="
            absolute inset-0 opacity-[0.03]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:24px_24px]
          "
        />

        {/* Ambient Desert Light Glow */}
        <div
          className="
            absolute -top-24 -right-24
            h-[30rem] w-[30rem]
            rounded-full
            bg-brand-desert/15
            blur-[120px]
          "
        />
        <div
          className="
            absolute -bottom-32 -left-32
            h-[28rem] w-[28rem]
            rounded-full
            bg-brand-desert/10
            blur-[100px]
          "
        />
      </div>

      {/* Header / Logo */}
      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <div
            className="
              flex h-11 w-11
              items-center justify-center
              overflow-hidden
              rounded-2xl
              bg-gradient-to-br from-brand-desert to-brand-desert-dark
              shadow-lg shadow-brand-desert/20
              ring-1 ring-white/20
            "
          >
            <Image
              src="/logo.png"
              alt="Commons Logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Commons
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-desert/80">
              one community per interest
            </span>
          </div>
        </Link>


      </div>

      {/* Value Proposition & Interactive Hook */}
      <div className="relative z-10 my-auto py-8 max-w-lg">

        <h1
          className="
            mt-6
            text-4xl
            font-black
            leading-[1.12]
            tracking-tight
            text-white
            xl:text-5xl
          "
        >
          Where common <br />

          <span className="bg-gradient-to-r from-brand-desert via-amber-200 to-brand-desert bg-clip-text text-transparent">
            interests collide
          </span>
        </h1>

        <p className="mt-5 text-base leading-relaxed text-white/70">
          A place where people can come together to learn, discuss, ask questions, share experiences, contribute knowledge, and help one another.
        </p>

        {/* Dynamic Interest Selector Tag Cloud */}
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">
            Explore Communities
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FEATURED_TOPICS.map((topic) => {
              const isSelected = activeTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setActiveTopic(topic)}
                  className={`
                    rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                    ${isSelected
                      ? "bg-brand-desert text-brand-brown-950 font-bold shadow-md shadow-brand-desert/20 scale-105"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                    }
                  `}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>


      </div>


    </section>
  );
}