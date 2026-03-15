import { prisma } from "@/services/prisma";
import { ActionType, ModuleType } from "@/generated/prisma/enums";

export const hasUserPermission = async (
  userId: number,
  module: ModuleType,
  action: ActionType,
) => {
  const found = await prisma.userPermission.findFirst({
    where: {
      userId,
      permission: {
        module: { name: module },
        action: { name: action },
      },
    },
    select: { id: true },
  });

  return Boolean(found);
};

