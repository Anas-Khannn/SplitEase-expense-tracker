"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLogout } from "@/hooks/mutations/useLogout";
import { useGroups } from "@/hooks/useGroups";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { ProfilePageSkeleton } from "@/components/skeletons";
import { formatCurrency, formatDate } from "@/lib/selectors";
import { LogoutConfirmationDialog } from "@/components/shared/LogoutConfirmationDialog";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Copy,
  Check,
  CheckCircle2,
  Camera,
  Edit2,
  Edit3,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  AtSign,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ThemePreference = "system" | "light" | "dark";

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { data: groups } = useGroups();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en-US");
  const [timezone, setTimezone] = useState("PT");
  const [expenseNotifs, setExpenseNotifs] = useState(true);
  const [paymentNotifs, setPaymentNotifs] = useState(true);
  const [digestNotifs, setDigestNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const currentTheme = (theme as ThemePreference) || "system";

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate();
  };

  const tag = user ? `@${user.name.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "@user";

  const handleCopyTag = () => {
    navigator.clipboard.writeText(tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalOwed = summary?.total_owed ?? 0;
  const totalDebt = summary?.total_owe ?? 0;
  const groupsCount = groups?.length ?? 0;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SE";

  if (!user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
      {/* Breadcrumbs & Section Title */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-label">
            <span>Account</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">Profile Settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1 font-headline">
            Profile
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md shadow-2xs">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online • Cloud Synced</span>
        </div>
      </div>

      {/* 1. Profile Header Card matching Stitch */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          {/* Large Avatar with Hover Edit Badge */}
          <div className="relative group cursor-pointer shrink-0">
            <div className="size-20 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-xs transition-transform duration-150 group-hover:scale-[1.02]">
              {userInitials}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[0.5px]">
              <Camera className="size-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 bg-white dark:bg-zinc-800 rounded-full p-1 border border-zinc-200 dark:border-zinc-700 shadow-xs">
              <Edit2 className="size-3 text-zinc-600 dark:text-zinc-300" />
            </div>
          </div>

          {/* User Metadata */}
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-headline truncate">
                {user.name}
              </h2>
              <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700">
                <CheckCircle2 className="size-3 text-indigo-600 dark:text-indigo-400" />
                Verified Member
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                Pro Plan
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
              {user.email} • Member since {formatDate(user.created_at) || "March 2026"}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 font-label">
                <AtSign className="size-3 text-zinc-400" />
                {tag.replace("@", "")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3 text-zinc-400" />
                San Francisco, CA
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Button */}
        <div>
          <button
            type="button"
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 shadow-xs"
          >
            <Edit3 className="size-4" />
            <span>Edit profile</span>
          </button>
        </div>
      </section>

      {/* 2. Stats Row (3 Cards) matching Stitch */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: You're owed */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-label">
              You&apos;re owed
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900">
              <TrendingUp className="size-3" />
              +14%
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {summaryLoading ? "..." : `+${formatCurrency(totalOwed)}`}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Incoming balance from group splits
          </p>
        </div>

        {/* Card 2: You owe */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-label">
              You owe
            </span>
            <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-medium px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900">
              <TrendingDown className="size-3" />
              Due soon
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {summaryLoading ? "..." : `-${formatCurrency(totalDebt)}`}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Pending settlements due to teammates
          </p>
        </div>

        {/* Card 3: Groups */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-label">
              Active Groups
            </span>
            <span className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              <Users className="size-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
            {groupsCount}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Circles you currently participate in
          </p>
        </div>
      </section>

      {/* 3. Account Details Card matching Stitch */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
            Account details
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your personal credentials and contact information.
          </p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* Full Name */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
            <div className="w-1/3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Full Name</span>
            </div>
            <div className="w-1/2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</span>
            </div>
            <div className="w-1/6 flex justify-end">
              <button type="button" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline">
                Edit
              </button>
            </div>
          </div>

          {/* Email Address */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
            <div className="w-1/3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Email Address</span>
            </div>
            <div className="w-1/2 flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.email}</span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800">
                Verified
              </span>
            </div>
            <div className="w-1/6 flex justify-end">
              <button type="button" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline">
                Change email
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
            <div className="w-1/3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Phone Number</span>
            </div>
            <div className="w-1/2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">+1 (555) 234-5678</span>
            </div>
            <div className="w-1/6 flex justify-end">
              <button type="button" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline">
                Change
              </button>
            </div>
          </div>

          {/* SplitEase Tag */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
            <div className="w-1/3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">SplitEase Tag</span>
            </div>
            <div className="w-1/2 flex items-center gap-2">
              <span className="text-sm font-mono font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                {tag}
              </span>
              <span className="text-xs text-zinc-400">Used for direct instant settles</span>
            </div>
            <div className="w-1/6 flex justify-end">
              <button
                type="button"
                onClick={handleCopyTag}
                className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded"
                title="Copy tag"
              >
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Preferences Card matching Stitch */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
            Preferences
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Customize currency format, regional settings, and appearance.
          </p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* Primary Currency */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Primary Currency</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Default currency for all newly created expense entries</div>
            </div>
            <div className="relative w-64">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-1.5 pl-3 pr-8 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors cursor-pointer"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
              </select>
            </div>
          </div>

          {/* Language */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Display Language</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Select language for interface labels, dates, and receipts</div>
            </div>
            <div className="relative w-64">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-1.5 pl-3 pr-8 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors cursor-pointer"
              >
                <option value="en-US">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Timezone */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Timezone</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Automatically stamps settlements with your local zone</div>
            </div>
            <div className="relative w-64">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-1.5 pl-3 pr-8 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors cursor-pointer"
              >
                <option value="PT">Pacific Time (PT - America/Los_Angeles)</option>
                <option value="ET">Eastern Time (ET - America/New_York)</option>
                <option value="UTC">UTC / Greenwich Mean Time</option>
                <option value="CET">Central European Time (CET)</option>
              </select>
            </div>
          </div>

          {/* Appearance / Theme */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Appearance / Theme</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Customize how SplitEase looks on your device</div>
            </div>
            <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                  currentTheme === "light"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Sun className="size-3.5" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                  currentTheme === "dark"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Moon className="size-3.5" />
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                  currentTheme === "system"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Monitor className="size-3.5" />
                System
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Notifications Card matching Stitch */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-headline">
            Notifications
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Control email digests and push updates for group activity.
          </p>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* Expense activity */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="max-w-lg">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Expense activity</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Notify immediately when an expense is added, edited, or deleted in your groups.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={expenseNotifs}
              onClick={() => setExpenseNotifs(!expenseNotifs)}
              className={cn(
                "w-9 h-5 rounded-full relative p-0.5 transition-colors focus:outline-none",
                expenseNotifs ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "block size-4 rounded-full bg-white dark:bg-zinc-900 transition-transform",
                  expenseNotifs ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Payment & settlements */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="max-w-lg">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Payment &amp; settlements</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Get notified when someone records a payment or settles up with you.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={paymentNotifs}
              onClick={() => setPaymentNotifs(!paymentNotifs)}
              className={cn(
                "w-9 h-5 rounded-full relative p-0.5 transition-colors focus:outline-none",
                paymentNotifs ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "block size-4 rounded-full bg-white dark:bg-zinc-900 transition-transform",
                  paymentNotifs ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Weekly summary digest */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="max-w-lg">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Weekly summary digest</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Receive a Monday morning breakdown of all balances and group spending.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={digestNotifs}
              onClick={() => setDigestNotifs(!digestNotifs)}
              className={cn(
                "w-9 h-5 rounded-full relative p-0.5 transition-colors focus:outline-none",
                digestNotifs ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "block size-4 rounded-full bg-white dark:bg-zinc-900 transition-transform",
                  digestNotifs ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Push notifications */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="max-w-lg">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Push notifications</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Receive alerts directly on registered mobile devices and web browsers.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={pushNotifs}
              onClick={() => setPushNotifs(!pushNotifs)}
              className={cn(
                "w-9 h-5 rounded-full relative p-0.5 transition-colors focus:outline-none",
                pushNotifs ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "block size-4 rounded-full bg-white dark:bg-zinc-900 transition-transform",
                  pushNotifs ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Danger Zone matching Stitch */}
      <section className="bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-950/60 rounded-xl shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 font-headline flex items-center gap-1.5">
              <AlertTriangle className="size-4" />
              Danger Zone
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              End your current session or permanently terminate your SplitEase profile and records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Log out
            </button>
            <button
              type="button"
              className="px-3.5 py-1.5 text-xs font-medium text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 dark:bg-rose-950/40 dark:border-rose-900 rounded-lg transition-colors shadow-2xs"
            >
              Delete account
            </button>
          </div>
        </div>
      </section>

      {/* Sub-footer copyright / meta matching Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 pt-2 pb-4 gap-2">
        <p>© 2026 SplitEase Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">Security</span>
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
