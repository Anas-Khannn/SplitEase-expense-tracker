"use client";

import { useState, use } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroupMembers } from "@/hooks/useGroups";
import { MemberList } from "@/components/groups/MemberList";
import { AddMemberModal } from "@/components/groups/AddMemberModal";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import { UserPlus } from "lucide-react";

interface MembersPageProps {
  params: Promise<{ groupId: string }>;
}

export default function MembersPage({ params }: MembersPageProps) {
  const { groupId } = use(params);
  const { user } = useAuth();

  const {
    data: members,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupMembers(groupId);

  const [modalOpen, setModalOpen] = useState(false);

  const count = members?.length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-h3 font-semibold text-text-primary">Members</h3>
          <p className="text-body-sm text-text-muted mt-1">
            {isLoading
              ? "Loading members…"
              : `${count} ${count === 1 ? "member" : "members"}`}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<UserPlus />}
          onClick={() => setModalOpen(true)}
        >
          Add member
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circle" className="h-10 w-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          title="Failed to load members"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && members && members.length === 0 && (
        <EmptyState
          icon={<UserPlus />}
          title="No members yet"
          description="Add a member to start collaborating on shared expenses."
          action={
            <Button
              variant="primary"
              size="md"
              icon={<UserPlus />}
              onClick={() => setModalOpen(true)}
            >
              Add member
            </Button>
          }
        />
      )}

      {!isLoading && !isError && members && members.length > 0 && (
        <MemberList
          groupId={groupId}
          members={members}
          currentUserId={user?.user_id}
          currentUserName={user?.name}
        />
      )}

      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        groupId={groupId}
      />
    </div>
  );
}
