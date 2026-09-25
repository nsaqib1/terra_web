"use client";

import { useEffect, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import { EditorToolbar } from "./EditorToolbar";
import { MediaUploader } from "./MediaUploader";
import { toPostDocument } from "./post-document-adapter";

import type { PostDocument } from "./editor-types";
import { postEditorExtensions } from "./editor-extentions";

interface PostEditorProps {
  value: PostDocument | null;
  onChange: (document: PostDocument) => void;
}

interface ImageInsertData {
  mediaId: string;
  alt?: string;
  previewUrl: string;
}

export function PostEditor({
  value,
  onChange,
}: PostEditorProps) {
  const [imageUploaderOpen, setImageUploaderOpen] =
    useState(false);

  // Keep temporary local object URLs outside PostDocument.
  // They allow newly uploaded images to remain visible before
  // the media is activated by post creation.
  const previewUrlsRef = useRef<Map<string, string>>(new Map());

  const editor = useEditor({
    extensions: postEditorExtensions,

    immediatelyRender: false,

    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    },

    editorProps: {
      attributes: {
        class:
          "post-editor-content px-4 py-4 outline-none text-[15px] leading-7 text-brand-brown-950",
      },
    },

    onUpdate: ({ editor }) => {
      onChange(
        toPostDocument(editor.getJSON()),
      );
    },
  });

  useEffect(() => {
    if (!editor || !value) {
      return;
    }

    const nextContent = convertPostDocumentToTiptap(
      value,
      previewUrlsRef.current,
    );

    const currentContent = editor.getJSON();

    if (
      JSON.stringify(currentContent) ===
      JSON.stringify(nextContent)
    ) {
      return;
    }

    editor.commands.setContent(nextContent, {
      emitUpdate: false,
    });
  }, [editor, value]);

  // Clean up blob URLs when the editor is destroyed.
  useEffect(() => {
    return () => {
      for (const url of previewUrlsRef.current.values()) {
        URL.revokeObjectURL(url);
      }

      previewUrlsRef.current.clear();
    };
  }, []);

  if (!editor) {
    return (
      <div className="rounded-xl border bg-white">
        <div className="h-[350px] animate-pulse bg-brand-cream/40" />
      </div>
    );
  }

  const activeEditor = editor;

  function handleImageClick() {
    setImageUploaderOpen(true);
  }

  function handleImageInsert({
    mediaId,
    alt,
    previewUrl,
  }: ImageInsertData) {
    // Keep the temporary blob URL outside PostDocument.
    // This allows the preview to survive controlled editor updates.
    previewUrlsRef.current.set(mediaId, previewUrl);

    activeEditor
      .chain()
      .focus()
      .setPostImage({
        mediaId,
        alt,
        src: previewUrl,
      })
      .run();

    setImageUploaderOpen(false);
  }

  return (
    <>
      <div>
        <div className="rounded-xl border bg-white">
          <EditorToolbar
            editor={activeEditor}
            onImageClick={handleImageClick}
          />

          <EditorContent editor={activeEditor} />
        </div>

        <p className="mt-1.5 text-right text-[10px] text-muted-foreground">
          {activeEditor.getText().trim()
            ? `${activeEditor.getText().length} characters`
            : "Write something to publish"}
        </p>
      </div>

      {imageUploaderOpen && (
        <MediaUploader
          onInsert={handleImageInsert}
          onClose={() =>
            setImageUploaderOpen(false)
          }
        />
      )}
    </>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

const API_BASE = API_URL.replace(/\/+$/, "");

function convertPostDocumentToTiptap(
  document: PostDocument,
  previewUrls: Map<string, string>,
) {
  return {
    type: "doc",
    content: document.content.map((node) => {
      switch (node.type) {
        case "paragraph":
          return {
            type: "paragraph",
            content: convertTextNodes(node.content),
          };

        case "heading":
          return {
            type: "heading",
            attrs: {
              level: node.level,
            },
            content: convertTextNodes(node.content),
          };

        case "bulletList":
          return {
            type: "bulletList",
            content: node.content.map((item) => ({
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: convertTextNodes(item.content),
                },
              ],
            })),
          };

        case "orderedList":
          return {
            type: "orderedList",
            content: node.content.map((item) => ({
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: convertTextNodes(item.content),
                },
              ],
            })),
          };

        case "blockquote":
          return {
            type: "blockquote",
            content: [
              {
                type: "paragraph",
                content: convertTextNodes(node.content),
              },
            ],
          };

        case "codeBlock":
          return {
            type: "codeBlock",
            attrs: {
              language: node.language ?? null,
            },
            content: convertTextNodes(node.content),
          };

        case "image":
          return {
            type: "postImage",
            attrs: {
              mediaId: node.mediaId,
              alt: node.altText ?? null,

              // Use the local blob URL while the media is temporary.
              // Once there is no local preview, use the permanent API URL.
              src: node.mediaId
                ? previewUrls.get(node.mediaId) ??
                `${API_BASE}/media/${node.mediaId}`
                : null,
            },
          };

        default:
          return {
            type: "paragraph",
          };
      }
    }),
  };
}

function convertTextNodes(
  nodes: {
    type: "text";
    text: string;
    marks?: any[];
  }[],
) {
  return nodes.map((node) => ({
    type: "text",
    text: node.text,
    ...(node.marks?.length
      ? {
        marks: node.marks.map((mark) => ({
          type: mark.type,
          ...(mark.type === "link"
            ? {
              attrs: {
                href: mark.href,
              },
            }
            : {}),
        })),
      }
      : {}),
  }));
}