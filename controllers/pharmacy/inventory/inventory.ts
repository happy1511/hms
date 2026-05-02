import { Prisma } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  stockCorrectionParamsValidator,
  stockCorrectionValidator,
} from "@/validators/api/masters/pharmacyStockCorrection";
import { User } from "@/generated/prisma/client";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const supplierId = query.supplierId ? Number(query.supplierId) : undefined;
      const drugId = query.drugId ? Number(query.drugId) : undefined;
      const includeZeroStock = Boolean(query.includeZeroStock);
      const skip = (page - 1) * limit;

      const and: Prisma.InventoryItemsWhereInput[] = [];

      if (!includeZeroStock) {
        and.push({
          quantityInStock: {
            gt: 0,
          },
        });
      }

      if (search) {
        and.push({
          OR: [
            { drug: { name: { contains: search } } },
            { drug: { manufacturer: { contains: search } } },
            { supplier: { name: { contains: search } } },
          ],
        });
      }

      if (supplierId) {
        and.push({ supplierId });
      }

      if (drugId) {
        and.push({ drugId });
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

export const updateStockCorrectionAPI = async (
  req: Request,
  { params }: { params: { inventoryItemId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: stockCorrectionValidator,
    paramsSchema: stockCorrectionParamsValidator,
    params,
    req,
    user,
    onSuccess: async ({ body, params, user }) => {
      const inventoryItem = await prisma.inventoryItems.findFirst({
        where: {
          id: params.inventoryItemId,
        },
        include: {
          drug: true,
          supplier: true,
          hsnSac: true,
        },
      });

      if (!inventoryItem) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Inventory item not found",
        });
      }

      const updated = await prisma.inventoryItems.update({
        where: {
          id: inventoryItem.id,
        },
        data: {
          batchNo: Number(body.batchNo),
          expiryDate: body.expiryDate,
          mrp: Number(body.mrp),
          quantityInStock: Number(body.quantityInStock),
          sellingPrice: Number(body.sellingPrice),
          itemsPerPack: Number(body.itemsPerPack),
          updatedBy: user.id,
        },
        include: {
          drug: true,
          supplier: true,
          hsnSac: true,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Stock corrected successfully",
        data: updated,
      });
    },
  });
};
