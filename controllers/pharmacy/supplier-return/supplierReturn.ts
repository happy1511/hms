import { Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { supplierReturnValidator } from "@/validators/api/masters/pharmacySupplierReturn";

const round2 = (value: number) => Number(value.toFixed(2));

const toPieces = ({
  quantity,
  isLooseQuantity,
  packSize,
}: {
  quantity: number;
  isLooseQuantity: boolean;
  packSize: number;
}) => (isLooseQuantity ? Number(quantity || 0) : Number(quantity || 0) * packSize);

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const supplierId = query.supplierId ? Number(query.supplierId) : undefined;
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const skip = (page - 1) * limit;

      const and: Prisma.SupplierReturnWhereInput[] = [{ isDeleted: false }];

      if (search) {
        and.push({
          OR: [
            { supplier: { name: { contains: search } } },
            { returnReason: { contains: search } },
          ],
        });
      }

      if (supplierId) {
        and.push({ supplierId });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          returnDate: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.SupplierReturnWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.supplierReturn.findMany({
          skip,
          take: limit,
          where,
          orderBy: { id: "desc" },
          include: {
            supplier: true,
            items: {
              include: {
                inventoryItem: {
                  include: {
                    drug: true,
                    supplier: true,
                    hsnSac: true,
                  },
                },
              },
            },
          },
        }),
        prisma.supplierReturn.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Supplier returns fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: supplierReturnValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        const supplier = await tx.drugSupplier.findFirst({
          where: {
            id: body.supplierId,
            isDeleted: false,
          },
          select: { id: true, name: true },
        });

        if (!supplier) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Supplier not found",
          });
        }

        const inventoryIds = [...new Set(body.items.map((item) => item.inventoryItem.id))];
        const inventoryRows = await tx.inventoryItems.findMany({
          where: {
            id: { in: inventoryIds },
            supplierId: body.supplierId,
          },
          include: {
            drug: true,
            supplier: true,
            hsnSac: true,
          },
        });

        if (inventoryRows.length !== inventoryIds.length) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "One or more inventory items were not found for the selected supplier",
          });
        }

        const inventoryById = new Map(inventoryRows.map((row) => [row.id, row]));
        const preparedItems = body.items.map((item) => {
          const inventory = inventoryById.get(item.inventoryItem.id)!;
          const packSize = Math.max(Number(inventory.itemsPerPack || 1), 1);
          const requestedPieces = toPieces({
            quantity: Number(item.quantity || 0),
            isLooseQuantity: Boolean(item.isLooseQuantity),
            packSize,
          });

          if (requestedPieces > Number(inventory.quantityInStock || 0)) {
            throw new Error(`Insufficient stock for ${inventory.drug.name}`);
          }

          const packageRate = Number(inventory.purchasePrice || 0);
          const perPieceRate = packageRate / packSize;
          const rate = Boolean(item.isLooseQuantity) ? perPieceRate : packageRate;
          const taxableAmount = round2(rate * Number(item.quantity || 0));
          const cGstPercentage = Number(inventory.hsnSac?.cGstPercentage || 0);
          const sGstPercentage = Number(inventory.hsnSac?.sGstPercentage || 0);
          const iGstPercentage = Number(inventory.hsnSac?.iGstPercentage || 0);
          const gstPercentage = cGstPercentage + sGstPercentage + iGstPercentage;
          const cGstAmount = round2((taxableAmount * cGstPercentage) / 100);
          const sGstAmount = round2((taxableAmount * sGstPercentage) / 100);
          const iGstAmount = round2((taxableAmount * iGstPercentage) / 100);
          const total = round2(
            taxableAmount + cGstAmount + sGstAmount + iGstAmount,
          );

          return {
            inventoryItemId: inventory.id,
            quantity: Number(item.quantity || 0),
            isLooseQuantity: Boolean(item.isLooseQuantity),
            rate: round2(rate),
            taxableAmount,
            gstPercentage: round2(gstPercentage),
            cGstPercentage,
            sGstPercentage,
            iGstPercentage,
            cGstAmount,
            sGstAmount,
            iGstAmount,
            total,
            requestedPieces,
          };
        });

        const summary = preparedItems.reduce(
          (acc, item) => {
            acc.taxableAmount += item.taxableAmount;
            acc.cGstAmount += item.cGstAmount;
            acc.sGstAmount += item.sGstAmount;
            acc.iGstAmount += item.iGstAmount;
            acc.total += item.total;
            return acc;
          },
          {
            taxableAmount: 0,
            cGstAmount: 0,
            sGstAmount: 0,
            iGstAmount: 0,
            total: 0,
          },
        );

        const created = await tx.supplierReturn.create({
          data: {
            supplierId: supplier.id,
            returnDate: body.returnDate,
            returnReason: body.returnReason,
            taxableAmount: round2(summary.taxableAmount),
            cGstAmount: round2(summary.cGstAmount),
            sGstAmount: round2(summary.sGstAmount),
            iGstAmount: round2(summary.iGstAmount),
            total: round2(summary.total),
            createdBy: user.id,
            updatedBy: user.id,
            items: {
              create: preparedItems.map(({ requestedPieces, ...item }) => item),
            },
          },
          include: {
            supplier: true,
            items: {
              include: {
                inventoryItem: {
                  include: {
                    drug: true,
                    supplier: true,
                    hsnSac: true,
                  },
                },
              },
            },
          },
        });

        for (const item of preparedItems) {
          await tx.inventoryItems.update({
            where: { id: item.inventoryItemId },
            data: {
              quantityInStock: {
                decrement: item.requestedPieces,
              },
              updatedBy: user.id,
            },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Supplier return created successfully",
          data: created,
        });
      }).catch((error: Error) =>
        apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: error.message,
        }),
      );
    },
  });
};
