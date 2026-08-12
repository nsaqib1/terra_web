"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { PasswordStrength } from "./PasswordStrength";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);

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
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const canSubmit =
    form.name.trim().length >= 2 &&
    form.username.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length >= 8 &&
    form.agree;

  return (
    <div className="w-full max-w-[460px]">

      {/* Mobile logo */}
      <div className="mb-10 lg:hidden">
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
            "
          >
            <span className="text-lg">🐪</span>
          </div>

          <span className="text-lg font-bold text-brand-brown-950">
            Commons
          </span>
        </Link>
      </div>

      {/* Heading */}
      <div>
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-brand-desert-dark
          "
        >
          Join the community
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
          Become a Citizen
        </h1>

        <p className="mt-2 text-sm leading-6 text-brand-brown-600">
          Create your identity and join communities built around the
          things you care about.
        </p>
      </div>

      {/* Form */}
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();

          if (!canSubmit) {
            return;
          }

          // Authentication API will be connected later.
          console.log("Signup", form);
        }}
      >

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="text-xs font-semibold text-brand-brown-900"
          >
            Your name
          </label>

          <div className="relative mt-2">

            <User
              size={16}
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <input
              id="name"
              value={form.name}
              onChange={(event) =>
                update("name", event.target.value)
              }
              placeholder="Alex Morgan"
              autoComplete="name"
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

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="text-xs font-semibold text-brand-brown-900"
          >
            Username
          </label>

          <p className="mt-1 text-[10px] text-muted-foreground">
            This is how other citizens will identify you.
          </p>

          <div className="relative mt-2">

            <span
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-sm font-medium
                text-muted-foreground
              "
            >
              @
            </span>

            <input
              id="username"
              value={form.username}
              onChange={(event) =>
                update(
                  "username",
                  event.target.value
                    .replace(/\s/g, "")
                    .toLowerCase(),
                )
              }
              placeholder="alexmorgan"
              autoComplete="username"
              className="
                h-12 w-full
                rounded-xl
                border
                bg-white
                pl-9 pr-4
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

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="text-xs font-semibold text-brand-brown-900"
          >
            Email address
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
              id="email"
              type="email"
              value={form.email}
              onChange={(event) =>
                update("email", event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
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
          <label
            htmlFor="password"
            className="text-xs font-semibold text-brand-brown-900"
          >
            Password
          </label>

          <div className="relative mt-2">

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                update("password", event.target.value)
              }
              placeholder="Create a secure password"
              autoComplete="new-password"
              className="
                h-12 w-full
                rounded-xl
                border
                bg-white
                px-4 pr-11
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

          <PasswordStrength password={form.password} />
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-3">

          <input
            type="checkbox"
            checked={form.agree}
            onChange={(event) =>
              update("agree", event.target.checked)
            }
            className="
              mt-0.5
              h-4 w-4
              rounded
              border-brand-sand-dark
              accent-brand-brown-950
            "
          />

          <span className="text-[11px] leading-5 text-muted-foreground">
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-semibold text-brand-brown-800 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-semibold text-brand-brown-800 hover:underline"
            >
              Privacy Policy
            </Link>
            .
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
            transition-all
            hover:bg-brand-brown-800
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Become a Citizen
          <ArrowRight size={16} />
        </Button>

      </form>

      {/* Login */}
      <div className="mt-7 text-center">

        <span className="text-xs text-muted-foreground">
          Already a citizen?
        </span>{" "}

        <Link
          href="/login"
          className="
            text-xs
            font-bold
            text-brand-brown-900
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