"use client";

import {
  Award,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  ExternalLink,
  Globe,
  Key,
  LayoutList,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  Pyramid,
  Shield,
  ThumbsUp,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usersApi } from "@/lib/api/users";
import { UserProfileResponse, UserStats } from "@/lib/api/types";
import { AvatarUploadModal } from "@/components/profile/AvatarUploadModal";

type NavTab = "profile" | "security" | "privacy";

/* ─────────────────────────────────────────────────────────── helpers */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function EditableProfileHeader({
  displayName,
  username,
  avatarUrl,
  bio,
  location,
  website,
  joinedDate,
  onOpenAvatarModal,
}: {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  location: string;
  website: string;
  joinedDate: string;
  onOpenAvatarModal?: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-brand-sand-dark bg-white shadow-xs">
      {/* Cover */}
      <div className="relative h-40 sm:h-48 w-full bg-gradient-to-r from-[#e8cba2] via-[#e2b781] to-[#cf985e]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(#2f291f 1px, transparent 1px), radial-gradient(#2f291f 1px, #e2b781 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        />

        {/* Change cover */}
        <button
          id="profile-change-cover"
          type="button"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/85 text-brand-brown-950 shadow-sm backdrop-blur-md transition-colors hover:bg-white"
          aria-label="Change cover photo"
          title="Change cover photo"
        >
          <Camera size={15} />
        </button>
      </div>

      {/* Profile information */}
      <div className="relative px-5 pb-6 sm:px-8">
        <div className="-mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar with click & hover to edit */}
            <div className="relative shrink-0 group">
              <div
                onClick={onOpenAvatarModal}
                className="relative cursor-pointer rounded-full overflow-hidden"
                role="button"
                tabIndex={0}
                aria-label="Edit profile picture"
                title="Click to edit profile picture"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenAvatarModal?.();
                  }
                }}
              >
                <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-white shadow-md transition-transform duration-200 group-hover:scale-[1.02]">
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt={displayName}
                      className="rounded-full object-cover"
                    />
                  )}

                  <AvatarFallback className="rounded-full bg-brand-desert text-2xl font-bold text-brand-brown-950">
                    {getInitials(displayName || "User")}
                  </AvatarFallback>
                </Avatar>

                {/* Hover overlay with camera icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-2xs">
                  <Camera size={22} className="text-white drop-shadow-xs" />
                  <span className="text-[10px] font-semibold mt-1">Edit Photo</span>
                </div>
              </div>

              {/* Change profile picture button badge */}
              <button
                id="profile-change-avatar"
                type="button"
                onClick={onOpenAvatarModal}
                className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-brown-950 text-white shadow-md transition-all hover:bg-brand-desert-dark hover:scale-110 active:scale-95"
                aria-label="Change profile picture"
                title="Change profile picture (Crop, Rotate, Enhance)"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Identity */}
            <div className="pb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-brown-950">
                {displayName}
              </h1>

              <p className="mt-1 text-sm font-medium text-brand-brown-600">
                @{username}
              </p>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-brand-brown-800">
              {bio}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-y-2 border-t border-brand-sand-dark/60 pt-4 text-xs text-brand-brown-600">
            <div className="flex items-center gap-x-5 gap-y-2 flex-wrap">
              {location && (
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin
                    size={14}
                    className="text-brand-brown-500"
                  />
                  <span>{location}</span>
                </div>
              )}

              {website && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Globe
                    size={14}
                    className="text-brand-brown-500"
                  />

                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-brand-brown-900 hover:underline"
                  >
                    {website.replace(/^https?:\/\//, "")}
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>

            {/* Joined is pushed to the far right */}
            <div className="flex items-center gap-1.5 font-medium ml-auto">
              <Calendar
                size={14}
                className="text-brand-brown-500"
              />

              <span>Joined {joinedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string;
}) {
  const inner = (
    <>
      <span className="mb-1 text-brand-brown-600">
        {icon}
      </span>

      <span className="text-lg font-bold text-brand-brown-950">
        {value}
      </span>

      <span className="text-[11px] font-medium text-brand-brown-600">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex flex-col items-center gap-1 rounded-2xl border border-brand-sand-dark bg-white p-4 text-center transition-all hover:border-brand-desert-dark hover:shadow-xs"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-brand-sand-dark bg-white p-4 text-center">
      {inner}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 border-b border-brand-sand-dark pb-4">
      <h2 className="text-base font-bold text-brand-brown-950">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function FieldWrapper({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-brand-brown-900">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── tabs */

type FormState = {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
};

function ProfileInfoTab({
  form,
  setForm,
  points,
  stats,
  avatarUrl,
  displayName,
  isSaved,
  isUpdating,
  errorMessage,
  onSave,
  onOpenAvatarModal,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  points: number;
  stats: UserStats | null;
  avatarUrl: string | null;
  displayName: string;
  isSaved: boolean;
  isUpdating: boolean;
  errorMessage: string | null;
  onSave: (e: React.FormEvent) => void;
  onOpenAvatarModal?: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Zap size={18} />}
          label="Points"
          value={points.toLocaleString()}
        />

        <StatCard
          icon={<MessageSquare size={16} />}
          label="Posts"
          value={stats?.posts ?? 0}
          href="/posts/manage"
        />

        <StatCard
          icon={<ThumbsUp size={16} />}
          label="Upvotes"
          value={stats?.upvotes ?? 0}
        />

        <StatCard
          icon={<Pyramid size={16} />}
          label="Communities"
          value={stats?.communities ?? 0}
        />
      </div>

      {/* Edit form */}
      <div className="rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xs sm:p-8">
        <SectionHeader
          title="Profile Information"
          description="Update the information shown on your public profile."
        />

        {/* Profile Picture Management Card */}
        <div className="my-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-brand-sand-dark/70 bg-brand-cream/30 p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-full border-2 border-white bg-white shadow-xs">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  className="rounded-full object-cover"
                />
              )}
              <AvatarFallback className="rounded-full bg-brand-desert text-lg font-bold text-brand-brown-950">
                {getInitials(displayName || "User")}
              </AvatarFallback>
            </Avatar>

            <div>
              <h4 className="text-sm font-bold text-brand-brown-950">
                Profile Photo
              </h4>
              <p className="text-xs text-brand-brown-600 mt-0.5">
                Crop, rotate, zoom, and apply custom lighting filters.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={onOpenAvatarModal}
            className="h-9 rounded-xl bg-brand-brown-950 px-4 text-xs font-bold text-white hover:bg-brand-brown-800 transition-all gap-1.5 shadow-2xs"
          >
            <Camera size={14} />
            Change Photo
          </Button>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSave} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrapper
              label="Display Name"
              hint="Your public name shown across communities."
            >
              <input
                id="profile-display-name"
                type="text"
                value={form.displayName}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    displayName: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white px-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
              />
            </FieldWrapper>

            <FieldWrapper
              label="Username"
              hint="Used in your profile URL and @mentions."
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-brand-brown-600">
                  @
                </span>

                <input
                  id="profile-username"
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      username: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white pl-7 pr-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                />
              </div>
            </FieldWrapper>
          </div>

          <FieldWrapper
            label="Bio"
            hint="Brief description visible on your public profile."
          >
            <textarea
              id="profile-bio"
              rows={3}
              value={form.bio}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  bio: e.target.value,
                }))
              }
              className="w-full resize-none rounded-xl border border-brand-sand-dark/60 bg-white p-3.5 text-sm leading-relaxed outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
            />
          </FieldWrapper>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrapper label="Location">
              <div className="relative">
                <MapPin
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown-600"
                />

                <input
                  id="profile-location"
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      location: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white pl-9 pr-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                />
              </div>
            </FieldWrapper>

            <FieldWrapper label="Website URL">
              <div className="relative">
                <Globe
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown-600"
                />

                <input
                  id="profile-website"
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      website: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white pl-9 pr-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                />
              </div>
            </FieldWrapper>
          </div>

          <div className="flex items-center justify-end border-t border-brand-sand-dark pt-4">
            <Button
              id="profile-save-button"
              type="submit"
              disabled={isUpdating}
              className="h-10 rounded-xl bg-brand-brown-950 px-6 text-xs font-bold text-white transition-all hover:bg-brand-brown-800 disabled:opacity-50"
            >
              {isSaved ? (
                <span className="flex items-center gap-1.5">
                  <Check
                    size={14}
                    className="text-emerald-400"
                  />
                  Saved Successfully
                </span>
              ) : isUpdating ? (
                "Saving…"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityTab({ email }: { email?: string }) {
  const [activeForm, setActiveForm] = useState<
    "email" | "password" | null
  >(null);

  return (
    <div className="space-y-5">
      {/* Email */}
      <div className="rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-sand text-brand-brown-800">
              <Globe size={16} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-brand-brown-950">
                Email Address
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Your email is used for account access and important
                account notifications.
              </p>

              <p className="mt-3 text-xs font-semibold text-brand-brown-800">
                {email || "Not available"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setActiveForm(
                activeForm === "email" ? null : "email"
              )
            }
            className="h-9 shrink-0 rounded-xl border-brand-sand-dark text-xs font-semibold gap-1.5 transition-all"
          >
            <span>Change</span>
            <ChevronRight
              size={14}
              className={`transition-transform duration-300 ${
                activeForm === "email" ? "rotate-90" : "rotate-0"
              }`}
            />
          </Button>
        </div>

        {/* Expand/Collapse Container */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            activeForm === "email"
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-6 border-t border-brand-sand-dark pt-6">
              <div className="space-y-4">
                <FieldWrapper
                  label="New Email Address"
                  hint="You'll need to verify the new email address."
                >
                  <input
                    type="email"
                    placeholder="new-email@example.com"
                    className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white px-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                  />
                </FieldWrapper>

                <FieldWrapper label="Current Password">
                  <input
                    type="password"
                    placeholder="Enter your current password"
                    className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white px-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                  />
                </FieldWrapper>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveForm(null)}
                    className="h-9 rounded-xl border-brand-sand-dark text-xs"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    className="h-9 rounded-xl bg-brand-brown-950 px-5 text-xs font-bold text-white hover:bg-brand-brown-800"
                  >
                    Update Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-sand text-brand-brown-800">
              <Key size={16} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-brand-brown-950">
                Password
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Change your password to keep your account secure.
              </p>

              <p className="mt-3 text-xs font-medium text-muted-foreground">
                Managed via account security settings.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setActiveForm(
                activeForm === "password" ? null : "password"
              )
            }
            className="h-9 shrink-0 rounded-xl border-brand-sand-dark text-xs font-semibold gap-1.5 transition-all"
          >
            <span>Change</span>
            <ChevronRight
              size={14}
              className={`transition-transform duration-300 ${
                activeForm === "password" ? "rotate-90" : "rotate-0"
              }`}
            />
          </Button>
        </div>

        {/* Expand/Collapse Container */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            activeForm === "password"
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-6 border-t border-brand-sand-dark pt-6">
              <div className="space-y-4">
                <FieldWrapper label="Current Password">
                  <input
                    type="password"
                    placeholder="Enter your current password"
                    className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white px-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                  />
                </FieldWrapper>

                <FieldWrapper label="New Password">
                  <input
                    type="password"
                    placeholder="Enter a new password"
                    className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white px-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                  />
                </FieldWrapper>

                <FieldWrapper label="Confirm New Password">
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white px-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                  />
                </FieldWrapper>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveForm(null)}
                    className="h-9 rounded-xl border-brand-sand-dark text-xs"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    className="h-9 rounded-xl bg-brand-brown-950 px-5 text-xs font-bold text-white hover:bg-brand-brown-800"
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyAccountTab() {
  return (
    <div className="space-y-5">
      {/* Disable account */}
      <div className="rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xs sm:p-8">
        <h3 className="text-sm font-bold text-brand-brown-950">
          Disable Account
        </h3>

        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-brand-brown-600">
          Temporarily disable your account. Your profile and
          contributions will no longer be active until you
          choose to return.
        </p>

        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl border-brand-sand-dark text-xs font-semibold"
          >
            Disable Account
          </Button>
        </div>
      </div>

      {/* Delete account */}
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 sm:p-8">
        <h3 className="text-sm font-bold text-red-800">
          Delete Account
        </h3>

        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-red-700/80">
          Permanently delete your account and associated personal
          information. This action cannot be undone.
        </p>

        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── sidebar nav */
const NAV_TABS: {
  id: NavTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "profile",
    label: "Profile Info",
    icon: <User size={15} />,
  },
  {
    id: "security",
    label: "Security",
    icon: <Key size={15} />,
  },
  {
    id: "privacy",
    label: "Privacy & Account",
    icon: <Shield size={15} />,
  },
];

/* ─────────────────────────────────────────────────────────── page */
export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("profile");
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);

  const [form, setForm] = useState<FormState>({
    displayName: "",
    username: "",
    bio: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      try {
        setIsLoadingProfile(true);
        const data = await usersApi.getProfile(user.id);
        setProfileData(data);
        setForm({
          displayName: data.user.displayName || "",
          username: data.user.username || "",
          bio: data.user.bio || "",
          location: data.user.location || "",
          website: data.user.website || "",
        });
      } catch (err) {
        // Fallback to auth user state
        setForm({
          displayName: user.displayName || "",
          username: user.username || "",
          bio: user.bio || "",
          location: user.location || "",
          website: user.website || "",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user?.id]);

  const displayName = form.displayName || profileData?.user.displayName || user?.displayName || "";
  const username = form.username || profileData?.user.username || user?.username || "";
  const avatarUrl = profileData?.user.avatarUrl || user?.avatarUrl || null;
  const bio = form.bio || profileData?.user.bio || user?.bio || "";
  const location = form.location || profileData?.user.location || user?.location || "";
  const website = form.website || profileData?.user.website || user?.website || "";
  const points = profileData?.user.points ?? user?.points ?? 0;
  const createdAt = profileData?.user.createdAt || user?.createdAt;

  const handleAvatarUpdated = (newAvatarUrl: string | null) => {
    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            user: {
              ...prev.user,
              avatarUrl: newAvatarUrl,
            },
          }
        : null
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const res = await usersApi.updateProfile({
        displayName: form.displayName,
        username: form.username,
        bio: form.bio || null,
        location: form.location || null,
        website: form.website || null,
      });

      setProfileData((prev) => (prev ? { ...prev, user: res.user } : null));

      // Update auth context state to reflect changes across the application
      setUser((prev) =>
        prev
          ? {
              ...prev,
              displayName: res.user.displayName,
              username: res.user.username,
              avatarUrl: res.user.avatarUrl,
              bio: res.user.bio,
              location: res.user.location,
              website: res.user.website,
              points: res.user.points,
            }
          : null
      );

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* =========================================================
          PROFILE HEADER
      ========================================================= */}
        <EditableProfileHeader
          displayName={displayName}
          username={username}
          avatarUrl={avatarUrl}
          bio={bio}
          location={location}
          website={website}
          onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
          joinedDate={
            createdAt
              ? new Date(createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Recent"
          }
        />

        {/* =========================================================
          PROFILE CONTENT
      ========================================================= */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main content */}
          <main className="lg:col-span-9 xl:col-span-9">
            {activeTab === "profile" && (
              <ProfileInfoTab
                form={form}
                setForm={setForm}
                points={points}
                stats={profileData?.stats ?? null}
                avatarUrl={avatarUrl}
                displayName={displayName}
                isSaved={isSaved}
                isUpdating={isUpdating}
                errorMessage={errorMessage}
                onSave={handleSave}
                onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
              />
            )}

            {activeTab === "security" && <SecurityTab email={user?.email} />}

            {activeTab === "privacy" && <PrivacyAccountTab />}
          </main>

          {/* Right navigation */}
          <aside className="lg:col-span-3 xl:col-span-3">
            <div className="sticky top-24">
              <nav className="overflow-hidden rounded-2xl border border-brand-sand-dark bg-white p-2 shadow-xs">
                {NAV_TABS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    id={`profile-tab-${id}`}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      activeTab === id
                        ? "bg-brand-brown-950 text-white shadow-sm"
                        : "text-brand-brown-700 hover:bg-brand-sand/60 hover:text-brand-brown-950"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {icon}
                      {label}
                    </span>

                    <ChevronRight
                      size={13}
                      className={
                        activeTab === id ? "opacity-70" : "opacity-30"
                      }
                    />
                  </button>
                ))}
                <div className="mx-2 my-1.5 h-px bg-brand-sand-dark/60" />

                <Link
                  href="/posts/manage"
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-brand-brown-700 hover:bg-brand-sand/60 hover:text-brand-brown-950 transition-all"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutList size={15} />
                    Manage My Posts
                  </span>
                  <ChevronRight size={13} className="opacity-30" />
                </Link>

                <div className="mx-2 my-1.5 h-px bg-brand-sand-dark/60" />

                <button
                  id="profile-sign-out"
                  type="button"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>
        </div>
      </div>

      {/* Avatar upload & crop modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={avatarUrl}
        onAvatarUpdated={handleAvatarUpdated}
        userDisplayName={displayName}
      />
    </AppShell>
  );
}