'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Search, Wrench } from 'lucide-react';
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
      <div className="mx-auto max-w-[1180px] space-y-6">
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-brand-brown-700">
              <Wrench size={17} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Explore</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950">Tools</h1>
            <p className="mt-1 max-w-xl text-xs leading-5 text-brand-brown-700">
              Useful tools shared by the Terramids community.
            </p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {loading ? 'Loading tools…' : `${tools.length} ${tools.length === 1 ? 'tool' : 'tools'}`}
          </p>
        </header>

        <section aria-label="Filter tools" className="space-y-4">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search tools..."
              aria-label="Search tools"
              className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-brand-brown-950 placeholder-muted-foreground outline-none transition-colors focus:border-brand-brown-700"
            />
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Tool categories">
            {categories.map((item) => {
              const selected = category === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateCategory(item.value)}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    selected
                      ? 'border-brand-brown-900 bg-brand-brown-900 text-white'
                      : 'bg-white text-brand-brown-700 hover:border-brand-brown-700 hover:bg-brand-sand/40',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              );
            })}
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
                          {categoryLabels[tool.category]} · {typeLabels[tool.type] ?? tool.type}
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
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t pt-3">
                    {tool.communities.slice(0, 3).map((community) => (
                      <span
                        key={community.id}
                        className="rounded-md bg-brand-cream px-2 py-1 text-[10px] font-medium text-brand-brown-700"
                      >
                        {community.name}
                      </span>
                    ))}
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
                : 'Published tools will appear here as they become available.'}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
