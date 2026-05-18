import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "testadmin@natraj.com";
  const password = "admin123";
  const hashedPassword = await hash(password, 8);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isAdmin: true,
      },
    });
    console.log(`Updated existing user ${email} to be admin with password: ${password}`);
  } else {
    await prisma.user.create({
      data: {
        name: "Test Admin",
        email,
        phone: "1234567890",
        password: hashedPassword,
        isAdmin: true,
      },
    });
    console.log(`Created new admin user ${email} with password: ${password}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
