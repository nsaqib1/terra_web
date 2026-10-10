"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/api/errors";
import { postsApi } from "@/lib/api/posts";

import { CommunitySelector } from "./CommunitySelector";
import { PopularTags } from "./PopularTags";
import { PostEditor, type PostEditorHandle } from "./editor/PostEditor";
import type { Tag } from "@/lib/api/types";
import type { PostDocument } from "./editor/editor-types";

const MAX_TAGS = 5;

export function CreatePostForm() {
  const router = useRouter();

  const [communityId, setCommunityId] = useState<string>("");
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

              <div className="border-t pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    {pendingImageUploads > 0 && (
                      <p className="text-[11px] font-medium text-brand-brown-800">
                        Wait for the image upload to finish before publishing.
                      </p>
                    )}

                    {submitError && (
                      <p className="text-[11px] font-medium text-red-500">
                        {submitError}
                      </p>
                    )}
                  </div>

                  <Button
                    disabled={!canPublish}
                    onClick={handlePublish}
                    className="
                      gap-2
                      rounded-xl
                      bg-brand-brown-950
                      px-5
                      font-semibold
                      text-white
                      shadow-none
                      hover:bg-brand-brown-800
                      disabled:opacity-50
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
