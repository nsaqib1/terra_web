"use client";

import {
  Bookmark,
  CheckCircle2,
  MessageCircle,
  MoreHorizontal,
  Reply,
} from "lucide-react";

interface ContributionCardProps {
  author: string;
  time: string;
  content: string;
  helpful: number;
  replies: number;
  bestAnswer?: boolean;
  type?: "answer" | "resource" | "experience";
}

export function ContributionCard({
  author,
  time,
  content,
  helpful,
  replies,
  bestAnswer = false,
  type = "answer",
}: ContributionCardProps) {
  return (
    <article
      className={`
        rounded-2xl
        border
        bg-white
        p-5
        ${bestAnswer
          ? "border-brand-desert"
          : ""
        }
      `}
    >

      {/* Best answer */}
      {bestAnswer && (
        <div className="mb-4 flex items-center gap-2">

          <div
            className="
              flex items-center gap-1.5
              rounded-full
              bg-brand-desert-light
              px-2.5 py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-brand-brown-800
            "
          >
            <CheckCircle2 size={12} />
            Best Answer
          </div>

        </div>
      )}

      {/* Author */}
      <div className="flex items-center">

        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-full
            bg-brand-sand
            text-[10px]
            font-bold
            text-brand-brown-800
          "
        >
          {getInitials(author)}
        </div>

        <div className="ml-2.5">

          <div className="flex items-center gap-2">

            <span className="text-xs font-semibold text-brand-brown-900">
              {author}
            </span>

            <span
              className="
                rounded-full
                bg-brand-sand
                px-2 py-0.5
                text-[9px]
                font-semibold
                text-brand-brown-600
              "
            >
              {formatType(type)}
            </span>

          </div>

          <p className="text-[11px] text-muted-foreground">
            {time}
          </p>

        </div>

        <button
          className="
            ml-auto rounded-lg p-1.5
            text-muted-foreground
            hover:bg-brand-sand
          "
        >
          <MoreHorizontal size={17} />
        </button>

      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="whitespace-pre-line text-sm leading-7 text-brand-brown-700">
          {content}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-1 border-t pt-4">

        <button
          className="
            rounded-lg px-3 py-1.5
            text-xs font-semibold
            text-brand-brown-700
            hover:bg-brand-sand
            hover:text-brand-brown-950
          "
        >
          ↑ {helpful} Helpful
        </button>

        <button
          className="
            flex items-center gap-1.5
            rounded-lg px-3 py-1.5
            text-xs font-medium
            text-brand-brown-700
            hover:bg-brand-sand
          "
        >
          <Reply size={14} />
          Reply
        </button>

        <button
          className="
            flex items-center gap-1.5
            rounded-lg px-3 py-1.5
            text-xs font-medium
            text-brand-brown-700
            hover:bg-brand-sand
          "
        >
          <MessageCircle size={14} />
          {replies}
        </button>

        <button
          className="
            ml-auto rounded-lg p-2
            text-muted-foreground
            hover:bg-brand-sand
            hover:text-brand-brown-950
          "
          aria-label="Save contribution"
        >
          <Bookmark size={15} />
        </button>

      </div>

    </article>
  );
}

function formatType(type: ContributionCardProps["type"]) {
  switch (type) {
    case "resource":
      return "Resource";
    case "experience":
      return "Experience";
    default:
      return "Answer";
  }
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}