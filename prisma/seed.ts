import {
  ActionType,
  ModuleType,
  PrismaClient,
} from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
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
};

/* ---------------------------------- */
/* Permissions (Module × Action)       */
/* ---------------------------------- */

const createPermissions = async () => {
  console.log("---- Creating Permissions -----");

  const modules = await prisma.module.findMany();
  const actions = await prisma.action.findMany();

  for (const m of modules) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: {
          moduleId_actionId: {
            moduleId: m.id,
            actionId: action.id,
          },
        },
        update: {},
        create: {
          moduleId: m.id,
          actionId: action.id,
        },
      });
    }
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
      loginId: "admin",
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
/* Main                               */
/* ---------------------------------- */

async function main() {
  await addActionsAndModules();
  await createPermissions();

  const admin = await createAdminUser();
  await assignAdminPermissions(admin.id);

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
