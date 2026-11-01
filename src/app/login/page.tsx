import { LoginForm } from "@/components/auth/LoginForm";
import { GuestLanguageSelector } from "@/components/layout/GuestLanguageSelector";

export default function LoginPage() {
  return (
    <main
      className="
        relative min-h-screen
        overflow-hidden
        bg-brand-cream
        text-brand-brown-950
      "
    >
      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <GuestLanguageSelector />
      </div>

      {/* Soft ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute -left-40 -top-40
            h-[28rem] w-[28rem]
            rounded-full
            bg-brand-desert/10
            blur-[110px]
          "
        />

        <div
          className="
            absolute -bottom-48 -right-32
            h-[30rem] w-[30rem]
            rounded-full
            bg-brand-desert-light/20
            blur-[120px]
          "
        />

        <div
          className="
            absolute inset-0
            opacity-[0.025]
            [background-image:linear-gradient(to_right,#594e3f_1px,transparent_1px),linear-gradient(to_bottom,#594e3f_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <LoginForm />
      </div>
    </main>
  );
}