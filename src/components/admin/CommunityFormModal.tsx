"use client";

import {
  AlertCircle,
  Hash,
  Layers,
  Loader2,
  Shield,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/errors";
import {
  Community,
  CommunityMaturity,
  CommunityStatus,
  GovernanceMode,
} from "@/lib/api/types";

interface CommunityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (community: Community) => void;
  community?: Community | null;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CommunityFormModal({
  isOpen,
  onClose,
  onSuccess,
  community,
}: CommunityFormModalProps) {
  const isEditing = !!community;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CommunityStatus>("ACTIVE");
  const [maturity, setMaturity] = useState<CommunityMaturity>("NEW");
  const [governanceMode, setGovernanceMode] =
    useState<GovernanceMode>("PLATFORM_MANAGED");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (community) {
      setName(community.name);
      setSlug(community.slug);
      setIsSlugManuallyEdited(true);
      setDescription(community.description || "");
      setStatus(community.status);
      setMaturity(community.maturity);
      setGovernanceMode(community.governanceMode);
    } else {
      setName("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setDescription("");
      setStatus("ACTIVE");
      setMaturity("NEW");
      setGovernanceMode("PLATFORM_MANAGED");
    }
    setErrorMessage(null);
  }, [community, isOpen]);

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

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage("Community name must be at least 2 characters long.");
      return;
    }

    if (!slug.trim() || slug.trim().length < 2) {
      setErrorMessage("Slug must be at least 2 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditing && community) {
        const updated = await adminApi.updateCommunity(community.id, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          status,
          maturity,
          governanceMode,
        });
        onSuccess(updated);
      } else {
        const created = await adminApi.createCommunity({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          status,
          maturity,
          governanceMode,
        });
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(
          err,
          `Failed to ${isEditing ? "update" : "create"} community.`
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border border-brand-sand-dark bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-brand-sand/80 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-brand-brown-950">
              {isEditing ? "Edit Community" : "Create New Community"}
            </h3>
            <p className="text-xs text-brand-brown-600">
              {isEditing
                ? "Update configuration, maturity, and governance rules."
                : "Add a new managed or self-governed community space."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-brown-600/70 hover:bg-brand-sand hover:text-brand-brown-950 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name & Slug */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Community Name *
              </label>
              <div className="relative">
                <Type
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50"
                />
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Artificial Intelligence"
                  required
                  className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                URL Slug *
              </label>
              <div className="relative">
                <Hash
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-600/50"
                />
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="e.g. artificial-intelligence"
                  required
                  className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white pl-9 pr-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose and guidelines of this community..."
              rows={3}
              maxLength={2000}
              className="w-full rounded-xl border border-brand-sand-dark/80 bg-white p-3 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/40 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none resize-none"
            />
          </div>

          {/* Status & Maturity & Governance */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CommunityStatus)}
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-2.5 text-xs text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Maturity
              </label>
              <select
                value={maturity}
                onChange={(e) =>
                  setMaturity(e.target.value as CommunityMaturity)
                }
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-2.5 text-xs text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
              >
                <option value="NEW">New</option>
                <option value="GROWING">Growing</option>
                <option value="ESTABLISHED">Established</option>
                <option value="SELF_GOVERNED">Self-Governed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Governance
              </label>
              <select
                value={governanceMode}
                onChange={(e) =>
                  setGovernanceMode(e.target.value as GovernanceMode)
                }
                className="h-10 w-full rounded-xl border border-brand-sand-dark/80 bg-white px-2.5 text-xs text-brand-brown-950 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/50 outline-none"
              >
                <option value="PLATFORM_MANAGED">Platform Managed</option>
                <option value="SELF_GOVERNED">Self Governed</option>
              </select>
            </div>
          </div>

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
                  <span>{isEditing ? "Saving..." : "Creating..."}</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Community"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
