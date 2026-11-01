"use client";

import {
  ArrowRight,
  CheckCircle2,
  FilePlus2,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function CommunityProposalCard() {
  const { t } = useLanguage();
  return (
    <section
      className="
        relative overflow-hidden
        rounded-2xl
        border border-brand-desert-light
        bg-brand-desert-light/40
        p-6
      "
    >
      <div
        className="
          pointer-events-none absolute
          -right-10 -top-10
          h-32 w-32
          rounded-full
          bg-brand-desert/30
        "
      />

      <div className="relative">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-desert">
          <FilePlus2
            size={19}
            className="text-brand-brown-950"
          />
        </div>

        <h2 className="mt-4 text-lg font-bold text-brand-brown-950">
          {t("common.cantFindCommunity")}
        </h2>

        <p className="mt-2 max-w-xl text-xs leading-5 text-brand-brown-700">
          {t("common.proposalCardDescription")}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            t("common.checkDuplicates"),
            t("common.defineCommunityScope"),
            t("common.openToEveryone"),
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2"
            >
              <CheckCircle2
                size={14}
                className="shrink-0 text-brand-desert-dark"
              />

              <span className="text-[11px] font-medium text-brand-brown-700">
                {item}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/communities/propose"
          className="
            mt-5 inline-flex items-center gap-2
            rounded-xl
            bg-brand-brown-950
            px-4 py-2.5
            text-xs font-semibold
            text-white
            transition-colors
            hover:bg-brand-brown-800
          "
        >
          {t("common.proposeCommunity")}
          <ArrowRight size={14} />
        </Link>

      </div>
    </section>
  );
}