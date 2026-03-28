import InvoiceDetails from "@/app-pages/invoice/InvoiceDetails";
import { SidebarProvider } from "@/components/ui/sidebar";

const page = () => {
  return (
    <main>
      {/* <CustomHeader /> */}
      <SidebarProvider className="flex min-h-screen flex-col">
        {/* <CustomSidebar /> */}
        <div className="relative h-full flex grow overflow-auto bg-linear-to-b from-background to-white">
          <InvoiceDetails />
        </div>
      </SidebarProvider>
    </main>
  );
};

export default page;
