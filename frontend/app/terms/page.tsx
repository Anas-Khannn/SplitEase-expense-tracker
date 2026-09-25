import Link from "next/link";
import { SplitEaseLogo } from "@/components/auth/SplitEaseLogo";
import { AuthFooter, FooterLink } from "@/components/auth/AuthFooter";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | SplitEase",
  description: "Terms and conditions for using SplitEase shared expense tracking.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <SplitEaseLogo variant="circles" />
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary mb-3">
              <FileText className="size-3.5" />
              Legal Agreement
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: September 2026
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By creating an account or accessing the SplitEase application, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2. User Accounts & Verification</h2>
              <p>
                To use SplitEase, you must register with a valid email address and verify your identity via a one-time passcode (OTP). You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">3. Expense Sharing & Balances</h2>
              <p>
                SplitEase provides balance calculation and debt simplification tools for social and shared expense management. SplitEase is not a bank, money transmitter, or depository institution. SplitEase does not directly hold or transfer funds between users.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">4. Acceptable Use</h2>
              <p>
                You agree not to use the service for any unlawful purposes, fraud, money laundering, or harassment of other group members. We reserve the right to suspend or terminate accounts that violate community safety standards.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Limitation of Liability</h2>
              <p>
                SplitEase is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. Under no circumstances shall SplitEase be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">6. Modifications & Contact</h2>
              <p>
                We may revise these Terms of Service at any time. For questions regarding our terms, please contact us at{" "}
                <a href="mailto:legal@splitease.com" className="text-primary hover:underline">
                  legal@splitease.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AuthFooter
        left={<span className="text-xs">© {new Date().getFullYear()} SplitEase Inc. All rights reserved.</span>}
        right={
          <>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/help">Help Center</FooterLink>
          </>
        }
      />
    </div>
  );
}
