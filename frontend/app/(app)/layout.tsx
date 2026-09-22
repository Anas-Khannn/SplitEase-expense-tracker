"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SidebarInset, SidebarMenuSkeleton } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 border-r border-sidebar-border p-2">
      <SidebarMenuSkeleton showIcon className="h-12 py-2" />
      <SidebarMenuSkeleton showIcon />
      <SidebarMenuSkeleton showIcon />
      <SidebarMenuSkeleton showIcon />
      <SidebarMenuSkeleton showIcon />
      <SidebarMenuSkeleton showIcon />
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "initializing") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3" role="status" aria-label="Loading application">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex h-full w-full min-w-0">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <SidebarInset className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto size-full max-w-7xl flex-1 px-4 pt-6 pb-20 sm:px-8 sm:pt-8 md:pb-8">
          {children}
        </main>
        <Toaster />
        <Footer />
        <MobileBottomNav />
      </SidebarInset>
    </div>
  );
}
