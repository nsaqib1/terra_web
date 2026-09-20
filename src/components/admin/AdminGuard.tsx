"use client";

import { AlertTriangle, ArrowLeft, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signup");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-brand-desert-dark" />
        <p className="text-sm font-medium text-brand-brown-600">
          Verifying administrator permissions...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-brand-sand-dark bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Lock size={26} />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-brand-brown-950">
            Administrator Access Required
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-brand-brown-600">
            {isAuthenticated
              ? "Your account does not have administrator privileges to access this area."
              : "You must be signed in with an administrator account to view the admin console."}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            {!isAuthenticated ? (
              <Link href="/login" className="w-full">
                <Button className="h-11 w-full rounded-xl bg-brand-brown-950 font-semibold text-white hover:bg-brand-brown-900">
                  Log in as Admin
                </Button>
              </Link>
            ) : null}

            <Link href="/" className="w-full">
              <Button
                variant="outline"
                className="h-11 w-full gap-2 rounded-xl border-brand-sand-dark font-medium text-brand-brown-800 hover:bg-brand-sand"
              >
                <ArrowLeft size={16} />
                Return to Terramids
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
