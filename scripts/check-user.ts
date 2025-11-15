import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for users in database...\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });

  if (users.length === 0) {
    console.log("❌ No users found in database!");
    console.log("\nThe admin user SQL likely didn't run successfully.");
    console.log("Please run the create-admin-user.sql in Supabase SQL Editor.");
  } else {
    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.fullName} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt}\n`);
    });
  }
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
