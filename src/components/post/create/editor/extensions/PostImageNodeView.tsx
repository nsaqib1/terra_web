"use client";

import {
  createContext,
  useContext,
  useRef,
} from "react";
import {
  ImagePlus,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

export interface PostImageAttributes {
  mediaId: string | null;
  alt: string;
  src: string;
  uploading: boolean;
  uploadError: string | null;
  uploadId: string;
}

interface PostImageUploadContextValue {
  onImageFileSelected: (
    file: File,
    updateAttributes?: (
      attributes: PostImageAttributes,
    ) => void,
    previousSrc?: string | null,
    previousMediaId?: string | null,
  ) => void;
  onImageDeleted: (
    src: string | null,
    mediaId: string | null,
  ) => void;
}

export const PostImageUploadContext =
  createContext<PostImageUploadContextValue | null>(
    null,
  );

export function PostImageNodeView({
  node,
  selected,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const uploadContext = useContext(
    PostImageUploadContext,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const src =
    typeof node.attrs.src === "string"
      ? node.attrs.src
      : null;
  const mediaId =
    typeof node.attrs.mediaId === "string"
      ? node.attrs.mediaId
      : null;
  const uploading = node.attrs.uploading === true;
  const uploadError =
    typeof node.attrs.uploadError === "string"
      ? node.attrs.uploadError
      : null;

  function handleDelete() {
    uploadContext?.onImageDeleted(src, mediaId);
    deleteNode();
  }

  return (
    <NodeViewWrapper className="my-4" data-post-image-node="">
      <div
        className={`
          group relative overflow-hidden rounded-xl
          border bg-brand-cream/30
          ${selected
            ? "border-brand-desert ring-2 ring-brand-desert/20"
            : "border-brand-sand"
          }
        `}
      >
        {src ? (
          // Local blob previews need a plain img element.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={
              typeof node.attrs.alt === "string"
                ? node.attrs.alt
                : ""
            }
            className="block max-h-130 w-full object-contain"
          />
        ) : (
          <div className="flex min-h-40 items-center justify-center">
            <ImagePlus
              size={28}
              className="text-brand-desert-dark"
            />
          </div>
        )}

        <div
          className="
            absolute right-3 top-3 flex gap-1.5
            rounded-lg bg-white/95 p-1 shadow
          "
        >
          <button
            type="button"
            aria-label="Change image"
            title="Change image"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="
              flex h-8 w-8 items-center justify-center
              rounded-md text-brand-brown-800
              hover:bg-brand-sand
            "
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            aria-label="Delete image"
            title="Delete image"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleDelete}
            className="
              flex h-8 w-8 items-center justify-center
              rounded-md text-red-600
              hover:bg-red-50
            "
          >
            <Trash2 size={15} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              uploadContext?.onImageFileSelected(
                file,
                updateAttributes,
                src,
                mediaId,
              );
            }

            event.target.value = "";
          }}
        />

        {uploading && (
          <div
            className="
              absolute inset-0 flex flex-col
              items-center justify-center gap-2
              bg-black/45 text-white
            "
            role="status"
            aria-live="polite"
          >
            <Loader2 size={28} className="animate-spin" />
            <span className="text-xs font-semibold">
              Uploading image...
            </span>
          </div>
        )}

        {uploadError && (
          <p
            className="
              absolute bottom-0 left-0 right-0
              bg-red-600/95 px-3 py-2
              text-xs text-white
            "
            role="alert"
          >
            {uploadError}
          </p>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const postImageNodeView =
  ReactNodeViewRenderer(PostImageNodeView);
