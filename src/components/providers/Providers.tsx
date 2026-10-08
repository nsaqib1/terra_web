"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationRealtimeProvider } from "@/context/NotificationRealtimeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationRealtimeProvider>{children}</NotificationRealtimeProvider>
    </AuthProvider>
  );
}
