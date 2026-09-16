import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
