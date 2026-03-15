"use client";

import CustomButton from "@/components/common/CustomButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PrintPreferences = {
  includeHeader: boolean;
  setIncludeHeader: (next: boolean) => void;
};

export const PrintPreferencesContext = createContext<PrintPreferences>({
  includeHeader: true,
  setIncludeHeader: () => {},
});

const paramToBool = (value: string | null): boolean | null => {
  if (value === null) return null;
  if (value === "1" || value.toLowerCase() === "true") return true;
  if (value === "0" || value.toLowerCase() === "false") return false;
  return null;
};

const isPrintRoute = (pathname: string): boolean => {
  const patterns: RegExp[] = [
    /^\/invoice\/(print|summary|daywise|compact|transactions)\//,
    /^\/opd\/consultation-print\//,
    /^\/ipd\/admission-print\//,
    /^\/pathology-print\//,
    /^\/radiology-print\//,
    /^\/pharmacy\/(sale-invoice|sale-transactions)\//,
  ];
  return patterns.some((pattern) => pattern.test(pathname));
};

const PrintPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [includeHeader, setIncludeHeaderState] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isPrintRoute(pathname)) {
      setIncludeHeaderState(true);
      setShowModal(false);
      return;
    }

    const parsed = paramToBool(searchParams.get("includeHeader"));
    if (parsed === null) {
      setShowModal(true);
      return;
    }
    setIncludeHeaderState(parsed);
    setShowModal(false);
  }, [searchParams]);

  const setIncludeHeader = useCallback(
    (next: boolean) => {
      setIncludeHeaderState(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("includeHeader", next ? "1" : "0");
      router.replace(`${pathname}?${params.toString()}`);
      setShowModal(false);
    },
    [pathname, router, searchParams],
  );

  const value = useMemo(
    () => ({ includeHeader, setIncludeHeader }),
    [includeHeader, setIncludeHeader],
  );

  return (
    <PrintPreferencesContext.Provider value={value}>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md border-secondary border-4 bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm text-black/70">
              Print Settings
            </DialogTitle>
            <DialogDescription>
              Do you want to include the company header on this print?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <CustomButton variant="outline" onClick={() => setIncludeHeader(false)}>
              No
            </CustomButton>
            <CustomButton onClick={() => setIncludeHeader(true)}>Yes</CustomButton>
          </div>
        </DialogContent>
      </Dialog>

      {children}
    </PrintPreferencesContext.Provider>
  );
};

export default PrintPreferencesProvider;
