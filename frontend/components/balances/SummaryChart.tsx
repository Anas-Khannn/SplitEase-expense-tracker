"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { Card, CardContent } from "@/components/ui";
import type { Contribution } from "@/types";

interface SummaryChartProps {
  contributions: Contribution[];
  totalSpending: number;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCompactCurrency(value: number): string {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

function truncateName(value: string, maxLength = 18): string {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}…`
    : value;
}

function SummaryChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  const raw = payload[0]?.value;
  const amount = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(amount)) return null;

  const memberName = label !== undefined ? String(label) : undefined;

  return (
    <div className="rounded-radius-md border border-border-default bg-surface px-3 py-2 shadow-md">
      {memberName && (
        <p className="text-caption font-semibold text-text-primary">
          {memberName}
        </p>
      )}
      <p className="text-body-sm font-semibold text-primary-500 tabular-nums">
        {formatCurrency(amount)}
      </p>
      <p className="text-caption text-text-muted">Total paid</p>
    </div>
  );
}

export function SummaryChart({
  contributions,
  totalSpending,
}: SummaryChartProps) {
  const chartHeight = Math.min(380, Math.max(200, contributions.length * 44));

  const data = contributions.map((contribution) => ({
    user_id: contribution.user_id,
    name: contribution.name || contribution.user_id,
    amount: contribution.amount,
  }));

  return (
    <Card className="min-w-0">
      <CardContent className="pb-2">
        <h3 className="text-h3 font-semibold text-text-primary">
          Contributions by member
        </h3>
        <p className="text-body-sm text-text-muted mt-1">
          Amount each member has paid toward the group&apos;s total spending.
        </p>

        <div
          role="img"
          aria-label={`Bar chart of member contributions. ${data.length} ${data.length === 1 ? "member" : "members"} contributed a total of ${formatCurrency(totalSpending)}.`}
          className="mt-4 w-full min-w-0"
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                stroke="#E7E4F0"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                type="number"
                dataKey="amount"
                tick={{ fill: "#96919F", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatCompactCurrency}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={132}
                tick={{ fill: "#57536A", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={truncateName}
              />
              <Tooltip
                content={SummaryChartTooltip}
                cursor={{ fill: "rgba(108, 92, 224, 0.08)" }}
                isAnimationActive={false}
              />
              <Bar
                dataKey="amount"
                name="Total paid"
                fill="#6C5CE0"
                radius={[0, 6, 6, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
