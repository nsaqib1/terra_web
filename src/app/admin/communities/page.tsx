"use client";

import {
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  Compass,
  Edit2,
  ExternalLink,
  Filter,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { CommunityDeleteDialog } from "@/components/admin/CommunityDeleteDialog";
import { CommunityFormModal } from "@/components/admin/CommunityFormModal";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import {
  Community,
  CommunityMaturity,
  CommunityStatus,
  GovernanceMode,
} from "@/lib/api/types";

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommunityStatus | "ALL">(
    "ALL"
  );
  const [maturityFilter, setMaturityFilter] = useState<
    CommunityMaturity | "ALL"
  >("ALL");
  const [governanceFilter, setGovernanceFilter] = useState<
    GovernanceMode | "ALL"
  >("ALL");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(
    null
  );
  const [deletingCommunity, setDeletingCommunity] = useState<Community | null>(
    null
  );

  const fetchCommunities = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await adminApi.getCommunities({
        search: searchTerm.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        maturity: maturityFilter === "ALL" ? undefined : maturityFilter,
        governanceMode:
          governanceFilter === "ALL" ? undefined : governanceFilter,
        page,
        limit,
      });

      setCommunities(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, "Failed to load communities.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, maturityFilter, governanceFilter, page, limit]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleCreateNew = () => {
    setEditingCommunity(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (community: Community) => {
    setEditingCommunity(community);
    setIsFormModalOpen(true);
  };

  const handleDelete = (community: Community) => {
    setDeletingCommunity(community);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">
              Communities
            </h1>
            <span className="rounded-full bg-brand-sand px-2.5 py-0.5 text-xs font-bold text-brand-brown-800">
              {total}
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-brown-600">
            Create, configure, monitor, and archive platform communities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCommunities()}
            disabled={isLoading}
            className="h-10 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
          >
            <RefreshCw
              size={15}
              className={isLoading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            onClick={handleCreateNew}
            className="h-10 gap-2 rounded-xl bg-brand-brown-950 px-4 text-xs font-semibold text-white shadow-sm hover:bg-brand-brown-900"
          >
            <Plus size={16} />
            <span>New Community</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, slug, description..."
              className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as CommunityStatus | "ALL");
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Maturity Filter */}
          <div>
            <select
              value={maturityFilter}
              onChange={(e) => {
                setMaturityFilter(e.target.value as CommunityMaturity | "ALL");
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
            >
              <option value="ALL">All Maturities</option>
              <option value="NEW">New</option>
              <option value="GROWING">Growing</option>
              <option value="ESTABLISHED">Established</option>
              <option value="SELF_GOVERNED">Self Governed</option>
            </select>
          </div>

          {/* Governance Filter */}
          <div>
            <select
              value={governanceFilter}
              onChange={(e) => {
                setGovernanceFilter(e.target.value as GovernanceMode | "ALL");
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
            >
              <option value="ALL">All Governance Modes</option>
              <option value="PLATFORM_MANAGED">Platform Managed</option>
              <option value="SELF_GOVERNED">Self Governed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Communities Table Card */}
      <div className="rounded-2xl border border-brand-sand-dark/80 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2.5 p-8">
            <Loader2 size={26} className="animate-spin text-brand-desert-dark" />
            <p className="text-xs font-medium text-brand-brown-600">
              Loading communities...
            </p>
          </div>
        ) : communities.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sand text-brand-brown-700">
              <Compass size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-brown-950">
                No communities found
              </p>
              <p className="mt-1 text-xs text-brand-brown-600">
                Try adjusting your search criteria or create a new community.
              </p>
            </div>
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="mt-2 h-9 rounded-xl bg-brand-brown-950 text-xs font-semibold text-white"
            >
              <Plus size={14} />
              <span>Create Community</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-sand bg-brand-cream/60 text-brand-brown-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">Community</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Maturity</th>
                  <th className="py-3.5 px-4">Governance</th>
                  <th className="py-3.5 px-4">Members</th>
                  <th className="py-3.5 px-4">Posts</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-sand/60">
                {communities.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-brand-sand/20 transition-colors"
                  >
                    {/* Community info */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-brown-950 text-sm">
                          {c.name}
                        </span>
                        <span className="font-mono text-[11px] text-brand-brown-600/80">
                          /{c.slug}
                        </span>
                        {c.description && (
                          <span className="text-[11px] text-brand-brown-600 line-clamp-1 mt-0.5 max-w-sm">
                            {c.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "INACTIVE"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            c.status === "ACTIVE"
                              ? "bg-emerald-600"
                              : c.status === "INACTIVE"
                              ? "bg-amber-600"
                              : "bg-gray-500"
                          }`}
                        />
                        {c.status}
                      </span>
                    </td>

                    {/* Maturity */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="rounded-md bg-brand-sand/70 px-2 py-0.5 text-[10px] font-semibold text-brand-brown-800 capitalize">
                        {c.maturity.toLowerCase().replace("_", " ")}
                      </span>
                    </td>

                    {/* Governance */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-brand-brown-700 font-medium">
                        {c.governanceMode === "SELF_GOVERNED"
                          ? "Self Governed"
                          : "Platform Managed"}
                      </span>
                    </td>

                    {/* Members */}
                    <td className="py-4 px-4 whitespace-nowrap font-semibold text-brand-brown-950">
                      {c.membersCount?.toLocaleString() ?? 0}
                    </td>

                    {/* Posts */}
                    <td className="py-4 px-4 whitespace-nowrap font-semibold text-brand-brown-950">
                      {c.postsCount?.toLocaleString() ?? 0}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/c/${c.slug}`}
                          target="_blank"
                          title="View on site"
                          className="rounded-lg p-1.5 text-brand-brown-600 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors"
                        >
                          <ExternalLink size={15} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          title="Edit community"
                          className="rounded-lg p-1.5 text-brand-brown-700 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          title="Archive community"
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Archive size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-sand/80 px-6 py-3.5 bg-brand-cream/40">
            <span className="text-[11px] text-brand-brown-600">
              Showing page <strong>{page}</strong> of{" "}
              <strong>{totalPages}</strong> ({total} total communities)
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 gap-1 rounded-lg border-brand-sand-dark px-2.5 text-xs"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 gap-1 rounded-lg border-brand-sand-dark px-2.5 text-xs"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CommunityFormModal
        isOpen={isFormModalOpen}
        community={editingCommunity}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCommunity(null);
        }}
        onSuccess={() => {
          fetchCommunities();
        }}
      />

      <CommunityDeleteDialog
        isOpen={!!deletingCommunity}
        community={deletingCommunity}
        onClose={() => setDeletingCommunity(null)}
        onSuccess={() => {
          fetchCommunities();
        }}
      />
    </div>
  );
}
