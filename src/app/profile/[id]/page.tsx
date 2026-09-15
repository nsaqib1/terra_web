"use client";

import {
  Calendar,
  Compass,
  ExternalLink,
  Globe,
  Eye,
  MapPin,
  MessageSquare,
  ThumbsUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MockPost = {
  id: string;
  body: string;
  community: string;
  communitySlug: string;
  upvotes: number;
  comments: number;
  views: number;
  createdAt: string;
  tags: string[];
};

type MockCommunity = {
  id: string;
  name: string;
  slug: string;
  members: string;
  description: string;
};

function getMockUserProfile(id: string) {
  return {
    id: id || "usr_78942",
    displayName: "Dr. Elena Vance",
    username: id ? id.replace(/[^a-zA-Z0-9_]/g, "") : "elenavance",

    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",

    points: 3840,

    bio: "Urban technologist & civic governance researcher. Building open-source resilient energy systems and community data commons for decentralized cities.",

    location: "Zurich, Switzerland",
    website: "https://elenavance.io",
    joinedDate: "January 2024",

    posts: [
      {
        id: "p1",
        body:
          "How local solar nodes can leverage cryptographic consensus to balance peak microgrid loads without central intermediaries.",
        community: "Clean Energy & Grid",
        communitySlug: "clean-energy",
        upvotes: 142,
        comments: 38,
        views: 1840,
        createdAt: "3 days ago",
        tags: ["Energy", "SmartGrid", "Governance"],
      },
      {
        id: "p2",
        body:
          "A unified schema standard for LoRaWAN municipal water monitoring, enabling open telemetry dashboards for all residents.",
        community: "Urban Infrastructure",
        communitySlug: "urban-infra",
        upvotes: 98,
        comments: 24,
        views: 1260,
        createdAt: "1 week ago",
        tags: ["IoT", "PublicGoods", "Water"],
      },
      {
        id: "p3",
        body:
          "From hardware calibration to citizen incentives: a 12-month empirical review of community-led environmental monitoring.",
        community: "Civic Tech",
        communitySlug: "civic-tech",
        upvotes: 215,
        comments: 67,
        views: 3290,
        createdAt: "3 weeks ago",
        tags: ["Hardware", "Environment", "DataCommons"],
      },
    ],

    communities: [
      {
        id: "c1",
        name: "Clean Energy & Grid",
        slug: "clean-energy",
        members: "3.4k citizens",
        description:
          "Decentralized power systems, local microgrids, and green infrastructure.",
      },
      {
        id: "c2",
        name: "Urban Infrastructure",
        slug: "urban-infra",
        members: "8.1k citizens",
        description:
          "Physical public goods, mobility networks, and civic architectural designs.",
      },
      {
        id: "c3",
        name: "Civic Tech",
        slug: "civic-tech",
        members: "12.8k citizens",
        description:
          "Open source tools for transparent collective decision making and community ops.",
      },
    ] satisfies MockCommunity[],
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PublicProfilePage() {
  const params = useParams();

  const rawId =
    typeof params?.id === "string" ? params.id : "elenavance";

  const user = getMockUserProfile(rawId);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* =========================================================
            PROFILE HEADER
        ========================================================= */}
        <section className="overflow-hidden rounded-3xl border border-brand-sand-dark bg-white shadow-xs">
          {/* Banner */}
          <div className="relative h-40 sm:h-48 w-full bg-gradient-to-r from-[#e8cba2] via-[#e2b781] to-[#cf985e]">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(#2f291f 1px, transparent 1px), radial-gradient(#2f291f 1px, #e2b781 1px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 12px 12px",
              }}
            />
          </div>

          {/* Identity */}
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-14 sm:-mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                {/* Avatar */}
                <Avatar className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-full border-4 border-white bg-white shadow-md">
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="rounded-full object-cover"
                  />

                  <AvatarFallback className="rounded-full bg-brand-desert text-2xl font-bold text-brand-brown-950">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="pb-1">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-brown-950">
                    {user.displayName}
                  </h1>

                  <p className="mt-1 text-sm font-medium text-brand-brown-600">
                    @{user.username}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-brand-brown-800">
                {user.bio}
              </p>

              {/* Profile metadata */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-brand-sand-dark/60 pt-4 text-xs text-brand-brown-600">
                {/* Points first */}
                <div className="flex items-center gap-1.5 font-medium text-brand-brown-950">
                  <Zap
                    size={14}
                    className="text-brand-desert-dark"
                  />

                  <span className="font-bold">
                    {user.points.toLocaleString()}
                  </span>

                  <span>Points</span>
                </div>

                {user.location && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin
                      size={14}
                      className="text-brand-brown-500"
                    />
                    <span>{user.location}</span>
                  </div>
                )}

                {user.website && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Globe
                      size={14}
                      className="text-brand-brown-500"
                    />

                    <a
                      href={user.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-brand-brown-900 hover:underline"
                    >
                      {user.website.replace("https://", "")}
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                {/* Joined last */}
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar
                    size={14}
                    className="text-brand-brown-500"
                  />
                  <span>Joined {user.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONTENT
        ========================================================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* =======================================================
              POSTS
          ======================================================= */}
          <section className="min-w-0">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-brown-950">
                Posts
              </h2>

              <span className="rounded-full bg-brand-sand px-2 py-0.5 text-[10px] font-bold text-brand-brown-700">
                {user.posts.length}
              </span>
            </div>

            <div className="space-y-4">
              {user.posts.map((post) => (
                <ProfilePostCard
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          </section>

          {/* =======================================================
              COMMUNITIES
          ======================================================= */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-brown-950">
                Communities
              </h2>

              <span className="rounded-full bg-brand-sand px-2 py-0.5 text-[10px] font-bold text-brand-brown-700">
                {user.communities.length}
              </span>
            </div>

            <div className="space-y-3">
              {user.communities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

/* ================================================================
   POST CARD
================================================================ */

function ProfilePostCard({
  post,
}: {
  post: MockPost;
}) {
  return (
    <article className="group rounded-2xl border border-brand-sand-dark bg-white p-5 shadow-xs transition-all hover:border-brand-sand-dark/80 hover:shadow-sm sm:p-6">
      {/* Community + Tags */}
      <div className="flex items-center justify-between gap-3">
        {/* Community */}
        <Link
          href={`/community/${post.communitySlug}`}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-brand-sand/60 px-2.5 py-1 text-[11px] font-bold text-brand-brown-800 transition-colors hover:bg-brand-sand"
        >
          <Compass
            size={12}
            className="shrink-0 text-brand-desert-dark"
          />

          <span className="truncate">
            {post.community}
          </span>
        </Link>

        {/* Tags */}
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-brand-sand/40 px-2 py-0.5 text-[10px] font-semibold text-brand-brown-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Post body + date */}
      <Link
        href={`/posts/${post.id}`}
        className="mt-4 block"
      >
        <p className="text-sm leading-relaxed text-brand-brown-800">
          {post.body}
        </p>

        {/* Date intentionally close to body */}
        <p className="mt-2 text-[11px] font-medium text-muted-foreground">
          {post.createdAt}
        </p>
      </Link>

      {/* Engagement + Views */}
      <div className="mt-4 flex items-center justify-between border-t border-brand-sand-dark/40 pt-3">
        {/* Votes + Comments */}
        <div className="flex items-center gap-4 text-xs font-semibold text-brand-brown-700">
          <div className="flex items-center gap-1">
            <ThumbsUp
              size={14}
              className="text-brand-desert-dark"
            />
            <span>{post.upvotes}</span>
          </div>

          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{post.comments}</span>
          </div>
        </div>

        {/* Views */}
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Eye size={14} />
          <span>{post.views.toLocaleString()}</span>
        </div>
      </div>
    </article>
  );
}

/* ================================================================
   COMMUNITY CARD
================================================================ */

function CommunityCard({
  community,
}: {
  community: MockCommunity;
}) {
  return (
    <Link
      href={`/community/${community.slug}`}
      className="group block rounded-2xl border border-brand-sand-dark bg-white p-4 shadow-xs transition-all hover:border-brand-sand-dark/80 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Community avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-desert/20 text-sm font-black text-brand-brown-950">
          {community.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          {/* Community name */}
          <h3 className="truncate text-sm font-bold text-brand-brown-950 group-hover:underline">
            {community.name}
          </h3>

          {/* Description */}
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-brand-brown-600">
            {community.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

