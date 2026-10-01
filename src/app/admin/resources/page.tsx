"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileArchive,
  FileCode,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  FileType2,
  FileUp,
  Filter,
  FolderArchive,
  HardDrive,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  Presentation,
  RefreshCw,
  Search,
  Tag,
  Table2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { resourcesApi } from "@/lib/api/resources";
import { Community, ResourceItem, ResourceTag } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";
import { ResourceEditModal } from "@/components/admin/ResourceEditModal";

const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "txt", "csv", "md", "zip", "7z", "rar",
  "exe", "msi", "apk", "dmg", "deb", "rpm",
  "png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "ico", "tiff", "avif"
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

function formatSize(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let i = 1; i < units.length && value >= 1024; i++) {
    value /= 1024;
    unit = units[i];
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

function getFileCategory(filename: string, mime: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext) || mime.includes("pdf")) {
    return { label: "PDF", color: "bg-rose-100 text-rose-700 border-rose-200", icon: FileType2 };
  }
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "ico", "tiff", "avif"].includes(ext) || mime.startsWith("image/")) {
    return { label: "IMAGE", color: "bg-teal-100 text-teal-700 border-teal-200", icon: ImageIcon };
  }
  if (["doc", "docx", "txt", "md"].includes(ext) || mime.includes("word") || mime.includes("text")) {
    return { label: "DOCUMENT", color: "bg-blue-100 text-blue-700 border-blue-200", icon: FileText };
  }
  if (["xls", "xlsx", "csv"].includes(ext) || mime.includes("excel") || mime.includes("spreadsheet")) {
    return { label: "SPREADSHEET", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: FileSpreadsheet };
  }
  if (["ppt", "pptx"].includes(ext) || mime.includes("presentation") || mime.includes("powerpoint")) {
    return { label: "PRESENTATION", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Presentation };
  }
  if (["zip", "7z", "rar"].includes(ext) || mime.includes("zip") || mime.includes("archive")) {
    return { label: "ARCHIVE", color: "bg-purple-100 text-purple-700 border-purple-200", icon: FileArchive };
  }
  if (["exe", "msi", "apk", "dmg", "deb", "rpm"].includes(ext)) {
    return { label: "PACKAGE", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: HardDrive };
  }
  return { label: "FILE", color: "bg-gray-100 text-gray-700 border-gray-200", icon: FileText };
}

