"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    remember: false,
  });

  const update = (
    field: keyof typeof form,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const canSubmit =
    form.identifier.trim().length > 0 &&
    form.password.length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    // Authentication API will be connected later.
    console.log("Login", form);
  }

  return (
    <div className="w-full max-w-[430px]">

      {/* Logo */}
      <div className="flex justify-center">

        <Link
          href="/"
          className="
            flex h-14 w-14
            items-center justify-center
            overflow-hidden
            rounded-2xl
            bg-brand-desert
            shadow-sm
          "
        >
          <span className="text-2xl">🐪</span>
        </Link>

      </div>

      {/* Heading */}
      <div className="mt-7 text-center">

        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-brand-desert-dark
          "
        >
          Welcome back
        </p>

        <h1
          className="
            mt-2
            text-3xl
            font-bold
            tracking-[-0.035em]
            text-brand-brown-950
          "
        >
          Welcome back, Citizen
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brand-brown-600">
          Continue the conversations, communities, and ideas you care
          about.
        </p>

      </div>

      {/* Form Card */}
      <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-7">

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Identifier */}
          <div>

            <label
              htmlFor="identifier"
              className="text-xs font-semibold text-brand-brown-900"
            >
              Email or username
            </label>

            <div className="relative mt-2">

              <Mail
                size={16}
                className="
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <input
                id="identifier"
                type="text"
                value={form.identifier}
                onChange={(event) =>
                  update("identifier", event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="username"
                autoFocus
                className="
                  h-12 w-full
                  rounded-xl
                  border
                  bg-white
                  pl-10 pr-4
                  text-sm
                  text-brand-brown-950
                  outline-none
                  placeholder:text-brand-brown-600/40
                  focus:border-brand-desert-dark
                  focus:ring-4
                  focus:ring-brand-desert-light/50
                "
              />

            </div>

          </div>

          {/* Password */}
          <div>

            <div className="flex items-center justify-between">

              <label
                htmlFor="login-password"
                className="text-xs font-semibold text-brand-brown-900"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="
                  text-[11px]
                  font-semibold
                  text-brand-brown-700
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
                  text-muted-foreground
                "
              />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) =>
                  update("password", event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="
                  h-12 w-full
                  rounded-xl
                  border
                  bg-white
                  pl-10 pr-11
                  text-sm
                  text-brand-brown-950
                  outline-none
                  placeholder:text-brand-brown-600/40
                  focus:border-brand-desert-dark
                  focus:ring-4
                  focus:ring-brand-desert-light/50
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="
                  absolute right-3.5 top-1/2
                  -translate-y-1/2
                  rounded-lg p-1
                  text-muted-foreground
                  hover:bg-brand-sand
                  hover:text-brand-brown-900
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

          {/* Remember */}
          <label className="flex cursor-pointer items-center gap-2.5">

            <input
              type="checkbox"
              checked={form.remember}
              onChange={(event) =>
                update("remember", event.target.checked)
              }
              className="
                h-4 w-4
                rounded
                border-brand-sand-dark
                accent-brand-brown-950
              "
            />

            <span className="text-[11px] text-muted-foreground">
              Keep me signed in
            </span>

          </label>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!canSubmit}
            className="
              h-12 w-full
              gap-2
              rounded-xl
              bg-brand-brown-950
              font-semibold
              text-white
              shadow-none
              hover:bg-brand-brown-800
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Log in
            <ArrowRight size={16} />
          </Button>

        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">

          <div className="h-px flex-1 bg-brand-sand-dark" />

          <span className="text-[10px] text-muted-foreground">
            or
          </span>

          <div className="h-px flex-1 bg-brand-sand-dark" />

        </div>

        {/* Google */}
        <button
          type="button"
          className="
            flex h-11 w-full
            items-center justify-center gap-2.5
            rounded-xl
            border
            bg-white
            text-xs font-semibold
            text-brand-brown-800
            transition-colors
            hover:bg-brand-cream
          "
        >
          <GoogleIcon />
          Continue with Google
        </button>

      </div>

      {/* Signup */}
      <div className="mt-6 text-center">

        <span className="text-xs text-muted-foreground">
          New to Commons?
        </span>{" "}

        <Link
          href="/signup"
          className="
            text-xs
            font-bold
            text-brand-brown-900
            hover:text-brand-desert-dark
            hover:underline
          "
        >
          Become a Citizen
        </Link>

      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-center gap-4">

        <Link
          href="/privacy"
          className="text-[10px] text-muted-foreground hover:text-brand-brown-900"
        >
          Privacy
        </Link>

        <span className="text-[10px] text-brand-sand-dark">
          •
        </span>

        <Link
          href="/terms"
          className="text-[10px] text-muted-foreground hover:text-brand-brown-900"
        >
          Terms
        </Link>

      </div>

    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z"
      />

      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.29v2.52A9.75 9.75 0 0 0 12 21.75Z"
      />

      <path
        fill="#FBBC05"
        d="M6.53 13.85A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.27.31-1.85V7.63H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.37l3.24-2.52Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.12c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.18 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.38l3.24 2.52C7.3 7.84 9.46 6.12 12 6.12Z"
      />
    </svg>
  );
}