import { Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { ipdIssueValidator } from "@/validators/api/masters/pharmacyIpdIssue";
import { ipdReturnValidator } from "@/validators/api/masters/pharmacyIpdReturn";
import { z } from "zod";

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

const formatPatientName = (
  patient?:
    | {
        title?: string | null;
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
      }
    | null,
) =>
  [patient?.title, patient?.firstName, patient?.middleName, patient?.lastName]
    .filter(Boolean)
    .join(" ");

const formatQuantity = ({
  pieces,
  packSize,
}: {
  pieces: number;
  packSize: number;
}) => {
  if (pieces <= 0) return "0";
  if (pieces < packSize) return `${pieces} pcs`;
  const packs = Math.floor(pieces / packSize);
  const loose = pieces % packSize;
  if (!loose) return `${packs} pack`;
  return `${packs} pack + ${loose} pcs`;
};

const issueInclude = {
  ipd: {
    include: {
      patient: {
        select: {
          id: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
        },
      },
    },
  },
  items: {
    include: {
      inventoryItem: {
        include: {
          drug: true,
          supplier: true,
          hsnSac: true,
        },
      },
      returnItems: {
        where: {
          ipdDirectReturn: {
            isDeleted: false,
          },
        },
      },
    },
  },
} satisfies Prisma.IpdDirectIssueInclude;

const returnInclude = {
  ipd: {
    include: {
      patient: {
        select: {
          id: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
        },
      },
    },
  },
  items: {
    include: {
      issueItem: {
        include: {
          inventoryItem: {
            include: {
              drug: true,
              supplier: true,
              hsnSac: true,
            },
          },
          ipdDirectIssue: true,
        },
      },
      inventoryItem: {
        include: {
          drug: true,
          supplier: true,
          hsnSac: true,
        },
      },
    },
  },
} satisfies Prisma.IpdDirectReturnInclude;

export const getIpdPatientListAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const isDischarged =
        typeof query.isDischarged === "boolean" ? query.isDischarged : false;
      const skip = (page - 1) * limit;

      const and: Prisma.IpdWhereInput[] = [
        { isDeleted: false },
        { isDayCare: false },
        { isDischarged },
      ];

      if (search) {
        and.push({
          OR: [
            ...(Number.isFinite(Number(search)) ? [{ id: Number(search) }] : []),
            { patient: { firstName: { contains: search } } },
            { patient: { lastName: { contains: search } } },
          ],
        });
      }

      const where: Prisma.IpdWhereInput = { AND: and };

      const [data, total] = await prisma.$transaction([
        prisma.ipd.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            invoice: { include: { transactions: true } },
            mlcDeclaredByUser: { select: { id: true, name: true } },
            bed: {
              include: {
                room: {
                  include: {
                    roomType: {
                      include: {
                        department: true,
                      },
                    },
                  },
                },
              },
            },
            consultantDoctor: {
              select: {
                user: {
                  omit: {
                    password: true,
                  },
                },
              },
            },
            referringDoctor: {
              select: {
                user: {
                  omit: {
                    password: true,
                  },
                },
              },
            },
            patient: {
              select: {
                id: true,
                lastName: true,
                firstName: true,
                middleName: true,
                dob: true,
                title: true,
                maritalStatus: true,
                relations: true,
                addresses: true,
                contacts: true,
                gender: true,
              },
            },
          },
        }),
        prisma.ipd.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "IPD patients fetched successfully",
        data,
        total,
      });
    },
  });
};

export const getIssueListAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const ipdId = query.ipdId ? Number(query.ipdId) : undefined;
      const createdAtFrom = query["createdAt[from]"];
      const createdAtTo = query["createdAt[to]"];
      const skip = (page - 1) * limit;

      const and: Prisma.IpdDirectIssueWhereInput[] = [{ isDeleted: false }];

      if (ipdId) {
        and.push({ ipdId });
      }

      if (search) {
        and.push({
          OR: [
            ...(Number.isFinite(Number(search))
              ? [{ id: Number(search) }, { ipdId: Number(search) }]
              : []),
            { ipd: { patient: { firstName: { contains: search } } } },
            { ipd: { patient: { lastName: { contains: search } } } },
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

      const where: Prisma.IpdDirectIssueWhereInput = { AND: and };

      const [data, total] = await prisma.$transaction([
        prisma.ipdDirectIssue.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id: "desc" },
          include: issueInclude,
        }),
        prisma.ipdDirectIssue.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "IPD issues fetched successfully",
        data,
        total,
      });
    },
  });
};

