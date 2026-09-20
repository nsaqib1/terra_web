"use client";

import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  KeyRound,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { invitesApi } from "@/lib/api/invites";
import { extractErrorMessage } from "@/lib/api/errors";
import {
  CreateInviteInput,
  InviteItem,
  InviteStatsResponse,
  InviteStatus,
} from "@/lib/api/types";

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [stats, setStats] = useState<InviteStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInviteForUsers, setSelectedInviteForUsers] =
    useState<InviteItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    label: string;
    maxUses: number;
    expiresAt: string;
  }>({
    code: "",
    label: "",
    maxUses: 1,
    expiresAt: "",
  });

  const fetchStats = useCallback(async () => {
    try {
      const data = await invitesApi.getAdminStats();
      setStats(data);
    } catch {
      // Ignore stats error
    }
  }, []);

  const fetchInvites = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await invitesApi.getAdminList({
          page,
          limit: 20,
          search: search.trim() || undefined,
          status: statusFilter as any,
        });

        setInvites(res.items);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      } catch (err) {
        setError(
          extractErrorMessage(err, "Failed to load beta invites. Please try again.")
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter]
  );

  useEffect(() => {
    fetchStats();
    fetchInvites();
  }, [fetchStats, fetchInvites]);

  const handleCopyLink = (code: string) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://terramids.com";
    const fullUrl = `${origin}/signup?invite=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "BETA-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload: CreateInviteInput = {
        code: formData.code.trim() ? formData.code.trim().toUpperCase() : undefined,
        label: formData.label.trim() || undefined,
        maxUses: Number(formData.maxUses) || 1,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      const newInvite = await invitesApi.createAdminInvite(payload);
      setFormSuccess(`Created invite link: ${newInvite.code}`);
      fetchStats();
      fetchInvites(true);

      // Reset and close after delay
      setTimeout(() => {
        setCreateModalOpen(false);
        setFormData({ code: "", label: "", maxUses: 1, expiresAt: "" });
        setFormSuccess(null);
      }, 1000);
    } catch (err) {
      setFormError(extractErrorMessage(err, "Failed to create invite link."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (invite: InviteItem) => {
    try {
      await invitesApi.updateAdminInvite(invite.id, {
        isActive: !invite.isActive,
      });
      fetchStats();
      fetchInvites(true);
    } catch (err) {
      alert(extractErrorMessage(err, "Failed to update invite status."));
    }
  };

  const handleDeleteInvite = async (invite: InviteItem) => {
    if (
      !confirm(
        `Are you sure you want to delete invite "${invite.code}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await invitesApi.deleteAdminInvite(invite.id);
      fetchStats();
      fetchInvites(true);
    } catch (err) {
      alert(extractErrorMessage(err, "Failed to delete invite."));
    }
  };

  const getStatusBadge = (status: InviteStatus, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
          Disabled
        </span>
      );
    }
    if (status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
          Expired
        </span>
      );
    }
    if (status === "depleted") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-200 px-2 py-0.5 text-[11px] font-bold text-zinc-700">
          Maxed Out
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
        Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950">
              Beta Invites & Access Control
            </h1>
            <span className="rounded-full bg-brand-desert-light/70 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-brown-950">
              Beta Phase
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-brown-600">
            Generate and monitor unique invite links for testers. Public registrations are strictly invite-only.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              fetchInvites(true);
            }}
            disabled={refreshing}
            className="border-brand-sand-dark bg-white text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand/50"
          >
            <RefreshCw
              size={14}
              className={`mr-1.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setFormData({
                code: "",
                label: "",
                maxUses: 1,
                expiresAt: "",
              });
              setFormError(null);
              setFormSuccess(null);
              setCreateModalOpen(true);
            }}
            className="bg-brand-brown-950 text-xs font-semibold text-white hover:bg-brand-brown-900 shadow-xs"
          >
            <Plus size={14} className="mr-1.5" />
            Create Invite Link
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-brand-sand-dark bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-brown-600">
                Total Invite Links
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-sand text-brand-desert-dark">
                <Ticket size={16} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-brand-brown-950">
              {stats.totalInvites}
            </p>
            <p className="mt-0.5 text-[11px] text-brand-brown-600/80">
              {stats.activeInvites} currently active
            </p>
          </div>

          <div className="rounded-2xl border border-brand-sand-dark bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-brown-600">
                Beta Users Joined
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <UserCheck size={16} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-brand-brown-950">
              {stats.totalRedemptions}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-700 font-medium">
              Registered via invite codes
            </p>
          </div>

          <div className="rounded-2xl border border-brand-sand-dark bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-brown-600">
                Remaining Capacity
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Layers size={16} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-brand-brown-950">
              {stats.remainingCapacity}
            </p>
            <p className="mt-0.5 text-[11px] text-brand-brown-600/80">
              Available spots across all codes
            </p>
          </div>

          <div className="rounded-2xl border border-brand-sand-dark bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-brown-600">
                Beta Access Mode
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-desert text-brand-brown-950">
                <KeyRound size={16} />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-bold text-brand-brown-950">
                {stats.isInviteOnlyEnabled
                  ? "Invite-Only Enforced"
                  : "Open Signups"}
              </p>
            </div>
            <p className="mt-1 text-[11px] text-brand-brown-600">
              {stats.isInviteOnlyEnabled
                ? "Code required to register"
                : "Public signups enabled"}
            </p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-brand-sand-dark bg-white p-3.5 shadow-2xs">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown-600/60"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by invite code or label/recipient..."
            className="h-9 w-full rounded-xl border border-brand-sand-dark bg-brand-sand/30 pl-9 pr-4 text-xs text-brand-brown-950 outline-none transition-all placeholder:text-brand-brown-600/50 focus:border-brand-desert-dark focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "depleted", label: "Maxed Out" },
            { id: "expired", label: "Expired" },
            { id: "inactive", label: "Disabled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? "bg-brand-brown-950 text-white"
                  : "bg-brand-sand/50 text-brand-brown-700 hover:bg-brand-sand"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Invites Table */}
      <div className="overflow-hidden rounded-2xl border border-brand-sand-dark bg-white shadow-2xs">
        {loading && !refreshing ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-brand-brown-600">
            <Loader2 size={24} className="animate-spin text-brand-desert-dark" />
            <span className="text-xs font-semibold">Loading invite links...</span>
          </div>
        ) : invites.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sand text-brand-desert-dark">
              <Ticket size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-brown-950">
                No invite links found
              </p>
              <p className="mt-1 text-xs text-brand-brown-600">
                {search || statusFilter !== "all"
                  ? "No results matching your filters."
                  : "Generate your first beta invite link to share with friends and testers."}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setFormData({
                  code: "",
                  label: "",
                  maxUses: 1,
                  expiresAt: "",
                });
                setCreateModalOpen(true);
              }}
              className="mt-1 bg-brand-brown-950 text-xs font-semibold text-white hover:bg-brand-brown-900"
            >
              <Plus size={14} className="mr-1.5" />
              Create Invite Link
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-brown-900">
              <thead className="border-b border-brand-sand-dark bg-brand-sand/40 text-[10px] font-bold uppercase tracking-wider text-brand-brown-600">
                <tr>
                  <th className="px-5 py-3.5">Code & Link</th>
                  <th className="px-4 py-3.5">Label / Note</th>
                  <th className="px-4 py-3.5">Redemptions</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Expires</th>
                  <th className="px-4 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand-dark">
                {invites.map((invite) => {
                  const percentUsed = Math.min(
                    100,
                    Math.round((invite.usedCount / invite.maxUses) * 100)
                  );
                  const isCopied = copiedLink === invite.code;
                  const isCodeCopied = copiedCode === invite.code;

                  return (
                    <tr
                      key={invite.id}
                      className="hover:bg-brand-sand/20 transition-colors"
                    >
                      {/* Code + Copy */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCode(invite.code)}
                            title="Click to copy code"
                            className="group inline-flex items-center gap-1.5 rounded-lg bg-brand-sand/60 px-2.5 py-1 font-mono text-xs font-bold text-brand-brown-950 hover:bg-brand-desert hover:text-brand-brown-950 transition-colors"
                          >
                            <span>{invite.code}</span>
                            {isCodeCopied ? (
                              <Check size={12} className="text-emerald-700" />
                            ) : (
                              <Copy
                                size={12}
                                className="text-brand-brown-600/60 group-hover:text-brand-brown-950"
                              />
                            )}
                          </button>

                          <button
                            onClick={() => handleCopyLink(invite.code)}
                            title="Copy full invite link"
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                              isCopied
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-brand-sand text-brand-brown-800 hover:bg-brand-sand-dark"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check size={12} />
                                <span>Link Copied!</span>
                              </>
                            ) : (
                              <>
                                <ExternalLink size={12} />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Label */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-brand-brown-950">
                          {invite.label || (
                            <span className="italic text-brand-brown-600/60">
                              No label
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Redemptions Progress */}
                      <td className="px-4 py-4">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span>
                              {invite.usedCount} / {invite.maxUses} used
                            </span>
                            {invite.usages && invite.usages.length > 0 && (
                              <button
                                onClick={() => setSelectedInviteForUsers(invite)}
                                className="text-brand-desert-dark hover:underline"
                              >
                                View users
                              </button>
                            )}
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-sand-dark/50">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentUsed >= 100
                                  ? "bg-zinc-400"
                                  : percentUsed > 75
                                  ? "bg-amber-500"
                                  : "bg-emerald-600"
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {getStatusBadge(invite.status, invite.isActive)}
                      </td>

                      {/* Expiration */}
                      <td className="px-4 py-4 text-[11px] text-brand-brown-600">
                        {invite.expiresAt ? (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-brand-brown-600/70" />
                            <span>
                              {new Date(invite.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-brand-brown-600/50">Never</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-4 text-[11px] text-brand-brown-600">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(invite)}
                            className={`h-7 px-2 text-[11px] font-semibold ${
                              invite.isActive
                                ? "text-amber-800 hover:bg-amber-50"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {invite.isActive ? "Disable" : "Enable"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvite(invite)}
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-sand-dark px-5 py-3 text-xs text-brand-brown-600">
            <span>
              Showing {(page - 1) * 20 + 1} to{" "}
              {Math.min(page * 20, totalCount)} of {totalCount} invites
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-brand-brown-950">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invite Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-brown-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand-dark">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-desert text-brand-brown-950">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-base font-bold text-brand-brown-950">
                  Create Beta Invite Link
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1 text-brand-brown-600 hover:bg-brand-sand hover:text-brand-brown-950"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvite} className="mt-4 space-y-4">
              {/* Code */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="inviteCodeInput"
                    className="text-xs font-semibold text-brand-brown-900"
                  >
                    Invite Code (Optional Custom Code)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] font-bold text-brand-desert-dark hover:underline"
                  >
                    🎲 Generate Random
                  </button>
                </div>
                <input
                  id="inviteCodeInput"
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
                    }))
                  }
                  placeholder="Leave empty to auto-generate (e.g. BETA-7K9Q2M)"
                  className="mt-1.5 h-10 w-full rounded-xl border border-brand-sand-dark bg-white px-3.5 font-mono text-xs font-semibold text-brand-brown-950 outline-none placeholder:font-sans placeholder:font-normal placeholder:text-brand-brown-600/50 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50"
                />
              </div>

              {/* Label / Notes */}
              <div>
                <label
                  htmlFor="labelInput"
                  className="text-xs font-semibold text-brand-brown-900"
                >
                  Label / Recipient Note
                </label>
                <input
                  id="labelInput"
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder="e.g. Friend - Sarah, Discord VIP Group, Wave 1 Testers"
                  className="mt-1.5 h-10 w-full rounded-xl border border-brand-sand-dark bg-white px-3.5 text-xs text-brand-brown-950 outline-none placeholder:text-brand-brown-600/50 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50"
                />
              </div>

              {/* Max Uses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="maxUsesInput"
                    className="text-xs font-semibold text-brand-brown-900"
                  >
                    Max Redemptions
                  </label>
                  <input
                    id="maxUsesInput"
                    type="number"
                    min={1}
                    max={1000}
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxUses: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                    className="mt-1.5 h-10 w-full rounded-xl border border-brand-sand-dark bg-white px-3.5 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50"
                  />
                  <span className="mt-1 block text-[10px] text-brand-brown-600/70">
                    1 = Single friend
                  </span>
                </div>

                {/* Expiration */}
                <div>
                  <label
                    htmlFor="expiresInput"
                    className="text-xs font-semibold text-brand-brown-900"
                  >
                    Expiration (Optional)
                  </label>
                  <input
                    id="expiresInput"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expiresAt: e.target.value,
                      }))
                    }
                    className="mt-1.5 h-10 w-full rounded-xl border border-brand-sand-dark bg-white px-3 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-sand-dark">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-brand-brown-950 text-xs font-semibold text-white hover:bg-brand-brown-900"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="mr-1.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Invite Link"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeemed Users Modal */}
      {selectedInviteForUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-brown-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-brand-sand-dark">
              <div>
                <h3 className="text-base font-bold text-brand-brown-950">
                  Redeemed Users
                </h3>
                <p className="text-xs text-brand-brown-600 font-mono">
                  Code: {selectedInviteForUsers.code}
                </p>
              </div>
              <button
                onClick={() => setSelectedInviteForUsers(null)}
                className="rounded-lg p-1 text-brand-brown-600 hover:bg-brand-sand hover:text-brand-brown-950"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 max-h-72 space-y-2.5 overflow-y-auto">
              {selectedInviteForUsers.usages &&
              selectedInviteForUsers.usages.length > 0 ? (
                selectedInviteForUsers.usages.map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between rounded-xl bg-brand-sand/30 p-2.5 border border-brand-sand-dark"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-brand-sand-dark">
                        {usage.user.avatarUrl && (
                          <AvatarImage src={usage.user.avatarUrl} />
                        )}
                        <AvatarFallback className="bg-brand-desert text-[10px] font-bold text-brand-brown-950">
                          {usage.user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-brand-brown-950">
                          {usage.user.displayName}
                        </p>
                        <p className="text-[11px] text-brand-brown-600">
                          @{usage.user.username}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-brown-600/80">
                      {new Date(usage.usedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-brand-brown-600 py-6">
                  No redemptions yet.
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInviteForUsers(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
