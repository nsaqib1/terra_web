"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Video, X } from "lucide-react";
import type { Editor } from "@tiptap/react";

interface YoutubePopoverProps {
	editor: Editor;
}

function extractYoutubeVideoId(value: string): string | null {
	try {
		const url = new URL(value);

		const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

		// youtube.com/watch?v=...
		if (hostname === "youtube.com") {
			if (url.pathname === "/watch") {
				const id = url.searchParams.get("v");

				if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
					return id;
				}
			}

			// youtube.com/shorts/...
			const shortsMatch = url.pathname.match(/^\/shorts\/([^/?]+)/);

			if (shortsMatch && /^[A-Za-z0-9_-]{11}$/.test(shortsMatch[1])) {
				return shortsMatch[1];
			}

			// youtube.com/embed/...
			const embedMatch = url.pathname.match(/^\/embed\/([^/?]+)/);

			if (embedMatch && /^[A-Za-z0-9_-]{11}$/.test(embedMatch[1])) {
				return embedMatch[1];
			}
		}

		// youtu.be/...
		if (hostname === "youtu.be") {
			const id = url.pathname.slice(1).split("/")[0];

			if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
				return id;
			}
		}

		return null;
	} catch {
		return null;
	}
}

export function YoutubePopover({
	editor,
}: YoutubePopoverProps) {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");
	const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

	const videoId = useMemo(
		() => extractYoutubeVideoId(url.trim()),
		[url],
	);

	const thumbnailUrl = videoId
		? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
		: null;

	useEffect(() => {
		setThumbnailLoaded(false);
	}, [thumbnailUrl]);

	function openDialog() {
		setUrl("");
		setError("");
		setThumbnailLoaded(false);
		setOpen(true);
	}

	function closeDialog() {
		setOpen(false);
		setUrl("");
		setError("");
		setThumbnailLoaded(false);
	}

	function handleInsert() {
		const trimmed = url.trim();

		if (!trimmed) {
			setError("Paste a YouTube video URL.");
			return;
		}

		const extractedVideoId = extractYoutubeVideoId(trimmed);

		if (!extractedVideoId) {
			setError("Please enter a valid YouTube video URL.");
			return;
		}

		const inserted = editor
			.chain()
			.focus()
			.setYoutubeVideo({
				src: trimmed,
				width: 640,
				height: 360,
			})
			.run();

		if (!inserted) {
			setError("We couldn't add this video. Please try again.");
			return;
		}

		closeDialog();
	}

	return (
		<>
			<button
				type="button"
				aria-label="Add YouTube video"
				title="Add YouTube video"
				onMouseDown={(event) => {
					event.preventDefault();
				}}
				onClick={openDialog}
				className="
					flex h-8 w-8 items-center justify-center
					rounded-lg
					text-muted-foreground
					transition-colors
					hover:bg-brand-sand
					hover:text-brand-brown-950
				"
			>
				<Video size={16} />
			</button>

			{open && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) {
							closeDialog();
						}
					}}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="youtube-dialog-title"
						className="
							w-full max-w-md
							rounded-2xl
							border border-brand-sand
							bg-white
							p-5
							shadow-2xl
						"
					>
						<div className="flex items-start justify-between">
							<div>
								<div className="flex items-center gap-2">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
										<Video size={18} />
									</div>

									<h2
										id="youtube-dialog-title"
										className="text-sm font-bold text-brand-brown-950"
									>
										Add YouTube video
									</h2>
								</div>

								<p className="mt-2 text-xs leading-relaxed text-brand-brown-600">
									Share a useful video with your community.
								</p>
							</div>

							<button
								type="button"
								onClick={closeDialog}
								className="
									rounded-lg p-1.5
									text-muted-foreground
									hover:bg-brand-sand
									hover:text-brand-brown-950
								"
								aria-label="Close"
							>
								<X size={17} />
							</button>
						</div>

						<div className="mt-5">
							<label
								htmlFor="youtube-url"
								className="
									mb-1.5 block
									text-xs font-semibold
									text-brand-brown-800
								"
							>
								YouTube URL
							</label>

							<input
								id="youtube-url"
								type="url"
								value={url}
								onChange={(event) => {
									setUrl(event.target.value);
									setError("");
								}}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();

										if (videoId) {
											handleInsert();
										}
									}

									if (event.key === "Escape") {
										event.preventDefault();
										closeDialog();
									}
								}}
								autoFocus
								placeholder="https://youtube.com/watch?v=..."
								className="
									w-full rounded-xl
									border border-brand-sand
									bg-brand-cream/30
									px-3 py-2.5
									text-sm text-brand-brown-950
									placeholder:text-muted-foreground
									outline-none
									transition-colors
									focus:border-brand-brown-700
									focus:bg-white
								"
							/>

							{error && (
								<p className="mt-2 text-xs font-medium text-red-600">
									{error}
								</p>
							)}

							{thumbnailUrl && (
								<div className="relative mt-4 overflow-hidden rounded-xl bg-brand-sand">
									{!thumbnailLoaded && (
										<div className="absolute inset-0 flex items-center justify-center">
											<Loader2
												size={20}
												className="animate-spin text-brand-brown-600"
											/>
										</div>
									)}

									<img
										src={thumbnailUrl}
										alt="YouTube video thumbnail"
										className={`
											block aspect-video w-full object-cover
											transition-opacity duration-200
											${thumbnailLoaded ? "opacity-100" : "opacity-0"}
										`}
										onLoad={() => {
											setThumbnailLoaded(true);
										}}
										onError={() => {
											setThumbnailLoaded(false);
											setError(
												"We couldn't load the video preview.",
											);
										}}
									/>
								</div>
							)}

							<p className="mt-2 text-[10px] text-muted-foreground">
								You can paste a regular YouTube link or a youtu.be link.
							</p>
						</div>

						<div className="mt-5 flex justify-end gap-2">
							<button
								type="button"
								onClick={closeDialog}
								className="
									rounded-xl px-4 py-2
									text-xs font-semibold
									text-brand-brown-700
									hover:bg-brand-sand/60
								"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleInsert}
								disabled={!videoId}
								className="
									rounded-xl
									bg-brand-brown-950
									px-4 py-2
									text-xs font-semibold
									text-white
									transition-all
									hover:opacity-90
									disabled:cursor-not-allowed
									disabled:opacity-40
								"
							>
								Insert Video
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}