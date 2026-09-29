"use client";

import { useState } from "react";
import { Video, X } from "lucide-react";
import type { Editor } from "@tiptap/react";

interface YoutubePopoverProps {
	editor: Editor;
}

export function YoutubePopover({
	editor,
}: YoutubePopoverProps) {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [error, setError] = useState("");

	function openDialog() {
		setUrl("");
		setError("");
		setOpen(true);
	}

	function closeDialog() {
		setOpen(false);
		setUrl("");
		setError("");
	}

	function handleInsert() {
		const trimmed = url.trim();

		if (!trimmed) {
			setError("Paste a YouTube video URL.");
			return;
		}

		const isYoutubeUrl =
			/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(
				trimmed,
			);

		if (!isYoutubeUrl) {
			setError("Please enter a valid YouTube URL.");
			return;
		}

		editor
			.chain()
			.focus()
			.setYoutubeVideo({
				src: trimmed,
				width: 640,
				height: 360,
			})
			.run();

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
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-2xl border border-brand-sand bg-white p-5 shadow-2xl">
						<div className="flex items-start justify-between">
							<div>
								<div className="flex items-center gap-2">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
										<Video size={18} />
									</div>

									<h2 className="text-sm font-bold text-brand-brown-950">
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
								className="rounded-lg p-1.5 text-muted-foreground hover:bg-brand-sand hover:text-brand-brown-950"
								aria-label="Close"
							>
								<X size={17} />
							</button>
						</div>

						<div className="mt-5">
							<label
								htmlFor="youtube-url"
								className="mb-1.5 block text-xs font-semibold text-brand-brown-800"
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
										handleInsert();
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

							<p className="mt-2 text-[10px] text-muted-foreground">
								You can paste a regular YouTube link or a youtu.be link.
							</p>
						</div>

						<div className="mt-5 flex justify-end gap-2">
							<button
								type="button"
								onClick={closeDialog}
								className="rounded-xl px-4 py-2 text-xs font-semibold text-brand-brown-700 hover:bg-brand-sand/60"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleInsert}
								className="rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
							>
								Add Video
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}