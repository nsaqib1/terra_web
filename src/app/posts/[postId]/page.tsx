"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
  CornerDownRight,
  Send,
  Trash2,
  CheckCircle2,
  Share2,
  Check,
  ChevronDown,
  LogIn,
  X,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PostDocumentRenderer } from "@/components/post/PostDocumentRenderer";
import { useAuth } from "@/context/AuthContext";
import { postsApi } from "@/lib/api/posts";
import { commentsApi } from "@/lib/api/comments";
import { votesApi } from "@/lib/api/votes";
import {
  PostItem,
  CommentItem,
  VoteValue,
} from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";
import type { PostDocument } from "@/components/post/create/editor/editor-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function relativeTime(iso?: string | null): string {
  if (!iso) return "just now";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Loading & Error States
// ---------------------------------------------------------------------------

function PostSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand-sand/70" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-36 rounded bg-brand-sand/70" />
          <div className="h-2.5 w-24 rounded bg-brand-sand/50" />
        </div>
      </div>
      <div className="space-y-2.5 pt-2">
        <div className="h-3.5 w-full rounded bg-brand-sand/70" />
        <div className="h-3.5 w-5/6 rounded bg-brand-sand/60" />
        <div className="h-3.5 w-4/6 rounded bg-brand-sand/50" />
      </div>
    </div>
  );
}

function PostError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/80 p-6 flex items-start gap-3">
      <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold text-red-800">Could not load post</p>
        <p className="text-xs text-red-600 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comment Item Component
// ---------------------------------------------------------------------------

interface CommentNodeProps {
  comment: CommentItem;
  postId: string;
  isTopAnswer?: boolean;
  currentUserVote?: VoteValue | null;
  currentUserId?: string;
  onVote: (commentId: string, value: VoteValue) => void;
  onReply: (parentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string, parentId?: string | null) => Promise<void>;
  commentVotes: Record<string, VoteValue>;
}

