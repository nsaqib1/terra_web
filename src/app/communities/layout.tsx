import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
