"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/api/errors";
import { postsApi } from "@/lib/api/posts";

import { CommunitySelector } from "./CommunitySelector";
import { PostGuidelines } from "./PostGuidelines";
import { TagPicker } from "./TagPicker";
import { PostEditor } from "./editor/PostEditor";
import type { PostDocument } from "./editor/editor-types";

export function CreatePostForm() {
  const router = useRouter();

  const [communityId, setCommunityId] = useState<string>("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [document, setDocument] = useState<PostDocument | null>(null);

  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // A post has content when it contains at least one non-empty node
  const hasContent =
    document !== null &&
    document.content.length > 0;

  const canPublish = Boolean(communityId) && hasContent && !isPending;

  function handleCommunityChange(id: string) {
    setCommunityId(id);
    // Clear tag selection whenever community changes
    setTagIds([]);
  }

  function toggleTag(tagId: string) {
    setTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
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
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="
            inline-flex items-center gap-1.5
            text-xs font-semibold
            text-muted-foreground
            hover:text-brand-brown-950
          "
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>

      <div className="mt-5">
        <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950 sm:text-3xl">
          Create a post
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-brown-600">
          Share a question, idea, or experience with one community.
          No title — just the post.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0">
          <div className="rounded-2xl border bg-white p-5 sm:p-6">
            <div className="space-y-6">
              <CommunitySelector
                value={communityId}
                onChange={handleCommunityChange}
              />

              <PostEditor
                value={document}
                onChange={setDocument}
              />

              <TagPicker
                communityId={communityId}
                selected={tagIds}
                onToggle={toggleTag}
              />

              <div className="border-t pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] leading-5 text-muted-foreground">
                      Citizens of this community will see your post as soon
                      as you publish.
                    </p>

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

        <PostGuidelines />
      </div>
    </div>
  );
}
