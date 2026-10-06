import {
  Node,
  mergeAttributes,
} from "@tiptap/core";
import {
  postImageNodeView,
  type PostImageAttributes,
} from "./PostImageNodeView";

export interface PostImageOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    postImage: {
      setPostImage: (
        attributes: PostImageAttributes,
      ) => ReturnType;
    };
  }
}

export const PostImage =
  Node.create<PostImageOptions>({
    name: "postImage",

    group: "block",

    atom: true,

    selectable: true,

    draggable: true,

    addOptions() {
      return {
        HTMLAttributes: {},
      };
    },

    addAttributes() {
      return {
        mediaId: {
          default: null,
        },

        alt: {
          default: null,
        },

        /*
         * Editor-only preview URL.
         *
         * This is NOT stored in PostDocument.
         */
        src: {
          default: null,
        },

        uploading: {
          default: false,
        },

        uploadError: {
          default: null,
        },

        uploadId: {
          default: null,
        },
      };
    },

    addNodeView() {
      return postImageNodeView;
    },

    parseHTML() {
      return [
        {
          tag: "img[data-post-image]",
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      return [
        "img",
        mergeAttributes(
          this.options.HTMLAttributes,
          HTMLAttributes,
          {
            "data-post-image": "",
          },
        ),
      ];
    },

    addCommands() {
      return {
        setPostImage:
          (attributes) =>
            ({ commands }) => {
              return commands.insertContent({
                type: this.name,
                attrs: attributes,
              });
            },
      };
    },
  });