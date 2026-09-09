"use client";

import {
  Bold,
  Code2,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PostEditor({
  value,
  onChange,
}: PostEditorProps) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div
          className="
            flex flex-wrap items-center gap-0.5
            border-b
            bg-brand-cream/60
            p-2
          "
        >
          <ToolbarButton icon={<Bold size={15} />} label="Bold" />
          <ToolbarButton icon={<Italic size={15} />} label="Italic" />

          <Divider />

          <ToolbarButton
            icon={<List size={15} />}
            label="Bullet list"
          />

          <ToolbarButton
            icon={<ListOrdered size={15} />}
            label="Numbered list"
          />

          <ToolbarButton
            icon={<Quote size={15} />}
            label="Quote"
          />

          <Divider />

          <ToolbarButton
            icon={<Link2 size={15} />}
            label="Link"
          />

          <ToolbarButton
            icon={<Code2 size={15} />}
            label="Code"
          />

          <ToolbarButton
            icon={<Image size={15} />}
            label="Image"
          />
        </div>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="What's on your mind?"
          rows={11}
          className="
            w-full resize-none
            bg-white
            p-4
            text-[15px]
            leading-7
            text-brand-brown-950
            outline-none
            placeholder:text-brand-brown-600/45
          "
        />
      </div>

      <p className="mt-1.5 text-right text-[10px] text-muted-foreground">
        {value.trim().length === 0 ? "Write something to publish" : `${value.length} characters`}
      </p>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="
        flex h-8 w-8 items-center justify-center
        rounded-lg
        text-muted-foreground
        hover:bg-brand-sand
        hover:text-brand-brown-950
      "
    >
      {icon}
    </button>
  );
}

function Divider() {
  return (
    <div className="mx-1 h-5 w-px bg-brand-sand-dark" />
  );
}
