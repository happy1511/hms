import { DiscountType, PaymentCategory, PaymentMode } from "@/generated/prisma/enums";
import {
  Doctor,
  PatientType,
  PharmacyCustomerType,
  PharmacyInventoryItemType,
} from "@/lib/type";

export type SaleBillInventoryItem = PharmacyInventoryItemType;

export type SaleBillFormValues = {
  billDate: Date;
  customer?: PharmacyCustomerType | null;
  patient?: PatientType | null;
  doctor?: Doctor | null;
  isWholesaleBill: boolean;
  isLooseBill: boolean;
  billingType: PaymentCategory;
  discountType: DiscountType;
  discountValue: number;
  isFree: boolean;
  items: {
    inventoryItem?: SaleBillInventoryItem | null;
    quantity: number;
    isLooseQuantity: boolean;
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
