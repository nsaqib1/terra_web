import { Suspense } from "react";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <div className="flex min-h-screen">
        {/* Brand side */}
        <AuthBrandPanel />

        {/* Form side */}
        <section
          className="
            flex
            min-w-0
            flex-1
            items-center
            justify-center
            px-5
            py-10
            sm:px-8
            lg:px-12
            xl:px-20
          "
        >
          <Suspense fallback={<div className="w-full max-w-[440px] text-center text-brand-brown-600">Loading signup...</div>}>
            <SignupForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}