import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-cream">

      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">

        <LoginForm />

      </div>

    </main>
  );
}