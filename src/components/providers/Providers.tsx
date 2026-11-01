"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CreatePostCommunityProvider } from "@/context/CreatePostCommunityContext";
import { NotificationRealtimeProvider } from "@/context/NotificationRealtimeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CreatePostCommunityProvider>
          <NotificationRealtimeProvider>{children}</NotificationRealtimeProvider>
        </CreatePostCommunityProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
