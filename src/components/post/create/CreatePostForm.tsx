"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { CommunitySelector } from "./CommunitySelector";
// import { PostEditor } from "./PostEditor";
import { PostGuidelines } from "./PostGuidelines";
import { TagPicker } from "./TagPicker";
import { PostEditor } from "./editor/PostEditor";
import type { PostDocument } from "./editor/editor-types";

const communityTags: Record<string, string[]> = {
  "artificial-intelligence": [
    "Machine Learning",
    "Deep Learning",
    "LLM",
    "RAG",
    "Computer Vision",
    "AI Research",
    "Beginner",
    "2026",
  ],
  photography: [
    "Composition",
    "Equipment",
    "Street",
    "Landscape",
    "Portrait",
    "Beginner",
  ],
  programming: [
    "Web",
    "Systems",
    "Open Source",
    "Architecture",
    "Beginner",
    "2026",
  ],
  gardening: [
    "Vegetables",
    "Indoor Plants",
    "Hydroponics",
    "Composting",
    "Pest Control",
    "Beginner",
  ],
};

export function CreatePostForm() {
  const [community, setCommunity] = useState("artificial-intelligence");
  const [tags, setTags] = useState<string[]>([]);
  const [document, setDocument] = useState<PostDocument | null>(null);


  const options = communityTags[community] ?? [];
  const hasContent =
    document !== null &&
    document.content.length > 0;

  const canPublish =
    Boolean(community) && hasContent;



  function handleCommunityChange(slug: string) {
    setCommunity(slug);
    setTags([]);
  }

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href="/home"
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
                value={community}
                onChange={handleCommunityChange}
              />

              <PostEditor
                value={document}
                onChange={setDocument}
              />

              <TagPicker
                options={options}
                selected={tags}
                onToggle={toggleTag}
              />

              <div className="border-t pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    Citizens of this community will see your post as soon
                    as you publish.
                  </p>

                  <Button
                    disabled={!canPublish}
                    className="
                      gap-2
                      rounded-xl
                      bg-brand-brown-950
                      px-5
                      font-semibold
                      text-white
                      shadow-none
                      hover:bg-brand-brown-800
                    "
                  >
                    Publish
                    <ArrowRight size={15} />
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
