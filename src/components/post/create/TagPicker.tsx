"use client";

import { Bookmark } from "lucide-react";

interface TagPickerProps {
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

export function TagPicker({
  options,
  selected,
  onToggle,
}: TagPickerProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Bookmark
          size={14}
          className="text-brand-desert-dark"
        />
        <label className="text-sm font-semibold text-brand-brown-900">
          Tags
        </label>
        <span className="text-[10px] font-medium text-muted-foreground">
          Optional
        </span>
      </div>

      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
        Choose from this community&apos;s vocabulary so others can find
        your post. Tags are not free-form hashtags.
      </p>

      {selected.length > 0 && (
        <p className="mt-2 text-[10px] font-medium text-brand-brown-700">
          {selected.length} selected
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((tag) => {
          const active = selected.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
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
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
