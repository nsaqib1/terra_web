"use client";

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
  Users,
} from "lucide-react";

import { SignupForm } from "@/components/auth/SignupForm";
import { GuestLanguageSelector } from "@/components/layout/GuestLanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

const PROBLEMS = [
  { icon: Network, titleKey: "landing.problemOneTitle", descriptionKey: "landing.problemOneDescription" },
  { icon: Landmark, titleKey: "landing.problemTwoTitle", descriptionKey: "landing.problemTwoDescription" },
  { icon: BookOpen, titleKey: "landing.problemThreeTitle", descriptionKey: "landing.problemThreeDescription" },
] as const;

const PRINCIPLES = [
  { icon: Globe2, titleKey: "landing.principleOneTitle", descriptionKey: "landing.principleOneDescription" },
  { icon: Users, titleKey: "landing.principleTwoTitle", descriptionKey: "landing.principleTwoDescription" },
  { icon: MessageCircle, titleKey: "landing.principleThreeTitle", descriptionKey: "landing.principleThreeDescription" },
  { icon: Shield, titleKey: "landing.principleFourTitle", descriptionKey: "landing.principleFourDescription" },
] as const;

export default function SignupPage() {
  const { t, language } = useLanguage();

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

          <div className="flex items-center gap-2 sm:gap-3">
            <GuestLanguageSelector />
            <div className="hidden items-center gap-2 rounded-full border border-brand-desert-dark/15 bg-white/70 px-3 py-1.5 text-xs font-bold text-brand-brown-700 shadow-sm backdrop-blur sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-desert-dark" />
              {t("landing.betaStatus")}
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
              {t("landing.signIn")}
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
              {t("landing.heroTitleFirst")}
              <span className="block text-brand-desert-dark">
                {t("landing.heroTitleSecond")}
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-brand-brown-600 sm:text-xl">
              {t("landing.heroLead")}
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-brand-brown-600">
              {t("landing.heroDescription")}
            </p>

            {/* Compact promise */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-brand-brown-700">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-desert/30">
                  <Check className="h-3 w-3" />
                </span>
                {t("landing.promiseOne")}
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-desert/30">
                  <Check className="h-3 w-3" />
                </span>
                {t("landing.promiseTwo")}
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-desert/30">
                  <Check className="h-3 w-3" />
                </span>
                {t("landing.promiseThree")}
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
              {t("landing.seeBuilding")}
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
                  {t("landing.earlyAccess")}
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-brown-900">
                  {t("landing.earlyAccessDescription")}
                </p>
              </div>

              
            </div>

            <Suspense
              fallback={
                <div className="flex min-h-[400px] items-center justify-center text-sm text-brand-brown-600">
                  {t("landing.loadingSignup")}
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
              {t("landing.whyEyebrow")}
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {t("landing.whyTitle")}
            </h2>

            <p className="mt-5 text-base leading-7 text-brand-brown-600 sm:text-lg">
              {t("landing.whyDescription")}
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PROBLEMS.map((problem) => {
              const Icon = problem.icon;

              return (
                <article
                  key={problem.titleKey}
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
                    {t(problem.titleKey)}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-brand-brown-600">
                    {t(problem.descriptionKey)}
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
                {t("landing.modelEyebrow")}
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                {t("landing.modelTitle")}
              </h2>

              <p className="mt-5 text-base leading-7 text-brand-brown-600">
                {t("landing.modelDescription")}
              </p>

              <div className="mt-8 rounded-3xl border border-brand-desert/30 bg-brand-desert/10 p-5">
                <p className="text-sm font-bold leading-6 text-brand-brown-900">
                  {t("landing.modelQuote")}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon;

                return (
                  <article
                    key={principle.titleKey}
                    className="
                      rounded-3xl border border-brand-sand-dark
                      bg-white p-6
                    "
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-sand">
                      <Icon className="h-5 w-5 text-brand-brown-800" />
                    </div>

                    <h3 className="mt-5 font-extrabold tracking-tight">
                      {t(principle.titleKey)}
                    </h3>

                    <p className="mt-2.5 text-sm leading-6 text-brand-brown-600">
                      {t(principle.descriptionKey)}
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
                {t("landing.joinEyebrow")}
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {t("landing.joinTitleFirst")}
                <span className="block text-brand-desert">
                  {t("landing.joinTitleSecond")}
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                {t("landing.joinDescription")}
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
              {t("landing.joinBeta")}
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
            {t("landing.footerDescription")}
          </p>

          <div className="flex items-center gap-4">
            <Link href="/terms" className="transition hover:text-white">
              {language === "BN" ? "ব্যবহারের শর্তাবলি" : "Terms"}
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              {language === "BN" ? "গোপনীয়তা নীতি" : "Privacy"}
            </Link>
            <Link href="/login" className="transition hover:text-white">
              {t("landing.signIn")}
            </Link>
            <Link href="/" className="transition hover:text-white">
              {t("landing.home")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
