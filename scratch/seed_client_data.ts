import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Categories and Plans from client data...");

  // 1. Seed Categories
  const categories = [
    { name: "BUDGET ROOM", price: 1000 },
    { name: "DELUXE ROOM", price: 1200 },
    { name: "SUPER DELUXE ROOM", price: 1350 },
    { name: "DELUXE ROOM ( AC)", price: 1400 },
    { name: "SUPER DELUXE (AC)_", price: 1650 },
    { name: "LUXURY", price: 1950 },
  ];

  for (const cat of categories) {
    const existingCat = await prisma.category.findFirst({
      where: { name: cat.name },
    });
    if (!existingCat) {
      await prisma.category.create({
        data: {
          name: cat.name,
          price: cat.price,
          status: true,
          features: ["Free WiFi", "24*7 Room Service"],
        },
      });
      console.log(`Created Category: ${cat.name}`);
    } else {
      await prisma.category.update({
        where: { id: existingCat.id },
        data: { price: cat.price },
      });
      console.log(`Updated Category: ${cat.name}`);
    }
  }

  // 2. Seed Plans
  const plans = [
    { name: "CP PLAN", price: 200, duration: 1 },
    { name: "MAP PLAN", price: 550, duration: 1 },
    { name: "AP PLAN", price: 700, duration: 1 },
  ];

  for (const plan of plans) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: plan.name },
    });
    if (!existingPlan) {
      await prisma.plan.create({
        data: {
          name: plan.name,
          price: plan.price,
          duration: plan.duration,
          features: ["Meals Included"],
        },
      });
      console.log(`Created Plan: ${plan.name}`);
    } else {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: { price: plan.price },
      });
      console.log(`Updated Plan: ${plan.name}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
