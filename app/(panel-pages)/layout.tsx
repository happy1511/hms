"use client";

import CommonLoader from "@/components/common/CommonLoader";
import CustomHeader from "@/components/common/CustomHeader";
import { CustomSidebar } from "@/components/common/CustomSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useProfile } from "@/hooks/query/auth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading } = useProfile();

  if (isLoading) {
    return <CommonLoader fullScreen label="Loading your workspace" />;
  }

  return (
    <SidebarProvider className="flex min-h-screen flex-col">
      <main>
        <CustomHeader />
        <div className="relative h-[calc(100dvh-48px)] flex justify-end">
          <CustomSidebar />
          <div className="w-[calc(100dvw-var(--sidebar-width))] h-[calc(100dvh-48px)] overflow-auto grow p-3 bg-linear-to-b from-background to-white">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
