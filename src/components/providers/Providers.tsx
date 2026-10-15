"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CreatePostCommunityProvider } from "@/context/CreatePostCommunityContext";
import { NotificationRealtimeProvider } from "@/context/NotificationRealtimeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CreatePostCommunityProvider>
        <NotificationRealtimeProvider>{children}</NotificationRealtimeProvider>
      </CreatePostCommunityProvider>
    </AuthProvider>
  );
}
