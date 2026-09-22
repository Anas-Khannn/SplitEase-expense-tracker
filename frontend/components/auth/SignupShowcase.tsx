import {
  Building2,
  Check,
  Coins,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

function MiniAvatar({
  initials,
  tone,
}: {
  initials: string;
  tone: string;
}) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full text-[10px] font-semibold",
        tone
      )}
    >
      {initials}
    </span>
  );
}

const ledger = [
  {
    icon: ShoppingCart,
    label: "Amina added Groceries",
    note: "Cashier receipts · split 4 ways",
    amount: "$84.20",
    tone: "bg-violet-100 text-violet-700 dark:bg-violet-400/20 dark:text-violet-300",
  },
  {
    icon: Coins,
    label: "Dev paid Utilities",
    note: "Settled 6 min ago",
    amount: "$23.10",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300",
  },
];

const trust = [
  "Instant balances",
  "Auto-simplifies debt",
  "Works offline",
];

export function SignupShowcase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-8 p-6 lg:p-10",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
          <span className="flex -space-x-1.5">
            <MiniAvatar initials="AL" tone="bg-amber-200 text-amber-900" />
            <MiniAvatar initials="SC" tone="bg-sky-200 text-sky-900" />
            <MiniAvatar initials="DK" tone="bg-emerald-200 text-emerald-900" />
          </span>
          <span>12,000+ teams</span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-foreground">
            Live Ledger · v2.4
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Group balance
              </p>
              <p className="text-base font-semibold text-foreground">
                Apartment Expenses
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              Apr 2025
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 border-b border-border py-4">
            <div className="rounded-lg bg-muted/60 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">You owe</p>
              <p className="text-base font-semibold text-rose-600 dark:text-rose-500">
                $24.00
              </p>
            </div>
            <div className="rounded-lg bg-muted/60 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Owed to you</p>
              <p className="text-base font-semibold text-emerald-600 dark:text-emerald-500">
                $40.00
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5 dark:bg-emerald-400/10">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              3 settlements ready
            </span>
            <button
              type="button"
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Simplify
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {ledger.map((l) => (
              <div
                key={l.label}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full",
                    l.tone
                  )}
                >
                  <l.icon className="size-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {l.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {l.note}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {l.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {trust.map((t) => (
            <div key={t} className="flex items-center gap-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-400">
                <Check className="size-3" aria-hidden="true" />
              </span>
              <span className="text-sm text-foreground">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-0.5" aria-label="4.9 out of 5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className="size-3.5 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
          ))}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Building2 className="size-3.5" aria-hidden="true" />
          Trusted by 12,000+ roommates
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
          <Users className="size-4" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">
          “SplitEase handled a 9-roommate bill split in seconds.”
        </p>
      </div>
    </div>
  );
}