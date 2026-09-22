export interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

export function breadcrumbSegments(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const href = "/" + segments.slice(0, index + 1).join("/");

    return {
      label,
      href,
      isLast: index === segments.length - 1,
    };
  });
}