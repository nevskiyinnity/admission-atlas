import { PrismaClient } from '@prisma/client';

// Use a separate test database (PostgreSQL)
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/admission_atlas_test';

export const testPrisma = new PrismaClient({
  datasources: { db: { url: TEST_DATABASE_URL } },
});

/**
 * Truncate all application tables in the correct order (respecting foreign keys).
 * Uses TRUNCATE ... CASCADE for PostgreSQL to handle FK constraints automatically.
 */
export async function setupTestDb() {
  const tablenames = await testPrisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE '_prisma%'
  `;

  if (tablenames.length > 0) {
    const tables = tablenames.map(({ tablename }) => `"public"."${tablename}"`).join(', ');
    await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE`);
  }
}

export async function teardownTestDb() {
  await testPrisma.$disconnect();
}
