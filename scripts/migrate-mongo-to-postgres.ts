/**
 * Mongo -> PostgreSQL migration entrypoint.
 * Why this file exists: keep migration workflow explicit and scriptable.
 */
import { prisma } from "../src/lib/server/db/client";

async function run(): Promise<void> {
  // Defensive guard to avoid accidental production writes.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Do not run data migration script in production directly.");
  }

  console.log("Migration placeholder started.");
  console.log("1) Connect to MongoDB and read Node documents.");
  console.log("2) Transform documents to Prisma Node/Media shape.");
  console.log("3) Upsert into PostgreSQL with transaction batches.");
  console.log("4) Validate row counts and media references.");
  console.log("No-op migration complete.");
}

run()
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
