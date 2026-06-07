import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// global cache to prevent multiple instances during development
const globalForPrisma = globalThis as any;

// create adapter using DATABASE_URL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// initialize Prisma client with adapter and query logging
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  });

// cache the client during development to avoid multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
