"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage } from "@/lib/api/errors";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const update = (
    field: keyof typeof form,
    value: string,
  ) => {
    if (errorMessage) {
      setErrorMessage(null);
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const isIdentifierValid = form.identifier.trim().length >= 3;
  const isPasswordValid = form.password.length >= 8;

  const canSubmit =
    isIdentifierValid &&
    isPasswordValid &&
    !isSubmitting &&
    !isSuccess;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({
        identifier: form.identifier.trim(),
        password: form.password,
      });

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        "Invalid credentials. Please try again.",
      );

      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[430px]">
      {/* ================================================================
          HEADER
      ================================================================= */}
      <div className="text-center">
        <Link
          href="/"
          className="
            mx-auto
            flex h-14 w-14
            items-center justify-center
            overflow-hidden
            rounded-2xl
            bg-brand-desert
            shadow-sm
            ring-1 ring-brand-desert-dark/10
            transition-transform duration-200
            hover:scale-[1.03]
          "
          aria-label="Terramids home"
        >
          <Image
            src="/logo.png"
            alt="Terramids"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
        </Link>

        <div className="mt-6">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-brand-desert-dark
            "
          >
            Welcome back
          </p>

          <h1
            className="
              mt-2
              text-3xl
              font-black
              tracking-[-0.035em]
              text-brand-brown-950
            "
          >
            Log in to Terramids
          </h1>

          <p
            className="
              mx-auto
              mt-2
              max-w-sm
              text-sm
              leading-6
              text-brand-brown-600
            "
          >
            Pick up where you left off.
          </p>
        </div>
      </div>

      {/* ================================================================
          STATUS
      ================================================================= */}
      {errorMessage && (
        <div
          role="alert"
          className="
            mt-6
            flex items-start gap-3
            rounded-2xl
            border border-red-200
            bg-red-50/90
            p-3.5
            text-sm
            text-red-800
            shadow-sm
            animate-in
            fade-in
            slide-in-from-top-1
          "
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div className="flex-1 font-medium">
            {errorMessage}
          </div>
        </div>
      )}

      {isSuccess && (
        <div
          role="status"
          className="
            mt-6
            flex items-center gap-3
            rounded-2xl
            border border-emerald-200
            bg-emerald-50
            p-3.5
            text-sm
            font-medium
            text-emerald-800
            shadow-sm
            animate-in
            fade-in
            slide-in-from-top-1
          "
        >
          <CheckCircle2
            size={18}
            className="shrink-0 text-emerald-600"
          />

          <span>Logged in successfully. Taking you in...</span>
        </div>
      )}

      {/* ================================================================
          FORM
      ================================================================= */}
      <div
        className="
          mt-7
          rounded-[1.75rem]
          border border-brand-sand-dark
          bg-white/90
          p-5
          shadow-[0_20px_60px_rgba(47,41,31,0.08)]
          backdrop-blur-xl
          sm:p-7
        "
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          {/* Identifier */}
          <div>
            <label
              htmlFor="identifier"
              className="
                text-xs
                font-bold
                text-brand-brown-900
              "
            >
              Email or username
            </label>

            <div className="relative mt-2">
              <Mail
                size={16}
                className="
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-brand-brown-500
                "
              />

              <input
                id="identifier"
                type="text"
                value={form.identifier}
                disabled={isSubmitting || isSuccess}
                onChange={(event) =>
                  update("identifier", event.target.value)
                }
                placeholder="you@example.com or username"
                autoComplete="username"
                autoFocus
                className="
                  h-12
                  w-full
                  rounded-xl
                  border border-brand-sand-dark
                  bg-brand-cream/30
                  pl-10
                  pr-4
                  text-sm
                  text-brand-brown-950
                  outline-none
                  placeholder:text-brand-brown-500/45
                  transition
                  focus:border-brand-desert-dark
                  focus:bg-white
                  focus:ring-4
                  focus:ring-brand-desert-light/40
                  disabled:cursor-not-allowed
                  disabled:bg-brand-sand/30
                "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="
                  text-xs
                  font-bold
                  text-brand-brown-900
                "
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="
                  text-[11px]
                  font-semibold
                  text-brand-brown-600
                  transition
                  hover:text-brand-desert-dark
                  hover:underline
                "
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative mt-2">
              <LockKeyhole
                size={16}
                className="
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-brand-brown-500
                "
              />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                disabled={isSubmitting || isSuccess}
                onChange={(event) =>
                  update("password", event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="
                  h-12
                  w-full
                  rounded-xl
                  border border-brand-sand-dark
                  bg-brand-cream/30
                  pl-10
                  pr-11
                  text-sm
                  text-brand-brown-950
                  outline-none
                  placeholder:text-brand-brown-500/45
                  transition
                  focus:border-brand-desert-dark
                  focus:bg-white
                  focus:ring-4
                  focus:ring-brand-desert-light/40
                  disabled:cursor-not-allowed
                  disabled:bg-brand-sand/30
                "
              />

              <button
                type="button"
                disabled={isSubmitting || isSuccess}
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="
                  absolute right-3.5 top-1/2
                  -translate-y-1/2
                  rounded-lg p-1
                  text-brand-brown-500
                  transition
                  hover:bg-brand-sand
                  hover:text-brand-brown-900
                  disabled:opacity-40
                "
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || isSuccess}
            className="
              h-12
              w-full
              gap-2
              rounded-xl
              bg-brand-brown-950
              font-semibold
              text-white
              shadow-none
              transition
              hover:bg-brand-brown-800
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                <span>Logging in...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Logged in</span>
              </>
            ) : (
              <>
                <span>Log in</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* ================================================================
          SIGNUP
      ================================================================= */}
      <div className="mt-6 text-center">
        <p className="text-xs text-brand-brown-500">
          New to Terramids?
        </p>

        <Link
          href="/signup"
          className="
            mt-1
            inline-flex
            items-center
            gap-1
            text-sm
            font-bold
            text-brand-brown-900
            transition
            hover:text-brand-desert-dark
          "
        >
          Create your account
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Small continuity cue */}
      <p className="mt-8 text-center text-[10px] font-medium text-brand-brown-400">
        Your Communities are waiting.
      </p>
    </div>
  );
}