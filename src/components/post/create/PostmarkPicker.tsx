"use client";

import { Bookmark } from "lucide-react";

interface PostmarkPickerProps {
  options: string[];
  selected: string[];
  onToggle: (postmark: string) => void;
}

export function PostmarkPicker({
  options,
  selected,
  onToggle,
}: PostmarkPickerProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Bookmark
          size={14}
          className="text-brand-desert-dark"
        />
        <label className="text-sm font-semibold text-brand-brown-900">
          Postmarks
        </label>
        <span className="text-[10px] font-medium text-muted-foreground">
          Optional
        </span>
      </div>

      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
        Choose from this community&apos;s vocabulary so others can find
        your post. Postmarks are not free-form hashtags.
      </p>

      {selected.length > 0 && (
        <p className="mt-2 text-[10px] font-medium text-brand-brown-700">
          {selected.length} selected
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((postmark) => {
          const active = selected.includes(postmark);

          return (
            <button
              key={postmark}
              type="button"
              onClick={() => onToggle(postmark)}
              aria-pressed={active}
              className={`
                rounded-full
                border
                px-3 py-1.5
                text-xs font-semibold
                transition-colors
                ${active
                  ? "border-brand-desert bg-brand-desert-light text-brand-brown-900"
                  : "border-transparent bg-brand-sand/70 text-brand-brown-700 hover:border-brand-desert hover:bg-brand-sand"
                }
              `}
            >
              {postmark}
            </button>
          );
        })}
      </div>
    </div>
  );
}
