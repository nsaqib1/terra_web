"use client";

import { PostItem } from "@/lib/api/types";
import { FeedPostCard } from "@/components/feed/FeedPostCard";

interface CommunityPostCardProps {
  post: PostItem;
}

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  return <FeedPostCard post={post} compactMedia />;
}
