"use client";

import { ArrowLeft, Archive, CheckCircle2, Edit2, Gamepad2, Plus, RefreshCw, UploadCloud, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import { AdminGame, CreateGameVersionInput, GameVersion, UpdateGameVersionInput } from "@/lib/api/types";

function statusClass(status: GameVersion["status"]) {
  if (status === "PUBLISHED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "ARCHIVED") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-brand-sand text-brand-brown-800 border-brand-sand-dark";
}

export default function AdminGameVersionsPage() {
  const params = useParams<{ id: string }>();
  const gameId = params.id;
  const [game, setGame] = useState<AdminGame | null>(null);
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<GameVersion | null>(null);
  const [form, setForm] = useState<CreateGameVersionInput>({ version: "", buildPath: "", releaseNotes: "" });
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setErrorMessage(null);
    try {
      const [gameResponse, versionResponse] = await Promise.all([
        adminApi.getGame(gameId),
        adminApi.getGameVersions(gameId),
      ]);
      setGame(gameResponse); setVersions(versionResponse);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Failed to load game versions."));
    } finally { setIsLoading(false); }
  }, [gameId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ version: "", buildPath: "", releaseNotes: "" });
    setIsFormOpen(true);
  };

  const openEdit = (version: GameVersion) => {
    setEditing(version);
    setForm({ version: version.version, buildPath: version.buildPath ?? "", releaseNotes: version.releaseNotes ?? "" });
    setIsFormOpen(true);
  };

  const save = async () => {
    setErrorMessage(null);
    try {
      if (!form.version.trim()) throw new Error("Version is required.");
      if (editing) {
        const payload: UpdateGameVersionInput = { version: form.version, buildPath: form.buildPath, releaseNotes: form.releaseNotes };
        await adminApi.updateGameVersion(gameId, editing.id, payload);
      } else {
        await adminApi.createGameVersion(gameId, form);
      }
      setIsFormOpen(false); await load();
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Failed to save game version."));
    }
  };

  const action = async (version: GameVersion, type: "publish" | "archive") => {
    if (type === "archive" && !window.confirm(`Archive version ${version.version}?`)) return;
    setActionId(version.id); setErrorMessage(null);
    try {
      if (type === "publish") await adminApi.publishGameVersion(gameId, version.id);
      else await adminApi.archiveGameVersion(gameId, version.id);
      await load();
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, "Version action failed."));
    } finally { setActionId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/games" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-brown-600 hover:text-brand-brown-950"><ArrowLeft size={14} /> Back to games</Link>
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-sand text-brand-brown-800"><Gamepad2 size={20} /></div><div><h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">{game?.title ?? "Game"}</h1><p className="mt-0.5 text-xs text-brand-brown-600">Manage playable versions and builds.</p></div></div>
        </div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="h-10 rounded-xl"><RefreshCw size={15} className={isLoading ? "animate-spin" : ""} /> Refresh</Button><Button onClick={openCreate} className="h-10 gap-2 rounded-xl bg-brand-brown-950 text-xs text-white hover:bg-brand-brown-900"><Plus size={16} /> New Version</Button></div>
      </div>

      {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">{errorMessage}</div>}

      <div className="rounded-2xl border border-brand-sand-dark/80 bg-white p-5 shadow-xs">
        <div className="mb-4 rounded-xl bg-brand-cream/70 p-4 text-xs text-brand-brown-700"><strong className="text-brand-brown-950">Release flow:</strong> create a draft → upload/set its build path → publish the version → publish the game. Publishing a new version automatically archives the previous published version and makes the new one current.</div>
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="border-b border-brand-sand-dark/70"><tr className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-600"><th className="px-3 py-3">Version</th><th className="px-3 py-3">Build</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Published</th><th className="px-3 py-3">Notes</th><th className="w-28 px-3 py-3" /></tr></thead><tbody className="divide-y divide-brand-sand/70">{isLoading ? <tr><td colSpan={6} className="px-3 py-14 text-center text-xs text-brand-brown-600">Loading versions...</td></tr> : versions.length === 0 ? <tr><td colSpan={6} className="px-3 py-14 text-center"><UploadCloud className="mx-auto mb-3 text-brand-brown-400" size={28} /><p className="text-sm font-semibold text-brand-brown-900">No versions yet</p><p className="mt-1 text-xs text-brand-brown-600">Create a draft version now; the build can be added later.</p></td></tr> : versions.map((version) => <tr key={version.id} className="hover:bg-brand-cream/30"><td className="px-3 py-4"><div className="flex items-center gap-2"><span className="font-bold text-sm text-brand-brown-950">{version.version}</span>{game?.currentVersionId === version.id && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">CURRENT</span>}</div></td><td className="px-3 py-4">{version.buildPath ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 size={13} /> Ready</span> : <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-brown-500"><UploadCloud size={13} /> No build</span>}</td><td className="px-3 py-4"><span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass(version.status)}`}>{version.status}</span></td><td className="px-3 py-4 text-[10px] text-brand-brown-600">{version.publishedAt ? new Date(version.publishedAt).toLocaleString() : "—"}</td><td className="max-w-xs px-3 py-4 text-xs text-brand-brown-700">{version.releaseNotes || "—"}</td><td className="px-3 py-4"><div className="flex justify-end gap-1"><button onClick={() => openEdit(version)} disabled={version.status !== "DRAFT"} className="rounded-lg p-2 text-brand-brown-600 hover:bg-brand-sand disabled:cursor-not-allowed disabled:opacity-30"><Edit2 size={14} /></button>{version.status === "DRAFT" && <button onClick={() => action(version, "publish")} disabled={actionId === version.id || !version.buildPath} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-30"><CheckCircle2 size={14} /></button>}{version.status !== "ARCHIVED" && game?.currentVersionId !== version.id && <button onClick={() => action(version, "archive")} disabled={actionId === version.id} className="rounded-lg p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"><Archive size={14} /></button>}</div></td></tr>)}</tbody></table></div>
      </div>

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><div className="w-full max-w-lg rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-2xl"><h2 className="text-lg font-extrabold text-brand-brown-950">{editing ? `Edit ${editing.version}` : "New Game Version"}</h2><p className="mt-1 text-xs text-brand-brown-600">A build is optional while the version is a draft.</p><div className="mt-5 space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold text-brand-brown-800">Version</span><input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.0.0" disabled={!!editing && editing.status !== "DRAFT"} className="h-10 w-full rounded-xl border border-brand-sand-dark px-3 text-sm outline-none focus:border-brand-desert-dark" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-brand-brown-800">Build path</span><input value={form.buildPath ?? ""} onChange={(e) => setForm({ ...form, buildPath: e.target.value })} placeholder="/app/storage/games/my-game/1.0.0" className="h-10 w-full rounded-xl border border-brand-sand-dark px-3 text-sm outline-none focus:border-brand-desert-dark" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-brand-brown-800">Release notes</span><textarea value={form.releaseNotes ?? ""} onChange={(e) => setForm({ ...form, releaseNotes: e.target.value })} rows={4} className="w-full rounded-xl border border-brand-sand-dark px-3 py-2 text-sm outline-none focus:border-brand-desert-dark" /></label></div><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button onClick={save} className="bg-brand-brown-950 text-white hover:bg-brand-brown-900">Save Version</Button></div></div></div>}
    </div>
  );
}
