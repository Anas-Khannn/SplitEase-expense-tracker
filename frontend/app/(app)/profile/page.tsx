"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLogout } from "@/hooks/mutations/useLogout";
import { useGroups } from "@/hooks/useGroups";
import { LogoutConfirmationDialog } from "@/components/shared/LogoutConfirmationDialog";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Skeleton,
} from "@/components/ui";
import { LogOut, Users } from "lucide-react";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const { user } = useAuth();
  const logout = useLogout();
  const { data: groups, isLoading: groupsLoading } = useGroups();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details.
        </p>
      </div>

      {!user && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="h-16 w-16" />
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
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar name={user.name} alt={user.name} size="xl" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg text-foreground">
                    {user.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground break-words">
                    {user.email}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground break-all">
                    User ID: {user.user_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg text-foreground">
                Account
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-surface">
                    <Users className="h-5 w-5 text-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      Groups
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Groups you&apos;re a member of
                    </p>
                  </div>
                </div>
                {groupsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <span className="text-sm text-foreground tabular-nums">
                    {groups?.length ?? 0}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground">
                    Member since
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined SplitEase
                  </p>
                </div>
                <p className="text-sm text-foreground">
                  {formatDate(user.created_at) || "—"}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="danger"
                size="md"
                icon={<LogOut />}
                onClick={() => setLogoutOpen(true)}
              >
                Log out
              </Button>
            </CardFooter>
          </Card>

          <LogoutConfirmationDialog
            open={logoutOpen}
            onClose={() => {
              if (logout.isPending) return;
              setLogoutOpen(false);
            }}
            onConfirm={handleLogout}
            loading={logout.isPending}
          />
        </>
      )}
    </div>
  );
}
