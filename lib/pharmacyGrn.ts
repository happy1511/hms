type GrnDrugLike = {
  cGstPercentage?: number | null;
  sGstPercentage?: number | null;
  iGstPercentage?: number | null;
};

type GrnItemLike = {
  quantity?: number | null;
  freeQuantity?: number | null;
  purchasePrice?: number | null;
  drug?: GrnDrugLike | null;
};

export type GrnLineSummary = {
  grossAmount: number;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  lineTotal: number;
};

export type GrnSummary = {
  itemCount: number;
  quantityTotal: number;
  receivedQuantityTotal: number;
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  taxAmount: number;
  itemsTotal: number;
  tcsAmount: number;
  packingForwarding: number;
  roundOffAmount: number;
  cnAmount: number;
  grandTotal: number;
  lines: GrnLineSummary[];
};

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateGrnSummary = (
  items: GrnItemLike[],
  extras?: {
    discountAmount?: number | null;
    tcsAmount?: number | null;
    packingForwarding?: number | null;
    roundOffAmount?: number | null;
    cnAmount?: number | null;
  },
): GrnSummary => {
  const grossAmount = round2(
    items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0) * Number(item.purchasePrice || 0),
      0,
    ),
  );
  const discountInput = round2(Number(extras?.discountAmount || 0));
  const discountAmount = round2(Math.min(Math.max(discountInput, 0), grossAmount));
  const discountRatio = grossAmount > 0 ? discountAmount / grossAmount : 0;

  const lines = items.map((item) => {
    const grossLineAmount = round2(
      Number(item.quantity || 0) * Number(item.purchasePrice || 0),
    );
    const taxableAmount = round2(
      Math.max(grossLineAmount - grossLineAmount * discountRatio, 0),
    );
    const cGstAmount = round2(
      (taxableAmount * Number(item.drug?.cGstPercentage || 0)) / 100,
    );
    const sGstAmount = round2(
      (taxableAmount * Number(item.drug?.sGstPercentage || 0)) / 100,
    );
    const iGstAmount = round2(
      (taxableAmount * Number(item.drug?.iGstPercentage || 0)) / 100,
    );

    return {
      grossAmount: grossLineAmount,
      taxableAmount,
      cGstAmount,
      sGstAmount,
      iGstAmount,
      lineTotal: round2(
        taxableAmount + cGstAmount + sGstAmount + iGstAmount,
      ),
    };
  });

  const base = items.reduce(
    (acc, item, index) => {
      const line = lines[index];

      acc.itemCount += 1;
      acc.quantityTotal += Number(item.quantity || 0);
      acc.receivedQuantityTotal +=
        Number(item.quantity || 0) + Number(item.freeQuantity || 0);
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
      receivedQuantityTotal: 0,
      taxableAmount: 0,
      cGstAmount: 0,
      sGstAmount: 0,
      iGstAmount: 0,
      itemsTotal: 0,
    },
  );

  const tcsAmount = round2(Number(extras?.tcsAmount || 0));
  const packingForwarding = round2(Number(extras?.packingForwarding || 0));
  const roundOffAmount = round2(Number(extras?.roundOffAmount || 0));
  const cnAmount = round2(Number(extras?.cnAmount || 0));
  const taxAmount = round2(base.cGstAmount + base.sGstAmount + base.iGstAmount);
  const grandTotal = round2(
    base.itemsTotal + tcsAmount + packingForwarding + roundOffAmount - cnAmount,
  );

  return {
    itemCount: base.itemCount,
    quantityTotal: base.quantityTotal,
    receivedQuantityTotal: base.receivedQuantityTotal,
    grossAmount,
    discountAmount,
    taxableAmount: base.taxableAmount,
    cGstAmount: base.cGstAmount,
    sGstAmount: base.sGstAmount,
    iGstAmount: base.iGstAmount,
    taxAmount,
    itemsTotal: base.itemsTotal,
    tcsAmount,
    packingForwarding,
    roundOffAmount,
    cnAmount,
    grandTotal,
    lines,
  };
};
