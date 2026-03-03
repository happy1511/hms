import CustomHeader from "@/components/common/CustomHeader";
import { CustomSidebar } from "@/components/common/CustomSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <CustomHeader />
      <div className="relative h-[calc(100dvh-48px)]">
        <SidebarProvider className="h-[calc(100dvh-48px)] flex min-h-auto">
          <CustomSidebar />
          <div className="h-[calc(100dvh-48px)] overflow-auto grow p-3 bg-linear-to-b from-background to-white">
            {children}
          </div>
        </SidebarProvider>
      </div>
    </main>
  );
}
