export type PostTextMark =
  | {
    type: "bold";
  }
  | {
    type: "italic";
  }
  | {
    type: "underline";
  }
  | {
    type: "strike";
  }
  | {
    type: "code";
  }
  | {
    type: "link";
    href: string;
  };

export interface PostTextNode {
  type: "text";
  text: string;
  marks?: PostTextMark[];
}

export interface PostParagraphNode {
  type: "paragraph";
  content: PostTextNode[];
}

export interface PostHeadingNode {
  type: "heading";
  level: 1 | 2 | 3;
  content: PostTextNode[];
}

export interface PostListItemNode {
  type: "listItem";
  content: PostTextNode[];
}

export interface PostBulletListNode {
  type: "bulletList";
  content: PostListItemNode[];
}

export interface PostOrderedListNode {
  type: "orderedList";
  content: PostListItemNode[];
}

export interface PostBlockquoteNode {
  type: "blockquote";
  content: PostTextNode[];
}

export interface PostCodeBlockNode {
  type: "codeBlock";
  language?: string;
  content: PostTextNode[];
}

export interface PostImageNode {
  type: "image";
  mediaId: string;
  altText?: string;
}

export type PostNode =
  | PostParagraphNode
  | PostHeadingNode
  | PostBulletListNode
  | PostOrderedListNode
  | PostBlockquoteNode
  | PostCodeBlockNode
  | PostImageNode;

export interface PostDocument {
  type: "doc";
  version: 1;
  content: PostNode[];
}