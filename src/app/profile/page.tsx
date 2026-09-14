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
  LogOut,
  MapPin,
  MessageSquare,
  Shield,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type NavTab = "overview" | "activity" | "security";

/* ─────────────────────────────────────────────────────────── helpers */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl border p-4 text-center transition-shadow hover:shadow-md ${
        accent
          ? "border-brand-desert-dark/30 bg-brand-desert/10"
          : "border-brand-sand-dark bg-white"
      }`}
    >
      <span
        className={`mb-1 ${accent ? "text-brand-desert-dark" : "text-brand-brown-600"}`}
      >
        {icon}
      </span>
      <span className="text-lg font-bold text-brand-brown-950">{value}</span>
      <span className="text-[11px] font-medium text-brand-brown-600">
        {label}
      </span>
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
  email: string;
  bio: string;
  location: string;
  website: string;
};

function OverviewTab({
  form,
  setForm,
  isSaved,
  isUpdating,
  onSave,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isSaved: boolean;
  isUpdating: boolean;
  onSave: (e: React.FormEvent) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Zap size={18} />}
          label="Reputation Points"
          value="1,240"
          accent
        />
        <StatCard icon={<MessageSquare size={16} />} label="Posts" value="38" />
        <StatCard icon={<ThumbsUp size={16} />} label="Upvotes" value="412" />
        <StatCard icon={<Award size={16} />} label="Communities" value="6" />
      </div>

      {/* Edit form */}
      <div className="rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xs sm:p-8">
        <SectionHeader
          title="Profile Information"
          description="Update your civic identity and contact preferences."
        />

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
                  setForm((f) => ({ ...f, displayName: e.target.value }))
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
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white pl-7 pr-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
                />
              </div>
            </FieldWrapper>
          </div>

          <FieldWrapper label="Email Address">
            <input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="h-11 w-full rounded-xl border border-brand-sand-dark/60 bg-white px-3.5 text-sm outline-none transition-all focus:border-brand-desert-dark focus:ring-4 focus:ring-brand-desert/20"
            />
          </FieldWrapper>

          <FieldWrapper
            label="Bio"
            hint="Brief description visible on your public profile."
          >
            <textarea
              id="profile-bio"
              rows={3}
              value={form.bio}
              onChange={(e) =>
                setForm((f) => ({ ...f, bio: e.target.value }))
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
                    setForm((f) => ({ ...f, location: e.target.value }))
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
                    setForm((f) => ({ ...f, website: e.target.value }))
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
                  <Check size={14} className="text-emerald-400" />
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

const ACTIVITY_ITEMS = [
  {
    tag: "Proposal",
    tagColor: "bg-amber-100 text-amber-800",
    title: "Supported Proposal #42",
    desc: "Approved scope definition for local transit improvements.",
    time: "2h ago",
    icon: <TrendingUp size={14} />,
  },
  {
    tag: "Discussion",
    tagColor: "bg-sky-100 text-sky-700",
    title: 'Posted in "Civic Tech"',
    desc: "How do we best structure open datasets for community maintenance?",
    time: "1d ago",
    icon: <MessageSquare size={14} />,
  },
  {
    tag: "Achievement",
    tagColor: "bg-emerald-100 text-emerald-700",
    title: "Earned Citizen Grade II",
    desc: "Reached 1,000 reputation points through community contributions.",
    time: "3d ago",
    icon: <Award size={14} />,
  },
  {
    tag: "Discussion",
    tagColor: "bg-sky-100 text-sky-700",
    title: 'Replied in "Open Infrastructure"',
    desc: "Shared a breakdown of the Austin water network proposal.",
    time: "5d ago",
    icon: <MessageSquare size={14} />,
  },
  {
    tag: "Proposal",
    tagColor: "bg-amber-100 text-amber-800",
    title: "Submitted Community Proposal",
    desc: 'Proposed "Sustainable Mobility" as a new community space.',
    time: "1w ago",
    icon: <TrendingUp size={14} />,
  },
];

function ActivityTab() {
  return (
    <div className="rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xs sm:p-8">
      <SectionHeader
        title="Recent Activity"
        description="Your contributions across communities and proposals."
      />

      <div className="space-y-3">
        {ACTIVITY_ITEMS.map((act, i) => (
          <div
            key={i}
            className="group flex items-start gap-4 rounded-xl border border-brand-sand-dark/40 p-4 transition-all hover:border-brand-sand-dark hover:bg-brand-sand/20 hover:shadow-sm"
          >
            {/* colored icon */}
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${act.tagColor}`}
            >
              {act.icon}
            </span>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${act.tagColor}`}
                >
                  {act.tag}
                </span>
                <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                  {act.time}
                </span>
              </div>
              <p className="text-xs font-bold text-brand-brown-950">
                {act.title}
              </p>
              <p className="text-xs leading-relaxed text-brand-brown-600">
                {act.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab({ onLogout }: { onLogout: () => void }) {
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  return (
    <div className="space-y-5">
      {/* Security settings card */}
      <div className="rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-xs sm:p-8">
        <SectionHeader
          title="Security & Account"
          description="Manage your password, authentication, and notification preferences."
        />

        <div className="divide-y divide-brand-sand-dark">
          {/* Password */}
          <div className="flex items-center justify-between py-4 first:pt-0">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-sand text-brand-brown-700">
                <Key size={15} />
              </span>
              <div>
                <p className="text-xs font-bold text-brand-brown-950">
                  Password
                </p>
                <p className="text-xs text-muted-foreground">
                  Last changed 3 months ago.
                </p>
              </div>
            </div>
            <Button
              id="security-update-password"
              variant="outline"
              className="h-9 rounded-xl border-brand-sand-dark text-xs"
            >
              Update
            </Button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-sand text-brand-brown-700">
                <Shield size={15} />
              </span>
              <div>
                <p className="text-xs font-bold text-brand-brown-950">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-muted-foreground">
                  {twoFaEnabled
                    ? "Enabled — your account has an extra layer of protection."
                    : "Secure your login with an authenticator app."}
                </p>
              </div>
            </div>
            <button
              id="security-toggle-2fa"
              type="button"
              onClick={() => setTwoFaEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                twoFaEnabled ? "bg-brand-brown-950" : "bg-brand-sand-dark"
              }`}
              role="switch"
              aria-checked={twoFaEnabled}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  twoFaEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Session alerts */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-sand text-brand-brown-700">
                <Zap size={15} />
              </span>
              <div>
                <p className="text-xs font-bold text-brand-brown-950">
                  Login Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Receive an email when a new session is opened.
                </p>
              </div>
            </div>
            <button
              id="security-toggle-login-alerts"
              type="button"
              onClick={() => setSessionAlerts((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                sessionAlerts ? "bg-brand-brown-950" : "bg-brand-sand-dark"
              }`}
              role="switch"
              aria-checked={sessionAlerts}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  sessionAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-500">
          Danger Zone
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          These actions are irreversible. Please proceed with care.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            id="security-sign-out"
            variant="outline"
            onClick={onLogout}
            className="h-9 rounded-xl border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <LogOut size={14} className="mr-1.5" />
            Sign Out
          </Button>
          <Button
            id="security-delete-account"
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
const NAV_TABS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Profile Info", icon: <User size={15} /> },
  {
    id: "activity",
    label: "Activity Feed",
    icon: <MessageSquare size={15} />,
  },
  { id: "security", label: "Security & Privacy", icon: <Key size={15} /> },
];

/* ─────────────────────────────────────────────────────────── page */
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [form, setForm] = useState<FormState>({
    displayName: "Jane Doe",
    username: "janedoe",
    email: "jane.doe@example.com",
    bio: "Passionate about open-source communities, civic tech, and sustainable local infrastructure.",
    location: "Austin, TX",
    website: "https://janedoe.dev",
  });

  const displayName = user?.displayName ?? form.displayName;
  const username = user?.username ?? form.username;
  const avatarUrl = user?.avatarUrl ?? null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }, 600);
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── Left: Profile card + nav ── */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 space-y-4">
            {/* Profile card */}
            <div className="overflow-hidden rounded-2xl border border-brand-sand-dark bg-white shadow-xs">
              {/* Gradient banner */}
              <div
                className="relative h-20 bg-gradient-to-br from-brand-desert-light via-brand-desert to-brand-desert-dark"
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,.12) 8px,rgba(255,255,255,.12) 9px)",
                  }}
                />
              </div>

              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="relative -mt-9 mb-3 inline-block">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt={displayName} />
                    )}
                    <AvatarFallback className="bg-brand-desert text-sm font-bold text-brand-brown-950">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Change avatar button */}
                  <button
                    id="profile-change-avatar"
                    type="button"
                    className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-brown-950 shadow-sm transition-opacity hover:opacity-80"
                    aria-label="Change avatar"
                  >
                    <Camera size={10} className="text-white" />
                  </button>
                </div>

                {/* Name / username */}
                <h1 className="text-base font-bold leading-tight text-brand-brown-950">
                  {displayName}
                </h1>
                <p className="text-xs text-brand-brown-600">@{username}</p>

                {/* Badge */}
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-desert/20 px-2.5 py-1 text-[11px] font-semibold text-brand-brown-900">
                  <Sparkles size={11} className="text-brand-desert-dark" />
                  Citizen Grade I
                </div>

                {/* Bio */}
                {(user?.bio ?? form.bio) && (
                  <p className="mt-3 text-xs leading-relaxed text-brand-brown-600">
                    {user?.bio ?? form.bio}
                  </p>
                )}

                {/* Meta */}
                <div className="mt-4 space-y-2 border-t border-brand-sand-dark/60 pt-3.5 text-xs">
                  <div className="flex items-center gap-2 text-brand-brown-600">
                    <MapPin size={12} className="shrink-0" />
                    <span>{form.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-brown-600">
                    <Globe size={12} className="shrink-0" />
                    <a
                      href={form.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-brand-brown-950 hover:underline"
                    >
                      janedoe.dev
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-brand-brown-600">
                    <Calendar size={12} className="shrink-0" />
                    <span>
                      Member since{" "}
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Mar 2024"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
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
                    className={`transition-opacity ${
                      activeTab === id ? "opacity-70" : "opacity-30"
                    }`}
                  />
                </button>
              ))}

              <div className="mx-2 my-1.5 h-px bg-brand-sand-dark/60" />

              <Link
                href="/settings"
                id="profile-settings-link"
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-brand-brown-700 hover:bg-brand-sand/60 hover:text-brand-brown-950"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles size={15} />
                  Preferences
                </span>
                <ChevronRight size={13} className="opacity-30" />
              </Link>

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

        {/* ── Right: Tab content ── */}
        <main className="lg:col-span-8 xl:col-span-9">
          {activeTab === "overview" && (
            <OverviewTab
              form={form}
              setForm={setForm}
              isSaved={isSaved}
              isUpdating={isUpdating}
              onSave={handleSave}
            />
          )}
          {activeTab === "activity" && <ActivityTab />}
          {activeTab === "security" && <SecurityTab onLogout={logout} />}
        </main>
      </div>
    </AppShell>
  );
}
