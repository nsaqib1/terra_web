"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { postsApi } from "@/lib/api/posts";
import { PostItem } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";
import { EditPostForm } from "@/components/post/edit/EditPostForm";

export default function EditPostPage() {
  const params = useParams();
  const postId = params.postId as string;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [post, setPost] = useState<PostItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    postsApi
      .getById(postId)
      .then((data) => {
        if (isMounted) {
          setPost(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(extractErrorMessage(err));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const isAuthor = Boolean(user && post && user.id === post.author.id);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-[1180px]">
          {isLoading || authLoading ? (
            <div className="rounded-2xl border border-brand-sand-dark/60 bg-white p-8 space-y-4 animate-pulse">
              <div className="h-6 w-32 rounded-lg bg-brand-sand" />
              <div className="h-10 w-3/4 rounded-xl bg-brand-sand" />
              <div className="h-48 w-full rounded-2xl bg-brand-sand/60" />
            </div>
          ) : error || !post ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center">
              <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
              <h2 className="text-base font-bold text-red-900">Unable to load post</h2>
              <p className="mt-1 text-xs text-red-700">{error || "Post not found"}</p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Link href="/posts/manage">
                  <Button variant="outline" className="rounded-xl text-xs font-semibold">
                    Manage Posts
                  </Button>
                </Link>
                <Button
                  onClick={() => router.refresh()}
                  className="rounded-xl bg-brand-brown-950 text-xs font-semibold text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : !isAuthor ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center">
              <ShieldAlert size={36} className="mx-auto text-amber-600 mb-3" />
              <h2 className="text-base font-bold text-amber-950">Permission Denied</h2>
              <p className="mt-1.5 max-w-md mx-auto text-xs text-amber-800">
                You can only edit posts that you have authored. This post belongs to{" "}
                <strong>@{post.author.username}</strong>.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Link href={`/posts/${post.id}`}>
                  <Button className="rounded-xl bg-brand-brown-950 text-xs font-semibold text-white">
                    View Post
                  </Button>
                </Link>
                <Link href="/posts/manage">
                  <Button variant="outline" className="rounded-xl text-xs font-semibold text-brand-brown-800">
                    Go to My Posts
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <EditPostForm post={post} />
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
