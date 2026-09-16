"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface GuestRouteProps {
  children: React.ReactNode;
}

function GuestRouteContent({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirect = searchParams.get("redirect") || "/";
      router.replace(redirect);
    }
  }, [isLoading, isAuthenticated, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-desert-dark" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: GuestRouteProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-cream">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-desert-dark" />
          </div>
        </div>
      }
    >
      <GuestRouteContent>{children}</GuestRouteContent>
    </Suspense>
  );
}
