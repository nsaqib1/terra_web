"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Lock,
  RefreshCw,
  RotateCcw,
  Search,
  Unlock,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostDocumentRenderer } from "@/components/post/PostDocumentRenderer";
import type { PostDocument } from "@/components/post/create/editor/editor-types";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import type { AdminPost, AdminPostQuery, Community, PostStatus } from "@/lib/api/types";

const PAGE_SIZE = 20;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClasses(status: PostStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "LOCKED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "REMOVED":
      return "bg-rose-50 text-rose-700 border-rose-200";
  }
}

function extractPreview(document: any) {
  const pieces: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "text" && typeof node.text === "string") pieces.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(document);
  return pieces.join(" ").replace(/\s+/g, " ").trim();
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selected, setSelected] = useState<AdminPost | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | PostStatus>("ALL");
  const [communityId, setCommunityId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: AdminPostQuery = {
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status: status === "ALL" ? undefined : status,
        communityId: communityId === "ALL" ? undefined : communityId,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      const result = await adminApi.getPosts(query);
      setPosts(result.data);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages || 1);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, communityId]);

  useEffect(() => {
    const timer = window.setTimeout(loadPosts, 250);
    return () => window.clearTimeout(timer);
  }, [loadPosts]);

  useEffect(() => {
    adminApi.getCommunities({ limit: 100, sortBy: "name", sortOrder: "asc" })
      .then((result) => setCommunities(result.data))
      .catch(() => undefined);
  }, []);

  const selectedFresh = useMemo(
    () => selected ? posts.find((post) => post.id === selected.id) ?? selected : null,
    [posts, selected],
  );

  const runAction = async (action: "lock" | "unlock" | "remove" | "restore", post: AdminPost) => {
    const messages = {
      lock: `Lock this post? New comments and other interactions may be restricted.`,
      unlock: `Unlock this post?`,
      remove: `Remove this post from the public platform? It will remain available to administrators.`,
      restore: `Restore this post and make it public again?`,
    };
    if (!window.confirm(messages[action])) return;

    setActionLoading(true);
    setError(null);
    try {
      const updated = action === "lock"
        ? await adminApi.lockPost(post.id)
        : action === "unlock"
          ? await adminApi.unlockPost(post.id)
          : action === "remove"
            ? await adminApi.removePost(post.id)
            : await adminApi.restorePost(post.id);
      setSelected(updated);
      setPosts((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">Post Management</h1>
          <p className="mt-1 text-xs text-brand-brown-600">
            Review, lock, remove, and restore posts across Terramids communities.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadPosts}
          disabled={loading}
          className="h-9 gap-2 rounded-xl border-brand-sand-dark"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={15} /></button>
        </div>
      )}

      <div className="rounded-2xl border border-brand-sand-dark bg-white p-3 shadow-sm">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_220px]">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-400" />
            <input
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search post text, author, or community..."
              className="h-10 w-full rounded-xl border border-brand-sand-dark bg-brand-cream/30 pl-9 pr-3 text-xs outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/30"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value as typeof status); }}
            className="h-10 rounded-xl border border-brand-sand-dark bg-white px-3 text-xs font-semibold text-brand-brown-800 outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LOCKED">Locked</option>
            <option value="REMOVED">Removed</option>
          </select>
          <select
            value={communityId}
            onChange={(e) => { setPage(1); setCommunityId(e.target.value); }}
            className="h-10 rounded-xl border border-brand-sand-dark bg-white px-3 text-xs font-semibold text-brand-brown-800 outline-none"
          >
            <option value="ALL">All communities</option>
            {communities.map((community) => (
              <option key={community.id} value={community.id}>{community.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex items-center gap-2 px-1 text-[11px] text-brand-brown-500">
          <Filter size={12} /> {total.toLocaleString()} posts found
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-sand-dark bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_150px_130px_100px_100px_90px] gap-4 border-b border-brand-sand-dark bg-brand-cream/50 px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-brand-brown-500 md:grid">
          <span>Post</span><span>Community</span><span>Author</span><span>Status</span><span>Activity</span><span>View</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-brand-brown-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-brown-500">No posts match the current filters.</div>
        ) : (
          <div className="divide-y divide-brand-sand-dark/70">
            {posts.map((post) => {
              const preview = extractPreview(post.document);
              return (
                <div key={post.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_150px_130px_100px_100px_90px] md:items-center md:gap-4">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-brand-brown-950">
                      {preview || "Media-only post"}
                    </p>
                    <p className="mt-1 truncate font-mono text-[9px] text-brand-brown-400">{post.id}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-brand-brown-800">{post.community.name}</p>
                    <p className="truncate text-[10px] text-brand-brown-500">/{post.community.slug}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-brand-brown-800">{post.author.displayName}</p>
                    <p className="truncate text-[10px] text-brand-brown-500">@{post.author.username}</p>
                  </div>
                  <span className={`w-fit rounded-full border px-2 py-1 text-[9px] font-extrabold ${statusClasses(post.status)}`}>
                    {post.status}
                  </span>
                  <div className="text-[10px] text-brand-brown-600">
                    <div>↑ {post.score}</div>
                    <div>💬 {post.commentCount}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelected(post)}
                    className="h-8 gap-1.5 rounded-lg border-brand-sand-dark text-[10px]"
                  >
                    <Eye size={13} /> Inspect
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-brand-sand-dark bg-brand-cream/30 px-5 py-3">
          <span className="text-[10px] font-semibold text-brand-brown-500">Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 w-8 p-0 rounded-lg"><ChevronLeft size={14} /></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 w-8 p-0 rounded-lg"><ChevronRight size={14} /></Button>
          </div>
        </div>
      </div>

      {selectedFresh && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-brand-brown-950/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-brand-sand-dark bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between border-b border-brand-sand-dark px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-brand-brown-950">Post inspection</h2>
                  <span className={`rounded-full border px-2 py-1 text-[9px] font-extrabold ${statusClasses(selectedFresh.status)}`}>{selectedFresh.status}</span>
                </div>
                <p className="mt-1 text-[10px] text-brand-brown-500">
                  {selectedFresh.community.name} · @{selectedFresh.author.username} · {formatDate(selectedFresh.createdAt)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-xl p-2 text-brand-brown-500 hover:bg-brand-sand"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4 flex flex-wrap gap-2 text-[10px] font-semibold text-brand-brown-600">
                <span className="rounded-lg bg-brand-cream px-2.5 py-1.5">↑ {selectedFresh.score} score</span>
                <span className="rounded-lg bg-brand-cream px-2.5 py-1.5">💬 {selectedFresh.commentCount} comments</span>
                <span className="rounded-lg bg-brand-cream px-2.5 py-1.5">{selectedFresh.voteCount} votes</span>
                <span className="rounded-lg bg-brand-cream px-2.5 py-1.5">{selectedFresh.mediaCount} media</span>
              </div>

              {selectedFresh.tags.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {selectedFresh.tags.map((tag) => <span key={tag.id} className="rounded-full bg-brand-sand px-2.5 py-1 text-[10px] font-bold text-brand-brown-700">#{tag.name}</span>)}
                </div>
              )}

              <article className="rounded-2xl border border-brand-sand-dark bg-white p-5">
                <PostDocumentRenderer document={selectedFresh.document as PostDocument} />
              </article>

              {selectedFresh.deletedAt && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <div><strong>Removed:</strong> {formatDate(selectedFresh.deletedAt)}</div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-brand-sand-dark bg-brand-cream/30 px-5 py-4">
              {selectedFresh.status === "ACTIVE" && (
                <Button variant="outline" disabled={actionLoading} onClick={() => runAction("lock", selectedFresh)} className="gap-2 rounded-xl border-amber-200 text-amber-800 hover:bg-amber-50"><Lock size={14} /> Lock</Button>
              )}
              {selectedFresh.status === "LOCKED" && (
                <Button variant="outline" disabled={actionLoading} onClick={() => runAction("unlock", selectedFresh)} className="gap-2 rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50"><Unlock size={14} /> Unlock</Button>
              )}
              {selectedFresh.status !== "REMOVED" && (
                <Button variant="outline" disabled={actionLoading} onClick={() => runAction("remove", selectedFresh)} className="gap-2 rounded-xl border-rose-200 text-rose-800 hover:bg-rose-50"><Archive size={14} /> Remove</Button>
              )}
              {selectedFresh.status === "REMOVED" && (
                <Button variant="outline" disabled={actionLoading} onClick={() => runAction("restore", selectedFresh)} className="gap-2 rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50"><RotateCcw size={14} /> Restore</Button>
              )}
              <Button disabled={actionLoading} onClick={() => setSelected(null)} className="rounded-xl bg-brand-brown-950 text-white hover:bg-brand-brown-800">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
