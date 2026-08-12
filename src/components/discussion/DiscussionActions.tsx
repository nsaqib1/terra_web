"use client";

import {
  Bookmark,
  MessageCircle,
  Share2,
} from "lucide-react";

interface DiscussionActionsProps {
  helpful: number;
  comments: number;
}

export function DiscussionActions({
  helpful,
  comments,
}: DiscussionActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-4">

      <button
        className="
          rounded-lg
          px-3 py-2
          text-xs font-semibold
          text-brand-brown-700
          transition-colors
          hover:bg-brand-sand
          hover:text-brand-brown-950
        "
      >
        ↑ {helpful} Helpful
      </button>

      <button
        className="
          flex items-center gap-1.5
          rounded-lg
          px-3 py-2
          text-xs font-semibold
          text-brand-brown-700
          hover:bg-brand-sand
          hover:text-brand-brown-950
        "
      >
        <MessageCircle size={15} />
        {comments} Comments
      </button>

      <div className="ml-auto flex items-center gap-1">

        <button
          className="
            flex items-center gap-1.5
            rounded-lg
            px-3 py-2
            text-xs font-medium
            text-muted-foreground
            hover:bg-brand-sand
            hover:text-brand-brown-950
          "
        >
          <Bookmark size={15} />
          Save
        </button>

        <button
          className="
            flex items-center gap-1.5
            rounded-lg
            px-3 py-2
            text-xs font-medium
            text-muted-foreground
            hover:bg-brand-sand
            hover:text-brand-brown-950
          "
        >
          <Share2 size={15} />
          Share
        </button>

      </div>

    </div>
  );
}