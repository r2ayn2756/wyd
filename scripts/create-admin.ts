import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@example.com";
  const password = process.argv[3] || "admin123";
  const fullName = process.argv[4] || "Admin User";
  const linkedinUrl = process.argv[5] || "";

  console.log(`Creating admin user: ${email}`);

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("❌ User with this email already exists!");
    process.exit(1);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash,
      fullName,
      linkedinUrl: linkedinUrl || null,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log(`
  Login Credentials:
  ------------------
  Email:    ${user.email}
  Password: ${password}
  Name:     ${user.fullName}
  Role:     ${user.role}
  `);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
