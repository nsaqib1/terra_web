"use client";

import {
  AlertCircle,
  FileText,
  Hash,
  Loader2,
  Tag,
  Type,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { tagsApi } from "@/lib/api/tags";
import { extractErrorMessage } from "@/lib/api/errors";
import {
  Community,
  CreateTagInput,
  Tag as TagType,
  TagStatus,
  UpdateTagInput,
} from "@/lib/api/types";

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tag: TagType) => void;
  /** Pre-selected community id. If provided, the community picker is hidden. */
  communityId?: string;
  tag?: TagType | null;
}

function generateSlug(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TagFormModal({
  isOpen,
  onClose,
  onSuccess,
  communityId: fixedCommunityId,
  tag,
}: TagFormModalProps) {
  const isEditing = !!tag;

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TagStatus>("ACTIVE");
  const [selectedCommunityId, setSelectedCommunityId] = useState(
    fixedCommunityId ?? ""
  );

  // Community picker state (only used when no fixedCommunityId)
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load communities for picker
  useEffect(() => {
    if (isOpen && !fixedCommunityId) {
      setLoadingCommunities(true);
      adminApi
        .getCommunities({ status: "ACTIVE", limit: 50 })
        .then((res) => setCommunities(res.data || []))
        .catch(() => setCommunities([]))
        .finally(() => setLoadingCommunities(false));
    }
  }, [isOpen, fixedCommunityId]);

  // Populate form when editing or reset on open
  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setSlug(tag.slug);
      setIsSlugManuallyEdited(true);
      setDescription(tag.description ?? "");
      setStatus(tag.status);
      setSelectedCommunityId(tag.communityId);
    } else {
      setName("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setDescription("");
      setStatus("ACTIVE");
      setSelectedCommunityId(fixedCommunityId ?? "");
    }
    setErrorMessage(null);
  }, [tag, isOpen, fixedCommunityId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEditing && !isSlugManuallyEdited) {
      setSlug(generateSlug(newName));
    }
    if (errorMessage) setErrorMessage(null);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(generateSlug(e.target.value));
    setIsSlugManuallyEdited(true);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const communityId = fixedCommunityId ?? selectedCommunityId;

    if (!communityId) {
      setErrorMessage("Please select a community.");
      return;
    }
    if (!name.trim() || name.trim().length < 1) {
      setErrorMessage("Tag name is required.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let result: TagType;
      if (isEditing && tag) {
        const payload: UpdateTagInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          status,
        };
        result = await tagsApi.update(tag.id, payload);
      } else {
        const payload: CreateTagInput = {
          communityId,
          name: name.trim(),
          description: description.trim() || undefined,
          slug: slug.trim(),
        };
        result = await tagsApi.create(payload);
      }
      onSuccess(result);
      onClose();
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, `Failed to ${isEditing ? "update" : "create"} tag.`)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-brand-sand-dark bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-desert-light text-brand-brown-900">
              <Tag size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-brown-950">
                {isEditing ? "Edit Tag" : "Create New Tag"}
              </h3>
              <p className="text-xs text-brand-brown-600">
                {isEditing
                  ? "Update name, description, or status."
                  : "Add a tag to a community to categorise content."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-brown-600/70 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Community picker — only shown when no fixed community */}
          {!fixedCommunityId && !isEditing && (
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Community *
              </label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                disabled={loadingCommunities}
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none disabled:opacity-60"
              >
                <option value="">
                  {loadingCommunities ? "Loading communities…" : "Select a community…"}
                </option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name & Slug */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Tag Name *
              </label>
              <div className="relative">
                <Type
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50"
                />
                <input
                  id="tag-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Urban Planning"
                  maxLength={100}
                  required
                  className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Slug {isEditing ? "(read-only)" : "*"}
              </label>
              <div className="relative">
                <Hash
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50"
                />
                <input
                  id="tag-slug"
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="e.g. urban-planning"
                  maxLength={100}
                  readOnly={isEditing}
                  required
                  className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none read-only:bg-brand-sand/30 read-only:text-brand-brown-600 read-only:cursor-default"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
              Description
            </label>
            <div className="relative">
              <FileText
                size={15}
                className="absolute left-3 top-3 text-brand-brown-600/50"
              />
              <textarea
                id="tag-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional short description for this tag…"
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 pt-2.5 pb-2.5 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none resize-none"
              />
            </div>
            <p className="mt-1 text-right text-[10px] text-brand-brown-600/60">
              {description.length}/500
            </p>
          </div>

          {/* Status — only in edit mode */}
          {isEditing && (
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TagStatus)}
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-3 text-xs text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-sand/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 gap-2 rounded-xl bg-brand-brown-950 px-5 text-xs font-semibold text-white hover:bg-brand-brown-900 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isEditing ? "Saving…" : "Creating…"}</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Tag"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
