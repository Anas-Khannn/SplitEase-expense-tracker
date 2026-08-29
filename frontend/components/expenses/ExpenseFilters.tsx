"use client";

import { Button, Card, CardContent, Input } from "@/components/ui";
import { Filter, X } from "lucide-react";
import type {
  ExpenseFilters as ExpenseFilterValues,
  GroupMemberRecord,
} from "@/types";

interface ExpenseFiltersProps {
  members: GroupMemberRecord[];
  values: ExpenseFilterValues;
  onChange: (values: ExpenseFilterValues) => void;
  onApply: (values: ExpenseFilterValues) => void;
  onClear: () => void;
  activeCount: number;
  error?: string | null;
  disabled?: boolean;
}

const selectClass =
  "h-10 w-full rounded-radius-md border border-border-default bg-surface px-3 text-body text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring disabled:opacity-50";

export function ExpenseFilters({
  members,
  values,
  onChange,
  onApply,
  onClear,
  activeCount,
  error,
  disabled = false,
}: ExpenseFiltersProps) {
  const hasDraftValues = Boolean(
    values.payer_id || values.start_date || values.end_date
  );

  return (
    <Card>
      <CardContent className="py-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onApply(values);
          }}
          noValidate
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3">
            <div className="flex flex-col gap-1.5 lg:w-56">
              <label
                htmlFor="expense-filter-payer"
                className="text-body-sm font-medium text-text-primary"
              >
                Paid by
              </label>
              <select
                id="expense-filter-payer"
                value={values.payer_id ?? ""}
                onChange={(event) =>
                  onChange({
                    ...values,
                    payer_id: event.target.value || undefined,
                  })
                }
                disabled={disabled}
                className={selectClass}
              >
                <option value="">All members</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name || "Member"}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-44">
              <Input
                id="expense-filter-start-date"
                label="Start date"
                type="date"
                value={values.start_date ?? ""}
                max={values.end_date || undefined}
                onChange={(event) =>
                  onChange({
                    ...values,
                    start_date: event.target.value || undefined,
                  })
                }
                disabled={disabled}
              />
            </div>

            <div className="lg:w-44">
              <Input
                id="expense-filter-end-date"
                label="End date"
                type="date"
                value={values.end_date ?? ""}
                min={values.start_date || undefined}
                onChange={(event) =>
                  onChange({
                    ...values,
                    end_date: event.target.value || undefined,
                  })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              {activeCount > 0 && (
                <span className="text-caption font-medium text-text-secondary">
                  {activeCount} active filter{activeCount === 1 ? "" : "s"}
                </span>
              )}

              <Button
                type="button"
                variant="secondary"
                size="md"
                icon={<X />}
                disabled={disabled || (!hasDraftValues && activeCount === 0)}
                onClick={onClear}
              >
                Clear
              </Button>

              <Button type="submit" variant="primary" size="md" icon={<Filter />}>
                Apply filters
              </Button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-caption text-danger-500" role="alert">
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}