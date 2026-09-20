"use client";

import {
  AlertCircle,
  ArrowRight,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Sparkles,
  Ticket,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { invitesApi } from "@/lib/api/invites";
import { extractErrorMessage } from "@/lib/api/errors";
import { PasswordStrength } from "./PasswordStrength";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Invite & Beta State
  const [isInviteOnly, setIsInviteOnly] = useState<boolean>(true);
  const [checkingInviteStatus, setCheckingInviteStatus] = useState<boolean>(true);
  const [validatingCode, setValidatingCode] = useState<boolean>(false);
  const [inviteFeedback, setInviteFeedback] = useState<{
    valid: boolean;
    message: string;
    label?: string | null;
    remainingUses?: number;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    inviteCode: "",
    agree: false,
  });

  // Check backend invite-only status on mount
  useEffect(() => {
    let mounted = true;
    async function loadStatus() {
      try {
        const res = await invitesApi.getStatus();
        if (mounted) {
          setIsInviteOnly(res.isInviteOnlyEnabled);
        }
      } catch {
        // Default to invite-only if check fails
        if (mounted) setIsInviteOnly(true);
      } finally {
        if (mounted) setCheckingInviteStatus(false);
      }
    }
    loadStatus();
    return () => {
      mounted = false;
    };
  }, []);

  // Pre-fill invite code from URL param (?invite=... or ?code=...)
  useEffect(() => {
    const codeParam = searchParams.get("invite") || searchParams.get("code");
    if (codeParam) {
      const cleanCode = codeParam.trim().toUpperCase();
      setForm((prev) => ({ ...prev, inviteCode: cleanCode }));
      validateCode(cleanCode);
    }
  }, [searchParams]);

  const validateCode = async (codeToTest: string) => {
    const trimmed = codeToTest.trim().toUpperCase();
    if (!trimmed) {
      setInviteFeedback(null);
      return;
    }

    setValidatingCode(true);
    try {
      const res = await invitesApi.validate(trimmed);
      setInviteFeedback({
        valid: true,
        message: "Invite code verified",
        label: res.label,
        remainingUses: res.remainingUses,
      });
    } catch (err) {
      const msg = extractErrorMessage(err, "Invalid or expired invite code");
      setInviteFeedback({
        valid: false,
        message: msg,
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const update = (
    field: keyof typeof form,
    value: string | boolean,
  ) => {
    if (errorMessage) {
      setErrorMessage(null);
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "inviteCode" && typeof value === "string") {
      const upper = value.trim().toUpperCase();
      if (!upper) {
        setInviteFeedback(null);
      }
    }
  };

  const handleInviteBlur = () => {
    if (form.inviteCode.trim()) {
      validateCode(form.inviteCode);
    }
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

  const isInviteValid =
    !isInviteOnly ||
    (Boolean(form.inviteCode.trim()) && inviteFeedback?.valid === true);

  const canSubmit =
    isNameValid &&
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    isInviteValid &&
    form.agree &&
    !isSubmitting &&
    !validatingCode;

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
        inviteCode: form.inviteCode.trim() ? form.inviteCode.trim().toUpperCase() : undefined,
      });

      setIsSuccess(true);
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
      {/* Mobile Branding */}
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
              alt="Terramids Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>

          <span className="text-xl font-bold tracking-tight text-brand-brown-950">
            Terramids
          </span>
        </Link>
      </div>

      {/* Beta Exclusive Badge & Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-900 shadow-2xs">
          <Sparkles size={13} className="text-amber-700" />
          <span>Closed Beta Access</span>
        </div>

        <h1
          className="
            mt-2.5
            text-3xl
            font-extrabold
            tracking-tight
            text-brand-brown-950
          "
        >
          Join the Beta
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-brand-brown-600">
          Sign up with your exclusive invitation link to test and help shape Terramids.
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
        className="mt-6 space-y-4"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Beta Invite Code Field */}
        <div className="rounded-xl border border-brand-sand-dark/70 bg-brand-sand/30 p-3.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="inviteCode"
              className="flex items-center gap-1.5 text-xs font-bold text-brand-brown-950"
            >
              <KeyRound size={14} className="text-brand-desert-dark" />
              <span>Beta Invite Code</span>
              {isInviteOnly && (
                <span className="rounded-full bg-brand-desert-light/60 px-1.5 py-0.2 text-[9px] font-bold uppercase text-brand-brown-900">
                  Required
                </span>
              )}
            </label>

            {form.inviteCode.trim() && (
              <button
                type="button"
                onClick={() => validateCode(form.inviteCode)}
                disabled={validatingCode || isSubmitting || isSuccess}
                className="text-[11px] font-semibold text-brand-desert-dark hover:underline disabled:opacity-50"
              >
                {validatingCode ? "Verifying..." : "Verify Code"}
              </button>
            )}
          </div>

          <div className="relative mt-1.5">
            <Ticket
              size={16}
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-brand-brown-600/50
              "
            />

            <input
              id="inviteCode"
              value={form.inviteCode}
              disabled={isSubmitting || isSuccess}
              onChange={(event) =>
                update("inviteCode", event.target.value.toUpperCase())
              }
              onBlur={handleInviteBlur}
              placeholder="e.g. BETA-7K9Q2M"
              autoComplete="off"
              maxLength={50}
              className="
                h-11 w-full
                rounded-xl
                border border-brand-sand-dark/80
                bg-white
                pl-10 pr-10
                text-sm
                font-mono
                font-semibold
                tracking-wider
                text-brand-brown-950
                outline-none
                transition-all
                placeholder:font-sans
                placeholder:font-normal
                placeholder:tracking-normal
                placeholder:text-brand-brown-600/40
                focus:border-brand-desert-dark
                focus:ring-2
                focus:ring-brand-desert-light/50
                disabled:bg-brand-sand/30
                disabled:cursor-not-allowed
              "
            />

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
              {validatingCode && (
                <Loader2 size={16} className="animate-spin text-brand-brown-600" />
              )}
              {!validatingCode && inviteFeedback?.valid && (
                <CheckCircle2 size={17} className="text-emerald-600" />
              )}
              {!validatingCode && inviteFeedback && !inviteFeedback.valid && (
                <AlertCircle size={17} className="text-red-500" />
              )}
            </div>
          </div>

          {/* Feedback Message */}
          {inviteFeedback && (
            <div
              className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                inviteFeedback.valid ? "text-emerald-700" : "text-red-600"
              }`}
            >
              <span>{inviteFeedback.message}</span>
              {inviteFeedback.label && (
                <span className="text-brand-brown-600">
                  • {inviteFeedback.label}
                </span>
              )}
              {inviteFeedback.remainingUses !== undefined && (
                <span className="text-brand-brown-600/80">
                  ({inviteFeedback.remainingUses} left)
                </span>
              )}
            </div>
          )}

          {!inviteFeedback && isInviteOnly && (
            <p className="mt-1.5 text-[11px] text-brand-brown-600/80">
              Paste the invite link or code you received from an administrator or beta tester.
            </p>
          )}
        </div>

        {/* Full Name Input */}
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
              <span>Join Beta & Create Account</span>
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