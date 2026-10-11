"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Info,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/api/errors";
import { postsApi } from "@/lib/api/posts";
import type { PostItem, Tag } from "@/lib/api/types";
import {
  PostEditor,
  type PostEditorHandle,
} from "@/components/post/create/editor/PostEditor";
import { PopularTags } from "@/components/post/create/PopularTags";
import type { PostDocument } from "@/components/post/create/editor/editor-types";

const MAX_TAGS = 5;

interface EditPostFormProps {
  post: PostItem;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();

  const [document, setDocument] = useState<PostDocument | null>(post.document);
  const [pendingImageUploads, setPendingImageUploads] = useState(0);
  const initialTagIds = post.tags?.map((tag) => tag.id) ?? [];
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds);
  const preservedTagIdsRef = useRef(initialTagIds);
  const postEditorRef = useRef<PostEditorHandle>(null);

  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const hasContent = documentHasContent(document);

  const canSave =
    hasContent &&
    !isPending &&
    pendingImageUploads === 0;

  function handleEditorTagIdsChange(documentTagIds: string[]) {
    setTagIds([...new Set([...preservedTagIdsRef.current, ...documentTagIds])]);
  }

  function handlePopularTagToggle(tag: Tag) {
    if (tagIds.includes(tag.id)) {
      preservedTagIdsRef.current = preservedTagIdsRef.current.filter(
        (id) => id !== tag.id
      );
      setTagIds((current) => current.filter((id) => id !== tag.id));
      postEditorRef.current?.removeHashtag(tag.id);
      return;
    }
    if (tagIds.length >= MAX_TAGS) return;
    postEditorRef.current?.insertHashtag(tag);
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0">
          <div className="-mx-4 rounded-none border-y bg-white p-5 sm:mx-0 sm:rounded-2xl sm:border sm:p-6">
            <div className="space-y-6">
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

              <div>
                <PostEditor
                  ref={postEditorRef}
                  value={document}
                  onChange={setDocument}
                  onImageUploadsChange={setPendingImageUploads}
                  communityId={post.community?.id || ""}
                  selectedTagIds={tagIds}
                  onTagIdsChange={handleEditorTagIdsChange}
                  enableHashtags
                />
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-brand-sand-dark/70 bg-brand-cream/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-desert-light/70 text-brand-brown-800">
                    <Send size={17} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-brand-brown-950">
                      {submitSuccess
                        ? "Changes saved"
                        : canSave
                          ? "Ready to save?"
                          : "Your post is taking shape"}
                    </p>
                    <p className="text-xs leading-relaxed text-brand-brown-600">
                      {pendingImageUploads > 0
                        ? "Finishing image uploads…"
                        : !hasContent
                          ? "Add some content before saving your changes."
                          : submitSuccess
                            ? "Returning to your updated post…"
                            : "Your changes will be shared with the selected community."}
                    </p>
                    {submitError && (
                      <p className="text-xs font-medium text-red-600">
                        {submitError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Link href={`/posts/${post.id}`}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      className="h-11 w-full rounded-xl border-brand-sand-dark px-5 font-semibold text-brand-brown-800 hover:bg-brand-sand/60 sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    disabled={!canSave || isPending}
                    onClick={handleSave}
                    className="h-11 w-full gap-2 rounded-xl bg-brand-brown-950 px-6 font-semibold text-white shadow-sm hover:bg-brand-brown-800 sm:w-auto"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving…
                      </>
                    ) : submitSuccess ? (
                      <>
                        <Check size={15} />
                        Saved
                      </>
                    ) : (
                      <>
                        Save changes
                        <ArrowRight size={15} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="space-y-4">
          <PopularTags
            communityId={post.community?.id || ""}
            selected={tagIds}
            onToggle={handlePopularTagToggle}
          />

          <div className="-mx-4 rounded-none border-y border-brand-sand-dark/60 bg-white p-5 shadow-2xs sm:mx-0 sm:rounded-2xl sm:border">
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

          <div className="-mx-4 rounded-none border-y border-brand-sand-dark/60 bg-brand-sand/20 p-5 sm:mx-0 sm:rounded-2xl sm:border">
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

function documentHasContent(document: PostDocument | null): boolean {
  if (!document) return false;

  function nodeHasContent(value: unknown): boolean {
    if (!value || typeof value !== "object") return false;
    const node = value as Record<string, unknown>;

    if (typeof node.text === "string" && node.text.trim().length > 0) {
      return true;
    }

    if (
      node.type === "image" &&
      typeof node.mediaId === "string" &&
      node.mediaId.length > 0
    ) {
      return true;
    }

    if (
      node.type === "youtube" &&
      typeof node.videoId === "string" &&
      node.videoId.length > 0
    ) {
      return true;
    }

    return Array.isArray(node.content) && node.content.some(nodeHasContent);
  }

  return document.content.some(nodeHasContent);
}
