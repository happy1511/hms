import {
  Days,
  DoctorType,
  Prisma,
  ServiceApplicableOn,
  ServiceType,
  Status,
} from "@/generated/prisma/client";
import { MasterImportKey, MasterImportMode } from "@/lib/masterImportConfig";
import {
  upsertConsultingDoctorService,
  upsertRoomChargeService,
} from "@/lib/systemBilling";
import { trimOptionalString } from "@/lib/user";
import { toDays } from "@/lib/utils";
import { prisma } from "@/services/prisma";
import type { BedImportRow } from "@/validators/api/masters/bed";
import type { BillingSectionImportRow } from "@/validators/api/masters/billingSection";
import type { DepartmentImportRow } from "@/validators/api/masters/department";
import type { DoctorImportRow } from "@/validators/api/masters/doctor";
import type { DrugImportRow } from "@/validators/api/masters/drug";
import type { DrugBillingCategoryImportRow } from "@/validators/api/masters/drugBillingCategory";
import type { FinanceCategoryImportRow } from "@/validators/api/masters/financeCategory";
import type { HsnSacImportRow } from "@/validators/api/masters/hsnSac";
import type { LocationImportRow } from "@/validators/api/masters/location";
import {
  pathologyTestHeaderValidator,
  pathologyTestParameterValidator,
} from "@/validators/api/masters/pathologyTest";
import type { PathologyTestImportRow } from "@/validators/api/masters/pathologyTest";
import type {
  RadiologyTemplateImportRow,
  RadiologyTestImportRow,
} from "@/validators/api/masters/radiologyTest";
import type { RoomImportRow } from "@/validators/api/masters/room";
import type { RoomTypeImportRow } from "@/validators/api/masters/roomType";
import type { ServiceImportRow } from "@/validators/api/masters/service";
import type { SupplierImportRow } from "@/validators/api/masters/supplier";
import { z } from "zod";

type ImportRowMeta = {
  __rowNumber?: string;
};

const IMPORT_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 60_000,
} as const;

const getRowNumber = (row: ImportRowMeta) => row.__rowNumber || "?";

const required = (row: Record<string, string>, key: string) => {
  const value = row[key]?.trim();
  if (!value) {
    throw new Error(`Row ${row.__rowNumber}: "${key}" is required`);
  }
  return value;
};

const optional = (row: Record<string, string>, key: string) =>
  row[key]?.trim() || "";

const parseBoolean = (value: string | undefined, defaultValue = false) => {
  if (!value?.trim()) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return ["true", "yes", "1"].includes(normalized);
};

const parseNumber = (
  value: string | undefined,
  field: string,
  rowNumber: string,
  defaultValue?: number,
) => {
  if (!value?.trim()) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Row ${rowNumber}: "${field}" is required`);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Row ${rowNumber}: "${field}" must be a number`);
  }
  return parsed;
};

