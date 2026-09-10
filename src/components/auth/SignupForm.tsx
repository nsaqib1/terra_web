"use client";

import {
  AlertCircle,
  ArrowRight,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/api/errors";
import { PasswordStrength } from "./PasswordStrength";

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    agree: false,
  });

  const update = (
    field: keyof typeof form,
    value: string | boolean,
  ) => {
    // Clear error message when user starts making changes
    if (errorMessage) {
      setErrorMessage(null);
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isUsernameValid =
    form.username.trim().length >= 3 &&
    form.username.trim().length <= 30 &&
    /^[a-zA-Z0-9_.-]+$/.test(form.username.trim());
  const isNameValid =
    form.name.trim().length >= 2 && form.name.trim().length <= 100;
  const isPasswordValid =
    form.password.length >= 8 && form.password.length <= 128;

  const canSubmit =
    isNameValid &&
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    form.agree &&
    !isSubmitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signup({
        displayName: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setIsSuccess(true);
      // Give the user a brief visual feedback then navigate to home
      setTimeout(() => {
        router.push("/");
      }, 700);
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to create account. Please try again.");
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      {/* Mobile Branding (Clean & Consistent with Brand Panel) */}
      <div className="mb-8 lg:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5"
        >
          <div
            className="
              flex h-10 w-10
              items-center justify-center
              overflow-hidden
              rounded-xl
              bg-brand-desert
              shadow-sm
            "
          >
            <Image
              src="/logo.png"
              alt="Commons Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>

          <span className="text-xl font-bold tracking-tight text-brand-brown-950">
            Commons
          </span>
        </Link>
      </div>

      {/* Header Copy */}
      <div>
        <p
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-brand-desert-dark
          "
        >
          Get Started
        </p>

        <h1
          className="
            mt-1.5
            text-3xl
            font-extrabold
            tracking-tight
            text-brand-brown-950
          "
        >
          Create your account
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-brand-brown-600">
          Claim your unique handle and join vibrant, purpose-driven communities.
        </p>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div
          role="alert"
          className="
            mt-5
            flex items-start gap-3
            rounded-xl
            border border-red-200
            bg-red-50/90
            p-3.5
            text-sm
            text-red-800
            shadow-sm
            animate-in fade-in slide-in-from-top-1
          "
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {isSuccess && (
        <div
          role="status"
          className="
            mt-5
            flex items-center gap-3
            rounded-xl
            border border-emerald-200
            bg-emerald-50
            p-3.5
            text-sm
            font-medium
            text-emerald-800
            shadow-sm
            animate-in fade-in slide-in-from-top-1
          "
        >
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>Account created successfully! Redirecting...</span>
        </div>
      )}

      {/* Form Area */}
      <form
        className="mt-7 space-y-4"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-brand-brown-900"
          >
            Full Name
          </label>

          <div className="relative mt-1.5">
            <User
              size={16}
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-brand-brown-600/50
              "
            />

            <input
              id="name"
              value={form.name}
              disabled={isSubmitting || isSuccess}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Alex Morgan"
              autoComplete="name"
              maxLength={100}
              className="
                h-11 w-full
                rounded-xl
                border border-brand-sand-dark/60
                bg-white
                pl-10 pr-4
                text-sm
                text-brand-brown-950
                outline-none
                transition-all
                placeholder:text-brand-brown-600/40
                focus:border-brand-desert-dark
                focus:ring-2
                focus:ring-brand-desert-light/50
                disabled:bg-brand-sand/30
                disabled:cursor-not-allowed
              "
            />
          </div>
        </div>

        {/* Username Input */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="username"
              className="text-xs font-semibold text-brand-brown-900"
            >
              Username
            </label>
            <span className="text-[10px] text-brand-brown-600/70">
              Your unique handle (3-30 chars)
            </span>
          </div>

          <div className="relative mt-1.5">
            <AtSign
              size={15}
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-brand-brown-600/50
              "
            />

            <input
              id="username"
              value={form.username}
              disabled={isSubmitting || isSuccess}
              onChange={(event) =>
                update(
                  "username",
                  event.target.value.replace(/\s/g, "").toLowerCase(),
                )
              }
              placeholder="alexmorgan"
              autoComplete="username"
              maxLength={30}
              className="
                h-11 w-full
                rounded-xl
                border border-brand-sand-dark/60
                bg-white
                pl-10 pr-4
                text-sm
                text-brand-brown-950
                outline-none
                transition-all
                placeholder:text-brand-brown-600/40
                focus:border-brand-desert-dark
                focus:ring-2
                focus:ring-brand-desert-light/50
                disabled:bg-brand-sand/30
                disabled:cursor-not-allowed
              "
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-brand-brown-900"
          >
            Email Address
          </label>

          <div className="relative mt-1.5">
            <Mail
              size={16}
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-brand-brown-600/50
              "
            />

            <input
              id="email"
              type="email"
              value={form.email}
              disabled={isSubmitting || isSuccess}
              onChange={(event) => update("email", event.target.value)}
              placeholder="alex@example.com"
              autoComplete="email"
              maxLength={255}
              className="
                h-11 w-full
                rounded-xl
                border border-brand-sand-dark/60
                bg-white
                pl-10 pr-4
                text-sm
                text-brand-brown-950
                outline-none
                transition-all
                placeholder:text-brand-brown-600/40
                focus:border-brand-desert-dark
                focus:ring-2
                focus:ring-brand-desert-light/50
                disabled:bg-brand-sand/30
                disabled:cursor-not-allowed
              "
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-brand-brown-900"
          >
            Password
          </label>

          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              disabled={isSubmitting || isSuccess}
              onChange={(event) => update("password", event.target.value)}
              placeholder="Create a strong password (min 8 chars)"
              autoComplete="new-password"
              maxLength={128}
              className="
                h-11 w-full
                rounded-xl
                border border-brand-sand-dark/60
                bg-white
                pl-4 pr-11
                text-sm
                text-brand-brown-950
                outline-none
                transition-all
                placeholder:text-brand-brown-600/40
                focus:border-brand-desert-dark
                focus:ring-2
                focus:ring-brand-desert-light/50
                disabled:bg-brand-sand/30
                disabled:cursor-not-allowed
              "
            />

            <button
              type="button"
              disabled={isSubmitting || isSuccess}
              onClick={() => setShowPassword((current) => !current)}
              className="
                absolute right-3 top-1/2
                -translate-y-1/2
                rounded-md p-1
                text-brand-brown-600/60
                hover:bg-brand-sand
                hover:text-brand-brown-900
                disabled:opacity-40
              "
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <PasswordStrength password={form.password} />
        </div>

        {/* Terms Checkbox */}
        <label className="flex cursor-pointer items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            checked={form.agree}
            disabled={isSubmitting || isSuccess}
            onChange={(event) => update("agree", event.target.checked)}
            className="
              mt-0.5
              h-4 w-4
              rounded
              border-brand-sand-dark
              accent-brand-brown-950
              disabled:opacity-50
            "
          />

          <span className="text-xs leading-normal text-brand-brown-600">
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-semibold text-brand-brown-900 underline-offset-2 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-semibold text-brand-brown-900 underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {/* Submit Action */}
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting || isSuccess}
          className="
            mt-2
            h-11 w-full
            gap-2
            rounded-xl
            bg-brand-brown-950
            font-semibold
            text-white
            shadow-sm
            transition-all
            hover:bg-brand-brown-900
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Creating account...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span>Account Created!</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>

      {/* Login Switcher */}
      <div className="mt-6 text-center">
        <span className="text-xs text-brand-brown-600">
          Already have an account?
        </span>{" "}
        <Link
          href="/login"
          className="
            text-xs
            font-bold
            text-brand-brown-950
            hover:text-brand-desert-dark
            hover:underline
          "
        >
          Log in
        </Link>
      </div>
    </div>
  );
}