"use client";

import { Hash, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface ProposalStepTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const suggestions = [
  "beginner",
  "urban",
  "indoor",
  "outdoor",
  "vegetables",
  "flowers",
  "balcony",
  "2026",
];

export function ProposalStepTags({
  tags,
  onTagsChange,
}: ProposalStepTagsProps) {
  const [input, setInput] = useState("");

  function addTag(value: string) {
    const normalized = value
      .trim()
      .replace(/^#/, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    if (!normalized || tags.includes(normalized)) {
      return;
    }

    onTagsChange([...tags, normalized]);
    setInput("");
  }

  function removeTag(tag: string) {
    onTagsChange(tags.filter((item) => item !== tag));
  }

  return (
    <div className="space-y-7">

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
          Step 3
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-brown-950">
          Define useful contexts
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-brand-brown-600">
          Hashtags give citizens ways to organize conversations without
          creating sub-communities or channels.
        </p>
      </div>

      {/* Tag input */}
      <div>
        <label className="text-sm font-semibold text-brand-brown-900">
          Initial hashtags
        </label>

        <p className="mt-1 text-[11px] text-muted-foreground">
          Add contexts that will naturally help citizens find related
          discussions.
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
                  className="rounded-full hover:bg-brand-desert"
                  aria-label={`Remove ${tag}`}
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
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag(input);
                }
              }}
              placeholder="Type a hashtag and press Enter..."
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
      </div>

      {/* AI suggestions */}
      <div className="rounded-2xl border bg-brand-cream p-4">

        <div className="flex items-center gap-2">
          <Sparkles
            size={16}
            className="text-brand-desert-dark"
          />

          <div>
            <h2 className="text-xs font-bold text-brand-brown-950">
              Suggested contexts
            </h2>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              These suggestions are based on your community description.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((tag) => {
            const selected = tags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                disabled={selected}
                onClick={() => addTag(tag)}
                className={`
                  rounded-full border
                  px-3 py-1.5
                  text-xs font-medium
                  transition-colors
                  ${selected
                    ? "border-brand-desert-light bg-brand-desert-light text-brand-brown-600"
                    : "bg-white text-brand-brown-700 hover:border-brand-desert hover:bg-brand-desert-light"
                  }
                `}
              >
                #{tag}
              </button>
            );
          })}
        </div>

      </div>

      <div className="rounded-xl bg-brand-sand p-4">
        <p className="text-xs leading-5 text-brand-brown-700">
          <strong>Remember:</strong> hashtags describe contexts within a
          community. They should not be used to recreate nested
          communities.
        </p>
      </div>

    </div>
  );
}