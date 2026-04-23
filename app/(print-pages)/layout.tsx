import PrintPreferencesProvider from "@/components/common/PrintPreferencesProvider";
import { Suspense } from "react";

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintPreferencesProvider>{children}</PrintPreferencesProvider>
    </Suspense>
  );
}
