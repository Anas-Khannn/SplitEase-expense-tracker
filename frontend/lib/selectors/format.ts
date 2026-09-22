export function formatCurrency(value: number | string): string {
  const numeric = typeof value === "number" ? value : Number(value);
  if (typeof value === "string") {
    if (Number.isNaN(numeric)) return value;
  } else if (!Number.isFinite(numeric)) {
    return "—";
  }
  return numeric.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCompactCurrency(value: number): string {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

export function formatBalance(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatDate(
  iso: string,
  format: "short" | "long" = "short"
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: format,
    day: "numeric",
  });
}

export function formatTimestamp(iso: string): string {
  return formatDate(iso, "short");
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function truncateName(value: string, maxLength = 18): string {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}…`
    : value;
}