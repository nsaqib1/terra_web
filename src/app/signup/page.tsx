import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  Globe2,
  Landmark,
  MessageCircle,
  Network,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import { SignupForm } from "@/components/auth/SignupForm";

const PROBLEMS = [
  {
    icon: Network,
    title: "Communities are scattered",
    description:
      "The people, conversations, and knowledge around one interest are spread across dozens of places in the same platform",
  },
  {
    icon: Landmark,
    title: "Good communities disappear",
    description:
      "Groups often depend on a founder, moderator, platform, or algorithm. When that changes, the community can change with it.",
  },
  {
    icon: BookOpen,
    title: "Knowledge gets buried",
    description:
      "Years of useful answers and experience disappear into feeds instead of becoming a lasting body of community knowledge.",
  },
];

const PRINCIPLES = [
  {
    icon: Globe2,
    title: "One community for one interest",
    description:
      "Instead of endless duplicate groups, each meaningful subject can have a permanent Community.",
  },
  {
    icon: Users,
    title: "Built by its members",
    description:
      "Communities aren't personal properties. The people who contribute help shape their culture and future.",
  },
  {
    icon: MessageCircle,
    title: "Knowledge over noise",
    description:
      "Posts, conversations, Tags, and contribution history are designed to create something useful that lasts.",
  },
  {
    icon: Shield,
    title: "Protected for the long term",
    description:
      "Terramids provides the infrastructure and safeguards that help Communities remain discoverable and continuous.",
  },
];