export const createIssueAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: ipdIssueValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        const ipd = await tx.ipd.findFirst({
          where: { id: body.ipdId, isDeleted: false },
          include: {
            patient: {
              select: {
                id: true,
                title: true,
                firstName: true,
                middleName: true,
                lastName: true,
                gender: true,
              },
            },
          },
        });

        if (!ipd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "IPD patient not found",
          });
        }

        const inventoryIds = [...new Set(body.items.map((item) => item.inventoryItem.id))];
        const inventoryItems = await tx.inventoryItems.findMany({
          where: { id: { in: inventoryIds } },
          include: { drug: true, supplier: true, hsnSac: true },
        });

        if (inventoryItems.length !== inventoryIds.length) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "One or more inventory items were not found",
          });
        }

        const inventoryMap = new Map(inventoryItems.map((item) => [item.id, item]));
        const preparedItems: Prisma.IpdDirectIssueItemCreateWithoutIpdDirectIssueInput[] =
          [];
        const inventoryUpdates: Array<{ id: number; nextStock: number }> = [];

        for (const selectedItem of body.items) {
          const inventory = inventoryMap.get(selectedItem.inventoryItem.id);
          if (!inventory) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Invalid inventory item selected",
            });
          }

          const packSize = Math.max(Number(inventory.itemsPerPack || 1), 1);
          const requestedPieces = toPieces({
            quantity: Number(selectedItem.quantity || 0),
            isLooseQuantity: Boolean(selectedItem.isLooseQuantity),
            packSize,
          });

          if (requestedPieces > Number(inventory.quantityInStock || 0)) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `${inventory.drug.name} exceeds available stock`,
            });
          }

          const packageRate = Number(inventory.sellingPrice || 0);
          const pieceRate = packageRate / packSize;
          const rate = Boolean(selectedItem.isLooseQuantity) ? pieceRate : packageRate;
          const taxableAmount = round2(Number(selectedItem.quantity || 0) * rate);
          const cGstPercentage = Number(inventory.hsnSac?.cGstPercentage || 0);
          const sGstPercentage = Number(inventory.hsnSac?.sGstPercentage || 0);
          const iGstPercentage = Number(inventory.hsnSac?.iGstPercentage || 0);
          const cGstAmount = round2((taxableAmount * cGstPercentage) / 100);
          const sGstAmount = round2((taxableAmount * sGstPercentage) / 100);
          const iGstAmount = round2((taxableAmount * iGstPercentage) / 100);
          const gstAmount = round2(cGstAmount + sGstAmount + iGstAmount);
          const total = round2(taxableAmount + gstAmount);

          preparedItems.push({
            inventoryItem: {
              connect: {
                id: inventory.id,
              },
            },
            quantity: Number(selectedItem.quantity || 0),
            isLooseQuantity: Boolean(selectedItem.isLooseQuantity),
            rate: round2(rate),
            taxableAmount,
            gstPercentage: round2(cGstPercentage + sGstPercentage + iGstPercentage),
            cGstPercentage,
            sGstPercentage,
            iGstPercentage,
            gstAmount,
            cGstAmount,
            sGstAmount,
            iGstAmount,
            total,
          });

          inventoryUpdates.push({
            id: inventory.id,
            nextStock: Number(inventory.quantityInStock || 0) - requestedPieces,
          });
        }

        const subtotal = round2(
          preparedItems.reduce((sum, item) => sum + Number(item.total || 0), 0),
        );
        const discountAmount = round2(Number(body.discountAmount || 0));
        const roundOffAmount = round2(Number(body.roundOffAmount || 0));

        if (discountAmount > subtotal) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Discount cannot exceed subtotal",
          });
        }

        const total = round2(subtotal - discountAmount + roundOffAmount);

        const issue = await tx.ipdDirectIssue.create({
          data: {
            ipdId: ipd.id,
            discountAmount,
            roundOffAmount,
            total,
            createdAt: body.createdAt,
            createdBy: user.id,
            items: {
              create: preparedItems,
            },
          },
          include: issueInclude,
        });

        for (const inventoryUpdate of inventoryUpdates) {
          await tx.inventoryItems.update({
            where: { id: inventoryUpdate.id },
            data: {
              quantityInStock: inventoryUpdate.nextStock,
              updatedBy: user.id,
            },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "IPD issue created successfully",
          data: issue,
        });
      });
    },
  });
};

