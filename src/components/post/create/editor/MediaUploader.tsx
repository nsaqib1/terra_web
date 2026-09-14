"use client";

import {
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import { mediaApi } from "@/lib/api/media";

interface MediaUploaderProps {
  onInsert: (data: {
    mediaId: string;
    alt?: string;
    previewUrl: string;
  }) => void;
  onClose: () => void;
}

export function MediaUploader({
  onInsert,
  onClose,
}: MediaUploaderProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleFile(file?: File) {
    if (!file) {
      return;
    }

    setError(null);

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setError(
        "Please choose a JPEG, PNG, or WebP image.",
      );

      return;
    }

    setUploading(true);

    const previewUrl = URL.createObjectURL(file);

    try {
      const media = await mediaApi.upload(file);

      onInsert({
        mediaId: media.id,
        alt: file.name,
        previewUrl,
      });
    } catch (error) {
      console.error(error);

      URL.revokeObjectURL(previewUrl);

      setError(
        "We couldn't upload this image. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/30
        p-4
      "
      onMouseDown={onClose}
    >
      <div
        className="
          w-full max-w-md
          rounded-2xl
          border
          bg-white
          p-5
          shadow-2xl
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-brand-brown-950">
              Add an image
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, or WebP
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="
              flex h-8 w-8 items-center
              justify-center rounded-lg
              text-muted-foreground
              hover:bg-brand-sand
            "
          >
            <X size={16} />
          </button>
        </div>

        <button
          type="button"
          disabled={uploading}
          onClick={() =>
            inputRef.current?.click()
          }
          className="
            mt-5 flex w-full
            flex-col items-center
            justify-center
            rounded-xl
            border-2 border-dashed
            border-brand-sand-dark
            bg-brand-cream/40
            px-5 py-10
            transition-colors
            hover:border-brand-desert
            hover:bg-brand-cream
            disabled:opacity-50
          "
        >
          {uploading ? (
            <>
              <Loader2
                size={25}
                className="animate-spin text-brand-desert-dark"
              />

              <span className="mt-3 text-xs font-semibold text-brand-brown-800">
                Uploading image...
              </span>
            </>
          ) : (
            <>
              <ImagePlus
                size={28}
                className="text-brand-desert-dark"
              />

              <span className="mt-3 text-xs font-semibold text-brand-brown-800">
                Choose an image
              </span>

              <span className="mt-1 text-[10px] text-muted-foreground">
                Maximum file size is handled by the server
              </span>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            void handleFile(
              event.target.files?.[0],
            );

            event.target.value = "";
          }}
        />

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}