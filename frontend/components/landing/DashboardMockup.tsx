import {
  BadgeCheck,
  Lock,
  MoreHorizontal,
  Plus,
  Route,
  Share,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const metricClass = "tabular-nums tracking-tight";

function Dot({ className }: { className?: string }) {
  return <span className={cn("inline-block size-3 rounded-full", className)} />;
}

function Avatar({
  initials,
  tone,
  className,
}: {
  initials: string;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-background",
        tone ?? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100",
        className
      )}
    >
      {initials}
    </span>
  );
}

const metricCards = [
  {
    title: "Total Net Balance",
    icon: Wallet,
    value: "+$75.50",
    valueClass: "text-emerald-600 dark:text-emerald-500",
    badge: "Net positive",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-400/10 dark:text-emerald-400",
    caption: "Overall across all 4 pending shared balances",
  },
  {
    title: "You're owed",
    icon: TrendingUp,
    iconClass: "text-emerald-600 dark:text-emerald-500",
    value: "+$120.50",
    valueClass: "text-emerald-600 dark:text-emerald-500",
    subLabel: "from 3 roommates",
    caption: "Maya ($75.00), Liam ($30.50), Sarah ($15.00)",
  },
  {
    title: "You owe",
    icon: TrendingDown,
    iconClass: "text-rose-600 dark:text-rose-500",
    value: "-$45.00",
    valueClass: "text-rose-600 dark:text-rose-500",
    subLabel: "to 1 member",
    caption: "Marcus (Groceries & household soap bulk)",
  },
];

const settlements = [
  {
    initials: "MY",
    tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-300",
    heading: "Maya owes you",
    caption: "For Gigabit Fiber Internet",
    amount: "+$75.00",
    amountClass: "text-emerald-600 dark:text-emerald-500",
    action: "Remind",
    primary: false,
  },
  {
    initials: "MC",
    tone: "bg-rose-100 text-rose-800 dark:bg-rose-400/20 dark:text-rose-300",
    heading: "You owe Marcus",
    caption: "Weekly staples run",
    amount: "-$45.00",
    amountClass: "text-rose-600 dark:text-rose-500",
    action: "Settle",
    primary: true,
  },
];

const ledgerRows = [
  {
    icon: Wifi,
    title: "Gigabit Fiber Internet",
    caption: "Paid by you · Split equally (6 ways)",
    amount: "$150.00",
    note: "you lent $125.00",
    noteClass: "text-emerald-600 dark:text-emerald-500",
  },
  {
    icon: ShoppingCart,
    title: "Trader Joe's Bulk Groceries",
    caption: "Paid by Marcus · Split equally",
    amount: "$180.00",
    note: "you owe $30.00",
    noteClass: "text-rose-600 dark:text-rose-500",
  },
  {
    icon: UtensilsCrossed,
    title: "Dinner at Le Bistro",
    caption: "Paid by Sarah · Itemized shares",
    amount: "$92.40",
    note: "you owe $15.00",
    noteClass: "text-rose-600 dark:text-rose-500",
  },
];

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-zinc-200/60 dark:bg-zinc-950 dark:shadow-none",
        className
      )}
    >
      {/* Browser chrome bar */}
      <div className="flex items-center justify-between border-b border-border bg-zinc-50/90 px-4 py-3 dark:bg-zinc-900/70">
        <div className="flex items-center gap-2">
          <Dot className="bg-zinc-300/80" />
          <Dot className="bg-zinc-300/80" />
          <Dot className="bg-zinc-300/80" />
        </div>
        <div className="flex w-full max-w-sm items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-1 font-mono text-xs text-muted-foreground">
          <Lock className="size-3.5 text-zinc-400" aria-hidden="true" />
          app.splitease.com/apartment
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Share className="size-[18px]" aria-hidden="true" />
          <MoreHorizontal className="size-[18px]" aria-hidden="true" />
        </div>
      </div>

      {/* Inner dashboard canvas */}
      <div className="space-y-6 bg-card p-5 md:p-8 dark:bg-zinc-950">
        {/* Mock header */}
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-4 dark:border-zinc-800 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Apartment #4B
              </h2>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                6 members
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Shared household utilities, lease buffer &amp; groceries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden">
              <Avatar initials="MC" tone="bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-300" />
              <Avatar initials="AR" tone="bg-blue-100 text-blue-800 dark:bg-blue-400/20 dark:text-blue-300" className="-ml-2" />
              <Avatar initials="SL" tone="bg-purple-100 text-purple-800 dark:bg-purple-400/20 dark:text-purple-300" className="-ml-2" />
              <Avatar initials="DT" tone="bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300" className="-ml-2" />
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 ring-2 ring-background dark:bg-zinc-800 dark:text-zinc-300">
                +2
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90">
              <Plus className="size-4" aria-hidden="true" />
              Add expense
            </span>
          </div>
        </div>

        {/* Metric cards trio */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {metricCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{card.title}</span>
                <card.icon
                  className={cn("size-[18px] text-zinc-400", card.iconClass)}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className={cn("text-2xl font-bold text-foreground", card.valueClass, metricClass)}>
                  {card.value}
                </span>
                {card.badge && (
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium",
                      card.badgeClass
                    )}
                  >
                    {card.badge}
                  </span>
                )}
                {card.subLabel && (
                  <span className="text-xs text-muted-foreground">
                    {card.subLabel}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{card.caption}</p>
            </div>
          ))}
        </div>

        {/* Debt simplification banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-zinc-50 p-3.5 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-md bg-foreground text-background">
              <Route className="size-4" aria-hidden="true" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground">
                Simplification Active:
              </span>
              <span className="ml-1 text-muted-foreground">
                SplitEase condensed 9 tangled cross-debts into 2 direct
                transfers.
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            View transfer graph
          </button>
        </div>

        {/* Two-column: settlements + ledger */}
        <div className="grid grid-cols-1 gap-6 pt-2 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 lg:col-span-5">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Suggested Settlements
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  1 tap settle
                </span>
              </div>
              <div className="space-y-2.5">
                {settlements.map((row) => (
                  <div
                    key={row.heading}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={row.initials} tone={row.tone} className="size-7 text-[11px]" />
                      <div>
                        <div className="text-xs font-medium text-foreground">
                          {row.heading}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {row.caption}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-mono text-xs font-semibold", row.amountClass)}>
                        {row.amount}
                      </span>
                      <button
                        type="button"
                        className={cn(
                          "rounded px-2 py-1 text-[11px] font-medium",
                          row.primary
                            ? "bg-foreground text-background shadow-xs hover:bg-foreground/90"
                            : "rounded border border-border bg-background text-muted-foreground shadow-xs hover:bg-muted"
                        )}
                      >
                        {row.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-muted-foreground dark:border-zinc-800">
              <span className="flex items-center gap-1">
                <BadgeCheck className="size-3.5 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
                Zero fee bank connect
              </span>
              <span className="font-mono text-[11px]">Sync: 2m ago</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 lg:col-span-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent Group Ledger
              </h3>
              <span className="text-xs font-medium text-foreground hover:text-muted-foreground">
                All activity →
              </span>
            </div>
            <div className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
              {ledgerRows.map((row) => (
                <div key={row.title} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      <row.icon className="size-[18px]" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {row.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {row.caption}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-foreground">
                      {row.amount}
                    </div>
                    <div className={cn("text-[11px] font-medium", row.noteClass)}>
                      {row.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}