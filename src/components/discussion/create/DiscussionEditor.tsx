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

interface DiscussionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DiscussionEditor({
  value,
  onChange,
}: DiscussionEditorProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-brown-900">
        Your discussion
      </label>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Explain the question, idea, problem, or topic you want the
        community to discuss.
      </p>

      <div className="mt-3 overflow-hidden rounded-xl border bg-white">

        {/* Toolbar */}
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
          placeholder="Share your question, idea, experience, or problem..."
          rows={12}
          className="
            w-full resize-none
            bg-white
            p-4
            text-sm
            leading-7
            text-brand-brown-950
            outline-none
            placeholder:text-brand-brown-600/50
          "
        />

        <div className="border-t px-4 py-2">
          <p className="text-[10px] text-muted-foreground">
            Markdown-style formatting will be supported in the final
            editor.
          </p>
        </div>

      </div>

      <p className="mt-1 text-right text-[10px] text-muted-foreground">
        {value.length} characters
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