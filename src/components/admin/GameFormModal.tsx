"use client";

import {
  AlertCircle,
  Check,
  Gamepad2,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import {
  AdminGame,
  Community,
  GameCategory,
  GameType,
} from "@/lib/api/types";

interface GameFormModalProps {
  isOpen: boolean;
  game: AdminGame | null;
  communities: Community[];
  onClose: () => void;
  onSuccess: (game: AdminGame) => void;
}

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function GameFormModal({
  isOpen,
  game,
  communities,
  onClose,
  onSuccess,
}: GameFormModalProps) {
  const isEditing = Boolean(game);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState<GameCategory>("ENTERTAINMENT");
  const [type, setType] = useState<GameType>("SINGLE_PLAYER");
  const [scoreEnabled, setScoreEnabled] = useState(false);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(false);
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (game) {
      setTitle(game.title);
      setSlug(game.slug);
      setDescription(game.description || "");
      setThumbnailUrl(game.thumbnailUrl || "");
      setCategory(game.category);
      setType(game.type);
      setScoreEnabled(game.scoreEnabled);
      setLeaderboardEnabled(game.leaderboardEnabled);
      setSelectedCommunityIds(game.communities.map((community) => community.id));
      setIsSlugManuallyEdited(true);
    } else {
      setTitle("");
      setSlug("");
      setDescription("");
      setThumbnailUrl("");
      setCategory("ENTERTAINMENT");
      setType("SINGLE_PLAYER");
      setScoreEnabled(false);
      setLeaderboardEnabled(false);
      setSelectedCommunityIds([]);
      setIsSlugManuallyEdited(false);
    }

    setErrorMessage(null);
  }, [game, isOpen]);

  useEffect(() => {
    if (!scoreEnabled) {
      setLeaderboardEnabled(false);
    }
  }, [scoreEnabled]);

  if (!isOpen) return null;

  const toggleCommunity = (id: string) => {
    setSelectedCommunityIds((current) =>
      current.includes(id)
        ? current.filter((communityId) => communityId !== id)
        : [...current, id]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (title.trim().length < 2) {
      setErrorMessage("Game title must be at least 2 characters long.");
      return;
    }

    if (slug.trim().length < 2) {
      setErrorMessage("Slug must be at least 2 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (game) {
        const updated = await adminApi.updateGame(game.id, {
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          category,
          type,
          scoreEnabled,
          leaderboardEnabled,
        });

        const withCommunities = await adminApi.updateGameCommunities(
          game.id,
          selectedCommunityIds
        );

        onSuccess(withCommunities || updated);
      } else {
        const created = await adminApi.createGame({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          category,
          type,
          scoreEnabled,
          leaderboardEnabled,
          communityIds: selectedCommunityIds,
        });

        onSuccess(created);
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(
          error,
          `Failed to ${isEditing ? "update" : "create"} game.`
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-brown-950/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-sand-dark bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-brand-brown-950">
              {isEditing ? "Edit Game" : "Create New Game"}
            </h3>
            <p className="text-xs text-brand-brown-600">
              Manage game metadata and Community placement. Build uploads come later.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-brown-600/70 hover:bg-brand-sand hover:text-brand-brown-950"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-brown-900">
                Game Title *
              </label>
              <div className="relative">
                <Gamepad2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50" />
                <input
                  value={title}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTitle(value);
                    if (!isEditing && !isSlugManuallyEdited) {
                      setSlug(generateSlug(value));
                    }
                  }}
                  placeholder="e.g. Desert Runner"
                  required
                  className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-brown-900">
                URL Slug *
              </label>
              <input
                value={slug}
                onChange={(event) => {
                  setSlug(generateSlug(event.target.value));
                  setIsSlugManuallyEdited(true);
                }}
                placeholder="desert-runner"
                required
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-brown-900">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={5000}
              placeholder="What is this game about?"
              className="w-full resize-none rounded-xl border border-brand-sand-dark/80 bg-white p-3 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-brown-900">
              Thumbnail URL
            </label>
            <div className="relative">
              <ImageIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50" />
              <input
                value={thumbnailUrl}
                onChange={(event) => setThumbnailUrl(event.target.value)}
                placeholder="https://..."
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-brown-900">Category</label>
              <select value={category} onChange={(event) => setCategory(event.target.value as GameCategory)} className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 outline-none">
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="LEARNING">Learning</option>
                <option value="SIMULATION">Simulation</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-brown-900">Type</label>
              <select value={type} onChange={(event) => setType(event.target.value as GameType)} className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 outline-none">
                <option value="SINGLE_PLAYER">Single Player</option>
                <option value="MULTIPLAYER">Multiplayer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-sand-dark/70 bg-brand-cream/40 p-3">
              <input type="checkbox" checked={scoreEnabled} onChange={(event) => setScoreEnabled(event.target.checked)} className="h-4 w-4 accent-brand-brown-950" />
              <span>
                <span className="block text-xs font-semibold text-brand-brown-950">Enable scores</span>
                <span className="block text-[11px] text-brand-brown-600">Allow authenticated players to submit scores.</span>
              </span>
            </label>
            <label className={`flex items-center gap-3 rounded-xl border border-brand-sand-dark/70 bg-brand-cream/40 p-3 ${!scoreEnabled ? "opacity-50" : "cursor-pointer"}`}>
              <input type="checkbox" checked={leaderboardEnabled} disabled={!scoreEnabled} onChange={(event) => setLeaderboardEnabled(event.target.checked)} className="h-4 w-4 accent-brand-brown-950" />
              <span>
                <span className="block text-xs font-semibold text-brand-brown-950">Enable leaderboard</span>
                <span className="block text-[11px] text-brand-brown-600">Leaderboard APIs will come later.</span>
              </span>
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-brand-brown-900">Communities</label>
                <p className="text-[11px] text-brand-brown-600">A game can belong to multiple Communities.</p>
              </div>
              <span className="rounded-full bg-brand-sand px-2 py-0.5 text-[10px] font-bold text-brand-brown-800">
                {selectedCommunityIds.length} selected
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto rounded-xl border border-brand-sand-dark/70 bg-brand-cream/30 p-2">
              {communities.length === 0 ? (
                <p className="p-3 text-xs text-brand-brown-600">No active Communities available.</p>
              ) : (
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {communities.map((community) => {
                    const selected = selectedCommunityIds.includes(community.id);
                    return (
                      <button
                        key={community.id}
                        type="button"
                        onClick={() => toggleCommunity(community.id)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${selected ? "bg-brand-sand text-brand-brown-950" : "text-brand-brown-700 hover:bg-white"}`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{community.name}</span>
                          <span className="block truncate text-[10px] text-brand-brown-600">/{community.slug}</span>
                        </span>
                        {selected && <Check size={15} className="shrink-0 text-brand-desert-dark" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {isEditing && game && game.versions.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              This game has no build/version yet. That is okay—the game can remain in the catalog while the actual build is developed.
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 border-t border-brand-sand/60 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-10 rounded-xl border-brand-sand-dark text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 gap-2 rounded-xl bg-brand-brown-950 px-5 text-xs font-semibold text-white hover:bg-brand-brown-900">
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : isEditing ? "Save Changes" : "Create Game"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
