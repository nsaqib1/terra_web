"use client";

import { Archive, CheckCircle2, Edit2, Gamepad2, MoreHorizontal, Plus, RefreshCw, Search, Settings2, UploadCloud, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GameFormModal } from "@/components/admin/GameFormModal";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import { AdminGame, Community, GameCategory, GameStatus, GameType } from "@/lib/api/types";

function statusLabel(status: GameStatus) {
  return { DRAFT: "Draft", PUBLISHED: "Published", UNPUBLISHED: "Unpublished", ARCHIVED: "Archived" }[status];
}

function statusClass(status: GameStatus) {
  if (status === "PUBLISHED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "ARCHIVED") return "bg-slate-100 text-slate-700 border-slate-200";
  if (status === "UNPUBLISHED") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-brand-sand text-brand-brown-800 border-brand-sand-dark";
}

function formatCategory(category: GameCategory) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function formatType(type: GameType) {
  return type === "SINGLE_PLAYER" ? "Single Player" : "Multiplayer";
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<GameStatus | "ALL">("ALL");
  const [category, setCategory] = useState<GameCategory | "ALL">("ALL");
  const [type, setType] = useState<GameType | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<AdminGame | null>(null);
  const [actionGameId, setActionGameId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await adminApi.getGames({
        search: search.trim() || undefined,
        status: status === "ALL" ? undefined : status,
        category: category === "ALL" ? undefined : category,
        type: type === "ALL" ? undefined : type,
        page,
        limit: 15,
      });
      setGames(response.data || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Failed to load games."));
    } finally {
      setIsLoading(false);
    }
  }, [search, status, category, type, page]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  useEffect(() => {
    adminApi.getCommunities({ status: "ACTIVE", limit: 100 })
      .then((response) => setCommunities(response.data || []))
      .catch(() => setCommunities([]));
  }, []);

  const handleEdit = (game: AdminGame) => {
    setOpenMenuId(null);
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleAction = async (game: AdminGame, action: "publish" | "unpublish" | "delete") => {
    setOpenMenuId(null);
    if (action === "delete" && !window.confirm(`Archive "${game.title}"?`)) return;
    setActionGameId(game.id);
    try {
      if (action === "publish") await adminApi.publishGame(game.id);
      if (action === "unpublish") await adminApi.unpublishGame(game.id);
      if (action === "delete") await adminApi.deleteGame(game.id);
      await fetchGames();
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Game action failed."));
    } finally {
      setActionGameId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">Games</h1>
            <span className="rounded-full bg-brand-sand px-2.5 py-0.5 text-xs font-bold text-brand-brown-800">{total}</span>
          </div>
          <p className="mt-1 text-xs text-brand-brown-600">Create and manage games before their playable builds are uploaded.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchGames} disabled={isLoading} className="h-10 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand">
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} /> <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={() => { setEditingGame(null); setIsFormOpen(true); }} className="h-10 gap-2 rounded-xl bg-brand-brown-950 px-4 text-xs font-semibold text-white hover:bg-brand-brown-900">
            <Plus size={16} /> New Game
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search games..." className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value as GameStatus | "ALL"); setPage(1); }} className="h-10 rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 outline-none">
            <option value="ALL">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="UNPUBLISHED">Unpublished</option><option value="ARCHIVED">Archived</option>
          </select>
          <select value={category} onChange={(event) => { setCategory(event.target.value as GameCategory | "ALL"); setPage(1); }} className="h-10 rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 outline-none">
            <option value="ALL">All categories</option><option value="ENTERTAINMENT">Entertainment</option><option value="LEARNING">Learning</option><option value="SIMULATION">Simulation</option>
          </select>
          <select value={type} onChange={(event) => { setType(event.target.value as GameType | "ALL"); setPage(1); }} className="h-10 rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 outline-none">
            <option value="ALL">All types</option><option value="SINGLE_PLAYER">Single Player</option><option value="MULTIPLAYER">Multiplayer</option>
          </select>
        </div>
      </div>

      {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">{errorMessage}</div>}

      <div className="overflow-hidden rounded-2xl border border-brand-sand-dark/80 bg-white shadow-xs">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="border-b border-brand-sand-dark/70 bg-brand-cream/60"><tr className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-600"><th className="px-5 py-3">Game</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Build</th><th className="px-4 py-3">Communities</th><th className="w-12 px-3 py-3" /></tr></thead>
            <tbody className="divide-y divide-brand-sand/70">
              {isLoading ? <tr><td colSpan={7} className="px-5 py-14 text-center text-xs text-brand-brown-600">Loading games...</td></tr> : games.length === 0 ? <tr><td colSpan={7} className="px-5 py-14 text-center"><Gamepad2 className="mx-auto mb-3 text-brand-brown-400" size={28} /><p className="text-sm font-semibold text-brand-brown-900">No games found</p><p className="mt-1 text-xs text-brand-brown-600">Create the first game from the button above.</p></td></tr> : games.map((game) => (
                <tr key={game.id} className="hover:bg-brand-cream/30">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-sand text-brand-brown-800">{game.thumbnailUrl ? <img src={game.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <Gamepad2 size={18} />}</div><div className="min-w-0"><p className="truncate text-xs font-bold text-brand-brown-950">{game.title}</p><p className="truncate text-[10px] text-brand-brown-600">/{game.slug}</p></div></div></td>
                  <td className="px-4 py-4 text-xs text-brand-brown-800">{formatCategory(game.category)}</td>
                  <td className="px-4 py-4 text-xs text-brand-brown-800">{formatType(game.type)}</td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass(game.status)}`}>{statusLabel(game.status)}</span></td>
                  <td className="px-4 py-4">{game.currentVersionId ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 size={13} /> Ready</span> : <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-brown-500"><UploadCloud size={13} /> No build</span>}</td>
                  <td className="px-4 py-4 text-xs font-semibold text-brand-brown-800">{game.communities.length || "—"}</td>
                  <td className="relative px-3 py-4"><button type="button" onClick={() => setOpenMenuId(openMenuId === game.id ? null : game.id)} className="rounded-lg p-2 text-brand-brown-600 hover:bg-brand-sand hover:text-brand-brown-950"><MoreHorizontal size={16} /></button>{openMenuId === game.id && <div className="absolute right-3 top-12 z-20 w-40 rounded-xl border border-brand-sand-dark bg-white p-1.5 shadow-xl"><button onClick={() => handleEdit(game)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"><Edit2 size={14} /> Edit</button><Link href={`/admin/games/${game.id}`} onClick={() => setOpenMenuId(null)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"><Settings2 size={14} /> Versions</Link>{game.status !== "PUBLISHED" && game.status !== "ARCHIVED" && <button onClick={() => handleAction(game, "publish")} disabled={actionGameId === game.id} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"><CheckCircle2 size={14} /> Publish</button>}{game.status === "PUBLISHED" && <button onClick={() => handleAction(game, "unpublish")} disabled={actionGameId === game.id} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"><XCircle size={14} /> Unpublish</button>}{game.status !== "ARCHIVED" && <button onClick={() => handleAction(game, "delete")} disabled={actionGameId === game.id} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-700 hover:bg-red-50"><Archive size={14} /> Archive</button>}</div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-brand-sand/70 md:hidden">{games.map((game) => <div key={game.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-sand text-brand-brown-800"><Gamepad2 size={18} /></div><div className="min-w-0"><p className="truncate text-sm font-bold text-brand-brown-950">{game.title}</p><p className="truncate text-[10px] text-brand-brown-600">/{game.slug}</p></div></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass(game.status)}`}>{statusLabel(game.status)}</span></div><div className="mt-3 flex flex-wrap gap-2 text-[10px] text-brand-brown-600"><span>{formatCategory(game.category)}</span><span>•</span><span>{formatType(game.type)}</span><span>•</span><span>{game.communities.length} Communities</span></div><div className="mt-3 flex justify-end"><Button variant="outline" size="sm" onClick={() => handleEdit(game)} className="h-8 rounded-lg text-[10px]"><Edit2 size={13} /> Edit</Button></div></div>)}</div>
        {totalPages > 1 && <div className="flex items-center justify-between border-t border-brand-sand-dark/70 px-5 py-3"><span className="text-[10px] font-semibold text-brand-brown-600">Page {page} of {totalPages}</span><div className="flex gap-1.5"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="h-8 rounded-lg text-[10px]">Previous</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="h-8 rounded-lg text-[10px]">Next</Button></div></div>}
      </div>

      <GameFormModal isOpen={isFormOpen} game={editingGame} communities={communities} onClose={() => setIsFormOpen(false)} onSuccess={() => fetchGames()} />
    </div>
  );
}
