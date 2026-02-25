import InvoiceDetails from "@/app-pages/invoice/InvoiceDetails";

const page = () => {
  return (
    <main>
      <header className="h-12 flex items-center border-b border-border bg-linear-to-r from-background to-white px-4">
        {/* <SidebarTrigger /> */}
        <span className="ml-4 text-sm font-medium text-foreground">
          Hospital Management System
        </span>
      </header>
      <div className="relative h-[calc(100dvh-48px)]">
        <InvoiceDetails />
      </div>
    </main>
  );
};

export default page;
