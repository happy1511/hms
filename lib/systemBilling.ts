import {
  DiscountType,
  Prisma,
  ServiceApplicableOn,
  ServiceType,
  Status,
} from "@/generated/prisma/client";
import {
  SYSTEM_BILLING_SECTION_KEYS,
  SYSTEM_BILLING_SECTION_NAMES,
} from "@/lib/systemBillingConstants";

export const upsertSystemBillingSection = async (
  tx: Prisma.TransactionClient,
  {
    key,
    actingUserId,
  }: {
    key: (typeof SYSTEM_BILLING_SECTION_KEYS)[keyof typeof SYSTEM_BILLING_SECTION_KEYS];
    actingUserId: number;
  },
) => {
  const name = SYSTEM_BILLING_SECTION_NAMES[key];

  return tx.billingSection.upsert({
    where: { systemKey: key },
    create: {
      name,
      systemKey: key,
      description: `${name} system section`,
      status: Status.active,
      createdBy: actingUserId,
      updatedBy: actingUserId,
    },
    update: {
      name,
      isDeleted: false,
      status: Status.active,
      updatedBy: actingUserId,
    },
    select: {
      id: true,
      name: true,
      systemKey: true,
    },
  });
};

export const upsertConsultingDoctorService = async (
  tx: Prisma.TransactionClient,
  {
    doctorId,
    doctorName,
    consultationCharges,
    actingUserId,
  }: {
    doctorId: number;
    doctorName: string;
    consultationCharges: number;
    actingUserId: number;
  },
) => {
  const serviceName = `consultation charges of ${doctorName}`;
  const section = await upsertSystemBillingSection(tx, {
    key: SYSTEM_BILLING_SECTION_KEYS.CONSULTATION_CHARGES,
    actingUserId,
  });

  return tx.service.upsert({
    where: { consultingDoctorId: doctorId },
    create: {
      consultingDoctorId: doctorId,
      billingSectionId: section.id,
      name: serviceName,
      description: serviceName,
      type: ServiceType.OTHER,
      applicableOn: ServiceApplicableOn.CONSULTATION,
      price: consultationCharges,
      discountAvailable: false,
      maxDiscount: 0,
      status: Status.active,
      createdBy: actingUserId,
      updatedBy: actingUserId,
    },
    update: {
      isDeleted: false,
      billingSectionId: section.id,
      name: serviceName,
      description: serviceName,
      type: ServiceType.OTHER,
      applicableOn: ServiceApplicableOn.CONSULTATION,
      price: consultationCharges,
      discountAvailable: false,
      maxDiscount: 0,
      status: Status.active,
      updatedBy: actingUserId,
    },
  });
};

export const ensureConsultingDoctorService = async (
  tx: Prisma.TransactionClient,
  {
    doctorId,
    actingUserId,
  }: {
    doctorId: number;
    actingUserId: number;
  },
) => {
  const doctor = await tx.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      title: true,
      consultationCharges: true,
    },
  });

  if (!doctor) {
    throw new Error("Consulting doctor not found");
  }

  const doctorName = [doctor.title, doctor.firstName, doctor.lastName]
    .filter(Boolean)
    .join(" ");

  return upsertConsultingDoctorService(tx, {
    doctorId,
    doctorName: doctorName || `Doctor ${doctorId}`,
    consultationCharges: Number(doctor.consultationCharges ?? 0),
    actingUserId,
  });
};

export const upsertRoomChargeService = async (
  tx: Prisma.TransactionClient,
  {
    roomId,
    roomName,
    roomPrice,
    actingUserId,
  }: {
    roomId: number;
    roomName: string;
    roomPrice: number;
    actingUserId: number;
  },
) => {
  const serviceName = `${roomName} charges`;
  const section = await upsertSystemBillingSection(tx, {
    key: SYSTEM_BILLING_SECTION_KEYS.ROOM_CHARGES,
    actingUserId,
  });

  return tx.service.upsert({
    where: { roomId },
    create: {
      roomId,
      billingSectionId: section.id,
      name: serviceName,
      description: serviceName,
      type: ServiceType.OTHER,
      applicableOn: ServiceApplicableOn.INPATIENT,
      price: roomPrice,
      discountAvailable: false,
      maxDiscount: 0,
      status: Status.active,
      createdBy: actingUserId,
      updatedBy: actingUserId,
    },
    update: {
      isDeleted: false,
      billingSectionId: section.id,
      name: serviceName,
      description: serviceName,
      type: ServiceType.OTHER,
      applicableOn: ServiceApplicableOn.INPATIENT,
      price: roomPrice,
      discountAvailable: false,
      maxDiscount: 0,
      status: Status.active,
      updatedBy: actingUserId,
    },
  });
};

export const getLockedBillingItemTotal = ({
  quantity,
  rate,
  discountType = DiscountType.VALUE,
  discountValue = 0,
}: {
  quantity: number;
  rate: number;
  discountType?: DiscountType;
  discountValue?: number;
}) => {
  const gross = Number(quantity || 0) * Number(rate || 0);
  const discount =
    discountType === DiscountType.PERCENTAGE
      ? (gross * Number(discountValue || 0)) / 100
      : Number(discountValue || 0);

  return Math.max(gross - discount, 0);
};
