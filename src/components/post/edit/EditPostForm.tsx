"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/api/errors";
import { postsApi } from "@/lib/api/posts";
import { PostItem } from "@/lib/api/types";
import { PostEditor } from "@/components/post/create/editor/PostEditor";
import { TagPicker } from "@/components/post/create/TagPicker";
import type { PostDocument } from "@/components/post/create/editor/editor-types";

interface EditPostFormProps {
  post: PostItem;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();

  const [document, setDocument] = useState<PostDocument | null>(post.document);
  const [tagIds, setTagIds] = useState<string[]>(
    post.tags ? post.tags.map((t) => t.id) : []
  );

  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // A post has content when it contains at least one node
  const hasContent =
    document !== null &&
    document.content &&
    document.content.length > 0;

  const canSave = hasContent && !isPending;

  function toggleTag(tagId: string) {
    setTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId]
    );
  }

  async function handleSave() {
    if (!canSave || !document) return;

    setIsPending(true);
    setSubmitError(null);

    try {
      await postsApi.update(post.id, {
        document,
        tagIds,
      });

      setSubmitSuccess(true);

      setTimeout(() => {
        router.push(`/posts/${post.id}`);
      }, 1000);
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
      setIsPending(false);
    }
  }

  return (
    <div>
      {/* Back breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={`/posts/${post.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand-brown-950"
        >
          <ArrowLeft size={14} />
          Back to post
        </Link>

        <Link
          href="/posts/manage"
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-brand-brown-950"
        >
          Manage all posts
        </Link>
      </div>

      {/* Header */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand-desert-light/70 px-2 py-0.5 text-xs font-bold text-brand-brown-800">
            Editing Post
          </span>
          <span className="text-xs text-muted-foreground/60">•</span>
          <span className="text-xs text-muted-foreground">
            Posted in <strong>{post.community?.name}</strong>
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-brown-950 sm:text-3xl">
          Edit your post
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-brown-600">
          Make updates to your discussion or question. All edits will keep your existing comments,
          upvotes, and citizen interactions intact.
        </p>
      </div>

      {/* Main Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <div className="rounded-2xl border border-brand-sand-dark/70 bg-white p-5 sm:p-6 shadow-2xs">
            <div className="space-y-6">
              {/* Community Display (read-only) */}
              <div>
                <label className="text-sm font-semibold text-brand-brown-900">
                  Community
                </label>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-brand-sand-dark/60 bg-brand-sand/20 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-desert-light text-[10px] font-bold text-brand-brown-800">
                      {post.community?.name?.slice(0, 2).toUpperCase() || "CO"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-brown-950">
                        {post.community?.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Posts cannot change their parent community once published.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rich Editor */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-brown-900">
                  Post Content
                </label>
                <PostEditor
                  value={document}
                  onChange={setDocument}
                />
              </div>

              {/* Tag Picker */}
              <TagPicker
                communityId={post.community?.id || ""}
                selected={tagIds}
                onToggle={toggleTag}
              />

              {/* Footer Actions */}
              <div className="border-t border-brand-sand-dark/60 pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    {submitError ? (
                      <p className="text-xs font-semibold text-red-600">
                        {submitError}
                      </p>
                    ) : submitSuccess ? (
                      <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={15} />
                        Changes saved successfully! Redirecting…
                      </p>
                    ) : (
                      <p className="text-[11px] leading-5 text-muted-foreground">
                        Your changes will take effect immediately.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link href={`/posts/${post.id}`}>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        className="rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand/60"
                      >
                        Cancel
                      </Button>
                    </Link>

                    <Button
                      disabled={!canSave || isPending}
                      onClick={handleSave}
                      className="gap-2 rounded-xl bg-brand-brown-950 px-5 text-xs font-semibold text-white shadow-xs hover:bg-brand-brown-900 disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Saving Changes…
                        </>
                      ) : submitSuccess ? (
                        <>
                          <Check size={15} />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar Info & Guidelines */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-brand-sand-dark/60 bg-white p-5 shadow-2xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-brand-brown-950">
              <Sparkles size={16} className="text-brand-desert-dark" />
              Editing Tips
            </h3>

            <ul className="mt-3 space-y-2.5 text-xs text-brand-brown-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-desert-dark" />
                <span>Keep edits focused so existing comments and discussions remain relevant.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-desert-dark" />
                <span>You can add or update tags to better categorize the post for citizens.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-desert-dark" />
                <span>Formatting, bold text, code blocks, and media images are all preserved.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-sand-dark/60 bg-brand-sand/20 p-5">
            <div className="flex items-start gap-2.5">
              <Info size={16} className="text-brand-brown-700 mt-0.5 shrink-0" />
              <div className="text-xs text-brand-brown-700">
                <p className="font-semibold text-brand-brown-950">Post History</p>
                <p className="mt-1">
                  Originally posted {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
