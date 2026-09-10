"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  User,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import { CommunityProposal } from "@/lib/api/types";

interface ProposalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proposal: CommunityProposal | null;
  action: "APPROVE" | "REJECT" | null;
}

export function ProposalReviewModal({
  isOpen,
  onClose,
  onSuccess,
  proposal,
  action,
}: ProposalReviewModalProps) {
  const [reviewReason, setReviewReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setReviewReason("");
    setErrorMessage(null);
  }, [proposal, action, isOpen]);

  if (!isOpen || !proposal || !action) return null;

  const isApproving = action === "APPROVE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isApproving && !reviewReason.trim()) {
      setErrorMessage("Please provide a reason for rejecting this proposal.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await adminApi.reviewProposal(proposal.id, {
        status: isApproving ? "APPROVED" : "REJECTED",
        reviewReason: reviewReason.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(
          err,
          `Failed to ${isApproving ? "approve" : "reject"} proposal.`
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border border-brand-sand-dark bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isApproving
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {isApproving ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-brown-950">
                {isApproving ? "Approve Proposal" : "Reject Proposal"}
              </h3>
              <p className="text-xs text-brand-brown-600">
                {proposal.proposedName} (<code>{proposal.proposedSlug}</code>)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-brown-600/70 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Proposal Summary Box */}
          <div className="rounded-xl border border-brand-sand bg-brand-cream/50 p-3.5 text-xs space-y-2 text-brand-brown-800">
            <div className="flex items-center gap-2 text-brand-brown-600">
              <User size={14} />
              <span>
                Proposed by:{" "}
                <strong className="text-brand-brown-950">
                  {proposal.proposedBy.displayName}
                </strong>{" "}
                (@{proposal.proposedBy.username})
              </span>
            </div>

            {proposal.description && (
              <div>
                <span className="font-semibold text-brand-brown-900">
                  Description:
                </span>{" "}
                {proposal.description}
              </div>
            )}

            {proposal.reason && (
              <div>
                <span className="font-semibold text-brand-brown-900">
                  Why this community is needed:
                </span>{" "}
                {proposal.reason}
              </div>
            )}
          </div>

          {isApproving ? (
            <p className="text-xs text-emerald-800 bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
              Approving this proposal will instantly create the active community{" "}
              <strong>{proposal.proposedName}</strong> (
              <code>{proposal.proposedSlug}</code>) and register the proposer as
              an initial citizen member.
            </p>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Rejection Reason *
              </label>
              <textarea
                value={reviewReason}
                onChange={(e) => {
                  setReviewReason(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Explain why this community proposal was declined..."
                rows={3}
                required
                className="w-full rounded-xl border border-brand-sand-dark/80 bg-white p-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none resize-none"
              />
            </div>
          )}

          {isApproving && (
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Approval Note / Feedback (Optional)
              </label>
              <input
                type="text"
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="Optional welcome note or guidelines..."
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-sand/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`h-10 gap-2 rounded-xl px-5 text-xs font-semibold text-white shadow-sm ${
                isApproving
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {isApproving ? "Approve & Create Community" : "Reject Proposal"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