export default function SignupPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-brand-cream text-brand-brown-950">
      {/* ================================================================
          HERO
      ================================================================= */}
      <section className="relative overflow-hidden border-b border-brand-sand-dark/70">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-desert/15 blur-[110px]" />
          <div className="absolute -bottom-60 right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-brand-desert-light/30 blur-[120px]" />

          <div
            className="
              absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(to_right,#594e3f_1px,transparent_1px),linear-gradient(to_bottom,#594e3f_1px,transparent_1px)]
              [background-size:48px_48px]
            "
          />
        </div>

        {/* Navigation */}
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-3"
          >
            <div
              className="
                flex h-10 w-10 items-center justify-center
                overflow-hidden rounded-xl
                bg-brand-desert
                shadow-sm
                ring-1 ring-brand-desert-dark/10
                transition-transform duration-200
                group-hover:scale-105
              "
            >
              <Image
                src="/logo.png"
                alt="Terramids"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>

            <span className="text-lg font-extrabold tracking-tight">
              Terramids
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-brand-desert-dark/15 bg-white/70 px-3 py-1.5 text-xs font-bold text-brand-brown-700 shadow-sm backdrop-blur sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-desert-dark" />
              Currently in beta
            </div>

            <Link
              href="/login"
              className="
                rounded-full border border-brand-sand-dark
                bg-white/80 px-4 py-2
                text-sm font-semibold text-brand-brown-800
                shadow-sm backdrop-blur
                transition hover:border-brand-desert-dark/40
                hover:bg-white
              "
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-20 lg:px-10 lg:pb-24 lg:pt-16 xl:grid-cols-[minmax(0,1fr)_480px]">
          {/* Left */}
          <div className="max-w-3xl">
            <Image src="/arch.png" alt="Terramids" width={700} height={350}></Image>
            <h1
              className="
                mt-7 max-w-3xl
                text-4xl font-black leading-[1.05]
                tracking-[-0.045em]
                text-brand-brown-950
                sm:text-5xl
                lg:text-6xl
              "
            >
              Next Generation
              <span className="block text-brand-desert-dark">
                Community Platform
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-brand-brown-600 sm:text-xl">
              Your interests deserve somewhere better than a disappearing feed,
              a private group, or another fragmented corner of the internet.
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-brand-brown-600">
              Terramids is building permanent digital Communities around the
              subjects people care about — places where knowledge can grow,
              conversations can continue, and people can contribute for years.
            </p>

            {/* Compact promise */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-brand-brown-700">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-desert/30">
                  <Check className="h-3 w-3" />
                </span>
                One community for one interest
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-desert/30">
                  <Check className="h-3 w-3" />
                </span>
                Built by it's members
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-desert/30">
                  <Check className="h-3 w-3" />
                </span>
                Made to last
              </div>
            </div>

            <a
              href="#why"
              className="
                mt-9 inline-flex items-center gap-2
                text-sm font-bold text-brand-brown-800
                transition-colors hover:text-brand-desert-dark
              "
            >
              See what we're building
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          {/* Signup card */}
          <div
            id="signup"
            className="
              relative
              rounded-[2rem]
              border border-brand-sand-dark
              bg-white/90
              p-6
              shadow-[0_24px_80px_rgba(47,41,31,0.12)]
              backdrop-blur-xl
              sm:p-8
            "
          >
            {/* Small beta indicator */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-brown-600">
                  Early access
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-brown-900">
                  Help build what comes next.
                </p>
              </div>

              
            </div>

            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center text-sm text-brand-brown-600">
                  Loading signup...
                </div>
              }
            >
              <SignupForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ================================================================
          PROBLEM
      ================================================================= */}
      <section
        id="why"
        className="border-b border-brand-sand-dark/70 bg-brand-warm-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-desert-dark">
              Why Terramids
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              We think the way we build communities online is broken.
            </h2>

            <p className="mt-5 text-base leading-7 text-brand-brown-600 sm:text-lg">
              Existing platforms make it easy for anyone to create a new community. The result is a fragmented internet — countless groups discussing the same things, with people and knowledge scattered between them.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PROBLEMS.map((problem) => {
              const Icon = problem.icon;

              return (
                <article
                  key={problem.title}
                  className="
                    rounded-3xl border border-brand-sand-dark
                    bg-white p-6
                    shadow-sm
                    transition duration-200
                    hover:-translate-y-1
                    hover:shadow-md
                  "
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-sand">
                    <Icon className="h-5 w-5 text-brand-brown-800" />
                  </div>

                  <h3 className="mt-6 text-lg font-extrabold tracking-tight">
                    {problem.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-brand-brown-600">
                    {problem.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          WHAT WE ARE BUILDING
      ================================================================= */}
      <section className="bg-brand-cream">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-24">
            <div className="lg:sticky lg:top-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-desert-dark">
                A different model
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                One permanent home for every meaningful interest.
              </h2>

              <p className="mt-5 text-base leading-7 text-brand-brown-600">
                Instead of creating another group, channel, or server every time
                people want to gather, Terramids gives an interest a persistent
                place on the internet.
              </p>

              <div className="mt-8 rounded-3xl border border-brand-desert/30 bg-brand-desert/10 p-5">
                <p className="text-sm font-bold leading-6 text-brand-brown-900">
                  “The goal isn't to create more places to post. It's to create
                  places worth returning to.”
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon;

                return (
                  <article
                    key={principle.title}
                    className="
                      rounded-3xl border border-brand-sand-dark
                      bg-white p-6
                    "
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-sand">
                      <Icon className="h-5 w-5 text-brand-brown-800" />
                    </div>

                    <h3 className="mt-5 font-extrabold tracking-tight">
                      {principle.title}
                    </h3>

                    <p className="mt-2.5 text-sm leading-6 text-brand-brown-600">
                      {principle.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          WHY JOIN
      ================================================================= */}
      <section className="border-t border-brand-sand-dark/70 bg-brand-brown-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-desert">
                Your place in it
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Don't just consume the internet.
                <span className="block text-brand-desert">
                  Help build somewhere worth staying.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                Join a Community around something you care about. Ask questions.
                Share what you know. Help someone else. Over time, your
                contributions become part of something larger than a single post
                or a single moment.
              </p>
            </div>

            <Link
              href="#signup"
              className="
                inline-flex shrink-0 items-center justify-center gap-2
                rounded-full
                bg-brand-desert
                px-6 py-3.5
                text-sm font-extrabold text-brand-brown-950
                shadow-lg shadow-brand-desert/10
                transition
                hover:bg-brand-desert-light
              "
            >
              Join the beta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================= */}
      <footer className="bg-brand-brown-950 px-5 pb-8 text-white/45 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            Terramids — permanent digital communities.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="transition hover:text-white"
            >
              Sign in
            </Link>

            <Link
              href="/"
              className="transition hover:text-white"
            >
              Home
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
