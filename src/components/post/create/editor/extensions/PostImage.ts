import {
  Node,
  mergeAttributes,
} from "@tiptap/core";

export interface PostImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    postImage: {
      setPostImage: (attributes: {
        mediaId: string;
        alt?: string;
        src?: string;
      }) => ReturnType;
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
      };
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