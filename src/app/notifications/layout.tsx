import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
