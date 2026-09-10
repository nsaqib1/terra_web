"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import { Community } from "@/lib/api/types";

interface CommunityDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (community: Community) => void;
  community: Community | null;
}

export function CommunityDeleteDialog({
  isOpen,
  onClose,
  onSuccess,
  community,
}: CommunityDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !community) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const result = await adminApi.deleteCommunity(community.id);
      onSuccess(result);
      onClose();
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, "Failed to archive this community.")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border border-brand-sand-dark bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-4">
          <div className="flex items-center gap-2.5 text-red-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle size={18} />
            </div>
            <h3 className="text-base font-bold text-brand-brown-950">
              Archive Community
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-brown-600/70 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              {errorMessage}
            </div>
          )}

          <p className="text-sm leading-relaxed text-brand-brown-700">
            Are you sure you want to archive{" "}
            <span className="font-bold text-brand-brown-950">
              {community.name}
            </span>{" "}
            (<code>{community.slug}</code>)?
          </p>

          <p className="text-xs text-brand-brown-600 bg-brand-sand/40 p-3 rounded-xl">
            Archiving will mark the community status as <strong>ARCHIVED</strong>{" "}
            and prevent new posts. Existing posts and citizen memberships will be
            preserved.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-sand/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="h-10 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-10 gap-2 rounded-xl bg-red-600 px-5 text-xs font-semibold text-white hover:bg-red-700 shadow-sm"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : (
                <span>Yes, Archive Community</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
