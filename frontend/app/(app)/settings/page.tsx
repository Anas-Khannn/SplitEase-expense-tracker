"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLogout } from "@/hooks/mutations/useLogout";
import { LogoutConfirmationDialog } from "@/components/shared/LogoutConfirmationDialog";
import { SettingsPageSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  User,
  Sliders,
  Shield,
  Bell,
  HelpCircle,
  AlertTriangle,
  Monitor,
  Sun,
  Moon,
  LogOut,
  Check,
  Copy,
} from "lucide-react";

type SettingsTab = "account" | "general" | "security" | "notifications" | "support" | "danger";
type ThemePreference = "system" | "light" | "dark";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Monitor }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en-US");

  const currentTheme = (theme as ThemePreference) || "system";

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SE";

  const splitEaseTag = user?.name
    ? `@${user.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`
    : "@user";

  const handleCopyTag = () => {
    navigator.clipboard.writeText(splitEaseTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        router.push("/login");
      },
    });
  };

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full pb-16">
      {/* Title Heading matching Stitch */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-headline">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account preferences, appearance, and security.
        </p>
      </div>

      {/* 2-Column Settings Layout matching Stitch */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sub-Navigation (~220px) */}
        <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-24 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer text-left",
              activeTab === "account"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border-l-2 border-zinc-900 dark:border-zinc-100"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
          >
            <User className="size-4 shrink-0" />
            <span>Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer text-left",
              activeTab === "general"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border-l-2 border-zinc-900 dark:border-zinc-100"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
          >
            <Sliders className="size-4 shrink-0" />
            <span>General</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer text-left",
              activeTab === "security"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border-l-2 border-zinc-900 dark:border-zinc-100"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
          >
            <Shield className="size-4 shrink-0" />
            <span>Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer text-left",
              activeTab === "notifications"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border-l-2 border-zinc-900 dark:border-zinc-100"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
          >
            <Bell className="size-4 shrink-0" />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("support")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer text-left",
              activeTab === "support"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border-l-2 border-zinc-900 dark:border-zinc-100"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
          >
            <HelpCircle className="size-4 shrink-0" />
            <span>Support</span>
          </button>

          <div className="pt-3 my-2 border-t border-zinc-200 dark:border-zinc-800" />

          <button
            type="button"
            onClick={() => setActiveTab("danger")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40",
              activeTab === "danger" && "bg-rose-50 dark:bg-rose-950/50 font-semibold border-l-2 border-rose-600"
            )}
          >
            <AlertTriangle className="size-4 shrink-0" />
            <span>Danger zone</span>
          </button>
        </aside>

        {/* Right Main Settings Stack */}
        <div className="flex-1 w-full space-y-6">
          {/* TAB 1: ACCOUNT */}
          {activeTab === "account" && (
            <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
                  Account Details
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Your identity across shared groups and personal credentials.
                </p>
              </div>

              {/* Avatar Row */}
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-base shadow-xs">
                  {userInitials}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {user?.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Detail fields */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 border-t border-zinc-100 dark:border-zinc-800">
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Full name
                  </span>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {user?.name}
                  </span>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Email address
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {user?.email}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    SplitEase tag
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      {splitEaseTag}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTag}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      title="Copy SplitEase tag"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: GENERAL / APPEARANCE */}
          {activeTab === "general" && (
            <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
                  General &amp; Appearance
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Configure default currency, language, and interface theme.
                </p>
              </div>

              {/* Theme selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Theme Appearance
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEME_OPTIONS.map((opt) => {
                    const selected = currentTheme === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                          "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
                          selected
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
                            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        )}
                      >
                        <Icon className="size-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Currency */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer w-64"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                </select>
              </div>

              {/* Display Language */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Display Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer w-64"
                >
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </section>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === "security" && (
            <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
                  Security &amp; Sessions
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Manage active browser sessions and account authentication.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Current Active Session
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Logged in from your current web browser.
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200">
                    Active now
                  </span>
                </div>

                <div className="pt-3">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<LogOut />}
                    onClick={() => setLogoutOpen(true)}
                    loading={logout.isPending}
                  >
                    Log out of session
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
                  Notifications
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Control notifications for group expenses, settlements, and member invites.
                </p>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Expense notifications
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Notify when a new expense is logged in your groups.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="Toggle expense notifications"
                    className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Debt settlement alerts
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Notify when a roommate records a payment or settles up.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="Toggle debt settlement alerts"
                    className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: SUPPORT */}
          {activeTab === "support" && (
            <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
                  Help &amp; Support
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Documentation, release notes, and community support.
                </p>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                SplitEase v2.4 provides multi-member expense sharing, pairwise debt simplification algorithms, and instant receipt logging.
              </p>
            </section>
          )}

          {/* TAB 6: DANGER ZONE */}
          {activeTab === "danger" && (
            <section className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 p-6 shadow-xs space-y-6">
              <div className="border-b border-rose-200 dark:border-rose-900/60 pb-4">
                <h2 className="text-base font-semibold text-rose-700 dark:text-rose-400 font-headline">
                  Danger Zone
                </h2>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                  Irreversible account actions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Sign out of account
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Log out of your current session across devices.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setLogoutOpen(true)}
                  loading={logout.isPending}
                >
                  Log out
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      <LogoutConfirmationDialog
        open={logoutOpen}
        onClose={() => {
          if (logout.isPending) return;
          setLogoutOpen(false);
        }}
        onConfirm={handleLogout}
        loading={logout.isPending}
      />
    </div>
  );
}
