import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { PostImage } from "./extensions/PostImage";


export const postEditorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },

    bulletList: {
      keepMarks: true,
      keepAttributes: true,
    },

    orderedList: {
      keepMarks: true,
      keepAttributes: true,
    },

    codeBlock: {
      HTMLAttributes: {
        class:
          "rounded-xl bg-brand-brown-950 p-4 font-mono text-sm text-white overflow-x-auto",
      },
    },

    blockquote: {
      HTMLAttributes: {
        class:
          "border-l-4 border-brand-desert pl-4 italic",
      },
    },

    horizontalRule: false,

    dropcursor: {
      color: "currentColor",
    },
  }),

  Underline,

  Link.configure({
    openOnClick: false,

    autolink: true,

    linkOnPaste: true,

    defaultProtocol: "https",

    HTMLAttributes: {
      class:
        "text-brand-desert-dark underline underline-offset-2",
    },
  }),

  PostImage,
];