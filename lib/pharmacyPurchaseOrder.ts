type PurchaseOrderDrugLike = {
  gstPercentage?: number | null;
  cGstPercentage?: number | null;
  sGstPercentage?: number | null;
  iGstPercentage?: number | null;
};

type PurchaseOrderItemLike = {
  quantity?: number | null;
  rate?: number | null;
  discountPercentage?: number | null;
  drug?: PurchaseOrderDrugLike | null;
};

export type PurchaseOrderLineSummary = {
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  lineTotal: number;
};

export type PurchaseOrderSummary = {
  itemCount: number;
  quantityTotal: number;
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  taxAmount: number;
  itemsTotal: number;
  packingForwarding: number;
  tcsAmount: number;
  roundOffAmount: number;
  grandTotal: number;
};

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const calculatePurchaseOrderLine = (
  item: PurchaseOrderItemLike,
): PurchaseOrderLineSummary => {
  const quantity = Number(item.quantity || 0);
  const rate = Number(item.rate || 0);
  const discountPercentage = Number(item.discountPercentage || 0);
  const grossAmount = round2(quantity * rate);
  const discountAmount = round2((grossAmount * discountPercentage) / 100);
  const taxableAmount = round2(Math.max(grossAmount - discountAmount, 0));
  const cGstAmount = round2(
    (taxableAmount * Number(item.drug?.cGstPercentage || 0)) / 100,
  );
  const sGstAmount = round2(
    (taxableAmount * Number(item.drug?.sGstPercentage || 0)) / 100,
  );
  const iGstAmount = round2(
    (taxableAmount * Number(item.drug?.iGstPercentage || 0)) / 100,
  );
  const lineTotal = round2(taxableAmount + cGstAmount + sGstAmount + iGstAmount);

  return {
    grossAmount,
    discountAmount,
    taxableAmount,
    cGstAmount,
    sGstAmount,
    iGstAmount,
    lineTotal,
  };
};

export const calculatePurchaseOrderSummary = (
  items: PurchaseOrderItemLike[],
  extras?: {
    packingForwarding?: number | null;
    tcsAmount?: number | null;
    roundOffAmount?: number | null;
  },
): PurchaseOrderSummary => {
  const packingForwarding = round2(Number(extras?.packingForwarding || 0));
  const tcsAmount = round2(Number(extras?.tcsAmount || 0));
  const roundOffAmount = round2(Number(extras?.roundOffAmount || 0));

  const base = items.reduce(
    (acc, item) => {
      const line = calculatePurchaseOrderLine(item);

      acc.itemCount += 1;
      acc.quantityTotal += Number(item.quantity || 0);
      acc.grossAmount = round2(acc.grossAmount + line.grossAmount);
      acc.discountAmount = round2(acc.discountAmount + line.discountAmount);
      acc.taxableAmount = round2(acc.taxableAmount + line.taxableAmount);
      acc.cGstAmount = round2(acc.cGstAmount + line.cGstAmount);
      acc.sGstAmount = round2(acc.sGstAmount + line.sGstAmount);
      acc.iGstAmount = round2(acc.iGstAmount + line.iGstAmount);
      acc.itemsTotal = round2(acc.itemsTotal + line.lineTotal);

      return acc;
    },
    {
      itemCount: 0,
      quantityTotal: 0,
      grossAmount: 0,
      discountAmount: 0,
      taxableAmount: 0,
      cGstAmount: 0,
      sGstAmount: 0,
      iGstAmount: 0,
      itemsTotal: 0,
    },
  );

  const taxAmount = round2(base.cGstAmount + base.sGstAmount + base.iGstAmount);
  const grandTotal = round2(
    base.itemsTotal + packingForwarding + tcsAmount + roundOffAmount,
  );

  return {
    ...base,
    taxAmount,
    packingForwarding,
    tcsAmount,
    roundOffAmount,
    grandTotal,
  };
};
