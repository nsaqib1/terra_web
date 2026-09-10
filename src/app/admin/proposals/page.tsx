"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Filter,
  Loader2,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { ProposalReviewModal } from "@/components/admin/ProposalReviewModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import { CommunityProposal, CommunityProposalStatus } from "@/lib/api/types";

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusTab, setStatusTab] = useState<
    CommunityProposalStatus | "ALL"
  >("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal review state
  const [selectedProposal, setSelectedProposal] =
    useState<CommunityProposal | null>(null);
  const [reviewAction, setReviewAction] = useState<
    "APPROVE" | "REJECT" | null
  >(null);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await adminApi.getProposals({
        status: statusTab === "ALL" ? undefined : statusTab,
        page,
        limit,
      });

      setProposals(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, "Failed to load community proposals.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusTab, page, limit]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">
              Community Proposals
            </h1>
            <span className="rounded-full bg-brand-sand px-2.5 py-0.5 text-xs font-bold text-brand-brown-800">
              {total}
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-brown-600">
            Review citizen-submitted proposals for new communities across Commons.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchProposals()}
          disabled={isLoading}
          className="h-10 gap-1.5 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
        >
          <RefreshCw
            size={15}
            className={isLoading ? "animate-spin" : ""}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-sand-dark pb-2 overflow-x-auto">
        {(
          [
            { label: "Pending Review", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Rejected", value: "REJECTED" },
            { label: "All Proposals", value: "ALL" },
          ] as const
        ).map((tab) => {
          const isActive = statusTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusTab(tab.value);
                setPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-brand-brown-950 text-white shadow-xs"
                  : "text-brand-brown-700 hover:bg-brand-sand hover:text-brand-brown-950"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Proposals List */}
      {isLoading ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-brand-sand-dark/80 bg-white p-8">
          <Loader2 size={26} className="animate-spin text-brand-desert-dark" />
          <p className="text-xs font-medium text-brand-brown-600">
            Loading proposals...
          </p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 rounded-2xl border border-brand-sand-dark/80 bg-white p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sand text-brand-brown-700">
            <FileCheck2 size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-brown-950">
              No proposals found
            </p>
            <p className="mt-1 text-xs text-brand-brown-600">
              There are no {statusTab !== "ALL" ? statusTab.toLowerCase() : ""}{" "}
              proposals to display right now.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="rounded-2xl border border-brand-sand-dark/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm space-y-4"
            >
              {/* Card Header: Proposed info & Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-brand-brown-950">
                      {proposal.proposedName}
                    </h2>
                    <span className="rounded-md bg-brand-sand px-2 py-0.5 font-mono text-[11px] text-brand-brown-800">
                      /{proposal.proposedSlug}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        proposal.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : proposal.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-brand-brown-600">
                    <Avatar className="h-5 w-5 border border-brand-sand-dark">
                      {proposal.proposedBy.avatarUrl && (
                        <AvatarImage
                          src={proposal.proposedBy.avatarUrl}
                          alt={proposal.proposedBy.displayName}
                        />
                      )}
                      <AvatarFallback className="bg-brand-desert text-[8px] font-bold">
                        {getInitials(proposal.proposedBy.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      Proposed by{" "}
                      <strong className="text-brand-brown-900">
                        {proposal.proposedBy.displayName}
                      </strong>{" "}
                      (@{proposal.proposedBy.username})
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Review Action Buttons */}
                {proposal.status === "PENDING" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedProposal(proposal);
                        setReviewAction("APPROVE");
                      }}
                      className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProposal(proposal);
                        setReviewAction("REJECT");
                      }}
                      className="h-9 gap-1.5 rounded-xl border-brand-sand-dark px-3 text-xs font-bold text-red-700 hover:bg-red-50"
                    >
                      <XCircle size={15} />
                      <span>Reject</span>
                    </Button>
                  </div>
                )}

                {proposal.status === "APPROVED" && proposal.community && (
                  <Link
                    href={`/c/${proposal.community.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-sand-dark bg-brand-sand/30 px-3 py-1.5 text-xs font-semibold text-brand-brown-900 hover:bg-brand-sand"
                  >
                    <span>View Created Community</span>
                    <ExternalLink size={13} />
                  </Link>
                )}
              </div>

              {/* Proposal Details */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-brand-sand/70 bg-brand-cream/40 p-4 text-xs lg:grid-cols-2">
                <div>
                  <span className="font-bold text-brand-brown-950 block mb-1">
                    Description & Mission:
                  </span>
                  <p className="text-brand-brown-700 leading-relaxed">
                    {proposal.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-brand-brown-950 block mb-1">
                    Why this community is needed:
                  </span>
                  <p className="text-brand-brown-700 leading-relaxed">
                    {proposal.reason || "No specific reason provided."}
                  </p>
                </div>
              </div>

              {/* Review metadata if already reviewed */}
              {proposal.status !== "PENDING" && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-brand-brown-600 pt-1 border-t border-brand-sand/60">
                  {proposal.reviewedBy && (
                    <span>
                      Reviewed by:{" "}
                      <strong>{proposal.reviewedBy.displayName}</strong>
                    </span>
                  )}

                  {proposal.reviewedAt && (
                    <span>
                      Date: {new Date(proposal.reviewedAt).toLocaleDateString()}
                    </span>
                  )}

                  {proposal.reviewReason && (
                    <span className="w-full text-brand-brown-800">
                      <strong>Admin Note:</strong> {proposal.reviewReason}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Proposal Review Modal */}
      <ProposalReviewModal
        isOpen={!!reviewAction && !!selectedProposal}
        action={reviewAction}
        proposal={selectedProposal}
        onClose={() => {
          setSelectedProposal(null);
          setReviewAction(null);
        }}
        onSuccess={() => {
          fetchProposals();
        }}
      />
    </div>
  );
}
