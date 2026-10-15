"use client";

import { ArrowRight, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/api/errors";
import { postsApi } from "@/lib/api/posts";
import { useCreatePostCommunity } from "@/context/CreatePostCommunityContext";

import { CommunitySelector } from "./CommunitySelector";
import { PopularTags } from "./PopularTags";
import { PostEditor, type PostEditorHandle } from "./editor/PostEditor";
import type { Tag } from "@/lib/api/types";
import type { PostDocument } from "./editor/editor-types";

const MAX_TAGS = 5;

export function CreatePostForm() {
  const router = useRouter();
  const { communityId, setCommunityId } = useCreatePostCommunity();

  const [tagIds, setTagIds] = useState<string[]>([]);
  const [document, setDocument] = useState<PostDocument | null>(null);
  const [pendingImageUploads, setPendingImageUploads] = useState(0);
  const postEditorRef = useRef<PostEditorHandle>(null);

  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Empty editor paragraphs should not count as a post. Text, images, or
  // embedded videos are meaningful content.
  const hasContent = documentHasContent(document);

  const canPublish =
    Boolean(communityId) &&
    hasContent &&
    !isPending &&
    pendingImageUploads === 0;

  function handleCommunityChange(id: string) {
    setCommunityId(id);
    // Clear tag selection whenever community changes
    setTagIds([]);
  }

  function handlePopularTagToggle(tag: Tag) {
    if (tagIds.includes(tag.id)) {
      postEditorRef.current?.removeHashtag(tag.id);
      return;
    }
    if (tagIds.length >= MAX_TAGS) return;
    postEditorRef.current?.insertHashtag(tag);
  }

  async function handlePublish() {
    if (!canPublish || !document) return;

    setIsPending(true);
    setSubmitError(null);

    try {
      await postsApi.create({
        communityId,
        document,
        tagIds,
      });

      router.push("/");
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
              <CommunitySelector
                value={communityId}
                onChange={handleCommunityChange}
                onClose={() => router.back()}
              />

              <PostEditor
                ref={postEditorRef}
                value={document}
                onChange={setDocument}
                onImageUploadsChange={setPendingImageUploads}
                communityId={communityId}
                selectedTagIds={tagIds}
                onTagIdsChange={setTagIds}
                enableHashtags
              />

              <div className="flex flex-col gap-4 rounded-2xl border border-brand-sand-dark/70 bg-brand-cream/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-desert-light/70 text-brand-brown-800">
                    <Send size={17} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-brand-brown-950">
                      {canPublish
                        ? "Ready to share?"
                        : "Your post is taking shape"}
                    </p>
                    <p className="text-xs leading-relaxed text-brand-brown-600">
                      {pendingImageUploads > 0
                        ? "Finishing image uploads…"
                        : !communityId
                          ? "Choose a community to share your post."
                          : !hasContent
                            ? "Add some content to get your post ready."
                            : "Your post will be shared with the selected community."}
                    </p>
                    {submitError && (
                      <p className="text-xs font-medium text-red-600">
                        {submitError}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  disabled={!canPublish}
                  onClick={handlePublish}
                  className="
                    h-11 w-full
                    gap-2
                    rounded-xl
                    bg-brand-brown-950
                    px-6
                    font-semibold
                    text-white
                    shadow-sm
                    hover:bg-brand-brown-800
                    sm:w-auto
                  "
                >
                  {isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      Publish
                      <ArrowRight size={15} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>

        <div className="min-w-0">
          <PopularTags
            communityId={communityId}
            selected={tagIds}
            onToggle={handlePopularTagToggle}
          />
        </div>
      </div>
    </div>
  );
}


function documentHasContent(
  document: PostDocument | null,
): boolean {
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
