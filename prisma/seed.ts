import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { APP_CONSTANTS } from "../src/constants/APP_CONSTANTS.js";
import { ROLES } from "../src/constants/ROLES.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "v4vikram.dev@gmail.com";
const ADMIN_NAME = "Vikram";
const ADMIN_PASSWORD = "123456";

const main = async () => {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: ROLES.ADMIN },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: ROLES.ADMIN,
    },
  });

  console.log(`Seeded admin: ${admin.email} (role: ${admin.role})`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