export const getReturnListAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const createdAtFrom = query["createdAt[from]"];
      const createdAtTo = query["createdAt[to]"];
      const skip = (page - 1) * limit;

      const and: Prisma.IpdDirectReturnWhereInput[] = [{ isDeleted: false }];

      if (search) {
        and.push({
          OR: [
            ...(Number.isFinite(Number(search))
              ? [{ id: Number(search) }, { ipdId: Number(search) }]
              : []),
            { ipd: { patient: { firstName: { contains: search } } } },
            { ipd: { patient: { lastName: { contains: search } } } },
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

      const where: Prisma.IpdDirectReturnWhereInput = { AND: and };

      const [data, total] = await prisma.$transaction([
        prisma.ipdDirectReturn.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id: "desc" },
          include: returnInclude,
        }),
        prisma.ipdDirectReturn.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "IPD returns fetched successfully",
        data,
        total,
      });
    },
  });
};

export const createReturnAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: ipdReturnValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        const ipd = await tx.ipd.findFirst({
          where: { id: body.ipdId, isDeleted: false },
          select: { id: true },
        });

        if (!ipd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "IPD patient not found",
          });
        }

        const issueItems = await tx.ipdDirectIssueItem.findMany({
          where: {
            ipdDirectIssue: {
              ipdId: body.ipdId,
              isDeleted: false,
            },
          },
          include: {
            inventoryItem: {
              include: {
                drug: true,
                supplier: true,
                hsnSac: true,
              },
            },
            returnItems: {
              where: {
                ipdDirectReturn: {
                  isDeleted: false,
                },
              },
            },
          },
        });

        const issueItemMap = new Map(issueItems.map((item) => [item.id, item]));
        const preparedItems: Prisma.IpdDirectReturnItemCreateWithoutIpdDirectReturnInput[] =
          [];
        const inventoryDeltaMap = new Map<number, number>();

        for (const selectedItem of body.items) {
          const issueItem = issueItemMap.get(selectedItem.issueItemId);

          if (!issueItem) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Invalid issued item selected",
            });
          }

          if (
            issueItem.inventoryItemId !== selectedItem.inventoryItemId ||
            issueItem.inventoryItemId !== issueItem.inventoryItem.id
          ) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Inventory mismatch in return selection",
            });
          }

          const packSize = Math.max(
            Number(issueItem.inventoryItem.itemsPerPack || 1),
            1,
          );
          const issuedPieces = toPieces({
            quantity: Number(issueItem.quantity || 0),
            isLooseQuantity: Boolean(issueItem.isLooseQuantity),
            packSize,
          });
          const returnedPieces = issueItem.returnItems.reduce(
            (sum, returnItem) =>
              sum +
              toPieces({
                quantity: Number(returnItem.quantity || 0),
                isLooseQuantity: Boolean(returnItem.isLooseQuantity),
                packSize,
              }),
            0,
          );
          const requestedPieces = toPieces({
            quantity: Number(selectedItem.quantity || 0),
            isLooseQuantity: Boolean(selectedItem.isLooseQuantity),
            packSize,
          });
          const remainingPieces = Math.max(issuedPieces - returnedPieces, 0);

          if (requestedPieces > remainingPieces) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: `${issueItem.inventoryItem.drug.name} exceeds returnable quantity`,
            });
          }

          const ratio = issuedPieces > 0 ? requestedPieces / issuedPieces : 0;
          const pieceRate = Boolean(issueItem.isLooseQuantity)
            ? Number(issueItem.rate || 0)
            : Number(issueItem.rate || 0) / packSize;
          const rate = Boolean(selectedItem.isLooseQuantity)
            ? pieceRate
            : pieceRate * packSize;

          preparedItems.push({
            issueItem: {
              connect: {
                id: issueItem.id,
              },
            },
            inventoryItem: {
              connect: {
                id: issueItem.inventoryItemId,
              },
            },
            quantity: Number(selectedItem.quantity || 0),
            isLooseQuantity: Boolean(selectedItem.isLooseQuantity),
            rate: round2(rate),
            taxableAmount: round2(Number(issueItem.taxableAmount || 0) * ratio),
            gstPercentage: Number(issueItem.gstPercentage || 0),
            cGstPercentage: Number(issueItem.cGstPercentage || 0),
            sGstPercentage: Number(issueItem.sGstPercentage || 0),
            iGstPercentage: Number(issueItem.iGstPercentage || 0),
            gstAmount: round2(Number(issueItem.gstAmount || 0) * ratio),
            cGstAmount: round2(Number(issueItem.cGstAmount || 0) * ratio),
            sGstAmount: round2(Number(issueItem.sGstAmount || 0) * ratio),
            iGstAmount: round2(Number(issueItem.iGstAmount || 0) * ratio),
            total: round2(Number(issueItem.total || 0) * ratio),
          });

          inventoryDeltaMap.set(
            issueItem.inventoryItemId,
            (inventoryDeltaMap.get(issueItem.inventoryItemId) || 0) + requestedPieces,
          );
        }

        const subtotal = round2(
          preparedItems.reduce((sum, item) => sum + Number(item.total || 0), 0),
        );
        const discountAmount = round2(Number(body.discountAmount || 0));
        const roundOffAmount = round2(Number(body.roundOffAmount || 0));

        if (discountAmount > subtotal) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Discount cannot exceed subtotal",
          });
        }

        const total = round2(subtotal - discountAmount + roundOffAmount);

        const ipdReturn = await tx.ipdDirectReturn.create({
          data: {
            ipdId: body.ipdId,
            discountAmount,
            roundOffAmount,
            total,
            createdAt: body.createdAt,
            createdBy: user.id,
            items: {
              create: preparedItems,
            },
          },
          include: returnInclude,
        });

        for (const [inventoryItemId, delta] of inventoryDeltaMap.entries()) {
          const inventory = await tx.inventoryItems.findUnique({
            where: { id: inventoryItemId },
            select: { quantityInStock: true },
          });

          if (!inventory) continue;

          await tx.inventoryItems.update({
            where: { id: inventoryItemId },
            data: {
              quantityInStock: Number(inventory.quantityInStock || 0) + delta,
              updatedBy: user.id,
            },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "IPD return created successfully",
          data: ipdReturn,
        });
      });
    },
  });
};

