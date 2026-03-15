import PrintPreferencesProvider from "@/components/common/PrintPreferencesProvider";

export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PrintPreferencesProvider>{children}</PrintPreferencesProvider>;
}

