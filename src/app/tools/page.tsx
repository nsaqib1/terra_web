'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Wrench, Search, ArrowUpRight } from 'lucide-react';
import { toolsApi } from '@/lib/api/tools';
import type { PublicTool, ToolCategory } from '@/lib/api/types';
import { extractErrorMessage } from '@/lib/api/errors';

const categories: { value: ToolCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All tools' }, { value: 'DEVELOPER', label: 'Developer' }, { value: 'PRODUCTIVITY', label: 'Productivity' }, { value: 'MEDIA', label: 'Media' }, { value: 'EDUCATION', label: 'Education' }, { value: 'ENGINEERING', label: 'Engineering' }, { value: 'OTHER', label: 'Other' },
];
export default function ToolsPage() {
  const [tools, setTools] = useState<PublicTool[]>([]);
  const [category, setCategory] = useState<ToolCategory | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; setLoading(true); toolsApi.list({ category: category === 'ALL' ? undefined : category, q: query.trim() || undefined }).then((items) => { if (active) { setTools(items); setError(''); } }).catch((e) => { if (active) setError(extractErrorMessage(e, 'Could not load tools.')); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [category, query]);
  return <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><header className="mb-8"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sand text-brand-brown-900"><Wrench size={23}/></div><h1 className="text-3xl font-extrabold tracking-tight text-brand-brown-950">Tools</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-brand-brown-600">Useful tools for solving problems, creating things, and getting work done — connected to Terramids communities.</p></header>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-500"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." className="h-11 w-full rounded-xl border border-brand-sand-dark bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-desert-dark"/></div><select value={category} onChange={(e) => setCategory(e.target.value as ToolCategory | 'ALL')} className="h-11 rounded-xl border border-brand-sand-dark bg-white px-3 text-sm text-brand-brown-900">{categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    {loading ? <div className="py-16 text-center text-sm text-brand-brown-600">Loading tools…</div> : tools.length === 0 ? <div className="rounded-2xl border border-dashed border-brand-sand-dark bg-white px-6 py-16 text-center"><Wrench className="mx-auto mb-3 text-brand-brown-400" size={30}/><h2 className="font-bold text-brand-brown-950">No tools yet</h2><p className="mt-1 text-sm text-brand-brown-600">Published tools will appear here as they become available.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tools.map((tool) => <Link key={tool.id} href={`/tools/${tool.slug}`} className="group rounded-2xl border border-brand-sand-dark/80 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-desert-dark hover:shadow-md"><div className="mb-4 flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-brand-sand text-brand-brown-900">{tool.thumbnailUrl ? <img src={tool.thumbnailUrl} alt="" className="h-full w-full object-cover"/> : <Wrench size={19}/>}</div><ArrowUpRight size={17} className="text-brand-brown-400 transition group-hover:text-brand-brown-900"/></div><h2 className="font-bold text-brand-brown-950">{tool.title}</h2><p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-brand-brown-600">{tool.description || 'A useful tool from the Terramids community.'}</p><div className="mt-4 flex flex-wrap gap-1.5">{tool.communities.slice(0, 3).map((community) => <span key={community.id} className="rounded-full bg-brand-cream px-2.5 py-1 text-[10px] font-semibold text-brand-brown-700">{community.name}</span>)}</div></Link>)}</div>}
  </main>;
}
