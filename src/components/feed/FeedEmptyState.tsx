"use client";

import React from "react";
import Link from "next/link";
import { MessageSquareDashed, PlusCircle, Compass } from "lucide-react";

interface FeedEmptyStateProps {
  onResetFilter?: () => void;
  hasFilter?: boolean;
}

export function FeedEmptyState({ onResetFilter, hasFilter }: FeedEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-sand-dark/80 bg-white/60 py-16 px-6 text-center backdrop-blur-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-sand text-brand-brown-700 shadow-inner">
        <MessageSquareDashed size={32} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-brand-brown-950">
        No discussions found
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {hasFilter
          ? "There are no discussions matching your current filter. Try resetting your filter or creating a new discussion."
          : "There are no discussions in the feed yet. Be the first to start a conversation in a community!"}
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
            Clear Filter
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
          <span>Start Discussion</span>
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
          <span>Explore Communities</span>
        </Link>
      </div>
    </div>
  );
}
