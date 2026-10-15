"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface CreatePostCommunityContextValue {
  communityId: string;
  setCommunityId: (id: string) => void;
}

const CreatePostCommunityContext =
  createContext<CreatePostCommunityContextValue | null>(null);

export function CreatePostCommunityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [communityId, setCommunityId] = useState("");

  return (
    <CreatePostCommunityContext.Provider value={{ communityId, setCommunityId }}>
      {children}
    </CreatePostCommunityContext.Provider>
  );
}

export function useCreatePostCommunity() {
  const context = useContext(CreatePostCommunityContext);
  if (!context) {
    throw new Error(
      "useCreatePostCommunity must be used within CreatePostCommunityProvider",
    );
  }
  return context;
}
