import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.llbggoeejddnycasjvfd:%28%29w%217Lv3%2Bh%28%29@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
