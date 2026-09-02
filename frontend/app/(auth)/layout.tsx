import BlankLayout from "@/components/layout/BlankLayout";
import { LoginVideoBackground } from "@/components/auth/LoginVideoBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BlankLayout>
      <div className="min-h-screen bg-background flex relative">
        <div className="fixed top-0 left-0 right-0 z-50 w-full">
          <nav className="w-full pointer-events-none">
            <div className="relative py-3 xl:py-4 px-4 sm:px-4 md:px-4 lg:px-4 xl:px-6 2xl:px-8 flex items-center">
              <span className="font-semibold text-base tracking-tight lg:text-white">
                SplitEase
              </span>
            </div>
          </nav>
        </div>

        <LoginVideoBackground />

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 pb-2">
          <div className="w-full max-w-md flex flex-col h-full">
            <div className="space-y-8 flex-1 flex flex-col justify-center">
              {children}
            </div>
          </div>
        </div>
      </div>
    </BlankLayout>
  );
}
