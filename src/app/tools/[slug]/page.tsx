'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, Loader2, Wrench } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toolsApi } from '@/lib/api/tools';
import type { PublicTool } from '@/lib/api/types';
import { extractErrorMessage } from '@/lib/api/errors';

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<PublicTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; toolsApi.getBySlug(slug).then((value) => { if (active) setTool(value); }).catch((e) => { if (active) setError(extractErrorMessage(e, 'Unable to load this tool.')); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [slug]);
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-brand-brown-600"><Loader2 className="animate-spin" size={18}/> Loading tool…</div>;
  if (error || !tool) return <main className="mx-auto max-w-3xl px-4 py-16"><p className="text-sm text-red-700">{error || 'Tool not found.'}</p><Link href="/tools" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-brown-900"><ArrowLeft size={15}/> All tools</Link></main>;
  return <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-3 py-4 sm:px-6"><header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-sand-dark/80 bg-white p-4"><div className="flex min-w-0 items-center gap-3"><Link href="/tools" aria-label="Back to tools" className="rounded-lg p-2 text-brand-brown-600 hover:bg-brand-sand"><ArrowLeft size={18}/></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-sand text-brand-brown-900">{tool.thumbnailUrl ? <img src={tool.thumbnailUrl} alt="" className="h-full w-full object-cover"/> : <Wrench size={18}/>}</div><div className="min-w-0"><h1 className="truncate text-lg font-extrabold text-brand-brown-950">{tool.title}</h1><p className="line-clamp-1 text-xs text-brand-brown-600">{tool.description || 'A Terramids tool'}</p></div></div>{tool.launchUrl && <a href={tool.launchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-brand-sand-dark px-3 py-2 text-xs font-semibold text-brand-brown-800 hover:bg-brand-cream">Open separately <ExternalLink size={14}/></a>}</header>
    {tool.launchUrl ? <iframe title={tool.title} src={tool.launchUrl} className="min-h-[65vh] w-full flex-1 rounded-2xl border border-brand-sand-dark bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals allow-pointer-lock" referrerPolicy="no-referrer"/> : <div className="rounded-2xl border border-dashed border-brand-sand-dark bg-white p-12 text-center"><Wrench size={28} className="mx-auto mb-3 text-brand-brown-400"/><p className="font-semibold text-brand-brown-950">This tool is not ready to launch.</p></div>}
    </main>;
}
