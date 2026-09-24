import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/index";
import "./globals.css";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitEase",
  description: "Split expenses effortlessly with friends",
  applicationName: "SplitEase",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SplitEase",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#6c5ce0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "flex min-h-full w-full antialiased"
      )}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full w-full flex-auto flex-col">
        <Providers sidebarDefaultOpen={true}>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
        <ScrollToTop />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
