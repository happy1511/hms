import { DiscountType, Prisma } from "@/generated/prisma/client";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { getNetInvoicePaidAmount } from "@/lib/invoiceTransactions";
import {
  getLockedBillingItemTotal,
  upsertRoomChargeService,
  upsertSystemBillingSection,
} from "@/lib/systemBilling";
import { SYSTEM_BILLING_SECTION_KEYS } from "@/lib/systemBillingConstants";

const getChargeableDays = (fromDate: Date, toDate?: Date | null) => {
  const start = startOfDay(new Date(fromDate));
  const end = startOfDay(new Date(toDate ?? new Date()));
  return Math.max(differenceInCalendarDays(end, start) + 1, 1);
};

export const syncIpdLockedBillingItems = async (
  tx: Prisma.TransactionClient,
  {
    ipdId,
    actingUserId,
    now = new Date(),
  }: {
    ipdId: number;
    actingUserId: number;
    now?: Date;
  },
): Promise<void> => {
  const ipd = await tx.ipd.findUnique({
    where: { id: ipdId },
    select: {
      id: true,
      invoiceId: true,
      ipdDateTime: true,
      consultantDoctorId: true,
      isDischarged: true,
      dischargedAt: true,
      bedId: true,
      roomId: true,
      bed: {
        select: {
          id: true,
          room: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
      bedAllocations: {
        orderBy: { fromDateTime: "asc" },
        select: {
          id: true,
          fromDateTime: true,
          toDateTime: true,
          room: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!ipd) {
    return;
  }

  if (!ipd.bedAllocations.length && ipd.bed?.room?.id) {
    await tx.ipdBedAllocation.create({
      data: {
        ipdId: ipd.id,
        bedId: ipd.bedId,
        roomId: ipd.bed.room.id,
        fromDateTime: ipd.ipdDateTime,
      },
    });

    return syncIpdLockedBillingItems(tx, { ipdId, actingUserId, now });
  }

  const roomSection = await upsertSystemBillingSection(tx, {
    key: SYSTEM_BILLING_SECTION_KEYS.ROOM_CHARGES,
    actingUserId,
  });

  const invoiceSections = await tx.invoiceBillingSection.findMany({
    where: { invoiceId: ipd.invoiceId },
    include: {
      items: {
        include: {
          service: {
            select: {
              id: true,
              consultingDoctorId: true,
              roomId: true,
            },
          },
        },
      },
    },
  });

  const roomInvoiceSection =
    invoiceSections.find((section) => section.billingSectionId === roomSection.id) ??
    (await tx.invoiceBillingSection.create({
      data: {
        invoiceId: ipd.invoiceId,
        billingSectionId: roomSection.id,
        discountType: DiscountType.VALUE,
        discountValue: 0,
        createdBy: actingUserId,
        updatedBy: actingUserId,
      },
    }));

  const allItems = invoiceSections.flatMap((section) => section.items);

  const roomItemsByAllocationId = new Map(
    allItems
      .filter((item) => item.isLocked && item.ipdBedAllocationId)
      .map((item) => [item.ipdBedAllocationId as number, item]),
  );

  const activeAllocationIds = new Set<number>();

  for (const allocation of ipd.bedAllocations) {
    activeAllocationIds.add(allocation.id);

    const roomService = await upsertRoomChargeService(tx, {
      roomId: allocation.room.id,
      roomName: allocation.room.name,
      roomPrice: Number(allocation.room.price ?? 0),
      actingUserId,
    });

    const effectiveEnd =
      allocation.toDateTime ??
      (ipd.isDischarged ? ipd.dischargedAt ?? now : now);
    const quantity = getChargeableDays(allocation.fromDateTime, effectiveEnd);
    const total = getLockedBillingItemTotal({
      quantity,
      rate: roomService.price,
    });

    const existingRoomItem = roomItemsByAllocationId.get(allocation.id);

    if (existingRoomItem) {
      await tx.invoiceBillingItem.update({
        where: { id: existingRoomItem.id },
        data: {
          billingSectionId: roomSection.id,
          invoiceBillingSectionId: roomInvoiceSection.id,
          serviceId: roomService.id,
          ipdBedAllocationId: allocation.id,
          quantity,
          rate: roomService.price,
          discountType: DiscountType.VALUE,
          discountValue: 0,
          total,
          createdAt: allocation.fromDateTime,
          updatedBy: actingUserId,
          isLocked: true,
        },
      });
      continue;
    }

    await tx.invoiceBillingItem.create({
      data: {
        invoiceId: ipd.invoiceId,
        billingSectionId: roomSection.id,
        invoiceBillingSectionId: roomInvoiceSection.id,
        serviceId: roomService.id,
        ipdBedAllocationId: allocation.id,
        quantity,
        rate: roomService.price,
        discountType: DiscountType.VALUE,
        discountValue: 0,
        total,
        createdAt: allocation.fromDateTime,
        createdBy: actingUserId,
        updatedBy: actingUserId,
        isLocked: true,
      },
    });
  }

  const staleRoomItemIds = allItems
    .filter(
      (item) =>
        item.isLocked &&
        item.service.roomId &&
        ((item.ipdBedAllocationId &&
          !activeAllocationIds.has(item.ipdBedAllocationId)) ||
          !item.ipdBedAllocationId),
    )
    .map((item) => item.id);

  if (staleRoomItemIds.length) {
    await tx.invoiceBillingItem.deleteMany({
      where: { id: { in: staleRoomItemIds } },
    });
  }

  const finalSections = await tx.invoiceBillingSection.findMany({
    where: { invoiceId: ipd.invoiceId },
    include: {
      items: {
        select: {
          total: true,
        },
      },
    },
  });

  const subtotal = finalSections.reduce((sum, section) => {
    const sectionSubtotal = section.items.reduce(
      (itemSum, item) => itemSum + Number(item.total || 0),
      0,
    );
    const sectionDiscount =
      section.discountType === DiscountType.PERCENTAGE
        ? (sectionSubtotal * Number(section.discountValue || 0)) / 100
        : Number(section.discountValue || 0);

    return sum + Math.max(sectionSubtotal - sectionDiscount, 0);
  }, 0);

  const invoice = await tx.invoice.findUnique({
    where: { id: ipd.invoiceId },
    select: {
      id: true,
      discountType: true,
      discountValue: true,
      isFree: true,
      transactions: {
        select: {
          amount: true,
        },
      },
    },
  });

  if (!invoice) {
    return;
  }

  const invoiceDiscount =
    invoice.discountType === DiscountType.PERCENTAGE
      ? (subtotal * Number(invoice.discountValue || 0)) / 100
      : Number(invoice.discountValue || 0);
  const total = invoice.isFree ? 0 : Math.max(subtotal - invoiceDiscount, 0);
  const paidAmount = getNetInvoicePaidAmount(invoice.transactions);

  await tx.invoice.update({
    where: { id: ipd.invoiceId },
    data: {
      rate: subtotal,
      total,
      isPaid: invoice.isFree ? false : paidAmount >= total && total > 0,
      updatedBy: actingUserId,
    },
  });
};
