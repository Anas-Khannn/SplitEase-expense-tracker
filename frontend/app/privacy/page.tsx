import Link from "next/link";
import { SplitEaseLogo } from "@/components/auth/SplitEaseLogo";
import { AuthFooter, FooterLink } from "@/components/auth/AuthFooter";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SplitEase",
  description: "Privacy policy and data protection practices for SplitEase.",
};

export default function PrivacyPage() {
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
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">
              <ShieldCheck className="size-3.5" />
              Privacy & Security
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: September 2026
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
              <p>
                We collect your name, email address, password hash, and the expense records, group details, and settlements that you and your group members submit to the service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>
                Your data is used solely to authenticate your account, send verification codes, compute shared balances, and deliver real-time group activity notifications. We never sell your personal or financial data to third-party advertisers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">3. Security Standards</h2>
              <p>
                Passwords are protected using bcrypt cryptographic hashing with salt rounds. All API communications are secured via TLS encryption, and authentication tokens are signed with HMAC SHA-256.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">4. Data Retention & Deletion</h2>
              <p>
                You can request account deletion or export your group transaction history at any time. When an account is removed, all personally identifiable records are permanently deleted from active databases.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Contact Information</h2>
              <p>
                If you have questions or concerns about our privacy practices, please contact our data protection team at{" "}
                <a href="mailto:privacy@splitease.com" className="text-primary hover:underline">
                  privacy@splitease.com
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
