"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, FileText, Loader2, Tag, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resourcesApi } from "@/lib/api/resources";
import { extractErrorMessage } from "@/lib/api/errors";
import { ResourceItem, ResourceTag } from "@/lib/api/types";

interface ResourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: ResourceItem) => void;
  resource: ResourceItem | null;
  availableTags: ResourceTag[];
}

export function ResourceEditModal({
  isOpen,
  onClose,
  onSuccess,
  resource,
  availableTags,
}: ResourceEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title || "");
      setDescription(resource.description || "");
      setSelectedTagIds(resource.tags?.map((t) => t.tag.id) || []);
    } else {
      setTitle("");
      setDescription("");
      setSelectedTagIds([]);
    }
    setError(null);
  }, [resource, isOpen]);

  if (!isOpen || !resource) return null;

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Resource title is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await resourcesApi.adminUpdate(resource.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        tagIds: selectedTagIds,
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to update resource."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-brand-sand-dark bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-desert-light text-brand-brown-900">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-brown-950">Edit Resource</h3>
              <p className="text-xs text-brand-brown-600 truncate max-w-xs font-mono">
                {resource.originalFilename}
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
              Title *
            </label>
            <div className="relative">
              <Type
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50"
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resource title"
                maxLength={200}
                required
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
              Description (optional)
            </label>
            <div className="relative">
              <FileText
                size={15}
                className="absolute left-3 top-3 text-brand-brown-600/50"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this resource provides…"
                rows={4}
                maxLength={1000}
                className="w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 pt-2.5 pb-2.5 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none resize-none"
              />
            </div>
          </div>

          {/* Tag selector */}
          <div>
            <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
              Resource Tags
            </label>
            {availableTags.length === 0 ? (
              <p className="text-xs italic text-brand-brown-500">
                No tags created for this community yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        isSelected
                          ? "bg-brand-brown-950 text-white"
                          : "bg-brand-sand text-brand-brown-700 hover:bg-brand-sand-dark/60"
                      }`}
                    >
                      <Tag size={12} />
                      <span>#{tag.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Actions */}
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
                  <span>Saving…</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
