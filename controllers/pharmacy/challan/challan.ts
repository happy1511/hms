import { Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { calculateGrnSummary } from "@/lib/pharmacyGrn";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { challanValidator } from "@/validators/api/masters/pharmacyChallan";
import z from "zod";

const challanDetailsParamsValidator = z.object({
  challanId: z.coerce.number().min(1, "Challan Id is required"),
});

const normalizeChallanNumber = (value: string) => value.trim();

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const search = query.search ?? "";
      const supplierId = query.supplierId;
      const withoutGrn = Boolean(query.withoutGrn);

      const skip = (page - 1) * limit;
      const and: Prisma.ChallanWhereInput[] = [{ isDeleted: false }];

      if (search) {
        and.push({
          OR: [
            { challanNumber: { contains: search } },
            { invoiceNumber: { contains: search } },
            { supplier: { name: { contains: search } } },
          ],
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      if (supplierId) {
        and.push({ supplierId });
      }

      if (withoutGrn) {
        and.push({ grn: { is: null } });
      }

      const where: Prisma.ChallanWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.challan.findMany({
          skip,
          take: limit,
          where,
          orderBy: { createdAt: "desc" },
          include: {
            supplier: true,
            grn: { select: { id: true } },
            createdByUser: {
              select: {
                id: true,
                name: true,
              },
            },
            items: {
              include: {
                drug: true,
                category: true,
                hsnSac: true,
                inventoryItem: {
                  include: {
                    drug: true,
                    hsnSac: true,
                  },
                },
              },
            },
          },
        }),
        prisma.challan.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Challans fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: challanValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const challanNumber = normalizeChallanNumber(body.challanNumber);
        const existingChallan = await tx.challan.findFirst({
          where: {
            challanNumber,
            isDeleted: false,
          },
          select: { id: true },
        });

        if (existingChallan) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Challan number already exists",
          });
        }

        const summary = calculateGrnSummary(body.challanItems, {
          discountAmount: body.discountAmount,
          tcsAmount: body.tcsAmount,
          packingForwarding: body.packingForwarding,
          roundOffAmount: body.roundOffAmount,
          cnAmount: body.cnAmount,
        });

        const challan = await tx.challan.create({
          data: {
            supplierId: body.supplier.id,
            challanNumber,
            invoiceNumber: body.invoiceNumber,
            invoiceDate: body.invoiceDate,
            discountAmount: summary.discountAmount,
            taxableAmount: summary.taxableAmount,
            cGstAmount: summary.cGstAmount,
            sGstAmount: summary.sGstAmount,
            iGstAmount: summary.iGstAmount,
            tcsAmount: summary.tcsAmount,
            packingForwarding: summary.packingForwarding,
            roundOffAmount: summary.roundOffAmount,
            grandTotal: summary.grandTotal,
            cnAmount: summary.cnAmount,
            cnRef: body.cnRef?.trim() || null,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        for (const [index, item] of body.challanItems.entries()) {
          const existingInventory = await tx.inventoryItems.findFirst({
            where: {
              drugId: item.drug.id,
              supplierId: body.supplier.id,
              batchNo: item.batchNo,
            },
          });
          const receivedPieces =
            (Number(item.quantity || 0) + Number(item.freeQuantity || 0)) *
            Math.max(Number(item.itemsPerPack || 1), 1);

          let inventoryItemId = existingInventory?.id;

          if (existingInventory) {
            const updatedInventory = await tx.inventoryItems.update({
              where: { id: existingInventory.id },
              data: {
                quantityInStock: {
                  increment: receivedPieces,
                },
                hsnSacId: item.hsnSacId ?? item.hsnSac?.id ?? null,
                expiryDate: item.expiryDate,
                manufacturingDate: item.manufacturingDate,
                purchasePrice: item.purchasePrice,
                mrp: item.mrp,
                sellingPrice: item.sellingPrice,
                wholeSalePrice: item.wholeSalePrice,
                itemsPerPack: Math.max(Number(item.itemsPerPack || 1), 1),
                updatedBy: user.id,
              },
            });
            inventoryItemId = updatedInventory.id;
          } else {
            const newInventory = await tx.inventoryItems.create({
              data: {
                drugId: item.drug.id,
                hsnSacId: item.hsnSacId ?? item.hsnSac?.id ?? null,
                batchNo: item.batchNo,
                expiryDate: item.expiryDate,
                manufacturingDate: item.manufacturingDate,
                purchasePrice: item.purchasePrice,
                mrp: item.mrp,
                sellingPrice: item.sellingPrice,
                wholeSalePrice: item.wholeSalePrice,
                itemsPerPack: Math.max(Number(item.itemsPerPack || 1), 1),
                quantityInStock: receivedPieces,
                supplierId: body.supplier.id,
                createdBy: user.id,
                updatedBy: user.id,
              },
            });
            inventoryItemId = newInventory.id;
          }

          await tx.challanItem.create({
            data: {
              challanId: challan.id,
              drugId: item.drug.id,
              hsnSacId: item.hsnSacId ?? item.hsnSac?.id ?? null,
              quantity: item.quantity,
              freeQuantity: item.freeQuantity,
              packaging: item.packaging,
              qtyType: item.qtyType,
              itemsPerPack: Math.max(Number(item.itemsPerPack || 1), 1),
              batchNo: item.batchNo,
              expiryDate: item.expiryDate,
              manufacturingDate: item.manufacturingDate,
              purchasePrice: item.purchasePrice,
              mrp: item.mrp,
              sellingPrice: item.sellingPrice,
              wholeSalePrice: item.wholeSalePrice,
              total:
                summary.lines[index]?.lineTotal ??
                Number(item.purchasePrice || 0) * Number(item.quantity || 0),
              categoryId: item.category?.id ?? undefined,
              inventoryItemId: inventoryItemId!,
            },
          });
        }

        const data = await tx.challan.findUnique({
          where: { id: challan.id },
          include: {
            supplier: true,
            grn: { select: { id: true } },
            createdByUser: {
              select: {
                id: true,
                name: true,
              },
            },
            items: {
              include: {
                drug: true,
                category: true,
                hsnSac: true,
                inventoryItem: {
                  include: {
                    drug: true,
                    hsnSac: true,
                  },
                },
              },
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Challan created successfully",
          data,
        });
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { challanId: string } },
) => {
  return validateRequest({
    paramsSchema: challanDetailsParamsValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const challan = await prisma.challan.findFirst({
        where: {
          id: params.challanId,
          isDeleted: false,
        },
        include: {
          supplier: true,
          grn: { select: { id: true } },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              drug: true,
              category: true,
              hsnSac: true,
              inventoryItem: {
                include: {
                  drug: true,
                  hsnSac: true,
                },
              },
            },
            orderBy: {
              id: "asc",
            },
          },
        },
      });

      if (!challan) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Challan not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Challan fetched successfully",
        data: challan,
      });
    },
  });
};

