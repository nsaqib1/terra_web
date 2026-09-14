import type { JSONContent } from "@tiptap/core";

import type {
  PostDocument,
  PostNode,
  PostTextMark,
  PostTextNode,
} from "./editor-types";

function convertMarks(
  marks?: JSONContent["marks"],
): PostTextMark[] | undefined {
  if (!marks?.length) {
    return undefined;
  }

  const result: PostTextMark[] = [];

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result.push({
          type: "bold",
        });
        break;

      case "italic":
        result.push({
          type: "italic",
        });
        break;

      case "underline":
        result.push({
          type: "underline",
        });
        break;

      case "strike":
        result.push({
          type: "strike",
        });
        break;

      case "code":
        result.push({
          type: "code",
        });
        break;

      case "link": {
        const href = mark.attrs?.href;

        if (typeof href === "string" && href.length > 0) {
          result.push({
            type: "link",
            href,
          });
        }

        break;
      }
    }
  }

  return result.length > 0
    ? result
    : undefined;
}

function convertInlineContent(
  content?: JSONContent[],
): PostTextNode[] {
  if (!content?.length) {
    return [];
  }

  const result: PostTextNode[] = [];

  for (const node of content) {
    if (node.type !== "text") {
      continue;
    }

    if (!node.text) {
      continue;
    }

    const marks = convertMarks(node.marks);

    result.push({
      type: "text",
      text: node.text,
      ...(marks ? { marks } : {}),
    });
  }

  return result;
}

function convertListItem(
  node: JSONContent,
) {
  const paragraph = node.content?.find(
    (child) => child.type === "paragraph",
  );

  return {
    type: "listItem" as const,
    content: convertInlineContent(
      paragraph?.content,
    ),
  };
}

function convertNode(
  node: JSONContent,
): PostNode | null {
  switch (node.type) {
    case "paragraph":
      return {
        type: "paragraph",
        content: convertInlineContent(
          node.content,
        ),
      };

    case "heading": {
      const level = node.attrs?.level;

      if (
        level !== 1 &&
        level !== 2 &&
        level !== 3
      ) {
        return null;
      }

      return {
        type: "heading",
        level,
        content: convertInlineContent(
          node.content,
        ),
      };
    }

    case "bulletList": {
      const items = (node.content ?? [])
        .filter(
          (item) =>
            item.type === "listItem",
        )
        .map(convertListItem);

      if (items.length === 0) {
        return null;
      }

      return {
        type: "bulletList",
        content: items,
      };
    }

    case "orderedList": {
      const items = (node.content ?? [])
        .filter(
          (item) =>
            item.type === "listItem",
        )
        .map(convertListItem);

      if (items.length === 0) {
        return null;
      }

      return {
        type: "orderedList",
        content: items,
      };
    }

    case "blockquote": {
      const paragraph =
        node.content?.find(
          (child) =>
            child.type === "paragraph",
        );

      return {
        type: "blockquote",
        content: convertInlineContent(
          paragraph?.content,
        ),
      };
    }

    case "codeBlock":
      return {
        type: "codeBlock",
        ...(typeof node.attrs?.language ===
          "string"
          ? {
            language:
              node.attrs.language,
          }
          : {}),
        content: convertInlineContent(
          node.content,
        ),
      };

    case "postImage": {
      const mediaId =
        node.attrs?.mediaId;

      if (
        typeof mediaId !== "string" ||
        mediaId.length === 0
      ) {
        return null;
      }

      return {
        type: "image",
        mediaId,
        ...(typeof node.attrs?.alt ===
          "string"
          ? {
            altText: node.attrs.alt,
          }
          : {}),
      };
    }

    default:
      return null;
  }
}

export function toPostDocument(
  json: JSONContent,
): PostDocument {
  const content: PostNode[] = [];

  for (const node of json.content ?? []) {
    const converted = convertNode(node);

    if (converted) {
      content.push(converted);
    }
  }

  return {
    type: "doc",
    version: 1,
    content,
  };
}