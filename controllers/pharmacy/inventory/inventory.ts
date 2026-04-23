import { Prisma } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const skip = (page - 1) * limit;

      const and: Prisma.InventoryItemsWhereInput[] = [
        {
          quantityInStock: {
            gt: 0,
          },
        },
      ];

      if (search) {
        and.push({
          OR: [
            { drug: { name: { contains: search } } },
            { drug: { manufacturer: { contains: search } } },
            { supplier: { name: { contains: search } } },
          ],
        });
      }

      const where: Prisma.InventoryItemsWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.inventoryItems.findMany({
          skip,
          take: limit,
          where,
          orderBy: { id: "desc" },
          include: {
            drug: true,
            supplier: true,
            hsnSac: true,
          },
        }),
        prisma.inventoryItems.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Inventory fetched successfully",
        data: items,
        total,
      });
    },
  });
};
