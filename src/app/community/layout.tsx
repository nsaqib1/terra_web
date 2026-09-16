import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
