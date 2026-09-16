import { GuestRoute } from "@/components/auth/GuestRoute";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestRoute>{children}</GuestRoute>;
}
