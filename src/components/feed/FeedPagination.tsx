"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface FeedPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function FeedPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isLoading = false,
}: FeedPaginationProps) {
  if (totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  // Calculate items range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-brand-sand-dark/60 bg-white/80 p-4 backdrop-blur-sm sm:flex-row">
      {/* Stats counter */}
      <div className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-brand-brown-950">{startItem}</span> -{" "}
        <span className="font-semibold text-brand-brown-950">{endItem}</span> of{" "}
        <span className="font-semibold text-brand-brown-950">{totalItems}</span> discussions
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5">
        {/* First page */}
        {currentPage > 2 && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || isLoading}
            aria-label="First page"
            className="
              hidden h-9 w-9 items-center justify-center rounded-xl border border-brand-sand-dark/50
              text-brand-brown-700 transition-colors
              hover:bg-brand-sand/70 hover:text-brand-brown-950
              disabled:opacity-40 disabled:pointer-events-none
              sm:flex
            "
          >
            <ChevronsLeft size={16} />
          </button>
        )}

        {/* Previous page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          aria-label="Previous page"
          className="
            flex h-9 items-center gap-1 rounded-xl border border-brand-sand-dark/50 px-3
            text-xs font-semibold text-brand-brown-700 transition-colors
            hover:bg-brand-sand/70 hover:text-brand-brown-950
            disabled:opacity-40 disabled:pointer-events-none
          "
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered page buttons */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (typeof p === "string") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs font-medium text-muted-foreground"
                >
                  {p}
                </span>
              );
            }

            const isActive = p === currentPage;

            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex h-9 min-w-[36px] items-center justify-center rounded-xl px-2.5 text-xs font-bold transition-all
                  ${
                    isActive
                      ? "bg-brand-desert text-brand-brown-950 shadow-sm ring-1 ring-brand-desert-dark/30"
                      : "border border-brand-sand-dark/50 text-brand-brown-700 hover:bg-brand-sand/70 hover:text-brand-brown-950"
                  }
                `}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          aria-label="Next page"
          className="
            flex h-9 items-center gap-1 rounded-xl border border-brand-sand-dark/50 px-3
            text-xs font-semibold text-brand-brown-700 transition-colors
            hover:bg-brand-sand/70 hover:text-brand-brown-950
            disabled:opacity-40 disabled:pointer-events-none
          "
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>

        {/* Last page */}
        {currentPage < totalPages - 1 && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Last page"
            className="
              hidden h-9 w-9 items-center justify-center rounded-xl border border-brand-sand-dark/50
              text-brand-brown-700 transition-colors
              hover:bg-brand-sand/70 hover:text-brand-brown-950
              disabled:opacity-40 disabled:pointer-events-none
              sm:flex
            "
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
