import Link from "next/link";
import { SplitEaseLogo } from "@/components/auth/SplitEaseLogo";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Sign Up", href: "/signup" },
  { label: "Log In", href: "/login" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Security", href: "#" },
];

const resourcesLinks = [
  { label: "Help Center", href: "#" },
  { label: "API Docs", href: "#" },
  { label: "Status", href: "#" },
  { label: "Changelog", href: "#" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
      <ul className="space-y-2 text-xs">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 space-y-4">
            <SplitEaseLogo variant="circles" />
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              The modern, fair, and frictionless expense ledger engineered for
              flatmates, couples, trips, and squad living.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              v2.4 Systems operational
            </div>
          </div>
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Resources" links={resourcesLinks} />
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 text-xs text-muted-foreground dark:border-zinc-800 sm:flex-row">
          <div>© 2025 SplitEase Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors duration-150 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}