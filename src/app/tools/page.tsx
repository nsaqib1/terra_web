'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ArrowUpRight,
  Code2,
  Compass,
  Cpu,
  ExternalLink,
  Grid,
  Layers,
  List,
  RotateCw,
  Search,
  Sparkles,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { toolsApi } from '@/lib/api/tools';
import type { PublicTool, ToolCategory, ToolType } from '@/lib/api/types';
import { extractErrorMessage } from '@/lib/api/errors';

type SortOption = 'newest' | 'alphabetical' | 'type';
type ViewMode = 'grid' | 'list';

interface CategoryOption {
  value: ToolCategory | 'ALL';
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const categories: CategoryOption[] = [
  { value: 'ALL', label: 'All Tools', icon: Wrench },
  { value: 'DEVELOPER', label: 'Developer', icon: Code2 },
  { value: 'PRODUCTIVITY', label: 'Productivity', icon: Sparkles },
  { value: 'MEDIA', label: 'Media', icon: Layers },
  { value: 'EDUCATION', label: 'Education', icon: Compass },
  { value: 'ENGINEERING', label: 'Engineering', icon: Cpu },
  { value: 'OTHER', label: 'Other', icon: Wrench },
];

const categoryLabels: Record<ToolCategory, string> = {
  DEVELOPER: 'Developer',
  PRODUCTIVITY: 'Productivity',
  MEDIA: 'Media',
  EDUCATION: 'Education',
  ENGINEERING: 'Engineering',
  OTHER: 'Other',
};

const typeLabels: Record<ToolType, string> = {
  CLIENT: 'Client-side',
  SERVER: 'Server-backed',
  HYBRID: 'Hybrid',
};

export default function ToolsPage() {
  const [tools, setTools] = useState<PublicTool[]>([]);
  const [category, setCategory] = useState<ToolCategory | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ToolType | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    toolsApi
      .list({
        category: category === 'ALL' ? undefined : category,
        type: selectedType === 'ALL' ? undefined : selectedType,
        q: query.trim() || undefined,
      })
      .then((items) => {
        if (active) {
          setTools(items);
          setError('');
        }
      })
      .catch((e) => {
        if (active) {
          setError(extractErrorMessage(e, 'Could not load tools.'));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [category, selectedType, query]);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    toolsApi
      .list({
        category: category === 'ALL' ? undefined : category,
        type: selectedType === 'ALL' ? undefined : selectedType,
        q: query.trim() || undefined,
      })
      .then((items) => {
        setTools(items);
        setError('');
      })
      .catch((e) => {
        setError(extractErrorMessage(e, 'Could not load tools.'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Client-side sorting
  const sortedTools = useMemo(() => {
    const list = [...tools];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === 'alphabetical') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'type') {
      return list.sort((a, b) => a.type.localeCompare(b.type));
    }
    return list;
  }, [tools, sortBy]);

  // Metrics
  const metrics = useMemo(() => {
    const total = tools.length;
    const live = tools.filter((t) => Boolean(t.launchUrl)).length;
    const communitiesCount = new Set(tools.flatMap((t) => t.communities?.map((c) => c.id) || [])).size;
    return { total, live, communitiesCount };
  }, [tools]);

  const handleResetFilters = () => {
    setCategory('ALL');
    setSelectedType('ALL');
    setQuery('');
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1240px] space-y-7 pb-12">
        {/* ── Page Header & Spotlight ─────────────────────────────────── */}
        <header className="relative isolate overflow-hidden rounded-3xl border border-brand-sand-dark/80 bg-white p-6 shadow-xs sm:p-8 md:p-9">
          {/* Subtle warm backdrop gradients */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-brand-desert-light/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/4 -z-10 h-56 w-56 rounded-full bg-brand-sand/60 blur-2xl"
          />

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-sand-dark bg-brand-cream/80 px-3 py-1 text-[11px] font-semibold text-brand-brown-800 shadow-2xs">
                <Wrench size={12} className="text-brand-desert-dark" />
                <span>Terramids Tool Registry</span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950 sm:text-3xl lg:text-4xl">
                Community Tools & Workspaces
              </h1>

              <p className="text-xs leading-relaxed text-brand-brown-700 sm:text-sm">
                Interactive utilities, standalone builders, and productivity sandboxes shared across
                communities. Launch tools directly in your browser or run them in full screen.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-4 md:flex-col md:items-end">
              <div className="flex items-center gap-4 rounded-2xl border border-brand-sand-dark/70 bg-brand-cream/70 px-4 py-3 shadow-2xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-500">
                    Live Tools
                  </p>
                  <p className="text-xl font-extrabold text-brand-brown-950">
                    {loading ? '—' : metrics.live}
                  </p>
                </div>
                <div className="h-7 w-px bg-brand-sand-dark" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-500">
                    Communities
                  </p>
                  <p className="text-xl font-extrabold text-brand-brown-950">
                    {loading ? '—' : metrics.communitiesCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Control Bar: Search & Filtering ─────────────────────────── */}
        <section aria-label="Tool filters and search" className="space-y-4">
          <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-lg">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown-400"
                  size={16}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tools by name, description, or keyword…"
                  aria-label="Search tools"
                  className="w-full rounded-xl border border-brand-sand-dark/90 bg-brand-cream/40 py-2.5 pl-10 pr-9 text-xs font-medium text-brand-brown-950 placeholder:text-brand-brown-400 outline-none transition focus:border-brand-brown-700 focus:bg-white"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-brand-brown-400 hover:bg-brand-sand hover:text-brand-brown-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Architecture Type Tabs + Sort + View Mode */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Type Filter */}
                <div className="flex items-center rounded-xl border border-brand-sand-dark bg-brand-cream/60 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedType('ALL')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedType === 'ALL'
                        ? 'bg-white text-brand-brown-950 shadow-2xs'
                        : 'text-brand-brown-600 hover:text-brand-brown-950'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('CLIENT')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedType === 'CLIENT'
                        ? 'bg-white text-brand-brown-950 shadow-2xs'
                        : 'text-brand-brown-600 hover:text-brand-brown-950'
                    }`}
                  >
                    Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('SERVER')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedType === 'SERVER'
                        ? 'bg-white text-brand-brown-950 shadow-2xs'
                        : 'text-brand-brown-600 hover:text-brand-brown-950'
                    }`}
                  >
                    Server
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('HYBRID')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedType === 'HYBRID'
                        ? 'bg-white text-brand-brown-950 shadow-2xs'
                        : 'text-brand-brown-600 hover:text-brand-brown-950'
                    }`}
                  >
                    Hybrid
                  </button>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 rounded-xl border border-brand-sand-dark bg-white px-2.5 py-1 text-xs text-brand-brown-700 shadow-2xs">
                  <ArrowUpDown size={13} className="text-brand-brown-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort tools"
                    className="bg-transparent text-xs font-semibold text-brand-brown-900 outline-none cursor-pointer"
                  >
                    <option value="newest">Newest first</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="type">By architecture</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-xl border border-brand-sand-dark bg-brand-cream/60 p-1 text-brand-brown-700">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    title="Grid view"
                    className={`rounded-lg p-1.5 transition ${
                      viewMode === 'grid'
                        ? 'bg-white text-brand-brown-950 shadow-2xs'
                        : 'text-brand-brown-500 hover:text-brand-brown-800'
                    }`}
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    title="List view"
                    className={`rounded-lg p-1.5 transition ${
                      viewMode === 'list'
                        ? 'bg-white text-brand-brown-950 shadow-2xs'
                        : 'text-brand-brown-500 hover:text-brand-brown-800'
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-sand-dark/60 pt-3.5">
              {categories.map((item) => {
                const selected = category === item.value;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    aria-pressed={selected}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? 'bg-brand-brown-950 text-white shadow-xs'
                        : 'border border-brand-sand-dark/80 bg-white text-brand-brown-700 hover:border-brand-brown-700/50 hover:bg-brand-sand/50 hover:text-brand-brown-950'
                    }`}
                  >
                    <IconComponent size={13} className={selected ? 'text-brand-desert' : 'text-brand-brown-500'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 shadow-2xs"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1 font-semibold text-rose-800 hover:bg-rose-100"
            >
              <RotateCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* ── Tool Items (Grid or List) ─────────────────────────────────── */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="flex h-56 flex-col justify-between rounded-2xl border border-brand-sand-dark/70 bg-white p-5 shadow-xs animate-pulse"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-brand-sand/70" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 rounded bg-brand-sand/70" />
                        <div className="h-3 w-20 rounded bg-brand-sand/50" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-brand-sand/40" />
                    <div className="h-3 w-4/5 rounded bg-brand-sand/40" />
                  </div>
                </div>
                <div className="h-8 w-full rounded-xl bg-brand-sand/50" />
              </div>
            ))}
          </div>
        ) : sortedTools.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedTools.map((tool) => {
                const categoryLabel = categoryLabels[tool.category] || tool.category;
                const typeLabel = typeLabels[tool.type] || tool.type;
                const primaryCommunity = tool.communities?.[0];

                return (
                  <div
                    key={tool.id}
                    className="group flex flex-col justify-between rounded-2xl border border-brand-sand-dark/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-brown-700/40 hover:shadow-[0_12px_32px_rgba(72,64,48,0.08)]"
                  >
                    <div>
                      {/* Top Header: Thumbnail + Title + Status */}
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="flex min-w-0 items-center gap-3 focus:outline-hidden"
                        >
                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-sand-dark/70 bg-brand-desert-light/30 shadow-2xs transition-transform group-hover:scale-105">
                            {tool.thumbnailUrl ? (
                              <Image
                                src={tool.thumbnailUrl}
                                alt={tool.title}
                                width={44}
                                height={44}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Wrench size={20} className="text-brand-brown-900" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h2 className="truncate text-sm font-extrabold text-brand-brown-950 group-hover:text-brand-brown-800 group-hover:underline">
                              {tool.title}
                            </h2>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-brand-brown-600">
                              <span className="font-medium text-brand-brown-700">{categoryLabel}</span>
                              <span className="text-brand-brown-300">·</span>
                              <span className="text-brand-brown-500">{typeLabel}</span>
                            </div>
                          </div>
                        </Link>

                        {/* Status Badge */}
                        {tool.launchUrl ? (
                          <span
                            title="Ready to launch"
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span
                            title="In development"
                            className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"
                          >
                            Preview
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-brand-brown-700">
                        {tool.description || 'Interactive tool designed for community collaboration and productivity.'}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 space-y-3 border-t border-brand-sand-dark/60 pt-3.5">
                      {/* Community Badge */}
                      <div className="flex items-center justify-between text-[11px]">
                        {primaryCommunity ? (
                          <Link
                            href={`/community/${primaryCommunity.slug}`}
                            className="inline-flex items-center gap-1.5 truncate text-brand-brown-600 hover:text-brand-brown-950 hover:underline"
                            title={primaryCommunity.name}
                          >
                            <Users size={12} className="text-brand-brown-500" />
                            <span className="truncate max-w-[150px] font-medium">{primaryCommunity.name}</span>
                          </Link>
                        ) : (
                          <span className="text-brand-brown-400">General utility</span>
                        )}

                        {tool.launchUrl && (
                          <a
                            href={tool.launchUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            title="Open separately in a new tab"
                            className="inline-flex items-center gap-1 rounded-md p-1 text-brand-brown-500 hover:bg-brand-sand hover:text-brand-brown-950"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>

                      {/* Main Launch Button */}
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-brown-950 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-brown-900"
                      >
                        <span>Open Workspace</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="divide-y divide-brand-sand-dark/70 rounded-2xl border border-brand-sand-dark/80 bg-white shadow-xs">
              {sortedTools.map((tool) => {
                const categoryLabel = categoryLabels[tool.category] || tool.category;
                const typeLabel = typeLabels[tool.type] || tool.type;
                const primaryCommunity = tool.communities?.[0];

                return (
                  <div
                    key={tool.id}
                    className="group flex flex-col gap-3 p-4 transition hover:bg-brand-cream/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-sand-dark/70 bg-brand-desert-light/30 shadow-2xs">
                        {tool.thumbnailUrl ? (
                          <Image
                            src={tool.thumbnailUrl}
                            alt=""
                            width={40}
                            height={40}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Wrench size={18} className="text-brand-brown-900" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="truncate text-sm font-bold text-brand-brown-950 hover:underline"
                          >
                            {tool.title}
                          </Link>
                          {tool.launchUrl && (
                            <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 md:inline-flex">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live
                            </span>
                          )}
                        </div>

                        <p className="line-clamp-1 mt-0.5 text-xs text-brand-brown-600">
                          {tool.description || 'Community-powered interactive tool.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="rounded-lg bg-brand-sand px-2 py-0.5 font-medium text-brand-brown-800">
                          {categoryLabel}
                        </span>
                        <span className="hidden sm:inline text-brand-brown-500">{typeLabel}</span>
                        {primaryCommunity && (
                          <Link
                            href={`/community/${primaryCommunity.slug}`}
                            className="hidden lg:inline-flex items-center gap-1 text-brand-brown-600 hover:text-brand-brown-950"
                          >
                            <Users size={11} />
                            <span className="truncate max-w-[120px]">{primaryCommunity.name}</span>
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {tool.launchUrl && (
                          <a
                            href={tool.launchUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            title="Open in new window"
                            className="rounded-lg border border-brand-sand-dark p-2 text-brand-brown-700 hover:bg-brand-sand"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}

                        <Link
                          href={`/tools/${tool.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-brown-950 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-brown-900"
                        >
                          <span>Launch</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Empty Search / Filters State */
          <div className="rounded-2xl border border-dashed border-brand-sand-dark bg-white px-6 py-14 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sand/70 text-brand-brown-600">
              <Wrench size={22} />
            </div>
            <h2 className="mt-4 text-sm font-bold text-brand-brown-950">
              {query || category !== 'ALL' || selectedType !== 'ALL'
                ? 'No matching tools found'
                : 'No community tools registered yet'}
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-brand-brown-600">
              {query || category !== 'ALL' || selectedType !== 'ALL'
                ? 'Try adjusting your search criteria, switching categories, or clearing active filters.'
                : 'Interactive tools and sandboxes will appear here once published by community creators.'}
            </p>
            {(query || category !== 'ALL' || selectedType !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-brand-sand-dark bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-brown-800 shadow-xs hover:bg-brand-sand"
              >
                <X size={13} />
                Reset all filters
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
