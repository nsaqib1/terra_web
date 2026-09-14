"use client";

import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Underline,
} from "lucide-react";

import { type Editor, useEditorState } from "@tiptap/react";

import { LinkPopover } from "./LinkPopover";

interface EditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
}

export function EditorToolbar({
  editor,
  onImageClick,
}: EditorToolbarProps) {

  const {
    isBold,
    isItalic,
    isUnderline,
    isStrike,
    isCode,
    isBulletList,
    isOrderedList,
    isBlockquote,
    headingLevel,
    isLink,
  } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isStrike: editor.isActive("strike"),
      isCode: editor.isActive("code"),
      isBulletList:
        editor.isActive("bulletList"),
      isOrderedList:
        editor.isActive("orderedList"),
      isBlockquote:
        editor.isActive("blockquote"),
      headingLevel:
        editor.isActive("heading", {
          level: 1,
        })
          ? 1
          : editor.isActive("heading", {
            level: 2,
          })
            ? 2
            : editor.isActive("heading", {
              level: 3,
            })
              ? 3
              : null,
      isLink: editor.isActive("link"),
    }),
  });

  return (
    <div
      className="
        flex flex-wrap items-center gap-0.5
        border-b
        bg-brand-cream/60
        p-2
      "
    >
      <ToolbarButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() =>
          editor.chain().focus().undo().run()
        }
      >
        <Undo2 size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() =>
          editor.chain().focus().redo().run()
        }
      >
        <Redo2 size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Heading 1"
        active={headingLevel === 1}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 1,
            })
            .run()
        }
      >
        <Heading1 size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Heading 2"
        active={headingLevel === 2}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 2,
            })
            .run()
        }
      >
        <Heading2 size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Heading 3"
        active={headingLevel === 3}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 3,
            })
            .run()
        }
      >
        <Heading3 size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bold"
        active={isBold}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBold()
            .run()
        }
      >
        <Bold size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Italic"
        active={isItalic}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleItalic()
            .run()
        }
      >
        <Italic size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Underline"
        active={isUnderline}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleUnderline()
            .run()
        }
      >
        <Underline size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Strikethrough"
        active={isStrike}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleStrike()
            .run()
        }
      >
        <Strikethrough size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Inline code"
        active={isCode}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleCode()
            .run()
        }
      >
        <Code2 size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bullet list"
        active={isBulletList}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBulletList()
            .run()
        }
      >
        <List size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Numbered list"
        active={isOrderedList}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleOrderedList()
            .run()
        }
      >
        <ListOrdered size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Quote"
        active={isBlockquote}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBlockquote()
            .run()
        }
      >
        <Quote size={15} />
      </ToolbarButton>

      <Divider />

      <LinkPopover editor={editor} />

      <button
        type="button"
        aria-label="Add image"
        title="Add image"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={onImageClick}
        className="
    flex h-8 w-8 items-center
    justify-center rounded-lg
    text-muted-foreground
    hover:bg-brand-sand
    hover:text-brand-brown-950
  "
      >
        🖼
      </button>
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
      className={`
        flex h-8 w-8 items-center
        justify-center rounded-lg
        transition-colors

        ${active
          ? "bg-brand-sand text-brand-brown-950"
          : "text-muted-foreground hover:bg-brand-sand hover:text-brand-brown-950"
        }

        disabled:cursor-not-allowed
        disabled:opacity-30
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="mx-1 h-5 w-px bg-brand-sand-dark" />
  );
}