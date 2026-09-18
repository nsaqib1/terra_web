"use client";

import React from "react";
import { Sparkles, Flame, MessageSquare, Clock } from "lucide-react";
import { PostSortOption } from "@/lib/api/types";

interface FeedSortingProps {
  currentSort: PostSortOption;
  onSortChange: (sort: PostSortOption) => void;
  isLoading?: boolean;
}

const sortOptions: {
  id: PostSortOption;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "newest", label: "Newest", icon: Sparkles },
  { id: "top", label: "Top Rated", icon: Flame },
  { id: "comments", label: "Most Discussed", icon: MessageSquare },
  { id: "oldest", label: "Oldest", icon: Clock },
];

export function FeedSorting({
  currentSort,
  onSortChange,
  isLoading = false,
}: FeedSortingProps) {
  return (
    <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 sm:pb-0">
      {/* Desktop & Tablet Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-brand-sand-dark/60 bg-white/70 p-1.5 backdrop-blur-sm shadow-sm">
        {sortOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = currentSort === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isLoading}
              onClick={() => onSortChange(opt.id)}
              className={`
                flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all
                ${
                  isActive
                    ? "bg-brand-desert text-brand-brown-950 shadow-sm"
                    : "text-brand-brown-700 hover:bg-brand-sand/70 hover:text-brand-brown-950"
                }
              `}
            >
              <Icon
                size={14}
                className={isActive ? "text-brand-brown-950" : "text-brand-brown-600"}
              />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
