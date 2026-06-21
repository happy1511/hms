import {
  ActionType,
  FinanceCategoryType,
  Location,
  ModuleType,
  NameTitle,
  PrismaClient,
} from "@/generated/prisma/client";
import {
  SYSTEM_BILLING_SECTION_KEYS,
  SYSTEM_BILLING_SECTION_NAMES,
} from "@/lib/systemBillingConstants";
import { MODULE_ACTION_MATRIX } from "@/lib/permissionMatrix";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import data from "./india-locations.json";
import "dotenv/config";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

/* ---------------------------------- */
/* Actions & Modules                  */
/* ---------------------------------- */

const addActionsAndModules = async () => {
  console.log("---- Seeding Actions -----");

  const actions = Object.values(ActionType);

  for (const action of actions) {
    await prisma.action.upsert({
      where: { name: action },
      update: {},
      create: { name: action },
    });
  }

  console.log("---- Seeding Modules -----");

  const modules = Object.values(ModuleType);

  for (const m of modules) {
    await prisma.module.upsert({
      where: { name: m },
      update: {},
      create: { name: m },
    });
  }
  console.log("---- Seeding Modules Completed -----");
};

/* ---------------------------------- */
/* Permissions (Module × Action)       */
/* ---------------------------------- */

const createPermissions = async () => {
  console.log("---- Creating Permissions -----");

  const modules = await prisma.module.findMany();
  const actions = await prisma.action.findMany();
  const moduleIdByName = new Map(modules.map((item) => [item.name, item.id]));
  const actionIdByName = new Map(actions.map((item) => [item.name, item.id]));
  const allowedPairs = new Set<string>();

  for (const [moduleName, allowedActions] of Object.entries(
    MODULE_ACTION_MATRIX,
  ) as [ModuleType, ActionType[]][]) {
    const moduleId = moduleIdByName.get(moduleName);

    if (!moduleId) {
      continue;
    }

    for (const actionName of allowedActions) {
      const actionId = actionIdByName.get(actionName);

      if (!actionId) {
        continue;
      }

      allowedPairs.add(`${moduleId}:${actionId}`);

      await prisma.permission.upsert({
        where: {
          moduleId_actionId: {
            moduleId,
            actionId,
          },
        },
        update: {},
        create: {
          moduleId,
          actionId,
        },
      });
    }
  }

  const existingPermissions = await prisma.permission.findMany({
    select: {
      id: true,
      moduleId: true,
      actionId: true,
    },
  });

  const stalePermissionIds = existingPermissions
    .filter(
      (permission) =>
        !allowedPairs.has(`${permission.moduleId}:${permission.actionId}`),
    )
    .map((permission) => permission.id);

  if (stalePermissionIds.length) {
    await prisma.permission.deleteMany({
      where: {
        id: {
          in: stalePermissionIds,
        },
      },
    });
  }
};

/* ---------------------------------- */
/* Admin User                         */
/* ---------------------------------- */

const createAdminUser = async () => {
  console.log("---- Creating Admin User -----");

  return prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      title: NameTitle["MR"],
      loginId: "admin",
      contactNumber: "admin",
      password: "admin123",
      name: "Admin User",
    },
  });
};

/* ---------------------------------- */
/* Assign All Permissions to Admin     */
/* ---------------------------------- */

const assignAdminPermissions = async (adminId: number) => {
  console.log("---- Assigning Admin Permissions -----");

  const permissions = await prisma.permission.findMany();

  for (const permission of permissions) {
    await prisma.userPermission.upsert({
      where: {
        permissionId_userId: {
          permissionId: permission.id,
          userId: adminId,
        },
      },
      update: {},
      create: {
        userId: adminId,
        permissionId: permission.id,
      },
    });
  }
};

/* ---------------------------------- */
/* Locations                  */
/* ---------------------------------- */

