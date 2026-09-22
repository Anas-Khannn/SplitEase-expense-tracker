import { describe, expect, it } from "vitest";
import {
  formatBalance,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatTime,
  formatTimestamp,
  truncateName,
} from "@/lib/selectors/format";

describe("formatCurrency", () => {
  it("formats a numeric string as USD", () => {
    expect(formatCurrency("64.50")).toBe("$64.50");
  });

  it("formats a number as USD with 2 decimals", () => {
    expect(formatCurrency(100)).toBe("$100.00");
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("returns the raw string when a string amount is not numeric", () => {
    expect(formatCurrency("abc")).toBe("abc");
  });

  it("returns an em dash when a numeric amount is not finite", () => {
    expect(formatCurrency(NaN)).toBe("—");
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("formatCompactCurrency", () => {
  it("formats in compact notation", () => {
    expect(formatCompactCurrency(1500)).toBe("$1.5K");
  });

  it("returns an empty string for non-finite values", () => {
    expect(formatCompactCurrency(NaN)).toBe("");
  });
});

describe("formatBalance", () => {
  it("formats a number with a dollar sign and 2 decimals", () => {
    expect(formatBalance(12.5)).toBe("$12.50");
    expect(formatBalance(-12.5)).toBe("$-12.50");
  });
});

describe("formatDate", () => {
  it("formats short dates by default", () => {
    expect(formatDate("2026-03-14T00:00:00.000Z")).toBe("Mar 14, 2026");
  });

  it("formats long month names on demand", () => {
    expect(formatDate("2026-03-14T00:00:00.000Z", "long")).toBe(
      "March 14, 2026"
    );
  });

  it("returns an empty string for invalid dates", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("formatTimestamp / formatTime", () => {
  it("formats a full date", () => {
    expect(formatTimestamp("2026-03-14T00:00:00.000Z")).toBe("Mar 14, 2026");
  });

  it("formats a time of day", () => {
    const localEvening = new Date(2026, 2, 14, 20, 5).toISOString();
    expect(formatTime(localEvening)).toBe("8:05 PM");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatTimestamp("nope")).toBe("");
    expect(formatTime("nope")).toBe("");
  });
});

describe("truncateName", () => {
  it("truncates long names with an ellipsis", () => {
    expect(truncateName("abcdefghijklmnopqrstuvwxyz")).toBe(
      "abcdefghijklmnopq…"
    );
  });

  it("keeps short names unchanged", () => {
    expect(truncateName("Alex")).toBe("Alex");
  });
});