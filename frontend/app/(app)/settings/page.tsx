"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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

function AppearancesSection() {
  const { theme, setTheme } = useTheme();
  const current = (theme as ThemePreference) || "system";

  const handleSelect = (next: ThemePreference) => {
    setTheme(next);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground">Theme</p>
          <p className="text-xs text-muted-foreground">
            Choose how SplitEase looks. System follows your device setting.
          </p>
        </div>

        <div
          role="group"
          aria-label="Theme preference"
          className="mt-4 flex flex-wrap gap-2"
        >
          {THEME_OPTIONS.map((option) => {
            const selected = current === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                aria-pressed={selected}
                className={cn(
                  "inline-flex items-center gap-2 border px-4 py-2 text-sm transition-colors duration-150 rounded-md",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  selected
                    ? "border-primary bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
          {current === "system"
            ? "Following your system setting."
            : `${current[0].toUpperCase()}${current.slice(1)} theme selected.`}
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
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
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
                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground">Profile</h3>
              </div>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar name={user.name} alt={user.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground break-words">
                    {user.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground break-words">
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
                <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground">Account</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground">
                    Account email
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The email associated with your account
                  </p>
                </div>
                <p className="text-sm text-foreground break-all">
                  {user.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground">
                    Account status
                  </p>
                  <p className="text-xs text-muted-foreground">
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
              <h3 className="text-lg font-semibold text-foreground">Session</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
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