function CommentNode({
  comment,
  postId,
  isTopAnswer = false,
  currentUserVote,
  currentUserId,
  onVote,
  onReply,
  onDelete,
  commentVotes,
}: CommentNodeProps) {
  const { isAuthenticated } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorName = comment.author?.displayName || comment.author?.username || "Anonymous";
  const authorUsername = comment.author?.username || "unknown";
  const isAuthor = currentUserId && comment.author?.id === currentUserId;

  const handleSendReply = async () => {
    if (!replyText.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id, comment.parentId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group rounded-2xl border bg-white p-4 transition-all duration-200 hover:border-brand-brown-700/20 hover:shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {comment.author?.avatarUrl ? (
            <img
              src={comment.author.avatarUrl}
              alt={authorName}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-brand-sand"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-desert-light text-[11px] font-bold text-brand-brown-800">
              {initials(authorName)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-brown-950">
                {authorName}
              </span>
              {isTopAnswer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <Sparkles size={10} className="text-emerald-600" />
                  Top Comment
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              @{authorUsername} • {relativeTime(comment.createdAt)}
            </p>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete comment"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            {isDeleting ? (
              <Loader2 size={13} className="animate-spin text-red-500" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        )}
      </div>

      {/* Body */}
      <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-brand-brown-900">
        {comment.body}
      </p>

      {/* Action bar */}
      <div className="mt-3 flex items-center gap-2 border-t border-brand-sand/50 pt-2.5">
        {/* Vote controls */}
        <div className="flex items-center rounded-lg bg-brand-sand/50 p-0.5">
          <button
            onClick={() => onVote(comment.id, "UP")}
            aria-label="Upvote comment"
            className={`rounded p-1 transition-all ${
              currentUserVote === "UP"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950"
            }`}
          >
            <ArrowUp size={13} strokeWidth={currentUserVote === "UP" ? 2.5 : 2} />
          </button>

          <span
            className={`px-1.5 text-[11px] font-bold ${
              currentUserVote === "UP"
                ? "text-emerald-700"
                : currentUserVote === "DOWN"
                ? "text-rose-700"
                : "text-brand-brown-900"
            }`}
          >
            {comment.score}
          </span>

          <button
            onClick={() => onVote(comment.id, "DOWN")}
            aria-label="Downvote comment"
            className={`rounded p-1 transition-all ${
              currentUserVote === "DOWN"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950"
            }`}
          >
            <ArrowDown size={13} strokeWidth={currentUserVote === "DOWN" ? 2.5 : 2} />
          </button>
        </div>

        {/* Reply toggle */}
        {!comment.parentId && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              isReplying
                ? "bg-brand-desert-light text-brand-brown-950"
                : "text-brand-brown-700 hover:bg-brand-sand/60 hover:text-brand-brown-950"
            }`}
          >
            <CornerDownRight size={13} />
            <span>Reply</span>
            {comment.replies && comment.replies.length > 0 && (
              <span className="ml-0.5 rounded-full bg-brand-sand px-1.5 py-0.2 text-[10px] font-bold text-brand-brown-800">
                {comment.replies.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Inline Reply Composer */}
      {isReplying && (
        <div className="mt-3.5 rounded-xl border border-brand-sand bg-brand-sand/20 p-3">
          {isAuthenticated ? (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder={`Replying to @${authorUsername}...`}
                className="w-full resize-none rounded-lg border border-brand-sand bg-white p-2.5 text-xs text-brand-brown-900 placeholder:text-muted-foreground focus:border-brand-brown-700 focus:outline-none focus:ring-0"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText("");
                  }}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-brown-700 hover:bg-brand-sand/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSubmittingReply}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-brown-950 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmittingReply ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Replying...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Reply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-brand-brown-700 font-medium">
                Log in to reply to this comment
              </span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 rounded-lg bg-brand-brown-950 px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"
              >
                <LogIn size={12} />
                <span>Log In</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3.5 space-y-2.5 border-l-2 border-brand-sand pl-3 ml-2">
          {comment.replies.map((reply) => {
            const replyAuthorName = reply.author?.displayName || reply.author?.username || "Anonymous";
            const replyAuthorUsername = reply.author?.username || "unknown";
            const replyUserVote = commentVotes[reply.id] ?? null;
            const isReplyAuthor = currentUserId && reply.author?.id === currentUserId;

            return (
              <div
                key={reply.id}
                className="group/reply rounded-xl border border-brand-sand/70 bg-brand-sand/15 p-3 transition-colors hover:bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {reply.author?.avatarUrl ? (
                      <img
                        src={reply.author.avatarUrl}
                        alt={replyAuthorName}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-desert-light text-[9px] font-bold text-brand-brown-800">
                        {initials(replyAuthorName)}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-brand-brown-950">
                        {replyAuthorName}
                      </span>
                      <span className="ml-1.5 text-[10px] text-muted-foreground">
                        @{replyAuthorUsername} • {relativeTime(reply.createdAt)}
                      </span>
                    </div>
                  </div>

                  {isReplyAuthor && (
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this reply?")) {
                          onDelete(reply.id, comment.id);
                        }
                      }}
                      title="Delete reply"
                      className="rounded p-1 text-muted-foreground hover:text-red-600 opacity-0 group-hover/reply:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-brand-brown-900">
                  {reply.body}
                </p>

                {/* Reply Voting */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center rounded-md bg-white border border-brand-sand/60 p-0.5">
                    <button
                      onClick={() => onVote(reply.id, "UP")}
                      aria-label="Upvote reply"
                      className={`rounded p-0.5 transition-all ${
                        replyUserVote === "UP"
                          ? "bg-emerald-600 text-white"
                          : "text-brand-brown-700 hover:bg-brand-sand"
                      }`}
                    >
                      <ArrowUp size={12} strokeWidth={replyUserVote === "UP" ? 2.5 : 2} />
                    </button>
                    <span
                      className={`px-1 text-[10px] font-bold ${
                        replyUserVote === "UP"
                          ? "text-emerald-700"
                          : replyUserVote === "DOWN"
                          ? "text-rose-700"
                          : "text-brand-brown-900"
                      }`}
                    >
                      {reply.score}
                    </span>
                    <button
                      onClick={() => onVote(reply.id, "DOWN")}
                      aria-label="Downvote reply"
                      className={`rounded p-0.5 transition-all ${
                        replyUserVote === "DOWN"
                          ? "bg-rose-600 text-white"
                          : "text-brand-brown-700 hover:bg-brand-sand"
                      }`}
                    >
                      <ArrowDown size={12} strokeWidth={replyUserVote === "DOWN" ? 2.5 : 2} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Post Page Component
// ---------------------------------------------------------------------------

export default function PostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = params?.postId ?? "";

  const { user, isAuthenticated } = useAuth();

  // Post state
  const [post, setPost] = useState<PostItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voting state on post
  const [postVote, setPostVote] = useState<VoteValue | null>(null);
  const [postScore, setPostScore] = useState<number>(0);
  const [isVotingPost, setIsVotingPost] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentSort, setCommentSort] = useState<"newest" | "top" | "oldest">("top");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Comment votes map: commentId -> 'UP' | 'DOWN'
  const [commentVotes, setCommentVotes] = useState<Record<string, VoteValue>>({});

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "error" | "success" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 1. Fetch Post Data
  useEffect(() => {
    if (!postId) return;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    postsApi
      .getById(postId)
      .then((data) => {
        if (!cancelled) {
          setPost(data);
          setPostScore(data.score ?? 0);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(extractErrorMessage(err) || "Failed to load post.");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  // 2. Fetch User Vote States for Post and Comments (if authenticated)
  useEffect(() => {
    if (!postId || !isAuthenticated) {
      setPostVote(null);
      setCommentVotes({});
      return;
    }

    let cancelled = false;
    votesApi
      .getPostVotes(postId)
      .then((res) => {
        if (!cancelled) {
          setPostVote(res.postVote);
          setCommentVotes(res.commentVotes || {});
        }
      })
      .catch(() => {
        // Silently ignore if unauthenticated/fails
      });

    return () => {
      cancelled = true;
    };
  }, [postId, isAuthenticated]);

  // 3. Fetch Comments
  const loadComments = useCallback(async () => {
    if (!postId) return;
    setIsLoadingComments(true);
    try {
      const res = await commentsApi.list({
        postId,
        sort: commentSort,
        page: 1,
        limit: 50,
      });
      setComments(res.data || []);
    } catch (err: unknown) {
      showToast(extractErrorMessage(err) || "Failed to load comments", "error");
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId, commentSort, showToast]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ---------------------------------------------------------------------------
  // Post Voting Handler
  // ---------------------------------------------------------------------------

  const handlePostVote = async (value: VoteValue) => {
    if (!isAuthenticated) {
      showToast("Please log in to vote on posts.", "info");
      return;
    }
    if (isVotingPost || !post) return;

    setIsVotingPost(true);
    const prevVote = postVote;
    const prevScore = postScore;

    // Optimistic calculation
    let newVote: VoteValue | null = value;
    let scoreDelta = 0;

    if (prevVote === value) {
      // Toggle off
      newVote = null;
      scoreDelta = value === "UP" ? -1 : 1;
    } else if (prevVote === null) {
      // New vote
      newVote = value;
      scoreDelta = value === "UP" ? 1 : -1;
    } else {
      // Switch vote (UP <-> DOWN)
      newVote = value;
      scoreDelta = value === "UP" ? 2 : -2;
    }

    setPostVote(newVote);
    setPostScore((prev) => prev + scoreDelta);

    try {
      const res = await votesApi.vote({
        postId: post.id,
        value,
      });
      setPostVote(res.value);
    } catch (err: unknown) {
      // Rollback
      setPostVote(prevVote);
      setPostScore(prevScore);
      showToast(extractErrorMessage(err) || "Failed to submit vote", "error");
    } finally {
      setIsVotingPost(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Comment Voting Handler
  // ---------------------------------------------------------------------------

  const handleCommentVote = async (commentId: string, value: VoteValue) => {
    if (!isAuthenticated) {
      showToast("Please log in to vote on comments.", "info");
      return;
    }

    const currentVote = commentVotes[commentId] ?? null;
    let newVote: VoteValue | null = value;
    let scoreDelta = 0;

    if (currentVote === value) {
      newVote = null;
      scoreDelta = value === "UP" ? -1 : 1;
    } else if (currentVote === null) {
      newVote = value;
      scoreDelta = value === "UP" ? 1 : -1;
    } else {
      newVote = value;
      scoreDelta = value === "UP" ? 2 : -2;
    }

    // Helper to recursively update score in comment list
    const updateScore = (list: CommentItem[]): CommentItem[] => {
      return list.map((c) => {
        if (c.id === commentId) {
          return { ...c, score: c.score + scoreDelta };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateScore(c.replies) };
        }
        return c;
      });
    };

    // Optimistic updates
    setComments((prev) => updateScore(prev));
    setCommentVotes((prev) => {
      const next = { ...prev };
      if (newVote === null) {
        delete next[commentId];
      } else {
        next[commentId] = newVote;
      }
      return next;
    });

    try {
      const res = await votesApi.vote({
        commentId,
        value,
      });

      setCommentVotes((prev) => {
        const next = { ...prev };
        if (res.value === null) {
          delete next[commentId];
        } else {
          next[commentId] = res.value;
        }
        return next;
      });
    } catch (err: unknown) {
      // Rollback score
      const revertScore = (list: CommentItem[]): CommentItem[] => {
        return list.map((c) => {
          if (c.id === commentId) {
            return { ...c, score: c.score - scoreDelta };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: revertScore(c.replies) };
          }
          return c;
        });
      };
      setComments((prev) => revertScore(prev));
      setCommentVotes((prev) => {
        const next = { ...prev };
        if (currentVote === null) {
          delete next[commentId];
        } else {
          next[commentId] = currentVote;
        }
        return next;
      });
      showToast(extractErrorMessage(err) || "Failed to vote on comment", "error");
    }
  };

  // ---------------------------------------------------------------------------
  // Create Top-Level Comment Handler
  // ---------------------------------------------------------------------------

  const handleCreateComment = async () => {
    if (!newCommentText.trim() || isSubmittingComment || !post) return;
    if (!isAuthenticated) {
      showToast("Please log in to comment.", "info");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const created = await commentsApi.create({
        postId: post.id,
        body: newCommentText.trim(),
      });

      // Update comments list
      setComments((prev) => [created, ...prev]);
      setNewCommentText("");

      // Update post comment count
      setPost((prev) => (prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null));
      showToast("Comment posted successfully!", "success");
    } catch (err: unknown) {
      showToast(extractErrorMessage(err) || "Failed to post comment", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Create Reply Handler
  // ---------------------------------------------------------------------------

  const handleCreateReply = async (parentId: string, body: string) => {
    if (!body.trim() || !post) return;
    if (!isAuthenticated) {
      showToast("Please log in to reply.", "info");
      return;
    }

    try {
      const reply = await commentsApi.create({
        postId: post.id,
        parentId,
        body,
      });

      // Insert reply into parent comment
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), reply],
            };
          }
          return c;
        })
      );

      // Increment post comment count
      setPost((prev) => (prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null));
      showToast("Reply posted successfully!", "success");
    } catch (err: unknown) {
      showToast(extractErrorMessage(err) || "Failed to post reply", "error");
      throw err;
    }
  };

  // ---------------------------------------------------------------------------
  // Delete Comment Handler
  // ---------------------------------------------------------------------------

  const handleDeleteComment = async (commentId: string, parentId?: string | null) => {
    try {
      await commentsApi.remove(commentId);

      if (parentId) {
        // Remove nested reply
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).filter((r) => r.id !== commentId),
              };
            }
            return c;
          })
        );
      } else {
        // Remove top-level comment
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }

      setPost((prev) => (prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) } : null));
      showToast("Comment deleted", "info");
    } catch (err: unknown) {
      showToast(extractErrorMessage(err) || "Failed to delete comment", "error");
      throw err;
    }
  };

  // Top comment identification (highest score > 0)
  const topCommentId = useMemo(() => {
    if (comments.length === 0) return null;
    let highest: CommentItem | null = null;
    for (const c of comments) {
      if (c.score > 0 && (!highest || c.score > highest.score)) {
        highest = c;
      }
    }
    return highest ? highest.id : null;
  }, [comments]);

  const communityInitials = post ? initials(post.community?.name) : "";
  const document = post?.document as PostDocument | null;

  return (
    <AppShell>
      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-lg backdrop-blur-md ${
              toast.type === "error"
                ? "border border-red-200 bg-red-50/95 text-red-900"
                : toast.type === "success"
                ? "border border-emerald-200 bg-emerald-50/95 text-emerald-900"
                : "border border-brand-sand bg-brand-brown-950 text-white"
            }`}
          >
            {toast.type === "error" && <AlertCircle size={15} className="text-red-500 shrink-0" />}
            {toast.type === "success" && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 rounded p-0.5 opacity-70 hover:opacity-100"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main column */}
          <main className="min-w-0 space-y-4">
            {/* Post Card */}
            {isLoading ? (
              <PostSkeleton />
            ) : error ? (
              <PostError message={error} />
            ) : post && document ? (
              <article className="rounded-2xl border bg-white p-5 transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Author avatar + community badge */}
                    <div className="relative shrink-0">
                      {post.author?.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.displayName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sand text-xs font-bold text-brand-brown-800 ring-2 ring-white">
                          {initials(post.author?.displayName || post.author?.username)}
                        </div>
                      )}
                      <div
                        title={post.community?.name}
                        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md bg-brand-desert-light text-[9px] font-bold text-brand-brown-800 ring-2 ring-white"
                      >
                        {communityInitials}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 text-xs truncate">
                        <Link
                          href={`/community/${post.community?.slug}`}
                          className="font-bold text-brand-brown-950 hover:underline truncate"
                        >
                          {post.community?.name}
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground shrink-0">
                          {relativeTime(post.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <span>Posted by</span>
                        <span className="font-medium text-brand-brown-700 truncate">
                          @{post.author?.username}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-md bg-brand-sand/60 px-2 py-0.5 text-xs font-medium text-brand-brown-700"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post body */}
                <div className="mt-4">
                  <PostDocumentRenderer document={document} />
                </div>

                {/* Actions: Interactive Upvote/Downvote and Comment Count */}
                <div className="mt-5 flex items-center justify-between border-t border-brand-sand/50 pt-3">
                  <div className="flex items-center gap-3">
                    {/* Vote group */}
                    <div className="flex items-center rounded-xl bg-brand-sand/50 p-1">
                      <button
                        onClick={() => handlePostVote("UP")}
                        disabled={isVotingPost}
                        aria-label="Upvote post"
                        className={`flex items-center justify-center rounded-lg p-1.5 transition-all ${
                          postVote === "UP"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950"
                        }`}
                      >
                        <ArrowUp size={16} strokeWidth={postVote === "UP" ? 2.5 : 2} />
                      </button>

                      <span
                        className={`px-2.5 text-xs font-bold transition-colors ${
                          postVote === "UP"
                            ? "text-emerald-700"
                            : postVote === "DOWN"
                            ? "text-rose-700"
                            : "text-brand-brown-900"
                        }`}
                      >
                        {postScore}
                      </span>

                      <button
                        onClick={() => handlePostVote("DOWN")}
                        disabled={isVotingPost}
                        aria-label="Downvote post"
                        className={`flex items-center justify-center rounded-lg p-1.5 transition-all ${
                          postVote === "DOWN"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950"
                        }`}
                      >
                        <ArrowDown size={16} strokeWidth={postVote === "DOWN" ? 2.5 : 2} />
                      </button>
                    </div>

                    {/* Comment count */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-brand-sand/50 px-3 py-1.5 text-xs font-semibold text-brand-brown-700">
                      <MessageCircle size={15} />
                      <span>{post.commentCount ?? comments.length} Comments</span>
                    </div>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        showToast("Post link copied to clipboard!", "success");
                      }
                    }}
                    title="Copy share link"
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-brown-700 hover:bg-brand-sand/50 transition-colors"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </article>
            ) : null}

            {/* Comment Composer */}
            <div className="rounded-2xl border bg-white p-4 shadow-xs">
              {isAuthenticated ? (
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-desert-light text-[10px] font-bold text-brand-brown-800">
                        {initials(user?.displayName || user?.username)}
                      </div>
                    )}
                    <span className="text-xs font-bold text-brand-brown-950">
                      Commenting as {user?.displayName || user?.username}
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a constructive comment or answer..."
                    className="w-full resize-none rounded-xl border border-brand-sand bg-brand-sand/20 p-3 text-sm text-brand-brown-900 placeholder:text-muted-foreground focus:border-brand-brown-700 focus:bg-white focus:outline-none focus:ring-0 transition-colors"
                  />

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Markdown and clean formatting supported
                    </span>
                    <button
                      onClick={handleCreateComment}
                      disabled={!newCommentText.trim() || isSubmittingComment}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Comment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-desert-light text-brand-brown-800">
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-brown-950">
                        Join the conversation
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Sign in to leave a comment, reply, or vote.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    <LogIn size={14} />
                    <span>Log In</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Comments Stream */}
            <section className="space-y-4">
              {/* Header & Sort */}
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-brand-brown-950">
                  {post ? `${post.commentCount ?? comments.length} Comments` : "Comments"}
                </h2>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground hidden sm:inline">Sort by:</span>
                  <select
                    value={commentSort}
                    onChange={(e) => setCommentSort(e.target.value as any)}
                    className="rounded-lg border border-brand-sand bg-white px-2.5 py-1 text-xs font-semibold text-brand-brown-800 focus:outline-none cursor-pointer"
                  >
                    <option value="top">Top Comments</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Comments list */}
              {isLoadingComments ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="rounded-2xl border bg-white p-4 space-y-3 animate-pulse"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-brand-sand/70" />
                        <div className="space-y-1">
                          <div className="h-3 w-28 rounded bg-brand-sand/70" />
                          <div className="h-2 w-20 rounded bg-brand-sand/50" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-full rounded bg-brand-sand/60" />
                        <div className="h-2.5 w-4/5 rounded bg-brand-sand/50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-brand-sand bg-white/60 p-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-sand/50 text-brand-brown-700">
                    <MessageCircle size={20} />
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-brand-brown-950">
                    No comments yet
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Be the first to share your thoughts, answer questions, or add context!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentNode
                      key={comment.id}
                      comment={comment}
                      postId={post?.id || postId}
                      isTopAnswer={comment.id === topCommentId}
                      currentUserVote={commentVotes[comment.id] ?? null}
                      currentUserId={user?.id}
                      onVote={handleCommentVote}
                      onReply={handleCreateReply}
                      onDelete={handleDeleteComment}
                      commentVotes={commentVotes}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-4">
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-sand" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 rounded bg-brand-sand" />
                      <div className="h-2.5 w-16 rounded bg-brand-sand" />
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded bg-brand-sand" />
                  <div className="h-2.5 w-4/5 rounded bg-brand-sand" />
                </div>
              ) : post ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-desert-light text-xs font-bold text-brand-brown-800 shrink-0">
                      {communityInitials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-brand-brown-950">
                        {post.community?.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Official Community
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/community/${post.community?.slug}`}
                    className="mt-4 flex items-center justify-center w-full rounded-xl bg-brand-sand py-2.5 text-xs font-bold text-brand-brown-950 hover:bg-brand-desert-light transition-colors"
                  >
                    View Community
                  </Link>
                </>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}