"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import Youtube from "@tiptap/extension-youtube";

const YOUTUBE_VIDEO_ID_REGEX =
    /^[A-Za-z0-9_-]{11}$/;

export function extractYoutubeVideoId(
    value: string,
): string | null {
    try {
        const url = new URL(value);

        const hostname = url.hostname
            .toLowerCase()
            .replace(/^www\./, "");

        if (hostname === "youtube.com") {
            if (url.pathname === "/watch") {
                const id = url.searchParams.get("v");

                if (
                    id &&
                    YOUTUBE_VIDEO_ID_REGEX.test(id)
                ) {
                    return id;
                }
            }

            const shortsMatch =
                url.pathname.match(
                    /^\/shorts\/([^/?]+)/,
                );

            if (
                shortsMatch &&
                YOUTUBE_VIDEO_ID_REGEX.test(
                    shortsMatch[1],
                )
            ) {
                return shortsMatch[1];
            }

            const embedMatch =
                url.pathname.match(
                    /^\/embed\/([^/?]+)/,
                );

            if (
                embedMatch &&
                YOUTUBE_VIDEO_ID_REGEX.test(
                    embedMatch[1],
                )
            ) {
                return embedMatch[1];
            }
        }

        if (hostname === "youtu.be") {
            const id = url.pathname
                .slice(1)
                .split("/")[0];

            if (
                id &&
                YOUTUBE_VIDEO_ID_REGEX.test(id)
            ) {
                return id;
            }
        }

        return null;
    } catch {
        return null;
    }
}

function YoutubeNodeView({
    node,
    selected,
    updateAttributes,
    deleteNode,
}: NodeViewProps) {
    const currentSrc =
        typeof node.attrs.src === "string"
            ? node.attrs.src
            : "";

    const currentVideoId = useMemo(
        () =>
            extractYoutubeVideoId(
                currentSrc,
            ),
        [currentSrc],
    );

    const [editing, setEditing] =
        useState(false);

    const [url, setUrl] =
        useState(currentSrc);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (!editing) {
            setUrl(currentSrc);
            setError("");
        }
    }, [currentSrc, editing]);

    const videoId = editing
        ? extractYoutubeVideoId(
            url.trim(),
        )
        : currentVideoId;

    const thumbnailUrl = videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : null;

    function startEditing() {
        setUrl(currentSrc);
        setError("");
        setEditing(true);
    }

    function cancelEditing() {
        setUrl(currentSrc);
        setError("");
        setEditing(false);
    }

    function saveEditing() {
        const trimmed = url.trim();

        const nextVideoId =
            extractYoutubeVideoId(trimmed);

        if (!trimmed) {
            setError(
                "Paste a YouTube video URL.",
            );
            return;
        }

        if (!nextVideoId) {
            setError(
                "Please enter a valid YouTube video URL.",
            );
            return;
        }

        updateAttributes({
            src: trimmed,
            width: 640,
            height: 360,
        });

        setError("");
        setEditing(false);
    }

    return (
        <NodeViewWrapper
            className="my-4"
            data-youtube-node=""
        >
            <div
                className={`
					group relative
					overflow-hidden rounded-2xl
					border bg-brand-cream/30
					transition-all duration-150

					${selected
                        ? "border-brand-desert ring-2 ring-brand-desert/20"
                        : "border-brand-sand"
                    }
				`}
            >
                {editing ? (
                    <div className="bg-white p-4">
                        <div className="mb-2">
                            <label
                                htmlFor="youtube-edit-url"
                                className="
									block text-xs
									font-semibold
									text-brand-brown-800
								"
                            >
                                YouTube URL
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <input
                                id="youtube-edit-url"
                                type="url"
                                value={url}
                                autoFocus
                                onChange={(event) => {
                                    setUrl(
                                        event.target.value,
                                    );
                                    setError("");
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key ===
                                        "Enter"
                                    ) {
                                        event.preventDefault();
                                        saveEditing();
                                    }

                                    if (
                                        event.key ===
                                        "Escape"
                                    ) {
                                        event.preventDefault();
                                        cancelEditing();
                                    }
                                }}
                                className="
									min-w-0 flex-1
									rounded-xl
									border border-brand-sand
									bg-brand-cream/30
									px-3 py-2
									text-sm
									text-brand-brown-950
									outline-none
									transition-colors
									focus:border-brand-brown-700
									focus:bg-white
								"
                            />

                            <button
                                type="button"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                }}
                                onClick={saveEditing}
                                disabled={!videoId}
                                aria-label="Save YouTube video"
                                title="Save"
                                className="
									flex h-9 w-9
									shrink-0
									items-center
									justify-center
									rounded-xl
									bg-brand-brown-950
									text-white
									transition-opacity
									hover:opacity-90
									disabled:cursor-not-allowed
									disabled:opacity-40
								"
                            >
                                <Check size={16} />
                            </button>

                            <button
                                type="button"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                }}
                                onClick={cancelEditing}
                                aria-label="Cancel editing"
                                title="Cancel"
                                className="
									flex h-9 w-9
									shrink-0
									items-center
									justify-center
									rounded-xl
									text-brand-brown-700
									transition-colors
									hover:bg-brand-sand
									hover:text-brand-brown-950
								"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {error && (
                            <p className="mt-2 text-xs font-medium text-red-600">
                                {error}
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        {thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt="YouTube video"
                                draggable={false}
                                className="
									block
									aspect-video
									w-full
									object-cover
								"
                            />
                        ) : (
                            <div className="aspect-video w-full bg-brand-sand" />
                        )}

                        {selected && (
                            <div
                                className="
									absolute
									right-3 top-3
									flex items-center
									gap-1
									rounded-xl
									border border-brand-sand
									bg-white/95
									p-1
									shadow-lg
									backdrop-blur-sm
								"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={startEditing}
                                    aria-label="Edit YouTube video"
                                    title="Edit"
                                    className="
										flex h-8 w-8
										items-center
										justify-center
										rounded-lg
										text-brand-brown-700
										transition-colors
										hover:bg-brand-sand
										hover:text-brand-brown-950
									"
                                >
                                    <Pencil size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={deleteNode}
                                    aria-label="Remove YouTube video"
                                    title="Remove"
                                    className="
										flex h-8 w-8
										items-center
										justify-center
										rounded-lg
										text-brand-brown-700
										transition-colors
										hover:bg-red-50
										hover:text-red-600
									"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
}

export const PostYoutube = Youtube.extend({
    addNodeView() {
        return ReactNodeViewRenderer(
            YoutubeNodeView,
        );
    },
});