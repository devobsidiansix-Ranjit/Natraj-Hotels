import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      isAdmin: true,
    },
  });

  if (admins.length === 0) {
    console.log("No administrators found in the database.");
  } else {
    console.log("Found administrators:");
    admins.forEach((admin) => {
      console.log(`- Name: ${admin.name}, Email: ${admin.email}`);
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
