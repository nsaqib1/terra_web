"use client";

import {
  CalendarDays,
  ChevronRight,
  Flag,
  History,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function CommunityAbout() {
  const { t } = useLanguage();
  return (
    <aside className="space-y-4">

      {/* About */}
      <section className="rounded-2xl border bg-white p-5">

        <h2 className="text-sm font-bold text-brand-brown-950">
          {t("common.aboutCommunity")}
        </h2>

        <p className="mt-2 text-xs leading-5 text-brand-brown-600">
          {t("common.aboutDescription")}
        </p>

        <div className="mt-4 space-y-3 border-t pt-4">

          <InfoRow
            icon={<ShieldCheck size={15} />}
            label={t("common.communityStatus")}
            value={t("common.platformProtected")}
          />

          <InfoRow
            icon={<CalendarDays size={15} />}
            label={t("common.established")}
            value="August 2026"
          />

          <InfoRow
            icon={<UserRound size={15} />}
            label={t("common.firstCitizen")}
            value="Alex Morgan"
          />

        </div>

      </section>

      {/* Governance */}
      <section className="rounded-2xl border bg-white p-5">

        <div className="flex items-center gap-2">
          <ShieldCheck
            size={16}
            className="text-brand-desert-dark"
          />

          <h2 className="text-sm font-bold text-brand-brown-950">
            {t("common.governance")}
          </h2>
        </div>

        <p className="mt-2 text-xs leading-5 text-brand-brown-600">
          {t("common.governanceDescription")}
        </p>

        <button
          className="
            mt-3 flex w-full items-center justify-between
            rounded-xl bg-brand-sand
            px-3 py-2.5
            text-xs font-semibold
            text-brand-brown-800
            hover:bg-brand-desert-light
          "
        >
          {t("common.learnGovernance")}
          <ChevronRight size={14} />
        </button>

      </section>

      {/* History */}
      <section className="rounded-2xl border bg-white p-5">

        <div className="flex items-center gap-2">
          <History
            size={16}
            className="text-brand-desert-dark"
          />

          <h2 className="text-sm font-bold text-brand-brown-950">
            {t("common.communityHistory")}
          </h2>
        </div>

        <div className="mt-4 border-l-2 border-brand-desert-light pl-4">

          <p className="text-xs font-semibold text-brand-brown-900">
            {t("common.communityEstablished")}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            {t("common.historyDescription")}
          </p>

        </div>

        <button
          className="
            mt-4 flex items-center gap-1
            text-xs font-semibold
            text-brand-brown-700
            hover:text-brand-brown-950
          "
        >
          {t("common.viewFullHistory")}
          <ChevronRight size={13} />
        </button>

      </section>

      {/* Report */}
      <button
        className="
          flex w-full items-center justify-center gap-2
          rounded-xl
          px-3 py-2
          text-xs text-muted-foreground
          hover:bg-brand-sand
          hover:text-brand-brown-900
        "
      >
        <Flag size={13} />
        {t("common.reportCommunity")}
      </button>

    </aside>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted-foreground">
        {icon}
      </span>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className="mt-0.5 text-xs font-semibold text-brand-brown-800">
          {value}
        </p>
      </div>
    </div>
  );
}