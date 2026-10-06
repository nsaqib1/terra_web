import type { PostItem } from "./types";

const postsById = new Map<string, PostItem>();

export function cachePostForNavigation(post: PostItem): void {
  postsById.set(post.id, post);
}

export function consumePostForNavigation(postId: string): PostItem | null {
  const post = postsById.get(postId);
  if (!post) return null;

  postsById.delete(postId);
  return post;
}
