"use client";

import { useState, use, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGroupMembers } from "@/hooks/useGroups";
import { MemberList } from "@/components/groups/MemberList";
import { AddMemberModal } from "@/components/groups/AddMemberModal";
import { GroupMembersSkeleton } from "@/components/skeletons";
import {
  Button,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import { UserPlus, Search, Download, Users } from "lucide-react";
import type { GroupMemberRecord } from "@/types";

interface MembersPageProps {
  params: Promise<{ groupId: string }>;
}

export default function MembersPage({ params }: MembersPageProps) {
  const { groupId } = use(params);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: members,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupMembers(groupId);

  const [modalOpen, setModalOpen] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m: GroupMemberRecord) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        m.user_id.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const count = members?.length ?? 0;
  const adminCount = useMemo(
    () => (members ?? []).filter((m) => m.role === "admin").length,
    [members]
  );

  const handleExportCSV = () => {
    if (!members?.length) return;
    const headers = ["Name", "Email", "Role", "Joined Date"];
    const rows = members.map((m) => [
      `"${(m.name || "Member").replace(/"/g, '""')}"`,
      `"${(m.email || m.user_id).replace(/"/g, '""')}"`,
      m.role,
      m.joined_at,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Group_${groupId}_Members.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section matching Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-headline">
              Group Members
            </h2>
            <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700">
              {count} {count === 1 ? "member" : "members"}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage member permissions, invite roommates, and monitor contribution statuses.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={<UserPlus />}
            onClick={() => setModalOpen(true)}
            className="shadow-xs"
          >
            Add member
          </Button>
        </div>
      </div>

      {/* Filter toolbar matching Stitch */}
      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter members by name or email..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:bg-white dark:focus:bg-zinc-950 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">
            {adminCount} {adminCount === 1 ? "admin" : "admins"}
          </span>
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-8 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="size-3 text-zinc-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {isLoading && <GroupMembersSkeleton />}

      {isError && (
        <ErrorState
          title="Failed to load members"
          description={error?.message ?? "Something went wrong"}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && members && members.length === 0 && (
        <EmptyState
          icon={<Users className="size-8 text-zinc-400" />}
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

      {!isLoading && !isError && filteredMembers.length > 0 && (
        <MemberList
          groupId={groupId}
          members={filteredMembers}
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
