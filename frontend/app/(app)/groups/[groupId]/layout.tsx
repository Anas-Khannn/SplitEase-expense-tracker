"use client";

import { use } from "react";
import { GroupHeader } from "@/components/groups/GroupHeader";

interface GroupDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}

export default function GroupDetailLayout({
  children,
  params,
}: GroupDetailLayoutProps) {
  const { groupId } = use(params);

  return (
    <div className="space-y-6">
      <GroupHeader groupId={groupId} />
      <div>{children}</div>
    </div>
  );
}