export const createGrnFromChallanAPI = async (
  req: Request,
  { params }: { params: { challanId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: challanDetailsParamsValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      return prisma.$transaction(async (tx) => {
        const challan = await tx.challan.findFirst({
          where: {
            id: params.challanId,
            isDeleted: false,
          },
          include: {
            grn: { select: { id: true } },
            items: true,
          },
        });

        if (!challan) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Challan not found",
          });
        }

        if (challan.grn?.id) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "GRN already exists for this challan",
          });
        }

        const grn = await tx.gRN.create({
          data: {
            challanId: challan.id,
            invoiceNumber: challan.invoiceNumber,
            invoiceDate: challan.invoiceDate,
            discountAmount: challan.discountAmount,
            taxableAmount: challan.taxableAmount,
            cGstAmount: challan.cGstAmount,
            sGstAmount: challan.sGstAmount,
            iGstAmount: challan.iGstAmount,
            tcsAmount: challan.tcsAmount,
            packingForwarding: challan.packingForwarding,
            roundOffAmount: challan.roundOffAmount,
            grandTotal: challan.grandTotal,
            cnAmount: challan.cnAmount,
            cnRef: challan.cnRef,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        for (const item of challan.items) {
          await tx.gRNItems.create({
            data: {
              grnId: grn.id,
              challanItemId: item.id,
              inventoryItemId: item.inventoryItemId,
            },
          });
        }

        const data = await tx.gRN.findUnique({
          where: { id: grn.id },
          include: {
            order: {
              include: {
                supplier: true,
              },
            },
            challan: {
              include: {
                supplier: true,
              },
            },
            createdByUser: {
              select: {
                id: true,
                name: true,
              },
            },
            grnItems: {
              include: {
                purchaseItem: {
                  include: {
                    drug: true,
                    category: true,
                    hsnSac: true,
                  },
                },
                challanItem: {
                  include: {
                    drug: true,
                    category: true,
                    hsnSac: true,
                  },
                },
                inventoryItem: {
                  include: {
                    drug: true,
                    hsnSac: true,
                  },
                },
              },
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "GRN created successfully from challan",
          data,
        });
      });
    },
  });
};
