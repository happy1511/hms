"use client";

import Barcode from "react-barcode";

const valueOrDash = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
};

const PrintBarcodeValue = ({
  value,
  className = "",
}: {
  value?: string | number | null;
  className?: string;
}) => {
  const displayValue = valueOrDash(value);
  const barcodeValue = displayValue === "--" ? null : displayValue;

  return (
    <div className={`flex min-h-full flex-col items-center justify-center gap-1 ${className}`}>
      {barcodeValue && (
        <Barcode
          value={barcodeValue}
          format="CODE128"
          displayValue={false}
          margin={0}
          width={1}
          height={28}
          fontSize={10}
          background="transparent"
        />
      )}
      <span className="text-center leading-none">{displayValue}</span>
    </div>
  );
};

export default PrintBarcodeValue;
