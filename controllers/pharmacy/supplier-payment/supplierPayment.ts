import { Prisma, User } from "@/generated/prisma/client";
import { SupplierPaymentType } from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { supplierPaymentValidator } from "@/validators/api/masters/pharmacySupplierPayment";
import z from "zod";

const supplierPaymentInclude = {
  supplier: true,
  allocations: {
    include: {
      grn: {
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
        },
      },
    },
  },
} satisfies Prisma.SupplierPaymentInclude;

const dueGrnQueryValidator = z.object({
  supplierId: z.coerce.number().int().min(1, "Supplier is required"),
});

const round2 = (value: number) => Number(value.toFixed(2));

const getGrnSupplier = (grn: {
  order?: { supplier?: { id: number; name: string } | null } | null;
  challan?: { supplier?: { id: number; name: string } | null } | null;
}) => grn.order?.supplier ?? grn.challan?.supplier ?? null;

const getGrnPaidAmount = (grn: {
  supplierPaymentAllocations?: Array<{
    amount: number;
    supplierPayment?: {
      isDeleted: boolean;
      type: SupplierPaymentType;
    } | null;
  }>;
}) =>
  round2(
    (grn.supplierPaymentAllocations || []).reduce((sum, allocation) => {
      if (
        allocation.supplierPayment?.isDeleted ||
        allocation.supplierPayment?.type !== SupplierPaymentType.DEBIT
      ) {
        return sum;
      }

      return sum + Number(allocation.amount || 0);
    }, 0),
  );

const createListAPI = (type: SupplierPaymentType) => async (req: Request) => {
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

      const and: Prisma.SupplierPaymentWhereInput[] = [
        { isDeleted: false },
        { type },
      ];

      if (search) {
        and.push({
          OR: [
            { supplier: { name: { contains: search } } },
            { reference: { contains: search } },
          ],
        });
      }

      if (supplierId) {
        and.push({ supplierId });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          paymentDate: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.SupplierPaymentWhereInput = { AND: and };

      const [items, total] = await prisma.$transaction([
        prisma.supplierPayment.findMany({
          skip,
          take: limit,
          where,
          orderBy: { paymentDate: "desc" },
          include: supplierPaymentInclude,
        }),
        prisma.supplierPayment.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Supplier entries fetched successfully",
        data: items,
        total,
      });
    },
  });
};

const createCreateAPI =
  (type: SupplierPaymentType) => async (req: Request, user: User) => {
    return validateRequest({
      bodySchema: supplierPaymentValidator,
      req,
      user,
      onSuccess: async ({ body, user }) => {
        if (body.type !== type) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Invalid supplier entry type",
          });
        }

        return prisma.$transaction(async (tx) => {
          const supplier = await tx.drugSupplier.findFirst({
            where: {
              id: body.supplierId,
              isDeleted: false,
            },
            select: {
              id: true,
              name: true,
            },
          });

          if (!supplier) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Supplier not found",
            });
          }

          if (type === SupplierPaymentType.DEBIT) {
            const grnIds = [...new Set(body.allocations.map((item) => item.grnId))];
            const grns = await tx.gRN.findMany({
              where: {
                id: { in: grnIds },
                OR: [
                  { order: { is: { supplierId: supplier.id, isDeleted: false } } },
                  {
                    challan: { is: { supplierId: supplier.id, isDeleted: false } },
                  },
                ],
              },
              include: {
                order: { include: { supplier: true } },
                challan: { include: { supplier: true } },
                supplierPaymentAllocations: {
                  include: {
                    supplierPayment: {
                      select: {
                        isDeleted: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            });

            if (grns.length !== grnIds.length) {
              return apiResponse({
                status: RESPONSE_STATUS.BAD_REQUEST,
                message: "One or more GRNs were not found for the selected supplier",
              });
            }

            const grnById = new Map(grns.map((grn) => [grn.id, grn]));

            for (const allocation of body.allocations) {
              const grn = grnById.get(allocation.grnId);

              if (!grn) {
                return apiResponse({
                  status: RESPONSE_STATUS.BAD_REQUEST,
                  message: "Invalid GRN selected",
                });
              }

              const paid = getGrnPaidAmount(grn);
              const due = round2(Number(grn.grandTotal || 0) - paid);

              if (Number(allocation.amount || 0) > due) {
                return apiResponse({
                  status: RESPONSE_STATUS.BAD_REQUEST,
                  message: `Adjust amount exceeds due for invoice ${grn.invoiceNumber}`,
                });
              }
            }
          }

          const created = await tx.supplierPayment.create({
            data: {
              supplierId: supplier.id,
              type,
              paymentDate: body.paymentDate,
              amount: round2(Number(body.amount || 0)),
              reference: body.reference?.trim() || null,
              createdBy: user.id,
              updatedBy: user.id,
              allocations:
                type === SupplierPaymentType.DEBIT
                  ? {
                      create: body.allocations.map((allocation) => ({
                        grnId: allocation.grnId,
                        amount: round2(Number(allocation.amount || 0)),
                      })),
                    }
                  : undefined,
            },
            include: supplierPaymentInclude,
          });

          return apiResponse({
            status: RESPONSE_STATUS.CREATED,
            message:
              type === SupplierPaymentType.DEBIT
                ? "Supplier payment created successfully"
                : "Supplier credit note created successfully",
            data: created,
          });
        });
      },
    });
  };

export const getDueGrnsAPI = async (req: Request) => {
  return validateRequest({
    querySchema: dueGrnQueryValidator,
    req,
    onSuccess: async ({ query }) => {
      const supplierId = Number(query.supplierId);

      const grns = await prisma.gRN.findMany({
        where: {
          OR: [
            { order: { is: { supplierId, isDeleted: false } } },
            { challan: { is: { supplierId, isDeleted: false } } },
          ],
        },
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
          supplierPaymentAllocations: {
            include: {
              supplierPayment: {
                select: {
                  isDeleted: true,
                  type: true,
                },
              },
            },
          },
        },
        orderBy: { invoiceDate: "desc" },
      });

      const rows = grns
        .map((grn) => {
          const supplier = getGrnSupplier(grn);
          const paid = getGrnPaidAmount(grn);
          const total = round2(Number(grn.grandTotal || 0));
          const due = round2(total - paid);

          return {
            id: grn.id,
            invoiceNumber: grn.invoiceNumber,
            invoiceDate: grn.invoiceDate,
            total,
            paid,
            due,
            supplierId: supplier?.id ?? supplierId,
            supplierName: supplier?.name ?? "",
          };
        })
        .filter((row) => row.due > 0);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Supplier due GRNs fetched successfully",
        data: rows,
      });
    },
  });
};

export const getSupplierPaymentsAPI = createListAPI(SupplierPaymentType.DEBIT);
export const createSupplierPaymentAPI = createCreateAPI(
  SupplierPaymentType.DEBIT,
);
export const getSupplierCreditNotesAPI = createListAPI(
  SupplierPaymentType.CREDIT,
);
export const createSupplierCreditNoteAPI = createCreateAPI(
  SupplierPaymentType.CREDIT,
);
