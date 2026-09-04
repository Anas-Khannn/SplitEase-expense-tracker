"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOutIcon, SettingsIcon, UserIcon, MoonStarIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLogout } from "@/hooks/mutations/useLogout";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/base/primitives/avatar";
import { Button } from "@/components/ui/base/primitives/button";
import { Switch } from "@/components/ui/base/primitives/switch";
import { LogoutConfirmationDialog } from "./LogoutConfirmationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfileDropdown = () => {
  const { user } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        router.push("/login");
      },
    });
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-transparent"
          />
        }
      >
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-4 px-2 py-2.5 font-normal">
            <div className="relative">
              <Avatar className="size-10">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2" />
            </div>
            <div className="flex flex-1 flex-col items-start">
              <span className="text-foreground text-base font-semibold">
                {user.name}
              </span>
              <span className="text-muted-foreground text-sm">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserIcon />
            <span>My Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <SettingsIcon />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex cursor-default items-center justify-between gap-3 px-2 py-2.5">
            <span className="flex items-center gap-2">
              {isDark ? (
                <MoonStarIcon className="text-muted-foreground" />
              ) : (
                <SunIcon className="text-muted-foreground" />
              )}
              <span className="text-sm text-foreground">Dark mode</span>
            </span>
            <Switch checked={isDark} onCheckedChange={handleThemeChange} size="sm" aria-label="Toggle dark mode" />
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setLogoutOpen(true);
            }}
          >
            <LogOutIcon />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <LogoutConfirmationDialog
        open={logoutOpen}
        onClose={() => {
          if (logout.isPending) return;
          setLogoutOpen(false);
        }}
        onConfirm={handleLogout}
        loading={logout.isPending}
      />
    </DropdownMenu>
  );
};

export default ProfileDropdown;
