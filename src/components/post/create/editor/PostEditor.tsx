"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
} from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { mediaApi } from "@/lib/api/media";
import { tagsApi } from "@/lib/api/tags";
import type { Tag } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";
import { Check, Loader2, Plus, X } from "lucide-react";

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
  communityId?: string;
  selectedTagIds?: string[];
  onTagIdsChange?: (tagIds: string[]) => void;
  enableHashtags?: boolean;
}

export interface PostEditorHandle {
  insertHashtag: (tag: Tag) => void;
  removeHashtag: (tagId: string) => void;
}

interface HashtagSearchState {
  from: number;
  to: number;
  query: string;
  left: number;
  top: number;
  bottom: number | null;
  above: boolean;
}

const MAX_POST_TAGS = 5;

function normalizeSlug(value: string) {
  return value.toLocaleLowerCase().replace(/_/g, "-");
}

export const PostEditor = forwardRef<PostEditorHandle, PostEditorProps>(function PostEditor({
  value,
  onChange,
  onImageUploadsChange,
  communityId = "",
  selectedTagIds = [],
  onTagIdsChange,
  enableHashtags = false,
}, ref) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageSelectionError, setImageSelectionError] =
    useState<string | null>(null);
  const [knownTagsById, setKnownTagsById] = useState<Record<string, Tag>>({});
  const [suggestionTags, setSuggestionTags] = useState<Tag[]>([]);
  const [hashtagSearch, setHashtagSearch] = useState<HashtagSearchState | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagNotice, setTagNotice] = useState<string | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const knownTagsByIdRef = useRef<Record<string, Tag>>({});
  const knownTagsBySlugRef = useRef<Record<string, Tag>>({});
  const editorRef = useRef<Editor | null>(null);
  const suggestionMenuRef = useRef<HTMLDivElement>(null);
  const communityIdRef = useRef(communityId);
  const selectedTagIdsRef = useRef(selectedTagIds);
  const onTagIdsChangeRef = useRef(onTagIdsChange);
  const requestedSlugsRef = useRef<Set<string>>(new Set());
  const lastReportedTagIdsRef = useRef<string[]>([]);
  const dismissedSuggestionRef = useRef<string | null>(null);

  communityIdRef.current = communityId;
  selectedTagIdsRef.current = selectedTagIds;
  onTagIdsChangeRef.current = onTagIdsChange;

  function rememberTags(tags: Tag[]) {
    if (!tags.length) return;
    const byId = { ...knownTagsByIdRef.current };
    const bySlug = { ...knownTagsBySlugRef.current };
    for (const tag of tags) {
      if (tag.status !== "ACTIVE") continue;
      byId[tag.id] = tag;
      bySlug[normalizeSlug(tag.slug)] = tag;
    }
    knownTagsByIdRef.current = byId;
    knownTagsBySlugRef.current = bySlug;
    setKnownTagsById(byId);
  }

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
      if (enableHashtags) {
        syncDocumentHashtags(editor);
        refreshHashtagSearch(editor);
      }
    },
  });

  editorRef.current = editor;

  function collectHashtagSlugs(activeEditor: Editor): string[] {
    const slugs: string[] = [];
    activeEditor.state.doc.descendants((node) => {
      if (node.type.name === "codeBlock") return false;
      if (!node.isText || !node.text) return true;
      if (node.marks.some((mark) => mark.type.name === "code" || mark.type.name === "link")) return true;

      const regex = /#[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(node.text)) !== null) {
        const previous = match.index > 0 ? node.text[match.index - 1] : "";
        if (previous && /[A-Za-z0-9_]/.test(previous)) continue;
        const slug = normalizeSlug(match[0].slice(1));
        if (slug.length >= 2 && !slugs.includes(slug)) slugs.push(slug);
      }
      return true;
    });
    return slugs;
  }

  function syncDocumentHashtags(activeEditor: Editor) {
    if (!enableHashtags || !communityIdRef.current) return;
    const slugs = collectHashtagSlugs(activeEditor);
    const matchedTags = slugs
      .map((slug) => knownTagsBySlugRef.current[slug])
      .filter((tag): tag is Tag => Boolean(tag));
    const uniqueIds = [...new Set(matchedTags.map((tag) => tag.id))];
    const nextIds = uniqueIds.slice(0, MAX_POST_TAGS);

    if (uniqueIds.length > MAX_POST_TAGS) {
      setTagNotice(`Only ${MAX_POST_TAGS} unique tags can be attached to a post. Extra hashtags remain in the text.`);
    } else {
      setTagNotice((current) => current?.startsWith("Only ") ? null : current);
    }

    if (nextIds.length !== lastReportedTagIdsRef.current.length || nextIds.some((id, index) => id !== lastReportedTagIdsRef.current[index])) {
      lastReportedTagIdsRef.current = nextIds;
      onTagIdsChangeRef.current?.(nextIds);
    }

    const active = getActiveHashtag(activeEditor);
    for (const slug of slugs) {
      if (knownTagsBySlugRef.current[slug] || requestedSlugsRef.current.has(slug)) continue;
      if (active && normalizeSlug(active.query) === slug) continue;
      const currentCommunityId = communityIdRef.current;
      if (!currentCommunityId) return;
      requestedSlugsRef.current.add(slug);
      void tagsApi.list({ communityId: currentCommunityId, q: slug, limit: 20 })
        .then((response) => {
          if (communityIdRef.current !== currentCommunityId) return;
          const exact = response.data.filter((tag) => tag.status === "ACTIVE" && normalizeSlug(tag.slug) === slug);
          if (exact.length) {
            rememberTags(exact);
            syncDocumentHashtags(activeEditor);
          }
        })
        .catch(() => {
          requestedSlugsRef.current.delete(slug);
        });
    }
  }

  function getActiveHashtag(activeEditor: Editor): { from: number; to: number; query: string } | null {
    const selection = activeEditor.state.selection;
    if (!selection.empty) return null;
    const $from = selection.$from;
    if (!$from.parent.isTextblock || $from.parent.type.name === "codeBlock") return null;
    if ($from.marks().some((mark) => mark.type.name === "code" || mark.type.name === "link")) return null;

    const before = $from.parent.textBetween(0, $from.parentOffset, "\0", "\0");
    const match = /(?:^|[^A-Za-z0-9_])#([A-Za-z0-9_-]{0,60})$/.exec(before);
    if (!match) return null;
    const hashOffset = match.index + match[0].lastIndexOf("#");
    const from = selection.from - ($from.parentOffset - hashOffset);
    return { from, to: selection.from, query: match[1] };
  }

  function refreshHashtagSearch(activeEditor: Editor) {
    if (!enableHashtags || !communityIdRef.current) {
      setHashtagSearch(null);
      return;
    }
    const active = getActiveHashtag(activeEditor);
    if (!active) {
      setHashtagSearch(null);
      dismissedSuggestionRef.current = null;
      return;
    }
    const dismissalKey = `${active.from}:${active.query}`;
    if (dismissedSuggestionRef.current === dismissalKey) {
      setHashtagSearch(null);
      return;
    }
    try {
      const coords = activeEditor.view.coordsAtPos(active.to);
      const width = 300;
      const left = Math.max(8, Math.min(coords.left, window.innerWidth - width - 8));
      const availableBelow = window.innerHeight - coords.bottom;
      const above = availableBelow < 250 && coords.top > 250;
      const top = above ? Math.max(8, coords.top - 8) : Math.min(window.innerHeight - 8, coords.bottom + 8);
      const bottom = above ? Math.max(8, window.innerHeight - coords.top + 8) : null;
      setHashtagSearch({ ...active, left, top, bottom, above });
    } catch {
      setHashtagSearch({ ...active, left: 12, top: 80, bottom: null, above: false });
    }
  }

  function removeHashtag(tagId: string) {
    const activeEditor = editorRef.current;
    const tag = knownTagsByIdRef.current[tagId];
    if (!activeEditor || !tag) return;
    const targetSlug = normalizeSlug(tag.slug);
    const removals: Array<{ from: number; to: number }> = [];
    activeEditor.state.doc.descendants((node, position) => {
      if (node.type.name === "codeBlock") return false;
      if (!node.isText || !node.text || node.marks.some((mark) => mark.type.name === "code" || mark.type.name === "link")) return true;
      const regex = /#[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*/g;
      const usedWhitespace = new Set<number>();
      let match: RegExpExecArray | null;
      while ((match = regex.exec(node.text)) !== null) {
        const previous = match.index > 0 ? node.text[match.index - 1] : "";
        if (previous && /[A-Za-z0-9_]/.test(previous)) continue;
        if (normalizeSlug(match[0].slice(1)) !== targetSlug) continue;

        let from = match.index;
        let to = match.index + match[0].length;
        const following = node.text[to] ?? "";
        const precedingIndex = from - 1;
        if (following && /^\s$/.test(following) && !usedWhitespace.has(to)) {
          usedWhitespace.add(to);
          to += 1;
        } else if (previous && /^\s$/.test(previous) && !usedWhitespace.has(precedingIndex)) {
          usedWhitespace.add(precedingIndex);
          from -= 1;
        }
        removals.push({ from: position + from, to: position + to });
      }
      return true;
    });

    if (removals.length) {
      let transaction = activeEditor.state.tr;
      for (const range of removals.sort((a, b) => b.from - a.from)) {
        transaction = transaction.delete(range.from, range.to);
      }
      activeEditor.view.dispatch(transaction);
    } else {
      const nextIds = selectedTagIdsRef.current.filter((id) => id !== tagId);
      lastReportedTagIdsRef.current = nextIds;
      onTagIdsChangeRef.current?.(nextIds);
    }
  }

  function insertHashtag(tag: Tag) {
    const activeEditor = editorRef.current;
    if (!activeEditor || !enableHashtags) return;
    const isAlreadySelected = selectedTagIdsRef.current.includes(tag.id);
    if (!isAlreadySelected && selectedTagIdsRef.current.length >= MAX_POST_TAGS) {
      setTagNotice(`A post can have up to ${MAX_POST_TAGS} tags. Remove one before adding another.`);
      return;
    }
    rememberTags([tag]);
    setTagNotice(null);

    const active = hashtagSearch;
    if (active) {
      const after = activeEditor.state.doc.textBetween(active.to, Math.min(active.to + 1, activeEditor.state.doc.content.size), "", "");
      const suffix = after && /^\s$/.test(after) ? "" : " ";
      activeEditor.chain().focus().insertContentAt({ from: active.from, to: active.to }, `#${tag.slug}${suffix}`).run();
      setHashtagSearch(null);
      return;
    }

    const selection = activeEditor.state.selection;
    const position = selection.to;
    const previous = position > 1 ? activeEditor.state.doc.textBetween(position - 1, position, "", "") : "";
    const next = activeEditor.state.doc.textBetween(position, Math.min(position + 1, activeEditor.state.doc.content.size), "", "");
    const prefix = previous && !/^\s$/.test(previous) && !/[([{]$/.test(previous) ? " " : "";
    const suffix = next && (/^\s$/.test(next) || /^[,.;:!?)}\]]$/.test(next)) ? "" : " ";
    activeEditor.chain().focus().insertContentAt({ from: position, to: position }, `${prefix}#${tag.slug}${suffix}`).run();
  }

  useImperativeHandle(ref, () => ({ insertHashtag, removeHashtag }), [hashtagSearch, enableHashtags, selectedTagIds]);

  useEffect(() => {
    if (!enableHashtags || !communityId) return;
    let cancelled = false;
    setKnownTagsById({});
    setSuggestionTags([]);
    setHashtagSearch(null);
    setSuggestionsError(null);
    knownTagsByIdRef.current = {};
    knownTagsBySlugRef.current = {};
    requestedSlugsRef.current.clear();
    lastReportedTagIdsRef.current = [];
    setTagNotice(null);

    tagsApi.list({ communityId, limit: 50 })
      .then((response) => {
        if (cancelled || communityIdRef.current !== communityId) return;
        rememberTags(response.data.filter((tag) => tag.status === "ACTIVE"));
        if (editorRef.current) syncDocumentHashtags(editorRef.current);
      })
      .catch(() => {
        // Hashtag autocomplete still works through its query-specific fallback.
      });

    return () => { cancelled = true; };
  }, [communityId, enableHashtags]);

  useEffect(() => {
    if (!enableHashtags || !communityId || !hashtagSearch) {
      setSuggestionTags([]);
      setSuggestionsLoading(false);
      setSuggestionsError(null);
      return;
    }
    let cancelled = false;
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    const timeout = window.setTimeout(() => {
      tagsApi.list({ communityId, q: hashtagSearch.query || undefined, limit: 20 })
        .then((response) => {
          if (cancelled || communityIdRef.current !== communityId) return;
          const activeTags = response.data.filter((tag) => tag.status === "ACTIVE");
          setSuggestionTags(activeTags);
          rememberTags(activeTags);
          const exact = activeTags.find((tag) => normalizeSlug(tag.slug) === normalizeSlug(hashtagSearch.query));
          if (exact && editorRef.current) syncDocumentHashtags(editorRef.current);
        })
        .catch(() => {
          if (!cancelled) setSuggestionsError("Couldn’t load tag suggestions.");
        })
        .finally(() => {
          if (!cancelled) setSuggestionsLoading(false);
        });
    }, 140);
    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [communityId, enableHashtags, hashtagSearch?.query, hashtagSearch?.from]);

  useEffect(() => {
    if (!editor || !enableHashtags) return;
    const refresh = () => refreshHashtagSearch(editor);
    editor.on("selectionUpdate", refresh);
    editor.on("update", refresh);
    refresh();
    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("update", refresh);
    };
  }, [editor, enableHashtags, communityId]);

  useEffect(() => {
    if (!editor || !enableHashtags || !hashtagSearch) return;
    const refresh = () => refreshHashtagSearch(editor);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (editor.view.dom.contains(target) || suggestionMenuRef.current?.contains(target)) return;
      setHashtagSearch(null);
    };
    window.addEventListener("scroll", refresh, true);
    window.addEventListener("resize", refresh);
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [editor, enableHashtags, hashtagSearch?.from, hashtagSearch?.query]);

  useEffect(() => {
    if (!editor || !enableHashtags) return;
    syncDocumentHashtags(editor);
  }, [editor, enableHashtags, communityId, knownTagsById]);

  useEffect(() => {
    setActiveSuggestionIndex(0);
  }, [hashtagSearch?.query, suggestionTags.length]);

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

  async function createHashtagFromQuery() {
    if (!communityId || !hashtagSearch || creatingTag || selectedTagIds.length >= MAX_POST_TAGS) return;
    const slugQuery = hashtagSearch.query.trim().replace(/_/g, "-").replace(/^-+|-+$/g, "");
    if (slugQuery.length < 2) return;
    const name = slugQuery.split("-").filter(Boolean).join(" ");
    setCreatingTag(true);
    setSuggestionsError(null);
    try {
      const tag = await tagsApi.createForCommunity({ communityId, name });
      rememberTags([tag]);
      insertHashtag(tag);
      setSuggestionTags((current) => [tag, ...current.filter((item) => item.id !== tag.id)]);
    } catch (error) {
      const message = extractErrorMessage(error);
      if (/already exists|already been taken|duplicate/i.test(message)) {
        try {
          const response = await tagsApi.list({ communityId, q: slugQuery, limit: 20 });
          const activeTags = response.data.filter((item) => item.status === "ACTIVE");
          rememberTags(activeTags);
          setSuggestionTags(activeTags);
          setTagNotice("A matching tag already exists. Choose it from the suggestions.");
          setSuggestionsError(null);
        } catch {
          setSuggestionsError("This tag already exists. Try searching for it again.");
        }
      } else {
        setSuggestionsError(message || "Couldn’t create this tag.");
      }
    } finally {
      setCreatingTag(false);
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
        <div className="relative" onKeyDownCapture={(event) => {
          if (!enableHashtags || !hashtagSearch) return;
          const exact = suggestionTags.find((tag) => normalizeSlug(tag.slug) === normalizeSlug(hashtagSearch.query));
          const canCreate = Boolean(hashtagSearch.query.length >= 2 && !exact && !suggestionsLoading && !suggestionsError);
          const optionCount = suggestionTags.length + (canCreate ? 1 : 0);
          if (event.key === "ArrowDown" && optionCount > 0) {
            event.preventDefault(); event.stopPropagation();
            setActiveSuggestionIndex((index) => (index + 1) % optionCount);
          } else if (event.key === "ArrowUp" && optionCount > 0) {
            event.preventDefault(); event.stopPropagation();
            setActiveSuggestionIndex((index) => (index - 1 + optionCount) % optionCount);
          } else if (event.key === "Escape") {
            event.preventDefault(); event.stopPropagation();
            dismissedSuggestionRef.current = `${hashtagSearch.from}:${hashtagSearch.query}`;
            setHashtagSearch(null);
          } else if (event.key === "Enter" && optionCount > 0) {
            event.preventDefault(); event.stopPropagation();
            if (activeSuggestionIndex < suggestionTags.length) {
              const tag = suggestionTags[activeSuggestionIndex];
              if (tag && (selectedTagIds.includes(tag.id) || selectedTagIds.length < MAX_POST_TAGS)) insertHashtag(tag);
            } else if (canCreate) {
              void createHashtagFromQuery();
            }
          }
        }}>
          <div className="-mx-5 rounded-none border-y bg-white sm:mx-0 sm:rounded-xl sm:border">
            <EditorToolbar
              editor={activeEditor}
              onImageClick={handleImageClick}
            />

            <div className="relative">
              {activeEditor.isEmpty && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-4 z-10 max-w-[90%] text-[15px] leading-7 text-brand-brown-600/65"
                >
                  Share something worth discussing…
                </div>
              )}
              <EditorContent editor={activeEditor} />
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImageFile(file);
                event.target.value = "";
              }}
            />
          </div>

          {enableHashtags && selectedTagIds.length > 0 && (
            <div className="mt-3" aria-label="Selected post tags">
              <div className="flex flex-wrap gap-2">
                {selectedTagIds.map((tagId) => {
                  const tag = knownTagsById[tagId];
                  if (!tag) return null;
                  return (
                    <span key={tagId} className="inline-flex items-center gap-1.5 rounded-full border border-brand-desert/60 bg-brand-desert-light px-3 py-1.5 text-xs font-semibold text-brand-brown-950">
                      <span title={tag.name}>#{tag.slug}</span>
                      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => removeHashtag(tagId)} aria-label={`Remove hashtag ${tag.name}`} className="rounded-full p-0.5 hover:bg-white/70">
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {tagNotice && <p role="status" className="mt-2 text-xs text-amber-700">{tagNotice}</p>}
          {imageSelectionError && <p className="mt-2 text-xs text-red-600" role="alert">{imageSelectionError}</p>}

          <p className="mt-1.5 text-right text-[10px] text-muted-foreground">
            {activeEditor.getText().trim() ? `${activeEditor.getText().length} characters` : ""}
          </p>

          {enableHashtags && hashtagSearch && (
            <div
              ref={suggestionMenuRef}
              role="listbox"
              aria-label="Hashtag suggestions"
              className="fixed z-[100] max-h-72 w-[300px] overflow-y-auto rounded-xl border border-brand-sand-dark/70 bg-white shadow-[0_14px_36px_rgba(72,64,48,0.18)]"
              style={{ left: hashtagSearch.left, top: hashtagSearch.above ? undefined : hashtagSearch.top, bottom: hashtagSearch.above ? hashtagSearch.bottom ?? undefined : undefined }}
            >
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Community tags</span>
                {suggestionsLoading && <Loader2 size={13} className="animate-spin text-muted-foreground" />}
              </div>
              {suggestionsError ? (
                <p role="alert" className="px-3 py-3 text-xs text-red-600">{suggestionsError}</p>
              ) : suggestionTags.map((tag, index) => {
                const selected = selectedTagIds.includes(tag.id);
                const disabled = !selected && selectedTagIds.length >= MAX_POST_TAGS;
                return (
                  <button key={tag.id} type="button" role="option" aria-selected={index === activeSuggestionIndex} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => insertHashtag(tag)} className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${index === activeSuggestionIndex ? "bg-brand-cream" : "hover:bg-brand-cream/70"} disabled:cursor-not-allowed disabled:opacity-45`}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-sand text-xs font-bold text-brand-brown-800">#</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-brand-brown-950">{tag.name}</span><span className="block truncate text-[10px] text-muted-foreground">#{tag.slug}</span></span>
                    {selected ? <Check size={15} className="text-brand-desert-dark" /> : <Plus size={14} className="text-muted-foreground" />}
                  </button>
                );
              })}
              {!suggestionsLoading && suggestionTags.length === 0 && !suggestionsError && !hashtagSearch.query && (
                <p className="px-3 py-3 text-xs text-muted-foreground">No tags yet. Type a name to create one.</p>
              )}
              {(() => {
                const exact = suggestionTags.find((tag) => normalizeSlug(tag.slug) === normalizeSlug(hashtagSearch.query));
                const canCreate = hashtagSearch.query.length >= 2 && !exact && !suggestionsLoading && !suggestionsError;
                if (!canCreate) return null;
                const index = suggestionTags.length;
                const disabled = creatingTag || selectedTagIds.length >= MAX_POST_TAGS;
                return (
                  <button type="button" role="option" aria-selected={index === activeSuggestionIndex} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => void createHashtagFromQuery()} className={`flex w-full items-center gap-2.5 border-t bg-brand-cream/40 px-3 py-3 text-left hover:bg-brand-desert-light/50 ${index === activeSuggestionIndex ? "ring-1 ring-inset ring-brand-desert" : ""} disabled:cursor-not-allowed disabled:opacity-50`}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-desert-light text-brand-brown-900">{creatingTag ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-brand-brown-950">{creatingTag ? "Creating tag…" : `Create #${hashtagSearch.query}`}</span><span className="block text-[10px] text-muted-foreground">Add it to this community</span></span>
                  </button>
                );
              })()}
              {selectedTagIds.length >= MAX_POST_TAGS && <p className="border-t px-3 py-2 text-[10px] text-muted-foreground">Remove a tag before adding another.</p>}
            </div>
          )}
        </div>
      </PostImageUploadContext.Provider>
    </>
  );
});

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