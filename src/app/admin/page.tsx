"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Layers,
  MessageSquare,
  Plus,
  ShieldCheck,
  TrendingUp,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { CommunityFormModal } from "@/components/admin/CommunityFormModal";
import { ProposalReviewModal } from "@/components/admin/ProposalReviewModal";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { invitesApi } from "@/lib/api/invites";
import {
  AdminCommunityStats,
  Community,
  CommunityProposal,
  InviteStatsResponse,
} from "@/lib/api/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminCommunityStats | null>(null);
  const [inviteStats, setInviteStats] = useState<InviteStatsResponse | null>(null);
  const [recentCommunities, setRecentCommunities] = useState<Community[]>([]);
  const [pendingProposals, setPendingProposals] = useState<CommunityProposal[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] =
    useState<CommunityProposal | null>(null);
  const [proposalAction, setProposalAction] = useState<
    "APPROVE" | "REJECT" | null
  >(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, inviteStatsRes, communitiesRes, proposalsRes] = await Promise.all([
        adminApi.getStats().catch(() => null),
        invitesApi.getAdminStats().catch(() => null),
        adminApi.getCommunities({ limit: 5 }).catch(() => ({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 1 } })),
        adminApi
          .getProposals({ status: "PENDING", limit: 5 })
          .catch(() => ({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 1 } })),
      ]);

      if (statsRes) setStats(statsRes);
      if (inviteStatsRes) setInviteStats(inviteStatsRes);
      setRecentCommunities(communitiesRes.data || []);
      setPendingProposals(proposalsRes.data || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8">
      {/* Welcome Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">
            Platform Overview
          </h1>
          <p className="mt-1 text-xs text-brand-brown-600">
            Manage communities, review citizen governance proposals, and monitor
            activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 gap-2 rounded-xl bg-brand-brown-950 px-4 text-xs font-semibold text-white shadow-sm hover:bg-brand-brown-900"
          >
            <Plus size={16} />
            <span>Create Community</span>
          </Button>

          <Link href="/admin/proposals">
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
            >
              <FileCheck2 size={16} />
              <span>Review Proposals</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Beta Access & Invites Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-brand-desert-dark/30 bg-gradient-to-r from-brand-sand/70 via-brand-sand/40 to-white p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-desert text-brand-brown-950 shadow-xs">
            <Ticket size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-brand-brown-950">
                Beta Testing & Invite Management
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Invite-Only Active
              </span>
            </div>
            <p className="mt-0.5 text-xs text-brand-brown-600">
              {inviteStats
                ? `${inviteStats.totalRedemptions} beta testers joined • ${inviteStats.activeInvites} active invite links • ${inviteStats.remainingCapacity} spots remaining`
                : "Manage and monitor exclusive invite links for beta testers."}
            </p>
          </div>
        </div>

        <Link href="/admin/invites">
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-brand-brown-950 px-4 text-xs font-semibold text-white shadow-xs hover:bg-brand-brown-900"
          >
            <span>Manage Invite Links</span>
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Communities */}
        <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-brown-600">
              Total Communities
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-desert-light text-brand-brown-900">
              <Compass size={17} />
            </div>
          </div>

          <div className="mt-3">
            <p className="text-3xl font-extrabold text-brand-brown-950">
              {stats?.communities.total ?? "—"}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-brand-brown-600">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                {stats?.communities.active ?? 0} active
              </span>
              <span>•</span>
              <span>{stats?.communities.inactive ?? 0} inactive</span>
            </div>
          </div>
        </div>

        {/* Pending Proposals */}
        <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-brown-600">
              Pending Proposals
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <Clock size={17} />
            </div>
          </div>

          <div className="mt-3">
            <p className="text-3xl font-extrabold text-brand-brown-950">
              {stats?.proposals.pending ?? "—"}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-brown-600">
              {(stats?.proposals.pending ?? 0) > 0 ? (
                <span className="font-semibold text-amber-700">
                  Needs administrator review
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  All proposals reviewed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Citizens */}
        <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-brown-600">
              Total Citizens
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
              <Users size={17} />
            </div>
          </div>

          <div className="mt-3">
            <p className="text-3xl font-extrabold text-brand-brown-950">
              {stats?.platform.totalCitizens ?? "—"}
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-brand-brown-600">
              <span>Registered platform users</span>
            </div>
          </div>
        </div>

        {/* Total Posts */}
        <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-brown-600">
              Total Posts
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-900">
              <MessageSquare size={17} />
            </div>
          </div>

          <div className="mt-3">
            <p className="text-3xl font-extrabold text-brand-brown-950">
              {stats?.platform.totalPosts ?? "—"}
            </p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-brand-brown-600">
              <span>Published discussions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Communities & Pending Proposals */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Communities */}
        <div className="rounded-2xl border border-brand-sand-dark/80 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-4">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-brand-desert-dark" />
              <h2 className="text-sm font-bold text-brand-brown-950">
                Recent Communities
              </h2>
            </div>

            <Link
              href="/admin/communities"
              className="flex items-center gap-1 text-xs font-semibold text-brand-desert-dark hover:underline"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-brand-sand/60">
            {recentCommunities.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-brown-600">
                No communities found. Click &ldquo;Create Community&rdquo; to start.
              </div>
            ) : (
              recentCommunities.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 hover:bg-brand-sand/20 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/c/${c.slug}`}
                        className="font-bold text-xs text-brand-brown-950 hover:underline truncate"
                      >
                        {c.name}
                      </Link>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "INACTIVE"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-brand-brown-600 truncate mt-0.5">
                      {c.description || "No description provided."}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-brand-brown-600/80">
                      <span>{c.membersCount ?? 0} members</span>
                      <span>•</span>
                      <span>{c.postsCount ?? 0} posts</span>
                      <span>•</span>
                      <span className="capitalize">
                        {c.maturity.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/c/${c.slug}`}
                    className="rounded-lg border border-brand-sand-dark px-2.5 py-1 text-[11px] font-semibold text-brand-brown-800 hover:bg-brand-sand"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Proposals */}
        <div className="rounded-2xl border border-brand-sand-dark/80 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-600" />
              <h2 className="text-sm font-bold text-brand-brown-950">
                Pending Community Proposals
              </h2>
            </div>

            <Link
              href="/admin/proposals"
              className="flex items-center gap-1 text-xs font-semibold text-brand-desert-dark hover:underline"
            >
              <span>Manage All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-brand-sand/60">
            {pendingProposals.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-brown-600">
                <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-2" />
                No pending proposals to review!
              </div>
            ) : (
              pendingProposals.map((p) => (
                <div
                  key={p.id}
                  className="p-4 hover:bg-brand-sand/20 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-xs text-brand-brown-950">
                        {p.proposedName}
                      </h3>
                      <span className="text-[10px] text-brand-brown-600 font-mono">
                        /{p.proposedSlug}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedProposal(p);
                          setProposalAction("APPROVE");
                        }}
                        className="h-7 rounded-lg bg-emerald-600 px-2.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProposal(p);
                          setProposalAction("REJECT");
                        }}
                        className="h-7 rounded-lg border-brand-sand-dark px-2 text-[10px] font-bold text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-[11px] text-brand-brown-700 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  <div className="text-[10px] text-brand-brown-600/80">
                    Proposed by:{" "}
                    <strong>{p.proposedBy.displayName}</strong> (@
                    {p.proposedBy.username})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CommunityFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
      />

      <ProposalReviewModal
        isOpen={!!proposalAction && !!selectedProposal}
        action={proposalAction}
        proposal={selectedProposal}
        onClose={() => {
          setSelectedProposal(null);
          setProposalAction(null);
        }}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