const parseEnum = <T extends string>(
  value: string | undefined,
  values: readonly T[],
  field: string,
  rowNumber: string,
  defaultValue?: T,
) => {
  const rawValue = value?.trim();
  if (!rawValue) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Row ${rowNumber}: "${field}" is required`);
  }

  const matched = values.find(
    (item) => item.toLowerCase() === rawValue.toLowerCase(),
  );

  if (!matched) {
    throw new Error(
      `Row ${rowNumber}: "${field}" must be one of ${values.join(", ")}`,
    );
  }

  return matched;
};

const splitList = (value: string | undefined) =>
  value
    ?.split("|")
    .map((item) => item.trim())
    .filter(Boolean) || [];

const parseJsonArray = <T>(
  value: string | undefined,
  validator: z.ZodType<T>,
  field: string,
  rowNumber: string,
) => {
  if (!value?.trim()) return [] as T[];

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(value);
  } catch {
    throw new Error(`Row ${rowNumber}: "${field}" must be valid JSON`);
  }

  if (!Array.isArray(parsedJson)) {
    throw new Error(`Row ${rowNumber}: "${field}" must be a JSON array`);
  }

  return parsedJson.map((item, index) => {
    const parsed = validator.safeParse(item);
    if (!parsed.success) {
      throw new Error(
        `Row ${rowNumber}: "${field}" item ${index + 1} ${parsed.error?.issues?.[0]?.message || "is invalid"}`,
      );
    }
    return parsed.data;
  });
};

const deleteSuffix = (id: number) => `__deleted__${id}_${Date.now()}`;

const archiveBillingSections = async (tx: typeof prisma, userId: number) => {
  const items = await tx.billingSection.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true, systemKey: true },
  });

  for (const item of items) {
    const suffix = deleteSuffix(item.id);
    await tx.billingSection.update({
      where: { id: item.id },
      data: {
        name: `${item.name}_${suffix}`,
        systemKey: item.systemKey ? `${item.systemKey}_${suffix}` : null,
        isOtherCharges: false,
        isDoctorConsultationCharges: false,
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  return items.length;
};

const archiveDepartments = async (tx: typeof prisma, userId: number) => {
  const items = await tx.department.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true },
  });

  for (const item of items) {
    await tx.department.update({
      where: { id: item.id },
      data: {
        name: `${item.name}_${deleteSuffix(item.id)}`,
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  return items.length;
};

const archiveRoomTypes = async (tx: typeof prisma, userId: number) => {
  const items = await tx.roomType.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true },
  });

  for (const item of items) {
    await tx.roomType.update({
      where: { id: item.id },
      data: {
        name: `${item.name}_${deleteSuffix(item.id)}`,
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  return items.length;
};

const archiveRooms = async (tx: typeof prisma, userId: number) => {
  const items = await tx.room.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true },
  });
  const roomIds = items.map((item) => item.id);

  if (roomIds.length) {
    await tx.service.updateMany({
      where: { roomId: { in: roomIds }, isDeleted: false },
      data: {
        roomId: null,
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  for (const item of items) {
    await tx.room.update({
      where: { id: item.id },
      data: {
        name: `${item.name}_${deleteSuffix(item.id)}`,
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  return items.length;
};

const archiveBeds = async (tx: typeof prisma, userId: number) => {
  const occupied = await tx.bed.count({
    where: {
      isDeleted: false,
      OR: [{ isOccupied: true }, { currentIpdId: { not: null } }],
    },
  });

  if (occupied) {
    throw new Error("Cannot replace beds while occupied beds exist");
  }

  const items = await tx.bed.findMany({
    where: { isDeleted: false },
    select: { id: true, bedNumber: true, name: true },
  });

  for (const item of items) {
    const suffix = deleteSuffix(item.id);
    await tx.bed.update({
      where: { id: item.id },
      data: {
        bedNumber: `${item.bedNumber}_${suffix}`,
        name: item.name ? `${item.name}_${suffix}` : item.name,
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  return items.length;
};

const archiveDrugs = async (tx: typeof prisma, userId: number) => {
  const count = await tx.drug.count({ where: { isDeleted: false } });
  await tx.drug.updateMany({
    where: { isDeleted: false },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });
  return count;
};

const archiveSuppliers = async (tx: typeof prisma, userId: number) => {
  const count = await tx.drugSupplier.count({ where: { isDeleted: false } });
  await tx.drugSupplier.updateMany({
    where: { isDeleted: false },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });
  return count;
};

const archiveDrugBillingCategories = async (
  tx: typeof prisma,
  userId: number,
) => {
  const count = await tx.drugBillingCategory.count({
    where: { isDeleted: false },
  });
  await tx.drugBillingCategory.updateMany({
    where: { isDeleted: false },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });
  return count;
};

const archiveHsnSacs = async (tx: typeof prisma, userId: number) => {
  const count = await tx.hsnSac.count({ where: { isDeleted: false } });
  await tx.hsnSac.updateMany({
    where: { isDeleted: false },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });
  return count;
};

const archiveLocations = async (tx: typeof prisma, userId: number) => {
  const count = await tx.location.count({ where: { isDeleted: false } });
  await tx.location.updateMany({
    where: { isDeleted: false },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });
  return count;
};

const archiveFinanceCategories = async (tx: typeof prisma, userId: number) => {
  const count = await tx.financeCategory.count({ where: { isDeleted: false } });
  await tx.financeCategory.updateMany({
    where: { isDeleted: false },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });
  return count;
};

const archiveRadiologyTests = async (tx: typeof prisma, userId: number) => {
  const tests = await tx.radiologyTest.findMany({
    where: { isDeleted: false },
    select: { id: true },
  });
  const testIds = tests.map((test) => test.id);

  if (testIds.length) {
    await tx.service.updateMany({
      where: {
        radiologyTests: {
          some: {
            testId: { in: testIds },
          },
        },
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  await tx.radiologyTest.updateMany({
    where: { isDeleted: false },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });

  return tests.length;
};

const archiveRadiologyTemplates = async (tx: typeof prisma, userId: number) => {
  const count = await tx.radiologyTemplate.count({
    where: { isDeleted: false },
  });
  await tx.radiologyTemplate.updateMany({
    where: { isDeleted: false },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });
  return count;
};

const archiveServices = async (tx: typeof prisma, userId: number) => {
  const count = await tx.service.count({
    where: { isDeleted: false, consultingDoctorId: null, roomId: null },
  });
  await tx.service.updateMany({
    where: { isDeleted: false, consultingDoctorId: null, roomId: null },
    data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
  });
  return count;
};

const archiveDoctors = async (tx: typeof prisma, userId: number) => {
  const doctors = await tx.doctor.findMany({
    where: { isDeleted: false },
  });
  const doctorIds = doctors.map((doctor) => doctor.id);

  if (doctorIds.length) {
    await tx.service.updateMany({
      where: { consultingDoctorId: { in: doctorIds }, isDeleted: false },
      data: {
        consultingDoctorId: null,
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  for (const doctor of doctors) {
    const suffix = deleteSuffix(doctor.id);
    await tx.doctor.update({
      where: { id: doctor.id },
      data: {
        licenseNumber: doctor.licenseNumber
          ? `${doctor.licenseNumber}_${suffix}`
          : null,
        email: doctor.email ? `${suffix}_${doctor.email}` : null,
        phoneNumber: doctor.phoneNumber
          ? `${doctor.phoneNumber}_${suffix}`
          : null,
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  return doctors.length;
};

const archivePathologyTests = async (tx: typeof prisma, userId: number) => {
  const tests = await tx.pathologyTest.findMany({
    where: { isDeleted: false },
    select: { id: true },
  });
  const testIds = tests.map((test) => test.id);

  if (testIds.length) {
    await tx.service.updateMany({
      where: {
        pathologyTests: {
          some: {
            testId: { in: testIds },
          },
        },
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedBy: userId,
        updatedBy: userId,
      },
    });
  }

  await tx.pathologyTest.updateMany({
    where: { isDeleted: false },
    data: {
      isDeleted: true,
      deletedBy: userId,
      updatedBy: userId,
    },
  });

  return tests.length;
};

const toNullableString = (value: string | null | undefined) =>
  trimOptionalString(value || "");

const mapStatus = (value: string | undefined, defaultValue = Status.active) =>
  parseEnum(value, Object.values(Status), "status", "0", defaultValue);

const importBillingSections = async (
  rows: (BillingSectionImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;
  const doctorConsultationRows = rows.filter((row) =>
    parseBoolean(row.isDoctorConsultationCharges),
  );

  if (doctorConsultationRows.length > 1) {
    throw new Error(
      "Only one billing section can have isDoctorConsultationCharges=true",
    );
  }

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveBillingSections(tx as typeof prisma, userId);
      await tx.billingSection.createMany({
        data: rows.map((row) => ({
          name: row.name,
          systemKey: toNullableString(row.systemKey),
          isOtherCharges: parseBoolean(row.isOtherCharges),
          isDoctorConsultationCharges: parseBoolean(
            row.isDoctorConsultationCharges,
          ),
          description: toNullableString(row.description),
          status: row.status,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    const systemKeys = rows
      .map((row) => toNullableString(row.systemKey))
      .filter((value): value is string => Boolean(value));
    const names = rows.map((row) => row.name);
    const existingItems = await tx.billingSection.findMany({
      where: {
        OR: [{ name: { in: names } }, { systemKey: { in: systemKeys } }],
      },
    });

    const existingBySystemKey = new Map(
      existingItems
        .filter((item) => item.systemKey)
        .map((item) => [item.systemKey as string, item]),
    );
    const existingByName = new Map(
      existingItems.map((item) => [item.name, item]),
    );

    for (const row of rows) {
      const systemKey = toNullableString(row.systemKey);
      const existing = systemKey
        ? existingBySystemKey.get(systemKey)
        : existingByName.get(row.name);

      if (parseBoolean(row.isDoctorConsultationCharges)) {
        await tx.billingSection.updateMany({
          where: {
            isDoctorConsultationCharges: true,
            ...(existing?.id ? { id: { not: existing.id } } : {}),
          },
          data: {
            isDoctorConsultationCharges: false,
            updatedBy: userId,
          },
        });
      }

      if (existing) {
        await tx.billingSection.update({
          where: { id: existing.id },
          data: {
            name: row.name,
            systemKey,
            isOtherCharges: parseBoolean(row.isOtherCharges),
            isDoctorConsultationCharges: parseBoolean(
              row.isDoctorConsultationCharges,
            ),
            description: toNullableString(row.description),
            status: row.status,
            isDeleted: false,
            updatedBy: userId,
          },
        });
        updated += 1;
        continue;
      }

      await tx.billingSection.create({
        data: {
          name: row.name,
          systemKey,
          isOtherCharges: parseBoolean(row.isOtherCharges),
          isDoctorConsultationCharges: parseBoolean(
            row.isDoctorConsultationCharges,
          ),
          description: toNullableString(row.description),
          status: row.status,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importDepartments = async (
  rows: (DepartmentImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveDepartments(tx as typeof prisma, userId);
      await tx.department.createMany({
        data: rows.map((row) => ({
          name: row.name,
          description: toNullableString(row.description),
          status: row.status,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    const names = rows.map((row) => row.name);
    const existingItems = await tx.department.findMany({
      where: { name: { in: names } },
    });
    const existingByName = new Map(
      existingItems.map((item) => [item.name, item]),
    );
    const rowsToCreate: Prisma.DepartmentCreateManyInput[] = [];

    for (const row of rows) {
      const existing = existingByName.get(row.name);
      if (existing) {
        await tx.department.update({
          where: { id: existing.id },
          data: {
            name: row.name,
            description: toNullableString(row.description),
            status: row.status,
            isDeleted: false,
            updatedBy: userId,
          },
        });
        updated += 1;
        continue;
      }

      rowsToCreate.push({
        name: row.name,
        description: toNullableString(row.description),
        status: row.status,
        isDeleted: false,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    if (rowsToCreate.length) {
      await tx.department.createMany({ data: rowsToCreate });
      created = rowsToCreate.length;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importRoomTypes = async (
  rows: (RoomTypeImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveRoomTypes(tx as typeof prisma, userId);
    }

    const departmentNames = [...new Set(rows.map((row) => row.departmentName))];
    const departments = await tx.department.findMany({
      where: { name: { in: departmentNames }, isDeleted: false },
      select: { id: true, name: true },
    });
    const departmentByName = new Map(
      departments.map((department) => [department.name, department]),
    );

    for (const row of rows) {
      if (!departmentByName.has(row.departmentName)) {
        throw new Error(
          `Row ${getRowNumber(row)}: department "${row.departmentName}" not found`,
        );
      }
    }

    if (mode === "replace") {
      await tx.roomType.createMany({
        data: rows.map((row) => ({
          name: row.name,
          departmentId: departmentByName.get(row.departmentName)!.id,
          description: toNullableString(row.description),
          status: row.status,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    const names = rows.map((row) => row.name);
    const existingItems = await tx.roomType.findMany({
      where: { name: { in: names } },
    });
    const existingByName = new Map(
      existingItems.map((item) => [item.name, item]),
    );
    const rowsToCreate: Prisma.RoomTypeCreateManyInput[] = [];

    for (const row of rows) {
      const existing = existingByName.get(row.name);
      const data = {
        name: row.name,
        description: toNullableString(row.description),
        departmentId: departmentByName.get(row.departmentName)!.id,
        status: row.status,
        isDeleted: false,
        updatedBy: userId,
      };

      if (existing) {
        await tx.roomType.update({ where: { id: existing.id }, data });
        updated += 1;
        continue;
      }

      rowsToCreate.push({ ...data, createdBy: userId });
    }

    if (rowsToCreate.length) {
      await tx.roomType.createMany({ data: rowsToCreate });
      created = rowsToCreate.length;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importRooms = async (
  rows: (RoomImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveRooms(tx as typeof prisma, userId);
    }

    for (const row of rows) {
      const roomType = await tx.roomType.findFirst({
        where: { name: row.roomTypeName, isDeleted: false },
      });
      if (!roomType) {
        throw new Error(
          `Row ${getRowNumber(row)}: room type "${row.roomTypeName}" not found`,
        );
      }

      const existing =
        mode === "append"
          ? await tx.room.findFirst({ where: { name: row.name } })
          : null;
      const data = {
        name: row.name,
        roomTypeId: roomType.id,
        price: row.price,
        description: toNullableString(row.description),
        status: row.status,
        isDeleted: false,
        updatedBy: userId,
      };
      const record = existing
        ? await tx.room.update({ where: { id: existing.id }, data })
        : await tx.room.create({ data: { ...data, createdBy: userId } });

      await upsertRoomChargeService(tx, {
        roomId: record.id,
        roomName: record.name,
        roomPrice: record.price,
        actingUserId: userId,
      });

      if (existing) updated += 1;
      else created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importBeds = async (
  rows: (BedImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveBeds(tx as typeof prisma, userId);
    }

    const roomNames = [...new Set(rows.map((row) => row.roomName))];
    const rooms = await tx.room.findMany({
      where: { name: { in: roomNames }, isDeleted: false },
      select: { id: true, name: true },
    });
    const roomByName = new Map(rooms.map((room) => [room.name, room]));

    for (const row of rows) {
      const room = roomByName.get(row.roomName);
      if (!room) {
        throw new Error(
          `Row ${getRowNumber(row)}: room "${row.roomName}" not found`,
        );
      }
    }

    if (mode === "replace") {
      await tx.bed.createMany({
        data: rows.map((row) => ({
          roomId: roomByName.get(row.roomName)!.id,
          bedNumber: row.bedNumber,
          name: toNullableString(row.name),
          status: row.status,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    const existingBeds = await tx.bed.findMany({
      where: { roomId: { in: rooms.map((room) => room.id) } },
      select: { id: true, roomId: true, bedNumber: true },
    });
    const existingByKey = new Map(
      existingBeds.map((bed) => [`${bed.roomId}::${bed.bedNumber}`, bed]),
    );
    const rowsToCreate: Prisma.BedCreateManyInput[] = [];

    for (const row of rows) {
      const roomId = roomByName.get(row.roomName)!.id;
      const existing = existingByKey.get(`${roomId}::${row.bedNumber}`);
      if (existing) {
        await tx.bed.update({
          where: { id: existing.id },
          data: {
            roomId,
            bedNumber: row.bedNumber,
            name: toNullableString(row.name),
            status: row.status,
            isDeleted: false,
            updatedBy: userId,
          },
        });
        updated += 1;
        continue;
      }

      rowsToCreate.push({
        roomId,
        bedNumber: row.bedNumber,
        name: toNullableString(row.name),
        status: row.status,
        isDeleted: false,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    if (rowsToCreate.length) {
      await tx.bed.createMany({ data: rowsToCreate });
      created = rowsToCreate.length;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importDrugs = async (
  rows: (DrugImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveDrugs(tx as typeof prisma, userId);
      await tx.drug.createMany({
        data: rows.map((row) => ({
          name: row.name,
          description: toNullableString(row.description),
          manufacturer: row.manufacturer,
          unit: row.unit,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    const existingItems = await tx.drug.findMany({
      where: {
        OR: rows.map((row) => ({
          name: row.name,
          manufacturer: row.manufacturer,
          unit: row.unit,
        })),
      },
    });
    const existingByKey = new Map(
      existingItems.map((item) => [
        `${item.name}::${item.manufacturer}::${item.unit}`,
        item,
      ]),
    );
    const rowsToCreate: Prisma.DrugCreateManyInput[] = [];

    for (const row of rows) {
      const key = `${row.name}::${row.manufacturer}::${row.unit}`;
      const existing = existingByKey.get(key);
      if (existing) {
        await tx.drug.update({
          where: { id: existing.id },
          data: {
            name: row.name,
            description: toNullableString(row.description),
            manufacturer: row.manufacturer,
            unit: row.unit,
            isDeleted: false,
            updatedBy: userId,
          },
        });
        updated += 1;
        continue;
      }

      rowsToCreate.push({
        name: row.name,
        description: toNullableString(row.description),
        manufacturer: row.manufacturer,
        unit: row.unit,
        isDeleted: false,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    if (rowsToCreate.length) {
      await tx.drug.createMany({ data: rowsToCreate });
      created = rowsToCreate.length;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importSuppliers = async (
  rows: (SupplierImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveSuppliers(tx as typeof prisma, userId);
      await tx.drugSupplier.createMany({
        data: rows.map((row) => ({
          name: row.name,
          gstIn: toNullableString(row.gstIn),
          email: toNullableString(row.email),
          phone: row.phone,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    const existingItems = await tx.drugSupplier.findMany({
      where: {
        OR: rows.map((row) => ({ name: row.name, phone: row.phone })),
      },
    });
    const existingByKey = new Map(
      existingItems.map((item) => [`${item.name}::${item.phone}`, item]),
    );
    const rowsToCreate: Prisma.DrugSupplierCreateManyInput[] = [];

    for (const row of rows) {
      const existing = existingByKey.get(`${row.name}::${row.phone}`);
      if (existing) {
        await tx.drugSupplier.update({
          where: { id: existing.id },
          data: {
            name: row.name,
            gstIn: toNullableString(row.gstIn),
            email: toNullableString(row.email),
            phone: row.phone,
            isDeleted: false,
            updatedBy: userId,
          },
        });
        updated += 1;
        continue;
      }

      rowsToCreate.push({
        name: row.name,
        gstIn: toNullableString(row.gstIn),
        email: toNullableString(row.email),
        phone: row.phone,
        isDeleted: false,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    if (rowsToCreate.length) {
      await tx.drugSupplier.createMany({ data: rowsToCreate });
      created = rowsToCreate.length;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importServices = async (
  rows: (ServiceImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveServices(tx as typeof prisma, userId);
    }

    for (const row of rows) {
      const connectedLabTests = splitList(row.connectedLabTests);
      const connectedRadiologyTests = splitList(row.connectedRadiologyTests);

      const pathologyTests = connectedLabTests.length
        ? await tx.pathologyTest.findMany({
            where: { name: { in: connectedLabTests }, isDeleted: false },
            select: { id: true, name: true },
          })
        : [];

      if (pathologyTests.length !== connectedLabTests.length) {
        throw new Error(
          `Row ${getRowNumber(row)}: one or more connectedLabTests were not found`,
        );
      }

      const radiologyTests = connectedRadiologyTests.length
        ? await tx.radiologyTest.findMany({
            where: { name: { in: connectedRadiologyTests }, isDeleted: false },
            select: { id: true, name: true },
          })
        : [];

      if (radiologyTests.length !== connectedRadiologyTests.length) {
        throw new Error(
          `Row ${getRowNumber(row)}: one or more connectedRadiologyTests were not found`,
        );
      }

      const billingSection = await tx.billingSection.findFirst({
        where: { name: row.billingSection, isDeleted: false },
        select: { id: true },
      });

      if (!billingSection) {
        throw new Error(
          `Row ${getRowNumber(row)}: billing section '${row.billingSection}' not found`,
        );
      }

      const existing =
        mode === "append"
          ? await tx.service.findFirst({
              where: {
                name: row.name,
                consultingDoctorId: null,
                roomId: null,
              },
            })
          : null;

      const baseData = {
        name: row.name,
        description: row.description,
        billingSectionId: billingSection.id,
        isInvoiceOnly: parseBoolean(row.isInvoiceOnly),
        isEditableRate: parseBoolean(row.isEditableRate),
        type: row.type,
        price: row.price,
        discountAvailable: parseBoolean(row.discountAvailable),
        maxDiscount: row.maxDiscount,
        applicableOn: row.applicableOn,
        status: row.status,
        isDeleted: false,
        updatedBy: userId,
      };

      const updateData = {
        ...baseData,
        pathologyTests: {
          deleteMany: {},
          create: pathologyTests.map((test) => ({ testId: test.id })),
        },
        radiologyTests: {
          deleteMany: {},
          create: radiologyTests.map((test) => ({ testId: test.id })),
        },
      };

      const createData = {
        ...baseData,
        createdBy: userId,
        pathologyTests: {
          create: pathologyTests.map((test) => ({ testId: test.id })),
        },
        radiologyTests: {
          create: radiologyTests.map((test) => ({ testId: test.id })),
        },
      };

      const record = existing
        ? await tx.service.update({
            where: { id: existing.id },
            data: updateData,
          })
        : await tx.service.create({ data: createData });
      if (existing) updated += 1;
      else created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importPathologyTests = async (
  rows: (PathologyTestImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  if (mode === "replace") {
    deleted = await prisma.$transaction(
      async (tx) => archivePathologyTests(tx as typeof prisma, userId),
      IMPORT_TRANSACTION_OPTIONS,
    );
  }

  for (const row of rows) {
    const existing = await prisma.$transaction(async (tx) => {
      const headers = parseJsonArray(
        row.headers,
        pathologyTestHeaderValidator,
        "headers",
        getRowNumber(row),
      );
      const parameters = parseJsonArray(
        row.parameters,
        pathologyTestParameterValidator,
        "parameters",
        getRowNumber(row),
      );

      const existingRecord =
        mode === "append"
          ? await tx.pathologyTest.findFirst({
              where: { name: row.name },
              include: {
                services: {
                  select: { serviceId: true },
                },
              },
            })
          : null;

      const test = existingRecord
        ? await tx.pathologyTest.update({
            where: { id: existingRecord.id },
            data: {
              name: row.name,
              alias: row.alias,
              price: row.price,
              status: row.status,
              section: row.section,
              container: row.container,
              sampleType: row.sampleType,
              footerNotes: toNullableString(row.footerNotes || undefined),
              isDeleted: false,
              updatedBy: userId,
            },
          })
        : await tx.pathologyTest.create({
            data: {
              name: row.name,
              alias: row.alias,
              price: row.price,
              status: row.status,
              section: row.section,
              container: row.container,
              sampleType: row.sampleType,
              footerNotes: toNullableString(row.footerNotes || undefined),
              isDeleted: false,
              createdBy: userId,
              updatedBy: userId,
            },
          });

      await tx.pathologyTestHeader.deleteMany({
        where: { testId: test.id },
      });
      await tx.pathologyTestParameter.deleteMany({
        where: { testId: test.id },
      });

      for (const header of headers || []) {
        const createdHeader = await tx.pathologyTestHeader.create({
          data: {
            testId: test.id,
            name: header.name,
            note: trimOptionalString(header.note || ""),
            displayOrder: header.displayOrder,
            createdBy: userId,
            updatedBy: userId,
          },
        });

        for (const parameter of header.parameters || []) {
          const createdParameter = await tx.pathologyTestParameter.create({
            data: {
              testId: test.id,
              headerId: createdHeader.id,
              name: parameter.name,
              displayOrder: parameter.displayOrder,
              isDescriptiveOnly: parameter.isDescriptiveOnly,
              createdBy: userId,
              updatedBy: userId,
            },
          });

          if (parameter.referenceRanges?.length) {
            await tx.referenceRange.createMany({
              data: parameter.referenceRanges.map((range) => ({
                testParameterId: createdParameter.id,
                applicableGender: range.applicableGender,
                lowerAgeDay: range.lowerAgeDay,
                upperAgeDay: range.upperAgeDay,
                lowerAgeMonth: range.lowerAgeMonth,
                upperAgeMonth: range.upperAgeMonth,
                lowerAgeYear: range.lowerAgeYear,
                upperAgeYear: range.upperAgeYear,
                lowerAgeInDays: toDays(
                  range.lowerAgeDay,
                  range.lowerAgeMonth,
                  range.lowerAgeYear,
                ),
                upperAgeInDays: toDays(
                  range.upperAgeDay,
                  range.upperAgeMonth,
                  range.upperAgeYear,
                ),
                lowerRange: range.lowerRange,
                upperRange: range.upperRange,
                unit: trimOptionalString(range.unit || ""),
                createdBy: userId,
                updatedBy: userId,
              })),
            });
          }

          if (parameter.parameterOptions?.length) {
            await tx.parameterOptions.createMany({
              data: parameter.parameterOptions.map((option) => ({
                testParameterId: createdParameter.id,
                value: option.value,
              })),
            });
          }
        }
      }

      for (const parameter of parameters || []) {
        if (parameter) {
          const createdParameter = await tx.pathologyTestParameter.create({
            data: {
              testId: test.id,
              name: parameter.name,
              displayOrder: parameter.displayOrder,
              isDescriptiveOnly: parameter.isDescriptiveOnly,
              createdBy: userId,
              updatedBy: userId,
            },
          });

          if (parameter.referenceRanges?.length) {
            await tx.referenceRange.createMany({
              data: parameter.referenceRanges.map((range) => ({
                testParameterId: createdParameter.id,
                applicableGender: range.applicableGender,
                lowerAgeDay: range.lowerAgeDay,
                upperAgeDay: range.upperAgeDay,
                lowerAgeMonth: range.lowerAgeMonth,
                upperAgeMonth: range.upperAgeMonth,
                lowerAgeYear: range.lowerAgeYear,
                upperAgeYear: range.upperAgeYear,
                lowerAgeInDays: toDays(
                  range.lowerAgeDay,
                  range.lowerAgeMonth,
                  range.lowerAgeYear,
                ),
                upperAgeInDays: toDays(
                  range.upperAgeDay,
                  range.upperAgeMonth,
                  range.upperAgeYear,
                ),
                lowerRange: range.lowerRange,
                upperRange: range.upperRange,
                unit: trimOptionalString(range.unit || ""),
                createdBy: userId,
                updatedBy: userId,
              })),
            });
          }

          if (parameter?.parameterOptions?.length) {
            await tx.parameterOptions.createMany({
              data: parameter.parameterOptions.map((option) => ({
                testParameterId: createdParameter.id,
                value: option.value,
              })),
            });
          }
        }
      }

      const billingSection = await tx.billingSection.findFirst({
        where: { name: row.billingSection, isDeleted: false },
        select: { id: true },
      });

      if (!billingSection) {
        throw new Error(
          `Row ${getRowNumber(row)}: billing section '${row.billingSection}' not found`,
        );
      }

      const serviceData = {
        name: row.name,
        description: row.alias,
        type: ServiceType.LAB_TEST,
        price: row.price,
        billingSectionId: billingSection.id,
        applicableOn: ServiceApplicableOn.BOTH,
        status: row.status,
        isDeleted: false,
        updatedBy: userId,
      };

      if (existingRecord?.services[0]?.serviceId) {
        await tx.service.update({
          where: { id: existingRecord.services[0].serviceId },
          data: serviceData,
        });
      } else {
        await tx.service.create({
          data: {
            ...serviceData,

            createdBy: userId,
            pathologyTests: {
              create: {
                testId: test.id,
              },
            },
          },
        });
      }

      return existingRecord;
    }, IMPORT_TRANSACTION_OPTIONS);

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  return { created, updated, deleted };
};

const importDoctors = async (
  rows: (DoctorImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveDoctors(tx as typeof prisma, userId);
    }

    for (const row of rows) {
      const phoneNumber = toNullableString(row.phoneNumber);
      const email = toNullableString(row.email);
      const licenseNumber = toNullableString(row.licenseNumber);

      const duplicateChecks: Prisma.DoctorWhereInput[] = [];
      if (licenseNumber) duplicateChecks.push({ licenseNumber });
      if (phoneNumber) duplicateChecks.push({ phoneNumber });
      if (email) duplicateChecks.push({ email });

      const existingDoctor =
        mode === "append" && duplicateChecks.length > 0
          ? await tx.doctor.findFirst({
              where: { OR: duplicateChecks, isDeleted: false },
            })
          : null;

      const firstName = row.firstName;
      const lastName = toNullableString(row.lastName);
      const doctorType = row.doctorType;

      const doctorData = {
        title: row.title || null,
        firstName,
        middleName: toNullableString(row.middleName),
        lastName,
        gender: row.gender || null,
        userType: toNullableString(row.userType) || "Doctor",
        licenseNumber,
        specialization: toNullableString(row.specialization),
        qualifications: toNullableString(row.qualifications),
        department: toNullableString(row.department),
        yearsExperience: row.yearsExperience
          ? Number(row.yearsExperience)
          : null,
        designation: toNullableString(row.designation),
        doctorType,
        consultationCharges: row.consultationCharges
          ? Number(row.consultationCharges)
          : null,
        email,
        phoneNumber,
        emergencyContact: toNullableString(row.emergencyContact),
        consultationStartingTime: toNullableString(
          row.consultationStartingTime,
        ),
        consultationEndingTime: toNullableString(row.consultationEndingTime),
        status: row.status ?? Status.active,
        updatedBy: userId,
      };

      let doctorRecordId = existingDoctor?.id;

      if (existingDoctor) {
        await tx.doctor.update({
          where: { id: existingDoctor.id },
          data: doctorData,
        });
        updated += 1;
      } else {
        const createdDoctor = await tx.doctor.create({
          data: { ...doctorData, createdBy: userId },
        });
        doctorRecordId = createdDoctor.id;
        created += 1;
      }

      if (!doctorRecordId) {
        throw new Error(`Row ${getRowNumber(row)}: unable to create doctor`);
      }

      await tx.doctorAvailableDay.deleteMany({
        where: { doctorId: doctorRecordId },
      });
      const availableDays = splitList(row.availableDays).map((day) =>
        parseEnum(day, Object.values(Days), "availableDays", getRowNumber(row)),
      );
      if (availableDays.length) {
        await tx.doctorAvailableDay.createMany({
          data: availableDays.map((day) => ({
            doctorId: doctorRecordId as number,
            day,
          })),
          skipDuplicates: true,
        });
      }

      const doctorName = [row.title, firstName, lastName]
        .filter(Boolean)
        .join(" ");

      if (doctorType === DoctorType.consulting) {
        await upsertConsultingDoctorService(tx, {
          doctorId: doctorRecordId,
          doctorName,
          consultationCharges: Number(doctorData.consultationCharges || 0),
          actingUserId: userId,
        });
      } else {
        await tx.service.updateMany({
          where: { consultingDoctorId: doctorRecordId, isDeleted: false },
          data: { isDeleted: true, deletedBy: userId, updatedBy: userId },
        });
      }
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importDrugBillingCategories = async (
  rows: (DrugBillingCategoryImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveDrugBillingCategories(tx as typeof prisma, userId);
      await tx.drugBillingCategory.createMany({
        data: rows.map((row) => ({
          name: row.name.trim(),
          description: toNullableString(row.description),
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    const existingItems = await tx.drugBillingCategory.findMany({
      where: { isDeleted: false },
    });
    const existingByName = new Map(
      existingItems.map((item) => [item.name.trim().toLowerCase(), item]),
    );

    for (const row of rows) {
      const normalizedName = row.name.trim().toLowerCase();
      const existing = existingByName.get(normalizedName);

      if (existing) {
        await tx.drugBillingCategory.update({
          where: { id: existing.id },
          data: {
            name: row.name.trim(),
            description: toNullableString(row.description),
            isDeleted: false,
            updatedBy: userId,
          },
        });
        updated += 1;
        continue;
      }

      await tx.drugBillingCategory.create({
        data: {
          name: row.name.trim(),
          description: toNullableString(row.description),
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importHsnSacs = async (
  rows: (HsnSacImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  const updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveHsnSacs(tx as typeof prisma, userId);
      await tx.hsnSac.createMany({
        data: rows.map((row) => ({
          code: row.code,
          cGstPercentage: row.cGstPercentage,
          sGstPercentage: row.sGstPercentage,
          iGstPercentage: row.iGstPercentage,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    for (const row of rows) {
      await tx.hsnSac.create({
        data: {
          code: row.code,
          cGstPercentage: row.cGstPercentage,
          sGstPercentage: row.sGstPercentage,
          iGstPercentage: row.iGstPercentage,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importLocations = async (
  rows: (LocationImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;
  const getLocationKey = (location: LocationImportRow) =>
    [
      location.city.trim().toLowerCase(),
      location.state.trim().toLowerCase(),
      location.country.trim().toLowerCase(),
      location.postcode.trim().toLowerCase(),
      location.postName.trim().toLowerCase(),
    ].join("::");
  const uniqueRows = Array.from(
    new Map(rows.map((row) => [getLocationKey(row), row])).values(),
  );

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveLocations(tx as typeof prisma, userId);
      await tx.location.createMany({
        data: uniqueRows.map((row) => ({
          city: row.city.trim(),
          state: row.state.trim(),
          country: row.country.trim(),
          postcode: row.postcode.trim(),
          postName: row.postName.trim(),
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
        skipDuplicates: true,
      });
      created = uniqueRows.length;
      return;
    }

    const existingItems = await tx.location.findMany({
      where: { isDeleted: false },
    });
    const existingByKey = new Map(
      existingItems.map((item) => [
        [
          item.city.trim().toLowerCase(),
          item.state.trim().toLowerCase(),
          item.country.trim().toLowerCase(),
          item.postcode.trim().toLowerCase(),
          item.postName.trim().toLowerCase(),
        ].join("::"),
        item,
      ]),
    );

    for (const row of uniqueRows) {
      const key = getLocationKey(row);
      const existing = existingByKey.get(key);

      if (existing) {
        await tx.location.update({
          where: { id: existing.id },
          data: {
            city: row.city.trim(),
            state: row.state.trim(),
            country: row.country.trim(),
            postcode: row.postcode.trim(),
            postName: row.postName.trim(),
            isDeleted: false,
            updatedBy: userId,
          },
        });
        updated += 1;
        continue;
      }

      await tx.location.create({
        data: {
          city: row.city.trim(),
          state: row.state.trim(),
          country: row.country.trim(),
          postcode: row.postcode.trim(),
          postName: row.postName.trim(),
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importFinanceCategories = async (
  rows: (FinanceCategoryImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveFinanceCategories(tx as typeof prisma, userId);
      await tx.financeCategory.createMany({
        data: rows.map((row) => ({
          name: row.name.trim(),
          type: row.type,
          description: toNullableString(row.description),
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      });
      created = rows.length;
      return;
    }

    const existingItems = await tx.financeCategory.findMany({
      where: { isDeleted: false },
    });
    const existingByKey = new Map(
      existingItems.map((item) => [
        `${item.type}::${item.name.trim().toLowerCase()}`,
        item,
      ]),
    );

    for (const row of rows) {
      const key = `${row.type}::${row.name.trim().toLowerCase()}`;
      const existing = existingByKey.get(key);

      if (existing) {
        await tx.financeCategory.update({
          where: { id: existing.id },
          data: {
            name: row.name.trim(),
            type: row.type,
            description: toNullableString(row.description),
            isDeleted: false,
            updatedBy: userId,
          },
        });
        updated += 1;
        continue;
      }

      await tx.financeCategory.create({
        data: {
          name: row.name.trim(),
          type: row.type,
          description: toNullableString(row.description),
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importRadiologyTests = async (
  rows: (RadiologyTestImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveRadiologyTests(tx as typeof prisma, userId);
    }

    for (const row of rows) {
      const existing =
        mode === "append"
          ? await tx.radiologyTest.findFirst({
              where: { name: row.name.trim(), isDeleted: false },
              include: {
                radiologyTestServices: {
                  select: { serviceId: true },
                  take: 1,
                },
              },
            })
          : null;

      const testData = {
        name: row.name.trim(),
        alias: row.alias.trim(),
        section: row.section,
        status: row.status ?? Status.active,
        price: row.price,
        isDeleted: false,
        updatedBy: userId,
      };

      const test = existing
        ? await tx.radiologyTest.update({
            where: { id: existing.id },
            data: testData,
          })
        : await tx.radiologyTest.create({
            data: {
              ...testData,
              createdBy: userId,
            },
          });

      const billingSection = await tx.billingSection.findFirst({
        where: { name: row.billingSection, isDeleted: false },
        select: { id: true },
      });

      if (!billingSection) {
        throw new Error(
          `Row ${getRowNumber(row)}: billing section '${row.billingSection}' not found`,
        );
      }

      const linkedServiceId = existing?.radiologyTestServices[0]?.serviceId;
      const serviceData = {
        name: row.name.trim(),
        type: ServiceType.RADIOLOGY_TEST,
        price: row.price,
        billingSectionId: billingSection.id,
        applicableOn: ServiceApplicableOn.BOTH,
        status: row.status ?? Status.active,
        isDeleted: false,
        updatedBy: userId,
      };

      if (linkedServiceId) {
        await tx.service.update({
          where: { id: linkedServiceId },
          data: serviceData,
        });
      } else {
        await tx.service.create({
          data: {
            ...serviceData,
            createdBy: userId,
            radiologyTests: {
              create: {
                testId: test.id,
              },
            },
          },
        });
      }

      if (existing) updated += 1;
      else created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importRadiologyTemplates = async (
  rows: (RadiologyTemplateImportRow & ImportRowMeta)[],
  mode: MasterImportMode,
  userId: number,
) => {
  let created = 0;
  let updated = 0;
  let deleted = 0;

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      deleted = await archiveRadiologyTemplates(tx as typeof prisma, userId);
    }

    for (const row of rows) {
      const linkedTestNames = splitList(row.radiologyTests);
      const linkedTests = linkedTestNames.length
        ? await tx.radiologyTest.findMany({
            where: {
              name: { in: linkedTestNames },
              isDeleted: false,
            },
            select: { id: true, name: true },
          })
        : [];

      if (linkedTests.length !== linkedTestNames.length) {
        throw new Error(
          `Row ${getRowNumber(row)}: one or more radiologyTests were not found`,
        );
      }

      const existing =
        mode === "append"
          ? await tx.radiologyTemplate.findFirst({
              where: { name: row.name.trim(), isDeleted: false },
            })
          : null;

      const templateData = {
        name: row.name.trim(),
        section: row.section,
        status: row.status ?? Status.active,
        content: row.content,
        isDeleted: false,
        updatedBy: userId,
      };

      if (existing) {
        await tx.radiologyTemplate.update({
          where: { id: existing.id },
          data: {
            ...templateData,
            radiologyTests: {
              set: linkedTests.map((test) => ({ id: test.id })),
            },
          },
        });
        updated += 1;
        continue;
      }

      await tx.radiologyTemplate.create({
        data: {
          ...templateData,
          createdBy: userId,
          radiologyTests: {
            connect: linkedTests.map((test) => ({ id: test.id })),
          },
        },
      });
      created += 1;
    }
  }, IMPORT_TRANSACTION_OPTIONS);

  return { created, updated, deleted };
};

const importByMaster = async (
  master: MasterImportKey,
  rows: ImportRowMeta[],
  mode: MasterImportMode,
  userId: number,
) => {
  switch (master) {
    case "billing-section":
      return importBillingSections(
        rows as (BillingSectionImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "doctor":
      return importDoctors(
        rows as (DoctorImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "drug":
      return importDrugs(
        rows as (DrugImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "drug-category":
      return importDrugBillingCategories(
        rows as (DrugBillingCategoryImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "supplier":
      return importSuppliers(
        rows as (SupplierImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "department":
      return importDepartments(
        rows as (DepartmentImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "finance-category":
      return importFinanceCategories(
        rows as (FinanceCategoryImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "hsn-sac":
      return importHsnSacs(
        rows as (HsnSacImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "location":
      return importLocations(
        rows as (LocationImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "room-type":
      return importRoomTypes(
        rows as (RoomTypeImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "room":
      return importRooms(
        rows as (RoomImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "bed":
      return importBeds(rows as (BedImportRow & ImportRowMeta)[], mode, userId);
    case "service":
      return importServices(
        rows as (ServiceImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "pathology-test":
      return importPathologyTests(
        rows as (PathologyTestImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "radiology-test":
      return importRadiologyTests(
        rows as (RadiologyTestImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    case "radiology-template":
      return importRadiologyTemplates(
        rows as (RadiologyTemplateImportRow & ImportRowMeta)[],
        mode,
        userId,
      );
    default:
      throw new Error("Unsupported master import");
  }
};

export { importByMaster };
