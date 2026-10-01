"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileArchive,
  FileCode2,
  FileSpreadsheet,
  FileText,
  FileType2,
  Image as ImageIcon,
  Loader2,
  Table2,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { resourcesApi } from "@/lib/api/resources";
import { ResourceItem } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

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

function getResourceType(mimeType: string) {
  const mime = mimeType.toLowerCase();

  if (mime.startsWith("image/")) {
    return "image";
  }

  if (mime === "application/pdf") {
    return "pdf";
  }

  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml"
  ) {
    return "text";
  }

  if (
    mime === "text/csv" ||
    mime === "application/csv" ||
    mime === "application/vnd.ms-excel"
  ) {
    return "csv";
  }

  if (
    mime === "application/zip" ||
    mime === "application/x-zip-compressed" ||
    mime === "application/x-rar-compressed" ||
    mime === "application/x-7z-compressed"
  ) {
    return "archive";
  }

  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel")
  ) {
    return "spreadsheet";
  }

  if (
    mime.includes("word") ||
    mime.includes("document") ||
    mime.includes("powerpoint") ||
    mime.includes("presentation")
  ) {
    return "document";
  }

  if (
    mime.includes("javascript") ||
    mime.includes("typescript") ||
    mime.includes("python") ||
    mime.includes("shell") ||
    mime.includes("json")
  ) {
    return "code";
  }

  return "unknown";
}

function ResourceIcon({
  type,
  size = 21,
}: {
  type: string;
  size?: number;
}) {
  switch (type) {
    case "image":
      return <ImageIcon size={size} />;

    case "pdf":
      return <FileText size={size} />;

    case "text":
      return <FileText size={size} />;

    case "csv":
      return <Table2 size={size} />;

    case "spreadsheet":
      return <FileSpreadsheet size={size} />;

    case "document":
      return <FileType2 size={size} />;

    case "code":
      return <FileCode2 size={size} />;

    case "archive":
      return <FileArchive size={size} />;

    default:
      return <FileText size={size} />;
  }
}

function TextViewer({
  url,
  mimeType,
}: {
  url: string;
  mimeType: string;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Unable to load this resource.");
        }

        const text = await response.text();

        if (!cancelled) {
          setContent(text);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this resource."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2
          size={20}
          className="animate-spin text-brand-brown-600"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-xs text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <pre
      className={`max-h-[75vh] overflow-auto whitespace-pre-wrap break-words p-5 text-left text-xs leading-relaxed text-brand-brown-900 ${mimeType === "application/json"
          ? "font-mono"
          : "font-mono"
        }`}
    >
      {content}
    </pre>
  );
}

function CsvViewer({ url }: { url: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Unable to load this resource.");
        }

        const text = await response.text();

        if (!cancelled) {
          setContent(text);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this resource."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [url]);

  const rows = useMemo(() => {
    if (!content.trim()) return [];

    return content
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) =>
        line
          .split(",")
          .map((cell) =>
            cell
              .trim()
              .replace(/^"(.*)"$/, "$1")
          )
      );
  }, [content]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2
          size={20}
          className="animate-spin text-brand-brown-600"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-xs text-rose-700">
        {error}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-xs text-brand-brown-600">
        This CSV file is empty.
      </div>
    );
  }

  return (
    <div className="max-h-[75vh] overflow-auto">
      <table className="min-w-full border-collapse text-left text-xs">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={
                rowIndex === 0
                  ? "bg-brand-sand font-bold"
                  : "border-t border-brand-sand-dark/50"
              }
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="whitespace-nowrap border-r border-brand-sand-dark/50 px-3 py-2 last:border-r-0"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UnsupportedViewer({
  resource,
  type,
}: {
  resource: ResourceItem;
  type: string;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-sand text-brand-brown-900">
        <ResourceIcon
          type={type}
          size={27}
        />
      </div>

      <h2 className="mt-4 text-sm font-bold text-brand-brown-950">
        Preview unavailable
      </h2>

      <p className="mt-1 max-w-sm text-xs leading-relaxed text-brand-brown-600">
        This file type cannot currently be viewed inside
        Terramids. Download the resource to open it.
      </p>

      <a
        href={resourcesApi.fileUrl(resource.id, true)}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-brown-950 px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"
      >
        <Download size={15} />
        Download
      </a>
    </div>
  );
}

function ResourceViewer({
  resource,
}: {
  resource: ResourceItem;
}) {
  const type = getResourceType(resource.mimeType);
  const url = resourcesApi.fileUrl(resource.id);

  switch (type) {
    case "image":
      return (
        <div className="flex max-h-[75vh] min-h-[30vh] items-center justify-center overflow-auto bg-brand-sand/20 p-5 sm:p-8">
          <img
            src={url}
            alt={resource.title}
            className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-sm"
          />
        </div>
      );

    case "pdf":
      return (
        <iframe
          title={resource.title}
          src={url}
          className="h-[75vh] w-full border-0"
        />
      );

    case "text":
      return (
        <TextViewer
          url={url}
          mimeType={resource.mimeType}
        />
      );

    case "csv":
      return <CsvViewer url={url} />;

    default:
      return (
        <UnsupportedViewer
          resource={resource}
          type={type}
        />
      );
  }
}

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [resource, setResource] =
    useState<ResourceItem | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    resourcesApi
      .getById(id)
      .then(setResource)
      .catch((err) =>
        setError(
          extractErrorMessage(
            err,
            "Resource not found."
          )
        )
      );
  }, [id]);

  if (!resource && !error) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2
            className="animate-spin text-brand-brown-700"
            size={20}
          />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl py-12 text-center text-sm text-rose-700">
          {error}
        </div>
      </AppShell>
    );
  }

  if (!resource) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px]">
        <Link
          href={`/community/${resource.community.slug}/resources`}
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-brand-brown-700 hover:text-brand-brown-950"
        >
          <ArrowLeft size={15} />
          Back to resources
        </Link>

        <div className="rounded-2xl border border-brand-sand-dark/70 bg-white shadow-xs">
          {/* Header */}
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-sand text-brand-brown-900">
                  <ResourceIcon
                    type={getResourceType(resource.mimeType)}
                    size={21}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-extrabold text-brand-brown-950">
                    {resource.title}
                  </h1>

                  <p className="mt-1 text-xs text-brand-brown-600">
                    {resource.originalFilename}
                    {" · "}
                    {formatSize(resource.size)}
                    {" · "}
                    {resource.downloadCount} downloads
                  </p>
                </div>
              </div>

              <a
                href={resourcesApi.fileUrl(
                  resource.id,
                  true
                )}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-brown-950 px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"
              >
                <Download size={15} />
                Download
              </a>
            </div>

            {resource.description && (
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-brand-brown-700">
                {resource.description}
              </p>
            )}

            {resource.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {resource.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="rounded-lg bg-brand-sand px-2.5 py-1.5 text-[10px] font-semibold text-brand-brown-800"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Viewer */}
          <div className="border-t border-brand-sand-dark/70">
            <ResourceViewer resource={resource} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}