import { DiscountType, PaymentCategory, PaymentMode } from "@/generated/prisma/enums";
import { InventoryItemsGetPayload } from "@/generated/prisma/models";
import { Doctor, PatientType, PharmacyCustomerType } from "@/lib/type";

export type SaleBillInventoryItem = InventoryItemsGetPayload<{
  include: {
    drug: true;
    supplier: true;
  };
}>;

export type SaleBillFormValues = {
  billDate: Date;
  customer?: PharmacyCustomerType | null;
  patient?: PatientType | null;
  doctor?: Doctor | null;
  isWholesaleBill: boolean;
  billingType: PaymentCategory;
  discountType: DiscountType;
  discountValue: number;
  isFree: boolean;
  items: {
    inventoryItem?: SaleBillInventoryItem | null;
    quantity: number;
    rate: number;
    discountType: DiscountType;
    discountValue: number;
    taxableAmount: number;
    gstAmount: number;
    cGstAmount: number;
    sGstAmount: number;
    iGstAmount: number;
    total: number;
  }[];
  paymentAmount: number;
  paymentMode: PaymentMode;
  paymentRemarks?: string | null;
};
