"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { resourcesApi } from "@/lib/api/resources";
import { ResourceItem } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024; let unit = units[0];
  for (let i = 1; i < units.length && value >= 1024; i++) { value /= 1024; unit = units[i]; }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const [resource, setResource] = useState<ResourceItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    resourcesApi.getById(id).then(setResource).catch((err) => setError(extractErrorMessage(err, "Resource not found.")));
  }, [id]);

  if (!resource && !error) return <AppShell><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-brand-brown-700" /></div></AppShell>;
  if (error) return <AppShell><div className="mx-auto max-w-3xl py-12 text-center text-sm text-rose-700">{error}</div></AppShell>;
  if (!resource) return null;

  const previewable = resource.mimeType === "application/pdf";

  return <AppShell>
    <div className="mx-auto max-w-[1000px]">
      <Link href={`/community/${resource.community.slug}/resources`} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-brand-brown-700 hover:text-brand-brown-950"><ArrowLeft size={15} /> Back to resources</Link>
      <div className="rounded-2xl border border-brand-sand-dark/70 bg-white p-5 shadow-xs sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-sand text-brand-brown-900"><FileText size={21} /></div>
            <div><h1 className="text-xl font-extrabold text-brand-brown-950">{resource.title}</h1><p className="mt-1 text-xs text-brand-brown-600">{resource.originalFilename} · {formatSize(resource.size)} · {resource.downloadCount} downloads</p></div>
          </div>
          <a href={resourcesApi.fileUrl(resource.id, true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-brown-950 px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"><Download size={15} /> Download</a>
        </div>
        {resource.description && <p className="mt-5 max-w-3xl text-sm leading-relaxed text-brand-brown-700">{resource.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2">{resource.tags.map(({ tag }) => <span key={tag.id} className="rounded-lg bg-brand-sand px-2.5 py-1.5 text-[10px] font-semibold text-brand-brown-800">#{tag.name}</span>)}</div>
        {previewable ? <div className="mt-6 overflow-hidden rounded-xl border border-brand-sand-dark bg-brand-sand/20"><iframe title={resource.title} src={resourcesApi.fileUrl(resource.id)} className="h-[75vh] w-full" /></div> : <div className="mt-6 rounded-xl border border-brand-sand-dark bg-brand-sand/30 p-8 text-center text-xs text-brand-brown-600">Preview is not available for this file type. Download the resource to open it.</div>}
      </div>
    </div>
  </AppShell>;
}