const locations = async () => {
  console.log("🌱 Seeding locations...");

  const chunkSize = 1000;
  const locationsByKey = new Map<string, Omit<Location, 'id'>>();

  for (const item of data as Omit<Location, 'id'>[]) {
    if (!item.postName.trim()) {
      continue;
    }

    const key = [
      item.city.trim().toLowerCase(),
      item.state.trim().toLowerCase(),
      item.country.trim().toLowerCase(),
      item.postcode.trim().toLowerCase(),
      item.postName.trim().toLowerCase(),
    ].join("::");

    locationsByKey.set(key, {
      ...item,
      city: item.city.trim(),
      state: item.state.trim(),
      country: item.country.trim(),
      postcode: item.postcode.trim(),
      postName: item.postName.trim(),
    });
  }

  const uniqueLocations = Array.from(locationsByKey.values());

  for (let i = 0; i < uniqueLocations.length; i += chunkSize) {
    const chunk = uniqueLocations.slice(i, i + chunkSize);

    await prisma.location.createMany({
      data: chunk,
      skipDuplicates: true,
    });

    console.log(`Inserted ${i + chunk.length}/${uniqueLocations.length}`);
  }

  const { count } = await prisma.location.deleteMany({
    where: {
      postName: "",
    },
  });

  console.log(`Removed ${count} locations with empty postName`);
  console.log("✅ Seeding complete");
};

const seedSystemBillingSections = async () => {
  console.log("---- Seeding System Billing Sections -----");

  await prisma.billingSection.upsert({
    where: {
      systemKey: SYSTEM_BILLING_SECTION_KEYS.CONSULTATION_CHARGES,
    },
    update: {
      name: SYSTEM_BILLING_SECTION_NAMES.CONSULTATION_CHARGES,
      description: "Consultation Charges system section",
      status: "active",
      isDeleted: false,
      isDoctorConsultationCharges: true,
    },
    create: {
      name: SYSTEM_BILLING_SECTION_NAMES.CONSULTATION_CHARGES,
      systemKey: SYSTEM_BILLING_SECTION_KEYS.CONSULTATION_CHARGES,
      description: "Consultation Charges system section",
      status: "active",
      isDoctorConsultationCharges: true,
    },
  });

  await prisma.billingSection.upsert({
    where: {
      systemKey: SYSTEM_BILLING_SECTION_KEYS.ROOM_CHARGES,
    },
    update: {
      name: SYSTEM_BILLING_SECTION_NAMES.ROOM_CHARGES,
      description: "Room Charges system section",
      status: "active",
      isDeleted: false,
      isDoctorConsultationCharges: false,
    },
    create: {
      name: SYSTEM_BILLING_SECTION_NAMES.ROOM_CHARGES,
      systemKey: SYSTEM_BILLING_SECTION_KEYS.ROOM_CHARGES,
      description: "Room Charges system section",
      status: "active",
      isDoctorConsultationCharges: false,
    },
  });
};

const seedFinanceCategories = async () => {
  console.log("---- Seeding Finance Categories -----");

  const defaults: Array<{
    name: string;
    type: FinanceCategoryType;
  }> = [
    { name: "OUT pr dressing", type: FinanceCategoryType.INCOME },
    { name: "OUT PT ECG", type: FinanceCategoryType.INCOME },
    { name: "Account deposit", type: FinanceCategoryType.EXPENSE },
    { name: "Salary payment", type: FinanceCategoryType.EXPENSE },
    { name: "Other expenses", type: FinanceCategoryType.EXPENSE },
  ];

  for (const item of defaults) {
    const existing = await prisma.financeCategory.findFirst({
      where: {
        name: item.name,
        type: item.type,
      },
    });

    if (!existing) {
      await prisma.financeCategory.create({
        data: item,
      });
    }
  }
};

/* ---------------------------------- */
/* Main                               */
/* ---------------------------------- */

async function main() {
  await addActionsAndModules();
  await createPermissions();

  const admin = await createAdminUser();
  await assignAdminPermissions(admin.id);
  await locations();
  await seedSystemBillingSections();
  await seedFinanceCategories();
  console.log("---- Seeding Completed Successfully -----");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
