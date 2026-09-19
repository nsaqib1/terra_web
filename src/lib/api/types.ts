export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  points: number;
  role?: UserRole;
  status?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  points: number;
  createdAt: string;
}

export interface UserStats {
  posts: number;
  upvotes: number;
  communities: number;
}

export interface UserProfileResponse {
  user: UserProfile;
  stats: UserStats;
}

export interface UpdateProfileInput {
  displayName?: string;
  username?: string;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

export interface UserCommunityItem {
  id: string;
  name: string;
  slug: string;
  role: CommunityMemberRole;
  joinedAt: string;
}

export interface UserPostsQuery {
  page?: number;
  limit?: number;
}

export interface UserCommunitiesQuery {
  page?: number;
  limit?: number;
}

export interface RegisterDto {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

export type CommunityStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type CommunityMaturity = "NEW" | "GROWING" | "ESTABLISHED" | "SELF_GOVERNED";
export type GovernanceMode = "PLATFORM_MANAGED" | "SELF_GOVERNED";

export interface CommunityTag {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
}

export type TagStatus = "ACTIVE" | "ARCHIVED";

export interface Tag {
  id: string;
  communityId: string;
  name: string;
  slug: string;
  description: string | null;
  usageCount: number;
  status: TagStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListTagsQuery {
  communityId: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface CreateTagInput {
  communityId: string;
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateTagInput {
  name?: string;
  description?: string;
  status?: TagStatus;
}

export type CommunityMemberRole = "CITIZEN" | "MODERATOR";

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CommunityStatus;
  maturity: CommunityMaturity;
  governanceMode: GovernanceMode;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  membersCount?: number;
  postsCount?: number;
  tagsCount?: number;
  tags?: CommunityTag[];
}

export interface JoinedCommunity {
  id: string;
  name: string;
  slug: string;
  role: CommunityMemberRole;
  joinedAt: string;
}

export interface AdminCommunityStats {
  communities: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };
  proposals: {
    pending: number;
  };
  platform: {
    totalCitizens: number;
    totalPosts: number;
  };
}

export interface AdminCommunityQuery {
  search?: string;
  status?: CommunityStatus;
  maturity?: CommunityMaturity;
  governanceMode?: GovernanceMode;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "membersCount" | "postsCount";
  sortOrder?: "asc" | "desc";
}

export interface CreateCommunityInput {
  name: string;
  slug: string;
  description?: string;
  status?: CommunityStatus;
  maturity?: CommunityMaturity;
  governanceMode?: GovernanceMode;
}

export interface UpdateCommunityInput {
  name?: string;
  slug?: string;
  description?: string;
  status?: CommunityStatus;
  maturity?: CommunityMaturity;
  governanceMode?: GovernanceMode;
}

export type CommunityProposalStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";

export interface CommunityProposal {
  id: string;
  proposedName: string;
  proposedSlug: string;
  description: string | null;
  reason: string | null;
  status: CommunityProposalStatus;
  reviewReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  proposedBy: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  reviewedBy?: {
    id: string;
    username: string;
    displayName: string;
  } | null;
  community?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ReviewProposalInput {
  status: "APPROVED" | "REJECTED";
  reviewReason?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
  };
}

export interface CommunityDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CommunityStatus;
  maturity: CommunityMaturity;
  governanceMode: GovernanceMode;
  createdAt: string;
  updatedAt: string;
  _count: {
    memberships: number;
    posts: number;
  };
}

export interface CommunityMembershipRecord {
  id: string;
  role: CommunityMemberRole;
  joinedAt: string;
  leftAt?: string | null;
  community?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface MembershipStatusResponse {
  isMember: boolean;
  membership: CommunityMembershipRecord | null;
}

export interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface PostTagItem {
  id: string;
  name: string;
  slug: string;
}

export interface PostMediaItem {
  id: string;
  type: string;
  storageKey: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number | null;
  altText: string | null;
}

export interface PostItem {
  id: string;
  document: any;
  community: {
    id: string;
    name: string;
    slug: string;
  };
  author: PostAuthor;
  tags: PostTagItem[];
  media?: PostMediaItem[];
  score: number;
  commentCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type PostSortOption = "newest" | "top" | "comments" | "oldest";

export interface TrendingPost {
  id: string;
  document: any;
  community: {
    id: string;
    name: string;
    slug: string;
  };
  author: PostAuthor;
  tags: PostTagItem[];
  score: number;
  commentCount: number;
  createdAt: string;
  trendingScore: number;
}

export interface GetPostsQuery {
  communityId?: string;
  page?: number;
  limit?: number;
  sort?: PostSortOption;
}

export interface CreatePostInput {
  communityId: string;
  document: unknown;
  tagIds: string[];
}

export interface UpdatePostInput {
  document?: unknown;
  tagIds?: string[];
}

export type VoteValue = "UP" | "DOWN";
export type VoteAction = "created" | "removed" | "changed";

export interface VoteResponse {
  action: VoteAction;
  value: VoteValue | null;
  scoreChange: number;
}

export interface VoteInput {
  postId?: string;
  commentId?: string;
  value: VoteValue;
}

export interface PostVotesResponse {
  postVote: VoteValue | null;
  commentVotes: Record<string, VoteValue>;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: PostAuthor & { points?: number };
  replies?: CommentItem[];
}

export interface ListCommentsQuery {
  postId: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "top" | "oldest";
}

export interface CreateCommentInput {
  postId: string;
  parentId?: string;
  body: string;
}

export interface UpdateCommentInput {
  body: string;
}

