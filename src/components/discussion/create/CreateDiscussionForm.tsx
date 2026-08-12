"use client";

import {
  ArrowLeft,
  ArrowRight,
  Hash,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { CommunitySelector } from "./CommunitySelector";
import { DiscussionEditor } from "./DiscussionEditor";
import { DiscussionGuidelines } from "./DiscussionGuidelines";

export function CreateDiscussionForm() {
  const [community, setCommunity] = useState("artificial-intelligence");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([
    "agents",
    "llm",
  ]);

  function addTag(value: string) {
    const normalized = value
      .trim()
      .replace(/^#/, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    if (!normalized || tags.includes(normalized)) {
      return;
    }

    setTags((current) => [...current, normalized]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  const canPublish =
    community &&
    title.trim().length >= 10 &&
    content.trim().length >= 30 &&
    tags.length > 0;

  return (
    <div>

      {/* Top navigation */}
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

      {/* Page heading */}
      <div className="mt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
          New contribution
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-brand-brown-950 sm:text-3xl">
          Start a discussion
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-brown-600">
          Ask a question, share an idea, describe a problem, or start a
          conversation that could help your community.
        </p>
      </div>

      {/* Main layout */}
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

        {/* Form */}
        <main className="min-w-0">

          <div className="rounded-2xl border bg-white p-5 sm:p-7">

            <div className="space-y-7">

              {/* Community */}
              <CommunitySelector
                value={community}
                onChange={setCommunity}
              />

              {/* Title */}
              <div>
                <label
                  htmlFor="discussion-title"
                  className="text-sm font-semibold text-brand-brown-900"
                >
                  Title
                </label>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Make the subject clear enough that another citizen can
                  understand it at a glance.
                </p>

                <input
                  id="discussion-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={180}
                  className="
                    mt-3 h-13 w-full
                    rounded-xl border
                    bg-white
                    px-4
                    text-base font-medium
                    text-brand-brown-950
                    outline-none
                    placeholder:text-brand-brown-600/50
                    focus:border-brand-desert-dark
                    focus:ring-4
                    focus:ring-brand-desert-light/50
                  "
                />

                <p className="mt-1 text-right text-[10px] text-muted-foreground">
                  {title.length}/180
                </p>
              </div>

              {/* Content */}
              <DiscussionEditor
                value={content}
                onChange={setContent}
              />

              {/* Contexts */}
              <div>
                <label className="text-sm font-semibold text-brand-brown-900">
                  Contexts
                </label>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Add hashtags that help citizens understand and discover
                  this discussion.
                </p>

                <div className="mt-3 rounded-xl border bg-white p-3">

                  <div className="flex flex-wrap gap-2">

                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="
                          inline-flex items-center gap-1
                          rounded-full
                          bg-brand-desert-light
                          px-3 py-1.5
                          text-xs font-semibold
                          text-brand-brown-800
                        "
                      >
                        #{tag}

                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="
                            rounded-full
                            hover:bg-brand-desert
                          "
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}

                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t pt-3">

                    <Hash
                      size={16}
                      className="text-muted-foreground"
                    />

                    <input
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      placeholder="Add a context..."
                      className="
                        min-w-0 flex-1
                        bg-transparent
                        text-sm
                        outline-none
                        placeholder:text-brand-brown-600/50
                      "
                    />

                  </div>

                </div>

                <div className="mt-3 flex flex-wrap gap-2">

                  {[
                    "2026",
                    "localai",
                    "opensource",
                    "architecture",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={tags.includes(suggestion)}
                      onClick={() => addTag(suggestion)}
                      className="
                        rounded-full
                        border
                        bg-white
                        px-2.5 py-1
                        text-[10px] font-medium
                        text-brand-brown-700
                        hover:border-brand-desert
                        hover:bg-brand-sand
                        disabled:opacity-40
                      "
                    >
                      + #{suggestion}
                    </button>
                  ))}

                </div>
              </div>

              {/* Publish */}
              <div className="border-t pt-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-xs font-semibold text-brand-brown-900">
                      Ready to publish?
                    </p>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Your discussion will become visible to the citizens
                      of this community.
                    </p>
                  </div>

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
                    Publish Discussion
                    <ArrowRight size={15} />
                  </Button>

                </div>

              </div>

            </div>

          </div>

        </main>

        {/* Guidelines */}
        <DiscussionGuidelines />

      </div>

    </div>
  );
}