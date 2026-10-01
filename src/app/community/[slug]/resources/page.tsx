"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { communitiesApi } from "@/lib/api/communities";
import { resourcesApi } from "@/lib/api/resources";
import { ResourceItem, ResourceTag } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

export default function CommunityResourcesPage() {
  const [community, setCommunity] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [tags, setTags] = useState<ResourceTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "downloads">("newest");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";

  useEffect(() => {
    if (!slug) return;
    communitiesApi.getBySlug(slug).then((data) => setCommunity({ id: data.id, name: data.name, slug: data.slug })).catch((err) => setError(extractErrorMessage(err)));
  }, [slug]);

  const load = useCallback(async () => {
    if (!community) return;
    setLoading(true);
    try {
      const [resourceResponse, tagResponse] = await Promise.all([
        resourcesApi.list({ communityId: community.id, q: query || undefined, tagIds: selectedTags, sort, page, limit: 30 }),
        resourcesApi.listTags(community.id, tagQuery || undefined),
      ]);
      setResources((current) => page === 1 ? (resourceResponse.data || []) : [...current, ...(resourceResponse.data || [])]);
      setHasMore(resourceResponse.meta.page < resourceResponse.meta.totalPages);
      setTags(tagResponse || []);
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to load resources."));
    } finally {
      setLoading(false);
    }
  }, [community, query, selectedTags, sort, page, tagQuery]);

  useEffect(() => { setPage(1); }, [query, selectedTags, sort]);

  useEffect(() => { load(); }, [load]);

  const toggleTag = (id: string) => {
    setSelectedTags((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-6 flex items-center gap-3">
          <Link href={community ? `/community/${community.slug}` : "/communities"} className="rounded-lg p-2 text-brand-brown-700 hover:bg-brand-sand">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-desert-dark">Community Resources</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">{community?.name || "Resources"}</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <main>
            <div className="rounded-2xl border border-brand-sand-dark/70 bg-white p-4 shadow-xs">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-500" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources…" className="h-10 w-full rounded-xl border border-brand-sand-dark bg-white pl-9 pr-3 text-xs outline-none focus:border-brand-desert-dark" />
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 rounded-xl border border-brand-sand-dark bg-white px-3 text-xs font-semibold text-brand-brown-800 outline-none">
                  <option value="newest">Newest</option>
                  <option value="downloads">Most downloaded</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>

              {selectedTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTags.map((id) => {
                    const tag = tags.find((item) => item.id === id);
                    if (!tag) return null;
                    return <button key={id} onClick={() => toggleTag(id)} className="inline-flex items-center gap-1 rounded-lg bg-brand-brown-950 px-2.5 py-1.5 text-[10px] font-semibold text-white">#{tag.name}<X size={11} /></button>;
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-brand-brown-700">{loading ? "Loading…" : `${resources.length} resources`}</p>
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">{error}</div> : null}
            {!loading && !error && resources.length === 0 ? <div className="mt-4 rounded-2xl border border-brand-sand-dark/70 bg-white p-10 text-center text-sm text-brand-brown-600">No resources match your search.</div> : null}
            <div className="mt-4 space-y-3">
              {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
            </div>
            {hasMore && !loading && (
              <button onClick={() => setPage((current) => current + 1)} className="mt-4 w-full rounded-xl border border-brand-sand-dark bg-white py-2.5 text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand">
                Load more resources
              </button>
            )}
          </main>

          <aside className="rounded-2xl border border-brand-sand-dark/70 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-brand-sand/70 pb-3 text-xs font-bold uppercase tracking-wider text-brand-brown-950"><SlidersHorizontal size={14} /> Browse by tags</div>
            <input value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} placeholder="Search resource tags…" className="mb-3 h-9 w-full rounded-lg border border-brand-sand-dark px-3 text-xs outline-none focus:border-brand-desert-dark" />
            <div className="max-h-[520px] space-y-1 overflow-auto pr-1">
              {tags.map((tag) => (
                <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${selectedTags.includes(tag.id) ? "bg-brand-brown-950 text-white" : "text-brand-brown-700 hover:bg-brand-sand"}`}>
                  <span>#{tag.name}</span><span className="text-[10px] opacity-60">{tag.usageCount}</span>
                </button>
              ))}
              {!tags.length && <p className="py-3 text-xs text-brand-brown-500">No resource tags yet.</p>}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
