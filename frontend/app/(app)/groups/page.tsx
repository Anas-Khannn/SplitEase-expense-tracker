"use client";

import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import { GroupList } from "@/components/groups/GroupList";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { Button, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { Plus, Users } from "lucide-react";

export default function GroupsPage() {
  const { data: groups, isLoading, isError, error, refetch } = useGroups();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-h2 font-bold text-text-primary">Groups</h2>
          <p className="text-body-sm text-text-muted mt-1">
            Manage your shared expenses and groups.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus />}
          onClick={() => setModalOpen(true)}
        >
          Create group
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-radius-lg border border-border-default bg-surface p-5 shadow-xs">
              <div className="flex items-start gap-4">
                <Skeleton variant="rect" className="h-12 w-12 shrink-0 rounded-radius-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-16 rounded-radius-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load groups"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && groups && groups.length === 0 && (
        <EmptyState
          icon={<Users />}
          title="No groups yet"
          description="Create a group to start splitting expenses with friends."
          action={
            <Button
              variant="primary"
              size="md"
              icon={<Plus />}
              onClick={() => setModalOpen(true)}
            >
              Create group
            </Button>
          }
        />
      )}

      {!isLoading && !isError && groups && groups.length > 0 && (
        <GroupList groups={groups} />
      )}

      <CreateGroupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
