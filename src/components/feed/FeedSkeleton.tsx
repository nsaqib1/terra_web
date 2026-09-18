"use client";

import React from "react";

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-brand-sand-dark/50 bg-white p-5 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-sand" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-brand-sand" />
                <div className="h-3 w-20 rounded bg-brand-sand/70" />
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 w-12 rounded-md bg-brand-sand/60" />
              <div className="h-5 w-14 rounded-md bg-brand-sand/60" />
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2 pt-1">
            <div className="h-4 w-full rounded bg-brand-sand/80" />
            <div className="h-4 w-5/6 rounded bg-brand-sand/70" />
            <div className="h-4 w-2/3 rounded bg-brand-sand/60" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-brand-sand-dark/30 pt-3">
            <div className="h-8 w-20 rounded-xl bg-brand-sand/60" />
            <div className="h-8 w-16 rounded-xl bg-brand-sand/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
