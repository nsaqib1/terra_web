"use client";

import Link from "next/link";
import { Download, FileArchive, FileText, FileType2, Presentation, Table2, Image as ImageIcon } from "lucide-react";
import { ResourceItem } from "@/lib/api/types";
import { resourcesApi } from "@/lib/api/resources";

function formatSize(bytes: number) {
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

function iconForMime(mime: string) {
  if (mime.includes("presentation")) return Presentation;
  if (mime.includes("spreadsheet") || mime.includes("excel")) return Table2;
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("7z")) return FileArchive;
  if (mime.includes("pdf")) return FileType2;
  if (mime.startsWith("image/")) return ImageIcon;
  return FileText;
}

export function ResourceCard({ resource }: { resource: ResourceItem }) {
  const Icon = iconForMime(resource.mimeType);

  return (
    <article className="rounded-2xl border border-brand-sand-dark/70 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-sand text-brand-brown-900">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/resources/${resource.id}`} className="line-clamp-2 text-sm font-bold text-brand-brown-950 hover:underline">
            {resource.title}
          </Link>
          <p className="mt-1 truncate text-[11px] text-brand-brown-600">{resource.originalFilename}</p>
        </div>
      </div>

      {resource.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-brand-brown-700">{resource.description}</p>
      )}

      {resource.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {resource.tags.slice(0, 5).map(({ tag }) => (
            <span key={tag.id} className="rounded-lg bg-brand-sand/60 px-2 py-1 text-[10px] font-semibold text-brand-brown-700">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-brand-sand/70 pt-3 text-[10px] font-medium text-brand-brown-600">
        <span>{formatSize(resource.size)} · {resource.downloadCount} downloads</span>
        <a
          href={resourcesApi.fileUrl(resource.id, true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-brown-950 px-2.5 py-1.5 font-semibold text-white hover:opacity-90"
        >
          <Download size={12} /> Download
        </a>
      </div>
    </article>
  );
}
