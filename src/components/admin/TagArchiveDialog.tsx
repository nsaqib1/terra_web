"use client";

import { AlertTriangle, Archive, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { tagsApi } from "@/lib/api/tags";
import { extractErrorMessage } from "@/lib/api/errors";
import { Tag } from "@/lib/api/types";

interface TagArchiveDialogProps {
  isOpen: boolean;
  tag: Tag | null;
  onClose: () => void;
  onSuccess: (tag: Tag) => void;
}

export function TagArchiveDialog({
  isOpen,
  tag,
  onClose,
  onSuccess,
}: TagArchiveDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!tag) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const archived = await tagsApi.archive(tag.id);
      onSuccess(archived);
      onClose();
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Failed to archive tag."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !tag) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-brand-sand-dark bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-sand/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Archive size={16} />
            </div>
            <h3 className="text-sm font-bold text-brand-brown-950">
              Archive Tag
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-brown-600/70 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3.5 flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="text-xs text-amber-900">
              <p className="font-semibold mb-0.5">
                Archive{" "}
                <span className="font-mono bg-amber-100 px-1 py-0.5 rounded-md">
                  #{tag.slug}
                </span>
                ?
              </p>
              <p className="text-amber-800/80">
                The tag will be hidden from all community feeds and post editors.
                This action can be reversed by editing the tag status.
              </p>
            </div>
          </div>

          {tag.usageCount > 0 && (
            <p className="text-[11px] text-brand-brown-600 bg-brand-sand/50 rounded-lg px-3 py-2">
              This tag is currently used in{" "}
              <strong>{tag.usageCount}</strong>{" "}
              {tag.usageCount === 1 ? "post" : "posts"}. Existing associations
              will not be removed.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-brand-sand/60 px-5 py-3.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="h-9 gap-2 rounded-xl bg-amber-600 px-4 text-xs font-semibold text-white hover:bg-amber-700 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Archiving…</span>
              </>
            ) : (
              <>
                <Archive size={13} />
                <span>Archive Tag</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
