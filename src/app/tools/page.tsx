'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Search, Sparkles, Users, Wrench } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { toolsApi } from '@/lib/api/tools';
import type { PublicTool, ToolCategory } from '@/lib/api/types';
import { extractErrorMessage } from '@/lib/api/errors';

const categories: { value: ToolCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All tools' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'PRODUCTIVITY', label: 'Productivity' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'OTHER', label: 'Other' },
];

const categoryLabels: Record<ToolCategory, string> = {
  DEVELOPER: 'Developer',
  PRODUCTIVITY: 'Productivity',
  MEDIA: 'Media',
  EDUCATION: 'Education',
  ENGINEERING: 'Engineering',
  OTHER: 'Other',
};

const typeLabels: Record<string, string> = {
  CLIENT: 'Client-side',
  SERVER: 'Server-backed',
  HYBRID: 'Hybrid',
};

export default function ToolsPage() {
  const [tools, setTools] = useState<PublicTool[]>([]);
  const [category, setCategory] = useState<ToolCategory | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    toolsApi
      .list({
        category: category === 'ALL' ? undefined : category,
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
  }, [category, query]);

  const updateCategory = (nextCategory: ToolCategory | 'ALL') => {
    if (nextCategory === category) return;
    setCategory(nextCategory);
    setLoading(true);
  };

  const updateQuery = (nextQuery: string) => {
    if (nextQuery === query) return;
    setQuery(nextQuery);
    setLoading(true);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] space-y-8">
        <header className="relative isolate overflow-hidden rounded-3xl border border-brand-sand-dark bg-brand-warm-white px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-brand-desert-light/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 h-56 w-56 rounded-full bg-brand-sand/80 blur-2xl"
          />

          <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_230px] md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-sand-dark/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-brown-700">
                <Sparkles size={13} className="text-brand-desert-dark" />
                A toolkit for our communities
              </div>
              <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-[-0.035em] text-brand-brown-950 sm:text-4xl lg:text-[2.75rem]">
                Useful things, made for what we care about.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-brand-brown-700 sm:text-base sm:leading-7">
                Explore tools connected to Terramids communities—shared to help people learn, build,
                create, and solve things together.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_12px_36px_rgba(72,64,48,0.06)] md:block">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-desert-light/70 text-brand-brown-900">
                <Users size={20} />
              </div>
              <p className="mt-5 text-sm font-bold text-brand-brown-950">Shared with purpose</p>
              <p className="mt-1.5 text-xs leading-5 text-brand-brown-600">
                Discover useful finds from the communities you care about.
              </p>
              <div className="mt-5 flex items-center gap-2 border-t border-brand-sand pt-4 text-[11px] font-semibold text-brand-brown-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-desert-dark" />
                Learn · make · share
              </div>
            </div>
          </div>
        </header>

        <section aria-label="Filter tools" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-brand-brown-950">Explore tools</h2>
              <p className="mt-1 text-xs text-brand-brown-600">
                Find a helpful resource for your next idea.
              </p>
            </div>
            <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
              {loading ? 'Loading tools…' : `${tools.length} ${tools.length === 1 ? 'tool' : 'tools'}`}
            </p>
          </div>

          <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-4 sm:p-5">
            <div className="relative max-w-md">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <input
                type="search"
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="Search community tools..."
                aria-label="Search tools"
                className="w-full rounded-xl border bg-brand-cream/60 py-3 pl-10 pr-4 text-xs font-medium text-brand-brown-950 placeholder-muted-foreground outline-none transition-colors focus:border-brand-brown-700"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2" aria-label="Tool categories">
              {categories.map((item) => {
                const selected = category === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateCategory(item.value)}
                    className={[
                      'rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                      selected
                        ? 'border-brand-brown-900 bg-brand-brown-900 text-white'
                        : 'border-brand-sand-dark/80 bg-white text-brand-brown-700 hover:border-brand-brown-700 hover:bg-brand-sand/40',
                    ].join(' ')}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-2xl border bg-white p-5"
                aria-hidden="true"
              >
                <div className="mb-4 h-11 w-11 rounded-xl bg-brand-sand/60" />
                <div className="mb-3 h-4 w-2/3 rounded bg-brand-sand/50" />
                <div className="h-3 w-full rounded bg-brand-sand/40" />
                <div className="mt-2 h-3 w-4/5 rounded bg-brand-sand/40" />
              </div>
            ))}
          </div>
        ) : tools.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group flex min-h-48 flex-col justify-between rounded-2xl border bg-white p-5 transition-all hover:border-brand-brown-700/40 hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-desert-light text-brand-brown-900 transition-colors group-hover:bg-brand-sand">
                        {tool.thumbnailUrl ? (
                          <Image
                            src={tool.thumbnailUrl}
                            alt=""
                            width={44}
                            height={44}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Wrench size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-brand-brown-950 group-hover:underline">
                          {tool.title}
                        </h2>
                        <span className="text-[11px] text-muted-foreground">
                          {categoryLabels[tool.category]} <span aria-hidden="true">·</span>{' '}
                          {typeLabels[tool.type] ?? tool.type}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-brown-950"
                    />
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-brand-brown-700">
                    {tool.description || 'A useful tool from the Terramids community.'}
                  </p>
                </div>

                {tool.communities.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-brown-600">
                      <Users size={12} />
                      Shared with
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.communities.slice(0, 3).map((community) => (
                        <span
                          key={community.id}
                          className="rounded-md bg-brand-cream px-2 py-1 text-[10px] font-medium text-brand-brown-700"
                        >
                          {community.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white px-6 py-14 text-center">
            <Wrench className="mx-auto mb-3 text-brand-brown-400" size={26} />
            <h2 className="text-sm font-bold text-brand-brown-950">
              {query || category !== 'ALL' ? 'No tools found' : 'No tools yet'}
            </h2>
            <p className="mt-1 text-xs text-brand-brown-600">
              {query || category !== 'ALL'
                ? 'Try a different search or category.'
                : 'Community-shared tools will appear here as they become available.'}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
