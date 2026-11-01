"use client";

import React from "react";
import Link from "next/link";
import { MessageSquareDashed, PlusCircle, Compass } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface FeedEmptyStateProps {
  onResetFilter?: () => void;
  hasFilter?: boolean;
}

export function FeedEmptyState({ onResetFilter, hasFilter }: FeedEmptyStateProps) {
  const { t } = useLanguage();
  return (
    <div className="-mx-4 flex flex-col items-center justify-center rounded-none border-y border-dashed border-brand-sand-dark/80 bg-white/60 px-6 py-16 text-center backdrop-blur-sm sm:mx-0 sm:rounded-2xl sm:border">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-sand text-brand-brown-700 shadow-inner">
        <MessageSquareDashed size={32} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-brand-brown-950">
        {t("common.noDiscussionsFound")}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {hasFilter
          ? t("common.noMatchingDiscussions")
          : t("common.noDiscussionsYet")}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasFilter && onResetFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="
              flex items-center gap-2 rounded-xl border border-brand-sand-dark bg-white px-4 py-2.5
              text-xs font-bold text-brand-brown-800 shadow-sm transition-all
              hover:bg-brand-sand hover:text-brand-brown-950
            "
          >
            {t("common.clearFilterAction")}
          </button>
        )}

        <Link
          href="/posts/create"
          className="
            flex items-center gap-2 rounded-xl bg-brand-desert px-4 py-2.5
            text-xs font-bold text-brand-brown-950 shadow-sm transition-all
            hover:bg-brand-desert-dark
          "
        >
          <PlusCircle size={15} />
          <span>{t("common.startDiscussion")}</span>
        </Link>

        <Link
          href="/communities"
          className="
            flex items-center gap-2 rounded-xl border border-brand-sand-dark bg-white px-4 py-2.5
            text-xs font-bold text-brand-brown-800 shadow-sm transition-all
            hover:bg-brand-sand hover:text-brand-brown-950
          "
        >
          <Compass size={15} />
          <span>{t("common.exploreCommunitiesAction")}</span>
        </Link>
      </div>
    </div>
  );
}
