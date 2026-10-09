"use client";

import { useEffect, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
} from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { mediaApi } from "@/lib/api/media";

import { EditorToolbar } from "./EditorToolbar";
import { toPostDocument } from "./post-document-adapter";
import {
  PostImageUploadContext,
  type PostImageAttributes,
} from "./extensions/PostImageNodeView";

import type { PostDocument, PostTextMark } from "./editor-types";
import { postEditorExtensions } from "./editor-extentions";

interface PostEditorProps {
  value: PostDocument | null;
  onChange: (document: PostDocument) => void;
  onImageUploadsChange?: (count: number) => void;
}

export function PostEditor({
  value,
  onChange,
  onImageUploadsChange,
}: PostEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageSelectionError, setImageSelectionError] =
    useState<string | null>(null);

  // Keep temporary local object URLs outside PostDocument.
  // They allow newly uploaded images to remain visible before
  // the media is activated by post creation.
  const previewUrlsRef = useRef<Map<string, string>>(new Map());
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const uploadsInProgressRef = useRef<Set<string>>(new Set());
  const lastEmittedDocumentRef = useRef<PostDocument | null>(null);

  function clearImagePreview(
    src: string | null | undefined,
    mediaId: string | null | undefined,
  ) {
    if (mediaId) {
      previewUrlsRef.current.delete(mediaId);
    }

    if (src?.startsWith("blob:")) {
      objectUrlsRef.current.delete(src);
      URL.revokeObjectURL(src);
    }
  }

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
      const document = toPostDocument(editor.getJSON());
      lastEmittedDocumentRef.current = document;
      onChange(document);
    },
  });

  useEffect(() => {
    if (
      !editor ||
      !value ||
      value === lastEmittedDocumentRef.current
    ) {
      return;
    }

    let isCurrent = true;

    queueMicrotask(() => {
      if (
        !isCurrent ||
        editor.isDestroyed ||
        value === lastEmittedDocumentRef.current
      ) {
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
    });

    return () => {
      isCurrent = false;
    };
  }, [editor, value]);

  // Clean up blob URLs when the editor is destroyed.
  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    const previewUrls = previewUrlsRef.current;

    return () => {
      for (const url of objectUrls) {
        URL.revokeObjectURL(url);
      }

      previewUrls.clear();
      objectUrls.clear();
    };
  }, []);

  if (!editor) {
    return (
      <div className="-mx-5 rounded-none border-y bg-white sm:mx-0 sm:rounded-xl sm:border">
        <div className="h-[350px] animate-pulse bg-brand-cream/40" />
      </div>
    );
  }

  const activeEditor = editor;

  function handleImageClick() {
    imageInputRef.current?.click();
  }

  async function handleImageFile(
    file: File,
    updateAttributes?: (
      attributes: PostImageAttributes,
    ) => void,
    previousSrc?: string | null,
    previousMediaId?: string | null,
  ) {
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setImageSelectionError(
        "Please choose a JPEG, PNG, or WebP image.",
      );
      return;
    }

    setImageSelectionError(null);
    const uploadId = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(previewUrl);
    const pendingImage: PostImageAttributes = {
      mediaId: null,
      alt: file.name,
      src: previewUrl,
      uploading: true,
      uploadError: null,
      uploadId,
    };

    if (updateAttributes) {
      updateAttributes(pendingImage);
    } else {
      activeEditor
        .chain()
        .focus()
        .setPostImage(pendingImage)
        .run();
    }

    clearImagePreview(previousSrc, previousMediaId);
    uploadsInProgressRef.current.add(uploadId);
    onImageUploadsChange?.(
      uploadsInProgressRef.current.size,
    );

    try {
      const media = await mediaApi.upload(file);
      const updated = updatePostImageByUploadId(
        activeEditor,
        uploadId,
        {
          mediaId: media.id,
          uploading: false,
          uploadError: null,
        },
      );

      if (updated) {
        previewUrlsRef.current.set(media.id, previewUrl);
      } else {
        clearImagePreview(previewUrl, null);
      }
    } catch (error) {
      console.error(error);
      const updated = updatePostImageByUploadId(
        activeEditor,
        uploadId,
        {
          uploading: false,
          uploadError:
            "We couldn't upload this image. Choose another image to try again.",
        },
      );

      if (!updated) {
        clearImagePreview(previewUrl, null);
      }
    } finally {
      uploadsInProgressRef.current.delete(uploadId);
      onImageUploadsChange?.(
        uploadsInProgressRef.current.size,
      );
    }
  }

  return (
    <>
      <PostImageUploadContext.Provider
        value={{
          onImageFileSelected: handleImageFile,
          onImageDeleted: clearImagePreview,
        }}
      >
        <div>
          <div className="-mx-5 rounded-none border-y bg-white sm:mx-0 sm:rounded-xl sm:border">
            <EditorToolbar
              editor={activeEditor}
              onImageClick={handleImageClick}
            />

            <EditorContent editor={activeEditor} />

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void handleImageFile(file);
                }

                event.target.value = "";
              }}
            />
          </div>

          {imageSelectionError && (
            <p
              className="mt-2 text-xs text-red-600"
              role="alert"
            >
              {imageSelectionError}
            </p>
          )}

          <p className="mt-1.5 text-right text-[10px] text-muted-foreground">
            {activeEditor.getText().trim()
              ? `${activeEditor.getText().length} characters`
              : ""}
          </p>
        </div>
      </PostImageUploadContext.Provider>
    </>
  );
}

function updatePostImageByUploadId(
  editor: Editor,
  uploadId: string,
  attributes: Partial<PostImageAttributes>,
): boolean {
  if (editor.isDestroyed) {
    return false;
  }

  const { state, view } = editor;
  let imagePosition: number | null = null;

  state.doc.descendants((node, position) => {
    if (
      node.type.name === "postImage" &&
      node.attrs.uploadId === uploadId
    ) {
      imagePosition = position;
      return false;
    }

    return true;
  });

  if (imagePosition === null) {
    return false;
  }

  const node = state.doc.nodeAt(imagePosition);

  if (!node || node.type.name !== "postImage") {
    return false;
  }

  view.dispatch(
    state.tr.setNodeMarkup(
      imagePosition,
      undefined,
      {
        ...node.attrs,
        ...attributes,
      },
    ),
  );
  return true;
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

        case "youtube":
          return {
            type: "youtube",
            attrs: {
              src: `https://www.youtube.com/watch?v=${node.videoId}`,
              width: 640,
              height: 360,
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
    marks?: PostTextMark[];
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