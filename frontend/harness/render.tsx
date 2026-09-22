import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { render } from "@testing-library/react";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { ActivityItem } from "@/components/activity/ActivityItem";
import { BalanceList } from "@/components/balances/BalanceList";
import { SummaryChart } from "@/components/balances/SummaryChart";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { BalanceListSkeleton } from "@/components/skeletons";
import { GroupCard } from "@/components/groups/GroupCard";
import { MemberList } from "@/components/groups/MemberList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const registry = {
  Skeleton,
  EmptyState,
  ExpenseList,
  ExpenseCard,
  ActivityItem,
  ActivityFeed,
  GroupCard,
  BalanceList,
  MemberList,
  SummaryChart,
  BalanceListSkeleton,
} as const;

export type HarnessComponentName = keyof typeof registry;

export interface RenderDumpResult {
  component: string;
  props: Record<string, unknown>;
  html: string;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export function renderAndDump(
  name: HarnessComponentName,
  props: Record<string, unknown>
): RenderDumpResult {
  const Component = registry[name] as ComponentType<Record<string, unknown>>;
  const view = render(
    <QueryClientProvider client={queryClient}>
      <Component {...props} />
    </QueryClientProvider>
  );

  return {
    component: name,
    props,
    html: view.container.innerHTML,
  };
}

export { registry };