export const getBillRowsAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator.extend({
      ipdId: z.coerce.number().min(1, "IPD patient is required"),
    }),
    req,
    onSuccess: async ({ query }) => {
      const issues = await prisma.ipdDirectIssue.findMany({
        where: {
          ipdId: query.ipdId,
          isDeleted: false,
        },
        orderBy: { createdAt: "desc" },
        include: issueInclude,
      });

      const data = issues.flatMap((issue) =>
        issue.items.map((item) => {
          const packSize = Math.max(Number(item.inventoryItem.itemsPerPack || 1), 1);
          const issuedPieces = toPieces({
            quantity: Number(item.quantity || 0),
            isLooseQuantity: Boolean(item.isLooseQuantity),
            packSize,
          });
          const returnedPieces = item.returnItems.reduce(
            (sum, returnItem) =>
              sum +
              toPieces({
                quantity: Number(returnItem.quantity || 0),
                isLooseQuantity: Boolean(returnItem.isLooseQuantity),
                packSize,
              }),
            0,
          );

          return {
            id: `${issue.id}-${item.id}`,
            order: `ISS-${issue.id}`,
            batch: String(item.inventoryItem.batchNo),
            patient: formatPatientName(issue.ipd.patient),
            ipdNo: String(issue.ipd.id),
            submission: issue.createdAt,
            item: item.inventoryItem.drug.name,
            quantity: formatQuantity({
              pieces: Math.max(issuedPieces - returnedPieces, 0),
              packSize,
            }),
          };
        }),
      );

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "IPD bill rows fetched successfully",
        data,
      });
    },
  });
};
