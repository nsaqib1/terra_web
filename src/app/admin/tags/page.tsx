"use client";

import {
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  Compass,
  Edit2,
  Hash,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Tag,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TagArchiveDialog } from "@/components/admin/TagArchiveDialog";
import { TagFormModal } from "@/components/admin/TagFormModal";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { tagsApi } from "@/lib/api/tags";
import { extractErrorMessage } from "@/lib/api/errors";
import { Community, Tag as TagType } from "@/lib/api/types";

export default function AdminTagsPage() {
  // Community selector
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityId, setCommunityId] = useState<string>("");
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  // Tags list
  const [tags, setTags] = useState<TagType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [archivingTag, setArchivingTag] = useState<TagType | null>(null);

  // Load communities on mount
  useEffect(() => {
    adminApi
      .getCommunities({ status: "ACTIVE", limit: 50 })
      .then((res) => {
        const list = res.data || [];
        setCommunities(list);
        if (list.length > 0) setCommunityId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingCommunities(false));
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const fetchTags = useCallback(async () => {
    if (!communityId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await tagsApi.list({
        communityId,
        q: debouncedSearch.trim() || undefined,
        page,
        limit,
      });
      setTags(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Failed to load tags."));
    } finally {
      setIsLoading(false);
    }
  }, [communityId, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Reset page when community changes
  const handleCommunityChange = (id: string) => {
    setCommunityId(id);
    setPage(1);
    setSearchTerm("");
    setDebouncedSearch("");
  };

  const handleCreateNew = () => {
    setEditingTag(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (tag: TagType) => {
    setEditingTag(tag);
    setIsFormModalOpen(true);
  };

  const handleTagSuccess = (tag: TagType) => {
    // Refresh list to reflect changes
    fetchTags();
  };

  const handleArchiveSuccess = () => {
    fetchTags();
  };

  const selectedCommunity = communities.find((c) => c.id === communityId);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">
            Tag Management
          </h1>
          <p className="mt-1 text-xs text-brand-brown-600">
            Create and manage content tags scoped to each community.
          </p>
        </div>

        <Button
          onClick={handleCreateNew}
          disabled={!communityId}
          className="h-10 gap-2 rounded-xl bg-brand-brown-950 px-4 text-xs font-semibold text-white shadow-sm hover:bg-brand-brown-900 disabled:opacity-50"
        >
          <Plus size={16} />
          <span>New Tag</span>
        </Button>
      </div>

      {/* Community Selector */}
      <div className="rounded-2xl border border-brand-sand-dark/80 bg-white shadow-xs p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Compass size={13} className="text-brand-desert-dark" />
                Community
              </span>
            </label>
            <select
              value={communityId}
              onChange={(e) => handleCommunityChange(e.target.value)}
              disabled={loadingCommunities}
              className="h-10 w-full max-w-sm rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs font-medium text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none disabled:opacity-60"
            >
              {loadingCommunities ? (
                <option>Loading communities…</option>
              ) : communities.length === 0 ? (
                <option value="">No active communities</option>
              ) : (
                communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-0 sm:max-w-xs">
            <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
              Search Tags
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or slug…"
                disabled={!communityId}
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-8 pr-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTags}
            disabled={!communityId || isLoading}
            className="h-10 w-10 rounded-xl border-brand-sand-dark p-0 flex items-center justify-center text-brand-brown-700 hover:bg-brand-sand shrink-0"
            title="Refresh"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tags Table */}
      <div className="rounded-2xl border border-brand-sand-dark/80 bg-white shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <Tag size={17} className="text-brand-desert-dark" />
            <h2 className="text-sm font-bold text-brand-brown-950">
              {selectedCommunity ? (
                <>
                  Tags —{" "}
                  <span className="font-extrabold">{selectedCommunity.name}</span>
                </>
              ) : (
                "Tags"
              )}
            </h2>
            {!isLoading && communityId && (
              <span className="ml-1 rounded-full bg-brand-sand px-2 py-0.5 text-[10px] font-bold text-brand-brown-700">
                {total}
              </span>
            )}
          </div>
        </div>

        {/* No community selected */}
        {!communityId && !loadingCommunities && (
          <div className="p-12 text-center">
            <Compass size={32} className="mx-auto mb-3 text-brand-sand-dark" />
            <p className="text-sm font-semibold text-brand-brown-700">
              Select a community above
            </p>
            <p className="mt-1 text-xs text-brand-brown-600">
              Tags are scoped to individual communities.
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && communityId && (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-brand-brown-600">
            <Loader2 size={18} className="animate-spin text-brand-desert-dark" />
            <span>Loading tags…</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && communityId && tags.length === 0 && !errorMessage && (
          <div className="p-12 text-center">
            <Hash size={32} className="mx-auto mb-3 text-brand-sand-dark" />
            <p className="text-sm font-semibold text-brand-brown-700">
              {debouncedSearch ? "No tags match your search" : "No tags yet"}
            </p>
            <p className="mt-1 text-xs text-brand-brown-600">
              {debouncedSearch
                ? "Try a different keyword."
                : "Create the first tag for this community."}
            </p>
            {!debouncedSearch && (
              <Button
                onClick={handleCreateNew}
                className="mt-4 h-9 gap-1.5 rounded-xl bg-brand-brown-950 px-4 text-xs font-semibold text-white hover:bg-brand-brown-900"
              >
                <Plus size={14} />
                Create Tag
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        {!isLoading && tags.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-sand/60 bg-brand-sand/20">
                  <th className="px-5 py-2.5 text-left font-semibold text-brand-brown-700 tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-brand-brown-700 tracking-wide hidden sm:table-cell">
                    Slug
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-brand-brown-700 tracking-wide hidden md:table-cell">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold text-brand-brown-700 tracking-wide hidden sm:table-cell">
                    <span className="flex items-center justify-end gap-1">
                      <TrendingUp size={12} />
                      Usage
                    </span>
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-brand-brown-700 tracking-wide hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold text-brand-brown-700 tracking-wide hidden lg:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold text-brand-brown-700 tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/40">
                {tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="hover:bg-brand-sand/20 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-desert-light text-brand-brown-800">
                          <Hash size={11} />
                        </div>
                        <span className="font-semibold text-brand-brown-950">
                          {tag.name}
                        </span>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="font-mono text-[11px] bg-brand-sand/60 text-brand-brown-700 px-1.5 py-0.5 rounded-md">
                        {tag.slug}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3.5 hidden md:table-cell max-w-[200px]">
                      <span className="line-clamp-1 text-brand-brown-600">
                        {tag.description || (
                          <span className="italic text-brand-brown-600/40">
                            No description
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Usage Count */}
                    <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-brown-700">
                        <TrendingUp size={11} className="text-brand-desert-dark" />
                        {tag.usageCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          tag.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {tag.status === "ACTIVE" ? "Active" : "Archived"}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3.5 hidden lg:table-cell text-brand-brown-600">
                      {formatDate(tag.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Edit tag"
                          onClick={() => handleEdit(tag)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-sand-dark text-brand-brown-700 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        {tag.status === "ACTIVE" && (
                          <button
                            type="button"
                            title="Archive tag"
                            onClick={() => setArchivingTag(tag)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-sand-dark text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                          >
                            <Archive size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-sand/60 px-5 py-3">
            <p className="text-[11px] text-brand-brown-600">
              Showing{" "}
              <span className="font-semibold text-brand-brown-950">
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-semibold text-brand-brown-950">{total}</span>
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-sand-dark text-brand-brown-700 hover:bg-brand-sand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] font-semibold text-brand-brown-700 px-1">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-sand-dark text-brand-brown-700 hover:bg-brand-sand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TagFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTag(null);
        }}
        onSuccess={handleTagSuccess}
        communityId={communityId || undefined}
        tag={editingTag}
      />

      <TagArchiveDialog
        isOpen={!!archivingTag}
        tag={archivingTag}
        onClose={() => setArchivingTag(null)}
        onSuccess={handleArchiveSuccess}
      />
    </div>
  );
}
