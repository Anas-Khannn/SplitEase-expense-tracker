import { describe, expect, it, test } from "vitest";
import { writeFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { renderAndDump, registry, type HarnessComponentName } from "./render";
import { fixtures, parseProps, type FixtureMap } from "./fixtures";
import { cn } from "@/lib/utils/cn";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { GroupsPageSkeleton } from "@/components/skeletons";
import type { Expense } from "@/types";

test("env-driven headless render dump", () => {
  const component = process.env.HARNESS_COMPONENT;
  const outputPath = process.env.HARNESS_OUTPUT;

  if (!component) {
    return;
  }

  if (!(component in registry)) {
    throw new Error(
      `Unknown harness component "${component}". Available: ${Object.keys(registry).join(", ")}`
    );
  }

  const props = component in fixtures
    ? fixtures[component as keyof FixtureMap](parseProps(process.env.HARNESS_OVERRIDES ?? "{}"))
    : parseProps(process.env.HARNESS_PROPS ?? "{}");

  const dump = renderAndDump(component as HarnessComponentName, props);
  const json = `${JSON.stringify(dump, null, 2)}\n`;

  if (outputPath) {
    writeFileSync(outputPath, json);
  } else {
    process.stdout.write(json);
  }
});

describe("harness smoke tests", () => {
  it("renders a real data component headlessly", () => {
    const emptyExpenses = {
      expenses: [] as Expense[],
      currentUserId: "test-user",
      onAddExpense: () => {},
      onEdit: () => {},
      onDelete: () => {},
      isFiltered: false,
      onClearFilters: () => {},
    };

    const { html } = renderAndDump("ExpenseList", emptyExpenses as never);

    expect(html).toContain("No expenses yet");
  });

  it("dumps a pure module result", () => {
    expect(cn("p-4", "text-sm", "font-medium")).toBe("p-4 text-sm font-medium");
  });

  it("renders a skeleton while a data component is loading", () => {
    const { container } = render(
      <ExpenseList
        expenses={[]}
        currentUserId="test-user"
        onAddExpense={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        isLoading
      />
    );

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByText("No expenses yet")).toBeNull();
  });

  it("renders content once a data component has loaded", () => {
    const { container } = render(
      <ExpenseList
        expenses={[]}
        currentUserId="test-user"
        onAddExpense={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText("No expenses yet")).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });

  it("renders every page skeleton without error", () => {
    const pageSkeletons = [GroupsPageSkeleton];
    for (const SkeletonComponent of pageSkeletons) {
      const { container } = render(<SkeletonComponent />);
      expect(container.querySelector(".animate-pulse")).not.toBeNull();
      container.remove();
    }
  });
});