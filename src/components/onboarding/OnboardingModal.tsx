"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Compass,
  Loader2,
  Sparkles,
  Users,
  MessageSquare,
  Zap,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { communitiesApi } from "@/lib/api/communities";
import { CommunityDetail } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

const ONBOARDING_KEY = "terramids_onboarding_completed";
const MIN_COMMUNITIES = 5;

type OnboardingStep = "welcome" | "communities" | "complete";

/**
 * Checks whether onboarding has already been completed for a given user.
 */
function hasCompletedOnboarding(userId: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data[userId] === true;
  } catch {
    return false;
  }
}

/**
 * Marks onboarding as completed for a given user.
 */
function markOnboardingComplete(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[userId] = true;
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
  } catch {
    // Silently fail — not critical
  }
}

export interface OnboardingModalProps {
  onComplete?: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps = {}) {
  const { user } = useAuth();
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [communities, setCommunities] = useState<CommunityDetail[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [joiningAll, setJoiningAll] = useState(false);
  const [joinProgress, setJoinProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  // Determine whether to show onboarding
  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    // Already completed?
    if (hasCompletedOnboarding(user.id)) {
      setChecking(false);
      return;
    }

    // Check if user already has communities
    let mounted = true;
    async function check() {
      try {
        const joined = await communitiesApi.listJoined();
        if (mounted && joined.length === 0) {
          setVisible(true);
          // Trigger entrance animation
          requestAnimationFrame(() => {
            setAnimateIn(true);
          });
        } else if (mounted) {
          // Already has communities, mark as complete
          markOnboardingComplete(user!.id);
        }
      } catch {
        // If check fails, don't block the user
      } finally {
        if (mounted) setChecking(false);
      }
    }

    check();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Load communities when stepping to the community selection step
  useEffect(() => {
    if (step !== "communities") return;

    let mounted = true;
    async function load() {
      setLoadingCommunities(true);
      try {
        const all = await communitiesApi.listAll();
        if (mounted) {
          setCommunities(all);
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage(
            extractErrorMessage(err) || "Failed to load communities."
          );
        }
      } finally {
        if (mounted) setLoadingCommunities(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [step]);

  const toggleCommunity = useCallback((slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const handleJoinSelected = useCallback(async () => {
    if (selectedSlugs.size < MIN_COMMUNITIES) return;

    setJoiningAll(true);
    setErrorMessage(null);
    setJoinProgress(0);

    const slugArray = Array.from(selectedSlugs);
    let completed = 0;

    for (const slug of slugArray) {
      try {
        await communitiesApi.join(slug);
      } catch {
        // Some might already be joined, continue
      }
      completed++;
      setJoinProgress(Math.round((completed / slugArray.length) * 100));
    }

    setJoiningAll(false);
    setStep("complete");
  }, [selectedSlugs]);

  const handleFinish = useCallback(() => {
    if (user) {
      markOnboardingComplete(user.id);
    }
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        onComplete();
      } else {
        router.refresh();
      }
    }, 350);
  }, [user, router, onComplete]);

  const handleSkip = useCallback(() => {
    if (user) {
      markOnboardingComplete(user.id);
    }
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 350);
  }, [user, onComplete]);

  const selectedCount = selectedSlugs.size;

  if (checking || !visible || !user) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center
        transition-all duration-500 ease-out
        ${animateIn ? "bg-brand-brown-950/60 backdrop-blur-md" : "bg-transparent backdrop-blur-none"}
      `}
    >
      {/* Modal Panel */}
      <div
        className={`
          relative flex h-[90dvh] max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden
          rounded-3xl border border-brand-sand-dark/50
          bg-brand-cream shadow-2xl
          transition-all duration-500 ease-out
          sm:h-auto sm:max-h-[90vh]
          ${animateIn
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-8 scale-95 opacity-0"
          }
        `}
      >
        {/* Progress indicator */}
        <div className="flex gap-1.5 px-6 pt-5">
          {(["welcome", "communities", "complete"] as OnboardingStep[]).map(
            (s, i) => (
              <div
                key={s}
                className={`
                  h-1 flex-1 rounded-full transition-all duration-500
                  ${
                    i <=
                    ["welcome", "communities", "complete"].indexOf(step)
                      ? "bg-brand-desert"
                      : "bg-brand-sand-dark/50"
                  }
                `}
              />
            )
          )}
        </div>

        {/* Step content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {step === "welcome" && (
            <WelcomeStep
              displayName={user.displayName || user.username}
              onContinue={() => setStep("communities")}
            />
          )}

          {step === "communities" && (
            <CommunitiesStep
              communities={communities}
              loading={loadingCommunities}
              selectedSlugs={selectedSlugs}
              onToggle={toggleCommunity}
              selectedCount={selectedCount}
              minRequired={MIN_COMMUNITIES}
              joining={joiningAll}
              joinProgress={joinProgress}
              errorMessage={errorMessage}
              onJoin={handleJoinSelected}
              onSkip={handleSkip}
            />
          )}

          {step === "complete" && (
            <CompleteStep
              count={selectedCount}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   STEP 1 — Welcome
================================================================= */

function WelcomeStep({
  displayName,
  onContinue,
}: {
  displayName: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 pb-10 pt-8 text-center">
      {/* Animated icon cluster */}
      <div className="relative mb-6">
        <div
          className="
            flex h-20 w-20 items-center justify-center
            rounded-3xl bg-gradient-to-br from-brand-desert to-brand-desert-dark
            shadow-lg shadow-brand-desert/30
          "
          style={{ animation: "welcomePulse 2s ease-in-out infinite" }}
        >
          <Sparkles size={36} className="text-white" />
        </div>
        {/* Orbiting dots */}
        <div
          className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-brand-desert-light shadow-sm"
          style={{ animation: "orbitFloat 3s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-1 -left-3 h-3 w-3 rounded-full bg-brand-desert/60 shadow-sm"
          style={{ animation: "orbitFloat 3s ease-in-out 1s infinite" }}
        />
      </div>

      <h2 className="text-2xl font-black tracking-tight text-brand-brown-950 sm:text-3xl">
        Welcome to Terramids,{" "}
        <span className="text-brand-desert-dark">{displayName}</span>!
      </h2>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-brown-600">
        Your account is ready. Let's personalize your experience by joining a
        few communities that match your interests. This will populate your feed
        with relevant discussions.
      </p>

      {/* Feature highlights */}
      <div className="mt-8 grid w-full max-w-md gap-3">
        {[
          {
            icon: Compass,
            title: "Discover communities",
            desc: "Find the subjects you care about",
          },
          {
            icon: MessageSquare,
            title: "Engage in discussions",
            desc: "Join conversations that matter to you",
          },
          {
            icon: Zap,
            title: "Build your feed",
            desc: "Your home feed shows posts from communities you join",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="
              flex items-center gap-3.5 rounded-2xl
              border border-brand-sand-dark/60
              bg-white/70 px-4 py-3.5
              text-left backdrop-blur-sm
            "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-sand">
              <item.icon size={18} className="text-brand-brown-800" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-brown-950">
                {item.title}
              </p>
              <p className="mt-0.5 text-[11px] text-brand-brown-600">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="
          mt-8 inline-flex items-center gap-2
          rounded-2xl bg-brand-brown-950 px-8 py-3.5
          text-sm font-bold text-white shadow-lg
          shadow-brand-brown-950/20 transition-all
          hover:bg-brand-brown-900 hover:shadow-xl
          active:scale-[0.98]
        "
      >
        Choose Your Communities
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ================================================================
   STEP 2 — Community Selection
================================================================= */

function CommunitiesStep({
  communities,
  loading,
  selectedSlugs,
  onToggle,
  selectedCount,
  minRequired,
  joining,
  joinProgress,
  errorMessage,
  onJoin,
  onSkip,
}: {
  communities: CommunityDetail[];
  loading: boolean;
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  selectedCount: number;
  minRequired: number;
  joining: boolean;
  joinProgress: number;
  errorMessage: string | null;
  onJoin: () => void;
  onSkip: () => void;
}) {
  const canContinue = selectedCount >= minRequired && !joining;

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-0">
      {/* Header */}
      <div className="px-6 pt-6 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-desert/20">
            <Compass size={16} className="text-brand-desert-dark" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-brand-brown-950">
              Choose your communities
            </h2>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-brand-brown-600">
          Select at least {minRequired} communit{minRequired === 1 ? "y" : "ies"} to
          join. Your feed will show discussions from these communities.
        </p>

        {errorMessage && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Community grid */}
      <div
        className="mt-4 min-h-0 flex-1 overflow-y-auto px-6 pb-4 sm:px-8"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2
              size={28}
              className="animate-spin text-brand-desert-dark"
            />
            <p className="mt-3 text-xs font-semibold text-brand-brown-600">
              Loading communities...
            </p>
          </div>
        ) : communities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-brand-brown-700">
              No communities available yet.
            </p>
            <p className="mt-1 text-xs text-brand-brown-600">
              Communities are being set up. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {communities.map((community) => {
              const isSelected = selectedSlugs.has(community.slug);
              return (
                <CommunityCard
                  key={community.id}
                  community={community}
                  selected={isSelected}
                  disabled={joining}
                  onToggle={() => onToggle(community.slug)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 border-t border-brand-sand-dark/50 bg-brand-cream/95 px-6 py-4 backdrop-blur-sm sm:px-8">
        {joining ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-sand">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-desert to-brand-desert-dark transition-all duration-300"
                style={{ width: `${joinProgress}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-brand-brown-700">
              Joining communities... {joinProgress}%
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-xs text-brand-brown-600">
              {selectedCount === 0 ? (
                <span>Select at least {minRequired}</span>
              ) : (
                <span className="font-semibold text-brand-brown-900">
                  {selectedCount} selected
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onSkip}
                className="
                  inline-flex shrink-0 items-center gap-1 rounded-full
                  bg-brand-sand/80 px-3 py-1.5
                  text-[11px] font-semibold text-brand-brown-700
                  transition-all hover:bg-brand-sand-dark hover:text-brand-brown-950
                "
              >
                Skip for now
                <X size={12} />
              </button>

              <button
                type="button"
                disabled={!canContinue}
                onClick={onJoin}
                className={`
                  inline-flex items-center gap-2
                  rounded-2xl px-6 py-3
                  text-sm font-bold shadow-sm
                  transition-all
                  ${
                    canContinue
                      ? "bg-brand-brown-950 text-white hover:bg-brand-brown-900 hover:shadow-md active:scale-[0.98]"
                      : "cursor-not-allowed bg-brand-sand text-brand-brown-600/50"
                  }
                `}
              >
                Join {selectedCount > 0 ? selectedCount : ""} Communit
                {selectedCount === 1 ? "y" : "ies"}
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Community Card
================================================================= */

function CommunityCard({
  community,
  selected,
  disabled,
  onToggle,
}: {
  community: CommunityDetail;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const memberCount = community._count?.memberships ?? 0;
  const postCount = community._count?.posts ?? 0;

  // Generate initials from community name
  const initials = community.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`
        group relative flex items-start gap-3
        rounded-2xl border-2 p-3.5
        text-left transition-all duration-200
        ${
          selected
            ? "border-brand-desert bg-brand-desert-light/20 shadow-sm"
            : "border-brand-sand-dark/60 bg-white hover:border-brand-desert/50 hover:shadow-sm"
        }
        ${disabled ? "cursor-wait opacity-70" : "cursor-pointer active:scale-[0.98]"}
      `}
    >
      {/* Selection indicator */}
      <div
        className={`
          flex h-5 w-5 shrink-0 items-center justify-center
          rounded-md border-2 transition-all duration-200 mt-0.5
          ${
            selected
              ? "border-brand-desert-dark bg-brand-desert-dark"
              : "border-brand-sand-dark group-hover:border-brand-desert"
          }
        `}
      >
        {selected && <Check size={12} className="text-white" strokeWidth={3} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className={`
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-lg text-[10px] font-black transition-colors
              ${
                selected
                  ? "bg-brand-desert text-brand-brown-950"
                  : "bg-brand-sand text-brand-brown-700"
              }
            `}
          >
            {initials}
          </div>
          <h3 className="truncate text-sm font-bold text-brand-brown-950">
            {community.name}
          </h3>
        </div>

        {community.description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.5] text-brand-brown-600">
            {community.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-[10px] text-brand-brown-600/80">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {memberCount} citizen{memberCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={11} />
            {postCount} post{postCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ================================================================
   STEP 3 — Complete
================================================================= */

function CompleteStep({
  count,
  onFinish,
}: {
  count: number;
  onFinish: () => void;
}) {
  // Auto-trigger celebration animation
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCheck(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center px-8 pb-10 pt-10 text-center">
      {/* Success animation */}
      <div className="relative">
        <div
          className={`
            flex h-20 w-20 items-center justify-center
            rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600
            shadow-lg shadow-emerald-500/30
            transition-all duration-500
            ${showCheck ? "scale-100 opacity-100" : "scale-75 opacity-0"}
          `}
        >
          <Check size={40} className="text-white" strokeWidth={3} />
        </div>

        {/* Celebration particles */}
        {showCheck && (
          <>
            <div
              className="absolute -right-3 -top-3 h-3 w-3 rounded-full bg-brand-desert"
              style={{ animation: "celebrationBurst 0.6s ease-out forwards" }}
            />
            <div
              className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-emerald-300"
              style={{
                animation: "celebrationBurst 0.6s ease-out 0.1s forwards",
              }}
            />
            <div
              className="absolute -bottom-2 right-0 h-2 w-2 rounded-full bg-brand-desert-light"
              style={{
                animation: "celebrationBurst 0.6s ease-out 0.2s forwards",
              }}
            />
          </>
        )}
      </div>

      <h2
        className={`
          mt-6 text-2xl font-black tracking-tight text-brand-brown-950
          transition-all duration-500 delay-300
          ${showCheck ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        You're all set!
      </h2>

      <p
        className={`
          mt-2.5 max-w-sm text-sm leading-relaxed text-brand-brown-600
          transition-all duration-500 delay-500
          ${showCheck ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        You've joined{" "}
        <span className="font-bold text-brand-brown-900">{count}</span>{" "}
        communit{count === 1 ? "y" : "ies"}. Your feed is now
        personalized with discussions from these communities.
      </p>

      <button
        type="button"
        onClick={onFinish}
        className={`
          mt-8 inline-flex items-center gap-2
          rounded-2xl bg-brand-brown-950 px-8 py-3.5
          text-sm font-bold text-white shadow-lg
          shadow-brand-brown-950/20 transition-all
          delay-700
          hover:bg-brand-brown-900 hover:shadow-xl
          active:scale-[0.98]
          ${showCheck ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        Go to My Feed
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
