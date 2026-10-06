'use client';

import { ArrowLeft, Gamepad2, Loader2, LogIn, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { gamesApi } from '@/lib/api/games';
import type { GameSessionResponse } from '@/lib/api/types';
import { extractErrorMessage } from '@/lib/api/errors';

const GAME_BASE_URL = process.env.NEXT_PUBLIC_GAME_BASE_URL;
const GAME_SESSION_MESSAGE = 'TERRAMIDS_GAME_SESSION';
const GAME_READY_MESSAGE = 'TERRAMIDS_GAME_READY';

if (!GAME_BASE_URL) {
  throw new Error('NEXT_PUBLIC_GAME_BASE_URL is not configured');
}

const GAME_ORIGIN = new URL(GAME_BASE_URL).origin;

export default function GamePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [session, setSession] = useState<GameSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gameUrl = useMemo(
    () => `${GAME_BASE_URL!.replace(/\/+$/, '')}/${encodeURIComponent(slug)}/`,
    [slug],
  );

  useEffect(() => {
    if (isAuthLoading) return;

    let cancelled = false;

    async function createSession() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await gamesApi.startSession(slug);
        if (!cancelled) setSession(response);
      } catch (err) {
        if (!cancelled) {
          setError(extractErrorMessage(err, 'Unable to start this game.'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void createSession();

    return () => {
      cancelled = true;
    };
  }, [slug, isAuthLoading]);

  useEffect(() => {
    if (!session) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== GAME_ORIGIN) return;
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data as { type?: string; gameSlug?: string } | undefined;
      if (!data || data.type !== GAME_READY_MESSAGE) return;
      if (data.gameSlug !== session.game.slug) return;

      iframeRef.current?.contentWindow?.postMessage(
        {
          type: GAME_SESSION_MESSAGE,
          gameSlug: session.game.slug,
          token: session.token,
          context: {
            game: session.game,
            version: session.version,
            session: {
              id: session.sessionId,
              expiresAt: session.expiresAt,
            },
          },
        },
        GAME_ORIGIN,
      );
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [session]);

  const handleFullscreen = () => {
    iframeRef.current?.requestFullscreen?.();
  };

  if (isAuthLoading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="flex flex-col items-center gap-3 text-brand-brown-700">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm font-semibold">Preparing your game…</p>
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
        <div className="w-full max-w-md rounded-2xl border border-brand-sand-dark bg-white p-8 text-center shadow-sm">
          <Gamepad2 className="mx-auto h-10 w-10 text-brand-brown-700" />
          <h1 className="mt-4 text-xl font-extrabold text-brand-brown-950">Game unavailable</h1>
          <p className="mt-2 text-sm text-brand-brown-600">{error ?? 'This game could not be started.'}</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-brown-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Terramids
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-cream">
      <header className="border-b border-brand-sand-dark/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              aria-label="Back to Terramids"
              className="rounded-lg p-2 text-brand-brown-700 hover:bg-brand-sand"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-brand-brown-950">{session.game.title}</p>
              <p className="text-[11px] font-medium text-brand-brown-500">
                v{session.version.version}
                {!isAuthenticated && ' · Sign in to save your score'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-lg border border-brand-sand-dark px-3 py-2 text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={handleFullscreen}
              className="rounded-lg p-2 text-brand-brown-700 hover:bg-brand-sand"
              aria-label="Fullscreen game"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-5 lg:px-6 lg:py-5">
        <div className="overflow-hidden rounded-2xl border border-brand-sand-dark/80 bg-black shadow-sm">
          <iframe
            ref={iframeRef}
            src={gameUrl}
            title={session.game.title}
            className="block h-[calc(100vh-7rem)] min-h-[600px] w-full border-0"
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </main>
  );
}
