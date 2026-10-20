'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ExternalLink,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCw,
  Share2,
  Sparkles,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { toolsApi } from '@/lib/api/tools';
import type { PublicTool, ToolCategory } from '@/lib/api/types';
import { extractErrorMessage } from '@/lib/api/errors';

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

export default function ToolPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [tool, setTool] = useState<PublicTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Workspace controls
  const [reloadKey, setReloadKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!slug) return;
    let active = true;

    toolsApi
      .getBySlug(slug)
      .then((data) => {
        if (active) {
          setTool(data);
          setError('');
        }
      })
      .catch((err) => {
        if (active) {
          setError(extractErrorMessage(err, 'Unable to load this tool.'));
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
  }, [slug]);

  const handleRetry = () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    toolsApi
      .getBySlug(slug)
      .then((data) => {
        setTool(data);
        setError('');
      })
      .catch((err) => {
        setError(extractErrorMessage(err, 'Unable to load this tool.'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle Fullscreen Toggle
  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked
    }
  };

  // Handle Tool Reload
  const handleReload = () => {
    setIsRefreshing(true);
    setIsIframeLoading(true);
    setReloadKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Handle Link Copy
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-brand-cream">
        {/* Placeholder Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-brand-sand-dark/70 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-sand-dark bg-white px-3 py-1.5 text-xs font-semibold text-brand-brown-800 shadow-xs hover:bg-brand-sand"
            >
              <ArrowLeft size={14} />
              <span>All tools</span>
            </Link>
            <div className="h-5 w-px bg-brand-sand-dark" />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-brand-sand/70" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 animate-pulse rounded bg-brand-sand/70" />
                <div className="h-3 w-20 animate-pulse rounded bg-brand-sand/50" />
              </div>
            </div>
          </div>
        </header>

        {/* Loading Workspace */}
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs">
              <Loader2 className="h-7 w-7 animate-spin text-brand-brown-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-brown-950">Loading workspace…</p>
              <p className="mt-1 text-xs text-brand-brown-600">Connecting to tool environment</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !tool) {
    return (
      <div className="flex min-h-screen flex-col bg-brand-cream">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-brand-sand-dark/70 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-sand-dark bg-white px-3 py-1.5 text-xs font-semibold text-brand-brown-800 shadow-xs hover:bg-brand-sand"
          >
            <ArrowLeft size={14} />
            <span>All tools</span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-brand-sand-dark bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Wrench size={22} />
            </div>
            <h1 className="mt-4 text-lg font-bold text-brand-brown-950">Tool Unavailable</h1>
            <p className="mt-2 text-xs leading-relaxed text-brand-brown-600">
              {error || 'The requested tool could not be found or has been removed.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-sand-dark bg-white px-4 py-2 text-xs font-semibold text-brand-brown-800 shadow-xs hover:bg-brand-sand"
              >
                <RotateCw size={14} />
                Try again
              </button>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-brown-900"
              >
                <ArrowLeft size={14} />
                Back to tools
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const categoryLabel = categoryLabels[tool.category] || tool.category;
  const typeLabel = typeLabels[tool.type] || tool.type;
  const primaryCommunity = tool.communities?.[0];

  return (
    <div
      ref={containerRef}
      className={`flex min-h-screen flex-col bg-brand-cream ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen overflow-hidden' : ''
      }`}
    >
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-brand-sand-dark/80 bg-white/95 px-3 backdrop-blur-md transition-colors sm:px-6">
        {/* Left: Navigation & Tool Info */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
          <Link
            href="/tools"
            aria-label="Back to all tools"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-sand-dark bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-brown-800 shadow-xs transition hover:border-brand-brown-700/40 hover:bg-brand-sand/60 hover:text-brand-brown-950 sm:px-3 sm:py-2"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Tools</span>
          </Link>

          <div className="h-5 w-px bg-brand-sand-dark" aria-hidden="true" />

          {/* Tool Icon & Title */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-sand-dark/70 bg-brand-desert-light/35 shadow-xs sm:h-10 sm:w-10">
              {tool.thumbnailUrl ? (
                <Image
                  src={tool.thumbnailUrl}
                  alt={tool.title}
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
                <h1
                  id={titleId}
                  className="truncate text-sm font-extrabold text-brand-brown-950 sm:text-base"
                >
                  {tool.title}
                </h1>

                {/* Status Dot */}
                {tool.launchUrl && (
                  <span
                    title="Tool is active"
                    className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 md:inline-flex"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
              </div>

              {/* Sub-meta: Category, Type, Community */}
              <div className="flex items-center gap-1.5 text-[11px] text-brand-brown-600">
                <span className="font-medium text-brand-brown-700">{categoryLabel}</span>
                <span className="text-brand-brown-300" aria-hidden="true">
                  ·
                </span>
                <span className="hidden sm:inline text-brand-brown-500">{typeLabel}</span>

                {primaryCommunity && (
                  <>
                    <span className="hidden sm:inline text-brand-brown-300" aria-hidden="true">
                      ·
                    </span>
                    <Link
                      href={`/community/${primaryCommunity.slug}`}
                      className="hidden sm:inline-flex items-center gap-1 font-semibold text-brand-brown-700 hover:text-brand-brown-950 hover:underline"
                    >
                      <Users size={11} className="text-brand-brown-500" />
                      <span>{primaryCommunity.name}</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Reload Tool */}
          {tool.launchUrl && (
            <button
              type="button"
              onClick={handleReload}
              aria-label="Reload tool"
              title="Reload tool"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-sand-dark bg-white text-brand-brown-800 shadow-xs transition hover:bg-brand-sand hover:text-brand-brown-950"
            >
              <RotateCw size={15} className={isRefreshing ? 'animate-spin text-brand-desert-dark' : ''} />
            </button>
          )}

          {/* Share / Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy tool link"
            title={copied ? 'Link copied!' : 'Copy link'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-sand-dark bg-white text-brand-brown-800 shadow-xs transition hover:bg-brand-sand hover:text-brand-brown-950 sm:h-9 sm:w-auto sm:px-3 sm:py-1.5"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="hidden sm:inline ml-1.5 text-xs font-semibold text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span className="hidden sm:inline ml-1.5 text-xs font-semibold">Share</span>
              </>
            )}
          </button>

          {/* Open Separately in new tab */}
          {tool.launchUrl && (
            <a
              href={tool.launchUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Open tool in new tab"
              title="Open in new tab"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-sand-dark bg-white text-brand-brown-800 shadow-xs transition hover:bg-brand-sand hover:text-brand-brown-950 sm:h-9 sm:w-auto sm:px-3 sm:py-1.5"
            >
              <ExternalLink size={14} />
              <span className="hidden md:inline ml-1.5 text-xs font-semibold">Open in new tab</span>
            </a>
          )}

          {/* About / Info Sheet Toggle */}
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            aria-label="Toggle tool details"
            title="Tool details"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border shadow-xs transition sm:h-9 sm:w-auto sm:px-3 sm:py-1.5 ${
              showDetails
                ? 'border-brand-brown-900 bg-brand-brown-900 text-white'
                : 'border-brand-sand-dark bg-white text-brand-brown-800 hover:bg-brand-sand hover:text-brand-brown-950'
            }`}
          >
            <Info size={14} />
            <span className="hidden lg:inline ml-1.5 text-xs font-semibold">About</span>
          </button>

          {/* Fullscreen Toggle */}
          {tool.launchUrl && (
            <button
              type="button"
              onClick={handleToggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-sand-dark bg-white text-brand-brown-800 shadow-xs transition hover:bg-brand-sand hover:text-brand-brown-950"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          )}
        </div>
      </header>

      {/* ── Main Canvas Viewport ─────────────────────────────────────────── */}
      <main
        className={`relative flex flex-1 flex-col overflow-hidden ${
          isFullscreen ? 'p-0 h-screen' : 'p-2 sm:p-3 lg:p-4 h-[calc(100vh-4rem)]'
        }`}
      >
        {tool.launchUrl ? (
          <div
            className={`relative flex h-full w-full flex-1 flex-col overflow-hidden bg-white shadow-xs transition-all ${
              isFullscreen
                ? 'rounded-none border-0'
                : 'rounded-2xl border border-brand-sand-dark/80 ring-1 ring-black/5'
            }`}
          >
            {/* Iframe Loading Overlay */}
            {isIframeLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-cream/80 backdrop-blur-xs transition-opacity duration-300">
                <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-brand-sand-dark bg-white/95 px-6 py-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-desert-light/40 text-brand-brown-900">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-desert-dark" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-brand-brown-950">Preparing workspace</p>
                    <p className="mt-0.5 text-[11px] text-brand-brown-600">Launching {tool.title}…</p>
                  </div>
                </div>
              </div>
            )}

            {/* The Tool Embed Frame */}
            <iframe
              key={reloadKey}
              src={tool.launchUrl}
              title={tool.title}
              onLoad={() => setIsIframeLoading(false)}
              className="h-full w-full flex-1 border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation"
              allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone; geolocation"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          /* Empty / Unready State */
          <div className="flex h-full w-full flex-1 items-center justify-center rounded-2xl border border-dashed border-brand-sand-dark bg-white p-8 text-center shadow-xs">
            <div className="max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-sand text-brand-brown-700 shadow-xs">
                <Wrench size={24} />
              </div>
              <h2 className="mt-4 text-base font-bold text-brand-brown-950">
                Tool in development
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-brand-brown-600">
                This tool has not been deployed with an active launch endpoint yet. Check back soon or explore other tools shared by the community.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-brown-900"
                >
                  <ArrowLeft size={14} />
                  Explore other tools
                </Link>
                {primaryCommunity && (
                  <Link
                    href={`/community/${primaryCommunity.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-sand-dark bg-white px-4 py-2 text-xs font-semibold text-brand-brown-800 shadow-xs hover:bg-brand-sand"
                  >
                    <Users size={14} />
                    Visit {primaryCommunity.name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Collapsible Info Slide-Over Drawer ─────────────────────────── */}
        {showDetails && (
          <>
            {/* Backdrop for mobile */}
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity lg:hidden"
              onClick={() => setShowDetails(false)}
              aria-hidden="true"
            />

            <aside
              aria-label="Tool information"
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-brand-sand-dark bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:max-w-md"
            >
              {/* Drawer Header */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-brand-sand-dark/80 px-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-desert-dark" />
                  <h2 className="text-sm font-bold text-brand-brown-950">About this tool</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  aria-label="Close details"
                  className="rounded-lg p-1.5 text-brand-brown-600 hover:bg-brand-sand hover:text-brand-brown-950"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 space-y-6 overflow-y-auto p-5 text-xs text-brand-brown-800">
                {/* Hero card in drawer */}
                <div className="rounded-2xl border border-brand-sand-dark/80 bg-brand-cream/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-sand-dark/60 bg-white shadow-xs">
                      {tool.thumbnailUrl ? (
                        <Image
                          src={tool.thumbnailUrl}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Wrench size={20} className="text-brand-brown-900" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-brand-brown-950">{tool.title}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-brown-800 shadow-2xs">
                          {categoryLabel}
                        </span>
                        <span className="text-[10px] text-brand-brown-500">{typeLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-[10px] text-brand-brown-500">
                    Description
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-brand-brown-800 whitespace-pre-wrap">
                    {tool.description || 'No detailed description provided for this tool.'}
                  </p>
                </div>

                {/* Communities Section */}
                {tool.communities && tool.communities.length > 0 && (
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-[10px] text-brand-brown-500">
                      Connected Communities
                    </h3>
                    <div className="mt-2.5 space-y-2">
                      {tool.communities.map((community) => (
                        <Link
                          key={community.id}
                          href={`/community/${community.slug}`}
                          className="group flex items-center justify-between rounded-xl border border-brand-sand-dark/70 bg-white p-2.5 transition hover:border-brand-brown-700/50 hover:bg-brand-sand/40"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-desert-light/50 text-brand-brown-900">
                              <Users size={14} />
                            </div>
                            <span className="font-semibold text-brand-brown-950 group-hover:underline">
                              {community.name}
                            </span>
                          </div>
                          <ChevronRight size={14} className="text-brand-brown-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Details */}
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-[10px] text-brand-brown-500">
                    Tool Details
                  </h3>
                  <dl className="mt-2.5 divide-y divide-brand-sand-dark/60 rounded-xl border border-brand-sand-dark/80 bg-white text-xs">
                    <div className="flex justify-between px-3.5 py-2.5">
                      <dt className="text-brand-brown-500">Slug</dt>
                      <dd className="font-mono text-[11px] font-semibold text-brand-brown-900">{tool.slug}</dd>
                    </div>
                    <div className="flex justify-between px-3.5 py-2.5">
                      <dt className="text-brand-brown-500">Architecture</dt>
                      <dd className="font-medium text-brand-brown-900">{typeLabel}</dd>
                    </div>
                    <div className="flex justify-between px-3.5 py-2.5">
                      <dt className="text-brand-brown-500">Published</dt>
                      <dd className="font-medium text-brand-brown-900">
                        {tool.createdAt ? new Date(tool.createdAt).toLocaleDateString() : '—'}
                      </dd>
                    </div>
                    {tool.launchUrl && (
                      <div className="flex justify-between px-3.5 py-2.5">
                        <dt className="text-brand-brown-500">Launch URL</dt>
                        <dd className="truncate max-w-[180px] font-mono text-[11px] text-brand-brown-700">
                          {tool.launchUrl}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Quick Hint */}
                <div className="rounded-xl border border-brand-desert-light/70 bg-brand-desert-light/20 p-3.5 text-[11px] leading-relaxed text-brand-brown-800">
                  <p className="font-semibold text-brand-brown-950">Tip for full immersion</p>
                  <p className="mt-0.5">
                    Click the fullscreen icon in the top bar to expand the workspace and hide all browser distraction.
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-brand-sand-dark/80 p-4">
                {tool.launchUrl && (
                  <a
                    href={tool.launchUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-brown-950 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-brown-900"
                  >
                    <span>Launch in separate tab</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