function cleanTitleFromFilename(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AdminResourcesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityId, setCommunityId] = useState("");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [tags, setTags] = useState<ResourceTag[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "downloads" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Tag creation state
  const [newTagName, setNewTagName] = useState("");
  const [newTagDesc, setNewTagDesc] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Edit Modal State
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const tagIds = selectedTagFilter ? [selectedTagFilter] : undefined;
      const [resourceResponse, tagResponse] = await Promise.all([
        resourcesApi.adminList({
          communityId,
          q: search || undefined,
          tagIds,
          sort: sortBy,
          page,
          limit: 20,
        }),
        resourcesApi.adminListTags(communityId, ""),
      ]);
      setResources(resourceResponse.data || []);
      if (resourceResponse.meta) {
        setTotalPages(resourceResponse.meta.totalPages || 1);
        setTotalCount(resourceResponse.meta.total || 0);
      }
      setTags(tagResponse || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [communityId, search, selectedTagFilter, sortBy, page]);

  useEffect(() => {
    adminApi
      .getCommunities({ status: "ACTIVE", limit: 50 })
      .then((response) => {
        const activeComms = response.data || [];
        setCommunities(activeComms);
        if (!communityId && activeComms.length > 0) {
          setCommunityId(activeComms[0].id);
        }
      })
      .catch(() => setCommunities([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [communityId, search, selectedTagFilter, statusFilter, sortBy]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleFileSelected = (selectedFile: File | null) => {
    setUploadError(null);
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(
        `Unsupported file type .${ext}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError(
        `File is too large (${formatSize(selectedFile.size)}). Maximum size allowed is 100 MB.`
      );
      return;
    }

    setFile(selectedFile);
    if (!title.trim()) {
      setTitle(cleanTitleFromFilename(selectedFile.name));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelected(droppedFile);
    }
  };

  const submitUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !communityId || !title.trim()) {
      setUploadError("Please provide a file and resource title.");
      return;
    }
    setSubmitting(true);
    setUploadError(null);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("communityId", communityId);
      form.append("title", title.trim());
      if (description.trim()) form.append("description", description.trim());
      form.append("tagIds", JSON.stringify(selectedTags));

      await resourcesApi.adminCreate(form);

      setFile(null);
      setTitle("");
      setDescription("");
      setSelectedTags([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await loadResources();
    } catch (err) {
      setUploadError(extractErrorMessage(err, "Failed to upload resource file."));
    } finally {
      setSubmitting(false);
    }
  };

  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityId || !newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      const created = await resourcesApi.adminCreateTag({
        communityId,
        name: newTagName.trim(),
        description: newTagDesc.trim() || undefined,
      });
      setTags((current) => [created, ...current]);
      setSelectedTags((current) => [...current, created.id]);
      setNewTagName("");
      setNewTagDesc("");
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to create resource tag."));
    } finally {
      setIsCreatingTag(false);
    }
  };

  const archive = async (id: string, currentTitle: string) => {
    if (!window.confirm(`Are you sure you want to archive resource "${currentTitle}"?`)) return;
    try {
      await resourcesApi.adminArchive(id);
      await loadResources();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const filteredResources = resources.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-brown-950">
            Resource Management
          </h1>
          <p className="mt-1 text-xs text-brand-brown-600">
            Upload, categorize, and administer persistent community files, guides, and document libraries.
          </p>
        </div>

        {/* Community Picker Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-brand-brown-700">Community:</span>
          <select
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            className="h-10 rounded-xl border border-brand-sand-dark bg-white px-3.5 text-xs font-bold text-brand-brown-950 shadow-2xs outline-none focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light/40"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-950">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Grid: Upload & Controls + Resource List */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Side: Resource Library List & Search/Filter */}
        <section className="space-y-5 rounded-2xl border border-brand-sand-dark/70 bg-white p-5 shadow-xs">
          {/* Header & Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-brand-sand/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-desert-light text-brand-brown-950">
                <FilePlus2 size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-brand-brown-950">Resource Library</h2>
                <p className="text-[11px] text-brand-brown-600">
                  {totalCount} total resource{totalCount === 1 ? "" : "s"} found
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadResources()}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-brand-sand-dark px-3 text-xs font-semibold text-brand-brown-700 hover:bg-brand-sand"
                title="Refresh resources"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="relative sm:col-span-6">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-brown-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, filename or description…"
                className="h-10 w-full rounded-xl border border-brand-sand-dark pl-9 pr-8 text-xs text-brand-brown-950 placeholder:text-brand-brown-600/50 outline-none focus:border-brand-desert-dark"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-brown-400 hover:text-brand-brown-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:col-span-6">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 flex-1 rounded-xl border border-brand-sand-dark bg-white px-2.5 text-xs font-semibold text-brand-brown-800 outline-none"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="downloads">Sort: Most Downloaded</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-10 rounded-xl border border-brand-sand-dark bg-white px-2.5 text-xs font-semibold text-brand-brown-800 outline-none"
              >
                <option value="ALL">Status: All</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Active Tag Filter Indicator */}
          {selectedTagFilter && (
            <div className="flex items-center gap-2 rounded-xl bg-brand-sand/60 px-3 py-1.5 text-xs text-brand-brown-800">
              <Filter size={13} className="text-brand-desert-dark" />
              <span>
                Filtered by tag: <strong>#{tags.find((t) => t.id === selectedTagFilter)?.name || selectedTagFilter}</strong>
              </span>
              <button
                onClick={() => setSelectedTagFilter("")}
                className="ml-auto font-semibold text-brand-brown-600 hover:text-brand-brown-950"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Resource List Items */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-brand-brown-600">
                <Loader2 className="animate-spin text-brand-desert-dark" size={24} />
                <span className="mt-2 text-xs font-medium">Loading resources…</span>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-sand-dark p-8 text-center text-xs text-brand-brown-600">
                <FolderArchive size={28} className="mx-auto mb-2 text-brand-brown-400" />
                <p className="font-semibold text-brand-brown-900">No resources found</p>
                <p className="mt-1 text-brand-brown-600">
                  {search || selectedTagFilter
                    ? "Try adjusting your search criteria or tag filters."
                    : "Upload a file on the right to start building the community library."}
                </p>
              </div>
            ) : (
              filteredResources.map((resource) => {
                const category = getFileCategory(resource.originalFilename, resource.mimeType);
                const IconComponent = category.icon;

                return (
                  <div
                    key={resource.id}
                    className="group relative flex flex-col gap-3 rounded-2xl border border-brand-sand-dark/60 bg-white p-4 transition-all hover:border-brand-sand-dark hover:shadow-2xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${category.color}`}
                      >
                        <IconComponent size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-xs font-bold text-brand-brown-950">
                            {resource.title}
                          </h3>
                          <span
                            className={`rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${category.color}`}
                          >
                            {category.label}
                          </span>
                          {resource.status === "ARCHIVED" && (
                            <span className="rounded-md bg-amber-100 border border-amber-200 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 uppercase">
                              Archived
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-[11px] font-mono text-brand-brown-600">
                          {resource.originalFilename}
                        </p>

                        {resource.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-brown-700">
                            {resource.description}
                          </p>
                        )}

                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10px] text-brand-brown-600/80">
                          <span className="font-semibold text-brand-brown-800">
                            {formatSize(resource.size)}
                          </span>
                          <span>•</span>
                          <span>{resource.downloadCount} downloads</span>
                          <span>•</span>
                          <span>
                            {new Date(resource.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Tag Chips */}
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {resource.tags.map(({ tag }) => (
                              <button
                                key={tag.id}
                                onClick={() => setSelectedTagFilter(tag.id)}
                                className="rounded-md bg-brand-sand px-1.5 py-0.5 text-[10px] font-medium text-brand-brown-800 hover:bg-brand-sand-dark/60"
                              >
                                #{tag.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 border-t border-brand-sand/60 pt-2 sm:border-t-0 sm:pt-0">
                      <a
                        href={resourcesApi.fileUrl(resource.id, true)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-brand-sand-dark bg-white px-3 py-1.5 text-xs font-semibold text-brand-brown-900 shadow-2xs hover:bg-brand-sand"
                        title="Download file"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>

                      <button
                        onClick={() => {
                          setEditingResource(resource);
                          setIsEditModalOpen(true);
                        }}
                        className="rounded-xl border border-brand-sand-dark p-2 text-brand-brown-700 hover:bg-brand-sand hover:text-brand-brown-950"
                        title="Edit resource"
                      >
                        <Edit3 size={14} />
                      </button>

                      {resource.status === "PUBLISHED" && (
                        <button
                          onClick={() => archive(resource.id, resource.title)}
                          className="rounded-xl border border-brand-sand-dark p-2 text-brand-brown-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          title="Archive resource"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-brand-sand/80 pt-4 text-xs font-medium text-brand-brown-700">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-xl border border-brand-sand-dark px-3 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-brand-sand"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-xl border border-brand-sand-dark px-3 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-brand-sand"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Upload Form Dropzone & Tag Management */}
        <section className="space-y-5">
          {/* Upload Resource Form Card */}
          <form
            onSubmit={submitUpload}
            className="rounded-2xl border border-brand-sand-dark/70 bg-white p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-brand-sand/80 pb-3">
              <UploadCloud size={18} className="text-brand-desert-dark" />
              <h2 className="text-sm font-bold text-brand-brown-950">Upload New Resource</h2>
            </div>

            {uploadError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {uploadError}
              </div>
            )}

            {/* Drag and Drop File Zone */}
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                File Attachment *
              </label>

              <input
                ref={fileInputRef}
                id="resource-file-input"
                type="file"
                onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                className="hidden"
              />

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-brand-desert-dark bg-brand-desert-light/30 scale-[1.01]"
                      : "border-brand-sand-dark bg-brand-sand/20 hover:border-brand-desert-dark hover:bg-brand-sand/50"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-brand-desert-dark group-hover:scale-110 transition-transform">
                    <FileUp size={24} />
                  </div>

                  <p className="mt-3 text-xs font-bold text-brand-brown-950">
                    Click to upload <span className="font-normal text-brand-brown-600">or drag and drop</span>
                  </p>
                  <p className="mt-1 text-[10px] text-brand-brown-500">
                    PDF, DOCX, XLSX, PPTX, ZIP, CSV, TXT, EXE up to 100 MB
                  </p>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="relative flex items-center gap-3 rounded-2xl border border-brand-sand-dark bg-brand-sand/30 p-3.5 shadow-2xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-brown-950 text-white font-bold text-xs uppercase">
                    {file.name.split(".").pop() || "FILE"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-brand-brown-950">{file.name}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-brand-brown-600">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileSelected(null)}
                    className="rounded-lg p-1.5 text-brand-brown-500 hover:bg-rose-50 hover:text-rose-700"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Resource Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Zoning Guidelines 2026"
                className="h-10 w-full rounded-xl border border-brand-sand-dark px-3 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-semibold text-brand-brown-900 mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this resource covers…"
                rows={3}
                className="w-full rounded-xl border border-brand-sand-dark p-3 text-xs text-brand-brown-950 outline-none focus:border-brand-desert-dark resize-none"
              />
            </div>

            {/* Tag Selection */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-brown-900">Resource Tags</span>
                <span className="text-[10px] text-brand-brown-500">
                  {selectedTags.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.length === 0 ? (
                  <p className="text-[11px] text-brand-brown-500">
                    No resource tags created yet.
                  </p>
                ) : (
                  tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() =>
                          setSelectedTags((current) =>
                            current.includes(tag.id)
                              ? current.filter((id) => id !== tag.id)
                              : [...current, tag.id]
                          )
                        }
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          isSelected
                            ? "bg-brand-brown-950 text-white"
                            : "bg-brand-sand text-brand-brown-700 hover:bg-brand-sand-dark/60"
                        }`}
                      >
                        #{tag.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !file || !title.trim() || !communityId}
              className="h-11 w-full gap-2 rounded-xl bg-brand-brown-950 text-xs font-bold text-white shadow-sm hover:bg-brand-brown-900 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading resource…</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Upload Resource</span>
                </>
              )}
            </Button>
          </form>

          {/* Resource Tag Vocabulary Card */}
          <div className="rounded-2xl border border-brand-sand-dark/70 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-sand/80 pb-3">
              <Tag size={16} className="text-brand-brown-950" />
              <h2 className="text-sm font-bold text-brand-brown-950">Resource Tags</h2>
            </div>

            <form onSubmit={createTag} className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name (e.g. Whitepaper)"
                  className="h-9 min-w-0 flex-1 rounded-xl border border-brand-sand-dark px-3 text-xs outline-none focus:border-brand-desert-dark"
                  required
                />
                <button
                  type="submit"
                  disabled={isCreatingTag || !newTagName.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-brand-brown-950 px-3.5 text-xs font-semibold text-white hover:bg-brand-brown-900 disabled:opacity-60"
                >
                  {isCreatingTag ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Add Tag</span>
                </button>
              </div>

              <input
                value={newTagDesc}
                onChange={(e) => setNewTagDesc(e.target.value)}
                placeholder="Tag description (optional)"
                className="h-8 w-full rounded-lg border border-brand-sand-dark/80 px-2.5 text-[11px] text-brand-brown-800 outline-none"
              />
            </form>

            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-500">
                Available Tags ({tags.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-sand/80 px-2.5 py-1 text-[10px] font-semibold text-brand-brown-800"
                  >
                    <span>#{tag.name}</span>
                    <span className="rounded-full bg-brand-brown-950/10 px-1 py-0.2 text-[9px]">
                      {tag.usageCount ?? 0}
                    </span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-brand-brown-500 italic">
                Note: Resource tags belong specifically to document resource management.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Edit Resource Modal */}
      <ResourceEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingResource(null);
        }}
        onSuccess={() => loadResources()}
        resource={editingResource}
        availableTags={tags}
      />
    </div>
  );
}

