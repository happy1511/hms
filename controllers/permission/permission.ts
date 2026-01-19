import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";

export const getAPI = async (req: Request) => {
  return validateRequest({
    req,
    onSuccess: async () => {
      const permissions = await prisma.permission.findMany({
        select: { action: true, module: true },
      });
      const moduleMap = new Map<
        number,
        {
          module: {
            name: string;
            id: number;
          };
          actions: { id: number; name: string }[];
        }
      >();

      permissions.forEach((up) => {
        const { module, action } = up;

        if (!moduleMap.has(module.id)) {
          moduleMap.set(module.id, {
            module,
            actions: [],
          });
        }

        moduleMap.get(module.id)?.actions.push(action);
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Permissions Fetched Successfully",
        data: Array.from(moduleMap.values()),
      });
    },
  });
};
