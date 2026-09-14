"use client";

import { Link2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { Editor } from "@tiptap/react";

interface LinkPopoverProps {
  editor: Editor;
}

export function LinkPopover({
  editor,
}: LinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const active = editor.isActive("link");

  useEffect(() => {
    if (active) {
      setUrl(
        editor.getAttributes("link").href ?? "",
      );
    }
  }, [active, editor]);

  function openPopover() {
    setUrl(
      editor.getAttributes("link").href ?? "",
    );

    setOpen(true);
  }

  function applyLink() {
    const value = url.trim();

    if (!value) {
      editor
        .chain()
        .focus()
        .unsetLink()
        .run();

      setOpen(false);
      return;
    }

    editor
      .chain()
      .focus()
      .setLink({
        href: value,
      })
      .run();

    setOpen(false);
  }

  function removeLink() {
    editor
      .chain()
      .focus()
      .unsetLink()
      .run();

    setUrl("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={
          active
            ? "Edit link"
            : "Add link"
        }
        title={
          active
            ? "Edit link"
            : "Add link"
        }
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={openPopover}
        className={`
    flex h-8 w-8 items-center
    justify-center rounded-lg
    transition-colors
    ${active
            ? "bg-brand-sand text-brand-brown-950"
            : "text-muted-foreground hover:bg-brand-sand hover:text-brand-brown-950"
          }
  `}
      >
        <Link2 size={15} />
      </button>

      {open && (
        <div
          className="
            absolute bottom-full left-0 z-50
            mb-2 w-72
            rounded-xl border
            bg-white
            p-3
            shadow-[0_12px_35px_rgba(72,64,48,0.15)]
          "
        >
          <p className="mb-2 text-xs font-semibold text-brand-brown-950">
            {active
              ? "Edit link"
              : "Add link"}
          </p>

          <input
            autoFocus
            value={url}
            onChange={(event) =>
              setUrl(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }

              if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="https://example.com"
            className="
              h-9 w-full rounded-lg
              border bg-white
              px-3
              text-xs
              outline-none
              focus:border-brand-desert
            "
          />

          <div className="mt-2 flex items-center justify-between">
            {active ? (
              <button
                type="button"
                onClick={removeLink}
                className="
                  inline-flex items-center
                  gap-1.5 rounded-lg
                  px-2.5 py-1.5
                  text-[11px] font-semibold
                  text-red-600
                  hover:bg-red-50
                "
              >
                <Trash2 size={13} />
                Remove
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  rounded-lg px-2.5 py-1.5
                  text-[11px] font-semibold
                  text-muted-foreground
                  hover:bg-brand-sand
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={applyLink}
                className="
                  rounded-lg
                  bg-brand-brown-950
                  px-3 py-1.5
                  text-[11px] font-semibold
                  text-white
                "
              >
                {active
                  ? "Save"
                  : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}