"use client";

import React from "react";
import { Sparkles, Flame, MessageSquare, Clock, ArrowDownUp } from "lucide-react";
import { PostSortOption } from "@/lib/api/types";

interface FeedSortingProps {
  currentSort: PostSortOption;
  onSortChange: (sort: PostSortOption) => void;
  isLoading?: boolean;
  variant?: "sidebar" | "compact";
}

const sortOptions: {
  id: PostSortOption;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "newest", label: "Newest", icon: Sparkles },
  { id: "top", label: "Top rated", icon: Flame },
  { id: "comments", label: "Most discussed", icon: MessageSquare },
  { id: "oldest", label: "Oldest", icon: Clock },
];

export function FeedSorting({
  currentSort,
  onSortChange,
  isLoading = false,
  variant = "sidebar",
}: FeedSortingProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-sand-dark/50 bg-white px-3 py-2 2xl:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-brown-700">
          <ArrowDownUp size={14} />
          <label htmlFor="feed-sort-mobile">Sort</label>
        </div>
        <select
          id="feed-sort-mobile"
          value={currentSort}
          disabled={isLoading}
          onChange={(event) => onSortChange(event.target.value as PostSortOption)}
          className="max-w-[65%] rounded-lg border-0 bg-brand-cream px-3 py-2 text-xs font-semibold text-brand-brown-900 outline-none focus:ring-2 focus:ring-brand-desert disabled:opacity-60"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-sand-dark/50 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-brand-sand/80 pb-3">
        <ArrowDownUp size={15} className="text-brand-desert-dark" />
        <h2 className="text-xs font-bold text-brand-brown-900">Sort discussions</h2>
      </div>
      <div className="space-y-1">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentSort === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={isLoading}
              aria-pressed={isActive}
              onClick={() => onSortChange(option.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                isActive
                  ? "bg-brand-desert-light text-brand-brown-950"
                  : "text-brand-brown-700 hover:bg-brand-cream hover:text-brand-brown-950"
              }`}
            >
              <Icon size={14} className={isActive ? "text-brand-desert-dark" : "text-brand-brown-500"} />
              <span className="flex-1">{option.label}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-brand-desert-dark" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
