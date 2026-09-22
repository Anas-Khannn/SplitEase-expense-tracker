import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bolt,
  Building2,
  CheckCircle2,
  ChevronRight,
  HandCoins,
  Home as HomeIcon,
  LayoutGrid,
  MapPin,
  Plane,
  PlayCircle,
  Quote,
  SlidersHorizontal,
  Star,
  Waypoints,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DotPattern } from "@/components/auth/DotPattern";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

export const metadata: Metadata = {
  title: "SplitEase — Split expenses without the awkwardness",
  description:
    "Track shared costs with friends, roommates, and trips. SplitEase keeps everyone even — automatically.",
};

const trustItems = ["No credit card required", "Free forever for small groups"];

const logos: { icon: LucideIcon; label: string }[] = [
  { icon: Building2, label: "Acme Co" },
  { icon: Bolt, label: "Bolt Trip" },
  { icon: LayoutGrid, label: "Linear Living" },
  { icon: HomeIcon, label: "Loom Coliving" },
  { icon: Plane, label: "NomadStay" },
  { icon: MapPin, label: "UrbanShare" },
];

const features = [
  {
    icon: SlidersHorizontal,
    label: "Granular Control",
    title: "Group expenses",
    description:
      "Organize trips, housemates, or outings with granular split options: exact dollar splits, custom percentages, or custom shares down to the cent.",
    footer: "Flexible multi-payer logic",
  },
  {
    icon: Waypoints,
    label: "Graph Optimization",
    title: "Automatic balances",
    description:
      "Smart debt simplification algorithm reduces total transactions so groups settle faster without endless back-and-forth bank transfers.",
    footer: "Up to 70% fewer transfers",
  },
  {
    icon: HandCoins,
    label: "Direct Pay",
    title: "One-tap settle up",
    description:
      "Instant settlement logging via integrated payment links, or quick cash logging with automatic receipt archival for undisputed records.",
    footer: "Direct deep-link to payment apps",
  },
];

const steps = [
  {
    number: "01",
    title: "Add your group in seconds",
    description:
      "Instant web-based join links. Friends simply click and are immediately added with zero passwords or forced app store installations required.",
  },
  {
    number: "02",
    title: "Capture every cost on the fly",
    description:
      "Snap receipts, configure multi-currency conversions automatically, and assign itemized dinner shares with intuitive tap selectors.",
  },
  {
    number: "03",
    title: "Square up without math",
    description:
      "One-touch ledger clearance. Our balance algorithm cancels redundant intermediate debts so you just pay the final simplified person.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <LandingNav />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <DotPattern className="opacity-60 [mask-image:radial-gradient(ellipse_at_top,white,transparent_75%)]" />
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pb-12 pt-16 text-center md:pb-16 md:pt-24">
          <a
            href="#dashboard-preview"
            className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-500"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            New · Settle up instantly
            <ArrowRight className="size-3.5 text-zinc-400" aria-hidden="true" />
          </a>

          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Split expenses without the awkwardness
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Track shared costs with friends, roommates, and trips. SplitEase
            keeps everyone even — automatically.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
            >
              Get started free
              <ArrowRight className="size-[18px]" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground sm:w-auto"
            >
              <PlayCircle className="size-[18px] text-zinc-500" aria-hidden="true" />
              See how it works
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            {trustItems.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-emerald-600 dark:text-emerald-500"
                  aria-hidden="true"
                />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* Dashboard mockup */}
        <section
          id="dashboard-preview"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-20 sm:px-6"
        >
          <DashboardMockup />
        </section>

        {/* Social proof */}
        <section className="border-y border-border bg-zinc-50/50 py-10 dark:bg-zinc-900/30">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Trusted by 20,000+ groups, roommates, and travel squads worldwide
            </p>
            <div className="grid grid-cols-2 items-center justify-items-center gap-6 opacity-80 sm:grid-cols-3 md:grid-cols-6">
              {logos.map((logo) => (
                <div
                  key={logo.label}
                  className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-zinc-900 transition-colors hover:text-foreground dark:text-zinc-100"
                >
                  <logo.icon className="size-[18px]" aria-hidden="true" />
                  {logo.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20"
        >
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Core Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Built for absolute fairness, zero headaches
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Every detail engineered to handle complicated real-world splits
              without math quarrels.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm dark:hover:border-zinc-600"
              >
                <div>
                  <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {feature.label}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 border-t border-zinc-100 pt-4 text-xs font-medium text-muted-foreground dark:border-zinc-800">
                  <span>{feature.footer}</span>
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-border bg-zinc-50/40 py-20 dark:bg-zinc-900/20"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workflow
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                Settling up in three simple steps
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                No mandatory app download for participants. Invite, log, square
                up.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-xl border border-border bg-card p-6 shadow-xs"
                >
                  <div className="mb-4 font-mono text-xs font-bold tracking-wider text-muted-foreground">
                    {step.number}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section
          id="testimonials"
          className="mx-auto max-w-4xl scroll-mt-24 px-6 py-20"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm md:p-12">
            <Quote
              className="pointer-events-none absolute -bottom-6 -right-6 size-[140px] select-none text-zinc-100 dark:text-zinc-800"
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="size-5 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="text-xl font-medium leading-relaxed text-foreground md:text-2xl">
                &ldquo;SplitEase ended all roommate awkwardness on day one. We
                used to spend hours every month untangling Venmo transfers —
                now everyone settles in a single tap.&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  AC
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Alex Chen
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Verified Group Admin · Apartment in Brooklyn, NY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section
          id="get-started"
          className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20"
        >
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center text-white shadow-xl dark:border-zinc-700 md:p-14">
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Start splitting today
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
                Join over 80,000 roommates and travelers keeping expenses
                seamless and drama-free. Set up your first balance sheet in 30
                seconds.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-sm transition-all hover:bg-zinc-100 active:scale-[0.98] sm:w-auto"
                >
                  Get SplitEase free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/80 px-6 py-3 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800 sm:w-auto"
                >
                  Log in to your group
                </Link>
              </div>
              <div className="mt-6 text-xs text-zinc-500">
                Instant setup · No card required · Works right in your browser
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}