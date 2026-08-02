import { ActionType, DiscountType, ModuleType } from "@/generated/prisma/enums";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ApiResponse,
  InvoiceGroupedBySection,
  InvoiceItem,
  User,
} from "./type";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  addYears,
  addMonths,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//make a function to generate uuid which will be used in loginId
export function generateUUID(): string {
  return crypto.randomUUID();
}

export const hasModulePermission = (
  data: User,
  module: ModuleType | ModuleType[],
): boolean => {
  const modules = Array.isArray(module) ? module : [module];

  const permissionMap: Partial<Record<ModuleType, ActionType[]>> =
    data.permissions.reduce(
      (acc, item) => {
        acc[item.module.name as ModuleType] = item.actions.map((a) => a.name);
        return acc;
      },
      {} as Partial<Record<ModuleType, ActionType[]>>,
    ) ?? {};

  // ✅ check if ANY module has at least one action
  return modules.some((m) => {
    const actions = permissionMap[m];
    return actions && actions.length > 0;
  });
};

export const hasActionPermission = (
  data: User,
  module: ModuleType,
  action: ActionType,
) => {
  const permissionMap: Partial<Record<ModuleType, ActionType[]>> =
    data.permissions.reduce(
      (acc, item) => {
        acc[item.module.name as ModuleType] = item.actions.map((a) => a.name);
        return acc;
      },
      {} as Partial<Record<ModuleType, ActionType[]>>,
    ) ?? {};

  return permissionMap[module]?.includes(action);
};

export const showError = (error: AxiosError<ApiResponse<null>>) => {
  const responseData = error.response?.data as
    | (ApiResponse<unknown> & { data?: unknown })
    | undefined;
  const detailedMessage =
    typeof responseData?.data === "string" ? responseData.data : undefined;

  toast.error(
    detailedMessage ||
      responseData?.message ||
      error.message ||
      "Something went wrong",
  );
};

export const getDiscountTypeLabel = (discountType: DiscountType) => {
  return discountType === DiscountType.PERCENTAGE ? "%" : "Rs";
};

export const getDiscountTypeOptions = () => {
  return Object.values(DiscountType).map((discountType) => ({
    value: discountType,
    label: getDiscountTypeLabel(discountType),
  }));
};

export function getAgeFromDOB(dob: Date | string) {
  const birthDate = new Date(dob);
  const today = new Date();

  // total years
  const years = differenceInYears(today, birthDate);

  // remaining months after removing years
  const dateAfterYears = addYears(birthDate, years);
  const months = differenceInMonths(today, dateAfterYears);

  // remaining days after removing months
  const dateAfterMonths = addMonths(dateAfterYears, months);
  const days = differenceInDays(today, dateAfterMonths);

  return { years, months, days };
}

export function formatAge(dob: Date | string) {
  const { years, months, days } = getAgeFromDOB(dob);

  if (!days) {
    if (!months) {
      return `${years}y`;
    } else {
      return `${years}y  ${months}m`;
    }
  } else {
    if (!months) {
      return `${years}y ${days}d`;
    } else {
      return `${years}y  ${months}m ${days}d`;
    }
  }
}

export const toDays = (
  days?: number | null,
  months?: number | null,
  years?: number | null,
) => {
  return (days ?? 0) + (months ?? 0) * 30 + (years ?? 0) * 365;
};

export const fromDays = (totalDays: number) => {
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;

  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;

  return {
    years,
    months,
    days,
  };
};

export const amount = (value: number) => value.toFixed(2);
export const lineGross = (item: Pick<InvoiceItem, "qty" | "price">) =>
  item.qty * item.price;
export const lineNet = (
  item: Pick<InvoiceItem, "discount" | "qty" | "price">,
) => Math.max(lineGross(item) - (item.discount || 0), 0);

export const filterSections = (
  data: InvoiceGroupedBySection,
  sectionIds: Set<string> | null,
) =>
  sectionIds
    ? {
        ...data,
        sections: data.sections.filter((section) => {
          const sectionId = String(section?.id);
          return sectionIds.has(sectionId);
        }),
      }
    : data;

//make full name with optional fields middleName and title
export const fullName = (user: {
  title?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
}) =>
  [user?.title, user?.firstName, user?.middleName, user?.lastName]
    .filter(Boolean)
    .join(" ");
