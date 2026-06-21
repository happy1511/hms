import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
  connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 10),
});

const prisma = new PrismaClient({
  adapter,
  transactionOptions: {
    maxWait: 40_000,
    timeout: 70_000,
  },
});

export { prisma };
