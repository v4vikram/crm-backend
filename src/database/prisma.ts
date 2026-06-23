import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env, isProd } from "../config/env.js";
import { logger } from "../config/logger.js";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log: isProd ? ["error", "warn"] : ["error", "warn"],
  });

if (!isProd) {
  global.__prisma = prisma;
}

export const connectDB = async (): Promise<void> => {
  await prisma.$connect();
  logger.info("Database connected");
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info("Database disconnected");
};
