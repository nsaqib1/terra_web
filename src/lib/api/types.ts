export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio?: string | null;
  points: number;
  role?: UserRole;
  status?: string;
  createdAt: string;
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
  };
}
