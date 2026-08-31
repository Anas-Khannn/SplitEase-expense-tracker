"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLogout } from "@/hooks/mutations/useLogout";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { User, Monitor, Sun, Moon, ShieldCheck, LogOut } from "lucide-react";

type ThemePreference = "system" | "light" | "dark";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Monitor }[] =
  [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

const THEME_STORAGE_KEY = "split-ease-theme-preference";
const THEME_SYNC_EVENT = "split-ease-theme-change";

let currentTheme: ThemePreference = "system";

function getThemeSnapshot(): ThemePreference {
  return currentTheme;
}

function getServerSnapshot(): ThemePreference {
  return "system";
}

function subscribeToTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  // Read stored preference AFTER hydration (this runs in a passive effect).
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
    if (stored && THEME_OPTIONS.some((o) => o.value === stored)) {
      currentTheme = stored;
      callback();
    }
  } catch {
    // Storage unavailable — use default.
  }

  const onThemeSync = (e: Event) => {
    const detail = (e as CustomEvent<ThemePreference>).detail;
    if (detail && THEME_OPTIONS.some((o) => o.value === detail)) {
      currentTheme = detail;
    }
    callback();
  };

  window.addEventListener("storage", callback);
  window.addEventListener(THEME_SYNC_EVENT, onThemeSync);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_SYNC_EVENT, onThemeSync);
  };
}

function AppearancesSection() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  const handleSelect = (next: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent(THEME_SYNC_EVENT, { detail: next }));
    } catch {
      // Storage unavailable — preference only applies for this session.
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-h3 font-semibold text-text-primary">Appearance</h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-body font-medium text-text-primary">
              Theme
            </p>
            <p className="mt-0.5 text-caption text-text-muted">
              Choose how SplitEase looks. System follows your device setting.
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Theme preference"
          className="mt-4 flex flex-wrap gap-2"
        >
          {THEME_OPTIONS.map((option) => {
            const selected = theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                aria-pressed={selected}
                className={cn(
                  "inline-flex items-center gap-2 rounded-radius-md border px-4 py-2 text-body-sm font-medium transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
                  selected
                    ? "border-primary-500 bg-primary-100 text-primary-600"
                    : "border-border-default bg-surface-alt text-text-secondary hover:border-primary-300 hover:text-text-primary"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-caption text-text-muted" aria-live="polite">
          {theme === "system"
            ? "Following your system setting."
            : `${theme[0].toUpperCase()}${theme.slice(1)} theme selected.`}
        </p>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        router.push("/login");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 font-bold text-text-primary">Settings</h2>
        <p className="mt-1 text-body-sm text-text-muted">
          Manage your account and preferences.
        </p>
      </div>

      {isLoading && !user && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" className="h-12 w-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user && (
        <>
          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-text-muted" aria-hidden="true" />
                <h3 className="text-h3 font-semibold text-text-primary">Profile</h3>
              </div>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar name={user.name} alt={user.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-text-primary break-words">
                    {user.name}
                  </p>
                  <p className="mt-1 text-body-sm text-text-muted break-words">
                    {user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <AppearancesSection />

          {/* Account */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-text-muted" aria-hidden="true" />
                <h3 className="text-h3 font-semibold text-text-primary">Account</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-body font-medium text-text-primary">
                    Account email
                  </p>
                  <p className="text-caption text-text-muted">
                    The email associated with your account
                  </p>
                </div>
                <p className="text-body font-medium text-text-primary break-all">
                  {user.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-body font-medium text-text-primary">
                    Account status
                  </p>
                  <p className="text-caption text-text-muted">
                    Current status of your account
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Session */}
          <Card>
            <CardHeader>
              <h3 className="text-h3 font-semibold text-text-primary">Session</h3>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-text-muted">
                Log out of SplitEase on this device. Your authentication state and
                cached data will be cleared.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="danger"
                size="md"
                icon={<LogOut />}
                onClick={handleLogout}
                loading={logout.isPending}
              >
                Log out
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
