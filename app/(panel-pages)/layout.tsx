import CustomHeader from "@/components/common/CustomHeader";
import { CustomSidebar } from "@/components/common/CustomSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
