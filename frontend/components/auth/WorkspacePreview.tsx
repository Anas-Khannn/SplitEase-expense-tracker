import { Star, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
        "flex size-8 items-center justify-center rounded-full text-[11px] font-semibold",
        tone ?? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100",
        className
      )}
    >
      {initials}
    </span>
  );
}

function AvatarStack({ className }: { className?: string }) {
  return (
    <div className={cn("flex -space-x-2", className)}>
      <Avatar initials="CW" tone="bg-amber-200 text-amber-900 dark:bg-amber-400/30 dark:text-amber-200" />
      <Avatar initials="DL" tone="bg-sky-200 text-sky-900 dark:bg-sky-400/30 dark:text-sky-200" />
      <Avatar initials="MP" tone="bg-emerald-200 text-emerald-900 dark:bg-emerald-400/30 dark:text-emerald-200" />
      <span className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-[11px] font-semibold text-muted-foreground">
        +1
      </span>
    </div>
  );
}

function Stars() {
  return (
    <span className="flex items-center gap-0.5" aria-label="4.9 out of 5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i === 4
              ? "text-zinc-300 dark:text-zinc-600"
              : "fill-amber-400 text-amber-400"
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

const transactions = [
  {
    initials: "MK",
    name: "Maya",
    label: "Groceries · 2h ago",
    amount: "+$24.50",
    positive: true,
  },
  {
    initials: "JT",
    name: "Jonas",
    label: "Utilities · yesterday",
    amount: "-$12.00",
    positive: false,
  },
  {
    initials: "AL",
    name: "Alex",
    label: "Dinner · 3d ago",
    amount: "+$18.75",
    positive: true,
  },
];

export function WorkspacePreview({
  variant = "home",
  className,
}: {
  variant?: "home" | "reset" | "compact";
  className?: string;
}) {
  const isReset = variant === "reset";
  const badge = isReset ? "PRO MEMBER" : "Demo preview";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 p-6 lg:p-10",
        variant === "compact" && "p-5 lg:p-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-foreground">
            Live Workspace
          </span>
          <span className="text-sm text-muted-foreground">· Synced just now</span>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            isReset
              ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          )}
        >
          {badge}
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {isReset ? "Team Split" : "Active Group"}
            </p>
            <p className="text-base font-semibold text-foreground">
              {isReset ? "Groceries" : "Apartment 4B"}
            </p>
          </div>
          <AvatarStack />
        </div>

        <div className="py-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Net balance</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">
                +$120.50
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
              <TrendingUp className="size-3.5" aria-hidden="true" />
              Owed to you
            </div>
          </div>
        </div>

        <div className="space-y-1 border-t border-border pt-3">
          {transactions.map((t) => (
            <div
              key={t.name}
              className="flex items-center gap-3 rounded-lg px-2 py-2"
            >
              <Avatar initials={t.initials} className="size-7 text-[10px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {t.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.label}
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  t.positive
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-rose-600 dark:text-rose-500"
                )}
              >
                {t.amount}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-2 py-2">
            <span className="text-xs text-muted-foreground">
              {isReset ? "March cycle" : "Current cycle"}
            </span>
            <span className="text-xs font-medium text-foreground">78%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                isReset ? "bg-zinc-900 dark:bg-zinc-100" : "bg-emerald-500"
              )}
              style={{ width: "78%" }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Stars />
          <span className="text-sm font-semibold text-foreground">4.9/5</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          “Since switching to SplitEase I&apos;ve stopped counting IOUs in my
          head. It just works.”{" "}
          <span className="font-medium text-foreground">
            {isReset ? "— Maya, Product Designer" : "— The 4B Roommates"}
          </span>
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
            <Zap className="size-3 text-amber-500" aria-hidden="true" />
            Splitwise import ready
          </span>
          {isReset && (
            <span className="flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
              SOC-2
            </span>
          )}
        </div>
      </div>
    </div>
  );
}