"use client";

import CustomButton from "@/components/common/CustomButton";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const getFallbackPath = (pathname: string) => {
  if (pathname.includes("/purchase-order/")) return "/pharmacy/purchase-order";
  if (pathname.includes("/challan/")) return "/pharmacy/challan";
  if (pathname.includes("/grn/")) return "/pharmacy/grn";
  if (pathname.includes("/sale-bill/")) return "/pharmacy/sale-bill";
  if (pathname.includes("/sale-return/")) return "/pharmacy/sale-return/select";
  if (pathname.includes("/supplier-return/")) return "/pharmacy/supplier-return";
  if (pathname.includes("/supplier-payment/")) return "/pharmacy/supplier-payment";
  if (pathname.includes("/supplier-credit-note/")) {
    return "/pharmacy/supplier-credit-note";
  }
  if (pathname.includes("/supplier-ledger/")) return "/pharmacy/supplier-ledger";
  if (pathname.includes("/stock-correction")) return "/pharmacy";
  if (pathname.includes("/ipd-issue/")) return "/pharmacy/ipd-issue";
  if (pathname.includes("/ipd-return/")) return "/pharmacy/ipd-return";
  return "/pharmacy";
};

export default function PharmacyFormLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(getFallbackPath(pathname));
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-white p-3">
      <div className="mb-3">
        <CustomButton type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Back
        </CustomButton>
      </div>
      {children}
    </main>
  );
}
