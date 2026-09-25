import Link from "next/link";
import { SplitEaseLogo } from "@/components/auth/SplitEaseLogo";
import { AuthFooter, FooterLink } from "@/components/auth/AuthFooter";
import { ArrowLeft, HelpCircle, Mail, MessageSquare, Shield, Users, Wallet } from "lucide-react";

export const metadata = {
  title: "Help & Support | SplitEase",
  description: "Find answers and support for managing and splitting shared expenses with SplitEase.",
};

const faqs = [
  {
    category: "Getting Started",
    icon: Users,
    items: [
      {
        question: "How do I create a group?",
        answer: "Navigate to Groups from your dashboard, click '+ New Group', enter a group name, and invite members by their email addresses.",
      },
      {
        question: "Do my friends need an account to be in a group?",
        answer: "Friends can be added to expenses right away, and they will receive an email invite to join and view real-time balance calculations.",
      },
    ],
  },
  {
    category: "Expenses & Balances",
    icon: Wallet,
    items: [
      {
        question: "How are balances calculated?",
        answer: "SplitEase uses an optimized debt simplification algorithm to minimize the total number of transactions needed to settle up all group debts.",
      },
      {
        question: "Can expenses be split unequally?",
        answer: "Yes, you can split expenses equally, by exact amounts, or by percentage shares when creating or editing an expense.",
      },
    ],
  },
  {
    category: "Account & Security",
    icon: Shield,
    items: [
      {
        question: "How do I verify my email?",
        answer: "When signing up, a 6-digit verification code is sent to your email. Enter this code on the verification page to activate your account.",
      },
      {
        question: "Is my financial data secure?",
        answer: "Yes. SplitEase uses industry-standard encryption, secure session tokens, and never stores raw bank credentials or unhashed passwords.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Header */}
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
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HelpCircle className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How can we help you?
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Frequently asked questions and support resources for SplitEase.
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-10">
            {faqs.map((section) => (
              <div key={section.category} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <section.icon className="size-5" />
                  </div>
                  <h2 className="text-xl font-semibold">{section.category}</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-muted/40 p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-1.5">
                        {item.question}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support Card */}
          <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Mail className="size-5" />
            </div>
            <h3 className="text-lg font-semibold">Still have questions?</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
              Need personalized assistance with your account or a group expense? Our team is here to help.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <a
                href="mailto:support@splitease.com"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="size-4" />
                Contact Support
              </a>
            </div>
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
