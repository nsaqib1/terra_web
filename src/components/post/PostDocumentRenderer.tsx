import type {
  PostBlockquoteNode,
  PostBulletListNode,
  PostCodeBlockNode,
  PostDocument,
  PostHeadingNode,
  PostImageNode,
  PostListItemNode,
  PostNode,
  PostOrderedListNode,
  PostParagraphNode,
  PostTextMark,
  PostTextNode,
} from "@/components/post/create/editor/editor-types";
import React from "react";

// ---------------------------------------------------------------------------
// Inline text with marks
// ---------------------------------------------------------------------------

function renderMark(
  mark: PostTextMark,
  children: React.ReactNode,
  key: string,
): React.ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong key={key}>{children}</strong>;

    case "italic":
      return <em key={key}>{children}</em>;

    case "underline":
      return <u key={key}>{children}</u>;

    case "strike":
      return <s key={key}>{children}</s>;

    case "code":
      return (
        <code
          key={key}
          className="rounded bg-brand-sand px-1 py-0.5 font-mono text-[0.85em] text-brand-brown-800"
        >
          {children}
        </code>
      );

    case "link":
      return (
        <a
          key={key}
          href={mark.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-desert-dark underline underline-offset-2 hover:opacity-80"
        >
          {children}
        </a>
      );

    default:
      return children;
  }
}

function InlineText({
  nodes,
}: {
  nodes: PostTextNode[];
}) {
  return (
    <>
      {nodes.map((node, i) => {
        if (!node.marks?.length) {
          return (
            <span key={i}>
              {node.text}
            </span>
          );
        }

        let content: React.ReactNode = node.text;

        for (
          let m = node.marks.length - 1;
          m >= 0;
          m--
        ) {
          content = renderMark(
            node.marks[m],
            content,
            `${i}-${m}`,
          );
        }

        return (
          <React.Fragment key={i}>
            {content}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Block nodes
// ---------------------------------------------------------------------------

function ParagraphNode({
  node,
}: {
  node: PostParagraphNode;
}) {
  if (!node.content.length) {
    return <br />;
  }

  return (
    <p className="text-sm leading-relaxed text-brand-brown-900">
      <InlineText nodes={node.content} />
    </p>
  );
}

const headingClass: Record<
  1 | 2 | 3,
  string
> = {
  1: "text-xl font-bold text-brand-brown-950",
  2: "text-lg font-bold text-brand-brown-950",
  3: "text-base font-semibold text-brand-brown-900",
};

function HeadingNode({
  node,
}: {
  node: PostHeadingNode;
}) {
  const cls = headingClass[node.level];

  const Tag = (
    `h${node.level + 1}`
  ) as "h2" | "h3" | "h4";

  return (
    <Tag className={cls}>
      <InlineText nodes={node.content} />
    </Tag>
  );
}

function ListItemNode({
  node,
}: {
  node: PostListItemNode;
}) {
  return (
    <li className="ml-4 text-sm leading-relaxed text-brand-brown-900">
      <InlineText nodes={node.content} />
    </li>
  );
}

function BulletListNode({
  node,
}: {
  node: PostBulletListNode;
}) {
  return (
    <ul className="list-disc space-y-1 pl-2">
      {node.content.map((item, i) => (
        <ListItemNode
          key={i}
          node={item}
        />
      ))}
    </ul>
  );
}

function OrderedListNode({
  node,
}: {
  node: PostOrderedListNode;
}) {
  return (
    <ol className="list-decimal space-y-1 pl-2">
      {node.content.map((item, i) => (
        <ListItemNode
          key={i}
          node={item}
        />
      ))}
    </ol>
  );
}

function BlockquoteNode({
  node,
}: {
  node: PostBlockquoteNode;
}) {
  return (
    <blockquote className="border-l-2 border-brand-desert pl-4 text-sm italic leading-relaxed text-brand-brown-700">
      <InlineText nodes={node.content} />
    </blockquote>
  );
}

function CodeBlockNode({
  node,
}: {
  node: PostCodeBlockNode;
}) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-brand-brown-950 p-4 text-xs leading-relaxed text-brand-sand">
      <code className="font-mono">
        {node.content
          .map((t) => t.text)
          .join("")}
      </code>
    </pre>
  );
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured",
  );
}

const API_BASE =
  API_URL.replace(/\/+$/, "");

function ImageNode({
  node,
}: {
  node: PostImageNode;
}) {
  const src =
    `${API_BASE}/media/${node.mediaId}`;

  return (
    <figure className="my-1 overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={node.altText ?? ""}
        className="h-auto max-h-[720px] w-full rounded-xl object-contain"
        loading="lazy"
        onError={(event) => {
          console.error(
            "Failed to load post image:",
            {
              mediaId: node.mediaId,
              src,
            },
          );

          event.currentTarget.style.display =
            "none";
        }}
      />
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Node renderer
// ---------------------------------------------------------------------------

function RenderNode({
  node,
}: {
  node: PostNode;
}) {
  switch (node.type) {
    case "paragraph":
      return (
        <ParagraphNode node={node} />
      );

    case "heading":
      return (
        <HeadingNode node={node} />
      );

    case "bulletList":
      return (
        <BulletListNode node={node} />
      );

    case "orderedList":
      return (
        <OrderedListNode node={node} />
      );

    case "blockquote":
      return (
        <BlockquoteNode node={node} />
      );

    case "codeBlock":
      return (
        <CodeBlockNode node={node} />
      );

    case "image":
      return (
        <ImageNode node={node} />
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

interface PostDocumentRendererProps {
  document: PostDocument;
  className?: string;
}

export function PostDocumentRenderer({
  document,
  className,
}: PostDocumentRendererProps) {
  return (
    <div
      className={`space-y-3 ${className ?? ""
        }`}
    >
      {document.content.map(
        (node, i) => (
          <RenderNode
            key={i}
            node={node}
          />
        ),
      )}
    </div>
  );
}