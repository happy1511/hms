import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ApiResponse, User } from "./type";
import { AxiosError } from "axios";
import { toast } from "sonner";

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
  toast.error(
    error.response?.data.message || error.message || "Something went wrong",
  );
};
